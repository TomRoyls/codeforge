import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryDoubleNegationRule } from '../../../../src/rules/patterns/no-unnecessary-double-negation.js'
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
    getSource: () => '!!x',
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

function makeUnaryNot(argument: unknown, locStartLine = 1, locStartCol = 0, locEndLine = 1, locEndCol = 5): unknown {
  return {
    type: 'UnaryExpression',
    operator: '!',
    prefix: true,
    argument,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-double-negation rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryDoubleNegationRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryDoubleNegationRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryDoubleNegationRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryDoubleNegationRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryDoubleNegationRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning double negation', () => {
      const desc = noUnnecessaryDoubleNegationRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/double negation/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryDoubleNegationRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-double-negation',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryDoubleNegationRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with UnaryExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      expect(visitor).toHaveProperty('UnaryExpression')
      expect(typeof visitor.UnaryExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryDoubleNegationRule).toBeDefined()
      expect(noUnnecessaryDoubleNegationRule.meta).toBeDefined()
      expect(noUnnecessaryDoubleNegationRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS DOUBLE NEGATION (25) =====

  describe('positive cases — reports double negation', () => {
    test('reports !!x where inner is Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } }
      visitor.UnaryExpression(makeUnaryNot(inner))
      expect(reports.length).toBe(1)
    })

    test('reports !!x where inner argument is Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Literal', value: 0 } }
      visitor.UnaryExpression(makeUnaryNot(inner))
      expect(reports.length).toBe(1)
    })

    test('reports !!foo() where inner argument is CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'foo' }, arguments: [] } }
      visitor.UnaryExpression(makeUnaryNot(inner))
      expect(reports.length).toBe(1)
    })

    test('reports !!obj.prop where inner argument is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } } }
      visitor.UnaryExpression(makeUnaryNot(inner))
      expect(reports.length).toBe(1)
    })

    test('reports !!arr[0] where inner argument is computed MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'MemberExpression', object: { type: 'Identifier', name: 'arr' }, property: { type: 'Literal', value: 0 }, computed: true } }
      visitor.UnaryExpression(makeUnaryNot(inner))
      expect(reports.length).toBe(1)
    })

    test('reports !!a where inner argument is BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'BinaryExpression', operator: '>', left: { type: 'Identifier', name: 'a' }, right: { type: 'Literal', value: 0 } } }
      visitor.UnaryExpression(makeUnaryNot(inner))
      expect(reports.length).toBe(1)
    })

    test('reports !!x with loc on outer node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } }
      visitor.UnaryExpression(makeUnaryNot(inner, 5, 10, 5, 14))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('reports !!x with extra properties on node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } }
      const outer = { type: 'UnaryExpression', operator: '!', prefix: true, argument: inner, loc: makeLoc(1, 0, 1, 5), range: [0, 5], extra: true }
      visitor.UnaryExpression(outer)
      expect(reports.length).toBe(1)
    })

    test('reports !!x where inner has prefix true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } }
      visitor.UnaryExpression(makeUnaryNot(inner))
      expect(reports.length).toBe(1)
    })

    test('reports !!x where inner has prefix false (still matches)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '!', prefix: false, argument: { type: 'Identifier', name: 'x' } }
      visitor.UnaryExpression(makeUnaryNot(inner))
      expect(reports.length).toBe(1)
    })

    test('reports !!x where inner UnaryExpression has loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' }, loc: makeLoc(1, 1, 1, 3) }
      visitor.UnaryExpression(makeUnaryNot(inner))
      expect(reports.length).toBe(1)
    })

    test('reports !!x where inner argument is UpdateExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'UpdateExpression', operator: '++', prefix: true, argument: { type: 'Identifier', name: 'i' } } }
      visitor.UnaryExpression(makeUnaryNot(inner))
      expect(reports.length).toBe(1)
    })

    test('reports !!x where inner argument is LogicalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'LogicalExpression', operator: '&&', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } } }
      visitor.UnaryExpression(makeUnaryNot(inner))
      expect(reports.length).toBe(1)
    })

    test('reports !!x where inner argument is AssignmentExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'AssignmentExpression', operator: '=', left: { type: 'Identifier', name: 'a' }, right: { type: 'Literal', value: 1 } } }
      visitor.UnaryExpression(makeUnaryNot(inner))
      expect(reports.length).toBe(1)
    })

    test('reports !!x where inner argument is ConditionalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'ConditionalExpression', test: { type: 'Identifier', name: 'a' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 0 } } }
      visitor.UnaryExpression(makeUnaryNot(inner))
      expect(reports.length).toBe(1)
    })

    test('reports !!x where inner argument is UnaryExpression with operator -', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'UnaryExpression', operator: '-', prefix: true, argument: { type: 'Identifier', name: 'x' } } }
      visitor.UnaryExpression(makeUnaryNot(inner))
      expect(reports.length).toBe(1)
    })

    test('reports !!x where inner has extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' }, range: [1, 3], extra: 'data' }
      visitor.UnaryExpression(makeUnaryNot(inner))
      expect(reports.length).toBe(1)
    })

    test('reports !!x where inner argument is ThisExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'ThisExpression' } }
      visitor.UnaryExpression(makeUnaryNot(inner))
      expect(reports.length).toBe(1)
    })

    test('reports !!x where inner argument is NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'NewExpression', callee: { type: 'Identifier', name: 'Foo' }, arguments: [] } }
      visitor.UnaryExpression(makeUnaryNot(inner))
      expect(reports.length).toBe(1)
    })

    test('reports !!x where inner argument is ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'ArrayExpression', elements: [] } }
      visitor.UnaryExpression(makeUnaryNot(inner))
      expect(reports.length).toBe(1)
    })

    test('reports !!x where inner argument is ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'ObjectExpression', properties: [] } }
      visitor.UnaryExpression(makeUnaryNot(inner))
      expect(reports.length).toBe(1)
    })

    test('reports !!x where inner argument is FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } } }
      visitor.UnaryExpression(makeUnaryNot(inner))
      expect(reports.length).toBe(1)
    })

    test('reports !!x with multi-line loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } }
      visitor.UnaryExpression(makeUnaryNot(inner, 3, 0, 4, 5))
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.end.line).toBe(4)
    })

    test('reports !!x where inner UnaryExpression has no prefix property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '!', argument: { type: 'Identifier', name: 'x' } }
      visitor.UnaryExpression(makeUnaryNot(inner))
      expect(reports.length).toBe(1)
    })

    test('reports !!x where inner argument is SequenceExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'SequenceExpression', expressions: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }] } }
      visitor.UnaryExpression(makeUnaryNot(inner))
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report message mentions "Unnecessary double negation"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } }
      visitor.UnaryExpression(makeUnaryNot(inner))
      expect(reports[0].message).toContain('Unnecessary double negation')
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } }
      visitor.UnaryExpression(makeUnaryNot(inner))
      expect(reports[0].message).toBe(
        'Unnecessary double negation (!!). Use Boolean() or explicit cast.',
      )
    })

    test('report message mentions Boolean()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } }
      visitor.UnaryExpression(makeUnaryNot(inner))
      expect(reports[0].message).toContain('Boolean()')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } }
      visitor.UnaryExpression(makeUnaryNot(inner))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } }
      visitor.UnaryExpression(makeUnaryNot(inner))
      expect(reports[0].node).toBeDefined()
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } }
      visitor.UnaryExpression(makeUnaryNot(inner, 5, 10, 5, 15))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } }
      visitor.UnaryExpression(makeUnaryNot(inner))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('report node matches the outer UnaryExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } }
      const outer = makeUnaryNot(inner)
      visitor.UnaryExpression(outer)
      expect(reports[0].node).toBe(outer)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner1 = { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'a' } }
      const inner2 = { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'b' } }
      visitor.UnaryExpression(makeUnaryNot(inner1))
      visitor.UnaryExpression(makeUnaryNot(inner2))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner1 = { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'a' } }
      const inner2 = { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'b' } }
      visitor.UnaryExpression(makeUnaryNot(inner1))
      visitor.UnaryExpression(makeUnaryNot(inner2))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('single report per !! call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } }
      visitor.UnaryExpression(makeUnaryNot(inner))
      expect(reports.length).toBe(1)
    })

    test('multiple violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } }
      visitor.UnaryExpression(makeUnaryNot(inner))
      visitor.UnaryExpression(makeUnaryNot(inner))
      visitor.UnaryExpression(makeUnaryNot(inner))
      expect(reports.length).toBe(3)
    })

    test('report loc reflects end values from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } }
      visitor.UnaryExpression(makeUnaryNot(inner, 10, 4, 10, 12))
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(12)
    })

    test('report message mentions "!!"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } }
      visitor.UnaryExpression(makeUnaryNot(inner))
      expect(reports[0].message).toContain('!!')
    })

    test('report preserves distinct loc for different nodes', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner1 = { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'a' } }
      const inner2 = { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'b' } }
      visitor.UnaryExpression(makeUnaryNot(inner1, 1, 0, 1, 3))
      visitor.UnaryExpression(makeUnaryNot(inner2, 2, 5, 2, 8))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(2)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for single !x (only one negation)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      visitor.UnaryExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' }, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for -x (minus operator)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      visitor.UnaryExpression({ type: 'UnaryExpression', operator: '-', prefix: true, argument: { type: 'Identifier', name: 'x' }, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for +x (plus operator)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      visitor.UnaryExpression({ type: 'UnaryExpression', operator: '+', prefix: true, argument: { type: 'Identifier', name: 'x' }, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ~x (bitwise not operator)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      visitor.UnaryExpression({ type: 'UnaryExpression', operator: '~', prefix: true, argument: { type: 'Identifier', name: 'x' }, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for void x (void operator)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      visitor.UnaryExpression({ type: 'UnaryExpression', operator: 'void', prefix: true, argument: { type: 'Identifier', name: 'x' }, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof x (typeof operator)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      visitor.UnaryExpression({ type: 'UnaryExpression', operator: 'typeof', prefix: true, argument: { type: 'Identifier', name: 'x' }, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      visitor.UnaryExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      visitor.UnaryExpression({ type: 'Literal', value: 'test', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      visitor.UnaryExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when inner operator is not !', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '-', prefix: true, argument: { type: 'Identifier', name: 'x' } }
      visitor.UnaryExpression(makeUnaryNot(inner))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      expect(() => visitor.UnaryExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      expect(() => visitor.UnaryExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      expect(() => visitor.UnaryExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      expect(() => visitor.UnaryExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      expect(() => visitor.UnaryExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      expect(() => visitor.UnaryExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      visitor.UnaryExpression({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      visitor.UnaryExpression({ type: 'MemberExpression', object: {}, property: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      visitor.UnaryExpression({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for outer UnaryExpression with missing operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } }
      visitor.UnaryExpression({ type: 'UnaryExpression', prefix: true, argument: inner, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for outer UnaryExpression with operator undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } }
      visitor.UnaryExpression({ type: 'UnaryExpression', operator: undefined, prefix: true, argument: inner, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for !x where x is UpdateExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      visitor.UnaryExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'UpdateExpression', operator: '++', prefix: true, argument: { type: 'Identifier', name: 'i' } }, loc: makeLoc(1, 0, 1, 4) })
      expect(reports.length).toBe(0)
    })

    test('does not report for !x where inner has type missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } }
      visitor.UnaryExpression(makeUnaryNot(inner))
      expect(reports.length).toBe(0)
    })

    test('does not report for !x where inner operator is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { type: 'UnaryExpression', prefix: true, argument: { type: 'Identifier', name: 'x' } }
      visitor.UnaryExpression(makeUnaryNot(inner))
      expect(reports.length).toBe(0)
    })

    test('does not report for outer operator not ! with inner !', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } }
      visitor.UnaryExpression({ type: 'UnaryExpression', operator: '-', prefix: true, argument: inner, loc: makeLoc(1, 0, 1, 4) })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryDoubleNegationRule.create(ctx1)
      const visitor2 = noUnnecessaryDoubleNegationRule.create(ctx2)
      const inner1 = { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } }
      visitor1.UnaryExpression(makeUnaryNot(inner1))
      visitor2.UnaryExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'y' }, loc: makeLoc(1, 0, 1, 2) })
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } }
      visitor.UnaryExpression(makeUnaryNot(inner))
      visitor.UnaryExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'y' }, loc: makeLoc(1, 0, 1, 2) })
      visitor.UnaryExpression(makeUnaryNot(inner))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } }
      const outer = { type: 'UnaryExpression', operator: '!', prefix: true, argument: inner }
      visitor.UnaryExpression(outer)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } }
      const outer = { type: 'UnaryExpression', operator: '!', prefix: true, argument: inner }
      visitor.UnaryExpression(outer)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } }
      visitor.UnaryExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'y' }, loc: makeLoc(1, 0, 1, 2) })
      visitor.UnaryExpression(makeUnaryNot(inner))
      visitor.UnaryExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {} })
      visitor.UnaryExpression(makeUnaryNot(inner))
      visitor.UnaryExpression({ type: 'UnaryExpression', operator: '-', prefix: true, argument: inner, loc: makeLoc(1, 0, 1, 4) })
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryDoubleNegationRule.create(context)
      const visitor2 = noUnnecessaryDoubleNegationRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryDoubleNegationRule.meta
      const meta2 = noUnnecessaryDoubleNegationRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } }
      const outer = {
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
        argument: inner,
        loc: makeLoc(1, 0, 1, 5),
        range: [0, 5],
        extra: true,
      }
      visitor.UnaryExpression(outer)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } }
      const outer = { type: 'UnaryExpression', operator: '!', prefix: true, argument: inner, loc: {} }
      visitor.UnaryExpression(outer)
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } }
      const outer = { type: 'UnaryExpression', operator: '!', prefix: true, argument: inner, loc: { start: { line: 3, column: 5 } } }
      visitor.UnaryExpression(outer)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryDoubleNegationRule).toBeDefined()
      expect(typeof noUnnecessaryDoubleNegationRule.create).toBe('function')
      expect(typeof noUnnecessaryDoubleNegationRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } }
      const outer = { type: 'UnaryExpression', operator: '!', prefix: true, argument: inner, loc: makeLoc(1, 0, 1, 5), _parent: {} }
      visitor.UnaryExpression(outer)
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } }
      visitor.UnaryExpression(makeUnaryNot(inner, 10, 4, 10, 12))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(12)
    })

    test('reports when inner argument is null (rule does not check inner argument)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '!', prefix: true, argument: null }
      visitor.UnaryExpression(makeUnaryNot(inner))
      expect(reports.length).toBe(1)
    })

    test('reports when inner argument is undefined (rule does not check inner argument)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '!', prefix: true }
      visitor.UnaryExpression(makeUnaryNot(inner))
      expect(reports.length).toBe(1)
    })

    test('reports when inner argument is non-object (rule does not check inner argument)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '!', prefix: true, argument: 42 }
      visitor.UnaryExpression(makeUnaryNot(inner))
      expect(reports.length).toBe(1)
    })

    test('triple negation !!!x reports once for outer !!', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const innerArg = { type: 'Identifier', name: 'x' }
      const innerMost = { type: 'UnaryExpression', operator: '!', prefix: true, argument: innerArg }
      const middle = { type: 'UnaryExpression', operator: '!', prefix: true, argument: innerMost }
      visitor.UnaryExpression(makeUnaryNot(middle))
      expect(reports.length).toBe(1)
    })

    test('does not report when outer operator is delete', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } }
      visitor.UnaryExpression({ type: 'UnaryExpression', operator: 'delete', prefix: true, argument: inner, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not crash on array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      expect(() => visitor.UnaryExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not crash when node type is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleNegationRule.create(context)
      const inner = { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } }
      const outer = { operator: '!', prefix: true, argument: inner, loc: makeLoc(1, 0, 1, 5) }
      expect(() => visitor.UnaryExpression(outer)).not.toThrow()
    })
  })
})
