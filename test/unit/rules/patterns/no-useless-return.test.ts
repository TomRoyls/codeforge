import { describe, expect, test, vi } from 'vitest'
import { noUselessReturnRule } from '../../../../src/rules/patterns/no-useless-return.js'
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
    id: 'no-useless-return',
    options: {},
    settings: {},
    parserPath: '/parser.js',
    parserOptions: {},
    parserServices: undefined,
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
        node: descriptor.node,
      })
    },
    getFilePath: () => '/src/file.ts',
    getAST: () => null,
    getSource: () => 'return;',
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

function makeReturnNode(
  argument: unknown,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 6,
): unknown {
  return {
    type: 'ReturnStatement',
    argument,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-useless-return rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUselessReturnRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUselessReturnRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUselessReturnRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUselessReturnRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUselessReturnRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning return', () => {
      const desc = noUselessReturnRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/return/)
    })

    test('should have correct docs URL', () => {
      expect(noUselessReturnRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-useless-return',
      )
    })

    test('should have empty schema', () => {
      expect(noUselessReturnRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with ReturnStatement', () => {
      const { context } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      expect(visitor).toHaveProperty('ReturnStatement')
      expect(typeof visitor.ReturnStatement).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUselessReturnRule).toBeDefined()
      expect(noUselessReturnRule.meta).toBeDefined()
      expect(noUselessReturnRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS USELESS RETURN (30) =====

  describe('positive cases — reports useless return', () => {
    test('reports for bare return with undefined argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode(undefined))
      expect(reports.length).toBe(1)
    })

    test('reports for return null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode(null))
      expect(reports.length).toBe(1)
    })

    test('reports for return node without argument property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement({ type: 'ReturnStatement', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(1)
    })

    test('report message is exactly "Unnecessary return statement."', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode(undefined))
      expect(reports[0].message).toBe('Unnecessary return statement.')
    })

    test('report message for null argument is same', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode(null))
      expect(reports[0].message).toBe('Unnecessary return statement.')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode(undefined))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode(undefined))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input ReturnStatement node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      const node = makeReturnNode(undefined)
      visitor.ReturnStatement(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc reflects node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode(undefined, 5, 10, 5, 16))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('reports for bare return at line 1', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode(undefined, 1, 0, 1, 6))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('reports for bare return at line 100', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode(undefined, 100, 4, 100, 10))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(100)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode(undefined))
      visitor.ReturnStatement(makeReturnNode(null))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode(undefined))
      visitor.ReturnStatement(makeReturnNode(null))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for return node with explicit undefined argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement({ type: 'ReturnStatement', argument: undefined, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(1)
    })

    test('reports for return node with explicit null argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(1)
    })

    test('report loc end is preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode(undefined, 3, 2, 3, 8))
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(8)
    })

    test('reports for bare return with extra properties on node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      const node = {
        type: 'ReturnStatement',
        argument: null,
        loc: makeLoc(1, 0, 1, 6),
        range: [0, 6],
        extra: true,
        trailingComments: [],
      }
      visitor.ReturnStatement(node)
      expect(reports.length).toBe(1)
    })

    test('reports for bare return with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement({ type: 'ReturnStatement', argument: undefined, loc: {} })
      expect(reports.length).toBe(1)
    })

    test('reports for bare return with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement({ type: 'ReturnStatement', argument: null, loc: { start: { line: 3, column: 5 } } })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('reports for bare return with no loc at all', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement({ type: 'ReturnStatement', argument: undefined })
      expect(reports.length).toBe(1)
    })

    test('reports for bare return with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6), _parent: {} })
      expect(reports.length).toBe(1)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      const node = makeReturnNode(undefined)
      visitor.ReturnStatement(node)
      visitor.ReturnStatement(node)
      visitor.ReturnStatement(node)
      expect(reports.length).toBe(3)
    })

    test('reports for bare return with range property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6), range: [0, 6] })
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode(undefined))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for return null in nested context', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode(null, 10, 4, 10, 16))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(10)
    })

    test('reports for return with undefined at column 20', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode(undefined, 5, 20, 5, 26))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('reports for return null at column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode(null, 1, 0, 1, 12))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('reports for bare return with body property present', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement({ type: 'ReturnStatement', argument: undefined, loc: makeLoc(1, 0, 1, 6), body: { type: 'BlockStatement', body: [] } })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode(undefined))
      visitor.ReturnStatement(makeReturnNode(null))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode(null, 10, 4, 10, 12))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(12)
    })

    test('reports for bare return with leadingComments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6), leadingComments: [] })
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (30) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for return with string value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Literal', value: 'hello' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for return with number value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Literal', value: 42 }))
      expect(reports.length).toBe(0)
    })

    test('does not report for return with boolean value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Literal', value: true }))
      expect(reports.length).toBe(0)
    })

    test('does not report for return with Identifier value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'foo' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for return with object expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'ObjectExpression', properties: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for return with array expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'ArrayExpression', elements: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for return with call expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'CallExpression', callee: {}, arguments: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for return with binary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'BinaryExpression', operator: '+', left: {}, right: {} }))
      expect(reports.length).toBe(0)
    })

    test('does not report for return with function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for return with arrow function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for return with member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'MemberExpression', object: {}, property: {} }))
      expect(reports.length).toBe(0)
    })

    test('does not report for return with conditional expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'ConditionalExpression', test: {}, consequent: {}, alternate: {} }))
      expect(reports.length).toBe(0)
    })

    test('does not report for return with template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'TemplateLiteral', quasis: [], expressions: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for return with unary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {} }))
      expect(reports.length).toBe(0)
    })

    test('does not report for return with new expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'NewExpression', callee: {}, arguments: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for return with logical expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'LogicalExpression', operator: '&&', left: {}, right: {} }))
      expect(reports.length).toBe(0)
    })

    test('does not report for return with assignment expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'AssignmentExpression', operator: '=', left: {}, right: {} }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement({ type: 'Literal', value: 'test', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement({ type: 'ExpressionStatement', expression: {}, loc: makeLoc(1, 0, 1, 1) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BlockStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement({ type: 'BlockStatement', body: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      expect(() => visitor.ReturnStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      expect(() => visitor.ReturnStatement(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      expect(() => visitor.ReturnStatement('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      expect(() => visitor.ReturnStatement(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      expect(() => visitor.ReturnStatement(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      expect(() => visitor.ReturnStatement({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      expect(() => visitor.ReturnStatement([])).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (24) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUselessReturnRule.create(ctx1)
      const visitor2 = noUselessReturnRule.create(ctx2)
      visitor1.ReturnStatement(makeReturnNode(undefined))
      visitor2.ReturnStatement(makeReturnNode({ type: 'Literal', value: 42 }))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode(undefined))
      visitor.ReturnStatement(makeReturnNode({ type: 'Literal', value: 'x' }))
      visitor.ReturnStatement(makeReturnNode(null))
      expect(reports.length).toBe(2)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Literal', value: 42 }))
      visitor.ReturnStatement(makeReturnNode(undefined))
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'x' }))
      visitor.ReturnStatement(makeReturnNode(null))
      visitor.ReturnStatement(makeReturnNode({ type: 'Literal', value: true }))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUselessReturnRule.create(context)
      const visitor2 = noUselessReturnRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUselessReturnRule.meta
      const meta2 = noUselessReturnRule.meta
      expect(meta1).toBe(meta2)
    })

    test('rule exports are correct', () => {
      expect(noUselessReturnRule).toBeDefined()
      expect(typeof noUselessReturnRule.create).toBe('function')
      expect(typeof noUselessReturnRule.meta).toBe('object')
    })

    test('handles node with argument set to 0 (truthy check)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Literal', value: 0 }))
      expect(reports.length).toBe(0)
    })

    test('handles node with argument set to empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Literal', value: '' }))
      expect(reports.length).toBe(0)
    })

    test('handles node with argument set to false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Literal', value: false }))
      expect(reports.length).toBe(0)
    })

    test('handles node with argument set to empty object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({}))
      expect(reports.length).toBe(0)
    })

    test('handles node with argument set to empty array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode([]))
      expect(reports.length).toBe(0)
    })

    test('handles node with argument set to NaN', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Literal', value: NaN }))
      expect(reports.length).toBe(0)
    })

    test('handles node with argument set to Infinity', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Literal', value: Infinity }))
      expect(reports.length).toBe(0)
    })

    test('handles node with argument set to ThisExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'ThisExpression' }))
      expect(reports.length).toBe(0)
    })

    test('handles node with argument set to void expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'UnaryExpression', operator: 'void', prefix: true, argument: { type: 'Literal', value: 0 } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for ForStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement({ type: 'ForStatement', init: null, test: null, update: null, body: {}, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for WhileStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement({ type: 'WhileStatement', test: {}, body: {}, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for SwitchStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement({ type: 'SwitchStatement', discriminant: {}, cases: [], loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ThrowStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement({ type: 'ThrowStatement', argument: {}, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for TryStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement({ type: 'TryStatement', block: {}, handler: null, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ClassDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement({ type: 'ClassDeclaration', id: null, superClass: null, body: {}, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement({ type: 'FunctionDeclaration', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('handles ReturnStatement with argument set to string primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode('some string'))
      expect(reports.length).toBe(0)
    })

    test('handles ReturnStatement with argument set to number primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode(99))
      expect(reports.length).toBe(0)
    })

  })
})
