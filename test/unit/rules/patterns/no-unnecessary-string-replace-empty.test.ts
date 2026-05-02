import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringReplaceEmpty } from '../../../../src/rules/patterns/no-unnecessary-string-replace-empty.js'
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

function makeStrLit(value: string): unknown {
  return { type: 'StringLiteral', value }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-string-replace-empty rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringReplaceEmpty.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringReplaceEmpty.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringReplaceEmpty.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringReplaceEmpty.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringReplaceEmpty.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning replace', () => {
      const desc = noUnnecessaryStringReplaceEmpty.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/replace/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringReplaceEmpty.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-replace-empty.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringReplaceEmpty.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringReplaceEmpty).toBeDefined()
      expect(noUnnecessaryStringReplaceEmpty.meta).toBeDefined()
      expect(noUnnecessaryStringReplaceEmpty.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (30) =====

  describe('positive cases — reports unnecessary replace with empty string', () => {
    test('reports for str.replace("a", "")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replace', [makeStrLit('a'), makeStrLit('')]))
      expect(reports.length).toBe(1)
    })

    test('reports for str.replaceAll("a", "")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [makeStrLit('a'), makeStrLit('')]))
      expect(reports.length).toBe(1)
    })

    test('reports for str.replace("hello", "")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replace', [makeStrLit('hello'), makeStrLit('')]))
      expect(reports.length).toBe(1)
    })

    test('reports for str.replaceAll("hello", "")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [makeStrLit('hello'), makeStrLit('')]))
      expect(reports.length).toBe(1)
    })

    test('reports for str.replace("", "") — both args empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replace', [makeStrLit(''), makeStrLit('')]))
      expect(reports.length).toBe(1)
    })

    test('reports for str.replaceAll("", "") — both args empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [makeStrLit(''), makeStrLit('')]))
      expect(reports.length).toBe(1)
    })

    test('reports for str.replace(" ", "") — space char', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replace', [makeStrLit(' '), makeStrLit('')]))
      expect(reports.length).toBe(1)
    })

    test('reports for str.replace("\\n", "") — newline char', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replace', [makeStrLit('\n'), makeStrLit('')]))
      expect(reports.length).toBe(1)
    })

    test('reports for str.replace("\\t", "") — tab char', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replace', [makeStrLit('\t'), makeStrLit('')]))
      expect(reports.length).toBe(1)
    })

    test('reports for str.replace("abc123", "") — alphanumeric', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replace', [makeStrLit('abc123'), makeStrLit('')]))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.prop.replace("x", "") — MemberExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }, 'replace', [makeStrLit('x'), makeStrLit('')]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr[0].replace("x", "") — computed MemberExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'arr' }, property: { type: 'Literal', value: 0 }, computed: true }, 'replace', [makeStrLit('x'), makeStrLit('')]))
      expect(reports.length).toBe(1)
    })

    test('reports for getStr().replace("x", "") — CallExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getStr' }, arguments: [] }, 'replace', [makeStrLit('x'), makeStrLit('')]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions replacing with empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replace', [makeStrLit('a'), makeStrLit('')]))
      expect(reports[0].message).toMatch(/empty string/i)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replace', [makeStrLit('a'), makeStrLit('')]))
      expect(reports[0].message).toBe(
        `Replacing a string with an empty string removes it. Consider using remove() or a more explicit approach.`,
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replace', [makeStrLit('a'), makeStrLit('')]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replace', [makeStrLit('a'), makeStrLit('')]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'replace', [makeStrLit('a'), makeStrLit('')])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replace', [makeStrLit('a'), makeStrLit('')], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replace', [makeStrLit('a'), makeStrLit('')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [makeStrLit('b'), makeStrLit('')]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replace', [makeStrLit('a'), makeStrLit('')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [makeStrLit('b'), makeStrLit('')]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for str.replaceAll("x", "") with special chars in first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [makeStrLit('$$'), makeStrLit('')]))
      expect(reports.length).toBe(1)
    })

    test('reports for str.replace("a-b", "") with dash in first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replace', [makeStrLit('a-b'), makeStrLit('')]))
      expect(reports.length).toBe(1)
    })

    test('reports for str.replace(" ", "") repeated with same args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replace', [makeStrLit(' '), makeStrLit('')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replace', [makeStrLit(' '), makeStrLit('')]))
      expect(reports.length).toBe(2)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replace', [makeStrLit('a'), makeStrLit('')]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for str.replaceAll with multi-char string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [makeStrLit('the quick brown fox'), makeStrLit('')]))
      expect(reports.length).toBe(1)
    })

    test('reports for str.replace with emoji in first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replace', [makeStrLit('😀'), makeStrLit('')]))
      expect(reports.length).toBe(1)
    })

    test('reports for nested member expression obj.nested.prop.replace("x", "")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      const nestedObj = { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'nested' } }
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: nestedObj, property: { type: 'Identifier', name: 'prop' } }, 'replace', [makeStrLit('x'), makeStrLit('')]))
      expect(reports.length).toBe(1)
    })

    test('reports for chained call fn().replace("x", "")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }, 'replaceAll', [makeStrLit('x'), makeStrLit('')]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (38) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for str.replace("a", "b") — non-empty replacement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replace', [makeStrLit('a'), makeStrLit('b')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.replaceAll("a", "b") — non-empty replacement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [makeStrLit('a'), makeStrLit('b')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.replace(x, "") — first arg is Identifier, not StringLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replace', [{ type: 'Identifier', name: 'x' }, makeStrLit('')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.replaceAll(x, "") — first arg is Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [{ type: 'Identifier', name: 'x' }, makeStrLit('')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.replace() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replace', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.replaceAll() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.replace("a") — only 1 argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replace', [makeStrLit('a')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.replaceAll("a") — only 1 argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [makeStrLit('a')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.replace("a", " ", "g") — 3 arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replace', [makeStrLit('a'), makeStrLit(''), makeStrLit('g')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.search("a") — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'search', [makeStrLit('a'), makeStrLit('')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.match("a") — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'match', [makeStrLit('a'), makeStrLit('')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.includes("a") — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [makeStrLit('a'), makeStrLit('')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.indexOf("a") — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'indexOf', [makeStrLit('a'), makeStrLit('')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.trim("a") — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'trim', [makeStrLit('a'), makeStrLit('')]))
      expect(reports.length).toBe(0)
    })

    test('does not report when 2nd arg is Identifier (not StringLiteral)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replace', [makeStrLit('a'), { type: 'Identifier', name: 'replacement' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when 2nd arg is NumericLiteral (not StringLiteral)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replace', [makeStrLit('a'), { type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when 2nd arg is BooleanLiteral (not StringLiteral)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replace', [makeStrLit('a'), { type: 'BooleanLiteral', value: false }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeStrLit('a'), makeStrLit('')], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeStrLit('a'), makeStrLit('')], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [makeStrLit('a'), makeStrLit('')], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'replace' },
        },
        arguments: [makeStrLit('a'), makeStrLit('')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "replace" but computed', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'replace' },
          computed: true,
        },
        arguments: [makeStrLit('a'), makeStrLit('')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
        },
        arguments: [makeStrLit('a'), makeStrLit('')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: null,
        },
        arguments: [makeStrLit('a'), makeStrLit('')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "replacee" (close but wrong)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replacee', [makeStrLit('a'), makeStrLit('')]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Replace" (capitalized)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'Replace', [makeStrLit('a'), makeStrLit('')]))
      expect(reports.length).toBe(0)
    })

    test('does not report when 2nd arg is StringLiteral with non-empty value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replace', [makeStrLit('a'), makeStrLit('replacement')]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (17) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringReplaceEmpty.create(ctx1)
      const visitor2 = noUnnecessaryStringReplaceEmpty.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replace', [makeStrLit('a'), makeStrLit('')]))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replace', [makeStrLit('a'), makeStrLit('b')]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replace', [makeStrLit('a'), makeStrLit('')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replace', [makeStrLit('a'), makeStrLit('b')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [makeStrLit('x'), makeStrLit('')]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'replace' },
        },
        arguments: [makeStrLit('a'), makeStrLit('')],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'replace' },
        },
        arguments: [makeStrLit('a'), makeStrLit('')],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replace', [makeStrLit('a'), makeStrLit('b')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replace', [makeStrLit('a'), makeStrLit('')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replace', [{ type: 'Identifier', name: 'x' }, makeStrLit('')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [makeStrLit('x'), makeStrLit('')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replace', [makeStrLit('a'), makeStrLit('')]))
      expect(reports.length).toBe(3)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringReplaceEmpty.create(context)
      const visitor2 = noUnnecessaryStringReplaceEmpty.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringReplaceEmpty.meta
      const meta2 = noUnnecessaryStringReplaceEmpty.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'replace' },
        },
        arguments: [makeStrLit('a'), makeStrLit('')],
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
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'replace' },
        },
        arguments: [makeStrLit('a'), makeStrLit('')],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'replace' },
        },
        arguments: [makeStrLit('a'), makeStrLit('')],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'replace', [makeStrLit('a'), makeStrLit('')])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringReplaceEmpty).toBeDefined()
      expect(typeof noUnnecessaryStringReplaceEmpty.create).toBe('function')
      expect(typeof noUnnecessaryStringReplaceEmpty.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'replace' },
        },
        arguments: [makeStrLit('a'), makeStrLit('')],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replace', [makeStrLit('a'), makeStrLit('')], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles computed member expression property as false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'replace' },
          computed: false,
        },
        arguments: [makeStrLit('a'), makeStrLit('')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'replace' },
          computed: true,
        },
        arguments: [makeStrLit('a'), makeStrLit('')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replace', [makeStrLit('a'), makeStrLit('')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [makeStrLit('b'), makeStrLit('')]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})
