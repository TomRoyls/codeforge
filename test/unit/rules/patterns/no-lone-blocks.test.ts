import { describe, expect, test, vi } from 'vitest'
import { noLoneBlocksRule } from '../../../../src/rules/patterns/no-lone-blocks.js'
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
    getSource: () => '{}',
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

function makeBlockNode(
  parentType: string,
  body: unknown[] = [],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 2,
): unknown {
  return {
    type: 'BlockStatement',
    _parent: { type: parentType },
    body,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-lone-blocks rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noLoneBlocksRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noLoneBlocksRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noLoneBlocksRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noLoneBlocksRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noLoneBlocksRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning blocks', () => {
      const desc = noLoneBlocksRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/block/)
    })

    test('should have correct docs URL', () => {
      expect(noLoneBlocksRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-lone-blocks',
      )
    })

    test('should have empty schema', () => {
      expect(noLoneBlocksRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with BlockStatement', () => {
      const { context } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      expect(visitor).toHaveProperty('BlockStatement')
      expect(typeof visitor.BlockStatement).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noLoneBlocksRule).toBeDefined()
      expect(noLoneBlocksRule.meta).toBeDefined()
      expect(noLoneBlocksRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS EMPTY LONE BLOCK (30) =====

  describe('positive cases — reports empty lone block', () => {
    test('reports for empty block with ExpressionStatement parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement(makeBlockNode('ExpressionStatement'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty block with LabeledStatement parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement(makeBlockNode('LabeledStatement'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty block with Program parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement(makeBlockNode('Program'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty block with DoWhileStatement parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement(makeBlockNode('DoWhileStatement'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty block with VariableDeclaration parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement(makeBlockNode('VariableDeclaration'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty block with BlockStatement parent (nested)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement(makeBlockNode('BlockStatement'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty block with AssignmentExpression parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement(makeBlockNode('AssignmentExpression'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty block with ConditionalExpression parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement(makeBlockNode('ConditionalExpression'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty block with LogicalExpression parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement(makeBlockNode('LogicalExpression'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty block with BinaryExpression parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement(makeBlockNode('BinaryExpression'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty block with UnaryExpression parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement(makeBlockNode('UnaryExpression'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty block with UpdateExpression parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement(makeBlockNode('UpdateExpression'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty block with NewExpression parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement(makeBlockNode('NewExpression'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty block with CallExpression parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement(makeBlockNode('CallExpression'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty block with MemberExpression parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement(makeBlockNode('MemberExpression'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty block with WithStatement parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement(makeBlockNode('WithStatement'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty block with ThrowStatement parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement(makeBlockNode('ThrowStatement'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty block with ReturnStatement parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement(makeBlockNode('ReturnStatement'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty block with YieldExpression parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement(makeBlockNode('YieldExpression'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty block with unknown parent type', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement(makeBlockNode('SomeUnknownType'))
      expect(reports.length).toBe(1)
    })

    test('report message mentions "Empty block statement"', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement(makeBlockNode('ExpressionStatement'))
      expect(reports[0].message).toContain('Empty block statement')
    })

    test('report message mentions "Remove or add content"', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement(makeBlockNode('ExpressionStatement'))
      expect(reports[0].message).toContain('Remove or add content')
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement(makeBlockNode('ExpressionStatement'))
      expect(reports[0].message).toBe('Empty block statement. Remove or add content.')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement(makeBlockNode('ExpressionStatement'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement(makeBlockNode('ExpressionStatement'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input node', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      const node = makeBlockNode('ExpressionStatement')
      visitor.BlockStatement(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement(makeBlockNode('ExpressionStatement', [], 5, 10, 5, 20))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement(makeBlockNode('ExpressionStatement'))
      visitor.BlockStatement(makeBlockNode('LabeledStatement'))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement(makeBlockNode('ExpressionStatement'))
      visitor.BlockStatement(makeBlockNode('Program'))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for empty block with SequenceExpression parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement(makeBlockNode('SequenceExpression'))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (35) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement(null)
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement(undefined)
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement({})
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement('not a node')
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement(42)
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean node', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement(true)
      expect(reports.length).toBe(0)
    })

    test('does not report for array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement([])
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement({ type: 'Literal', value: 42, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionDeclaration parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement(makeBlockNode('FunctionDeclaration'))
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement(makeBlockNode('FunctionExpression'))
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrowFunctionExpression parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement(makeBlockNode('ArrowFunctionExpression'))
      expect(reports.length).toBe(0)
    })

    test('does not report for MethodDefinition parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement(makeBlockNode('MethodDefinition'))
      expect(reports.length).toBe(0)
    })

    test('does not report for CatchClause parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement(makeBlockNode('CatchClause'))
      expect(reports.length).toBe(0)
    })

    test('does not report for TryStatement parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement(makeBlockNode('TryStatement'))
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement(makeBlockNode('IfStatement'))
      expect(reports.length).toBe(0)
    })

    test('does not report for WhileStatement parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement(makeBlockNode('WhileStatement'))
      expect(reports.length).toBe(0)
    })

    test('does not report for ForStatement parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement(makeBlockNode('ForStatement'))
      expect(reports.length).toBe(0)
    })

    test('does not report for ForInStatement parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement(makeBlockNode('ForInStatement'))
      expect(reports.length).toBe(0)
    })

    test('does not report for ForOfStatement parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement(makeBlockNode('ForOfStatement'))
      expect(reports.length).toBe(0)
    })

    test('does not report for SwitchStatement parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement(makeBlockNode('SwitchStatement'))
      expect(reports.length).toBe(0)
    })

    test('does not report for ClassBody parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement(makeBlockNode('ClassBody'))
      expect(reports.length).toBe(0)
    })

    test('does not report for block with content (non-empty body)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement(makeBlockNode('ExpressionStatement', [{ type: 'ExpressionStatement' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for block with single statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement(makeBlockNode('ExpressionStatement', [{ type: 'ReturnStatement' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for block with multiple statements', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement(makeBlockNode('ExpressionStatement', [
        { type: 'VariableDeclaration' },
        { type: 'ExpressionStatement' },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report for block without _parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for block with null _parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement({
        type: 'BlockStatement',
        _parent: null,
        body: [],
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for block with string _parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement({
        type: 'BlockStatement',
        _parent: 'something',
        body: [],
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for block with number _parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement({
        type: 'BlockStatement',
        _parent: 42,
        body: [],
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionDeclaration parent with empty body', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement({
        type: 'BlockStatement',
        _parent: { type: 'FunctionDeclaration', id: null, params: [] },
        body: [],
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for CatchClause parent with empty body', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement({
        type: 'BlockStatement',
        _parent: { type: 'CatchClause', param: null },
        body: [],
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement parent with empty body', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement({
        type: 'BlockStatement',
        _parent: { type: 'IfStatement', test: {}, consequent: {} },
        body: [],
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for WhileStatement parent with empty body', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement({
        type: 'BlockStatement',
        _parent: { type: 'WhileStatement', test: {} },
        body: [],
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ForStatement parent with empty body', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement({
        type: 'BlockStatement',
        _parent: { type: 'ForStatement', init: null, test: null, update: null },
        body: [],
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for SwitchStatement parent with empty body', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement({
        type: 'BlockStatement',
        _parent: { type: 'SwitchStatement', discriminant: {}, cases: [] },
        body: [],
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noLoneBlocksRule.create(ctx1)
      const visitor2 = noLoneBlocksRule.create(ctx2)
      visitor1.BlockStatement(makeBlockNode('ExpressionStatement'))
      visitor2.BlockStatement(makeBlockNode('FunctionDeclaration'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement(makeBlockNode('ExpressionStatement'))
      visitor.BlockStatement(makeBlockNode('FunctionDeclaration'))
      visitor.BlockStatement(makeBlockNode('LabeledStatement'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement({
        type: 'BlockStatement',
        _parent: { type: 'ExpressionStatement' },
        body: [],
      })
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement({
        type: 'BlockStatement',
        _parent: { type: 'ExpressionStatement' },
        body: [],
      })
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement(makeBlockNode('FunctionDeclaration'))
      visitor.BlockStatement(makeBlockNode('ExpressionStatement'))
      visitor.BlockStatement(makeBlockNode('IfStatement'))
      visitor.BlockStatement(makeBlockNode('LabeledStatement'))
      visitor.BlockStatement(makeBlockNode('WhileStatement'))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noLoneBlocksRule.create(context)
      const visitor2 = noLoneBlocksRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noLoneBlocksRule.meta
      const meta2 = noLoneBlocksRule.meta
      expect(meta1).toBe(meta2)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement(makeBlockNode('ExpressionStatement'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement({
        type: 'BlockStatement',
        _parent: { type: 'ExpressionStatement', expression: {} },
        body: [],
        loc: makeLoc(1, 0, 1, 2),
        range: [0, 2],
        extra: true,
        leadingComments: [],
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement({
        type: 'BlockStatement',
        _parent: { type: 'ExpressionStatement' },
        body: [],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement({
        type: 'BlockStatement',
        _parent: { type: 'ExpressionStatement' },
        body: [],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      const node = makeBlockNode('ExpressionStatement')
      visitor.BlockStatement(node)
      visitor.BlockStatement(node)
      visitor.BlockStatement(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noLoneBlocksRule).toBeDefined()
      expect(typeof noLoneBlocksRule.create).toBe('function')
      expect(typeof noLoneBlocksRule.meta).toBe('object')
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement(makeBlockNode('ExpressionStatement'))
      visitor.BlockStatement(makeBlockNode('Program'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('node with _parent that has no type property reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement({
        type: 'BlockStatement',
        _parent: { name: 'something' },
        body: [],
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(1)
    })

    test('handles node where body is string (not array)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement({
        type: 'BlockStatement',
        _parent: { type: 'ExpressionStatement' },
        body: 'not-array',
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(1)
    })

    test('handles node where body is null (not array)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement({
        type: 'BlockStatement',
        _parent: { type: 'ExpressionStatement' },
        body: null,
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(1)
    })

    test('handles node where body is undefined (not array)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement({
        type: 'BlockStatement',
        _parent: { type: 'ExpressionStatement' },
        body: undefined,
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(1)
    })

    test('handles node where body is number (not array)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement({
        type: 'BlockStatement',
        _parent: { type: 'ExpressionStatement' },
        body: 42,
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoneBlocksRule.create(context)
      visitor.BlockStatement(makeBlockNode('ExpressionStatement', [], 10, 4, 10, 20))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(20)
    })
  })
})
