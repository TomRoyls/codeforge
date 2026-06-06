import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringAtEmptyRule } from '../../../../src/rules/patterns/index.js'
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

function makeAtCallNodeEmptyString(object: unknown, locStartLine = 1, locStartCol = 0, locEndLine = 1, locEndCol = 20): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      computed: false,
      object,
      property: { type: 'Identifier', name: 'at' },
    },
    arguments: [{ type: 'Literal', value: '' }],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-string-at-empty rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringAtEmptyRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringAtEmptyRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringAtEmptyRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringAtEmptyRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringAtEmptyRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning at', () => {
      const desc = noUnnecessaryStringAtEmptyRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/\.at/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringAtEmptyRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-at-empty.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringAtEmptyRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringAtEmptyRule).toBeDefined()
      expect(noUnnecessaryStringAtEmptyRule.meta).toBeDefined()
      expect(noUnnecessaryStringAtEmptyRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (30) =====

  describe('positive cases — reports str.at("")', () => {
    test('reports for str.at("") with Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression(makeAtCallNodeEmptyString({ type: 'Identifier', name: 'str' }))
      expect(reports.length).toBe(1)
    })

    test('reports for text.at("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression(makeAtCallNodeEmptyString({ type: 'Identifier', name: 'text' }))
      expect(reports.length).toBe(1)
    })

    test('reports for s.at("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression(makeAtCallNodeEmptyString({ type: 'Identifier', name: 's' }))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.prop.at("") with MemberExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression(makeAtCallNodeEmptyString({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }))
      expect(reports.length).toBe(1)
    })

    test('reports for arr[0].at("") with computed MemberExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression(makeAtCallNodeEmptyString({ type: 'MemberExpression', computed: true, object: { type: 'Identifier', name: 'arr' }, property: { type: 'Literal', value: 0 } }))
      expect(reports.length).toBe(1)
    })

    test('reports for getStr().at("") with CallExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression(makeAtCallNodeEmptyString({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getStr' }, arguments: [] }))
      expect(reports.length).toBe(1)
    })

    test('report message mentions empty string and at()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression(makeAtCallNodeEmptyString({ type: 'Identifier', name: 'str' }))
      expect(reports[0].message).toMatch(/at/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression(makeAtCallNodeEmptyString({ type: 'Identifier', name: 'str' }))
      expect(reports[0].message).toBe(
        "str.at('') with an empty string is unusual. at() expects a numeric index.",
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression(makeAtCallNodeEmptyString({ type: 'Identifier', name: 'str' }))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression(makeAtCallNodeEmptyString({ type: 'Identifier', name: 'str' }))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      const node = makeAtCallNodeEmptyString({ type: 'Identifier', name: 'str' })
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression(makeAtCallNodeEmptyString({ type: 'Identifier', name: 'str' }, 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression(makeAtCallNodeEmptyString({ type: 'Identifier', name: 'a' }))
      visitor.CallExpression(makeAtCallNodeEmptyString({ type: 'Identifier', name: 'b' }))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression(makeAtCallNodeEmptyString({ type: 'Identifier', name: 'a' }))
      visitor.CallExpression(makeAtCallNodeEmptyString({ type: 'Identifier', name: 'b' }))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression(makeAtCallNodeEmptyString({ type: 'Identifier', name: 'str' }))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for this.at("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression(makeAtCallNodeEmptyString({ type: 'ThisExpression' }))
      expect(reports.length).toBe(1)
    })

    test('reports for (a || b).at("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression(makeAtCallNodeEmptyString({ type: 'LogicalExpression', operator: '||', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } }))
      expect(reports.length).toBe(1)
    })

    test('reports for template.at("") with template literal object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression(makeAtCallNodeEmptyString({ type: 'TemplateLiteral', quasis: [], expressions: [] }))
      expect(reports.length).toBe(1)
    })

    test('reports for result.at("") with result as ConditionalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression(makeAtCallNodeEmptyString({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Identifier', name: 'a' }, alternate: { type: 'Identifier', name: 'b' } }))
      expect(reports.length).toBe(1)
    })

    test('reports for chained.at("").at("") nested call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression(makeAtCallNodeEmptyString(
        makeAtCallNodeEmptyString({ type: 'Identifier', name: 'chained' }),
      ))
      expect(reports.length).toBe(1)
    })

    test('report loc end values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression(makeAtCallNodeEmptyString({ type: 'Identifier', name: 'str' }, 3, 5, 3, 18))
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(18)
    })

    test('reports for obj?.at("") — optional chain represented as object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression(makeAtCallNodeEmptyString({ type: 'Identifier', name: 'obj' }))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("str.at('') with an empty string is unusual")
    })

    test('reports for window.name.at("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression(makeAtCallNodeEmptyString({
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'window' },
        property: { type: 'Identifier', name: 'name' },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports when argument value is empty string with type StringLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'at' },
        },
        arguments: [{ type: 'Literal', value: '' }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports when node has extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'at' },
        },
        arguments: [{ type: 'Literal', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'at' },
        },
        arguments: [{ type: 'Literal', value: '' }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'at' },
        },
        arguments: [{ type: 'Literal', value: '' }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('reports with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'at' },
        },
        arguments: [{ type: 'Literal', value: '' }],
        loc: { start: { line: 7, column: 3 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('reports for node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'at' },
        },
        arguments: [{ type: 'Literal', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('reports for ArrayExpression object [].at("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression(makeAtCallNodeEmptyString({ type: 'ArrayExpression', elements: [] }))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for str.at(0) — NumericLiteral argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'at' },
        },
        arguments: [{ type: 'Literal', value: 0 }],
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.at(-1) — negative index', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'at' },
        },
        arguments: [{ type: 'UnaryExpression', operator: '-', argument: { type: 'Literal', value: 1 } }],
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.at(5)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'at' },
        },
        arguments: [{ type: 'Literal', value: 5 }],
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.at() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'at' },
        },
        arguments: [],
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.at("", 0) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'at' },
        },
        arguments: [{ type: 'Literal', value: '' }, { type: 'Literal', value: 0 }],
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.at("a") — non-empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'at' },
        },
        arguments: [{ type: 'Literal', value: 'a' }],
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.at("hello") — longer string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'at' },
        },
        arguments: [{ type: 'Literal', value: 'hello' }],
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.charAt(0) — different method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'charAt' },
        },
        arguments: [{ type: 'Literal', value: 0 }],
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.indexOf("") — different method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'indexOf' },
        },
        arguments: [{ type: 'Literal', value: '' }],
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.slice(0) — different method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'slice' },
        },
        arguments: [{ type: 'Literal', value: 0 }],
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for computed property str["at"]("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'at' },
        },
        arguments: [{ type: 'Literal', value: '' }],
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'at' },
        arguments: [{ type: 'Literal', value: '' }],
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'at' },
        },
        arguments: [{ type: 'Literal', value: '' }],
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [{ type: 'Literal', value: '' }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [{ type: 'Literal', value: '' }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.at(true) — BooleanLiteral argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'at' },
        },
        arguments: [{ type: 'BooleanLiteral', value: true }],
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.at(null) — NullLiteral argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'at' },
        },
        arguments: [{ type: 'NullLiteral' }],
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.at(x) — Identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'at' },
        },
        arguments: [{ type: 'Identifier', name: 'x' }],
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.at(1, 2) — three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'at' },
        },
        arguments: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }],
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.includes("") — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'includes' },
        },
        arguments: [{ type: 'Literal', value: '' }],
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
        },
        arguments: [{ type: 'Literal', value: '' }],
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: null,
        },
        arguments: [{ type: 'Literal', value: '' }],
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'at' },
        },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'at' },
        },
        arguments: null,
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when first argument is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'at' },
        },
        arguments: [null],
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.at with property name "AT" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'AT' },
        },
        arguments: [{ type: 'Literal', value: '' }],
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.at with property name "At" (capitalized)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'At' },
        },
        arguments: [{ type: 'Literal', value: '' }],
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when first argument type is Literal with empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'at' },
        },
        arguments: [{ type: 'Literal', value: '' }],
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringAtEmptyRule.create(ctx1)
      const visitor2 = noUnnecessaryStringAtEmptyRule.create(ctx2)
      visitor1.CallExpression(makeAtCallNodeEmptyString({ type: 'Identifier', name: 'str' }))
      visitor2.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'at' },
        },
        arguments: [{ type: 'Literal', value: 0 }],
      })
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression(makeAtCallNodeEmptyString({ type: 'Identifier', name: 'a' }))
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'at' },
        },
        arguments: [{ type: 'Literal', value: 0 }],
      })
      visitor.CallExpression(makeAtCallNodeEmptyString({ type: 'Identifier', name: 'b' }))
      expect(reports.length).toBe(2)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression(makeAtCallNodeEmptyString({ type: 'Identifier', name: 'str' }))
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'at' },
        },
        arguments: [{ type: 'Literal', value: 0 }],
      })
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'charAt' },
        },
        arguments: [{ type: 'Literal', value: '' }],
      })
      visitor.CallExpression(makeAtCallNodeEmptyString({ type: 'Identifier', name: 'str' }))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringAtEmptyRule.create(context)
      const visitor2 = noUnnecessaryStringAtEmptyRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringAtEmptyRule.meta
      const meta2 = noUnnecessaryStringAtEmptyRule.meta
      expect(meta1).toBe(meta2)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      const node = makeAtCallNodeEmptyString({ type: 'Identifier', name: 'str' })
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringAtEmptyRule).toBeDefined()
      expect(typeof noUnnecessaryStringAtEmptyRule.create).toBe('function')
      expect(typeof noUnnecessaryStringAtEmptyRule.meta).toBe('object')
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression(makeAtCallNodeEmptyString({ type: 'Identifier', name: 'a' }))
      visitor.CallExpression(makeAtCallNodeEmptyString({ type: 'Identifier', name: 'b' }))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression(makeAtCallNodeEmptyString({ type: 'Identifier', name: 'str' }, 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('does not report when argument is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'at' },
        },
        arguments: [undefined],
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.at with Literal argument type (not StringLiteral)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'at' },
        },
        arguments: [{ type: 'Literal', value: '' }],
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.at with empty regex argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'at' },
        },
        arguments: [{ type: 'Literal', value: /test/ }],
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.at with ObjectExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'at' },
        },
        arguments: [{ type: 'ObjectExpression', properties: [] }],
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.at with MemberExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'at' },
        },
        arguments: [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'idx' } }],
      })
      expect(reports.length).toBe(0)
    })

    test('reports for deeply nested MemberExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtEmptyRule.create(context)
      visitor.CallExpression(makeAtCallNodeEmptyString({
        type: 'MemberExpression',
        object: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'a' },
          property: { type: 'Identifier', name: 'b' },
        },
        property: { type: 'Identifier', name: 'c' },
      }))
      expect(reports.length).toBe(1)
    })
  })
})
