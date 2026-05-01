import { describe, expect, test, vi } from 'vitest'
import { noApproximateConstantsRule } from '../../../../src/rules/correctness/no-approximate-constants.js'
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
    getSource: () => 'const x = 3.14159',
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

function makeLiteral(value: unknown, line = 1, column = 0): unknown {
  return {
    type: 'Literal',
    value,
    loc: makeLoc(line, column, line, column + 8),
  }
}

describe('no-approximate-constants rule', () => {
  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noApproximateConstantsRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noApproximateConstantsRule.meta.severity).toBe('warn')
    })

    test('should have correct category "correctness"', () => {
      expect(noApproximateConstantsRule.meta.docs?.category).toBe('correctness')
    })

    test('should not be recommended', () => {
      expect(noApproximateConstantsRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noApproximateConstantsRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning approximate and constant', () => {
      const desc = noApproximateConstantsRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/approximate/)
      expect(desc).toMatch(/constant/)
    })

    test('should have correct docs URL', () => {
      expect(noApproximateConstantsRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-approximate-constants',
      )
    })

    test('should have empty schema', () => {
      expect(noApproximateConstantsRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====
  describe('structure', () => {
    test('create() returns visitor with Literal', () => {
      const { context } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      expect(visitor).toHaveProperty('Literal')
      expect(typeof visitor.Literal).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noApproximateConstantsRule).toBeDefined()
      expect(noApproximateConstantsRule.meta).toBeDefined()
      expect(noApproximateConstantsRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES (20) =====
  describe('positive cases — reports approximate constants', () => {
    test('reports 3.14159 as Math.PI', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal(makeLiteral(3.14159))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Math.PI')
    })

    test('reports 2.71828 as Math.E', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal(makeLiteral(2.71828))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Math.E')
    })

    test('reports 1.41421 as Math.SQRT2', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal(makeLiteral(1.41421))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Math.SQRT2')
    })

    test('reports 0.70711 as Math.SQRT1_2', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal(makeLiteral(0.70711))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Math.SQRT1_2')
    })

    test('reports 1.61803 as golden ratio', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal(makeLiteral(1.61803))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Golden ratio')
    })

    test('reports full precision Math.PI', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal(makeLiteral(Math.PI))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Math.PI')
    })

    test('reports full precision Math.E', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal(makeLiteral(Math.E))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Math.E')
    })

    test('reports full precision Math.SQRT2', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal(makeLiteral(Math.SQRT2))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Math.SQRT2')
    })

    test('reports full precision Math.SQRT1_2', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal(makeLiteral(Math.SQRT1_2))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Math.SQRT1_2')
    })

    test('reports full precision golden ratio', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal(makeLiteral(1.618033988749895))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Golden ratio')
    })

    test('message contains "Use"', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal(makeLiteral(3.14159))
      expect(reports[0].message).toContain('Use')
    })

    test('message contains the literal value string', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal(makeLiteral(3.14159))
      expect(reports[0].message).toContain('3.14159')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal(makeLiteral(3.14159))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal(makeLiteral(3.14159))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches original node', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      const node = makeLiteral(3.14159)
      visitor.Literal(node)
      expect(reports[0].node).toBe(node)
    })

    test('reports multiple violations accumulated', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal(makeLiteral(3.14159))
      visitor.Literal(makeLiteral(2.71828))
      visitor.Literal(makeLiteral(1.41421))
      expect(reports.length).toBe(3)
    })

    test('reports Euler-Mascheroni constant', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal(makeLiteral(0.5772156649015329))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Euler-Mascheroni')
    })

    test('reports 3.14159265 as Math.PI', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal(makeLiteral(3.14159265))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Math.PI')
    })

    test('reports 2.71828182 as Math.E', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal(makeLiteral(2.71828182))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Math.E')
    })

    test('report loc has correct start line and column', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal(makeLiteral(3.14159, 5, 8))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
    })
  })

  // ===== NEGATIVE CASES (35) =====
  describe('negative cases — does NOT report', () => {
    test('does not report string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal(makeLiteral('hello'))
      expect(reports.length).toBe(0)
    })

    test('does not report boolean true literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal(makeLiteral(true))
      expect(reports.length).toBe(0)
    })

    test('does not report null literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal(makeLiteral(null))
      expect(reports.length).toBe(0)
    })

    test('does not report the integer 42', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal(makeLiteral(42))
      expect(reports.length).toBe(0)
    })

    test('does not report the integer 100', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal(makeLiteral(100))
      expect(reports.length).toBe(0)
    })

    test('does not report the integer 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal(makeLiteral(0))
      expect(reports.length).toBe(0)
    })

    test('does not report the integer 1', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal(makeLiteral(1))
      expect(reports.length).toBe(0)
    })

    test('does not report random number 2.5', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal(makeLiteral(2.5))
      expect(reports.length).toBe(0)
    })

    test('does not report random number 99.99', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal(makeLiteral(99.99))
      expect(reports.length).toBe(0)
    })

    test('handles null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      expect(() => visitor.Literal(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      expect(() => visitor.Literal(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      expect(() => visitor.Literal({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal({ type: 'Identifier', name: 'x', loc: makeLoc(1, 0, 1, 1) })
      expect(reports.length).toBe(0)
    })

    test('does not report BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal({
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Literal', value: 1 },
        right: { type: 'Literal', value: 2 },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report empty string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal(makeLiteral(''))
      expect(reports.length).toBe(0)
    })

    test('does not report CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report MemberExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal({
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'Math' },
        property: { type: 'Identifier', name: 'PI' },
        loc: makeLoc(1, 0, 1, 8),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report ArrayExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal({ type: 'ArrayExpression', elements: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report ObjectExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal({ type: 'ObjectExpression', properties: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report ConditionalExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal({
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'x' },
        consequent: { type: 'Literal', value: 1 },
        alternate: { type: 'Literal', value: 2 },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report ArrowFunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal({
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal({
        type: 'UnaryExpression',
        operator: '-',
        argument: { type: 'Literal', value: 1 },
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report UpdateExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal({
        type: 'UpdateExpression',
        operator: '++',
        argument: { type: 'Identifier', name: 'i' },
        prefix: false,
        loc: makeLoc(1, 0, 1, 3),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report FunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal({
        type: 'FunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report LogicalExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal({
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report NewExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Set' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report AssignmentExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 3.14 },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report AwaitExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal({
        type: 'AwaitExpression',
        argument: { type: 'Identifier', name: 'promise' },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report YieldExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal({
        type: 'YieldExpression',
        argument: { type: 'Identifier', name: 'value' },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report SequenceExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal({
        type: 'SequenceExpression',
        expressions: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report ClassExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal({
        type: 'ClassExpression',
        body: { type: 'ClassBody', body: [] },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report SpreadElement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal({
        type: 'SpreadElement',
        argument: { type: 'Identifier', name: 'items' },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report 3.14 (not close enough to PI)', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal(makeLiteral(3.14))
      expect(reports.length).toBe(0)
    })

    test('does not report number 1.5 (not a known constant)', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal(makeLiteral(1.5))
      expect(reports.length).toBe(0)
    })

    test('does not report number -3.14159 (negative of PI approx)', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal(makeLiteral(-3.14159))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====
  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noApproximateConstantsRule.create(ctx1)
      const visitor2 = noApproximateConstantsRule.create(ctx2)

      visitor1.Literal(makeLiteral(3.14159))
      visitor2.Literal(makeLiteral(42))

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal(makeLiteral(3.14159))
      visitor.Literal(makeLiteral(2.71828))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      const node = {
        type: 'Literal',
        value: 3.14159,
      }
      visitor.Literal(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      const node = {
        type: 'Literal',
        value: 3.14159,
      }
      visitor.Literal(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('create returns a new visitor each call (not same reference)', () => {
      const { context } = createMockContext()
      const visitor1 = noApproximateConstantsRule.create(context)
      const visitor2 = noApproximateConstantsRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('mixed valid and invalid reports count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal(makeLiteral(3.14159))
      visitor.Literal(makeLiteral(42))
      visitor.Literal(makeLiteral('hello'))
      visitor.Literal(makeLiteral(2.71828))
      visitor.Literal(makeLiteral(0))
      expect(reports.length).toBe(2)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal(makeLiteral(3.14159))
      visitor.Literal(makeLiteral(3.14159))
      visitor.Literal(makeLiteral(3.14159))
      expect(reports.length).toBe(3)
    })

    test('Literal with undefined value does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal({ type: 'Literal', value: undefined, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('Literal without value property does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal({ type: 'Literal', loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('location with specific line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal(makeLiteral(3.14159, 10, 4))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('handles node with empty value object', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal({ type: 'Literal', value: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('different precision levels of PI all report', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal(makeLiteral(3.14159))
      visitor.Literal(makeLiteral(3.14159265))
      visitor.Literal(makeLiteral(3.1415926535))
      visitor.Literal(makeLiteral(3.141592653589793))
      expect(reports.length).toBe(4)
    })

    test('different precision levels of E all report', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal(makeLiteral(2.71828))
      visitor.Literal(makeLiteral(2.71828182))
      visitor.Literal(makeLiteral(2.718281828))
      visitor.Literal(makeLiteral(2.718281828459045))
      expect(reports.length).toBe(4)
    })

    test('different precision levels of SQRT2 all report', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal(makeLiteral(1.41421))
      visitor.Literal(makeLiteral(1.41421356))
      visitor.Literal(makeLiteral(1.4142135623730951))
      expect(reports.length).toBe(3)
    })

    test('different precision levels of SQRT1_2 all report', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal(makeLiteral(0.70711))
      visitor.Literal(makeLiteral(0.7071067811865476))
      expect(reports.length).toBe(2)
    })
  })

  // ===== ADDITIONAL CASES (15) =====
  describe('additional coverage', () => {
    test('rule meta is the same reference across accesses', () => {
      const meta1 = noApproximateConstantsRule.meta
      const meta2 = noApproximateConstantsRule.meta
      expect(meta1).toBe(meta2)
    })

    test('rule name is exported as noApproximateConstantsRule', () => {
      expect(noApproximateConstantsRule).toBeDefined()
      expect(typeof noApproximateConstantsRule.create).toBe('function')
      expect(typeof noApproximateConstantsRule.meta).toBe('object')
    })

    test('message consistency for Math.PI across precisions', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal(makeLiteral(3.14159))
      visitor.Literal(makeLiteral(3.14159265))
      const allContainPI = reports.every(r => r.message.includes('Math.PI'))
      expect(allContainPI).toBe(true)
    })

    test('message for Math.E contains "Use Math.E"', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal(makeLiteral(2.71828))
      expect(reports[0].message).toContain('Use Math.E')
    })

    test('message for Math.SQRT2 contains "Use Math.SQRT2"', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal(makeLiteral(1.41421))
      expect(reports[0].message).toContain('Use Math.SQRT2')
    })

    test('message for Math.SQRT1_2 contains "Use Math.SQRT1_2"', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal(makeLiteral(0.70711))
      expect(reports[0].message).toContain('Use Math.SQRT1_2')
    })

    test('message for golden ratio contains "Use Golden ratio"', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal(makeLiteral(1.61803))
      expect(reports[0].message).toContain('Use Golden ratio (phi)')
    })

    test('message for Euler-Mascheroni constant contains "Use Euler-Mascheroni"', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal(makeLiteral(0.5772156649015329))
      expect(reports[0].message).toContain('Use Euler-Mascheroni constant (gamma)')
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      const node = {
        type: 'Literal',
        value: 3.14159,
        raw: '3.14159',
        extra: { parenthesized: true },
        parent: { type: 'VariableDeclarator' },
        loc: makeLoc(1, 0, 1, 7),
      }
      visitor.Literal(node)
      expect(reports.length).toBe(1)
    })

    test('full precision PI reports with correct message', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal(makeLiteral(3.141592653589793))
      expect(reports[0].message).toContain('Math.PI')
      expect(reports[0].message).toContain('3.141592653589793')
    })

    test('short PI approximation reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal(makeLiteral(3.14159))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('3.14159')
    })

    test('report descriptor has all three properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal(makeLiteral(3.14159))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('does not report NaN literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal(makeLiteral(NaN))
      expect(reports.length).toBe(0)
    })

    test('does not report Infinity literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal(makeLiteral(Infinity))
      expect(reports.length).toBe(0)
    })

    test('message format matches expected pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noApproximateConstantsRule.create(context)
      visitor.Literal(makeLiteral(3.14159))
      expect(reports[0].message).toMatch(/^Use .+ instead of the approximate literal `.+`\.$/)
    })
  })
})
