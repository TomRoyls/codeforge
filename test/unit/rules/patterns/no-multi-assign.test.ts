import { describe, expect, test, vi } from 'vitest'
import { noMultiAssignRule } from '../../../../src/rules/patterns/no-multi-assign.js'
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
    getSource: () => 'a = b = c',
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

function makeAssignNode(
  right: unknown,
  left: unknown = { type: 'Identifier', name: 'a' },
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 10,
): unknown {
  return {
    type: 'AssignmentExpression',
    operator: '=',
    left,
    right,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-multi-assign rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noMultiAssignRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noMultiAssignRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noMultiAssignRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noMultiAssignRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noMultiAssignRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning assignment', () => {
      const desc = noMultiAssignRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/assign/)
    })

    test('should have correct docs URL', () => {
      expect(noMultiAssignRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-multi-assign',
      )
    })

    test('should have empty schema', () => {
      expect(noMultiAssignRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with AssignmentExpression', () => {
      const { context } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      expect(visitor).toHaveProperty('AssignmentExpression')
      expect(typeof visitor.AssignmentExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noMultiAssignRule).toBeDefined()
      expect(noMultiAssignRule.meta).toBeDefined()
      expect(noMultiAssignRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS CHAINED ASSIGNMENT (29) =====

  describe('positive cases — reports chained assignment', () => {
    test('reports for a = b = c', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      const innerAssign = makeAssignNode({ type: 'Identifier', name: 'c' })
      visitor.AssignmentExpression(makeAssignNode(innerAssign))
      expect(reports.length).toBe(1)
    })

    test('reports for x = y = z', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      const innerAssign = makeAssignNode(
        { type: 'Identifier', name: 'z' },
        { type: 'Identifier', name: 'y' },
      )
      visitor.AssignmentExpression(
        makeAssignNode(innerAssign, { type: 'Identifier', name: 'x' }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for triple chain a = b = c = d', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      const innermost = makeAssignNode({ type: 'Identifier', name: 'd' })
      const middle = makeAssignNode(innermost, { type: 'Identifier', name: 'c' })
      visitor.AssignmentExpression(makeAssignNode(middle))
      expect(reports.length).toBe(1)
    })

    test('report message mentions "chained assignment"', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      const innerAssign = makeAssignNode({ type: 'Identifier', name: 'c' })
      visitor.AssignmentExpression(makeAssignNode(innerAssign))
      expect(reports[0].message).toContain('chained assignment')
    })

    test('report message mentions "Split into separate statements"', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      const innerAssign = makeAssignNode({ type: 'Identifier', name: 'c' })
      visitor.AssignmentExpression(makeAssignNode(innerAssign))
      expect(reports[0].message).toContain('Split into separate statements')
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      const innerAssign = makeAssignNode({ type: 'Identifier', name: 'c' })
      visitor.AssignmentExpression(makeAssignNode(innerAssign))
      expect(reports[0].message).toBe(
        'Unexpected chained assignment. Split into separate statements.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      const innerAssign = makeAssignNode({ type: 'Identifier', name: 'c' })
      visitor.AssignmentExpression(makeAssignNode(innerAssign))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      const innerAssign = makeAssignNode({ type: 'Identifier', name: 'c' })
      visitor.AssignmentExpression(makeAssignNode(innerAssign))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input AssignmentExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      const innerAssign = makeAssignNode({ type: 'Identifier', name: 'c' })
      const node = makeAssignNode(innerAssign)
      visitor.AssignmentExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('reports when right is nested AssignmentExpression with different operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      const innerAssign = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'y' },
        right: { type: 'Identifier', name: 'z' },
        loc: makeLoc(1, 4, 1, 9),
      }
      visitor.AssignmentExpression(makeAssignNode(innerAssign))
      expect(reports.length).toBe(1)
    })

    test('reports when left is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      const innerAssign = makeAssignNode({ type: 'Identifier', name: 'c' })
      const left = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'prop' },
      }
      visitor.AssignmentExpression(makeAssignNode(innerAssign, left))
      expect(reports.length).toBe(1)
    })

    test('reports when inner right is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      const innerRight = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'val' },
      }
      const innerAssign = makeAssignNode(innerRight, { type: 'Identifier', name: 'b' })
      visitor.AssignmentExpression(makeAssignNode(innerAssign))
      expect(reports.length).toBe(1)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      const innerAssign = makeAssignNode({ type: 'Identifier', name: 'c' })
      visitor.AssignmentExpression(makeAssignNode(innerAssign, undefined, 5, 10, 5, 20))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      const inner1 = makeAssignNode({ type: 'Identifier', name: 'c' })
      const inner2 = makeAssignNode({ type: 'Identifier', name: 'z' })
      visitor.AssignmentExpression(makeAssignNode(inner1))
      visitor.AssignmentExpression(makeAssignNode(inner2))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      const inner1 = makeAssignNode({ type: 'Identifier', name: 'c' })
      const inner2 = makeAssignNode({ type: 'Identifier', name: 'z' })
      visitor.AssignmentExpression(makeAssignNode(inner1))
      visitor.AssignmentExpression(makeAssignNode(inner2))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for property assignment chain', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      const innerAssign = makeAssignNode(
        { type: 'Literal', value: 42 },
        { type: 'Identifier', name: 'b' },
      )
      visitor.AssignmentExpression(makeAssignNode(innerAssign))
      expect(reports.length).toBe(1)
    })

    test('reports for four-level chain', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      const d = makeAssignNode({ type: 'Identifier', name: 'd' })
      const c = makeAssignNode(d, { type: 'Identifier', name: 'c' })
      const b = makeAssignNode(c, { type: 'Identifier', name: 'b' })
      visitor.AssignmentExpression(makeAssignNode(b))
      expect(reports.length).toBe(1)
    })

    test('reports when inner assignment has CallExpression right', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      const callRight = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'foo' },
        arguments: [],
      }
      const innerAssign = makeAssignNode(callRight, { type: 'Identifier', name: 'b' })
      visitor.AssignmentExpression(makeAssignNode(innerAssign))
      expect(reports.length).toBe(1)
    })

    test('reports when inner assignment right is NumericLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      const innerAssign = makeAssignNode(
        { type: 'Literal', value: 0 },
        { type: 'Identifier', name: 'b' },
      )
      visitor.AssignmentExpression(makeAssignNode(innerAssign))
      expect(reports.length).toBe(1)
    })

    test('reports when inner assignment right is StringLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      const innerAssign = makeAssignNode(
        { type: 'Literal', value: '' },
        { type: 'Identifier', name: 'b' },
      )
      visitor.AssignmentExpression(makeAssignNode(innerAssign))
      expect(reports.length).toBe(1)
    })

    test('reports when inner assignment right is a BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      const binaryRight = {
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'y' },
      }
      const innerAssign = makeAssignNode(binaryRight, { type: 'Identifier', name: 'b' })
      visitor.AssignmentExpression(makeAssignNode(innerAssign))
      expect(reports.length).toBe(1)
    })

    test('reports when outer left is an ObjectPattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      const innerAssign = makeAssignNode({ type: 'Identifier', name: 'c' })
      const left = { type: 'ObjectPattern', properties: [] }
      visitor.AssignmentExpression(makeAssignNode(innerAssign, left))
      expect(reports.length).toBe(1)
    })

    test('reports when inner left is ArrayPattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      const innerAssign = makeAssignNode(
        { type: 'Identifier', name: 'c' },
        { type: 'ArrayPattern', elements: [] },
      )
      visitor.AssignmentExpression(makeAssignNode(innerAssign))
      expect(reports.length).toBe(1)
    })

    test('reports when inner right is a ConditionalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      const condRight = {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'x' },
        consequent: { type: 'Identifier', name: 'y' },
        alternate: { type: 'Identifier', name: 'z' },
      }
      const innerAssign = makeAssignNode(condRight, { type: 'Identifier', name: 'b' })
      visitor.AssignmentExpression(makeAssignNode(innerAssign))
      expect(reports.length).toBe(1)
    })

    test('report loc end values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      const innerAssign = makeAssignNode({ type: 'Identifier', name: 'c' })
      visitor.AssignmentExpression(makeAssignNode(innerAssign, undefined, 2, 0, 2, 15))
      expect(reports[0].loc?.end.line).toBe(2)
      expect(reports[0].loc?.end.column).toBe(15)
    })

    test('reports when inner assignment has operator += is still AssignmentExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      const innerAssign = {
        type: 'AssignmentExpression',
        operator: '+=',
        left: { type: 'Identifier', name: 'b' },
        right: { type: 'Identifier', name: 'c' },
        loc: makeLoc(1, 4, 1, 9),
      }
      visitor.AssignmentExpression(makeAssignNode(innerAssign))
      expect(reports.length).toBe(1)
    })

    test('reports when inner assignment has operator *=', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      const innerAssign = {
        type: 'AssignmentExpression',
        operator: '*=',
        left: { type: 'Identifier', name: 'b' },
        right: { type: 'Identifier', name: 'c' },
        loc: makeLoc(1, 4, 1, 9),
      }
      visitor.AssignmentExpression(makeAssignNode(innerAssign))
      expect(reports.length).toBe(1)
    })

    test('reports for a = (b = c)', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      const innerAssign = makeAssignNode({ type: 'Identifier', name: 'c' })
      visitor.AssignmentExpression(makeAssignNode(innerAssign))
      expect(reports.length).toBe(1)
    })

    test('reports for this.prop = obj.prop = value', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      const innerAssign = makeAssignNode(
        { type: 'Identifier', name: 'value' },
        {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'prop' },
        },
      )
      visitor.AssignmentExpression(
        makeAssignNode(
          innerAssign,
          {
            type: 'MemberExpression',
            object: { type: 'ThisExpression' },
            property: { type: 'Identifier', name: 'prop' },
          },
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports when node has _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      const innerAssign = makeAssignNode({ type: 'Identifier', name: 'c' })
      const node = makeAssignNode(innerAssign)
      Object.assign(node, { _parent: { type: 'ExpressionStatement' } })
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })


  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (30) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for simple assignment a = b', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      visitor.AssignmentExpression(
        makeAssignNode({ type: 'Identifier', name: 'b' }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for assignment to literal a = 5', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      visitor.AssignmentExpression(
        makeAssignNode({ type: 'Literal', value: 5 }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for assignment with CallExpression right', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      visitor.AssignmentExpression(
        makeAssignNode({
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'foo' },
          arguments: [],
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      expect(() => visitor.AssignmentExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      expect(() => visitor.AssignmentExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      expect(() => visitor.AssignmentExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      visitor.AssignmentExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      visitor.AssignmentExpression({ type: 'Literal', value: 'test', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      expect(() => visitor.AssignmentExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      expect(() => visitor.AssignmentExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      expect(() => visitor.AssignmentExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      expect(() => visitor.AssignmentExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      visitor.AssignmentExpression({
        type: 'CallExpression',
        callee: {},
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      visitor.AssignmentExpression({
        type: 'MemberExpression',
        object: {},
        property: {},
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      visitor.AssignmentExpression({
        type: 'BinaryExpression',
        operator: '+',
        left: {},
        right: {},
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      visitor.AssignmentExpression({
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
        argument: {},
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      visitor.AssignmentExpression({
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrowFunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      visitor.AssignmentExpression({
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      visitor.AssignmentExpression({
        type: 'ReturnStatement',
        argument: null,
        loc: makeLoc(1, 0, 1, 6),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      visitor.AssignmentExpression({
        type: 'IfStatement',
        test: {},
        consequent: {},
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      visitor.AssignmentExpression({
        type: 'VariableDeclaration',
        declarations: [],
        kind: 'const',
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      visitor.AssignmentExpression({
        type: 'ExpressionStatement',
        expression: {},
        loc: makeLoc(1, 0, 1, 1),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BlockStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      visitor.AssignmentExpression({
        type: 'BlockStatement',
        body: [],
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ConditionalExpression right', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      visitor.AssignmentExpression(
        makeAssignNode({
          type: 'ConditionalExpression',
          test: { type: 'Identifier', name: 'x' },
          consequent: { type: 'Identifier', name: 'y' },
          alternate: { type: 'Identifier', name: 'z' },
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for ObjectExpression right', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      visitor.AssignmentExpression(
        makeAssignNode({ type: 'ObjectExpression', properties: [] }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrayExpression right', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      visitor.AssignmentExpression(
        makeAssignNode({ type: 'ArrayExpression', elements: [] }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for TemplateLiteral right', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      visitor.AssignmentExpression(
        makeAssignNode({
          type: 'TemplateLiteral',
          quasis: [],
          expressions: [],
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when right property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'a' },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when right is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      visitor.AssignmentExpression(
        makeAssignNode(null),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when right is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'a' },
        right: undefined,
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (25) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noMultiAssignRule.create(ctx1)
      const visitor2 = noMultiAssignRule.create(ctx2)
      const innerAssign = makeAssignNode({ type: 'Identifier', name: 'c' })
      visitor1.AssignmentExpression(makeAssignNode(innerAssign))
      visitor2.AssignmentExpression(makeAssignNode({ type: 'Identifier', name: 'b' }))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      const inner1 = makeAssignNode({ type: 'Identifier', name: 'c' })
      visitor.AssignmentExpression(makeAssignNode(inner1))
      visitor.AssignmentExpression(makeAssignNode({ type: 'Identifier', name: 'b' }))
      const inner3 = makeAssignNode({ type: 'Identifier', name: 'z' })
      visitor.AssignmentExpression(makeAssignNode(inner3))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      const innerAssign = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'b' },
        right: { type: 'Identifier', name: 'c' },
      }
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'a' },
        right: innerAssign,
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      const innerAssign = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'b' },
        right: { type: 'Identifier', name: 'c' },
      }
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'a' },
        right: innerAssign,
      }
      visitor.AssignmentExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      visitor.AssignmentExpression(makeAssignNode({ type: 'Identifier', name: 'b' }))
      const innerAssign = makeAssignNode({ type: 'Identifier', name: 'c' })
      visitor.AssignmentExpression(makeAssignNode(innerAssign))
      visitor.AssignmentExpression(makeAssignNode({ type: 'Literal', value: 42 }))
      const innerAssign2 = makeAssignNode({ type: 'Identifier', name: 'z' })
      visitor.AssignmentExpression(makeAssignNode(innerAssign2))
      visitor.AssignmentExpression(
        makeAssignNode({ type: 'CallExpression', callee: {}, arguments: [] }),
      )
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noMultiAssignRule.create(context)
      const visitor2 = noMultiAssignRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noMultiAssignRule.meta
      const meta2 = noMultiAssignRule.meta
      expect(meta1).toBe(meta2)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      const innerAssign = makeAssignNode({ type: 'Identifier', name: 'c' })
      visitor.AssignmentExpression(makeAssignNode(innerAssign))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      const innerAssign = makeAssignNode({ type: 'Identifier', name: 'c' })
      const node = {
        ...makeAssignNode(innerAssign),
        range: [0, 10],
        extra: true,
        trailingComments: [],
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      const innerAssign = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'b' },
        right: { type: 'Identifier', name: 'c' },
      }
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'a' },
        right: innerAssign,
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      const innerAssign = makeAssignNode({ type: 'Identifier', name: 'c' })
      visitor.AssignmentExpression({
        ...makeAssignNode(innerAssign),
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      const innerAssign = makeAssignNode({ type: 'Identifier', name: 'c' })
      const node = makeAssignNode(innerAssign)
      visitor.AssignmentExpression(node)
      visitor.AssignmentExpression(node)
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noMultiAssignRule).toBeDefined()
      expect(typeof noMultiAssignRule.create).toBe('function')
      expect(typeof noMultiAssignRule.meta).toBe('object')
    })

    test('handles deeply nested assignment chain', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      const e = makeAssignNode({ type: 'Identifier', name: 'e' })
      const d = makeAssignNode(e, { type: 'Identifier', name: 'd' })
      const c = makeAssignNode(d, { type: 'Identifier', name: 'c' })
      const b = makeAssignNode(c, { type: 'Identifier', name: 'b' })
      visitor.AssignmentExpression(makeAssignNode(b))
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      const inner1 = makeAssignNode({ type: 'Identifier', name: 'c' })
      visitor.AssignmentExpression(makeAssignNode(inner1))
      const inner2 = makeAssignNode({ type: 'Identifier', name: 'z' })
      visitor.AssignmentExpression(makeAssignNode(inner2))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('node with range property alongside loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      const innerAssign = makeAssignNode({ type: 'Identifier', name: 'c' })
      const node = makeAssignNode(innerAssign)
      Object.assign(node, { range: [0, 10] })
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })

    test('does not report when right is an object without type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      visitor.AssignmentExpression(
        makeAssignNode({ name: 'something', value: 42 }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when right type is LogicalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      visitor.AssignmentExpression(
        makeAssignNode({
          type: 'LogicalExpression',
          operator: '||',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      const innerAssign = makeAssignNode({ type: 'Identifier', name: 'c' })
      visitor.AssignmentExpression(makeAssignNode(innerAssign, undefined, 10, 4, 10, 12))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(12)
    })

    test('does not report when right is a NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      visitor.AssignmentExpression(
        makeAssignNode({
          type: 'NewExpression',
          callee: { type: 'Identifier', name: 'Foo' },
          arguments: [],
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when right is an UpdateExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      visitor.AssignmentExpression(
        makeAssignNode({
          type: 'UpdateExpression',
          operator: '++',
          prefix: false,
          argument: { type: 'Identifier', name: 'x' },
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('handles node with only start in loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      const innerAssign = makeAssignNode({ type: 'Identifier', name: 'c' })
      visitor.AssignmentExpression({
        ...makeAssignNode(innerAssign),
        loc: { start: { line: 7, column: 3 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(7)
    })

    test('does not report when right type is SequenceExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      visitor.AssignmentExpression(
        makeAssignNode({
          type: 'SequenceExpression',
          expressions: [
            { type: 'Identifier', name: 'a' },
            { type: 'Identifier', name: 'b' },
          ],
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when right is a string primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'a' },
        right: 'hello',
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when right is a number primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiAssignRule.create(context)
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'a' },
        right: 42,
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })
  })
})
