import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryIsFiniteSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-is-finite-spread.js'
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

function makeSpreadArg(argument: unknown = { type: 'Identifier', name: 'items' }): unknown {
  return { type: 'SpreadElement', argument }
}

function makeIsFiniteCallWithSpread(
  spreadArg: unknown = makeSpreadArg(),
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'isFinite' },
    arguments: [spreadArg],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-is-finite-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryIsFiniteSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryIsFiniteSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryIsFiniteSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryIsFiniteSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryIsFiniteSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning isFinite', () => {
      const desc = noUnnecessaryIsFiniteSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/isfinite/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryIsFiniteSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-is-finite-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryIsFiniteSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryIsFiniteSpreadRule).toBeDefined()
      expect(noUnnecessaryIsFiniteSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryIsFiniteSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (28) =====

  describe('positive cases — reports isFinite with spread', () => {
    test('reports for isFinite(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeIsFiniteCallWithSpread(makeSpreadArg({ type: 'Identifier', name: 'items' })))
      expect(reports.length).toBe(1)
    })

    test('reports for isFinite(...arr)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeIsFiniteCallWithSpread(makeSpreadArg({ type: 'Identifier', name: 'arr' })))
      expect(reports.length).toBe(1)
    })

    test('reports for isFinite(...[1, 2, 3])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeIsFiniteCallWithSpread(makeSpreadArg({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }] })))
      expect(reports.length).toBe(1)
    })

    test('reports for isFinite(...getValues())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeIsFiniteCallWithSpread(makeSpreadArg({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getValues' }, arguments: [] })))
      expect(reports.length).toBe(1)
    })

    test('reports for isFinite(...obj.items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeIsFiniteCallWithSpread(makeSpreadArg({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'items' } })))
      expect(reports.length).toBe(1)
    })

    test('reports for isFinite(...(nested))', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeIsFiniteCallWithSpread(makeSpreadArg({ type: 'Identifier', name: 'nested' })))
      expect(reports.length).toBe(1)
    })

    test('report message mentions isFinite and spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeIsFiniteCallWithSpread())
      expect(reports[0].message).toMatch(/isFinite/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeIsFiniteCallWithSpread())
      expect(reports[0].message).toBe(
        'isFinite(...items) with spread is unusual. isFinite() expects a single value.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeIsFiniteCallWithSpread())
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeIsFiniteCallWithSpread())
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      const node = makeIsFiniteCallWithSpread()
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeIsFiniteCallWithSpread(makeSpreadArg(), 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeIsFiniteCallWithSpread())
      visitor.CallExpression(makeIsFiniteCallWithSpread())
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeIsFiniteCallWithSpread())
      visitor.CallExpression(makeIsFiniteCallWithSpread(makeSpreadArg({ type: 'Identifier', name: 'arr' })))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for isFinite with spread of array literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeIsFiniteCallWithSpread(makeSpreadArg({ type: 'ArrayExpression', elements: [] })))
      expect(reports.length).toBe(1)
    })

    test('reports for isFinite with spread of member expression with computed', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeIsFiniteCallWithSpread(makeSpreadArg({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Literal', value: 0 }, computed: true })))
      expect(reports.length).toBe(1)
    })

    test('reports for isFinite with spread of conditional expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeIsFiniteCallWithSpread(makeSpreadArg({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'ArrayExpression', elements: [] }, alternate: { type: 'Identifier', name: 'y' } })))
      expect(reports.length).toBe(1)
    })

    test('reports for isFinite with spread of binary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeIsFiniteCallWithSpread(makeSpreadArg({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeIsFiniteCallWithSpread())
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for isFinite(...new Set())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeIsFiniteCallWithSpread(makeSpreadArg({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Set' }, arguments: [] })))
      expect(reports.length).toBe(1)
    })

    test('reports for isFinite(...args) where args is identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeIsFiniteCallWithSpread(makeSpreadArg({ type: 'Identifier', name: 'args' })))
      expect(reports.length).toBe(1)
    })

    test('reports for isFinite(...arguments)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeIsFiniteCallWithSpread(makeSpreadArg({ type: 'Identifier', name: 'arguments' })))
      expect(reports.length).toBe(1)
    })

    test('reports for isFinite with spread of template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeIsFiniteCallWithSpread(makeSpreadArg({ type: 'TemplateLiteral', quasis: [], expressions: [] })))
      expect(reports.length).toBe(1)
    })

    test('reports for isFinite with spread of call expression with arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeIsFiniteCallWithSpread(makeSpreadArg({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [{ type: 'Literal', value: 1 }] })))
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeIsFiniteCallWithSpread(makeSpreadArg(), 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports for isFinite with spread of sequence expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeIsFiniteCallWithSpread(makeSpreadArg({ type: 'SequenceExpression', expressions: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }] })))
      expect(reports.length).toBe(1)
    })

    test('reports for isFinite with spread of logical expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeIsFiniteCallWithSpread(makeSpreadArg({ type: 'LogicalExpression', operator: '||', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })))
      expect(reports.length).toBe(1)
    })

    test('reports for isFinite with spread of yield expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeIsFiniteCallWithSpread(makeSpreadArg({ type: 'YieldExpression', argument: null })))
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeIsFiniteCallWithSpread())
      visitor.CallExpression(makeIsFiniteCallWithSpread(makeSpreadArg({ type: 'Identifier', name: 'arr' })))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for isFinite(x) — no spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isFinite' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for isFinite(42) — literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isFinite' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for isNaN(...items) — wrong function name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.isFinite(...items) — MemberExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'isFinite' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.isFinite(...items) — MemberExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'isFinite' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for isFinite(...items, extra) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isFinite' },
        arguments: [makeSpreadArg(), { type: 'Literal', value: 1 }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for isFinite() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isFinite' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for isFinite(x, y) — two regular arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isFinite' },
        arguments: [{ type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeSpreadArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeSpreadArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee type is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'isFinite' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee name is "IsFinite" (capitalized)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'IsFinite' },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee name is "isfinite" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isfinite' },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isFinite' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isFinite' },
        arguments: null,
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is a FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is an ArrowFunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for myIsFinite(...items) — wrong function name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'myIsFinite' },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for isFinite(x) — single non-spread identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isFinite' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for isFinite(1 + 2) — single non-spread expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isFinite' },
        arguments: [{ type: 'BinaryExpression', operator: '+', left: { type: 'Literal', value: 1 }, right: { type: 'Literal', value: 2 } }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property name is "isNaN"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee name is "parseInt"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee name is "parseFloat"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseFloat' },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument type is not SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isFinite' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isFinite' },
        arguments: [null],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array has three elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isFinite' },
        arguments: [makeSpreadArg(), { type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for UpdateExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression({ type: 'UpdateExpression', operator: '++', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression({ type: 'FunctionDeclaration', id: { type: 'Identifier', name: 'fn' }, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression({ type: 'ExpressionStatement', expression: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (17) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryIsFiniteSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryIsFiniteSpreadRule.create(ctx2)
      visitor1.CallExpression(makeIsFiniteCallWithSpread())
      visitor2.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isFinite' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeIsFiniteCallWithSpread())
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isFinite' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: makeLoc(1, 0, 1, 15),
      })
      visitor.CallExpression(makeIsFiniteCallWithSpread(makeSpreadArg({ type: 'Identifier', name: 'arr' })))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isFinite' },
        arguments: [makeSpreadArg()],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isFinite' },
        arguments: [makeSpreadArg()],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeIsFiniteCallWithSpread())
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isFinite' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: makeLoc(1, 0, 1, 15),
      })
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 15),
      })
      visitor.CallExpression(makeIsFiniteCallWithSpread(makeSpreadArg({ type: 'Identifier', name: 'arr' })))
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'Number' }, property: { type: 'Identifier', name: 'isFinite' } },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryIsFiniteSpreadRule.create(context)
      const visitor2 = noUnnecessaryIsFiniteSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryIsFiniteSpreadRule.meta
      const meta2 = noUnnecessaryIsFiniteSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isFinite' },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isFinite' },
        arguments: [makeSpreadArg()],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isFinite' },
        arguments: [makeSpreadArg()],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      const node = makeIsFiniteCallWithSpread()
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryIsFiniteSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryIsFiniteSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryIsFiniteSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isFinite' },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles SpreadElement with complex argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeIsFiniteCallWithSpread(makeSpreadArg({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'method' },
        },
        arguments: [{ type: 'Literal', value: 1 }],
      })))
      expect(reports.length).toBe(1)
    })

    test('handles SpreadElement with object spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeIsFiniteCallWithSpread(makeSpreadArg({ type: 'ObjectExpression', properties: [] })))
      expect(reports.length).toBe(1)
    })


  })
})
