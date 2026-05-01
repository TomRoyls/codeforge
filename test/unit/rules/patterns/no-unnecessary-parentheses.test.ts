import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryParenthesesRule } from '../../../../src/rules/patterns/no-unnecessary-parentheses.js'
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
    getSource: () => '(x)',
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

function makeSeqNode(
  expressions: unknown[],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 5,
): unknown {
  return {
    type: 'SequenceExpression',
    expressions,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-parentheses rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryParenthesesRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryParenthesesRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryParenthesesRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryParenthesesRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryParenthesesRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning parentheses', () => {
      const desc = noUnnecessaryParenthesesRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/parenthes/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryParenthesesRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-parentheses',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryParenthesesRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with SequenceExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      expect(visitor).toHaveProperty('SequenceExpression')
      expect(typeof visitor.SequenceExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryParenthesesRule).toBeDefined()
      expect(noUnnecessaryParenthesesRule.meta).toBeDefined()
      expect(noUnnecessaryParenthesesRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS UNNECESSARY PARENTHESES (25) =====

  describe('positive cases — reports unnecessary parentheses', () => {
    test('reports for SequenceExpression with 1 Identifier expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression(makeSeqNode([{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for SequenceExpression with 1 Literal expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression(makeSeqNode([{ type: 'Literal', value: 42 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for SequenceExpression with 1 CallExpression expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression(makeSeqNode([{ type: 'CallExpression', callee: {}, arguments: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports for SequenceExpression with 1 MemberExpression expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression(makeSeqNode([{ type: 'MemberExpression', object: {}, property: {} }]))
      expect(reports.length).toBe(1)
    })

    test('reports for SequenceExpression with 1 BinaryExpression expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression(makeSeqNode([{ type: 'BinaryExpression', operator: '+', left: {}, right: {} }]))
      expect(reports.length).toBe(1)
    })

    test('reports for SequenceExpression with 1 UnaryExpression expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression(makeSeqNode([{ type: 'UnaryExpression', operator: '!', prefix: true, argument: {} }]))
      expect(reports.length).toBe(1)
    })

    test('reports for SequenceExpression with 1 ArrowFunctionExpression expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression(makeSeqNode([{ type: 'ArrowFunctionExpression', params: [], body: {} }]))
      expect(reports.length).toBe(1)
    })

    test('reports for SequenceExpression with 1 ConditionalExpression expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression(makeSeqNode([{ type: 'ConditionalExpression', test: {}, consequent: {}, alternate: {} }]))
      expect(reports.length).toBe(1)
    })

    test('reports for SequenceExpression with 1 object expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression(makeSeqNode([{ type: 'ObjectExpression', properties: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports for SequenceExpression with 1 ArrayExpression expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression(makeSeqNode([{ type: 'ArrayExpression', elements: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports for SequenceExpression with 1 FunctionExpression expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression(makeSeqNode([{ type: 'FunctionExpression', id: null, params: [], body: {} }]))
      expect(reports.length).toBe(1)
    })

    test('reports for SequenceExpression with 1 AssignmentExpression expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression(makeSeqNode([{ type: 'AssignmentExpression', operator: '=', left: {}, right: {} }]))
      expect(reports.length).toBe(1)
    })

    test('reports for SequenceExpression with 1 empty plain object expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression(makeSeqNode([{}]))
      expect(reports.length).toBe(1)
    })

    test('reports for SequenceExpression with 1 string element expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression(makeSeqNode(['x']))
      expect(reports.length).toBe(1)
    })

    test('reports for SequenceExpression with 1 null element expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression(makeSeqNode([null]))
      expect(reports.length).toBe(1)
    })

    test('reports for node with custom loc values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression(makeSeqNode([{ type: 'Identifier', name: 'x' }], 5, 10, 5, 15))
      expect(reports.length).toBe(1)
    })

    test('reports for node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression({
        type: 'SequenceExpression',
        expressions: [{ type: 'Identifier', name: 'x' }],
        loc: makeLoc(1, 0, 1, 5),
        range: [0, 5],
        extra: true,
        parenthesized: true,
      })
      expect(reports.length).toBe(1)
    })

    test('reports for node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression({
        type: 'SequenceExpression',
        expressions: [{ type: 'Identifier', name: 'x' }],
        loc: makeLoc(1, 0, 1, 5),
        _parent: { type: 'ExpressionStatement' },
      })
      expect(reports.length).toBe(1)
    })

    test('reports for SequenceExpression with 1 TemplateLiteral expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression(makeSeqNode([{ type: 'TemplateLiteral', quasis: [], expressions: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports for SequenceExpression with 1 LogicalExpression expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression(makeSeqNode([{ type: 'LogicalExpression', operator: '&&', left: {}, right: {} }]))
      expect(reports.length).toBe(1)
    })

    test('reports for SequenceExpression with 1 NewExpression expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression(makeSeqNode([{ type: 'NewExpression', callee: {}, arguments: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports for SequenceExpression with 1 UpdateExpression expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression(makeSeqNode([{ type: 'UpdateExpression', operator: '++', prefix: false, argument: {} }]))
      expect(reports.length).toBe(1)
    })

    test('reports for SequenceExpression with 1 YieldExpression expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression(makeSeqNode([{ type: 'YieldExpression', argument: null }]))
      expect(reports.length).toBe(1)
    })

    test('reports for SequenceExpression with 1 AwaitExpression expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression(makeSeqNode([{ type: 'AwaitExpression', argument: {} }]))
      expect(reports.length).toBe(1)
    })

    test('reports for SequenceExpression with 1 ThisExpression expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression(makeSeqNode([{ type: 'ThisExpression' }]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report message mentions "Unnecessary parentheses"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression(makeSeqNode([{ type: 'Identifier', name: 'x' }]))
      expect(reports[0].message).toContain('Unnecessary parentheses')
    })

    test('report message mentions "single expression"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression(makeSeqNode([{ type: 'Identifier', name: 'x' }]))
      expect(reports[0].message.toLowerCase()).toContain('single expression')
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression(makeSeqNode([{ type: 'Identifier', name: 'x' }]))
      expect(reports[0].message).toBe(
        'Unnecessary parentheses wrapping a single expression.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression(makeSeqNode([{ type: 'Identifier', name: 'x' }]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression(makeSeqNode([{ type: 'Identifier', name: 'x' }]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input SequenceExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      const node = makeSeqNode([{ type: 'Identifier', name: 'x' }])
      visitor.SequenceExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression(makeSeqNode([{ type: 'Identifier', name: 'x' }], 5, 10, 5, 15))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression(makeSeqNode([{ type: 'Identifier', name: 'x' }]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression(makeSeqNode([{ type: 'Identifier', name: 'a' }]))
      visitor.SequenceExpression(makeSeqNode([{ type: 'Identifier', name: 'b' }]))
      expect(reports.length).toBe(2)
    })

    test('consistent messages across multiple reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression(makeSeqNode([{ type: 'Identifier', name: 'a' }]))
      visitor.SequenceExpression(makeSeqNode([{ type: 'Identifier', name: 'b' }]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('single report per call for one-expression SequenceExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression(makeSeqNode([{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(1)
    })

    test('reports multiple violations separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      const node = makeSeqNode([{ type: 'Identifier', name: 'x' }])
      visitor.SequenceExpression(node)
      visitor.SequenceExpression(node)
      visitor.SequenceExpression(node)
      expect(reports.length).toBe(3)
    })

    test('report loc end values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression(makeSeqNode([{ type: 'Identifier', name: 'x' }], 2, 3, 7, 9))
      expect(reports[0].loc?.end.line).toBe(7)
      expect(reports[0].loc?.end.column).toBe(9)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression(makeSeqNode([{ type: 'Identifier', name: 'x' }], 10, 4, 10, 12))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(12)
    })

    test('reports two violations with correct individual nodes', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      const node1 = makeSeqNode([{ type: 'Identifier', name: 'a' }])
      const node2 = makeSeqNode([{ type: 'Identifier', name: 'b' }])
      visitor.SequenceExpression(node1)
      visitor.SequenceExpression(node2)
      expect(reports.length).toBe(2)
      expect(reports[0].node).toBe(node1)
      expect(reports[1].node).toBe(node2)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for SequenceExpression with 2 expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression(makeSeqNode([{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for SequenceExpression with 3 expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression(makeSeqNode([{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }, { type: 'Identifier', name: 'c' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for SequenceExpression with 5 expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression(makeSeqNode([{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }, { type: 'Identifier', name: 'c' }, { type: 'Identifier', name: 'd' }, { type: 'Identifier', name: 'e' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for non-SequenceExpression type Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-SequenceExpression type Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression({ type: 'Literal', value: 'test', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-SequenceExpression type CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-SequenceExpression type BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      expect(() => visitor.SequenceExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      expect(() => visitor.SequenceExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      expect(() => visitor.SequenceExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      expect(() => visitor.SequenceExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      expect(() => visitor.SequenceExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      expect(() => visitor.SequenceExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      expect(() => visitor.SequenceExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for SequenceExpression with empty expressions array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression(makeSeqNode([]))
      expect(reports.length).toBe(0)
    })

    test('does not report for non-SequenceExpression type MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression({ type: 'MemberExpression', object: {}, property: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-SequenceExpression type UnaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-SequenceExpression type FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-SequenceExpression type ConditionalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression({ type: 'ConditionalExpression', test: {}, consequent: {}, alternate: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-SequenceExpression type ReturnStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-SequenceExpression type IfStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-SequenceExpression type VariableDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when expressions property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression({ type: 'SequenceExpression', loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when expressions property is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression({ type: 'SequenceExpression', expressions: null, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when expressions property is a string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression({ type: 'SequenceExpression', expressions: 'not-array', loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryParenthesesRule.create(ctx1)
      const visitor2 = noUnnecessaryParenthesesRule.create(ctx2)
      visitor1.SequenceExpression(makeSeqNode([{ type: 'Identifier', name: 'x' }]))
      visitor2.SequenceExpression(makeSeqNode([{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression(makeSeqNode([{ type: 'Identifier', name: 'x' }]))
      visitor.SequenceExpression(makeSeqNode([{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }]))
      visitor.SequenceExpression(makeSeqNode([{ type: 'Identifier', name: 'y' }]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      const node = { type: 'SequenceExpression', expressions: [{ type: 'Identifier', name: 'x' }] }
      visitor.SequenceExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      const node = { type: 'SequenceExpression', expressions: [{ type: 'Identifier', name: 'x' }] }
      visitor.SequenceExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression(makeSeqNode([{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }]))
      visitor.SequenceExpression(makeSeqNode([{ type: 'Identifier', name: 'x' }]))
      visitor.SequenceExpression(makeSeqNode([]))
      visitor.SequenceExpression(makeSeqNode([{ type: 'Identifier', name: 'y' }]))
      visitor.SequenceExpression(makeSeqNode([{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }, { type: 'Identifier', name: 'c' }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryParenthesesRule.create(context)
      const visitor2 = noUnnecessaryParenthesesRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryParenthesesRule.meta
      const meta2 = noUnnecessaryParenthesesRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      const node = {
        type: 'SequenceExpression',
        expressions: [{ type: 'Identifier', name: 'x' }],
        loc: makeLoc(1, 0, 1, 5),
        range: [0, 5],
        extra: true,
        parenthesized: true,
      }
      visitor.SequenceExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression({ type: 'SequenceExpression', expressions: [{ type: 'Identifier', name: 'x' }], loc: {} })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression({ type: 'SequenceExpression', expressions: [{ type: 'Identifier', name: 'x' }], loc: { start: { line: 3, column: 5 } } })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      const node = makeSeqNode([{ type: 'Identifier', name: 'x' }])
      visitor.SequenceExpression(node)
      visitor.SequenceExpression(node)
      visitor.SequenceExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryParenthesesRule).toBeDefined()
      expect(typeof noUnnecessaryParenthesesRule.create).toBe('function')
      expect(typeof noUnnecessaryParenthesesRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression({ type: 'SequenceExpression', expressions: [{ type: 'Identifier', name: 'x' }], loc: makeLoc(1, 0, 1, 5), _parent: {} })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression(makeSeqNode([{ type: 'Identifier', name: 'a' }]))
      visitor.SequenceExpression(makeSeqNode([{ type: 'Literal', value: 42 }]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('node with flags alongside expressions still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression({ type: 'SequenceExpression', expressions: [{ type: 'Identifier', name: 'x' }], flags: 'strict', loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(1)
    })

    test('does not report when expressions is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression({ type: 'SequenceExpression', expressions: undefined, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when expressions is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression({ type: 'SequenceExpression', expressions: 42, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression(makeSeqNode([{ type: 'Identifier', name: 'x' }], 10, 4, 10, 12))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(12)
    })

    test('does not report when expressions is an object (non-array)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression({ type: 'SequenceExpression', expressions: { length: 1, 0: { type: 'Identifier', name: 'x' } }, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-SequenceExpression type BlockStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParenthesesRule.create(context)
      visitor.SequenceExpression({ type: 'BlockStatement', body: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })
  })
})
