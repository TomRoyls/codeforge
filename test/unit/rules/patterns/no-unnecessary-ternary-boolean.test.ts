import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryTernaryBooleanRule } from '../../../../src/rules/patterns/no-unnecessary-ternary-boolean.js'
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

function makeConditionalNode(
  test: unknown,
  consequent: unknown,
  alternate: unknown,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 30,
): unknown {
  return {
    type: 'ConditionalExpression',
    test,
    consequent,
    alternate,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeBoolLiteral(value: boolean): unknown {
  return { type: 'Literal', value }
}

function makeBooleanLiteral(value: boolean): unknown {
  return { type: 'BooleanLiteral', value }
}

function makeIdentifier(name: string): unknown {
  return { type: 'Identifier', name }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-ternary-boolean rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryTernaryBooleanRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryTernaryBooleanRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryTernaryBooleanRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryTernaryBooleanRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryTernaryBooleanRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning ternary', () => {
      const desc = noUnnecessaryTernaryBooleanRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/ternary/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryTernaryBooleanRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-ternary-boolean.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryTernaryBooleanRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with ConditionalExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      expect(visitor).toHaveProperty('ConditionalExpression')
      expect(typeof visitor.ConditionalExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryTernaryBooleanRule).toBeDefined()
      expect(noUnnecessaryTernaryBooleanRule.meta).toBeDefined()
      expect(noUnnecessaryTernaryBooleanRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — cond ? true : false REPORTS (15) =====

  describe('positive cases — reports cond ? true : false', () => {
    test('reports for x ? true : false with identifier condition', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      visitor.ConditionalExpression(makeConditionalNode(makeIdentifier('x'), makeBoolLiteral(true), makeBoolLiteral(false)))
      expect(reports.length).toBe(1)
    })

    test('reports for x === y ? true : false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      const cond = { type: 'BinaryExpression', operator: '===', left: makeIdentifier('x'), right: makeIdentifier('y') }
      visitor.ConditionalExpression(makeConditionalNode(cond, makeBoolLiteral(true), makeBoolLiteral(false)))
      expect(reports.length).toBe(1)
    })

    test('reports for x > 0 ? true : false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      const cond = { type: 'BinaryExpression', operator: '>', left: makeIdentifier('x'), right: { type: 'Literal', value: 0 } }
      visitor.ConditionalExpression(makeConditionalNode(cond, makeBoolLiteral(true), makeBoolLiteral(false)))
      expect(reports.length).toBe(1)
    })

    test('reports for fn() ? true : false with call expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      const cond = { type: 'CallExpression', callee: makeIdentifier('fn'), arguments: [] }
      visitor.ConditionalExpression(makeConditionalNode(cond, makeBoolLiteral(true), makeBoolLiteral(false)))
      expect(reports.length).toBe(1)
    })

    test('reports for a && b ? true : false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      const cond = { type: 'LogicalExpression', operator: '&&', left: makeIdentifier('a'), right: makeIdentifier('b') }
      visitor.ConditionalExpression(makeConditionalNode(cond, makeBoolLiteral(true), makeBoolLiteral(false)))
      expect(reports.length).toBe(1)
    })

    test('reports for BooleanLiteral type consequent true with Literal alternate false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      visitor.ConditionalExpression(makeConditionalNode(makeIdentifier('x'), makeBooleanLiteral(true), makeBoolLiteral(false)))
      expect(reports.length).toBe(1)
    })

    test('reports for nested ternary condition ? true : false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      const innerTernary = makeConditionalNode(makeIdentifier('a'), makeBoolLiteral(true), makeBoolLiteral(false))
      visitor.ConditionalExpression(makeConditionalNode(innerTernary, makeBoolLiteral(true), makeBoolLiteral(false)))
      expect(reports.length).toBe(1)
    })

    test('reports for x !== y ? true : false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      const cond = { type: 'BinaryExpression', operator: '!==', left: makeIdentifier('x'), right: makeIdentifier('y') }
      visitor.ConditionalExpression(makeConditionalNode(cond, makeBoolLiteral(true), makeBoolLiteral(false)))
      expect(reports.length).toBe(1)
    })

    test('reports for !x ? true : false with unary condition', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      const cond = { type: 'UnaryExpression', operator: '!', prefix: true, argument: makeIdentifier('x') }
      visitor.ConditionalExpression(makeConditionalNode(cond, makeBoolLiteral(true), makeBoolLiteral(false)))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof x === "string" ? true : false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      const typeofArg = { type: 'UnaryExpression', operator: 'typeof', prefix: true, argument: makeIdentifier('x') }
      const cond = { type: 'BinaryExpression', operator: '===', left: typeofArg, right: { type: 'Literal', value: 'string' } }
      visitor.ConditionalExpression(makeConditionalNode(cond, makeBoolLiteral(true), makeBoolLiteral(false)))
      expect(reports.length).toBe(1)
    })

    test('reports for x instanceof Foo ? true : false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      const cond = { type: 'BinaryExpression', operator: 'instanceof', left: makeIdentifier('x'), right: makeIdentifier('Foo') }
      visitor.ConditionalExpression(makeConditionalNode(cond, makeBoolLiteral(true), makeBoolLiteral(false)))
      expect(reports.length).toBe(1)
    })

    test('reports for x in obj ? true : false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      const cond = { type: 'BinaryExpression', operator: 'in', left: makeIdentifier('x'), right: makeIdentifier('obj') }
      visitor.ConditionalExpression(makeConditionalNode(cond, makeBoolLiteral(true), makeBoolLiteral(false)))
      expect(reports.length).toBe(1)
    })

    test('reports for x < 10 ? true : false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      const cond = { type: 'BinaryExpression', operator: '<', left: makeIdentifier('x'), right: { type: 'Literal', value: 10 } }
      visitor.ConditionalExpression(makeConditionalNode(cond, makeBoolLiteral(true), makeBoolLiteral(false)))
      expect(reports.length).toBe(1)
    })

    test('reports for x ?? y ? true : false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      const cond = { type: 'LogicalExpression', operator: '??', left: makeIdentifier('x'), right: makeIdentifier('y') }
      visitor.ConditionalExpression(makeConditionalNode(cond, makeBoolLiteral(true), makeBoolLiteral(false)))
      expect(reports.length).toBe(1)
    })

    test('reports for Literal true with BooleanLiteral false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      visitor.ConditionalExpression(makeConditionalNode(makeIdentifier('x'), makeBoolLiteral(true), makeBooleanLiteral(false)))
      expect(reports.length).toBe(1)
    })
  })

  // ===== POSITIVE CASES — cond ? false : true REPORTS (15) =====

  describe('positive cases — reports cond ? false : true', () => {
    test('reports for x ? false : true with identifier condition', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      visitor.ConditionalExpression(makeConditionalNode(makeIdentifier('x'), makeBoolLiteral(false), makeBoolLiteral(true)))
      expect(reports.length).toBe(1)
    })

    test('reports for x === y ? false : true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      const cond = { type: 'BinaryExpression', operator: '===', left: makeIdentifier('x'), right: makeIdentifier('y') }
      visitor.ConditionalExpression(makeConditionalNode(cond, makeBoolLiteral(false), makeBoolLiteral(true)))
      expect(reports.length).toBe(1)
    })

    test('reports for x > 0 ? false : true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      const cond = { type: 'BinaryExpression', operator: '>', left: makeIdentifier('x'), right: { type: 'Literal', value: 0 } }
      visitor.ConditionalExpression(makeConditionalNode(cond, makeBoolLiteral(false), makeBoolLiteral(true)))
      expect(reports.length).toBe(1)
    })

    test('reports for fn() ? false : true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      const cond = { type: 'CallExpression', callee: makeIdentifier('fn'), arguments: [] }
      visitor.ConditionalExpression(makeConditionalNode(cond, makeBoolLiteral(false), makeBoolLiteral(true)))
      expect(reports.length).toBe(1)
    })

    test('reports for a && b ? false : true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      const cond = { type: 'LogicalExpression', operator: '&&', left: makeIdentifier('a'), right: makeIdentifier('b') }
      visitor.ConditionalExpression(makeConditionalNode(cond, makeBoolLiteral(false), makeBoolLiteral(true)))
      expect(reports.length).toBe(1)
    })

    test('reports for BooleanLiteral type consequent false with Literal alternate true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      visitor.ConditionalExpression(makeConditionalNode(makeIdentifier('x'), makeBooleanLiteral(false), makeBoolLiteral(true)))
      expect(reports.length).toBe(1)
    })

    test('reports for nested ternary condition ? false : true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      const innerTernary = makeConditionalNode(makeIdentifier('a'), makeBoolLiteral(false), makeBoolLiteral(true))
      visitor.ConditionalExpression(makeConditionalNode(innerTernary, makeBoolLiteral(false), makeBoolLiteral(true)))
      expect(reports.length).toBe(1)
    })

    test('reports for x !== y ? false : true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      const cond = { type: 'BinaryExpression', operator: '!==', left: makeIdentifier('x'), right: makeIdentifier('y') }
      visitor.ConditionalExpression(makeConditionalNode(cond, makeBoolLiteral(false), makeBoolLiteral(true)))
      expect(reports.length).toBe(1)
    })

    test('reports for !x ? false : true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      const cond = { type: 'UnaryExpression', operator: '!', prefix: true, argument: makeIdentifier('x') }
      visitor.ConditionalExpression(makeConditionalNode(cond, makeBoolLiteral(false), makeBoolLiteral(true)))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof x === "string" ? false : true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      const typeofArg = { type: 'UnaryExpression', operator: 'typeof', prefix: true, argument: makeIdentifier('x') }
      const cond = { type: 'BinaryExpression', operator: '===', left: typeofArg, right: { type: 'Literal', value: 'string' } }
      visitor.ConditionalExpression(makeConditionalNode(cond, makeBoolLiteral(false), makeBoolLiteral(true)))
      expect(reports.length).toBe(1)
    })

    test('reports for x instanceof Foo ? false : true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      const cond = { type: 'BinaryExpression', operator: 'instanceof', left: makeIdentifier('x'), right: makeIdentifier('Foo') }
      visitor.ConditionalExpression(makeConditionalNode(cond, makeBoolLiteral(false), makeBoolLiteral(true)))
      expect(reports.length).toBe(1)
    })

    test('reports for x in obj ? false : true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      const cond = { type: 'BinaryExpression', operator: 'in', left: makeIdentifier('x'), right: makeIdentifier('obj') }
      visitor.ConditionalExpression(makeConditionalNode(cond, makeBoolLiteral(false), makeBoolLiteral(true)))
      expect(reports.length).toBe(1)
    })

    test('reports for x < 10 ? false : true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      const cond = { type: 'BinaryExpression', operator: '<', left: makeIdentifier('x'), right: { type: 'Literal', value: 10 } }
      visitor.ConditionalExpression(makeConditionalNode(cond, makeBoolLiteral(false), makeBoolLiteral(true)))
      expect(reports.length).toBe(1)
    })

    test('reports for x ?? y ? false : true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      const cond = { type: 'LogicalExpression', operator: '??', left: makeIdentifier('x'), right: makeIdentifier('y') }
      visitor.ConditionalExpression(makeConditionalNode(cond, makeBoolLiteral(false), makeBoolLiteral(true)))
      expect(reports.length).toBe(1)
    })

    test('reports for BooleanLiteral false with BooleanLiteral true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      visitor.ConditionalExpression(makeConditionalNode(makeIdentifier('x'), makeBooleanLiteral(false), makeBooleanLiteral(true)))
      expect(reports.length).toBe(1)
    })
  })

  // ===== MESSAGE VERIFICATION TESTS (5) =====

  describe('message verification', () => {
    test('cond ? true : false message says "Use the condition directly"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      visitor.ConditionalExpression(makeConditionalNode(makeIdentifier('x'), makeBoolLiteral(true), makeBoolLiteral(false)))
      expect(reports[0].message).toMatch(/Use the condition directly/)
    })

    test('cond ? false : true message says "Use !cond"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      visitor.ConditionalExpression(makeConditionalNode(makeIdentifier('x'), makeBoolLiteral(false), makeBoolLiteral(true)))
      expect(reports[0].message).toMatch(/Use `!cond`/)
    })

    test('report message mentions "Unnecessary ternary"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      visitor.ConditionalExpression(makeConditionalNode(makeIdentifier('x'), makeBoolLiteral(true), makeBoolLiteral(false)))
      expect(reports[0].message).toMatch(/Unnecessary ternary/)
    })

    test('cond ? true : false has exact message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      visitor.ConditionalExpression(makeConditionalNode(makeIdentifier('x'), makeBoolLiteral(true), makeBoolLiteral(false)))
      expect(reports[0].message).toBe(
        'Unnecessary ternary. Use the condition directly instead of `cond ? true : false`.',
      )
    })

    test('cond ? false : true has exact message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      visitor.ConditionalExpression(makeConditionalNode(makeIdentifier('x'), makeBoolLiteral(false), makeBoolLiteral(true)))
      expect(reports[0].message).toBe(
        'Unnecessary ternary. Use `!cond` instead of `cond ? false : true`.',
      )
    })
  })

  // ===== REPORT PROPERTY TESTS (5) =====

  describe('report properties', () => {
    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      visitor.ConditionalExpression(makeConditionalNode(makeIdentifier('x'), makeBoolLiteral(true), makeBoolLiteral(false)))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      visitor.ConditionalExpression(makeConditionalNode(makeIdentifier('x'), makeBoolLiteral(true), makeBoolLiteral(false)))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input ConditionalExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      const node = makeConditionalNode(makeIdentifier('x'), makeBoolLiteral(true), makeBoolLiteral(false))
      visitor.ConditionalExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      visitor.ConditionalExpression(makeConditionalNode(makeIdentifier('x'), makeBoolLiteral(true), makeBoolLiteral(false), 5, 10, 5, 35))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      visitor.ConditionalExpression(makeConditionalNode(makeIdentifier('x'), makeBoolLiteral(true), makeBoolLiteral(false)))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })
  })

  // ===== NEGATIVE CASES — VALID TERNAIRES, NON-BOOLEAN LITERALS (15) =====

  describe('negative cases — does NOT report for valid ternaries', () => {
    test('does not report for cond ? true : 0 (mixed types)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      visitor.ConditionalExpression(makeConditionalNode(makeIdentifier('x'), makeBoolLiteral(true), { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(0)
    })

    test('does not report for cond ? false : 1 (mixed types)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      visitor.ConditionalExpression(makeConditionalNode(makeIdentifier('x'), makeBoolLiteral(false), { type: 'Literal', value: 1 }))
      expect(reports.length).toBe(0)
    })

    test('does not report for cond ? 1 : 0 (numeric literals)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      visitor.ConditionalExpression(makeConditionalNode(makeIdentifier('x'), { type: 'Literal', value: 1 }, { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(0)
    })

    test('does not report for cond ? "yes" : "no" (string literals)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      visitor.ConditionalExpression(makeConditionalNode(makeIdentifier('x'), { type: 'Literal', value: 'yes' }, { type: 'Literal', value: 'no' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for cond ? someVar : otherVar (identifiers)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      visitor.ConditionalExpression(makeConditionalNode(makeIdentifier('x'), makeIdentifier('someVar'), makeIdentifier('otherVar')))
      expect(reports.length).toBe(0)
    })

    test('does not report for cond ? null : undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      visitor.ConditionalExpression(makeConditionalNode(makeIdentifier('x'), { type: 'Literal', value: null }, makeIdentifier('undefined')))
      expect(reports.length).toBe(0)
    })

    test('does not report for cond ? true : "false" (string "false")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      visitor.ConditionalExpression(makeConditionalNode(makeIdentifier('x'), makeBoolLiteral(true), { type: 'Literal', value: 'false' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for cond ? fn() : bar() (call expressions)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      const fnCall = { type: 'CallExpression', callee: makeIdentifier('fn'), arguments: [] }
      const barCall = { type: 'CallExpression', callee: makeIdentifier('bar'), arguments: [] }
      visitor.ConditionalExpression(makeConditionalNode(makeIdentifier('x'), fnCall, barCall))
      expect(reports.length).toBe(0)
    })

    test('does not report for cond ? 1 : true (numeric and boolean)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      visitor.ConditionalExpression(makeConditionalNode(makeIdentifier('x'), { type: 'Literal', value: 1 }, makeBoolLiteral(true)))
      expect(reports.length).toBe(0)
    })

    test('does not report for cond ? x : true (identifier and boolean)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      visitor.ConditionalExpression(makeConditionalNode(makeIdentifier('x'), makeIdentifier('y'), makeBoolLiteral(true)))
      expect(reports.length).toBe(0)
    })

    test('does not report for cond ? { a: 1 } : { b: 2 }', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      const obj1 = { type: 'ObjectExpression', properties: [] }
      const obj2 = { type: 'ObjectExpression', properties: [] }
      visitor.ConditionalExpression(makeConditionalNode(makeIdentifier('x'), obj1, obj2))
      expect(reports.length).toBe(0)
    })

    test('does not report for cond ? [] : [1]', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      const arr1 = { type: 'ArrayExpression', elements: [] }
      const arr2 = { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] }
      visitor.ConditionalExpression(makeConditionalNode(makeIdentifier('x'), arr1, arr2))
      expect(reports.length).toBe(0)
    })

    test('does not report for cond ? true : true (same boolean)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      visitor.ConditionalExpression(makeConditionalNode(makeIdentifier('x'), makeBoolLiteral(true), makeBoolLiteral(true)))
      expect(reports.length).toBe(0)
    })

    test('does not report for cond ? false : false (same boolean)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      visitor.ConditionalExpression(makeConditionalNode(makeIdentifier('x'), makeBoolLiteral(false), makeBoolLiteral(false)))
      expect(reports.length).toBe(0)
    })

    test('does not report for cond ? 0 : 1 (both numeric)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      visitor.ConditionalExpression(makeConditionalNode(makeIdentifier('x'), { type: 'Literal', value: 0 }, { type: 'Literal', value: 1 }))
      expect(reports.length).toBe(0)
    })
  })

  // ===== NEGATIVE CASES — WRONG NODE TYPES / MISSING DATA (15) =====

  describe('negative cases — does NOT report for invalid input', () => {
    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      expect(() => visitor.ConditionalExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      expect(() => visitor.ConditionalExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      expect(() => visitor.ConditionalExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      expect(() => visitor.ConditionalExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      expect(() => visitor.ConditionalExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      expect(() => visitor.ConditionalExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      visitor.ConditionalExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      visitor.ConditionalExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      visitor.ConditionalExpression({ type: 'CallExpression', callee: makeIdentifier('fn'), arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for missing consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      visitor.ConditionalExpression({ type: 'ConditionalExpression', test: makeIdentifier('x'), alternate: makeBoolLiteral(false), loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for missing alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      visitor.ConditionalExpression({ type: 'ConditionalExpression', test: makeIdentifier('x'), consequent: makeBoolLiteral(true), loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for null consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      visitor.ConditionalExpression({ type: 'ConditionalExpression', test: makeIdentifier('x'), consequent: null, alternate: makeBoolLiteral(false), loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for null alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      visitor.ConditionalExpression({ type: 'ConditionalExpression', test: makeIdentifier('x'), consequent: makeBoolLiteral(true), alternate: null, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for string consequent (primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      visitor.ConditionalExpression({ type: 'ConditionalExpression', test: makeIdentifier('x'), consequent: 'true', alternate: makeBoolLiteral(false), loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for number alternate (primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      visitor.ConditionalExpression({ type: 'ConditionalExpression', test: makeIdentifier('x'), consequent: makeBoolLiteral(true), alternate: 0, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryTernaryBooleanRule.create(ctx1)
      const visitor2 = noUnnecessaryTernaryBooleanRule.create(ctx2)
      visitor1.ConditionalExpression(makeConditionalNode(makeIdentifier('x'), makeBoolLiteral(true), makeBoolLiteral(false)))
      visitor2.ConditionalExpression(makeConditionalNode(makeIdentifier('x'), makeIdentifier('a'), makeIdentifier('b')))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      visitor.ConditionalExpression(makeConditionalNode(makeIdentifier('x'), makeBoolLiteral(true), makeBoolLiteral(false)))
      visitor.ConditionalExpression(makeConditionalNode(makeIdentifier('x'), makeIdentifier('a'), makeIdentifier('b')))
      visitor.ConditionalExpression(makeConditionalNode(makeIdentifier('y'), makeBoolLiteral(false), makeBoolLiteral(true)))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      const node = {
        type: 'ConditionalExpression',
        test: makeIdentifier('x'),
        consequent: makeBoolLiteral(true),
        alternate: makeBoolLiteral(false),
      }
      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      const node = {
        type: 'ConditionalExpression',
        test: makeIdentifier('x'),
        consequent: makeBoolLiteral(true),
        alternate: makeBoolLiteral(false),
      }
      visitor.ConditionalExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      visitor.ConditionalExpression(makeConditionalNode(makeIdentifier('x'), makeIdentifier('a'), makeIdentifier('b')))
      visitor.ConditionalExpression(makeConditionalNode(makeIdentifier('x'), makeBoolLiteral(true), makeBoolLiteral(false)))
      visitor.ConditionalExpression(makeConditionalNode(makeIdentifier('x'), { type: 'Literal', value: 1 }, { type: 'Literal', value: 0 }))
      visitor.ConditionalExpression(makeConditionalNode(makeIdentifier('x'), makeBoolLiteral(false), makeBoolLiteral(true)))
      visitor.ConditionalExpression(makeConditionalNode(makeIdentifier('x'), makeBoolLiteral(true), makeBoolLiteral(true)))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryTernaryBooleanRule.create(context)
      const visitor2 = noUnnecessaryTernaryBooleanRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryTernaryBooleanRule.meta
      const meta2 = noUnnecessaryTernaryBooleanRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      const node = {
        type: 'ConditionalExpression',
        test: makeIdentifier('x'),
        consequent: makeBoolLiteral(true),
        alternate: makeBoolLiteral(false),
        loc: makeLoc(1, 0, 1, 20),
        range: [0, 20],
        extra: true,
        trailingComments: [],
      }
      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      visitor.ConditionalExpression({
        type: 'ConditionalExpression',
        test: makeIdentifier('x'),
        consequent: makeBoolLiteral(true),
        alternate: makeBoolLiteral(false),
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      visitor.ConditionalExpression({
        type: 'ConditionalExpression',
        test: makeIdentifier('x'),
        consequent: makeBoolLiteral(true),
        alternate: makeBoolLiteral(false),
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      const node = makeConditionalNode(makeIdentifier('x'), makeBoolLiteral(true), makeBoolLiteral(false))
      visitor.ConditionalExpression(node)
      visitor.ConditionalExpression(node)
      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryTernaryBooleanRule).toBeDefined()
      expect(typeof noUnnecessaryTernaryBooleanRule.create).toBe('function')
      expect(typeof noUnnecessaryTernaryBooleanRule.meta).toBe('object')
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      visitor.ConditionalExpression(makeConditionalNode(makeIdentifier('x'), makeBoolLiteral(true), makeBoolLiteral(false)))
      visitor.ConditionalExpression(makeConditionalNode(makeIdentifier('y'), makeBoolLiteral(true), makeBoolLiteral(false)))
      expect(reports.length).toBe(2)
    })

    test('all reports for true:false have same message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      visitor.ConditionalExpression(makeConditionalNode(makeIdentifier('x'), makeBoolLiteral(true), makeBoolLiteral(false)))
      visitor.ConditionalExpression(makeConditionalNode(makeIdentifier('y'), makeBoolLiteral(true), makeBoolLiteral(false)))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('all reports for false:true have same message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryBooleanRule.create(context)
      visitor.ConditionalExpression(makeConditionalNode(makeIdentifier('x'), makeBoolLiteral(false), makeBoolLiteral(true)))
      visitor.ConditionalExpression(makeConditionalNode(makeIdentifier('y'), makeBoolLiteral(false), makeBoolLiteral(true)))
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})
