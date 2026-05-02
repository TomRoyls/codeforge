import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringLastIndexOfEmptyRule } from '../../../../src/rules/patterns/index.js'
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

function makeLastIndexOfCall(
  object: unknown,
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
      computed: false,
      object,
      property: { type: 'Identifier', name: 'lastIndexOf' },
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-string-last-index-of-empty rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringLastIndexOfEmptyRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringLastIndexOfEmptyRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringLastIndexOfEmptyRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringLastIndexOfEmptyRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringLastIndexOfEmptyRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning lastIndexOf', () => {
      const desc = noUnnecessaryStringLastIndexOfEmptyRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/lastindexof/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringLastIndexOfEmptyRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-last-index-of-empty.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringLastIndexOfEmptyRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringLastIndexOfEmptyRule).toBeDefined()
      expect(noUnnecessaryStringLastIndexOfEmptyRule.meta).toBeDefined()
      expect(noUnnecessaryStringLastIndexOfEmptyRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (30) =====

  describe('positive cases — reports unnecessary str.lastIndexOf("")', () => {
    test('reports for str.lastIndexOf("") with Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression(makeLastIndexOfCall(
        { type: 'Identifier', name: 'str' },
        [{ type: 'StringLiteral', value: '' }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for text.lastIndexOf("") with different Identifier name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression(makeLastIndexOfCall(
        { type: 'Identifier', name: 'text' },
        [{ type: 'StringLiteral', value: '' }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for myVar.lastIndexOf("") with variable name myVar', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression(makeLastIndexOfCall(
        { type: 'Identifier', name: 'myVar' },
        [{ type: 'StringLiteral', value: '' }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for member expression object like obj.prop.lastIndexOf("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression(makeLastIndexOfCall(
        { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } },
        [{ type: 'StringLiteral', value: '' }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for call expression object like getStr().lastIndexOf("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression(makeLastIndexOfCall(
        { type: 'CallExpression', callee: { type: 'Identifier', name: 'getStr' }, arguments: [] },
        [{ type: 'StringLiteral', value: '' }],
      ))
      expect(reports.length).toBe(1)
    })

    test('report message mentions lastIndexOf', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression(makeLastIndexOfCall(
        { type: 'Identifier', name: 'str' },
        [{ type: 'StringLiteral', value: '' }],
      ))
      expect(reports[0].message).toMatch(/lastIndexOf/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression(makeLastIndexOfCall(
        { type: 'Identifier', name: 'str' },
        [{ type: 'StringLiteral', value: '' }],
      ))
      expect(reports[0].message).toBe(
        `str.lastIndexOf('') always returns str.length. This is likely unintentional.`,
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression(makeLastIndexOfCall(
        { type: 'Identifier', name: 'str' },
        [{ type: 'StringLiteral', value: '' }],
      ))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression(makeLastIndexOfCall(
        { type: 'Identifier', name: 'str' },
        [{ type: 'StringLiteral', value: '' }],
      ))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      const node = makeLastIndexOfCall(
        { type: 'Identifier', name: 'str' },
        [{ type: 'StringLiteral', value: '' }],
      )
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression(makeLastIndexOfCall(
        { type: 'Identifier', name: 'str' },
        [{ type: 'StringLiteral', value: '' }],
        5, 10, 5, 30,
      ))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression(makeLastIndexOfCall(
        { type: 'Identifier', name: 'str' },
        [{ type: 'StringLiteral', value: '' }],
      ))
      visitor.CallExpression(makeLastIndexOfCall(
        { type: 'Identifier', name: 'text' },
        [{ type: 'StringLiteral', value: '' }],
      ))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression(makeLastIndexOfCall(
        { type: 'Identifier', name: 'str' },
        [{ type: 'StringLiteral', value: '' }],
      ))
      visitor.CallExpression(makeLastIndexOfCall(
        { type: 'Identifier', name: 'text' },
        [{ type: 'StringLiteral', value: '' }],
      ))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for literal string object "hello".lastIndexOf("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression(makeLastIndexOfCall(
        { type: 'StringLiteral', value: 'hello' },
        [{ type: 'StringLiteral', value: '' }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for template literal object `test`.lastIndexOf("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression(makeLastIndexOfCall(
        { type: 'TemplateLiteral', quasis: [], expressions: [] },
        [{ type: 'StringLiteral', value: '' }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for binary expression object (a + b).lastIndexOf("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression(makeLastIndexOfCall(
        { type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } },
        [{ type: 'StringLiteral', value: '' }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for a deeply nested member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression(makeLastIndexOfCall(
        {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'a' },
            property: { type: 'Identifier', name: 'b' },
          },
          property: { type: 'Identifier', name: 'c' },
        },
        [{ type: 'StringLiteral', value: '' }],
      ))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression(makeLastIndexOfCall(
        { type: 'Identifier', name: 'str' },
        [{ type: 'StringLiteral', value: '' }],
      ))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for computed:false explicitly set', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'lastIndexOf' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(1)
    })

    test('reports when computed is undefined (falsy)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'lastIndexOf' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for empty string argument with single quotes', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression(makeLastIndexOfCall(
        { type: 'Identifier', name: 's' },
        [{ type: 'StringLiteral', value: '' }],
      ))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("lastIndexOf('')")
    })

    test('reports for parenthesized expression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression(makeLastIndexOfCall(
        { type: 'Identifier', name: '(str)' },
        [{ type: 'StringLiteral', value: '' }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for conditional expression object (cond ? a : b).lastIndexOf("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression(makeLastIndexOfCall(
        { type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Identifier', name: 'a' }, alternate: { type: 'Identifier', name: 'b' } },
        [{ type: 'StringLiteral', value: '' }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for ArrayExpression object [].lastIndexOf("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression(makeLastIndexOfCall(
        { type: 'ArrayExpression', elements: [] },
        [{ type: 'StringLiteral', value: '' }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for ObjectExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression(makeLastIndexOfCall(
        { type: 'ObjectExpression', properties: [] },
        [{ type: 'StringLiteral', value: '' }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for ThisExpression object this.lastIndexOf("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression(makeLastIndexOfCall(
        { type: 'ThisExpression' },
        [{ type: 'StringLiteral', value: '' }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports message contains str.length reference', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression(makeLastIndexOfCall(
        { type: 'Identifier', name: 'str' },
        [{ type: 'StringLiteral', value: '' }],
      ))
      expect(reports[0].message).toMatch(/str\.length/)
    })

    test('reports message contains "unintentional"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression(makeLastIndexOfCall(
        { type: 'Identifier', name: 'str' },
        [{ type: 'StringLiteral', value: '' }],
      ))
      expect(reports[0].message).toMatch(/unintentional/)
    })

    test('reports for chained call result getStr().lastIndexOf("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression(makeLastIndexOfCall(
        { type: 'CallExpression', callee: { type: 'Identifier', name: 'getStr' }, arguments: [] },
        [{ type: 'StringLiteral', value: '' }],
      ))
      expect(reports.length).toBe(1)
    })

    test('report end loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression(makeLastIndexOfCall(
        { type: 'Identifier', name: 'str' },
        [{ type: 'StringLiteral', value: '' }],
        10, 4, 10, 25,
      ))
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for str.lastIndexOf("a") — non-empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression(makeLastIndexOfCall(
        { type: 'Identifier', name: 'str' },
        [{ type: 'StringLiteral', value: 'a' }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.lastIndexOf("hello") — non-empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression(makeLastIndexOfCall(
        { type: 'Identifier', name: 'str' },
        [{ type: 'StringLiteral', value: 'hello' }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.lastIndexOf(" ") — whitespace string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression(makeLastIndexOfCall(
        { type: 'Identifier', name: 'str' },
        [{ type: 'StringLiteral', value: ' ' }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.indexOf("") — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'indexOf' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.includes("") — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'includes' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.search("") — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'search' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.startsWith("") — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'startsWith' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.endsWith("") — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'endsWith' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.lastIndexOf("") with 2 arguments — extra fromIndex', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression(makeLastIndexOfCall(
        { type: 'Identifier', name: 'str' },
        [{ type: 'StringLiteral', value: '' }, { type: 'NumericLiteral', value: 5 }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.lastIndexOf() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression(makeLastIndexOfCall(
        { type: 'Identifier', name: 'str' },
        [],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.lastIndexOf("") with 3 arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression(makeLastIndexOfCall(
        { type: 'Identifier', name: 'str' },
        [{ type: 'StringLiteral', value: '' }, { type: 'NumericLiteral', value: 0 }, { type: 'NumericLiteral', value: 5 }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for computed member expression str["lastIndexOf"]("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'lastIndexOf' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'lastIndexOf' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'lastIndexOf' },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [{ type: 'StringLiteral', value: '' }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [{ type: 'StringLiteral', value: '' }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is NumericLiteral instead of StringLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression(makeLastIndexOfCall(
        { type: 'Identifier', name: 'str' },
        [{ type: 'NumericLiteral', value: 0 }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression(makeLastIndexOfCall(
        { type: 'Identifier', name: 'str' },
        [{ type: 'Identifier', name: 'searchStr' }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'lastIndexOf' },
        },
        arguments: [null],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'lastIndexOf' },
        },
        arguments: [undefined],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
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
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
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

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "lastindexof" (all lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'lastindexof' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is Literal with empty string instead of StringLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression(makeLastIndexOfCall(
        { type: 'Identifier', name: 'str' },
        [{ type: 'Literal', value: '' }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression(makeLastIndexOfCall(
        { type: 'Identifier', name: 'str' },
        [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'getStr' }, arguments: [] }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression(makeLastIndexOfCall(
        { type: 'Identifier', name: 'str' },
        [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'val' } }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a TemplateLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression(makeLastIndexOfCall(
        { type: 'Identifier', name: 'str' },
        [{ type: 'TemplateLiteral', quasis: [], expressions: [] }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a BooleanLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression(makeLastIndexOfCall(
        { type: 'Identifier', name: 'str' },
        [{ type: 'BooleanLiteral', value: false }],
      ))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringLastIndexOfEmptyRule.create(ctx1)
      const visitor2 = noUnnecessaryStringLastIndexOfEmptyRule.create(ctx2)
      visitor1.CallExpression(makeLastIndexOfCall(
        { type: 'Identifier', name: 'str' },
        [{ type: 'StringLiteral', value: '' }],
      ))
      visitor2.CallExpression(makeLastIndexOfCall(
        { type: 'Identifier', name: 'str' },
        [{ type: 'StringLiteral', value: 'a' }],
      ))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression(makeLastIndexOfCall(
        { type: 'Identifier', name: 'str' },
        [{ type: 'StringLiteral', value: '' }],
      ))
      visitor.CallExpression(makeLastIndexOfCall(
        { type: 'Identifier', name: 'str' },
        [{ type: 'StringLiteral', value: 'a' }],
      ))
      visitor.CallExpression(makeLastIndexOfCall(
        { type: 'Identifier', name: 'text' },
        [{ type: 'StringLiteral', value: '' }],
      ))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'lastIndexOf' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'lastIndexOf' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression(makeLastIndexOfCall(
        { type: 'Identifier', name: 'str' },
        [{ type: 'StringLiteral', value: 'a' }],
      ))
      visitor.CallExpression(makeLastIndexOfCall(
        { type: 'Identifier', name: 'str' },
        [{ type: 'StringLiteral', value: '' }],
      ))
      visitor.CallExpression(makeLastIndexOfCall(
        { type: 'Identifier', name: 'str' },
        [{ type: 'Literal', value: '' }],
      ))
      visitor.CallExpression(makeLastIndexOfCall(
        { type: 'Identifier', name: 'text' },
        [{ type: 'StringLiteral', value: '' }],
      ))
      visitor.CallExpression(makeLastIndexOfCall(
        { type: 'Identifier', name: 'str' },
        [],
      ))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      const visitor2 = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringLastIndexOfEmptyRule.meta
      const meta2 = noUnnecessaryStringLastIndexOfEmptyRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'lastIndexOf' },
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
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'lastIndexOf' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'lastIndexOf' },
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
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      const node = makeLastIndexOfCall(
        { type: 'Identifier', name: 'str' },
        [{ type: 'StringLiteral', value: '' }],
      )
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringLastIndexOfEmptyRule).toBeDefined()
      expect(typeof noUnnecessaryStringLastIndexOfEmptyRule.create).toBe('function')
      expect(typeof noUnnecessaryStringLastIndexOfEmptyRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'lastIndexOf' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression(makeLastIndexOfCall(
        { type: 'Identifier', name: 'str' },
        [{ type: 'StringLiteral', value: '' }],
        10, 4, 10, 25,
      ))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfEmptyRule.create(context)
      visitor.CallExpression(makeLastIndexOfCall(
        { type: 'Identifier', name: 'str' },
        [{ type: 'StringLiteral', value: '' }],
      ))
      visitor.CallExpression(makeLastIndexOfCall(
        { type: 'Identifier', name: 'text' },
        [{ type: 'StringLiteral', value: '' }],
      ))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})
