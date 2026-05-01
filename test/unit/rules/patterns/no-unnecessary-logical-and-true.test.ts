import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryLogicalAndTrueRule } from '../../../../src/rules/patterns/no-unnecessary-logical-and-true.js'
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
    getSource: () => 'x && true',
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

function makeBinaryExpr(
  left: unknown,
  operator: string,
  right: unknown,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'BinaryExpression',
    operator,
    left,
    right,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeBoolLiteral(value: boolean): unknown {
  return { type: 'BooleanLiteral', value }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-logical-and-true rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryLogicalAndTrueRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryLogicalAndTrueRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryLogicalAndTrueRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryLogicalAndTrueRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryLogicalAndTrueRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning logical AND with true', () => {
      const desc = noUnnecessaryLogicalAndTrueRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/&&.*true|logical.*and/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryLogicalAndTrueRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-logical-and-true.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryLogicalAndTrueRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with BinaryExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      expect(visitor).toHaveProperty('BinaryExpression')
      expect(typeof visitor.BinaryExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryLogicalAndTrueRule).toBeDefined()
      expect(noUnnecessaryLogicalAndTrueRule.meta).toBeDefined()
      expect(noUnnecessaryLogicalAndTrueRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (28) =====

  describe('positive cases — reports unnecessary && true', () => {
    test('reports for x && true (Identifier left)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr({ type: 'Identifier', name: 'x' }, '&&', makeBoolLiteral(true)))
      expect(reports.length).toBe(1)
    })

    test('reports for foo() && true (CallExpression left)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(
        { type: 'CallExpression', callee: { type: 'Identifier', name: 'foo' }, arguments: [] },
        '&&',
        makeBoolLiteral(true),
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.prop && true (MemberExpression left)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(
        { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } },
        '&&',
        makeBoolLiteral(true),
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for 42 && true (NumericLiteral left)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr({ type: 'NumericLiteral', value: 42 }, '&&', makeBoolLiteral(true)))
      expect(reports.length).toBe(1)
    })

    test('reports for "hello" && true (StringLiteral left)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr({ type: 'StringLiteral', value: 'hello' }, '&&', makeBoolLiteral(true)))
      expect(reports.length).toBe(1)
    })

    test('reports for true && true (BooleanLiteral left)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeBoolLiteral(true), '&&', makeBoolLiteral(true)))
      expect(reports.length).toBe(1)
    })

    test('reports for null && true (NullLiteral left)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr({ type: 'NullLiteral' }, '&&', makeBoolLiteral(true)))
      expect(reports.length).toBe(1)
    })

    test('reports for (a && b) && true (nested BinaryExpression left)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      const innerAnd = makeBinaryExpr({ type: 'Identifier', name: 'a' }, '&&', { type: 'Identifier', name: 'b' })
      visitor.BinaryExpression(makeBinaryExpr(innerAnd, '&&', makeBoolLiteral(true)))
      expect(reports.length).toBe(1)
    })

    test('reports for arr[0] && true (computed MemberExpression left)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(
        { type: 'MemberExpression', object: { type: 'Identifier', name: 'arr' }, property: { type: 'NumericLiteral', value: 0 }, computed: true },
        '&&',
        makeBoolLiteral(true),
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for (x + y) && true (BinaryExpression + as left)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      const leftExpr = makeBinaryExpr({ type: 'Identifier', name: 'x' }, '+', { type: 'Identifier', name: 'y' })
      visitor.BinaryExpression(makeBinaryExpr(leftExpr, '&&', makeBoolLiteral(true)))
      expect(reports.length).toBe(1)
    })

    test('reports for !x && true (UnaryExpression left)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(
        { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } },
        '&&',
        makeBoolLiteral(true),
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for new Foo() && true (NewExpression left)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(
        { type: 'NewExpression', callee: { type: 'Identifier', name: 'Foo' }, arguments: [] },
        '&&',
        makeBoolLiteral(true),
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof x && true (UnaryExpression typeof left)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(
        { type: 'UnaryExpression', operator: 'typeof', prefix: true, argument: { type: 'Identifier', name: 'x' } },
        '&&',
        makeBoolLiteral(true),
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for this && true (ThisExpression left)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr({ type: 'ThisExpression' }, '&&', makeBoolLiteral(true)))
      expect(reports.length).toBe(1)
    })

    test('reports for template && true (TemplateLiteral left)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(
        { type: 'TemplateLiteral', quasis: [], expressions: [] },
        '&&',
        makeBoolLiteral(true),
      ))
      expect(reports.length).toBe(1)
    })

    test('report message mentions "&& true"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr({ type: 'Identifier', name: 'x' }, '&&', makeBoolLiteral(true)))
      expect(reports[0].message).toMatch(/&& true/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr({ type: 'Identifier', name: 'x' }, '&&', makeBoolLiteral(true)))
      expect(reports[0].message).toBe(
        'Unnecessary `&& true`. Use `!!leftOperand` or the condition directly.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr({ type: 'Identifier', name: 'x' }, '&&', makeBoolLiteral(true)))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr({ type: 'Identifier', name: 'x' }, '&&', makeBoolLiteral(true)))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input BinaryExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      const node = makeBinaryExpr({ type: 'Identifier', name: 'x' }, '&&', makeBoolLiteral(true))
      visitor.BinaryExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr({ type: 'Identifier', name: 'x' }, '&&', makeBoolLiteral(true), 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr({ type: 'Identifier', name: 'x' }, '&&', makeBoolLiteral(true)))
      visitor.BinaryExpression(makeBinaryExpr({ type: 'Identifier', name: 'y' }, '&&', makeBoolLiteral(true)))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr({ type: 'Identifier', name: 'x' }, '&&', makeBoolLiteral(true)))
      visitor.BinaryExpression(makeBinaryExpr({ type: 'Identifier', name: 'y' }, '&&', makeBoolLiteral(true)))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for a?.b && true (OptionalMemberExpression left)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(
        { type: 'OptionalMemberExpression', object: { type: 'Identifier', name: 'a' }, property: { type: 'Identifier', name: 'b' }, optional: true },
        '&&',
        makeBoolLiteral(true),
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for (a = b) && true (AssignmentExpression left)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(
        { type: 'AssignmentExpression', operator: '=', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } },
        '&&',
        makeBoolLiteral(true),
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for void x && true (UnaryExpression void left)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(
        { type: 'UnaryExpression', operator: 'void', prefix: true, argument: { type: 'Identifier', name: 'x' } },
        '&&',
        makeBoolLiteral(true),
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for [a, b] && true (ArrayExpression left)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(
        { type: 'ArrayExpression', elements: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }] },
        '&&',
        makeBoolLiteral(true),
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for ({}) && true (ObjectExpression left)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(
        { type: 'ObjectExpression', properties: [] },
        '&&',
        makeBoolLiteral(true),
      ))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for x && false (false on right)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr({ type: 'Identifier', name: 'x' }, '&&', makeBoolLiteral(false)))
      expect(reports.length).toBe(0)
    })

    test('does not report for x && y (no boolean literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr({ type: 'Identifier', name: 'x' }, '&&', { type: 'Identifier', name: 'y' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for true && x (true on LEFT not right)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeBoolLiteral(true), '&&', { type: 'Identifier', name: 'x' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for false && x (false on left)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeBoolLiteral(false), '&&', { type: 'Identifier', name: 'x' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for x || true (wrong operator)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr({ type: 'Identifier', name: 'x' }, '||', makeBoolLiteral(true)))
      expect(reports.length).toBe(0)
    })

    test('does not report for x || false (wrong operator)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr({ type: 'Identifier', name: 'x' }, '||', makeBoolLiteral(false)))
      expect(reports.length).toBe(0)
    })

    test('does not report for x | true (bitwise OR)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr({ type: 'Identifier', name: 'x' }, '|', makeBoolLiteral(true)))
      expect(reports.length).toBe(0)
    })

    test('does not report for x & true (bitwise AND)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr({ type: 'Identifier', name: 'x' }, '&', makeBoolLiteral(true)))
      expect(reports.length).toBe(0)
    })

    test('does not report for x + y (wrong operator +)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr({ type: 'Identifier', name: 'x' }, '+', { type: 'Identifier', name: 'y' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for x - y (wrong operator -)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr({ type: 'Identifier', name: 'x' }, '-', { type: 'Identifier', name: 'y' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for x * y (wrong operator *)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr({ type: 'Identifier', name: 'x' }, '*', { type: 'Identifier', name: 'y' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for x / y (wrong operator /)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr({ type: 'Identifier', name: 'x' }, '/', { type: 'Identifier', name: 'y' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for x === y (strict equality)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr({ type: 'Identifier', name: 'x' }, '===', { type: 'Identifier', name: 'y' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for x == y (loose equality)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr({ type: 'Identifier', name: 'x' }, '==', { type: 'Identifier', name: 'y' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for x !== y (strict inequality)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr({ type: 'Identifier', name: 'x' }, '!==', { type: 'Identifier', name: 'y' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for x > y (greater than)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr({ type: 'Identifier', name: 'x' }, '>', { type: 'Identifier', name: 'y' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for x < y (less than)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr({ type: 'Identifier', name: 'x' }, '<', { type: 'Identifier', name: 'y' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for x >= y (greater than or equal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr({ type: 'Identifier', name: 'x' }, '>=', { type: 'Identifier', name: 'y' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for x <= y (less than or equal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr({ type: 'Identifier', name: 'x' }, '<=', { type: 'Identifier', name: 'y' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      expect(() => visitor.BinaryExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      expect(() => visitor.BinaryExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      expect(() => visitor.BinaryExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      expect(() => visitor.BinaryExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      expect(() => visitor.BinaryExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' }, loc: makeLoc(1, 0, 1, 8) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when operator is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        left: { type: 'Identifier', name: 'x' },
        right: makeBoolLiteral(true),
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when right is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when right is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'x' },
        right: null,
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when right is BooleanLiteral false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr({ type: 'Identifier', name: 'x' }, '&&', makeBoolLiteral(false)))
      expect(reports.length).toBe(0)
    })

    test('does not report when right is Literal true (not BooleanLiteral)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr({ type: 'Identifier', name: 'x' }, '&&', { type: 'Literal', value: true }))
      expect(reports.length).toBe(0)
    })

    test('does not report for x && undefined (Identifier right)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr({ type: 'Identifier', name: 'x' }, '&&', { type: 'Identifier', name: 'undefined' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for x && 0 (NumericLiteral right)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr({ type: 'Identifier', name: 'x' }, '&&', { type: 'NumericLiteral', value: 0 }))
      expect(reports.length).toBe(0)
    })

    test('does not report for x && "" (StringLiteral right)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr({ type: 'Identifier', name: 'x' }, '&&', { type: 'StringLiteral', value: '' }))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (17) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryLogicalAndTrueRule.create(ctx1)
      const visitor2 = noUnnecessaryLogicalAndTrueRule.create(ctx2)
      visitor1.BinaryExpression(makeBinaryExpr({ type: 'Identifier', name: 'x' }, '&&', makeBoolLiteral(true)))
      visitor2.BinaryExpression(makeBinaryExpr({ type: 'Identifier', name: 'x' }, '&&', { type: 'Identifier', name: 'y' }))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr({ type: 'Identifier', name: 'x' }, '&&', makeBoolLiteral(true)))
      visitor.BinaryExpression(makeBinaryExpr({ type: 'Identifier', name: 'x' }, '&&', { type: 'Identifier', name: 'y' }))
      visitor.BinaryExpression(makeBinaryExpr({ type: 'Identifier', name: 'z' }, '&&', makeBoolLiteral(true)))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'x' },
        right: makeBoolLiteral(true),
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'x' },
        right: makeBoolLiteral(true),
      }
      visitor.BinaryExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr({ type: 'Identifier', name: 'x' }, '&&', makeBoolLiteral(true)))
      visitor.BinaryExpression(makeBinaryExpr({ type: 'Identifier', name: 'x' }, '&&', { type: 'Identifier', name: 'y' }))
      visitor.BinaryExpression(makeBinaryExpr({ type: 'Identifier', name: 'x' }, '||', makeBoolLiteral(true)))
      visitor.BinaryExpression(makeBinaryExpr({ type: 'Identifier', name: 'z' }, '&&', makeBoolLiteral(true)))
      visitor.BinaryExpression(makeBinaryExpr({ type: 'Identifier', name: 'a' }, '&&', makeBoolLiteral(false)))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryLogicalAndTrueRule.create(context)
      const visitor2 = noUnnecessaryLogicalAndTrueRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryLogicalAndTrueRule.meta
      const meta2 = noUnnecessaryLogicalAndTrueRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'x' },
        right: makeBoolLiteral(true),
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        trailingComments: [],
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'x' },
        right: makeBoolLiteral(true),
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'x' },
        right: makeBoolLiteral(true),
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      const node = makeBinaryExpr({ type: 'Identifier', name: 'x' }, '&&', makeBoolLiteral(true))
      visitor.BinaryExpression(node)
      visitor.BinaryExpression(node)
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryLogicalAndTrueRule).toBeDefined()
      expect(typeof noUnnecessaryLogicalAndTrueRule.create).toBe('function')
      expect(typeof noUnnecessaryLogicalAndTrueRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'x' },
        right: makeBoolLiteral(true),
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr({ type: 'Identifier', name: 'x' }, '&&', makeBoolLiteral(true), 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles deeply nested && true patterns', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      // b && true — inner expression
      const innerExpr = makeBinaryExpr({ type: 'Identifier', name: 'b' }, '&&', makeBoolLiteral(true))
      // Feed the inner expression directly to the visitor
      visitor.BinaryExpression(innerExpr)
      expect(reports.length).toBe(1)
    })

    test('handles node with Symbol properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      const sym = Symbol('test')
      const node: Record<string | symbol, unknown> = {
        type: 'BinaryExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'x' },
        right: makeBoolLiteral(true),
        loc: makeLoc(1, 0, 1, 10),
        [sym]: 'symbol-value',
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('does not report when right is a raw object without type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalAndTrueRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr({ type: 'Identifier', name: 'x' }, '&&', { value: true }))
      expect(reports.length).toBe(0)
    })
  })
})
