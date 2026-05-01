import { describe, expect, test, vi } from 'vitest'
import { noMeaninglessVoidRule } from '../../../../src/rules/patterns/no-meaningless-void.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
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
    getSource: () => 'void foo()',
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

function makeVoidUnary(
  parent: unknown,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 9,
): unknown {
  return {
    type: 'UnaryExpression',
    operator: 'void',
    prefix: true,
    argument: { type: 'Identifier', name: 'x', loc: makeLoc(1, 5, 1, 6) },
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
    _parent: parent,
  }
}

// ===== META TESTS (8) =====

describe('no-meaningless-void rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noMeaninglessVoidRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noMeaninglessVoidRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noMeaninglessVoidRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noMeaninglessVoidRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noMeaninglessVoidRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning void', () => {
      const desc = noMeaninglessVoidRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/void/)
    })

    test('should have correct docs URL', () => {
      expect(noMeaninglessVoidRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-meaningless-void',
      )
    })

    test('should have empty schema', () => {
      expect(noMeaninglessVoidRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with UnaryExpression', () => {
      const { context } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      expect(visitor).toHaveProperty('UnaryExpression')
      expect(typeof visitor.UnaryExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noMeaninglessVoidRule).toBeDefined()
      expect(noMeaninglessVoidRule.meta).toBeDefined()
      expect(noMeaninglessVoidRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS MEANINGLESS VOID (25) =====

  describe('positive cases — reports meaningless void', () => {
    test('reports void in CallExpression parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      const parent = { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [], loc: makeLoc(1, 0, 1, 12) }
      visitor.UnaryExpression(makeVoidUnary(parent))
      expect(reports.length).toBe(1)
    })

    test('report message mentions "void"', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      const parent = { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [], loc: makeLoc(1, 0, 1, 12) }
      visitor.UnaryExpression(makeVoidUnary(parent))
      expect(reports[0].message.toLowerCase()).toContain('void')
    })

    test('report message mentions "purpose"', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      const parent = { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [], loc: makeLoc(1, 0, 1, 12) }
      visitor.UnaryExpression(makeVoidUnary(parent))
      expect(reports[0].message.toLowerCase()).toContain('purpose')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      const parent = { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [], loc: makeLoc(1, 0, 1, 12) }
      visitor.UnaryExpression(makeVoidUnary(parent))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      const parent = { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [], loc: makeLoc(1, 0, 1, 12) }
      visitor.UnaryExpression(makeVoidUnary(parent))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the UnaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      const parent = { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [], loc: makeLoc(1, 0, 1, 12) }
      const node = makeVoidUnary(parent)
      visitor.UnaryExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('reports void in VariableDeclarator parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      const parent = { type: 'VariableDeclarator', id: { type: 'Identifier', name: 'x' }, loc: makeLoc(1, 0, 1, 12) }
      visitor.UnaryExpression(makeVoidUnary(parent))
      expect(reports.length).toBe(1)
    })

    test('reports void in AssignmentExpression parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      const parent = { type: 'AssignmentExpression', operator: '=', left: { type: 'Identifier', name: 'x' }, right: {}, loc: makeLoc(1, 0, 1, 12) }
      visitor.UnaryExpression(makeVoidUnary(parent))
      expect(reports.length).toBe(1)
    })

    test('reports void in ReturnStatement parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      const parent = { type: 'ReturnStatement', argument: {}, loc: makeLoc(1, 0, 1, 12) }
      visitor.UnaryExpression(makeVoidUnary(parent))
      expect(reports.length).toBe(1)
    })

    test('reports void in ConditionalExpression test parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      const parent = { type: 'ConditionalExpression', test: {}, consequent: {}, alternate: {}, loc: makeLoc(1, 0, 1, 12) }
      visitor.UnaryExpression(makeVoidUnary(parent))
      expect(reports.length).toBe(1)
    })

    test('reports void in BinaryExpression parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      const parent = { type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 12) }
      visitor.UnaryExpression(makeVoidUnary(parent))
      expect(reports.length).toBe(1)
    })

    test('reports void in LogicalExpression parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      const parent = { type: 'LogicalExpression', operator: '&&', left: {}, right: {}, loc: makeLoc(1, 0, 1, 12) }
      visitor.UnaryExpression(makeVoidUnary(parent))
      expect(reports.length).toBe(1)
    })

    test('reports void in ArrowFunctionExpression body parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      const parent = { type: 'ArrowFunctionExpression', params: [], body: {}, loc: makeLoc(1, 0, 1, 15) }
      visitor.UnaryExpression(makeVoidUnary(parent))
      expect(reports.length).toBe(1)
    })

    test('reports void in TemplateLiteral parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      const parent = { type: 'TemplateLiteral', quasis: [], expressions: [], loc: makeLoc(1, 0, 1, 12) }
      visitor.UnaryExpression(makeVoidUnary(parent))
      expect(reports.length).toBe(1)
    })

    test('reports void in ArrayExpression parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      const parent = { type: 'ArrayExpression', elements: [], loc: makeLoc(1, 0, 1, 12) }
      visitor.UnaryExpression(makeVoidUnary(parent))
      expect(reports.length).toBe(1)
    })

    test('reports void in ObjectExpression property value parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      const parent = { type: 'Property', key: { type: 'Identifier', name: 'a' }, value: {}, kind: 'init', loc: makeLoc(1, 0, 1, 12) }
      visitor.UnaryExpression(makeVoidUnary(parent))
      expect(reports.length).toBe(1)
    })

    test('reports void in NewExpression parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      const parent = { type: 'NewExpression', callee: { type: 'Identifier', name: 'Fn' }, arguments: [], loc: makeLoc(1, 0, 1, 12) }
      visitor.UnaryExpression(makeVoidUnary(parent))
      expect(reports.length).toBe(1)
    })

    test('reports void in MemberExpression parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      const parent = { type: 'MemberExpression', object: {}, property: { type: 'Identifier', name: 'prop' }, loc: makeLoc(1, 0, 1, 12) }
      visitor.UnaryExpression(makeVoidUnary(parent))
      expect(reports.length).toBe(1)
    })

    test('reports void in IfStatement test parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      const parent = { type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 12) }
      visitor.UnaryExpression(makeVoidUnary(parent))
      expect(reports.length).toBe(1)
    })

    test('reports void in WhileStatement test parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      const parent = { type: 'WhileStatement', test: {}, body: {}, loc: makeLoc(1, 0, 1, 12) }
      visitor.UnaryExpression(makeVoidUnary(parent))
      expect(reports.length).toBe(1)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      const parent1 = { type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) }
      const parent2 = { type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(2, 0, 2, 5) }
      visitor.UnaryExpression(makeVoidUnary(parent1))
      visitor.UnaryExpression(makeVoidUnary(parent2))
      expect(reports.length).toBe(2)
    })

    test('report loc reflects the node location', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      const parent = { type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) }
      visitor.UnaryExpression(makeVoidUnary(parent, 3, 5, 3, 14))
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('reports with longer argument expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      const parent = { type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 20) }
      const node = {
        type: 'UnaryExpression',
        operator: 'void',
        prefix: true,
        argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'someVeryLongFunctionName' }, arguments: [] },
        loc: makeLoc(1, 0, 1, 40),
        _parent: parent,
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('message is exactly as defined in the rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      const parent = { type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) }
      visitor.UnaryExpression(makeVoidUnary(parent))
      expect(reports[0].message).toBe(
        "Unexpected 'void' operator. This void expression serves no purpose in this context.",
      )
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      const parent1 = { type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) }
      const parent2 = { type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(2, 0, 2, 5) }
      visitor.UnaryExpression(makeVoidUnary(parent1))
      visitor.UnaryExpression(makeVoidUnary(parent2))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for ExpressionStatement parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      const parent = { type: 'ExpressionStatement', expression: {}, loc: makeLoc(1, 0, 1, 5) }
      visitor.UnaryExpression(makeVoidUnary(parent))
      expect(reports.length).toBe(0)
    })

    test('does not report for SequenceExpression parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      const parent = { type: 'SequenceExpression', expressions: [], loc: makeLoc(1, 0, 1, 5) }
      visitor.UnaryExpression(makeVoidUnary(parent))
      expect(reports.length).toBe(0)
    })

    test('does not report for non-void operator "!"', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      const parent = { type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) }
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
        argument: { type: 'Identifier', name: 'x', loc: makeLoc(1, 1, 1, 2) },
        loc: makeLoc(1, 0, 1, 2),
        _parent: parent,
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-void operator "-"', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      const parent = { type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) }
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: '-',
        prefix: true,
        argument: { type: 'Identifier', name: 'x', loc: makeLoc(1, 1, 1, 2) },
        loc: makeLoc(1, 0, 1, 2),
        _parent: parent,
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-void operator "+"', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      const parent = { type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) }
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: '+',
        prefix: true,
        argument: { type: 'Identifier', name: 'x', loc: makeLoc(1, 1, 1, 2) },
        loc: makeLoc(1, 0, 1, 2),
        _parent: parent,
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-void operator "~"', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      const parent = { type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) }
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: '~',
        prefix: true,
        argument: { type: 'Identifier', name: 'x', loc: makeLoc(1, 1, 1, 2) },
        loc: makeLoc(1, 0, 1, 2),
        _parent: parent,
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-void operator "typeof"', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      const parent = { type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) }
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'typeof',
        prefix: true,
        argument: { type: 'Identifier', name: 'x', loc: makeLoc(1, 1, 1, 2) },
        loc: makeLoc(1, 0, 1, 2),
        _parent: parent,
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-void operator "delete"', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      const parent = { type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) }
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'delete',
        prefix: true,
        argument: { type: 'Identifier', name: 'x', loc: makeLoc(1, 1, 1, 2) },
        loc: makeLoc(1, 0, 1, 2),
        _parent: parent,
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      expect(() => visitor.UnaryExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      expect(() => visitor.UnaryExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      expect(() => visitor.UnaryExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      visitor.UnaryExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      visitor.UnaryExpression({ type: 'Literal', value: 42, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      visitor.UnaryExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      visitor.UnaryExpression({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      visitor.UnaryExpression({ type: 'MemberExpression', object: {}, property: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      visitor.UnaryExpression({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrowFunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      visitor.UnaryExpression({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      visitor.UnaryExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      visitor.UnaryExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      visitor.UnaryExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BlockStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      visitor.UnaryExpression({ type: 'BlockStatement', body: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ObjectExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      visitor.UnaryExpression({ type: 'ObjectExpression', properties: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrayExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      visitor.UnaryExpression({ type: 'ArrayExpression', elements: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ConditionalExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      visitor.UnaryExpression({ type: 'ConditionalExpression', test: {}, consequent: {}, alternate: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for NewExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      visitor.UnaryExpression({ type: 'NewExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 8) })
      expect(reports.length).toBe(0)
    })

    test('does not report for AssignmentExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      visitor.UnaryExpression({ type: 'AssignmentExpression', operator: '=', left: {}, right: {}, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      expect(() => visitor.UnaryExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      expect(() => visitor.UnaryExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      expect(() => visitor.UnaryExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when _parent is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'void',
        prefix: true,
        argument: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when _parent is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'void',
        prefix: true,
        argument: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 5),
        _parent: null,
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when _parent is a non-object string', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'void',
        prefix: true,
        argument: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 5),
        _parent: 'string',
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when _parent is a non-object number', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'void',
        prefix: true,
        argument: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 5),
        _parent: 123,
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for void operator without _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'void',
        prefix: true,
        argument: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('reports when _parent object has no type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      visitor.UnaryExpression(makeVoidUnary({ name: 'noType' }))
      expect(reports.length).toBe(1)
    })

    test('does not report when _parent type is ExpressionStatement with expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      const parent = { type: 'ExpressionStatement', expression: { type: 'Literal', value: 0 }, loc: makeLoc(1, 0, 1, 5) }
      visitor.UnaryExpression(makeVoidUnary(parent))
      expect(reports.length).toBe(0)
    })

    test('does not report when _parent type is SequenceExpression with expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      const parent = { type: 'SequenceExpression', expressions: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }], loc: makeLoc(1, 0, 1, 5) }
      visitor.UnaryExpression(makeVoidUnary(parent))
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node with wrong type string', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      visitor.UnaryExpression({ type: 'StringLiteral', value: 'test', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node with operator missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      visitor.UnaryExpression({ type: 'UnaryExpression', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 5), _parent: { type: 'CallExpression' } })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noMeaninglessVoidRule.create(ctx1)
      const visitor2 = noMeaninglessVoidRule.create(ctx2)
      const parent1 = { type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) }
      visitor1.UnaryExpression(makeVoidUnary(parent1))
      visitor2.UnaryExpression({ type: 'Identifier', name: 'x', loc: makeLoc(1, 0, 1, 1) })
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      const parent1 = { type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) }
      visitor.UnaryExpression(makeVoidUnary(parent1))
      visitor.UnaryExpression({ type: 'Identifier', name: 'x', loc: makeLoc(1, 0, 1, 1) })
      const parent2 = { type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(2, 0, 2, 5) }
      visitor.UnaryExpression(makeVoidUnary(parent2))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      const parent = { type: 'CallExpression', callee: {}, arguments: [] }
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'void',
        prefix: true,
        argument: { type: 'Identifier', name: 'x' },
        _parent: parent,
      })
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      const parent = { type: 'CallExpression', callee: {}, arguments: [] }
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'void',
        prefix: true,
        argument: { type: 'Identifier', name: 'x' },
        _parent: parent,
      })
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      const parentExpr = { type: 'ExpressionStatement', expression: {}, loc: makeLoc(1, 0, 1, 5) }
      visitor.UnaryExpression(makeVoidUnary(parentExpr))
      const parentCall = { type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(2, 0, 2, 5) }
      visitor.UnaryExpression(makeVoidUnary(parentCall))
      const parentSeq = { type: 'SequenceExpression', expressions: [], loc: makeLoc(3, 0, 3, 5) }
      visitor.UnaryExpression(makeVoidUnary(parentSeq))
      const parentBin = { type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(4, 0, 4, 5) }
      visitor.UnaryExpression(makeVoidUnary(parentBin))
      const parentCond = { type: 'ConditionalExpression', test: {}, consequent: {}, alternate: {}, loc: makeLoc(5, 0, 5, 5) }
      visitor.UnaryExpression(makeVoidUnary(parentCond))
      expect(reports.length).toBe(3)
    })

    test('create returns a new visitor each call (not same reference)', () => {
      const { context } = createMockContext()
      const visitor1 = noMeaninglessVoidRule.create(context)
      const visitor2 = noMeaninglessVoidRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noMeaninglessVoidRule.meta
      const meta2 = noMeaninglessVoidRule.meta
      expect(meta1).toBe(meta2)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      const parent = { type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) }
      visitor.UnaryExpression(makeVoidUnary(parent))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      const parent = { type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5), range: [0, 5], extra: true }
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'void',
        prefix: true,
        argument: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 9),
        range: [0, 9],
        extra: true,
        _parent: parent,
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      const parent = { type: 'CallExpression', callee: {}, arguments: [] }
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'void',
        prefix: true,
        argument: { type: 'Identifier', name: 'x' },
        loc: {},
        _parent: parent,
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      const parent = { type: 'CallExpression', callee: {}, arguments: [] }
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'void',
        prefix: true,
        argument: { type: 'Identifier', name: 'x' },
        loc: { start: { line: 3, column: 5 } },
        _parent: parent,
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      const parent = { type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) }
      const node = makeVoidUnary(parent)
      visitor.UnaryExpression(node)
      visitor.UnaryExpression(node)
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule name is exported correctly', () => {
      expect(noMeaninglessVoidRule).toBeDefined()
      expect(typeof noMeaninglessVoidRule.create).toBe('function')
      expect(typeof noMeaninglessVoidRule.meta).toBe('object')
    })

    test('reports only once per node for same void', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      const parent = { type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) }
      visitor.UnaryExpression(makeVoidUnary(parent))
      expect(reports.length).toBe(1)
    })

    test('handles node where _parent is a plain object with no type and reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      visitor.UnaryExpression(makeVoidUnary({ foo: 'bar' }))
      expect(reports.length).toBe(1)
    })

    test('location with specific line/column values preserved', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      const parent = { type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(10, 4, 10, 12) }
      visitor.UnaryExpression(makeVoidUnary(parent, 10, 4, 10, 14))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(14)
    })

    test('does not report when _parent is ExpressionStatement even with other properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      const parent = { type: 'ExpressionStatement', expression: {}, directive: 'use strict', loc: makeLoc(1, 0, 1, 5), trailingComments: [] }
      visitor.UnaryExpression(makeVoidUnary(parent))
      expect(reports.length).toBe(0)
    })

    test('does not report when _parent is SequenceExpression even with expressions array', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      const parent = { type: 'SequenceExpression', expressions: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }], loc: makeLoc(1, 0, 1, 10) }
      visitor.UnaryExpression(makeVoidUnary(parent))
      expect(reports.length).toBe(0)
    })

    test('handles void in ForStatement init parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      const parent = { type: 'ForStatement', init: {}, test: {}, update: {}, body: {}, loc: makeLoc(1, 0, 1, 20) }
      visitor.UnaryExpression(makeVoidUnary(parent))
      expect(reports.length).toBe(1)
    })

    test('handles void in SwitchStatement discriminant parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noMeaninglessVoidRule.create(context)
      const parent = { type: 'SwitchStatement', discriminant: {}, cases: [], loc: makeLoc(1, 0, 1, 20) }
      visitor.UnaryExpression(makeVoidUnary(parent))
      expect(reports.length).toBe(1)
    })
  })
})
