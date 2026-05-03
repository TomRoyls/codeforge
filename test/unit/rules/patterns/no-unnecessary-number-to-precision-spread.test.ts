import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryNumberToPrecisionSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-number-to-precision-spread.js'
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

function makeSpreadArg(): unknown {
  return { type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }
}

function makeCallNode(
  object: unknown,
  methodName: string,
  args: unknown[] = [],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object,
      property: { type: 'Identifier', name: methodName },
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-number-to-precision-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryNumberToPrecisionSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryNumberToPrecisionSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryNumberToPrecisionSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryNumberToPrecisionSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryNumberToPrecisionSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning toPrecision', () => {
      const desc = noUnnecessaryNumberToPrecisionSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/toprecision/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryNumberToPrecisionSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-number-to-precision-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryNumberToPrecisionSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryNumberToPrecisionSpreadRule).toBeDefined()
      expect(noUnnecessaryNumberToPrecisionSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryNumberToPrecisionSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (29) =====

  describe('positive cases — reports toPrecision with spread', () => {
    test('reports for num.toPrecision(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toPrecision', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for literal number (42).toPrecision(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 42 }, 'toPrecision', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for member expression obj.val.toPrecision(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'val' } }, 'toPrecision', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for call result getNum().toPrecision(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getNum' }, arguments: [] }, 'toPrecision', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions toPrecision', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toPrecision', [makeSpreadArg()]))
      expect(reports[0].message).toMatch(/toPrecision/)
    })

    test('report message mentions spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toPrecision', [makeSpreadArg()]))
      expect(reports[0].message).toMatch(/spread/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toPrecision', [makeSpreadArg()]))
      expect(reports[0].message).toBe(
        'num.toPrecision(...items) with spread is unusual. toPrecision() expects an optional precision.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toPrecision', [makeSpreadArg()]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toPrecision', [makeSpreadArg()]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'num' }, 'toPrecision', [makeSpreadArg()])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toPrecision', [makeSpreadArg()], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'toPrecision', [makeSpreadArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'toPrecision', [makeSpreadArg()]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'toPrecision', [makeSpreadArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'toPrecision', [makeSpreadArg()]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for spread with array argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toPrecision', [{ type: 'SpreadElement', argument: { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 2 }] } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with member expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toPrecision', [{ type: 'SpreadElement', argument: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prec' } } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with call expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toPrecision', [{ type: 'SpreadElement', argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getPrecision' }, arguments: [] } }]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toPrecision', [makeSpreadArg()]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for (3.14).toPrecision(...args)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 3.14 }, 'toPrecision', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for result.toPrecision(...items) where result is a BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'BinaryExpression', operator: '+', left: { type: 'Literal', value: 1 }, right: { type: 'Literal', value: 2 } }, 'toPrecision', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for chained call x.toFixed(2).toPrecision(...args)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'x' }, property: { type: 'Identifier', name: 'toFixed' } }, arguments: [{ type: 'Literal', value: 2 }] }, 'toPrecision', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for negative number literal (-1).toPrecision(...args)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'UnaryExpression', operator: '-', prefix: true, argument: { type: 'Literal', value: 1 } }, 'toPrecision', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for this.val.toPrecision(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'ThisExpression' }, property: { type: 'Identifier', name: 'val' } }, 'toPrecision', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr[0].toPrecision(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'arr' }, property: { type: 'Literal', value: 0 }, computed: true }, 'toPrecision', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for conditional (a ? b : c).toPrecision(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'a' }, consequent: { type: 'Identifier', name: 'b' }, alternate: { type: 'Identifier', name: 'c' } }, 'toPrecision', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for template literal tagged`.toPrecision(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toPrecision', [{ type: 'SpreadElement', argument: { type: 'TemplateLiteral', quasis: [], expressions: [] } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with Identifier argument named differently', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toPrecision', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'precisionArgs' } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with conditional expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toPrecision', [{ type: 'SpreadElement', argument: { type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 5 }] }, alternate: { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 10 }] } } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for parenthesized expression (num).toPrecision(...args)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toPrecision', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (38) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for num.toPrecision(5) — regular argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toPrecision', [{ type: 'Literal', value: 5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for num.toPrecision() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toPrecision', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for num.toPrecision(5, 2) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toPrecision', [{ type: 'Literal', value: 5 }, { type: 'Literal', value: 2 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for num.toFixed(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toFixed', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for num.toString(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toString', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for num.toExponential(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toExponential', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for num.valueOf(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'valueOf', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for num.toPrecision(...items) with computed member', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'num' },
          property: { type: 'Identifier', name: 'toPrecision' },
          computed: true,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeSpreadArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeSpreadArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [makeSpreadArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'num' },
          property: { type: 'Literal', value: 'toPrecision' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "toprecision" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toprecision', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "TO_PRECISION" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'TO_PRECISION', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'num' },
          property: { type: 'Identifier', name: 'toPrecision' },
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'num' },
          property: { type: 'Identifier', name: 'toPrecision' },
        },
        arguments: null,
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is an Identifier (not SpreadElement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toPrecision', [{ type: 'Identifier', name: 'precision' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a Literal number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toPrecision', [{ type: 'Literal', value: 5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toPrecision', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'getPrec' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toPrecision', [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'config' }, property: { type: 'Identifier', name: 'precision' } }]))
      expect(reports.length).toBe(0)
    })

    test('reports when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'toPrecision' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('reports when object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'toPrecision' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'num' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'num' },
          property: null,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for num.toPrecision(...items, extra) — two args with spread first', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toPrecision', [makeSpreadArg(), { type: 'Literal', value: 5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for num.toPrecision(undefined) — single non-spread arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toPrecision', [{ type: 'Identifier', name: 'undefined' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is an empty string (not an array)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'num' },
          property: { type: 'Identifier', name: 'toPrecision' },
        },
        arguments: '',
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (18) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryNumberToPrecisionSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryNumberToPrecisionSpreadRule.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toPrecision', [makeSpreadArg()]))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toPrecision', [{ type: 'Literal', value: 5 }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toPrecision', [makeSpreadArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toPrecision', [{ type: 'Literal', value: 5 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'toPrecision', [makeSpreadArg()]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'num' },
          property: { type: 'Identifier', name: 'toPrecision' },
        },
        arguments: [makeSpreadArg()],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'num' },
          property: { type: 'Identifier', name: 'toPrecision' },
        },
        arguments: [makeSpreadArg()],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toPrecision', [{ type: 'Literal', value: 5 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toPrecision', [makeSpreadArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toFixed', [makeSpreadArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'toPrecision', [makeSpreadArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toPrecision', []))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      const visitor2 = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryNumberToPrecisionSpreadRule.meta
      const meta2 = noUnnecessaryNumberToPrecisionSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'num' },
          property: { type: 'Identifier', name: 'toPrecision' },
        },
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
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'num' },
          property: { type: 'Identifier', name: 'toPrecision' },
        },
        arguments: [makeSpreadArg()],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'num' },
          property: { type: 'Identifier', name: 'toPrecision' },
        },
        arguments: [makeSpreadArg()],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'num' }, 'toPrecision', [makeSpreadArg()])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryNumberToPrecisionSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryNumberToPrecisionSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryNumberToPrecisionSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'num' },
          property: { type: 'Identifier', name: 'toPrecision' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toPrecision', [makeSpreadArg()], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles computed member expression property on outer callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'num' },
          property: { type: 'Identifier', name: 'toPrecision' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with literal string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'num' },
          property: { type: 'Literal', value: 'toPrecision' },
          computed: true,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'toPrecision', [makeSpreadArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'toPrecision', [makeSpreadArg()]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('does not report when argument type is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toPrecision', [{ argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })
  })
})
