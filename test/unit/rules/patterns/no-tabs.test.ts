import { describe, expect, test, vi } from 'vitest'
import { noTabsRule } from '../../../../src/rules/patterns/no-tabs.js'
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
    getSource: () => '"hello\tworld"',
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
    id: 'patterns/no-tabs',
    options: [],
    settings: {},
    parserPath: '@typescript-eslint/parser',
    parserOptions: {},
    parserServices: {},
  } as unknown as RuleContext
  return { context, reports }
}

function makeStringNode(
  value: string,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 5,
): unknown {
  return {
    type: 'Literal',
    value,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-tabs rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noTabsRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noTabsRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noTabsRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noTabsRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noTabsRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning tabs', () => {
      const desc = noTabsRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/tab/)
    })

    test('should have correct docs URL', () => {
      expect(noTabsRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-tabs',
      )
    })

    test('should have empty schema', () => {
      expect(noTabsRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with Literal', () => {
      const { context } = createMockContext()
      const visitor = noTabsRule.create(context)
      expect(visitor).toHaveProperty('Literal')
      expect(typeof visitor.Literal).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noTabsRule).toBeDefined()
      expect(noTabsRule.meta).toBeDefined()
      expect(noTabsRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS TAB (25) =====

  describe('positive cases — reports tab', () => {
    test('reports for string with leading tab', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal(makeStringNode('\thello'))
      expect(reports.length).toBe(1)
    })

    test('reports for string with trailing tab', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal(makeStringNode('hello\t'))
      expect(reports.length).toBe(1)
    })

    test('reports for string with middle tab', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal(makeStringNode('hello\tworld'))
      expect(reports.length).toBe(1)
    })

    test('reports for string that is only a tab', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal(makeStringNode('\t'))
      expect(reports.length).toBe(1)
    })

    test('reports for string with multiple tabs', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal(makeStringNode('\t\t\t'))
      expect(reports.length).toBe(1)
    })

    test('reports for string with tab between words', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal(makeStringNode('foo\tbar'))
      expect(reports.length).toBe(1)
    })

    test('reports for string with tab and spaces mixed', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal(makeStringNode('  \t  '))
      expect(reports.length).toBe(1)
    })

    test('reports for string with tab at beginning of indented line', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal(makeStringNode('\t    code'))
      expect(reports.length).toBe(1)
    })

    test('reports for string with tab in the middle of text', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal(makeStringNode('a\tb\tc'))
      expect(reports.length).toBe(1)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal(makeStringNode('\t'))
      expect(reports[0].message).toBe(
        'Unexpected tab character in string literal. Use spaces for indentation.',
      )
    })

    test('report message mentions tab character', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal(makeStringNode('a\tb'))
      expect(reports[0].message.toLowerCase()).toContain('tab')
    })

    test('report message mentions spaces', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal(makeStringNode('a\tb'))
      expect(reports[0].message.toLowerCase()).toContain('spaces')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal(makeStringNode('\t'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal(makeStringNode('\t'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input StringLiteral node', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      const node = makeStringNode('\t')
      visitor.Literal(node)
      expect(reports[0].node).toBe(node)
    })

    test('reports for string with tab after spaces indentation', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal(makeStringNode('    \tindented'))
      expect(reports.length).toBe(1)
    })

    test('reports for string with only tabs and no other chars', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal(makeStringNode('\t\t\t\t'))
      expect(reports.length).toBe(1)
    })

    test('reports for string with tab between numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal(makeStringNode('123\t456'))
      expect(reports.length).toBe(1)
    })

    test('reports only once per string even with multiple tabs', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal(makeStringNode('\t\t\t'))
      expect(reports.length).toBe(1)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal(makeStringNode('\t'))
      visitor.Literal(makeStringNode('a\tb'))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal(makeStringNode('\t'))
      visitor.Literal(makeStringNode('hello\tworld'))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for string with newline then tab', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal(makeStringNode('\n\t'))
      expect(reports.length).toBe(1)
    })

    test('reports for string with tab then newline', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal(makeStringNode('\t\n'))
      expect(reports.length).toBe(1)
    })

    test('reports for string with carriage return and tab', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal(makeStringNode('\r\t'))
      expect(reports.length).toBe(1)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal(makeStringNode('\t', 5, 10, 5, 15))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for string without tab "hello world"', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal(makeStringNode('hello world'))
      expect(reports.length).toBe(0)
    })

    test('does not report for empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal(makeStringNode(''))
      expect(reports.length).toBe(0)
    })

    test('does not report for string with only spaces', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal(makeStringNode('    '))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      expect(() => visitor.Literal(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      expect(() => visitor.Literal(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      expect(() => visitor.Literal({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal({ type: 'Literal', value: 'test', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      expect(() => visitor.Literal('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      expect(() => visitor.Literal(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean node', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      expect(() => visitor.Literal(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      expect(() => visitor.Literal([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal({ type: 'MemberExpression', object: {}, property: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report when value property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal({ type: 'Literal', loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when value is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal({ type: 'Literal', value: null, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when value is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal({ type: 'Literal', value: 123, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when value is a boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal({ type: 'Literal', value: true, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for string with newlines only', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal(makeStringNode('\n\n\n'))
      expect(reports.length).toBe(0)
    })

    test('does not report for single char string "a"', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal(makeStringNode('a'))
      expect(reports.length).toBe(0)
    })

    test('does not report for string with carriage returns only', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal(makeStringNode('\r\r'))
      expect(reports.length).toBe(0)
    })

    test('does not report for string with various whitespace but no tabs', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal(makeStringNode(' \n\r '))
      expect(reports.length).toBe(0)
    })

    test('does not report for string with unicode content', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal(makeStringNode('hello 世界'))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (36) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noTabsRule.create(ctx1)
      const visitor2 = noTabsRule.create(ctx2)
      visitor1.Literal(makeStringNode('\t'))
      visitor2.Literal(makeStringNode('hello'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal(makeStringNode('\t'))
      visitor.Literal(makeStringNode('hello'))
      visitor.Literal(makeStringNode('a\tb'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      const node = { type: 'Literal', value: '\t' }
      visitor.Literal(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      const node = { type: 'Literal', value: '\t' }
      visitor.Literal(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal(makeStringNode('hello'))
      visitor.Literal(makeStringNode('\t'))
      visitor.Literal(makeStringNode('world'))
      visitor.Literal(makeStringNode('a\tb'))
      visitor.Literal(makeStringNode('spaces only'))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noTabsRule.create(context)
      const visitor2 = noTabsRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noTabsRule.meta
      const meta2 = noTabsRule.meta
      expect(meta1).toBe(meta2)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal(makeStringNode('\t'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      const node = {
        type: 'Literal',
        value: '\t',
        loc: makeLoc(1, 0, 1, 5),
        range: [0, 5],
        extra: true,
        raw: '"\t"',
      }
      visitor.Literal(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal({ type: 'Literal', value: '\t', loc: {} })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal({ type: 'Literal', value: '\t', loc: { start: { line: 3, column: 5 } } })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      const node = makeStringNode('\t')
      visitor.Literal(node)
      visitor.Literal(node)
      visitor.Literal(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noTabsRule).toBeDefined()
      expect(typeof noTabsRule.create).toBe('function')
      expect(typeof noTabsRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal({ type: 'Literal', value: '\t', loc: makeLoc(1, 0, 1, 5), _parent: {} })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal(makeStringNode('\t'))
      visitor.Literal(makeStringNode('a\tb'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal(makeStringNode('\t', 10, 4, 10, 12))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(12)
    })

    test('does not report when value is an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal({ type: 'Literal', value: ['a', 'b'], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when value is an object', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal({ type: 'Literal', value: { toString: () => '\t' }, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('handles FunctionExpression node type without error', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('handles ArrowFunctionExpression node type without error', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('handles ReturnStatement node type without error', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('handles IfStatement node type without error', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('handles VariableDeclaration node type without error', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('handles ExpressionStatement node type without error', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal({ type: 'ExpressionStatement', expression: {}, loc: makeLoc(1, 0, 1, 1) })
      expect(reports.length).toBe(0)
    })

    test('handles BlockStatement node type without error', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal({ type: 'BlockStatement', body: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('handles ObjectExpression node type without error', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal({ type: 'ObjectExpression', properties: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('handles ArrayExpression node type without error', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal({ type: 'ArrayExpression', elements: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('handles ConditionalExpression node type without error', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal({ type: 'ConditionalExpression', test: {}, consequent: {}, alternate: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('reports for string with tab after special characters', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal(makeStringNode('\\n\t'))
      expect(reports.length).toBe(1)
    })

    test('reports for string with tab before special characters', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal(makeStringNode('\t\\n'))
      expect(reports.length).toBe(1)
    })

    test('handles long string with single tab', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal(makeStringNode('this is a very long string with a\ttab in the middle'))
      expect(reports.length).toBe(1)
    })

    test('handles long string without any tabs', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal(makeStringNode('this is a very long string with no tabs at all'))
      expect(reports.length).toBe(0)
    })

    test('handles node with string "value" that happens to be "undefined"', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal({ type: 'Literal', value: 'undefined', loc: makeLoc(1, 0, 1, 9) })
      expect(reports.length).toBe(0)
    })

    test('handles node where value is empty string explicitly', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal({ type: 'Literal', value: '', loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('report loc end values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noTabsRule.create(context)
      visitor.Literal(makeStringNode('\t', 2, 8, 4, 20))
      expect(reports[0].loc?.end.line).toBe(4)
      expect(reports[0].loc?.end.column).toBe(20)
    })
  })
})
