import { describe, expect, test, vi } from 'vitest'
import { noTernaryRule } from '../../../../src/rules/patterns/no-ternary.js'
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
    getSource: () => 'x ? a : b',
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

function makeConditionalNode(
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 12,
): unknown {
  return {
    type: 'ConditionalExpression',
    test: { type: 'Identifier', name: 'x' },
    consequent: { type: 'Identifier', name: 'a' },
    alternate: { type: 'Identifier', name: 'b' },
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-ternary rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noTernaryRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noTernaryRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noTernaryRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noTernaryRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noTernaryRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning ternary', () => {
      const desc = noTernaryRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/ternary/)
    })

    test('should have correct docs URL', () => {
      expect(noTernaryRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-ternary',
      )
    })

    test('should have empty schema', () => {
      expect(noTernaryRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with ConditionalExpression', () => {
      const { context } = createMockContext()
      const visitor = noTernaryRule.create(context)
      expect(visitor).toHaveProperty('ConditionalExpression')
      expect(typeof visitor.ConditionalExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noTernaryRule).toBeDefined()
      expect(noTernaryRule.meta).toBeDefined()
      expect(noTernaryRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS TERNARY (30) =====

  describe('positive cases — reports ternary', () => {
    test('reports for simple ConditionalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression(makeConditionalNode())
      expect(reports.length).toBe(1)
    })

    test('reports for ConditionalExpression with Literal consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression({
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'flag' },
        consequent: { type: 'Literal', value: 'yes' },
        alternate: { type: 'Literal', value: 'no' },
        loc: makeLoc(1, 0, 1, 16),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for ConditionalExpression with CallExpression test', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression({
        type: 'ConditionalExpression',
        test: { type: 'CallExpression', callee: {}, arguments: [] },
        consequent: { type: 'Identifier', name: 'a' },
        alternate: { type: 'Identifier', name: 'b' },
        loc: makeLoc(2, 4, 2, 20),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for nested ConditionalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression({
        type: 'ConditionalExpression',
        test: { type: 'ConditionalExpression', test: {}, consequent: {}, alternate: {} },
        consequent: { type: 'Identifier', name: 'a' },
        alternate: { type: 'Identifier', name: 'b' },
        loc: makeLoc(3, 0, 3, 25),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for ConditionalExpression with numeric literal values', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression({
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'check' },
        consequent: { type: 'Literal', value: 1 },
        alternate: { type: 'Literal', value: 0 },
        loc: makeLoc(1, 0, 1, 14),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for ConditionalExpression with BinaryExpression test', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression({
        type: 'ConditionalExpression',
        test: { type: 'BinaryExpression', operator: '>', left: {}, right: {} },
        consequent: { type: 'Identifier', name: 'big' },
        alternate: { type: 'Identifier', name: 'small' },
        loc: makeLoc(5, 0, 5, 20),
      })
      expect(reports.length).toBe(1)
    })

    test('report message mentions "Ternary operator is not allowed"', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression(makeConditionalNode())
      expect(reports[0].message).toContain('Ternary operator is not allowed')
    })

    test('report message mentions "if-else"', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression(makeConditionalNode())
      expect(reports[0].message).toContain('if-else')
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression(makeConditionalNode())
      expect(reports[0].message).toBe(
        'Ternary operator is not allowed. Use if-else statements instead.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression(makeConditionalNode())
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression(makeConditionalNode())
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input ConditionalExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      const node = makeConditionalNode()
      visitor.ConditionalExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression(makeConditionalNode(5, 10, 5, 25))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report loc end values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression(makeConditionalNode(3, 2, 7, 15))
      expect(reports[0].loc?.end.line).toBe(7)
      expect(reports[0].loc?.end.column).toBe(15)
    })

    test('reports for ConditionalExpression at start of file', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression(makeConditionalNode(1, 0, 1, 12))
      expect(reports.length).toBe(1)
    })

    test('reports for ConditionalExpression at end of file', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression(makeConditionalNode(100, 0, 100, 15))
      expect(reports.length).toBe(1)
    })

    test('reports for ConditionalExpression spanning multiple lines', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression(makeConditionalNode(1, 0, 3, 5))
      expect(reports.length).toBe(1)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression(makeConditionalNode())
      visitor.ConditionalExpression(makeConditionalNode())
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression(makeConditionalNode())
      visitor.ConditionalExpression(makeConditionalNode(2, 0, 2, 12))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for ConditionalExpression with MemberExpression test', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression({
        type: 'ConditionalExpression',
        test: { type: 'MemberExpression', object: {}, property: {} },
        consequent: { type: 'Identifier', name: 'a' },
        alternate: { type: 'Identifier', name: 'b' },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for ConditionalExpression with LogicalExpression test', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression({
        type: 'ConditionalExpression',
        test: { type: 'LogicalExpression', operator: '&&', left: {}, right: {} },
        consequent: { type: 'Identifier', name: 'a' },
        alternate: { type: 'Identifier', name: 'b' },
        loc: makeLoc(1, 0, 1, 22),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for ConditionalExpression with UnaryExpression test', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression({
        type: 'ConditionalExpression',
        test: { type: 'UnaryExpression', operator: '!', prefix: true, argument: {} },
        consequent: { type: 'Identifier', name: 'a' },
        alternate: { type: 'Identifier', name: 'b' },
        loc: makeLoc(1, 0, 1, 14),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for ConditionalExpression with ArrowFunctionExpression consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression({
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'flag' },
        consequent: { type: 'ArrowFunctionExpression', params: [], body: {} },
        alternate: { type: 'Identifier', name: 'b' },
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for ConditionalExpression with ArrayExpression alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression({
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'flag' },
        consequent: { type: 'Identifier', name: 'a' },
        alternate: { type: 'ArrayExpression', elements: [] },
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for ConditionalExpression with ObjectExpression alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression({
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'flag' },
        consequent: { type: 'Identifier', name: 'a' },
        alternate: { type: 'ObjectExpression', properties: [] },
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for ConditionalExpression with boolean literal test', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression({
        type: 'ConditionalExpression',
        test: { type: 'Literal', value: true },
        consequent: { type: 'Literal', value: 'yes' },
        alternate: { type: 'Literal', value: 'no' },
        loc: makeLoc(1, 0, 1, 16),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for ConditionalExpression with TemplateLiteral consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression({
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'flag' },
        consequent: { type: 'TemplateLiteral', quasis: [], expressions: [] },
        alternate: { type: 'Literal', value: '' },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for ConditionalExpression with null alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression({
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'flag' },
        consequent: { type: 'Identifier', name: 'a' },
        alternate: { type: 'Literal', value: null },
        loc: makeLoc(1, 0, 1, 18),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for ConditionalExpression with FunctionExpression consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression({
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'flag' },
        consequent: { type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } },
        alternate: { type: 'Identifier', name: 'b' },
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for ConditionalExpression with NewExpression consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression({
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'flag' },
        consequent: { type: 'NewExpression', callee: {}, arguments: [] },
        alternate: { type: 'Identifier', name: 'b' },
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (35) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression({ type: 'Literal', value: 'test', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      expect(() => visitor.ConditionalExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      expect(() => visitor.ConditionalExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      expect(() => visitor.ConditionalExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      expect(() => visitor.ConditionalExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      expect(() => visitor.ConditionalExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean node', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      expect(() => visitor.ConditionalExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      expect(() => visitor.ConditionalExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression({ type: 'MemberExpression', object: {}, property: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrowFunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression({ type: 'ExpressionStatement', expression: {}, loc: makeLoc(1, 0, 1, 1) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BlockStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression({ type: 'BlockStatement', body: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ObjectExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression({ type: 'ObjectExpression', properties: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrayExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression({ type: 'ArrayExpression', elements: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for LogicalExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression({ type: 'LogicalExpression', operator: '&&', left: {}, right: {}, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for AssignmentExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression({ type: 'AssignmentExpression', operator: '=', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UpdateExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression({ type: 'UpdateExpression', operator: '++', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for NewExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression({ type: 'NewExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for TemplateLiteral node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression({ type: 'TemplateLiteral', quasis: [], expressions: [], loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ThrowStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression({ type: 'ThrowStatement', argument: {}, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for TryStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression({ type: 'TryStatement', block: {}, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for WhileStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression({ type: 'WhileStatement', test: {}, body: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ForStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression({ type: 'ForStatement', init: null, test: null, update: null, body: {}, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for SwitchStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression({ type: 'SwitchStatement', discriminant: {}, cases: [], loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BreakStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression({ type: 'BreakStatement', label: null, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ContinueStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression({ type: 'ContinueStatement', label: null, loc: makeLoc(1, 0, 1, 9) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ConditionalExpression with wrong case "conditionalexpression"', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression({ type: 'conditionalexpression', loc: makeLoc(1, 0, 1, 12) })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noTernaryRule.create(ctx1)
      const visitor2 = noTernaryRule.create(ctx2)
      visitor1.ConditionalExpression(makeConditionalNode())
      visitor2.ConditionalExpression({ type: 'Identifier', name: 'x', loc: makeLoc(1, 0, 1, 1) })
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression(makeConditionalNode())
      visitor.ConditionalExpression({ type: 'Identifier', name: 'x', loc: makeLoc(1, 0, 1, 1) })
      visitor.ConditionalExpression(makeConditionalNode(2, 0, 2, 12))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      const node = { type: 'ConditionalExpression', test: {}, consequent: {}, alternate: {} }
      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      const node = { type: 'ConditionalExpression', test: {}, consequent: {}, alternate: {} }
      visitor.ConditionalExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression({ type: 'Identifier', name: 'x', loc: makeLoc(1, 0, 1, 1) })
      visitor.ConditionalExpression(makeConditionalNode())
      visitor.ConditionalExpression({ type: 'Literal', value: 42, loc: makeLoc(1, 0, 1, 2) })
      visitor.ConditionalExpression(makeConditionalNode(2, 0, 2, 12))
      visitor.ConditionalExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noTernaryRule.create(context)
      const visitor2 = noTernaryRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noTernaryRule.meta
      const meta2 = noTernaryRule.meta
      expect(meta1).toBe(meta2)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression(makeConditionalNode())
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      const node = {
        type: 'ConditionalExpression',
        test: {},
        consequent: {},
        alternate: {},
        loc: makeLoc(1, 0, 1, 12),
        range: [0, 12],
        extra: true,
        _parent: {},
      }
      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression({ type: 'ConditionalExpression', test: {}, consequent: {}, alternate: {}, loc: {} })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression({ type: 'ConditionalExpression', test: {}, consequent: {}, alternate: {}, loc: { start: { line: 3, column: 5 } } })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      const node = makeConditionalNode()
      visitor.ConditionalExpression(node)
      visitor.ConditionalExpression(node)
      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noTernaryRule).toBeDefined()
      expect(typeof noTernaryRule.create).toBe('function')
      expect(typeof noTernaryRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression({ type: 'ConditionalExpression', test: {}, consequent: {}, alternate: {}, loc: makeLoc(1, 0, 1, 12), _parent: { type: 'VariableDeclarator' } })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression(makeConditionalNode())
      visitor.ConditionalExpression(makeConditionalNode(2, 0, 2, 12))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression(makeConditionalNode(10, 4, 10, 20))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(20)
    })

    test('does not report for node with type undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression({ loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for node with type null', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression({ type: null, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for node with numeric type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression({ type: 42, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for node with type as empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noTernaryRule.create(context)
      visitor.ConditionalExpression({ type: '', loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })
  })
})
