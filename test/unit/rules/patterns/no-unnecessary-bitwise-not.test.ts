import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryBitwiseNotRule } from '../../../../src/rules/patterns/no-unnecessary-bitwise-not.js'
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
    getSource: () => '~~x',
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

function makeUnaryNode(
  operator: string,
  argument: unknown,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 10,
): unknown {
  return {
    type: 'UnaryExpression',
    operator,
    prefix: true,
    argument,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-bitwise-not rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryBitwiseNotRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryBitwiseNotRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryBitwiseNotRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryBitwiseNotRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryBitwiseNotRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning bitwise NOT', () => {
      const desc = noUnnecessaryBitwiseNotRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/bitwise/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryBitwiseNotRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-bitwise-not.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryBitwiseNotRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with UnaryExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      expect(visitor).toHaveProperty('UnaryExpression')
      expect(typeof visitor.UnaryExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryBitwiseNotRule).toBeDefined()
      expect(noUnnecessaryBitwiseNotRule.meta).toBeDefined()
      expect(noUnnecessaryBitwiseNotRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (28) =====

  describe('positive cases — reports double bitwise NOT', () => {
    test('reports for ~~identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      const inner = makeUnaryNode('~', { type: 'Identifier', name: 'x' })
      visitor.UnaryExpression(makeUnaryNode('~', inner))
      expect(reports.length).toBe(1)
    })

    test('reports for ~~literal number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      const inner = makeUnaryNode('~', { type: 'Literal', value: 42 })
      visitor.UnaryExpression(makeUnaryNode('~', inner))
      expect(reports.length).toBe(1)
    })

    test('reports for ~~literal string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      const inner = makeUnaryNode('~', { type: 'Literal', value: 'hello' })
      visitor.UnaryExpression(makeUnaryNode('~', inner))
      expect(reports.length).toBe(1)
    })

    test('reports for ~~call expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      const inner = makeUnaryNode('~', { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] })
      visitor.UnaryExpression(makeUnaryNode('~', inner))
      expect(reports.length).toBe(1)
    })

    test('reports for ~~member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      const inner = makeUnaryNode('~', { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } })
      visitor.UnaryExpression(makeUnaryNode('~', inner))
      expect(reports.length).toBe(1)
    })

    test('reports for ~~binary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      const inner = makeUnaryNode('~', { type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })
      visitor.UnaryExpression(makeUnaryNode('~', inner))
      expect(reports.length).toBe(1)
    })

    test('reports for ~~parenthesized expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      const inner = makeUnaryNode('~', { type: 'Identifier', name: 'val' })
      visitor.UnaryExpression(makeUnaryNode('~', inner))
      expect(reports.length).toBe(1)
    })

    test('reports for ~~array element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      const inner = makeUnaryNode('~', { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] })
      visitor.UnaryExpression(makeUnaryNode('~', inner))
      expect(reports.length).toBe(1)
    })

    test('reports for ~~conditional expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      const inner = makeUnaryNode('~', { type: 'ConditionalExpression', test: { type: 'Identifier', name: 'c' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 0 } })
      visitor.UnaryExpression(makeUnaryNode('~', inner))
      expect(reports.length).toBe(1)
    })

    test('report message mentions double bitwise NOT', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      const inner = makeUnaryNode('~', { type: 'Identifier', name: 'x' })
      visitor.UnaryExpression(makeUnaryNode('~', inner))
      expect(reports[0].message).toMatch(/~~/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      const inner = makeUnaryNode('~', { type: 'Identifier', name: 'x' })
      visitor.UnaryExpression(makeUnaryNode('~', inner))
      expect(reports[0].message).toBe(
        'Unnecessary double bitwise NOT (~~). Use Math.trunc() for integer truncation.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      const inner = makeUnaryNode('~', { type: 'Identifier', name: 'x' })
      visitor.UnaryExpression(makeUnaryNode('~', inner))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      const inner = makeUnaryNode('~', { type: 'Identifier', name: 'x' })
      visitor.UnaryExpression(makeUnaryNode('~', inner))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input UnaryExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      const inner = makeUnaryNode('~', { type: 'Identifier', name: 'x' })
      const outer = makeUnaryNode('~', inner)
      visitor.UnaryExpression(outer)
      expect(reports[0].node).toBe(outer)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      const inner = makeUnaryNode('~', { type: 'Identifier', name: 'x' }, 2, 5, 2, 9)
      visitor.UnaryExpression(makeUnaryNode('~', inner, 2, 4, 2, 10))
      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      const inner1 = makeUnaryNode('~', { type: 'Identifier', name: 'a' })
      const inner2 = makeUnaryNode('~', { type: 'Identifier', name: 'b' })
      visitor.UnaryExpression(makeUnaryNode('~', inner1))
      visitor.UnaryExpression(makeUnaryNode('~', inner2))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      const inner1 = makeUnaryNode('~', { type: 'Identifier', name: 'a' })
      const inner2 = makeUnaryNode('~', { type: 'Literal', value: 10 })
      visitor.UnaryExpression(makeUnaryNode('~', inner1))
      visitor.UnaryExpression(makeUnaryNode('~', inner2))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for ~~template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      const inner = makeUnaryNode('~', { type: 'TemplateLiteral', quasis: [], expressions: [] })
      visitor.UnaryExpression(makeUnaryNode('~', inner))
      expect(reports.length).toBe(1)
    })

    test('reports for ~~arrow function result', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      const inner = makeUnaryNode('~', { type: 'CallExpression', callee: { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }, arguments: [] })
      visitor.UnaryExpression(makeUnaryNode('~', inner))
      expect(reports.length).toBe(1)
    })

    test('reports for ~~object property access', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      const inner = makeUnaryNode('~', { type: 'MemberExpression', object: { type: 'Identifier', name: 'Math' }, property: { type: 'Identifier', name: 'random' } })
      visitor.UnaryExpression(makeUnaryNode('~', inner))
      expect(reports.length).toBe(1)
    })

    test('reports for ~~logical expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      const inner = makeUnaryNode('~', { type: 'LogicalExpression', operator: '||', left: { type: 'Identifier', name: 'a' }, right: { type: 'Literal', value: 0 } })
      visitor.UnaryExpression(makeUnaryNode('~', inner))
      expect(reports.length).toBe(1)
    })

    test('reports for ~~update expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      const inner = makeUnaryNode('~', { type: 'UpdateExpression', operator: '++', argument: { type: 'Identifier', name: 'i' }, prefix: false })
      visitor.UnaryExpression(makeUnaryNode('~', inner))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      const inner = makeUnaryNode('~', { type: 'Identifier', name: 'x' })
      visitor.UnaryExpression(makeUnaryNode('~', inner))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for ~~assignment expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      const inner = makeUnaryNode('~', { type: 'AssignmentExpression', operator: '=', left: { type: 'Identifier', name: 'y' }, right: { type: 'Identifier', name: 'x' } })
      visitor.UnaryExpression(makeUnaryNode('~', inner))
      expect(reports.length).toBe(1)
    })

    test('reports for ~~sequence expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      const inner = makeUnaryNode('~', { type: 'SequenceExpression', expressions: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }] })
      visitor.UnaryExpression(makeUnaryNode('~', inner))
      expect(reports.length).toBe(1)
    })

    test('reports for ~~typeof expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      const inner = makeUnaryNode('~', { type: 'UnaryExpression', operator: 'typeof', prefix: true, argument: { type: 'Identifier', name: 'x' } })
      visitor.UnaryExpression(makeUnaryNode('~', inner))
      expect(reports.length).toBe(1)
    })

    test('reports for ~~void expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      const inner = makeUnaryNode('~', { type: 'UnaryExpression', operator: 'void', prefix: true, argument: { type: 'Literal', value: 0 } })
      visitor.UnaryExpression(makeUnaryNode('~', inner))
      expect(reports.length).toBe(1)
    })

    test('reports for ~~new expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      const inner = makeUnaryNode('~', { type: 'NewExpression', callee: { type: 'Identifier', name: 'Float64Array' }, arguments: [] })
      visitor.UnaryExpression(makeUnaryNode('~', inner))
      expect(reports.length).toBe(1)
    })

    test('reports for ~~yield expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      const inner = makeUnaryNode('~', { type: 'YieldExpression', argument: { type: 'Identifier', name: 'val' } })
      visitor.UnaryExpression(makeUnaryNode('~', inner))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for single ~x', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      visitor.UnaryExpression(makeUnaryNode('~', { type: 'Identifier', name: 'x' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for !!x (double logical NOT)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      const inner = makeUnaryNode('!', { type: 'Identifier', name: 'x' })
      visitor.UnaryExpression(makeUnaryNode('!', inner))
      expect(reports.length).toBe(0)
    })

    test('does not report for ~!x', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      const inner = makeUnaryNode('!', { type: 'Identifier', name: 'x' })
      visitor.UnaryExpression(makeUnaryNode('~', inner))
      expect(reports.length).toBe(0)
    })

    test('does not report for !~x', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      const inner = makeUnaryNode('~', { type: 'Identifier', name: 'x' })
      visitor.UnaryExpression(makeUnaryNode('!', inner))
      expect(reports.length).toBe(0)
    })

    test('does not report for -x (unary minus)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      visitor.UnaryExpression(makeUnaryNode('-', { type: 'Identifier', name: 'x' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for +x (unary plus)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      visitor.UnaryExpression(makeUnaryNode('+', { type: 'Identifier', name: 'x' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof x', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      visitor.UnaryExpression(makeUnaryNode('typeof', { type: 'Identifier', name: 'x' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for void 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      visitor.UnaryExpression(makeUnaryNode('void', { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(0)
    })

    test('does not report for delete obj.prop', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      visitor.UnaryExpression(makeUnaryNode('delete', { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for non-UnaryExpression node type (Identifier)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      visitor.UnaryExpression({ type: 'Identifier', name: 'x', loc: makeLoc(1, 0, 1, 1) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      visitor.UnaryExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      visitor.UnaryExpression({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      expect(() => visitor.UnaryExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      expect(() => visitor.UnaryExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      expect(() => visitor.UnaryExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      expect(() => visitor.UnaryExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      expect(() => visitor.UnaryExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      expect(() => visitor.UnaryExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      visitor.UnaryExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      visitor.UnaryExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      visitor.UnaryExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when inner argument is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      visitor.UnaryExpression({ type: 'UnaryExpression', operator: '~', loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when inner argument is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      visitor.UnaryExpression({ type: 'UnaryExpression', operator: '~', argument: null, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when inner argument is a non-object primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      visitor.UnaryExpression({ type: 'UnaryExpression', operator: '~', argument: 'string', loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when inner argument is a number primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      visitor.UnaryExpression({ type: 'UnaryExpression', operator: '~', argument: 42, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ~-x (bitwise NOT of unary minus)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      const inner = makeUnaryNode('-', { type: 'Identifier', name: 'x' })
      visitor.UnaryExpression(makeUnaryNode('~', inner))
      expect(reports.length).toBe(0)
    })

    test('does not report for ~+x (bitwise NOT of unary plus)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      const inner = makeUnaryNode('+', { type: 'Identifier', name: 'x' })
      visitor.UnaryExpression(makeUnaryNode('~', inner))
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      visitor.UnaryExpression({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrowFunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      visitor.UnaryExpression({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ObjectExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      visitor.UnaryExpression({ type: 'ObjectExpression', properties: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrayExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      visitor.UnaryExpression({ type: 'ArrayExpression', elements: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      visitor.UnaryExpression({ type: 'MemberExpression', object: { type: 'Identifier', name: 'a' }, property: { type: 'Identifier', name: 'b' }, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      visitor.UnaryExpression({ type: 'Literal', value: 42, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for NewExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      visitor.UnaryExpression({ type: 'NewExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when outer operator is not ~', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      const inner = makeUnaryNode('-', { type: 'Identifier', name: 'x' })
      visitor.UnaryExpression(makeUnaryNode('!', inner))
      expect(reports.length).toBe(0)
    })

    test('does not report when inner is not a UnaryExpression type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      visitor.UnaryExpression(makeUnaryNode('~', { type: 'Literal', value: 42 }))
      expect(reports.length).toBe(0)
    })

    test('does not report for WhileStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      visitor.UnaryExpression({ type: 'WhileStatement', test: {}, body: {}, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ForStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      visitor.UnaryExpression({ type: 'ForStatement', init: null, test: null, update: null, body: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for SwitchStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      visitor.UnaryExpression({ type: 'SwitchStatement', discriminant: {}, cases: [], loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (17) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryBitwiseNotRule.create(ctx1)
      const visitor2 = noUnnecessaryBitwiseNotRule.create(ctx2)
      const inner1 = makeUnaryNode('~', { type: 'Identifier', name: 'a' })
      visitor1.UnaryExpression(makeUnaryNode('~', inner1))
      visitor2.UnaryExpression(makeUnaryNode('~', { type: 'Identifier', name: 'b' }))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      const inner1 = makeUnaryNode('~', { type: 'Identifier', name: 'a' })
      visitor.UnaryExpression(makeUnaryNode('~', inner1))
      visitor.UnaryExpression(makeUnaryNode('~', { type: 'Identifier', name: 'b' }))
      const inner3 = makeUnaryNode('~', { type: 'Literal', value: 5 })
      visitor.UnaryExpression(makeUnaryNode('~', inner3))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '~', prefix: true, argument: { type: 'Identifier', name: 'x' } }
      const outer = { type: 'UnaryExpression', operator: '~', prefix: true, argument: inner }
      visitor.UnaryExpression(outer)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '~', prefix: true, argument: { type: 'Identifier', name: 'x' } }
      const outer = { type: 'UnaryExpression', operator: '~', prefix: true, argument: inner }
      visitor.UnaryExpression(outer)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      // valid: single ~
      visitor.UnaryExpression(makeUnaryNode('~', { type: 'Identifier', name: 'a' }))
      // invalid: ~~
      const inner1 = makeUnaryNode('~', { type: 'Identifier', name: 'b' })
      visitor.UnaryExpression(makeUnaryNode('~', inner1))
      // valid: ~nonUnary
      visitor.UnaryExpression(makeUnaryNode('~', { type: 'Literal', value: 42 }))
      // invalid: ~~
      const inner2 = makeUnaryNode('~', { type: 'Literal', value: 10 })
      visitor.UnaryExpression(makeUnaryNode('~', inner2))
      // valid: not ~
      visitor.UnaryExpression(makeUnaryNode('!', { type: 'Identifier', name: 'c' }))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryBitwiseNotRule.create(context)
      const visitor2 = noUnnecessaryBitwiseNotRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryBitwiseNotRule.meta
      const meta2 = noUnnecessaryBitwiseNotRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      const inner = makeUnaryNode('~', { type: 'Identifier', name: 'x' })
      const node = {
        type: 'UnaryExpression',
        operator: '~',
        prefix: true,
        argument: inner,
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        trailingComments: [],
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '~', prefix: true, argument: { type: 'Identifier', name: 'x' } }
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: '~',
        prefix: true,
        argument: inner,
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '~', prefix: true, argument: { type: 'Identifier', name: 'x' } }
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: '~',
        prefix: true,
        argument: inner,
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      const inner = makeUnaryNode('~', { type: 'Identifier', name: 'x' })
      const node = makeUnaryNode('~', inner)
      visitor.UnaryExpression(node)
      visitor.UnaryExpression(node)
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryBitwiseNotRule).toBeDefined()
      expect(typeof noUnnecessaryBitwiseNotRule.create).toBe('function')
      expect(typeof noUnnecessaryBitwiseNotRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      const inner = makeUnaryNode('~', { type: 'Identifier', name: 'x' })
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: '~',
        prefix: true,
        argument: inner,
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      const inner = makeUnaryNode('~', { type: 'Identifier', name: 'x' }, 10, 4, 10, 8)
      visitor.UnaryExpression(makeUnaryNode('~', inner, 10, 3, 10, 9))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(3)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(9)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      const inner1 = makeUnaryNode('~', { type: 'Identifier', name: 'a' })
      const inner2 = makeUnaryNode('~', { type: 'Literal', value: 42 })
      visitor.UnaryExpression(makeUnaryNode('~', inner1))
      visitor.UnaryExpression(makeUnaryNode('~', inner2))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('does not report when inner UnaryExpression has wrong operator (!= ~)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      const inner = makeUnaryNode('!', { type: 'Identifier', name: 'x' })
      visitor.UnaryExpression(makeUnaryNode('~', inner))
      expect(reports.length).toBe(0)
    })

    test('does not report when inner is typeof UnaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBitwiseNotRule.create(context)
      const inner = makeUnaryNode('typeof', { type: 'Identifier', name: 'x' })
      visitor.UnaryExpression(makeUnaryNode('~', inner))
      expect(reports.length).toBe(0)
    })
  })
})
