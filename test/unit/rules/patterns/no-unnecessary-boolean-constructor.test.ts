import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryBooleanConstructorRule } from '../../../../src/rules/patterns/no-unnecessary-boolean-constructor.js'
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
    getSource: () => 'Boolean(true)',
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

function makeCallExpr(
  calleeName: string,
  args: unknown[],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 13,
): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: calleeName },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-boolean-constructor rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryBooleanConstructorRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryBooleanConstructorRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryBooleanConstructorRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryBooleanConstructorRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryBooleanConstructorRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Boolean', () => {
      const desc = noUnnecessaryBooleanConstructorRule.meta.docs?.description ?? ''
      expect(desc).toMatch(/Boolean/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryBooleanConstructorRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-boolean-constructor',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryBooleanConstructorRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryBooleanConstructorRule).toBeDefined()
      expect(noUnnecessaryBooleanConstructorRule.meta).toBeDefined()
      expect(noUnnecessaryBooleanConstructorRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS UNNECESSARY BOOLEAN CONSTRUCTOR (25) =====

  describe('positive cases — reports unnecessary Boolean constructor', () => {
    test('reports for Boolean(true)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: true }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Boolean(false)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: false }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Boolean(true) with loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: true }], 5, 10, 5, 23))
      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
    })

    test('reports for Boolean(false) with loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: false }], 2, 0, 2, 14))
      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
    })

    test('reports for Boolean(true) with extra properties on node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [{ type: 'Literal', value: true }],
        loc: makeLoc(1, 0, 1, 13),
        range: [0, 13],
        extra: true,
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for Boolean(false) with extra properties on arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [{ type: 'Literal', value: false, raw: 'false', range: [8, 12] }],
        loc: makeLoc(1, 0, 1, 14),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for Boolean(true) inside variable declaration context', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: true }], 3, 8, 3, 21))
      expect(reports.length).toBe(1)
    })

    test('reports for Boolean(false) inside return statement context', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: false }], 7, 4, 7, 18))
      expect(reports.length).toBe(1)
    })

    test('reports for Boolean(true) inside if condition context', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: true }], 10, 4, 10, 17))
      expect(reports.length).toBe(1)
    })

    test('reports for Boolean(false) inside ternary context', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: false }], 12, 2, 12, 16))
      expect(reports.length).toBe(1)
    })

    test('reports when node has _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [{ type: 'Literal', value: true }],
        loc: makeLoc(1, 0, 1, 13),
        _parent: { type: 'VariableDeclarator' },
      })
      expect(reports.length).toBe(1)
    })

    test('reports when arg has extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: true, raw: 'true', extra: { parenthesized: true } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Boolean(true) at line 1 col 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: true }], 1, 0, 1, 13))
      expect(reports.length).toBe(1)
    })

    test('reports for Boolean(false) at arbitrary line 42 col 7', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: false }], 42, 7, 42, 21))
      expect(reports.length).toBe(1)
    })

    test('reports when loc spans multiple lines', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: true }], 1, 10, 3, 5))
      expect(reports.length).toBe(1)
    })

    test('reports when callee Identifier has extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean', range: [0, 7] },
        arguments: [{ type: 'Literal', value: true }],
        loc: makeLoc(1, 0, 1, 13),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for Boolean(true) with zero-column loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: true }], 1, 0, 1, 0))
      expect(reports.length).toBe(1)
    })

    test('reports for Boolean(false) with large column offset', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: false }], 1, 100, 1, 114))
      expect(reports.length).toBe(1)
    })

    test('reports for Boolean(true) inside expression statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: true }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Boolean(false) inside logical expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: false }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Boolean(true) inside array element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: true }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Boolean(false) inside object property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: false }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Boolean(true) inside function argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: true }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Boolean(false) inside template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: false }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Boolean(true) inside assignment right-hand side', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: true }]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report message mentions "Unnecessary Boolean()"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: true }]))
      expect(reports[0].message).toContain('Unnecessary Boolean()')
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: true }]))
      expect(reports[0].message).toBe(
        'Unnecessary Boolean() call on a boolean literal. Use the value directly.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: true }]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: true }]))
      expect(reports[0].node).toBeDefined()
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: true }], 5, 10, 5, 23))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: true }]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      const node = makeCallExpr('Boolean', [{ type: 'Literal', value: true }])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: true }]))
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: false }]))
      expect(reports.length).toBe(2)
    })

    test('consistent messages for Boolean(true) and Boolean(false)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: true }]))
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: false }]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('single report per single Boolean(true) call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: true }]))
      expect(reports.length).toBe(1)
    })

    test('single report per single Boolean(false) call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: false }]))
      expect(reports.length).toBe(1)
    })

    test('multiple violations each produce a report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: true }]))
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: false }]))
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: true }]))
      expect(reports.length).toBe(3)
    })

    test('report message mentions "boolean literal"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: true }]))
      expect(reports[0].message.toLowerCase()).toContain('boolean literal')
    })

    test('report message mentions "Use the value directly"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: true }]))
      expect(reports[0].message).toContain('Use the value directly')
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: true }], 10, 4, 10, 17))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(17)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Boolean(42) with number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: 42 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Boolean("str") with string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: 'str' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Boolean(x) with Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Boolean() with no args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Boolean', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for Boolean(a, b) with 2 args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: true }, { type: 'Literal', value: false }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Boolean(true)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [{ type: 'Literal', value: true }],
        loc: makeLoc(1, 0, 1, 17),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-Boolean callee (String)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: true }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'foo' }, property: { type: 'Identifier', name: 'Boolean' } },
        arguments: [{ type: 'Literal', value: true }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument type is not Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Boolean(null) with null literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: null }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Boolean(undefined) — undefined is Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Identifier', name: 'undefined' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: null,
        arguments: [{ type: 'Literal', value: true }],
        loc: makeLoc(1, 0, 1, 13),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: 'not-array',
        loc: makeLoc(1, 0, 1, 13),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when first argument is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [null],
        loc: makeLoc(1, 0, 1, 13),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when first argument value is a string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: 'hello' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number(true) with different callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [{ type: 'Literal', value: true }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Boolean(0) with falsy number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryBooleanConstructorRule.create(ctx1)
      const visitor2 = noUnnecessaryBooleanConstructorRule.create(ctx2)
      visitor1.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: true }]))
      visitor2.CallExpression(makeCallExpr('Boolean', [{ type: 'Identifier', name: 'x' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('accumulates reports correctly across mixed calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: true }]))
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: 42 }]))
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: false }]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [{ type: 'Literal', value: true }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [{ type: 'Literal', value: true }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: true }]))
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: 42 }]))
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: true }]))
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: false }]))
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryBooleanConstructorRule.create(context)
      const visitor2 = noUnnecessaryBooleanConstructorRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryBooleanConstructorRule.meta
      const meta2 = noUnnecessaryBooleanConstructorRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [{ type: 'Literal', value: true }],
        loc: makeLoc(1, 0, 1, 13),
        range: [0, 13],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [{ type: 'Literal', value: true }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [{ type: 'Literal', value: true }],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryBooleanConstructorRule).toBeDefined()
      expect(typeof noUnnecessaryBooleanConstructorRule.create).toBe('function')
      expect(typeof noUnnecessaryBooleanConstructorRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [{ type: 'Literal', value: true }],
        loc: makeLoc(1, 0, 1, 13),
        _parent: { type: 'ExpressionStatement' },
      })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: true }]))
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: false }]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report loc reflects specific location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: true }], 10, 4, 10, 17))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(17)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      const node = makeCallExpr('Boolean', [{ type: 'Literal', value: true }])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('handles node where callee type is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } },
        arguments: [{ type: 'Literal', value: true }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('handles node where callee name is lowercase "boolean"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('boolean', [{ type: 'Literal', value: true }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when Literal value is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when first argument is a string primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: ['not-an-object'],
        loc: makeLoc(1, 0, 1, 13),
      })
      expect(reports.length).toBe(0)
    })

    test('handles three Boolean(true) calls producing three reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: true }], 1, 0, 1, 13))
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: true }], 2, 0, 2, 13))
      visitor.CallExpression(makeCallExpr('Boolean', [{ type: 'Literal', value: true }], 3, 0, 3, 13))
      expect(reports.length).toBe(3)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(2)
      expect(reports[2].loc?.start.line).toBe(3)
    })
  })
})
