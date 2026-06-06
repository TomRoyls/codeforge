import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringIteratorEmptyRule } from '../../../../src/rules/patterns/no-unnecessary-string-iterator-empty.js'
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
    getSource: () => "''.iterator()",
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

describe('no-unnecessary-string-iterator-empty rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringIteratorEmptyRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringIteratorEmptyRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringIteratorEmptyRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringIteratorEmptyRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringIteratorEmptyRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning iterator', () => {
      const desc = noUnnecessaryStringIteratorEmptyRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/iterator/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringIteratorEmptyRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-iterator-empty.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringIteratorEmptyRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringIteratorEmptyRule).toBeDefined()
      expect(noUnnecessaryStringIteratorEmptyRule.meta).toBeDefined()
      expect(noUnnecessaryStringIteratorEmptyRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (28) =====

  describe('positive cases — reports empty string iterator', () => {
    test('reports for empty string \'\'.iterator()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral(''), 'iterator'))
      expect(reports.length).toBe(1)
    })

    test('report message mentions iterator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral(''), 'iterator'))
      expect(reports[0].message).toMatch(/iterator/)
    })

    test('report message mentions empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral(''), 'iterator'))
      expect(reports[0].message).toMatch(/empty string/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral(''), 'iterator'))
      expect(reports[0].message).toBe(
        `''.iterator() on empty string produces no values. This is unnecessary.`,
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral(''), 'iterator'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral(''), 'iterator'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      const node = makeCallNode(makeStringLiteral(''), 'iterator')
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral(''), 'iterator', [], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral(''), 'iterator'))
      visitor.CallExpression(makeCallNode(makeStringLiteral(''), 'iterator'))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral(''), 'iterator'))
      visitor.CallExpression(makeCallNode(makeStringLiteral(''), 'iterator'))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral(''), 'iterator'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for empty string with explicit empty arguments array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral(''), 'iterator', []))
      expect(reports.length).toBe(1)
    })

    test('reports for empty string on different line numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral(''), 'iterator', [], 42, 0, 42, 16))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(42)
    })

    test('reports for empty string on column offset', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral(''), 'iterator', [], 1, 15, 1, 31))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(15)
    })

    test('reports with correct end location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral(''), 'iterator', [], 3, 5, 3, 21))
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(21)
    })

    test('report message mentions unnecessary', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral(''), 'iterator'))
      expect(reports[0].message).toMatch(/unnecessary/)
    })

    test('reports for empty string with multiline loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral(''), 'iterator', [], 2, 4, 3, 1))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[0].loc?.end.line).toBe(3)
    })

    test('reports three violations correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral(''), 'iterator'))
      visitor.CallExpression(makeCallNode(makeStringLiteral(''), 'iterator'))
      visitor.CallExpression(makeCallNode(makeStringLiteral(''), 'iterator'))
      expect(reports.length).toBe(3)
    })

    test('reports after valid node followed by invalid', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'iterator'))
      visitor.CallExpression(makeCallNode(makeStringLiteral(''), 'iterator'))
      expect(reports.length).toBe(1)
    })

    test('reports for StringLiteral with empty value and computed false callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeStringLiteral(''),
          property: { type: 'Identifier', name: 'iterator' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 16),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for empty string at end of file location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral(''), 'iterator', [], 100, 0, 100, 16))
      expect(reports.length).toBe(1)
    })

    test('reports for empty string with zero line and column', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral(''), 'iterator', [], 0, 0, 0, 16))
      expect(reports.length).toBe(1)
    })

    test('reports even when node has extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeStringLiteral(''),
          property: { type: 'Identifier', name: 'iterator' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 16),
        range: [0, 16],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for empty string with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeStringLiteral(''),
          property: { type: 'Identifier', name: 'iterator' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 16),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('reports for empty string with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeStringLiteral(''),
          property: { type: 'Identifier', name: 'iterator' },
        },
        arguments: [],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('reports for empty string with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeStringLiteral(''),
          property: { type: 'Identifier', name: 'iterator' },
        },
        arguments: [],
        loc: { start: { line: 7, column: 3 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('reports for empty string without loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeStringLiteral(''),
          property: { type: 'Identifier', name: 'iterator' },
        },
        arguments: [],
      })
      expect(reports.length).toBe(1)
    })

    test('report loc defaults correctly when no loc on node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeStringLiteral(''),
          property: { type: 'Identifier', name: 'iterator' },
        },
        arguments: [],
      })
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('reports for empty string with specific line location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral(''), 'iterator', [], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for non-empty string "hello".iterator()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'iterator'))
      expect(reports.length).toBe(0)
    })

    test('does not report for single-char string "a".iterator()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('a'), 'iterator'))
      expect(reports.length).toBe(0)
    })

    test('does not report for whitespace string " ".iterator()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral(' '), 'iterator'))
      expect(reports.length).toBe(0)
    })

    test('does not report for newline string "\\n".iterator()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('\n'), 'iterator'))
      expect(reports.length).toBe(0)
    })

    test('does not report for tab string "\\t".iterator()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('\t'), 'iterator'))
      expect(reports.length).toBe(0)
    })

    test('does not report for variable.iterator() — Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'iterator'))
      expect(reports.length).toBe(0)
    })

    test('does not report for empty string with wrong method valueOf', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral(''), 'valueOf'))
      expect(reports.length).toBe(0)
    })

    test('does not report for empty string with wrong method toString', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral(''), 'toString'))
      expect(reports.length).toBe(0)
    })

    test('does not report for empty string with wrong method trim', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral(''), 'trim'))
      expect(reports.length).toBe(0)
    })

    test('does not report for empty string with wrong method charAt', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral(''), 'charAt'))
      expect(reports.length).toBe(0)
    })

    test('does not report for empty string with wrong method indexOf', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral(''), 'indexOf'))
      expect(reports.length).toBe(0)
    })

    test('does not report for empty string with wrong method slice', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral(''), 'slice'))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeStringLiteral(''),
          property: { type: 'Literal', value: 'iterator' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "iterators" (plural)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral(''), 'iterators'))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "ITERATOR" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral(''), 'ITERATOR'))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments are present', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral(''), 'iterator', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when two arguments are present', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral(''), 'iterator', [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('reports when object is a Literal type (not StringLiteral)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: '' }, 'iterator'))
      expect(reports.length).toBe(1)
    })

    test('does not report when object is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getStr' }, arguments: [] }, 'iterator'))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'str' } }, 'iterator'))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'iterator' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'iterator' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeStringLiteral(''),
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeStringLiteral(''),
          property: null,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is computed', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeStringLiteral(''),
          property: { type: 'Identifier', name: 'iterator' },
          computed: true,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for long string "hello world".iterator()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello world'), 'iterator'))
      expect(reports.length).toBe(0)
    })

    test('does not report for emoji string "🎉".iterator()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('🎉'), 'iterator'))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringIteratorEmptyRule.create(ctx1)
      const visitor2 = noUnnecessaryStringIteratorEmptyRule.create(ctx2)
      visitor1.CallExpression(makeCallNode(makeStringLiteral(''), 'iterator'))
      visitor2.CallExpression(makeCallNode(makeStringLiteral('hello'), 'iterator'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral(''), 'iterator'))
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'iterator'))
      visitor.CallExpression(makeCallNode(makeStringLiteral(''), 'iterator'))
      expect(reports.length).toBe(2)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'iterator'))
      visitor.CallExpression(makeCallNode(makeStringLiteral(''), 'iterator'))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'iterator'))
      visitor.CallExpression(makeCallNode(makeStringLiteral(''), 'iterator'))
      visitor.CallExpression(makeCallNode(makeStringLiteral('world'), 'iterator'))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringIteratorEmptyRule.create(context)
      const visitor2 = noUnnecessaryStringIteratorEmptyRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringIteratorEmptyRule.meta
      const meta2 = noUnnecessaryStringIteratorEmptyRule.meta
      expect(meta1).toBe(meta2)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      const node = makeCallNode(makeStringLiteral(''), 'iterator')
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringIteratorEmptyRule).toBeDefined()
      expect(typeof noUnnecessaryStringIteratorEmptyRule.create).toBe('function')
      expect(typeof noUnnecessaryStringIteratorEmptyRule.meta).toBe('object')
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral(''), 'iterator'))
      visitor.CallExpression(makeCallNode(makeStringLiteral(''), 'iterator'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('does not report for TemplateLiteral object type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'TemplateLiteral', quasis: [], expressions: [] }, 'iterator'))
      expect(reports.length).toBe(0)
    })

    test('does not report for ObjectExpression object type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ObjectExpression', properties: [] }, 'iterator'))
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression object type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }, 'iterator'))
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrayExpression object type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: [] }, 'iterator'))
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for empty string with method "Symbol.iterator"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral(''), 'Symbol.iterator'))
      expect(reports.length).toBe(0)
    })

    test('does not report for empty string with method "iterate"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIteratorEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral(''), 'iterate'))
      expect(reports.length).toBe(0)
    })
  })
})
