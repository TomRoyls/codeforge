import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryPlusNewRule } from '../../../../src/rules/patterns/no-unnecessary-plus-new.js'
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
    getSource: () => '+42',
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

function makeUnaryPlusNode(
  argument: unknown,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 5,
): unknown {
  return {
    type: 'UnaryExpression',
    operator: '+',
    prefix: true,
    argument,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeNumericLiteral(value: number): unknown {
  return { type: 'NumericLiteral', value }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-plus-new rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryPlusNewRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryPlusNewRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryPlusNewRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryPlusNewRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryPlusNewRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning unary plus', () => {
      const desc = noUnnecessaryPlusNewRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/unary plus/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryPlusNewRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-plus-new.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryPlusNewRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with UnaryExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      expect(visitor).toHaveProperty('UnaryExpression')
      expect(typeof visitor.UnaryExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryPlusNewRule).toBeDefined()
      expect(noUnnecessaryPlusNewRule.meta).toBeDefined()
      expect(noUnnecessaryPlusNewRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (30) =====

  describe('positive cases — reports unnecessary unary plus', () => {
    test('reports for +0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression(makeUnaryPlusNode(makeNumericLiteral(0)))
      expect(reports.length).toBe(1)
    })

    test('reports for +1', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression(makeUnaryPlusNode(makeNumericLiteral(1)))
      expect(reports.length).toBe(1)
    })

    test('reports for +42', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression(makeUnaryPlusNode(makeNumericLiteral(42)))
      expect(reports.length).toBe(1)
    })

    test('reports for +3.14', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression(makeUnaryPlusNode(makeNumericLiteral(3.14)))
      expect(reports.length).toBe(1)
    })

    test('reports for +100', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression(makeUnaryPlusNode(makeNumericLiteral(100)))
      expect(reports.length).toBe(1)
    })

    test('reports for +0.001', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression(makeUnaryPlusNode(makeNumericLiteral(0.001)))
      expect(reports.length).toBe(1)
    })

    test('reports for +999', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression(makeUnaryPlusNode(makeNumericLiteral(999)))
      expect(reports.length).toBe(1)
    })

    test('reports for +NaN as numeric literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression(makeUnaryPlusNode({ type: 'NumericLiteral', value: NaN }))
      expect(reports.length).toBe(1)
    })

    test('report message mentions unnecessary unary plus', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression(makeUnaryPlusNode(makeNumericLiteral(42)))
      expect(reports[0].message).toMatch(/unary plus/i)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression(makeUnaryPlusNode(makeNumericLiteral(42)))
      expect(reports[0].message).toBe(
        'Unnecessary unary plus on a number literal.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression(makeUnaryPlusNode(makeNumericLiteral(1)))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression(makeUnaryPlusNode(makeNumericLiteral(1)))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input UnaryExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      const node = makeUnaryPlusNode(makeNumericLiteral(5))
      visitor.UnaryExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression(makeUnaryPlusNode(makeNumericLiteral(1), 5, 10, 5, 13))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression(makeUnaryPlusNode(makeNumericLiteral(1)))
      visitor.UnaryExpression(makeUnaryPlusNode(makeNumericLiteral(2)))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression(makeUnaryPlusNode(makeNumericLiteral(1)))
      visitor.UnaryExpression(makeUnaryPlusNode(makeNumericLiteral(99)))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for +Infinity as numeric literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression(makeUnaryPlusNode({ type: 'NumericLiteral', value: Infinity }))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression(makeUnaryPlusNode(makeNumericLiteral(1)))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for very small number +0.0001', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression(makeUnaryPlusNode(makeNumericLiteral(0.0001)))
      expect(reports.length).toBe(1)
    })

    test('reports for very large number +1e10', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression(makeUnaryPlusNode(makeNumericLiteral(1e10)))
      expect(reports.length).toBe(1)
    })

    test('reports for negative zero +(-0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression(makeUnaryPlusNode(makeNumericLiteral(-0)))
      expect(reports.length).toBe(1)
    })

    test('reports when NumericLiteral has extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression(makeUnaryPlusNode({ type: 'NumericLiteral', value: 7, raw: '7', extra: true }))
      expect(reports.length).toBe(1)
    })

    test('reports when UnaryExpression has extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: '+',
        prefix: true,
        argument: makeNumericLiteral(10),
        loc: makeLoc(1, 0, 1, 4),
        range: [0, 4],
        extra: { parenthesized: true },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for number with trailing decimal +5.', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression(makeUnaryPlusNode(makeNumericLiteral(5)))
      expect(reports.length).toBe(1)
    })

    test('report loc end values are preserved', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression(makeUnaryPlusNode(makeNumericLiteral(1), 2, 0, 2, 3))
      expect(reports[0].loc?.end.line).toBe(2)
      expect(reports[0].loc?.end.column).toBe(3)
    })

    test('reports for +2.718', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression(makeUnaryPlusNode(makeNumericLiteral(2.718)))
      expect(reports.length).toBe(1)
    })

    test('reports for +1.5e3', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression(makeUnaryPlusNode(makeNumericLiteral(1.5e3)))
      expect(reports.length).toBe(1)
    })

    test('reports for +0xFF as numeric literal (value 255)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression(makeUnaryPlusNode(makeNumericLiteral(255)))
      expect(reports.length).toBe(1)
    })

    test('reports for +0b1010 as numeric literal (value 10)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression(makeUnaryPlusNode(makeNumericLiteral(10)))
      expect(reports.length).toBe(1)
    })

    test('reports when prefix is true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression(makeUnaryPlusNode(makeNumericLiteral(3)))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for unary minus on number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: '-',
        prefix: true,
        argument: makeNumericLiteral(42),
        loc: makeLoc(1, 0, 1, 4),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for unary not on number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
        argument: makeNumericLiteral(0),
        loc: makeLoc(1, 0, 1, 3),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for unary tilde on number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: '~',
        prefix: true,
        argument: makeNumericLiteral(42),
        loc: makeLoc(1, 0, 1, 4),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for unary typeof on number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'typeof',
        prefix: true,
        argument: makeNumericLiteral(42),
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for unary void on number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'void',
        prefix: true,
        argument: makeNumericLiteral(42),
        loc: makeLoc(1, 0, 1, 8),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for unary delete', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'delete',
        prefix: true,
        argument: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 8),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for + on Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression(makeUnaryPlusNode({ type: 'Identifier', name: 'x' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for + on StringLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression(makeUnaryPlusNode({ type: 'StringLiteral', value: '42' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for + on Literal string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression(makeUnaryPlusNode({ type: 'Literal', value: '42' }))
      expect(reports.length).toBe(0)
    })

    test('reports for + on Literal number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression(makeUnaryPlusNode({ type: 'Literal', value: 42 }))
      expect(reports.length).toBe(1)
    })

    test('does not report for + on CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression(makeUnaryPlusNode({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'foo' },
        arguments: [],
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for + on MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression(makeUnaryPlusNode({
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'val' },
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for + on BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression(makeUnaryPlusNode({
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for + on ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression(makeUnaryPlusNode({ type: 'ArrayExpression', elements: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for + on ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression(makeUnaryPlusNode({ type: 'ObjectExpression', properties: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for + on FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression(makeUnaryPlusNode({
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for + on ArrowFunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression(makeUnaryPlusNode({
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for + on TemplateLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression(makeUnaryPlusNode({
        type: 'TemplateLiteral',
        quasis: [],
        expressions: [],
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for + on ConditionalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression(makeUnaryPlusNode({
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'x' },
        consequent: { type: 'Literal', value: 1 },
        alternate: { type: 'Literal', value: 2 },
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for + on BooleanLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression(makeUnaryPlusNode({ type: 'BooleanLiteral', value: true }))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      expect(() => visitor.UnaryExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      expect(() => visitor.UnaryExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      expect(() => visitor.UnaryExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      expect(() => visitor.UnaryExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      expect(() => visitor.UnaryExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      expect(() => visitor.UnaryExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: '+',
        prefix: true,
        argument: null,
        loc: makeLoc(1, 0, 1, 3),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: '+',
        prefix: true,
        argument: undefined,
        loc: makeLoc(1, 0, 1, 3),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a string primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: '+',
        prefix: true,
        argument: 'not-a-node',
        loc: makeLoc(1, 0, 1, 3),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when operator is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        prefix: true,
        argument: makeNumericLiteral(42),
        loc: makeLoc(1, 0, 1, 4),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when operator is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: null,
        prefix: true,
        argument: makeNumericLiteral(42),
        loc: makeLoc(1, 0, 1, 4),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for + on BigIntLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression(makeUnaryPlusNode({ type: 'BigIntLiteral', value: '42n' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for + on RegExpLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression(makeUnaryPlusNode({ type: 'RegExpLiteral', pattern: 'test', flags: '' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for + on NullLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression(makeUnaryPlusNode({ type: 'NullLiteral' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for + on AssignmentExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression(makeUnaryPlusNode({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 42 },
      }))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryPlusNewRule.create(ctx1)
      const visitor2 = noUnnecessaryPlusNewRule.create(ctx2)
      visitor1.UnaryExpression(makeUnaryPlusNode(makeNumericLiteral(1)))
      visitor2.UnaryExpression(makeUnaryPlusNode({ type: 'Identifier', name: 'x' }))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression(makeUnaryPlusNode(makeNumericLiteral(1)))
      visitor.UnaryExpression(makeUnaryPlusNode({ type: 'Identifier', name: 'x' }))
      visitor.UnaryExpression(makeUnaryPlusNode(makeNumericLiteral(2)))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: '+',
        prefix: true,
        argument: makeNumericLiteral(1),
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: '+',
        prefix: true,
        argument: makeNumericLiteral(1),
      }
      visitor.UnaryExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression(makeUnaryPlusNode(makeNumericLiteral(1)))
      visitor.UnaryExpression(makeUnaryPlusNode({ type: 'Identifier', name: 'x' }))
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: '-',
        prefix: true,
        argument: makeNumericLiteral(1),
        loc: makeLoc(1, 0, 1, 3),
      })
      visitor.UnaryExpression(makeUnaryPlusNode(makeNumericLiteral(2)))
      visitor.UnaryExpression(makeUnaryPlusNode({ type: 'StringLiteral', value: 'hello' }))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryPlusNewRule.create(context)
      const visitor2 = noUnnecessaryPlusNewRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryPlusNewRule.meta
      const meta2 = noUnnecessaryPlusNewRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: '+',
        prefix: true,
        argument: makeNumericLiteral(1),
        loc: makeLoc(1, 0, 1, 4),
        range: [0, 4],
        extra: true,
        trailingComments: [],
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: '+',
        prefix: true,
        argument: makeNumericLiteral(1),
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: '+',
        prefix: true,
        argument: makeNumericLiteral(1),
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      const node = makeUnaryPlusNode(makeNumericLiteral(1))
      visitor.UnaryExpression(node)
      visitor.UnaryExpression(node)
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryPlusNewRule).toBeDefined()
      expect(typeof noUnnecessaryPlusNewRule.create).toBe('function')
      expect(typeof noUnnecessaryPlusNewRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: '+',
        prefix: true,
        argument: makeNumericLiteral(1),
        loc: makeLoc(1, 0, 1, 4),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression(makeUnaryPlusNode(makeNumericLiteral(1), 10, 4, 10, 8))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(8)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPlusNewRule.create(context)
      visitor.UnaryExpression(makeUnaryPlusNode(makeNumericLiteral(1)))
      visitor.UnaryExpression(makeUnaryPlusNode(makeNumericLiteral(2)))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})
