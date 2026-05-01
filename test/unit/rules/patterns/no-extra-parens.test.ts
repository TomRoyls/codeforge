import { describe, expect, test, vi } from 'vitest'
import { noExtraParensRule } from '../../../../src/rules/patterns/no-extra-parens.js'
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
    getSource: () => '(x + y)',
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

function makeParensNode(
  innerType: string,
  innerProps: Record<string, unknown> = {},
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 10,
): unknown {
  return {
    type: 'ParenthesizedExpression',
    expression: {
      type: innerType,
      ...innerProps,
    },
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-extra-parens rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noExtraParensRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noExtraParensRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noExtraParensRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noExtraParensRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noExtraParensRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning unnecessary parentheses', () => {
      const desc = noExtraParensRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/unnecessary|parenthes/)
    })

    test('should have correct docs URL', () => {
      expect(noExtraParensRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-extra-parens',
      )
    })

    test('should have empty schema', () => {
      expect(noExtraParensRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with ParenthesizedExpression', () => {
      const { context } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      expect(visitor).toHaveProperty('ParenthesizedExpression')
      expect(typeof visitor.ParenthesizedExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noExtraParensRule).toBeDefined()
      expect(noExtraParensRule.meta).toBeDefined()
      expect(noExtraParensRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS EXTRA PARENS (30) =====

  describe('positive cases — reports extra parens', () => {
    test('reports for BinaryExpression inner', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression(
        makeParensNode('BinaryExpression', { operator: '+', left: {}, right: {} }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for UnaryExpression inner', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression(
        makeParensNode('UnaryExpression', { operator: '!', prefix: true, argument: {} }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for LogicalExpression inner', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression(
        makeParensNode('LogicalExpression', { operator: '&&', left: {}, right: {} }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for ConditionalExpression inner', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression(
        makeParensNode('ConditionalExpression', { test: {}, consequent: {}, alternate: {} }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for AssignmentExpression inner', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression(
        makeParensNode('AssignmentExpression', { operator: '=', left: {}, right: {} }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for SequenceExpression inner', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression(
        makeParensNode('SequenceExpression', { expressions: [] }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for UpdateExpression inner', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression(
        makeParensNode('UpdateExpression', { operator: '++', prefix: false, argument: {} }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for NewExpression inner', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression(
        makeParensNode('NewExpression', { callee: {}, arguments: [] }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for ArrayExpression inner', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression(
        makeParensNode('ArrayExpression', { elements: [] }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for ObjectExpression inner', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression(
        makeParensNode('ObjectExpression', { properties: [] }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for FunctionExpression inner', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression(
        makeParensNode('FunctionExpression', { id: null, params: [], body: { type: 'BlockStatement', body: [] } }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for ArrowFunctionExpression inner', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression(
        makeParensNode('ArrowFunctionExpression', { params: [], body: { type: 'BlockStatement', body: [] } }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for TemplateLiteral inner', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression(
        makeParensNode('TemplateLiteral', { quasis: [], expressions: [] }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for TaggedTemplateExpression inner', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression(
        makeParensNode('TaggedTemplateExpression', { tag: {}, quasi: {} }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for AwaitExpression inner', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression(
        makeParensNode('AwaitExpression', { argument: {} }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for YieldExpression inner', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression(
        makeParensNode('YieldExpression', { argument: null }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for SpreadElement inner', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression(
        makeParensNode('SpreadElement', { argument: {} }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for TypeCastExpression inner', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression(
        makeParensNode('TypeCastExpression', { expression: {}, typeAnnotation: {} }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for ComputedMemberExpression inner', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression(
        makeParensNode('ComputedMemberExpression', { object: {}, property: {} }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for ChainExpression inner', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression(
        makeParensNode('ChainExpression', { expression: {} }),
      )
      expect(reports.length).toBe(1)
    })

    test('report message is exactly "Unnecessary parentheses around expression."', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression(
        makeParensNode('BinaryExpression', { operator: '+', left: {}, right: {} }),
      )
      expect(reports[0].message).toBe('Unnecessary parentheses around expression.')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression(
        makeParensNode('BinaryExpression', { operator: '+', left: {}, right: {} }),
      )
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression(
        makeParensNode('BinaryExpression', { operator: '+', left: {}, right: {} }),
      )
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input ParenthesizedExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      const node = makeParensNode('BinaryExpression', { operator: '+', left: {}, right: {} })
      visitor.ParenthesizedExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('reports for BinaryExpression with "-" operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression(
        makeParensNode('BinaryExpression', { operator: '-', left: {}, right: {} }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for BinaryExpression with "*" operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression(
        makeParensNode('BinaryExpression', { operator: '*', left: {}, right: {} }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for LogicalExpression with "||" operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression(
        makeParensNode('LogicalExpression', { operator: '||', left: {}, right: {} }),
      )
      expect(reports.length).toBe(1)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression(
        makeParensNode('BinaryExpression', { operator: '+', left: {}, right: {} }),
      )
      visitor.ParenthesizedExpression(
        makeParensNode('LogicalExpression', { operator: '&&', left: {}, right: {} }),
      )
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression(
        makeParensNode('BinaryExpression', { operator: '+', left: {}, right: {} }),
      )
      visitor.ParenthesizedExpression(
        makeParensNode('UnaryExpression', { operator: '!', prefix: true, argument: {} }),
      )
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression(
        makeParensNode('BinaryExpression', { operator: '+', left: {}, right: {} }, 5, 10, 5, 20),
      )
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Identifier inner', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression(
        makeParensNode('Identifier', { name: 'foo' }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal inner', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression(
        makeParensNode('Literal', { value: 42 }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression inner', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression(
        makeParensNode('MemberExpression', { object: {}, property: {} }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression inner', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression(
        makeParensNode('CallExpression', { callee: {}, arguments: [] }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for ParenthesizedExpression inner', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression(
        makeParensNode('ParenthesizedExpression', { expression: {} }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      expect(() => visitor.ParenthesizedExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      expect(() => visitor.ParenthesizedExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      expect(() => visitor.ParenthesizedExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      expect(() => visitor.ParenthesizedExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      expect(() => visitor.ParenthesizedExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      expect(() => visitor.ParenthesizedExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when expression property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression({ type: 'ParenthesizedExpression', loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when expression is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression({
        type: 'ParenthesizedExpression',
        expression: null,
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when expression is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression({
        type: 'ParenthesizedExpression',
        expression: undefined,
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when expression is a string', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression({
        type: 'ParenthesizedExpression',
        expression: 'not an object',
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when expression is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression({
        type: 'ParenthesizedExpression',
        expression: 123,
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when inner expression is Identifier with extra props', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression(
        makeParensNode('Identifier', { name: 'x', typeAnnotation: {} }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when inner expression is Literal with string value', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression(
        makeParensNode('Literal', { value: 'hello', raw: '"hello"' }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when inner expression is MemberExpression with computed', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression(
        makeParensNode('MemberExpression', { object: { type: 'Identifier', name: 'a' }, property: { type: 'Identifier', name: 'b' }, computed: false }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when inner expression is CallExpression with args', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression(
        makeParensNode('CallExpression', { callee: { type: 'Identifier', name: 'fn' }, arguments: [{ type: 'Literal', value: 1 }] }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when node type is not ParenthesizedExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression({
        type: 'BinaryExpression',
        operator: '+',
        left: {},
        right: {},
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when inner expression is nested ParenthesizedExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression(
        makeParensNode('ParenthesizedExpression', {
          expression: { type: 'BinaryExpression', operator: '+', left: {}, right: {} },
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when inner expression type is empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression({
        type: 'ParenthesizedExpression',
        expression: { type: '' },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report for Literal with regex value', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression(
        makeParensNode('Literal', { value: /test/, raw: '/test/' }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression inside nested MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression(
        makeParensNode('CallExpression', {
          callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'a' }, property: { type: 'Identifier', name: 'b' } },
          arguments: [],
        }),
      )
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (30) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noExtraParensRule.create(ctx1)
      const visitor2 = noExtraParensRule.create(ctx2)
      visitor1.ParenthesizedExpression(
        makeParensNode('BinaryExpression', { operator: '+', left: {}, right: {} }),
      )
      visitor2.ParenthesizedExpression(
        makeParensNode('Identifier', { name: 'x' }),
      )
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression(
        makeParensNode('BinaryExpression', { operator: '+', left: {}, right: {} }),
      )
      visitor.ParenthesizedExpression(
        makeParensNode('Identifier', { name: 'x' }),
      )
      visitor.ParenthesizedExpression(
        makeParensNode('UnaryExpression', { operator: '!', prefix: true, argument: {} }),
      )
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      const node = {
        type: 'ParenthesizedExpression',
        expression: { type: 'BinaryExpression', operator: '+', left: {}, right: {} },
      }
      visitor.ParenthesizedExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      const node = {
        type: 'ParenthesizedExpression',
        expression: { type: 'BinaryExpression', operator: '+', left: {}, right: {} },
      }
      visitor.ParenthesizedExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression(makeParensNode('Identifier', { name: 'x' }))
      visitor.ParenthesizedExpression(makeParensNode('BinaryExpression', { operator: '+', left: {}, right: {} }))
      visitor.ParenthesizedExpression(makeParensNode('Literal', { value: 42 }))
      visitor.ParenthesizedExpression(makeParensNode('LogicalExpression', { operator: '&&', left: {}, right: {} }))
      visitor.ParenthesizedExpression(makeParensNode('CallExpression', { callee: {}, arguments: [] }))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noExtraParensRule.create(context)
      const visitor2 = noExtraParensRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noExtraParensRule.meta
      const meta2 = noExtraParensRule.meta
      expect(meta1).toBe(meta2)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression(
        makeParensNode('BinaryExpression', { operator: '+', left: {}, right: {} }),
      )
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      const node = {
        type: 'ParenthesizedExpression',
        expression: { type: 'BinaryExpression', operator: '+', left: {}, right: {} },
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        _parent: {},
      }
      visitor.ParenthesizedExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression({
        type: 'ParenthesizedExpression',
        expression: { type: 'BinaryExpression', operator: '+', left: {}, right: {} },
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression({
        type: 'ParenthesizedExpression',
        expression: { type: 'BinaryExpression', operator: '+', left: {}, right: {} },
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      const node = makeParensNode('BinaryExpression', { operator: '+', left: {}, right: {} })
      visitor.ParenthesizedExpression(node)
      visitor.ParenthesizedExpression(node)
      visitor.ParenthesizedExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noExtraParensRule).toBeDefined()
      expect(typeof noExtraParensRule.create).toBe('function')
      expect(typeof noExtraParensRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression({
        type: 'ParenthesizedExpression',
        expression: { type: 'BinaryExpression', operator: '+', left: {}, right: {} },
        loc: makeLoc(1, 0, 1, 5),
        _parent: { type: 'ExpressionStatement' },
      })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression(
        makeParensNode('BinaryExpression', { operator: '+', left: {}, right: {} }),
      )
      visitor.ParenthesizedExpression(
        makeParensNode('UnaryExpression', { operator: '!', prefix: true, argument: {} }),
      )
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('handles nested expression object without type', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression({
        type: 'ParenthesizedExpression',
        expression: {},
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression(
        makeParensNode('BinaryExpression', { operator: '+', left: {}, right: {} }, 10, 4, 10, 15),
      )
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(15)
    })

    test('handles expression with only type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression({
        type: 'ParenthesizedExpression',
        expression: { type: 'SomeUnknownType' },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for VoidExpression inner', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression(
        makeParensNode('VoidExpression', { argument: {} }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for ThrowExpression inner', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression(
        makeParensNode('ThrowExpression', { argument: {} }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for ClassExpression inner', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression(
        makeParensNode('ClassExpression', { id: null, body: { type: 'ClassBody', body: [] } }),
      )
      expect(reports.length).toBe(1)
    })

    test('does not crash when expression type is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression({
        type: 'ParenthesizedExpression',
        expression: { name: 'foo' },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(1)
    })

    test('handles array node input', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      expect(() => visitor.ParenthesizedExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('correctly identifies all five skip types independently', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      const skipTypes = ['Identifier', 'Literal', 'MemberExpression', 'CallExpression', 'ParenthesizedExpression']
      for (const t of skipTypes) {
        visitor.ParenthesizedExpression(makeParensNode(t, {}))
      }
      expect(reports.length).toBe(0)
    })

    test('reports for CommaExpression inner', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression(
        makeParensNode('CommaExpression', { expressions: [] }),
      )
      expect(reports.length).toBe(1)
    })

    test('handles node with range property', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression({
        type: 'ParenthesizedExpression',
        expression: { type: 'BinaryExpression', operator: '+', left: {}, right: {} },
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
      })
      expect(reports.length).toBe(1)
    })

    test('does not report for MemberExpression with computed true', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression(
        makeParensNode('MemberExpression', { object: {}, property: {}, computed: true }),
      )
      expect(reports.length).toBe(0)
    })

    test('report for UpdateExpression has correct message', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression(
        makeParensNode('UpdateExpression', { operator: '++', prefix: false, argument: {} }),
      )
      expect(reports[0].message).toBe('Unnecessary parentheses around expression.')
    })

    test('reports for DeleteExpression inner', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression(
        makeParensNode('DeleteExpression', { argument: {} }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for OptionalCallExpression inner', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraParensRule.create(context)
      visitor.ParenthesizedExpression(
        makeParensNode('OptionalCallExpression', { callee: {}, arguments: [], optional: true }),
      )
      expect(reports.length).toBe(1)
    })
  })
})
