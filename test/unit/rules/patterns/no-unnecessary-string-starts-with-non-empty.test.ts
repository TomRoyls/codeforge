import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringStartsWithNonEmpty } from '../../../../src/rules/patterns/no-unnecessary-string-starts-with-non-empty.js'
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
  return { type: 'StringLiteral', value }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-string-starts-with-non-empty rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringStartsWithNonEmpty.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringStartsWithNonEmpty.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringStartsWithNonEmpty.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringStartsWithNonEmpty.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringStartsWithNonEmpty.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning startsWith', () => {
      const desc = noUnnecessaryStringStartsWithNonEmpty.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/startswith/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringStartsWithNonEmpty.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-starts-with-non-empty.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringStartsWithNonEmpty.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringStartsWithNonEmpty).toBeDefined()
      expect(noUnnecessaryStringStartsWithNonEmpty.meta).toBeDefined()
      expect(noUnnecessaryStringStartsWithNonEmpty.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (27) =====

  describe('positive cases — reports unnecessary startsWith("")', () => {
    test('reports for str.startsWith("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'startsWith', [makeStringLiteral('')]))
      expect(reports.length).toBe(1)
    })

    test('reports for "hello".startsWith("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'StringLiteral', value: 'hello' }, 'startsWith', [makeStringLiteral('')]))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.prop.startsWith("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }, 'startsWith', [makeStringLiteral('')]))
      expect(reports.length).toBe(1)
    })

    test('reports for fn().startsWith("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }, 'startsWith', [makeStringLiteral('')]))
      expect(reports.length).toBe(1)
    })

    test('reports for template literal object startsWith("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'TemplateLiteral', quasis: [], expressions: [] }, 'startsWith', [makeStringLiteral('')]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions startsWith', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'startsWith', [makeStringLiteral('')]))
      expect(reports[0].message).toMatch(/startsWith/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'startsWith', [makeStringLiteral('')]))
      expect(reports[0].message).toBe(
        `String.prototype.startsWith('') always returns true. Remove the call.`,
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'startsWith', [makeStringLiteral('')]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'startsWith', [makeStringLiteral('')]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'startsWith', [makeStringLiteral('')])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'startsWith', [makeStringLiteral('')], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'startsWith', [makeStringLiteral('')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'startsWith', [makeStringLiteral('')]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'startsWith', [makeStringLiteral('')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'startsWith', [makeStringLiteral('')]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'startsWith', [makeStringLiteral('')]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for chained call obj.prop.method().startsWith("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'CallExpression', callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'method' } }, arguments: [] },
        'startsWith',
        [makeStringLiteral('')],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for this.startsWith("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ThisExpression' }, 'startsWith', [makeStringLiteral('')]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr[0].startsWith("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'MemberExpression', object: { type: 'Identifier', name: 'arr' }, property: { type: 'Literal', value: 0 }, computed: true },
        'startsWith',
        [makeStringLiteral('')],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for (a + b).startsWith("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } },
        'startsWith',
        [makeStringLiteral('')],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for empty StringLiteral argument regardless of object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'startsWith', [makeStringLiteral('')]))
      visitor.CallExpression(makeCallNode({ type: 'StringLiteral', value: 'test' }, 'startsWith', [makeStringLiteral('')]))
      expect(reports.length).toBe(2)
    })

    test('reports for node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'startsWith' },
        },
        arguments: [makeStringLiteral('')],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for node without loc with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'startsWith' },
        },
        arguments: [makeStringLiteral('')],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('reports for node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'startsWith' },
        },
        arguments: [makeStringLiteral('')],
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'startsWith' },
        },
        arguments: [makeStringLiteral('')],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('reports for node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'startsWith' },
        },
        arguments: [makeStringLiteral('')],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('reports for node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'startsWith' },
        },
        arguments: [makeStringLiteral('')],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'startsWith', [makeStringLiteral('')], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (43) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for str.startsWith("a") — non-empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'startsWith', [makeStringLiteral('a')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.startsWith("hello") — multi-char string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'startsWith', [makeStringLiteral('hello')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.startsWith(x) — variable argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'startsWith', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.startsWith() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'startsWith', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.startsWith("", 5) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'startsWith', [makeStringLiteral(''), { type: 'NumericLiteral', value: 5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.endsWith("") — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'endsWith', [makeStringLiteral('')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.includes("") — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [makeStringLiteral('')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.indexOf("") — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'indexOf', [makeStringLiteral('')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.match("") — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'match', [makeStringLiteral('')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.replace("", "x") — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replace', [makeStringLiteral(''), makeStringLiteral('x')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.slice("", 0) — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [makeStringLiteral(''), { type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.substring("", 0) — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'substring', [makeStringLiteral(''), { type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeStringLiteral('')], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeStringLiteral('')], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [makeStringLiteral('')], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'startsWith' },
        },
        arguments: [makeStringLiteral('')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is computed', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'startsWith' },
          computed: true,
        },
        arguments: [makeStringLiteral('')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'startsWith' },
        },
        arguments: [makeStringLiteral('')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('reports when object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'startsWith' },
        },
        arguments: [makeStringLiteral('')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for numeric literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'startsWith', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'startsWith', [{ type: 'BooleanLiteral', value: true }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'startsWith', [{ type: 'NullLiteral' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'startsWith', [{ type: 'Identifier', name: 'prefix' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for template literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'startsWith', [{ type: 'TemplateLiteral', quasis: [], expressions: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for regex literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'startsWith', [{ type: 'RegExpLiteral', pattern: 'test', flags: '' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'startsWith', [makeStringLiteral(''), { type: 'NumericLiteral', value: 0 }, { type: 'NumericLiteral', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'startsWith' },
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'startsWith' },
        },
        arguments: null,
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'startsWith', [null]))
      expect(reports.length).toBe(0)
    })

    test('does not report for property name "StartsWith" (different case)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'StartsWith', [makeStringLiteral('')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for property name "startswith" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'startswith', [makeStringLiteral('')]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
        },
        arguments: [makeStringLiteral('')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: null,
        },
        arguments: [makeStringLiteral('')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringStartsWithNonEmpty.create(ctx1)
      const visitor2 = noUnnecessaryStringStartsWithNonEmpty.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'startsWith', [makeStringLiteral('')]))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'startsWith', [makeStringLiteral('a')]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'startsWith', [makeStringLiteral('')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'startsWith', [makeStringLiteral('a')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'startsWith', [makeStringLiteral('')]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringStartsWithNonEmpty.create(context)
      const visitor2 = noUnnecessaryStringStartsWithNonEmpty.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringStartsWithNonEmpty.meta
      const meta2 = noUnnecessaryStringStartsWithNonEmpty.meta
      expect(meta1).toBe(meta2)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringStartsWithNonEmpty).toBeDefined()
      expect(typeof noUnnecessaryStringStartsWithNonEmpty.create).toBe('function')
      expect(typeof noUnnecessaryStringStartsWithNonEmpty.meta).toBe('object')
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'startsWith', [makeStringLiteral('')])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'startsWith', [makeStringLiteral('')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'startsWith', [makeStringLiteral('')]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'startsWith', [makeStringLiteral('a')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'startsWith', [makeStringLiteral('')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'endsWith', [makeStringLiteral('')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'startsWith', [makeStringLiteral('')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'startsWith', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(2)
    })

    test('handles node with large line numbers in loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'startsWith', [makeStringLiteral('')], 999, 50, 999, 75))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(999)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('handles node with zero column in loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'startsWith', [makeStringLiteral('')], 1, 0, 1, 20))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('does not report when argument is StringLiteral with space " " value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'startsWith', [makeStringLiteral(' ')]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is StringLiteral with newline value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'startsWith', [makeStringLiteral('\n')]))
      expect(reports.length).toBe(0)
    })

    test('non-computed member expression with false computed property reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'startsWith' },
          computed: false,
        },
        arguments: [makeStringLiteral('')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('computed member expression does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithNonEmpty.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'startsWith' },
          computed: true,
        },
        arguments: [makeStringLiteral('')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })
})
