import { describe, expect, test, vi } from 'vitest'
import { noCompareNegationRule } from '../../../../src/rules/correctness/no-compare-negation.js'
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

function makeUnaryNot(argument: unknown, loc = makeLoc(1, 0, 1, 5)): unknown {
  return {
    type: 'UnaryExpression',
    operator: '!',
    prefix: true,
    argument,
    loc,
  }
}

function makeBinaryExpr(
  operator: string,
  left: unknown,
  right: unknown,
  loc = makeLoc(1, 0, 1, 20),
): unknown {
  return {
    type: 'BinaryExpression',
    operator,
    left,
    right,
    loc,
  }
}

// ===== META TESTS (8) =====

describe('no-compare-negation rule', () => {
  describe('meta', () => {
    test('should have correct type "problem"', () => {
      expect(noCompareNegationRule.meta.type).toBe('problem')
    })

    test('should have severity "warn"', () => {
      expect(noCompareNegationRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noCompareNegationRule.meta.docs?.category).toBe('patterns')
    })

    test('should be recommended', () => {
      expect(noCompareNegationRule.meta.docs?.recommended).toBe(true)
    })

    test('should have a description', () => {
      expect(noCompareNegationRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning negation', () => {
      const desc = noCompareNegationRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/negation/)
    })

    test('should have correct docs URL', () => {
      expect(noCompareNegationRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/correctness/no-compare-negation.md',
      )
    })

    test('should have empty schema', () => {
      expect(noCompareNegationRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with BinaryExpression', () => {
      const { context } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      expect(visitor).toHaveProperty('BinaryExpression')
      expect(typeof visitor.BinaryExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noCompareNegationRule).toBeDefined()
      expect(noCompareNegationRule.meta).toBeDefined()
      expect(noCompareNegationRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (35) =====

  describe('positive cases — reports negation in left operand', () => {
    test('reports for !x === y', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('===', makeUnaryNot({ type: 'Identifier', name: 'x' }), { type: 'Identifier', name: 'y' }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for !x !== y', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('!==', makeUnaryNot({ type: 'Identifier', name: 'x' }), { type: 'Identifier', name: 'y' }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for !x == y', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('==', makeUnaryNot({ type: 'Identifier', name: 'x' }), { type: 'Identifier', name: 'y' }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for !x != y', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('!=', makeUnaryNot({ type: 'Identifier', name: 'x' }), { type: 'Identifier', name: 'y' }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for !foo === bar', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('===', makeUnaryNot({ type: 'Identifier', name: 'foo' }), { type: 'Identifier', name: 'bar' }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for !a === b with literal right operand', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('===', makeUnaryNot({ type: 'Identifier', name: 'a' }), { type: 'Literal', value: 0 }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for !x === true', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('===', makeUnaryNot({ type: 'Identifier', name: 'x' }), { type: 'Literal', value: true }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for !x === false', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('===', makeUnaryNot({ type: 'Identifier', name: 'x' }), { type: 'Literal', value: false }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for !x === null', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('===', makeUnaryNot({ type: 'Identifier', name: 'x' }), { type: 'Literal', value: null }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for !x === ""', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('===', makeUnaryNot({ type: 'Identifier', name: 'x' }), { type: 'Literal', value: '' }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for !x == undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('==', makeUnaryNot({ type: 'Identifier', name: 'x' }), { type: 'Identifier', name: 'undefined' }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for !(a && b) === c', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr(
          '===',
          makeUnaryNot({
            type: 'LogicalExpression',
            operator: '&&',
            left: { type: 'Identifier', name: 'a' },
            right: { type: 'Identifier', name: 'b' },
          }),
          { type: 'Identifier', name: 'c' },
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for !(a || b) !== c', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr(
          '!==',
          makeUnaryNot({
            type: 'LogicalExpression',
            operator: '||',
            left: { type: 'Identifier', name: 'a' },
            right: { type: 'Identifier', name: 'b' },
          }),
          { type: 'Identifier', name: 'c' },
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for !obj.prop === value with member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr(
          '===',
          makeUnaryNot({
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'prop' },
          }),
          { type: 'Identifier', name: 'value' },
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for !arr[0] === value with computed member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr(
          '===',
          makeUnaryNot({
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'arr' },
            property: { type: 'Literal', value: 0 },
            computed: true,
          }),
          { type: 'Identifier', name: 'value' },
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for !fn() === result with call expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr(
          '===',
          makeUnaryNot({
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'fn' },
            arguments: [],
          }),
          { type: 'Identifier', name: 'result' },
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for !true === false with literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('===', makeUnaryNot({ type: 'Literal', value: true }), { type: 'Literal', value: false }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for !0 === 1 with number literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('===', makeUnaryNot({ type: 'Literal', value: 0 }), { type: 'Literal', value: 1 }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for !"" === "hello" with string literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('===', makeUnaryNot({ type: 'Literal', value: '' }), { type: 'Literal', value: 'hello' }),
      )
      expect(reports.length).toBe(1)
    })

    test('report message mentions the operator ===', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('===', makeUnaryNot({ type: 'Identifier', name: 'x' }), { type: 'Identifier', name: 'y' }),
      )
      expect(reports[0].message).toContain('===')
    })

    test('report message mentions the operator !==', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('!==', makeUnaryNot({ type: 'Identifier', name: 'x' }), { type: 'Identifier', name: 'y' }),
      )
      expect(reports[0].message).toContain('!==')
    })

    test('report message mentions the operator ==', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('==', makeUnaryNot({ type: 'Identifier', name: 'x' }), { type: 'Identifier', name: 'y' }),
      )
      expect(reports[0].message).toContain('==')
    })

    test('report message mentions the operator !=', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('!=', makeUnaryNot({ type: 'Identifier', name: 'x' }), { type: 'Identifier', name: 'y' }),
      )
      expect(reports[0].message).toContain('!=')
    })

    test('report message mentions "negation"', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('===', makeUnaryNot({ type: 'Identifier', name: 'x' }), { type: 'Identifier', name: 'y' }),
      )
      expect(reports[0].message).toMatch(/negation/i)
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('===', makeUnaryNot({ type: 'Identifier', name: 'x' }), { type: 'Identifier', name: 'y' }),
      )
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('===', makeUnaryNot({ type: 'Identifier', name: 'x' }), { type: 'Identifier', name: 'y' }),
      )
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the left UnaryExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      const leftNode = makeUnaryNot({ type: 'Identifier', name: 'x' })
      visitor.BinaryExpression(
        makeBinaryExpr('===', leftNode, { type: 'Identifier', name: 'y' }),
      )
      expect(reports[0].node).toBe(leftNode)
    })

    test('report loc values are preserved from left node', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      const leftNode = makeUnaryNot({ type: 'Identifier', name: 'x' }, makeLoc(5, 10, 5, 13))
      visitor.BinaryExpression(
        makeBinaryExpr('===', leftNode, { type: 'Identifier', name: 'y' }),
      )
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('===', makeUnaryNot({ type: 'Identifier', name: 'x' }), { type: 'Identifier', name: 'y' }),
      )
      visitor.BinaryExpression(
        makeBinaryExpr('!==', makeUnaryNot({ type: 'Identifier', name: 'a' }), { type: 'Identifier', name: 'b' }),
      )
      expect(reports.length).toBe(2)
    })

    test('all reports have message property', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('===', makeUnaryNot({ type: 'Identifier', name: 'x' }), { type: 'Identifier', name: 'y' }),
      )
      visitor.BinaryExpression(
        makeBinaryExpr('==', makeUnaryNot({ type: 'Identifier', name: 'a' }), { type: 'Identifier', name: 'b' }),
      )
      expect(reports[0].message).toBeTruthy()
      expect(reports[1].message).toBeTruthy()
    })

    test('reports for !x != y with loose equality', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('!=', makeUnaryNot({ type: 'Identifier', name: 'x' }), { type: 'Literal', value: 0 }),
      )
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('===', makeUnaryNot({ type: 'Identifier', name: 'x' }), { type: 'Identifier', name: 'y' }),
      )
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for negated call with args === literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr(
          '===',
          makeUnaryNot({
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'isEnabled' },
            arguments: [{ type: 'Identifier', name: 'flag' }],
          }),
          { type: 'Literal', value: true },
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for negated binary expression === literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr(
          '===',
          makeUnaryNot({
            type: 'BinaryExpression',
            operator: '>',
            left: { type: 'Identifier', name: 'a' },
            right: { type: 'Identifier', name: 'b' },
          }),
          { type: 'Literal', value: false },
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for negated ternary === identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr(
          '===',
          makeUnaryNot({
            type: 'ConditionalExpression',
            test: { type: 'Identifier', name: 'cond' },
            consequent: { type: 'Literal', value: 1 },
            alternate: { type: 'Literal', value: 0 },
          }),
          { type: 'Identifier', name: 'expected' },
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for negated typeof === string', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr(
          '===',
          makeUnaryNot({
            type: 'UnaryExpression',
            operator: 'typeof',
            prefix: true,
            argument: { type: 'Identifier', name: 'x' },
          }),
          { type: 'Literal', value: 'string' },
        ),
      )
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (32) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for x === y without negation', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('===', { type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for x !== y without negation', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('!==', { type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for x == y without negation', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('==', { type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for x != y without negation', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('!=', { type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for x + y — non-comparison operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('+', { type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for x - y — non-comparison operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('-', { type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for x * y — non-comparison operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('*', { type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for x / y — non-comparison operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('/', { type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for x > y — non-comparison operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('>', { type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for x < y — non-comparison operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('<', { type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for x >= y — non-comparison operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('>=', { type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for x <= y — non-comparison operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('<=', { type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for x in y — in operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('in', { type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for x instanceof y — instanceof operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('instanceof', { type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for negation in right operand: x === !y', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('===', { type: 'Identifier', name: 'x' }, makeUnaryNot({ type: 'Identifier', name: 'y' })),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for negation in right operand: x !== !y', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('!==', { type: 'Identifier', name: 'x' }, makeUnaryNot({ type: 'Identifier', name: 'y' })),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for ~x === y — bitwise NOT is not negation', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr(
          '===',
          {
            type: 'UnaryExpression',
            operator: '~',
            prefix: true,
            argument: { type: 'Identifier', name: 'x' },
            loc: makeLoc(1, 0, 1, 5),
          },
          { type: 'Identifier', name: 'y' },
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for -x === y — minus is not negation', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr(
          '===',
          {
            type: 'UnaryExpression',
            operator: '-',
            prefix: true,
            argument: { type: 'Identifier', name: 'x' },
            loc: makeLoc(1, 0, 1, 5),
          },
          { type: 'Identifier', name: 'y' },
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for +x === y — unary plus is not negation', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr(
          '===',
          {
            type: 'UnaryExpression',
            operator: '+',
            prefix: true,
            argument: { type: 'Identifier', name: 'x' },
            loc: makeLoc(1, 0, 1, 5),
          },
          { type: 'Identifier', name: 'y' },
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof x === y — typeof is not negation', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr(
          '===',
          {
            type: 'UnaryExpression',
            operator: 'typeof',
            prefix: true,
            argument: { type: 'Identifier', name: 'x' },
            loc: makeLoc(1, 0, 1, 5),
          },
          { type: 'Literal', value: 'string' },
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for void x === y — void is not negation', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr(
          '===',
          {
            type: 'UnaryExpression',
            operator: 'void',
            prefix: true,
            argument: { type: 'Identifier', name: 'x' },
            loc: makeLoc(1, 0, 1, 5),
          },
          { type: 'Identifier', name: 'y' },
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      expect(() => visitor.BinaryExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      expect(() => visitor.BinaryExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      expect(() => visitor.BinaryExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      expect(() => visitor.BinaryExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      expect(() => visitor.BinaryExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for non-BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report when left is Literal in ===', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('===', { type: 'Literal', value: 1 }, { type: 'Identifier', name: 'y' }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when left is MemberExpression in ===', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr(
          '===',
          {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'prop' },
          },
          { type: 'Identifier', name: 'y' },
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when left is CallExpression in ===', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr(
          '===',
          {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'fn' },
            arguments: [],
          },
          { type: 'Identifier', name: 'y' },
        ),
      )
      expect(reports.length).toBe(0)
    })


  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noCompareNegationRule.create(ctx1)
      const visitor2 = noCompareNegationRule.create(ctx2)
      visitor1.BinaryExpression(
        makeBinaryExpr('===', makeUnaryNot({ type: 'Identifier', name: 'x' }), { type: 'Identifier', name: 'y' }),
      )
      visitor2.BinaryExpression(
        makeBinaryExpr('===', { type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }),
      )
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly with mixed valid/invalid', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('===', makeUnaryNot({ type: 'Identifier', name: 'x' }), { type: 'Identifier', name: 'y' }),
      )
      visitor.BinaryExpression(
        makeBinaryExpr('===', { type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }),
      )
      visitor.BinaryExpression(
        makeBinaryExpr('==', makeUnaryNot({ type: 'Identifier', name: 'c' }), { type: 'Literal', value: 0 }),
      )
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: makeUnaryNot({ type: 'Identifier', name: 'x' }),
        right: { type: 'Identifier', name: 'y' },
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '===',
        left: makeUnaryNot({ type: 'Identifier', name: 'x' }),
        right: { type: 'Identifier', name: 'y' },
        loc: makeLoc(1, 0, 1, 20),
        range: [0, 20],
        extra: true,
        trailingComments: [],
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '===',
        left: makeUnaryNot({ type: 'Identifier', name: 'x' }),
        right: { type: 'Identifier', name: 'y' },
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '===',
        left: makeUnaryNot({ type: 'Identifier', name: 'x' }, { start: { line: 3, column: 5 }, end: { line: 3, column: 8 } }),
        right: { type: 'Identifier', name: 'y' },
        loc: { start: { line: 3, column: 0 }, end: { line: 3, column: 15 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      const node = makeBinaryExpr('===', makeUnaryNot({ type: 'Identifier', name: 'x' }), { type: 'Identifier', name: 'y' })
      visitor.BinaryExpression(node)
      visitor.BinaryExpression(node)
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(3)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noCompareNegationRule.create(context)
      const visitor2 = noCompareNegationRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noCompareNegationRule.meta
      const meta2 = noCompareNegationRule.meta
      expect(meta1).toBe(meta2)
    })

    test('rule exports are correct', () => {
      expect(noCompareNegationRule).toBeDefined()
      expect(typeof noCompareNegationRule.create).toBe('function')
      expect(typeof noCompareNegationRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '===',
        left: makeUnaryNot({ type: 'Identifier', name: 'x' }),
        right: { type: 'Identifier', name: 'y' },
        loc: makeLoc(1, 0, 1, 20),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr(
          '===',
          makeUnaryNot({ type: 'Identifier', name: 'x' }, makeLoc(10, 4, 10, 7)),
          { type: 'Identifier', name: 'y' },
        ),
      )
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(7)
    })

    test('mixed valid/invalid count correctly across all operators', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeUnaryNot({ type: 'Identifier', name: 'x' }), { type: 'Identifier', name: 'y' }))
      visitor.BinaryExpression(makeBinaryExpr('!==', makeUnaryNot({ type: 'Identifier', name: 'x' }), { type: 'Identifier', name: 'y' }))
      visitor.BinaryExpression(makeBinaryExpr('==', makeUnaryNot({ type: 'Identifier', name: 'x' }), { type: 'Identifier', name: 'y' }))
      visitor.BinaryExpression(makeBinaryExpr('!=', makeUnaryNot({ type: 'Identifier', name: 'x' }), { type: 'Identifier', name: 'y' }))
      visitor.BinaryExpression(makeBinaryExpr('===', { type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }))
      visitor.BinaryExpression(makeBinaryExpr('==', { type: 'Identifier', name: 'c' }, { type: 'Identifier', name: 'd' }))
      expect(reports.length).toBe(4)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('===', makeUnaryNot({ type: 'Identifier', name: 'x' }), { type: 'Identifier', name: 'y' }),
      )
      visitor.BinaryExpression(
        makeBinaryExpr('!==', makeUnaryNot({ type: 'Identifier', name: 'a' }), { type: 'Identifier', name: 'b' }),
      )
      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('===')
      expect(reports[1].message).toContain('!==')
    })

    test('handles deeply nested negation argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegationRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr(
          '===',
          makeUnaryNot({
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: { type: 'Identifier', name: 'obj' },
              property: { type: 'Identifier', name: 'method' },
            },
            arguments: [{ type: 'Identifier', name: 'arg' }],
          }),
          { type: 'Literal', value: true },
        ),
      )
      expect(reports.length).toBe(1)
    })
  })
})
