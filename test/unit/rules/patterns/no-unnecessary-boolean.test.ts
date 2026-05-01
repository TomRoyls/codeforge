import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryBooleanRule } from '../../../../src/rules/patterns/no-unnecessary-boolean.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  node?: unknown
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
    getSource: () => 'x === true',
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

function makeLoc(startLine: number, startCol: number, endLine: number, endCol: number) {
  return {
    start: { line: startLine, column: startCol },
    end: { line: endLine, column: endCol },
  }
}

function makeBinaryExpr(
  operator: string,
  left: unknown,
  right: unknown,
  loc?: ReturnType<typeof makeLoc>,
): unknown {
  const node: Record<string, unknown> = {
    type: 'BinaryExpression',
    operator,
    left,
    right,
  }
  if (loc) node.loc = loc
  return node
}

describe('no-unnecessary-boolean rule', () => {
  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryBooleanRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryBooleanRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryBooleanRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryBooleanRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryBooleanRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning boolean and comparison', () => {
      const desc = noUnnecessaryBooleanRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/boolean/)
      expect(desc).toMatch(/comparison/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryBooleanRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-boolean',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryBooleanRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====
  describe('structure', () => {
    test('create() returns visitor with BinaryExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      expect(visitor).toHaveProperty('BinaryExpression')
      expect(typeof visitor.BinaryExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryBooleanRule).toBeDefined()
      expect(noUnnecessaryBooleanRule.meta).toBeDefined()
      expect(noUnnecessaryBooleanRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES (20) =====
  describe('positive cases — reports unnecessary boolean comparisons', () => {
    test('reports x === true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('===', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: true }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports x === false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('===', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: false }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports x !== true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('!==', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: true }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports x !== false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('!==', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: false }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports x == true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('==', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: true }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports x != false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('!=', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: false }),
      )
      expect(reports.length).toBe(1)
    })

    test('message mentions "Unnecessary"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('===', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: true }),
      )
      expect(reports[0].message).toContain('Unnecessary')
    })

    test('message mentions "boolean literal"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('===', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: true }),
      )
      expect(reports[0].message.toLowerCase()).toContain('boolean literal')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr(
          '===',
          { type: 'Identifier', name: 'x' },
          { type: 'Literal', value: true },
          makeLoc(1, 0, 1, 10),
        ),
      )
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      const node = makeBinaryExpr(
        '===',
        { type: 'Identifier', name: 'x' },
        { type: 'Literal', value: true },
      )
      visitor.BinaryExpression(node)
      expect(reports[0].node).toBeDefined()
    })

    test('report node property matches the original node passed in', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      const node = makeBinaryExpr(
        '===',
        { type: 'Identifier', name: 'x' },
        { type: 'Literal', value: true },
        makeLoc(1, 0, 1, 10),
      )
      visitor.BinaryExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('reports when left is boolean literal (true === x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('===', { type: 'Literal', value: true }, { type: 'Identifier', name: 'x' }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports when left is boolean literal (false !== x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('!==', { type: 'Literal', value: false }, { type: 'Identifier', name: 'x' }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports with correct location line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr(
          '===',
          { type: 'Identifier', name: 'x' },
          { type: 'Literal', value: true },
          makeLoc(5, 8, 5, 18),
        ),
      )
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(18)
    })

    test('reports multiple violations accumulated in same visitor', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('===', { type: 'Identifier', name: 'a' }, { type: 'Literal', value: true }),
      )
      visitor.BinaryExpression(
        makeBinaryExpr('!==', { type: 'Identifier', name: 'b' }, { type: 'Literal', value: false }),
      )
      visitor.BinaryExpression(
        makeBinaryExpr('==', { type: 'Identifier', name: 'c' }, { type: 'Literal', value: true }),
      )
      expect(reports.length).toBe(3)
    })

    test('reports x != true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('!=', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: true }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports x == false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('==', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: false }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports true === x with boolean on left side', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('===', { type: 'Literal', value: true }, { type: 'Identifier', name: 'flag' }),
      )
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('true')
    })

    test('reports false === x with boolean on left side', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('===', { type: 'Literal', value: false }, { type: 'Identifier', name: 'flag' }),
      )
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('false')
    })

    test('each violation is reported once per call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('===', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: true }),
      )
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES (35) =====
  describe('negative cases — does NOT report', () => {
    test('does not report x === 1 (number literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('===', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: 1 }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report x === "hello" (string literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('===', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: 'hello' }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report x === null (null literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('===', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: null }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report x === undefined (identifier undefined)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr(
          '===',
          { type: 'Identifier', name: 'x' },
          { type: 'Identifier', name: 'undefined' },
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report x > 1 (wrong operator)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('>', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: 1 }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report x < 1 (wrong operator)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('<', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: 1 }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report x >= 1 (wrong operator)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('>=', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: 1 }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report x <= 1 (wrong operator)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('<=', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: 1 }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report x + 1 (plus operator)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('+', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: 1 }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report x instanceof Foo', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr(
          'instanceof',
          { type: 'Identifier', name: 'x' },
          { type: 'Identifier', name: 'Foo' },
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report x in obj', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('in', { type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'obj' }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report non-BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'foo' },
        arguments: [],
      })
      expect(reports.length).toBe(0)
    })

    test('handles null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      expect(() => visitor.BinaryExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report x === y (no boolean literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr(
          '===',
          { type: 'Identifier', name: 'x' },
          { type: 'Identifier', name: 'y' },
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report comparison with number Literal (x === 42)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('===', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: 42 }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report comparison with string Literal (x === "abc")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('===', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: 'abc' }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report UnaryExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression({
        type: 'UnaryExpression',
        operator: '!',
        argument: { type: 'Identifier', name: 'x' },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report LogicalExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression({
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'y' },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      expect(() => visitor.BinaryExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report node with missing left/right', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '===',
      })
      expect(reports.length).toBe(0)
    })

    test('does not report node with null left', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '===',
        left: null,
        right: { type: 'Literal', value: true },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report node with null right', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '===',
        left: { type: 'Identifier', name: 'x' },
        right: null,
      })
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (string primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      expect(() => visitor.BinaryExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (number primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      expect(() => visitor.BinaryExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report x !== y with no boolean literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr(
          '!==',
          { type: 'Identifier', name: 'x' },
          { type: 'Identifier', name: 'y' },
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report MemberExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression({
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'prop' },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report node with wrong type Literal (left is number)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('===', { type: 'Literal', value: 1 }, { type: 'Identifier', name: 'x' }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report node with wrong type Literal (right is string)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('===', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: 'str' }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when left is Identifier not Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr(
          '===',
          { type: 'Identifier', name: 'x' },
          { type: 'Identifier', name: 'y' },
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report ConditionalExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression({
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'x' },
        consequent: { type: 'Literal', value: true },
        alternate: { type: 'Literal', value: false },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ** operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('**', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: true }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for % operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('%', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: true }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for & operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('&', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: true }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for | operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('|', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: true }),
      )
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====
  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryBooleanRule.create(ctx1)
      const visitor2 = noUnnecessaryBooleanRule.create(ctx2)

      visitor1.BinaryExpression(
        makeBinaryExpr('===', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: true }),
      )
      visitor2.BinaryExpression(
        makeBinaryExpr('===', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: 1 }),
      )

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('===', { type: 'Identifier', name: 'a' }, { type: 'Literal', value: true }),
      )
      visitor.BinaryExpression(
        makeBinaryExpr('!==', { type: 'Identifier', name: 'b' }, { type: 'Literal', value: false }),
      )
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      const node = makeBinaryExpr(
        '===',
        { type: 'Identifier', name: 'x' },
        { type: 'Literal', value: true },
      )
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports with mixed violations — boolean left and right positions', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('===', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: true }),
      )
      visitor.BinaryExpression(
        makeBinaryExpr('===', { type: 'Literal', value: false }, { type: 'Identifier', name: 'y' }),
      )
      expect(reports.length).toBe(2)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      const node = makeBinaryExpr(
        '===',
        { type: 'Identifier', name: 'x' },
        { type: 'Literal', value: true },
      )
      visitor.BinaryExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('reports true === true (both sides boolean) only once', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('===', { type: 'Literal', value: true }, { type: 'Literal', value: true }),
      )
      // Right side is checked first, so it reports once for right boolean
      expect(reports.length).toBe(1)
    })

    test('reports false === true (both sides boolean)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('===', { type: 'Literal', value: false }, { type: 'Literal', value: true }),
      )
      expect(reports.length).toBe(1)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('===', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: true }),
      )
      visitor.BinaryExpression(
        makeBinaryExpr('===', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: true }),
      )
      visitor.BinaryExpression(
        makeBinaryExpr('===', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: true }),
      )
      expect(reports.length).toBe(3)
    })

    test('create returns a new visitor each call (not same reference)', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryBooleanRule.create(context)
      const visitor2 = noUnnecessaryBooleanRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('mixed violations and non-violations count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      // reports — boolean comparison
      visitor.BinaryExpression(
        makeBinaryExpr('===', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: true }),
      )
      // does NOT report — number comparison
      visitor.BinaryExpression(
        makeBinaryExpr('===', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: 1 }),
      )
      // reports — boolean comparison
      visitor.BinaryExpression(
        makeBinaryExpr('!==', { type: 'Identifier', name: 'y' }, { type: 'Literal', value: false }),
      )
      // does NOT report — wrong operator
      visitor.BinaryExpression(
        makeBinaryExpr('>', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: true }),
      )
      // reports — boolean comparison
      visitor.BinaryExpression(
        makeBinaryExpr('==', { type: 'Identifier', name: 'z' }, { type: 'Literal', value: true }),
      )
      expect(reports.length).toBe(3)
    })

    test('handles node with missing operator property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: true },
      })
      expect(reports.length).toBe(0)
    })

    test('handles node where left is a primitive string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '===',
        left: 'not-an-object',
        right: { type: 'Literal', value: true },
      })
      expect(reports.length).toBe(0)
    })

    test('handles node where right is a primitive number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '===',
        left: { type: 'Identifier', name: 'x' },
        right: 42,
      })
      expect(reports.length).toBe(0)
    })

    test('location with specific line/column values from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr(
          '===',
          { type: 'Identifier', name: 'x' },
          { type: 'Literal', value: true },
          makeLoc(10, 4, 10, 14),
        ),
      )
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('handles boolean comparison with CallExpression left', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr(
          '===',
          { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
          { type: 'Literal', value: true },
        ),
      )
      expect(reports.length).toBe(1)
    })
  })

  // ===== ADDITIONAL CASES (15) =====
  describe('additional coverage', () => {
    test('meta is the same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryBooleanRule.meta
      const meta2 = noUnnecessaryBooleanRule.meta
      expect(meta1).toBe(meta2)
    })

    test('message is consistent across violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('===', { type: 'Identifier', name: 'a' }, { type: 'Literal', value: true }),
      )
      visitor.BinaryExpression(
        makeBinaryExpr('===', { type: 'Identifier', name: 'b' }, { type: 'Literal', value: true }),
      )
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('x !== true shows correct operator in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('!==', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: true }),
      )
      expect(reports[0].message).toContain('!==')
    })

    test('x === true shows correct operator and value in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('===', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: true }),
      )
      expect(reports[0].message).toContain('===')
      expect(reports[0].message).toContain('true')
    })

    test('true === x (left boolean) shows correct value and operator in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('===', { type: 'Literal', value: true }, { type: 'Identifier', name: 'x' }),
      )
      expect(reports[0].message).toContain('===')
      expect(reports[0].message).toContain('true')
    })

    test('false !== x shows correct value in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr('!==', { type: 'Literal', value: false }, { type: 'Identifier', name: 'x' }),
      )
      expect(reports[0].message).toContain('false')
      expect(reports[0].message).toContain('!==')
    })

    test('reports with different variable names — flag === true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr(
          '===',
          { type: 'Identifier', name: 'flag' },
          { type: 'Literal', value: true },
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports with different variable names — isActive !== false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr(
          '!==',
          { type: 'Identifier', name: 'isActive' },
          { type: 'Literal', value: false },
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports with different variable names — visible == true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr(
          '==',
          { type: 'Identifier', name: 'visible' },
          { type: 'Literal', value: true },
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports with MemberExpression left side — obj.prop === true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr(
          '===',
          { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } },
          { type: 'Literal', value: true },
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports with CallExpression right side and boolean left — true === fn()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr(
          '===',
          { type: 'Literal', value: true },
          { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('does not report TemplateLiteral on right — x === `str`', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr(
          '===',
          { type: 'Identifier', name: 'x' },
          { type: 'TemplateLiteral', expressions: [], quasis: [] },
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when both sides are identifiers', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr(
          '===',
          { type: 'Identifier', name: 'a' },
          { type: 'Identifier', name: 'b' },
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('rule handles boolean literal with value false on right with == operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr(
          '==',
          { type: 'Identifier', name: 'x' },
          { type: 'Literal', value: false },
        ),
      )
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('false')
    })

    test('rule handles boolean literal with != operator on left side', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanRule.create(context)
      visitor.BinaryExpression(
        makeBinaryExpr(
          '!=',
          { type: 'Literal', value: true },
          { type: 'Identifier', name: 'x' },
        ),
      )
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('true')
      expect(reports[0].message).toContain('!=')
    })
  })
})
