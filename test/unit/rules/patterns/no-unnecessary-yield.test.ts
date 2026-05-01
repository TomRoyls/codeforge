import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryYieldRule } from '../../../../src/rules/patterns/no-unnecessary-yield.js'
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

function makeYieldNode(
  argument: unknown = null,
  delegate = false,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 10,
): unknown {
  return {
    type: 'YieldExpression',
    argument,
    delegate,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-yield rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryYieldRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryYieldRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryYieldRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryYieldRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryYieldRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning yield', () => {
      const desc = noUnnecessaryYieldRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/yield/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryYieldRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-yield.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryYieldRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with YieldExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      expect(visitor).toHaveProperty('YieldExpression')
      expect(typeof visitor.YieldExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryYieldRule).toBeDefined()
      expect(noUnnecessaryYieldRule.meta).toBeDefined()
      expect(noUnnecessaryYieldRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (28) =====

  describe('positive cases — reports unnecessary yield', () => {
    test('reports for yield with argument null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression(makeYieldNode(null))
      expect(reports.length).toBe(1)
    })

    test('reports for yield with argument undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression(makeYieldNode(undefined))
      expect(reports.length).toBe(1)
    })

    test('reports for yield without argument property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression({
        type: 'YieldExpression',
        delegate: false,
        loc: makeLoc(1, 0, 1, 6),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for bare yield with delegate false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression(makeYieldNode(null, false))
      expect(reports.length).toBe(1)
    })

    test('reports for bare yield with delegate undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression({
        type: 'YieldExpression',
        argument: null,
        loc: makeLoc(1, 0, 1, 6),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for bare yield with delegate true (yield* without value)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression(makeYieldNode(null, true))
      expect(reports.length).toBe(1)
    })

    test('report message mentions unnecessary yield', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression(makeYieldNode(null))
      expect(reports[0].message).toMatch(/yield/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression(makeYieldNode(null))
      expect(reports[0].message).toBe(
        'Unnecessary yield without a value. Use return instead.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression(makeYieldNode(null))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression(makeYieldNode(null))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input YieldExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      const node = makeYieldNode(null)
      visitor.YieldExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression(makeYieldNode(null, false, 5, 10, 5, 16))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression(makeYieldNode(null))
      visitor.YieldExpression(makeYieldNode(undefined))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression(makeYieldNode(null))
      visitor.YieldExpression(makeYieldNode(undefined))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression(makeYieldNode(null))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for bare yield at line 1', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression(makeYieldNode(null, false, 1, 0, 1, 6))
      expect(reports.length).toBe(1)
    })

    test('reports for bare yield at line 42', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression(makeYieldNode(null, false, 42, 8, 42, 14))
      expect(reports.length).toBe(1)
    })

    test('reports for bare yield at line 100 column 50', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression(makeYieldNode(null, false, 100, 50, 100, 56))
      expect(reports.length).toBe(1)
    })

    test('reports for bare yield spanning multiple lines', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression(makeYieldNode(null, false, 10, 4, 12, 2))
      expect(reports.length).toBe(1)
    })

    test('reports for second bare yield after first', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression(makeYieldNode(null))
      visitor.YieldExpression(makeYieldNode(null))
      expect(reports.length).toBe(2)
    })

    test('reports for three consecutive bare yields', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression(makeYieldNode(null))
      visitor.YieldExpression(makeYieldNode(null))
      visitor.YieldExpression(makeYieldNode(null))
      expect(reports.length).toBe(3)
    })

    test('reports for yield with argument explicitly set to null and delegate false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression({ type: 'YieldExpression', argument: null, delegate: false, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(1)
    })

    test('reports when argument is null even with extra node properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression({
        type: 'YieldExpression',
        argument: null,
        delegate: false,
        loc: makeLoc(1, 0, 1, 6),
        range: [0, 6],
        leadingComments: [],
      })
      expect(reports.length).toBe(1)
    })

    test('reports for yield with argument undefined and delegate true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression(makeYieldNode(undefined, true))
      expect(reports.length).toBe(1)
    })

    test('reports for yield with argument missing and delegate true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression({
        type: 'YieldExpression',
        delegate: true,
        loc: makeLoc(1, 0, 1, 7),
      })
      expect(reports.length).toBe(1)
    })

    test('report loc end values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression(makeYieldNode(null, false, 3, 5, 3, 11))
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(11)
    })

    test('report message mentions "return" as alternative', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression(makeYieldNode(null))
      expect(reports[0].message).toMatch(/return/)
    })

    test('report message contains full expected text', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression(makeYieldNode(undefined))
      expect(reports[0].message).toContain('Unnecessary yield without a value')
      expect(reports[0].message).toContain('Use return instead')
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for yield with string value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression(makeYieldNode({ type: 'Literal', value: 'hello' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for yield with number value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression(makeYieldNode({ type: 'Literal', value: 42 }))
      expect(reports.length).toBe(0)
    })

    test('does not report for yield with boolean value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression(makeYieldNode({ type: 'Literal', value: true }))
      expect(reports.length).toBe(0)
    })

    test('does not report for yield with identifier value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression(makeYieldNode({ type: 'Identifier', name: 'x' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for yield with object expression value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression(makeYieldNode({ type: 'ObjectExpression', properties: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for yield with array expression value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression(makeYieldNode({ type: 'ArrayExpression', elements: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for yield with call expression value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression(makeYieldNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for yield with member expression value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression(makeYieldNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'key' } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for yield with binary expression value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression(makeYieldNode({ type: 'BinaryExpression', operator: '+', left: { type: 'Literal', value: 1 }, right: { type: 'Literal', value: 2 } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for yield with unary expression value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression(makeYieldNode({ type: 'UnaryExpression', operator: '-', prefix: true, argument: { type: 'Literal', value: 1 } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for yield with conditional expression value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression(makeYieldNode({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 2 } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for yield with arrow function value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression(makeYieldNode({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for yield with template literal value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression(makeYieldNode({ type: 'TemplateLiteral', quasis: [], expressions: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for yield* with iterable value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression(makeYieldNode({ type: 'Identifier', name: 'iterable' }, true))
      expect(reports.length).toBe(0)
    })

    test('does not report for yield with function expression value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression(makeYieldNode({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for yield with new expression value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression(makeYieldNode({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Map' }, arguments: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for yield with logical expression value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression(makeYieldNode({ type: 'LogicalExpression', operator: '&&', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for yield with assignment expression value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression(makeYieldNode({ type: 'AssignmentExpression', operator: '=', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: 1 } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for yield with update expression value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression(makeYieldNode({ type: 'UpdateExpression', operator: '++', prefix: true, argument: { type: 'Identifier', name: 'i' } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for yield with sequence expression value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression(makeYieldNode({ type: 'SequenceExpression', expressions: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for yield with spread element value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression(makeYieldNode({ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for yield with await expression value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression(makeYieldNode({ type: 'AwaitExpression', argument: { type: 'Identifier', name: 'promise' } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for yield with nested yield expression value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression(makeYieldNode({ type: 'YieldExpression', argument: { type: 'Literal', value: 1 }, delegate: false }))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      expect(() => visitor.YieldExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      expect(() => visitor.YieldExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      expect(() => visitor.YieldExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      expect(() => visitor.YieldExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      expect(() => visitor.YieldExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      expect(() => visitor.YieldExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression({ type: 'FunctionDeclaration', id: { type: 'Identifier', name: 'fn' }, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BlockStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression({ type: 'BlockStatement', body: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression({ type: 'ExpressionStatement', expression: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for WhileStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression({ type: 'WhileStatement', test: {}, body: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

  })

  // ===== EDGE CASES (17) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryYieldRule.create(ctx1)
      const visitor2 = noUnnecessaryYieldRule.create(ctx2)
      visitor1.YieldExpression(makeYieldNode(null))
      visitor2.YieldExpression(makeYieldNode({ type: 'Literal', value: 1 }))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression(makeYieldNode(null))
      visitor.YieldExpression(makeYieldNode({ type: 'Literal', value: 1 }))
      visitor.YieldExpression(makeYieldNode(undefined))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      const node = {
        type: 'YieldExpression',
        argument: null,
        delegate: false,
      }
      visitor.YieldExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      const node = {
        type: 'YieldExpression',
        argument: null,
        delegate: false,
      }
      visitor.YieldExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression(makeYieldNode({ type: 'Literal', value: 1 }))
      visitor.YieldExpression(makeYieldNode(null))
      visitor.YieldExpression(makeYieldNode({ type: 'Identifier', name: 'x' }))
      visitor.YieldExpression(makeYieldNode(undefined))
      visitor.YieldExpression(makeYieldNode({ type: 'Literal', value: 42 }))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryYieldRule.create(context)
      const visitor2 = noUnnecessaryYieldRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryYieldRule.meta
      const meta2 = noUnnecessaryYieldRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      const node = {
        type: 'YieldExpression',
        argument: null,
        delegate: false,
        loc: makeLoc(1, 0, 1, 6),
        range: [0, 6],
        extra: true,
        trailingComments: [],
      }
      visitor.YieldExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression({
        type: 'YieldExpression',
        argument: null,
        delegate: false,
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression({
        type: 'YieldExpression',
        argument: null,
        delegate: false,
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      const node = makeYieldNode(null)
      visitor.YieldExpression(node)
      visitor.YieldExpression(node)
      visitor.YieldExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryYieldRule).toBeDefined()
      expect(typeof noUnnecessaryYieldRule.create).toBe('function')
      expect(typeof noUnnecessaryYieldRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression({
        type: 'YieldExpression',
        argument: null,
        delegate: false,
        loc: makeLoc(1, 0, 1, 6),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression(makeYieldNode(null, false, 10, 4, 10, 10))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(10)
    })

    test('does not report for yield with argument 0 (falsy but not null/undefined)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression(makeYieldNode({ type: 'Literal', value: 0 }))
      expect(reports.length).toBe(0)
    })

    test('does not report for yield with argument empty string (falsy but not null/undefined)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression(makeYieldNode({ type: 'Literal', value: '' }))
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryYieldRule.create(context)
      visitor.YieldExpression(makeYieldNode(null))
      visitor.YieldExpression(makeYieldNode(undefined))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})
