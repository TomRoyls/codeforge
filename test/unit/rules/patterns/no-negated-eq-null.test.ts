import { describe, expect, test, vi } from 'vitest'
import { noNegatedEqNullRule } from '../../../../src/rules/patterns/no-negated-eq-null.js'
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
    getSource: () => 'x != null',
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

function makeBinExpr(
  operator: string,
  left: unknown,
  right: unknown,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 10,
): unknown {
  return {
    type: 'BinaryExpression',
    operator,
    left,
    right,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeNullLiteral(): unknown {
  return { type: 'NullLiteral' }
}

function makeIdentifier(name: string): unknown {
  return { type: 'Identifier', name }
}

// ===== META TESTS (8) =====

describe('no-negated-eq-null rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noNegatedEqNullRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noNegatedEqNullRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noNegatedEqNullRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noNegatedEqNullRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noNegatedEqNullRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning null or undefined', () => {
      const desc = noNegatedEqNullRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/null|undefined/)
    })

    test('should have correct docs URL', () => {
      expect(noNegatedEqNullRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-negated-eq-null',
      )
    })

    test('should have empty schema', () => {
      expect(noNegatedEqNullRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with BinaryExpression', () => {
      const { context } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      expect(visitor).toHaveProperty('BinaryExpression')
      expect(typeof visitor.BinaryExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noNegatedEqNullRule).toBeDefined()
      expect(noNegatedEqNullRule.meta).toBeDefined()
      expect(noNegatedEqNullRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (30) =====

  describe('positive cases — reports negated comparison with null/undefined', () => {
    test('reports x != null', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression(makeBinExpr('!=', makeIdentifier('x'), makeNullLiteral()))
      expect(reports.length).toBe(1)
    })

    test('reports x !== null', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression(makeBinExpr('!==', makeIdentifier('x'), makeNullLiteral()))
      expect(reports.length).toBe(1)
    })

    test('reports x != undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression(makeBinExpr('!=', makeIdentifier('x'), makeIdentifier('undefined')))
      expect(reports.length).toBe(1)
    })

    test('reports x !== undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression(makeBinExpr('!==', makeIdentifier('x'), makeIdentifier('undefined')))
      expect(reports.length).toBe(1)
    })

    test('reports null != x (left is null)', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression(makeBinExpr('!=', makeNullLiteral(), makeIdentifier('x')))
      expect(reports.length).toBe(1)
    })

    test('reports null !== x (left is null)', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression(makeBinExpr('!==', makeNullLiteral(), makeIdentifier('x')))
      expect(reports.length).toBe(1)
    })

    test('reports undefined != x (left is undefined)', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression(makeBinExpr('!=', makeIdentifier('undefined'), makeIdentifier('x')))
      expect(reports.length).toBe(1)
    })

    test('reports undefined !== x (left is undefined)', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression(makeBinExpr('!==', makeIdentifier('undefined'), makeIdentifier('x')))
      expect(reports.length).toBe(1)
    })

    test('report message mentions "== null" or "=== undefined"', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression(makeBinExpr('!=', makeIdentifier('x'), makeNullLiteral()))
      expect(reports[0].message).toContain('== null')
    })

    test('report message mentions "negated comparison"', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression(makeBinExpr('!=', makeIdentifier('x'), makeNullLiteral()))
      expect(reports[0].message.toLowerCase()).toContain('negated comparison')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression(makeBinExpr('!=', makeIdentifier('x'), makeNullLiteral()))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression(makeBinExpr('!=', makeIdentifier('x'), makeNullLiteral()))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input BinaryExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      const node = makeBinExpr('!=', makeIdentifier('x'), makeNullLiteral())
      visitor.BinaryExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression(makeBinExpr('!=', makeIdentifier('x'), makeNullLiteral(), 5, 10, 5, 20))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression(makeBinExpr('!=', makeIdentifier('x'), makeNullLiteral()))
      expect(reports[0].message).toBe(
        'Use `== null` or `=== undefined` instead of negated comparison.',
      )
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression(makeBinExpr('!=', makeIdentifier('a'), makeNullLiteral()))
      visitor.BinaryExpression(makeBinExpr('!==', makeIdentifier('b'), makeIdentifier('undefined')))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression(makeBinExpr('!=', makeIdentifier('a'), makeNullLiteral()))
      visitor.BinaryExpression(makeBinExpr('!==', makeIdentifier('b'), makeIdentifier('undefined')))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports foo != null with Identifier left', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression(makeBinExpr('!=', makeIdentifier('foo'), makeNullLiteral()))
      expect(reports.length).toBe(1)
    })

    test('reports result !== null', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression(makeBinExpr('!==', makeIdentifier('result'), makeNullLiteral()))
      expect(reports.length).toBe(1)
    })

    test('reports obj != undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression(makeBinExpr('!=', makeIdentifier('obj'), makeIdentifier('undefined')))
      expect(reports.length).toBe(1)
    })

    test('reports value !== undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression(makeBinExpr('!==', makeIdentifier('value'), makeIdentifier('undefined')))
      expect(reports.length).toBe(1)
    })

    test('reports null != foo (reversed operands)', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression(makeBinExpr('!=', makeNullLiteral(), makeIdentifier('foo')))
      expect(reports.length).toBe(1)
    })

    test('reports undefined !== result (reversed operands)', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression(makeBinExpr('!==', makeIdentifier('undefined'), makeIdentifier('result')))
      expect(reports.length).toBe(1)
    })

    test('reports report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression(makeBinExpr('!=', makeIdentifier('x'), makeNullLiteral()))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports with NullLiteral on right and operator !=', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '!=',
        left: { type: 'Identifier', name: 'data' },
        right: { type: 'NullLiteral' },
        loc: makeLoc(1, 0, 1, 12),
      })
      expect(reports.length).toBe(1)
    })

    test('reports with Identifier undefined on right and operator !==', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '!==',
        left: { type: 'Identifier', name: 'data' },
        right: { type: 'Identifier', name: 'undefined' },
        loc: makeLoc(1, 0, 1, 16),
      })
      expect(reports.length).toBe(1)
    })

    test('reports NullLiteral on both sides with !=', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression(makeBinExpr('!=', makeNullLiteral(), makeNullLiteral()))
      expect(reports.length).toBe(1)
    })

    test('reports Identifier undefined on both sides with !==', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression(makeBinExpr('!==', makeIdentifier('undefined'), makeIdentifier('undefined')))
      expect(reports.length).toBe(1)
    })

    test('reports NullLiteral left and Identifier undefined right with !=', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression(makeBinExpr('!=', makeNullLiteral(), makeIdentifier('undefined')))
      expect(reports.length).toBe(1)
    })

    test('reports Identifier undefined left and NullLiteral right with !==', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression(makeBinExpr('!==', makeIdentifier('undefined'), makeNullLiteral()))
      expect(reports.length).toBe(1)
    })

    test('reports with different variable names y != null', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression(makeBinExpr('!=', makeIdentifier('y'), makeNullLiteral()))
      expect(reports.length).toBe(1)
    })

    test('report loc end values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression(makeBinExpr('!=', makeIdentifier('x'), makeNullLiteral(), 3, 5, 3, 15))
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(15)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (35) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for x == null (non-negated)', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression(makeBinExpr('==', makeIdentifier('x'), makeNullLiteral()))
      expect(reports.length).toBe(0)
    })

    test('does not report for x === null (non-negated strict)', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression(makeBinExpr('===', makeIdentifier('x'), makeNullLiteral()))
      expect(reports.length).toBe(0)
    })

    test('does not report for x == undefined (non-negated)', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression(makeBinExpr('==', makeIdentifier('x'), makeIdentifier('undefined')))
      expect(reports.length).toBe(0)
    })

    test('does not report for x === undefined (non-negated strict)', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression(makeBinExpr('===', makeIdentifier('x'), makeIdentifier('undefined')))
      expect(reports.length).toBe(0)
    })

    test('does not report for x != y (no null/undefined operand)', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression(makeBinExpr('!=', makeIdentifier('x'), makeIdentifier('y')))
      expect(reports.length).toBe(0)
    })

    test('does not report for x !== y (no null/undefined operand)', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression(makeBinExpr('!==', makeIdentifier('x'), makeIdentifier('y')))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      expect(() => visitor.BinaryExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      expect(() => visitor.BinaryExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong node type Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong node type Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression({ type: 'Literal', value: 42, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      expect(() => visitor.BinaryExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      expect(() => visitor.BinaryExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      expect(() => visitor.BinaryExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      expect(() => visitor.BinaryExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression({ type: 'MemberExpression', object: {}, property: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrowFunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression({ type: 'ExpressionStatement', expression: {}, loc: makeLoc(1, 0, 1, 1) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BlockStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression({ type: 'BlockStatement', body: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ObjectExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression({ type: 'ObjectExpression', properties: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrayExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression({ type: 'ArrayExpression', elements: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ConditionalExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression({ type: 'ConditionalExpression', test: {}, consequent: {}, alternate: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for x != "null" (string, not NullLiteral)', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression(makeBinExpr('!=', makeIdentifier('x'), { type: 'Literal', value: 'null' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for x !== "undefined" (string identifier)', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression(makeBinExpr('!==', makeIdentifier('x'), { type: 'Literal', value: 'undefined' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression with operator +', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression(makeBinExpr('+', makeIdentifier('a'), makeIdentifier('b')))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression with operator -', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression(makeBinExpr('-', makeIdentifier('a'), makeIdentifier('b')))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression with operator <', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression(makeBinExpr('<', makeIdentifier('a'), makeIdentifier('b')))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression with operator >', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression(makeBinExpr('>', makeIdentifier('a'), makeIdentifier('b')))
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier named "isNull" on right with !=', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression(makeBinExpr('!=', makeIdentifier('x'), makeIdentifier('isNull')))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noNegatedEqNullRule.create(ctx1)
      const visitor2 = noNegatedEqNullRule.create(ctx2)
      visitor1.BinaryExpression(makeBinExpr('!=', makeIdentifier('x'), makeNullLiteral()))
      visitor2.BinaryExpression(makeBinExpr('==', makeIdentifier('x'), makeNullLiteral()))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression(makeBinExpr('!=', makeIdentifier('a'), makeNullLiteral()))
      visitor.BinaryExpression(makeBinExpr('==', makeIdentifier('b'), makeNullLiteral()))
      visitor.BinaryExpression(makeBinExpr('!==', makeIdentifier('c'), makeIdentifier('undefined')))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      const node = { type: 'BinaryExpression', operator: '!=', left: { type: 'Identifier', name: 'x' }, right: { type: 'NullLiteral' } }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      const node = { type: 'BinaryExpression', operator: '!=', left: { type: 'Identifier', name: 'x' }, right: { type: 'NullLiteral' } }
      visitor.BinaryExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression(makeBinExpr('==', makeIdentifier('a'), makeNullLiteral()))
      visitor.BinaryExpression(makeBinExpr('!=', makeIdentifier('b'), makeNullLiteral()))
      visitor.BinaryExpression(makeBinExpr('!=', makeIdentifier('c'), makeIdentifier('d')))
      visitor.BinaryExpression(makeBinExpr('!==', makeIdentifier('e'), makeIdentifier('undefined')))
      visitor.BinaryExpression(makeBinExpr('===', makeIdentifier('f'), makeNullLiteral()))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noNegatedEqNullRule.create(context)
      const visitor2 = noNegatedEqNullRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noNegatedEqNullRule.meta
      const meta2 = noNegatedEqNullRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '!=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'NullLiteral' },
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        parenthesized: true,
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression({ type: 'BinaryExpression', operator: '!=', left: { type: 'Identifier', name: 'x' }, right: { type: 'NullLiteral' }, loc: {} })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression({ type: 'BinaryExpression', operator: '!=', left: { type: 'Identifier', name: 'x' }, right: { type: 'NullLiteral' }, loc: { start: { line: 3, column: 5 } } })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      const node = makeBinExpr('!=', makeIdentifier('x'), makeNullLiteral())
      visitor.BinaryExpression(node)
      visitor.BinaryExpression(node)
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noNegatedEqNullRule).toBeDefined()
      expect(typeof noNegatedEqNullRule.create).toBe('function')
      expect(typeof noNegatedEqNullRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression({ type: 'BinaryExpression', operator: '!=', left: { type: 'Identifier', name: 'x' }, right: { type: 'NullLiteral' }, loc: makeLoc(1, 0, 1, 10), _parent: {} })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression(makeBinExpr('!=', makeIdentifier('a'), makeNullLiteral()))
      visitor.BinaryExpression(makeBinExpr('!==', makeIdentifier('b'), makeIdentifier('undefined')))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('node with extra properties on operands still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '!=',
        left: { type: 'Identifier', name: 'x', range: [0, 1], loc: makeLoc(1, 0, 1, 1) },
        right: { type: 'NullLiteral', range: [5, 9], loc: makeLoc(1, 5, 1, 9) },
        loc: makeLoc(1, 0, 1, 9),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when left is Identifier with name "defined"', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression(makeBinExpr('!=', makeIdentifier('defined'), makeIdentifier('y')))
      expect(reports.length).toBe(0)
    })

    test('does not report when operator is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression({ type: 'BinaryExpression', left: makeIdentifier('x'), right: makeNullLiteral(), loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when left and right are missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedEqNullRule.create(context)
      visitor.BinaryExpression({ type: 'BinaryExpression', operator: '!=', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })
  })
})
