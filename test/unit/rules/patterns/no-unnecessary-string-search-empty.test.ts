import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringSearchEmptyRule } from '../../../../src/rules/patterns/no-unnecessary-string-search-empty.js'
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

// ===== META TESTS (8) =====

describe('no-unnecessary-string-search-empty rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringSearchEmptyRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringSearchEmptyRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringSearchEmptyRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringSearchEmptyRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringSearchEmptyRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning search', () => {
      const desc = noUnnecessaryStringSearchEmptyRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/search/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringSearchEmptyRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-search-empty.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringSearchEmptyRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringSearchEmptyRule).toBeDefined()
      expect(noUnnecessaryStringSearchEmptyRule.meta).toBeDefined()
      expect(noUnnecessaryStringSearchEmptyRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (30) =====

  describe('positive cases — reports unnecessary search("")', () => {
    test('reports for str.search("") — Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'search', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for "hello".search("") — StringLiteral object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'StringLiteral', value: 'hello' }, 'search', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for template literal object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'TemplateLiteral', quasis: [], expressions: [] }, 'search', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for member expression object obj.prop.search("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }, 'search', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for call expression object fn().search("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }, 'search', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions search', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'search', [{ type: 'StringLiteral', value: '' }]))
      expect(reports[0].message).toMatch(/search/)
    })

    test('report message mentions always returns 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'search', [{ type: 'StringLiteral', value: '' }]))
      expect(reports[0].message).toMatch(/always returns 0/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'search', [{ type: 'StringLiteral', value: '' }]))
      expect(reports[0].message).toBe(
        `str.search('') always returns 0. Use str.indexOf('') or check length instead.`,
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'search', [{ type: 'StringLiteral', value: '' }]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'search', [{ type: 'StringLiteral', value: '' }]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'search', [{ type: 'StringLiteral', value: '' }])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'search', [{ type: 'StringLiteral', value: '' }], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'search', [{ type: 'StringLiteral', value: '' }]))
      visitor.CallExpression(makeCallNode({ type: 'StringLiteral', value: 'hello' }, 'search', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'search', [{ type: 'StringLiteral', value: '' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'search', [{ type: 'StringLiteral', value: '' }]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'search', [{ type: 'StringLiteral', value: '' }]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for empty string variable named s.search("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'search', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for concatenated string result.search("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } }, 'search', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for long string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'StringLiteral', value: 'a very long string with many characters' }, 'search', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for empty string literal object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'StringLiteral', value: '' }, 'search', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for this.search("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ThisExpression' }, 'search', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports even with extra properties on the node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'search' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports with empty loc object on node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'search' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('reports with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'search' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('reports with node without loc at all', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'search' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports with _parent property on node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'search' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'search', [{ type: 'StringLiteral', value: '' }], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports for computed=false member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'search' },
          computed: false,
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('reports when StringLiteral value is exactly empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'search', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("search('') always returns 0")
    })

    test('reports for chained method result.search("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'CallExpression', callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'str' }, property: { type: 'Identifier', name: 'trim' } }, arguments: [] },
        'search',
        [{ type: 'StringLiteral', value: '' }],
      ))
      expect(reports.length).toBe(1)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'search', [{ type: 'StringLiteral', value: '' }])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (38) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for str.search("pattern") — non-empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'search', [{ type: 'StringLiteral', value: 'pattern' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.search(/regex/) — RegExp literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'search', [{ type: 'RegExpLiteral', value: /test/ }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.search(x) — variable argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'search', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.search() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'search'))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.indexOf("") — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'indexOf', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.match("") — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'match', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.includes("") — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.replace("", "x") — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replace', [{ type: 'StringLiteral', value: '' }, { type: 'StringLiteral', value: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.test("") — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'test', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.exec("") — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'exec', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.search("", "extra") — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'search', [{ type: 'StringLiteral', value: '' }, { type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.search("a", "b") — two arguments non-empty', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'search', [{ type: 'StringLiteral', value: 'a' }, { type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.search("search") — non-empty string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'search', [{ type: 'StringLiteral', value: 'search' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.search(" ") — whitespace string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'search', [{ type: 'StringLiteral', value: ' ' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.search("\\n") — newline string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'search', [{ type: 'StringLiteral', value: '\n' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [{ type: 'StringLiteral', value: '' }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [{ type: 'StringLiteral', value: '' }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'search' }, arguments: [{ type: 'StringLiteral', value: '' }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'search' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: null,
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Search" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'Search', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "SEARCH" (all caps)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'SEARCH', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee computed is true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'search' },
          computed: true,
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is Literal type (not StringLiteral)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'search', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'search', [null]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array is empty', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'search', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.startsWith("") — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'startsWith', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (17) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringSearchEmptyRule.create(ctx1)
      const visitor2 = noUnnecessaryStringSearchEmptyRule.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'search', [{ type: 'StringLiteral', value: '' }]))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'search', [{ type: 'StringLiteral', value: 'abc' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'search', [{ type: 'StringLiteral', value: '' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'search', [{ type: 'StringLiteral', value: 'x' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'c' }, 'search', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(2)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'search', [{ type: 'StringLiteral', value: '' }])) // report
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'search', [{ type: 'StringLiteral', value: 'abc' }])) // no
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'indexOf', [{ type: 'StringLiteral', value: '' }])) // no
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'search', [{ type: 'StringLiteral', value: '' }])) // report
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'search', [{ type: 'Identifier', name: 'x' }])) // no
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringSearchEmptyRule.create(context)
      const visitor2 = noUnnecessaryStringSearchEmptyRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringSearchEmptyRule.meta
      const meta2 = noUnnecessaryStringSearchEmptyRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'search' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
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
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'search' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'search' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'search', [{ type: 'StringLiteral', value: '' }])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringSearchEmptyRule).toBeDefined()
      expect(typeof noUnnecessaryStringSearchEmptyRule.create).toBe('function')
      expect(typeof noUnnecessaryStringSearchEmptyRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'search' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'search', [{ type: 'StringLiteral', value: '' }], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles computed member expression property (computed=false)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'search' },
          computed: false,
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'search' },
          computed: true,
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'search', [{ type: 'StringLiteral', value: '' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'search', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'search' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSearchEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'search' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })
})
