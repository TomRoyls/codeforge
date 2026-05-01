import { describe, expect, test, vi } from 'vitest'
import { strictBoolExpressionsRule } from '../../../../src/rules/patterns/strict-bool-expressions.js'
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
    getSource: () => 'if (x) {}',
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

function makeIfNode(
  testNode: unknown,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 10,
): unknown {
  return {
    type: 'IfStatement',
    test: testNode,
    consequent: { type: 'BlockStatement', body: [] },
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

describe('strict-bool-expressions rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(strictBoolExpressionsRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(strictBoolExpressionsRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(strictBoolExpressionsRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(strictBoolExpressionsRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(strictBoolExpressionsRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning boolean', () => {
      const desc = strictBoolExpressionsRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/boolean/)
    })

    test('should have correct docs URL', () => {
      expect(strictBoolExpressionsRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/strict-bool-expressions',
      )
    })
  })

  describe('structure', () => {
    test('create() returns visitor with IfStatement', () => {
      const { context } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      expect(visitor).toHaveProperty('IfStatement')
      expect(typeof visitor.IfStatement).toBe('function')
    })

    test('default export matches named export', () => {
      expect(strictBoolExpressionsRule).toBeDefined()
      expect(strictBoolExpressionsRule.meta).toBeDefined()
      expect(strictBoolExpressionsRule.create).toBeDefined()
    })

    test('rule exports are correct', () => {
      expect(typeof strictBoolExpressionsRule.create).toBe('function')
      expect(typeof strictBoolExpressionsRule.meta).toBe('object')
    })
  })

  // ===== POSITIVE CASES — REPORTS NON-BOOLEAN TEST (38) =====

  describe('positive cases — reports non-boolean test types', () => {
    test('reports for Identifier test', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'Identifier', name: 'x', loc: makeLoc(1, 4, 1, 5) }))
      expect(reports.length).toBe(1)
    })

    test('reports for MemberExpression test', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' }, loc: makeLoc(1, 4, 1, 11) }))
      expect(reports.length).toBe(1)
    })

    test('reports for AssignmentExpression test', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'AssignmentExpression', operator: '=', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: 1 }, loc: makeLoc(1, 4, 1, 9) }))
      expect(reports.length).toBe(1)
    })

    test('reports for SequenceExpression test', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'SequenceExpression', expressions: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }], loc: makeLoc(1, 4, 1, 9) }))
      expect(reports.length).toBe(1)
    })

    test('reports for ConditionalExpression test', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'a' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 0 }, loc: makeLoc(1, 4, 1, 15) }))
      expect(reports.length).toBe(1)
    })

    test('reports for ArrayExpression test', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'ArrayExpression', elements: [], loc: makeLoc(1, 4, 1, 6) }))
      expect(reports.length).toBe(1)
    })

    test('reports for ObjectExpression test', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'ObjectExpression', properties: [], loc: makeLoc(1, 4, 1, 6) }))
      expect(reports.length).toBe(1)
    })

    test('reports for TemplateLiteral test', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'TemplateLiteral', quasis: [], expressions: [], loc: makeLoc(1, 4, 1, 10) }))
      expect(reports.length).toBe(1)
    })

    test('reports for NewExpression test', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Foo' }, arguments: [], loc: makeLoc(1, 4, 1, 12) }))
      expect(reports.length).toBe(1)
    })

    test('reports for FunctionExpression test', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 4, 1, 20) }))
      expect(reports.length).toBe(1)
    })

    test('reports for ArrowFunctionExpression test', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 4, 1, 15) }))
      expect(reports.length).toBe(1)
    })

    test('reports for UpdateExpression test', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'UpdateExpression', operator: '++', prefix: true, argument: { type: 'Identifier', name: 'x' }, loc: makeLoc(1, 4, 1, 7) }))
      expect(reports.length).toBe(1)
    })

    test('reports for ThisExpression test', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'ThisExpression', loc: makeLoc(1, 4, 1, 8) }))
      expect(reports.length).toBe(1)
    })

    test('reports for YieldExpression test', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'YieldExpression', argument: null, loc: makeLoc(1, 4, 1, 10) }))
      expect(reports.length).toBe(1)
    })

    test('reports for AwaitExpression test', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'AwaitExpression', argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }, loc: makeLoc(1, 4, 1, 12) }))
      expect(reports.length).toBe(1)
    })

    test('reports for TaggedTemplateExpression test', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'TaggedTemplateExpression', tag: { type: 'Identifier', name: 'tag' }, quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] }, loc: makeLoc(1, 4, 1, 10) }))
      expect(reports.length).toBe(1)
    })

    test('reports for Super test', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'Super', loc: makeLoc(1, 4, 1, 9) }))
      expect(reports.length).toBe(1)
    })

    test('reports for MetaProperty test', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'MetaProperty', meta: { type: 'Identifier', name: 'new' }, property: { type: 'Identifier', name: 'target' }, loc: makeLoc(1, 4, 1, 14) }))
      expect(reports.length).toBe(1)
    })

    test('reports for ClassExpression test', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'ClassExpression', id: null, superClass: null, body: { type: 'ClassBody', body: [] }, loc: makeLoc(1, 4, 1, 15) }))
      expect(reports.length).toBe(1)
    })

    test('report message is exactly correct', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'Identifier', name: 'x', loc: makeLoc(1, 4, 1, 5) }))
      expect(reports[0].message).toBe('Use explicit boolean comparison in condition.')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'Identifier', name: 'x', loc: makeLoc(1, 4, 1, 5) }))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'Identifier', name: 'x', loc: makeLoc(1, 4, 1, 5) }))
      expect(reports[0].node).toBeDefined()
    })

    test('report node is the test node, not the IfStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      const testNode = { type: 'Identifier', name: 'x', loc: makeLoc(1, 4, 1, 5) }
      visitor.IfStatement(makeIfNode(testNode))
      expect(reports[0].node).toBe(testNode)
    })

    test('report loc reflects test node location', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'Identifier', name: 'x', loc: makeLoc(5, 10, 5, 11) }))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'Identifier', name: 'x', loc: makeLoc(1, 4, 1, 5) }))
      visitor.IfStatement(makeIfNode({ type: 'Identifier', name: 'y', loc: makeLoc(2, 4, 2, 5) }))
      expect(reports.length).toBe(2)
    })

    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = strictBoolExpressionsRule.create(ctx1)
      const visitor2 = strictBoolExpressionsRule.create(ctx2)
      visitor1.IfStatement(makeIfNode({ type: 'Identifier', name: 'x', loc: makeLoc(1, 4, 1, 5) }))
      visitor2.IfStatement(makeIfNode({ type: 'Literal', value: true, loc: makeLoc(1, 4, 1, 8) }))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('handles IfStatement without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement({ type: 'IfStatement', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'BlockStatement', body: [] } })
      expect(reports.length).toBe(1)
    })

    test('handles test node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'Identifier', name: 'x' }))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement({
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'x', loc: makeLoc(1, 4, 1, 5), range: [4, 5], extra: true },
        consequent: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 10),
        alternate: null,
      })
      expect(reports.length).toBe(1)
    })

    test('reports for ImportExpression test', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'ImportExpression', source: { type: 'Literal', value: './mod' }, loc: makeLoc(1, 4, 1, 16) }))
      expect(reports.length).toBe(1)
    })

    test('reports for ChainExpression test', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'ChainExpression', expression: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' }, optional: true }, loc: makeLoc(1, 4, 1, 12) }))
      expect(reports.length).toBe(1)
    })

    test('reports for TypeCastExpression test', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'TypeCastExpression', expression: { type: 'Identifier', name: 'x' }, typeAnnotation: {}, loc: makeLoc(1, 4, 1, 12) }))
      expect(reports.length).toBe(1)
    })

    test('reports for EmptyExpression test', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'EmptyExpression', loc: makeLoc(1, 4, 1, 5) }))
      expect(reports.length).toBe(1)
    })

    test('reports for SpreadElement test type', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' }, loc: makeLoc(1, 4, 1, 9) }))
      expect(reports.length).toBe(1)
    })

    test('reports for RegExpLiteral test type', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'RegExpLiteral', regex: { pattern: 'abc', flags: '' }, loc: makeLoc(1, 4, 1, 8) }))
      expect(reports.length).toBe(1)
    })

    test('reports for BigIntLiteral test type', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'BigIntLiteral', value: '123', loc: makeLoc(1, 4, 1, 8) }))
      expect(reports.length).toBe(1)
    })

    test('reports for OptionalCallExpression test', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'OptionalCallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [], optional: true, loc: makeLoc(1, 4, 1, 9) }))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (32) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Literal test (string)', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'Literal', value: 'hello', loc: makeLoc(1, 4, 1, 11) }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal test (number)', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'Literal', value: 42, loc: makeLoc(1, 4, 1, 6) }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal test (null)', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'Literal', value: null, loc: makeLoc(1, 4, 1, 8) }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal test (boolean true)', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'Literal', value: true, loc: makeLoc(1, 4, 1, 8) }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal test (boolean false)', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'Literal', value: false, loc: makeLoc(1, 4, 1, 9) }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal test (regexp)', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'Literal', value: /test/, regex: { pattern: 'test', flags: '' }, loc: makeLoc(1, 4, 1, 10) }))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression test', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'BinaryExpression', operator: '===', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: 1 }, loc: makeLoc(1, 4, 1, 10) }))
      expect(reports.length).toBe(0)
    })

    test('does not report for LogicalExpression test (&&)', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'LogicalExpression', operator: '&&', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' }, loc: makeLoc(1, 4, 1, 9) }))
      expect(reports.length).toBe(0)
    })

    test('does not report for LogicalExpression test (||)', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'LogicalExpression', operator: '||', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' }, loc: makeLoc(1, 4, 1, 9) }))
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression test (!)', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' }, loc: makeLoc(1, 4, 1, 6) }))
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression test (typeof)', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'UnaryExpression', operator: 'typeof', prefix: true, argument: { type: 'Identifier', name: 'x' }, loc: makeLoc(1, 4, 1, 11) }))
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression test (void)', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'UnaryExpression', operator: 'void', prefix: true, argument: { type: 'Identifier', name: 'x' }, loc: makeLoc(1, 4, 1, 9) }))
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression test (delete)', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'UnaryExpression', operator: 'delete', prefix: true, argument: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }, loc: makeLoc(1, 4, 1, 14) }))
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression test', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [], loc: makeLoc(1, 4, 1, 7) }))
      expect(reports.length).toBe(0)
    })

    test('does not report for BooleanLiteral test', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'BooleanLiteral', value: true, loc: makeLoc(1, 4, 1, 8) }))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      expect(() => visitor.IfStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      expect(() => visitor.IfStatement(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for non-object node (string)', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      expect(() => visitor.IfStatement('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for non-object node (number)', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      expect(() => visitor.IfStatement(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      expect(() => visitor.IfStatement({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when test is null', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode(null))
      expect(reports.length).toBe(0)
    })

    test('does not report when test is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode(undefined))
      expect(reports.length).toBe(0)
    })

    test('does not report when test is a string primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode('hello'))
      expect(reports.length).toBe(0)
    })

    test('does not report when test is a number primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode(42))
      expect(reports.length).toBe(0)
    })

    test('does not report when test property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement({ type: 'IfStatement', consequent: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement({ type: 'WhileStatement', test: { type: 'Identifier', name: 'x' }, body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression with !== operator', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'BinaryExpression', operator: '!==', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: null }, loc: makeLoc(1, 4, 1, 11) }))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression with > operator', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'BinaryExpression', operator: '>', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: 0 }, loc: makeLoc(1, 4, 1, 7) }))
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression with arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [{ type: 'Literal', value: 1 }], loc: makeLoc(1, 4, 1, 9) }))
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression with member callee', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'CallExpression', callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'fn' } }, arguments: [], loc: makeLoc(1, 4, 1, 12) }))
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression with minus operator', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'UnaryExpression', operator: '-', prefix: true, argument: { type: 'Identifier', name: 'x' }, loc: makeLoc(1, 4, 1, 6) }))
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive test', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      expect(() => visitor.IfStatement(makeIfNode(true))).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for LogicalExpression with nullish coalescing', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'LogicalExpression', operator: '??', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' }, loc: makeLoc(1, 4, 1, 9) }))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'Identifier', name: 'x', loc: makeLoc(1, 4, 1, 5) }))
      visitor.IfStatement(makeIfNode({ type: 'Literal', value: true, loc: makeLoc(2, 4, 2, 8) }))
      visitor.IfStatement(makeIfNode({ type: 'BinaryExpression', operator: '===', left: {}, right: {}, loc: makeLoc(3, 4, 3, 10) }))
      visitor.IfStatement(makeIfNode({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(4, 4, 4, 7) }))
      visitor.IfStatement(makeIfNode({ type: 'MemberExpression', object: {}, property: {}, loc: makeLoc(5, 4, 5, 11) }))
      expect(reports.length).toBe(2)
    })

    test('reports when test type is an empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: '', loc: makeLoc(1, 4, 1, 5) }))
      expect(reports.length).toBe(1)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = strictBoolExpressionsRule.create(context)
      const visitor2 = strictBoolExpressionsRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = strictBoolExpressionsRule.meta
      const meta2 = strictBoolExpressionsRule.meta
      expect(meta1).toBe(meta2)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'Identifier', name: 'x', loc: makeLoc(1, 4, 1, 5) }))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('handles IfStatement with consequent and alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement({
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'x', loc: makeLoc(1, 4, 1, 5) },
        consequent: { type: 'BlockStatement', body: [] },
        alternate: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(1)
    })

    test('handles IfStatement with only consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement({
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'x', loc: makeLoc(1, 4, 1, 5) },
        consequent: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      const testNode = { type: 'Identifier', name: 'x', loc: makeLoc(1, 4, 1, 5) }
      visitor.IfStatement(makeIfNode(testNode))
      visitor.IfStatement(makeIfNode(testNode))
      visitor.IfStatement(makeIfNode(testNode))
      expect(reports.length).toBe(3)
    })

    test('mixed calls: valid then invalid then valid', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'Literal', value: true, loc: makeLoc(1, 4, 1, 8) }))
      visitor.IfStatement(makeIfNode({ type: 'Identifier', name: 'x', loc: makeLoc(2, 4, 2, 5) }))
      visitor.IfStatement(makeIfNode({ type: 'BinaryExpression', operator: '>', left: {}, right: {}, loc: makeLoc(3, 4, 3, 7) }))
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement({
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'x', loc: { start: { line: 3, column: 5 } } },
        consequent: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
    })

    test('schema is empty array', () => {
      expect(strictBoolExpressionsRule.meta.schema).toEqual([])
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement({
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'x', loc: makeLoc(1, 4, 1, 5), _parent: {} },
        consequent: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('all accumulated reports have same message', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode({ type: 'Identifier', name: 'x', loc: makeLoc(1, 4, 1, 5) }))
      visitor.IfStatement(makeIfNode({ type: 'MemberExpression', object: {}, property: {}, loc: makeLoc(2, 4, 2, 11) }))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('handles IfStatement where test is boolean primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      visitor.IfStatement(makeIfNode(false))
      expect(reports.length).toBe(0)
    })

    test('reports when test is a plain array (no type)', () => {
      const { context, reports } = createMockContext()
      const visitor = strictBoolExpressionsRule.create(context)
      expect(() => visitor.IfStatement(makeIfNode([1, 2, 3]))).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })
})
