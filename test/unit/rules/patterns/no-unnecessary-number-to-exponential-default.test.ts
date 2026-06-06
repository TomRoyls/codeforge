import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryNumberToExponentialDefaultRule } from '../../../../src/rules/patterns/no-unnecessary-number-to-exponential-default.js'
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
      computed: false,
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeNumExpr(value: number): unknown {
  return { type: 'Literal', value }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-number-to-exponential-default rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryNumberToExponentialDefaultRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryNumberToExponentialDefaultRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryNumberToExponentialDefaultRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryNumberToExponentialDefaultRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryNumberToExponentialDefaultRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning toExponential', () => {
      const desc = noUnnecessaryNumberToExponentialDefaultRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/toexponential/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryNumberToExponentialDefaultRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-number-to-exponential-default.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryNumberToExponentialDefaultRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryNumberToExponentialDefaultRule).toBeDefined()
      expect(noUnnecessaryNumberToExponentialDefaultRule.meta).toBeDefined()
      expect(noUnnecessaryNumberToExponentialDefaultRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (30) =====

  describe('positive cases — reports toExponential() without args', () => {
    test('reports for num.toExponential() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toExponential'))
      expect(reports.length).toBe(1)
    })

    test('reports for literal number (42).toExponential()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 42 }, 'toExponential'))
      expect(reports.length).toBe(1)
    })

    test('reports for variable x.toExponential()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'toExponential'))
      expect(reports.length).toBe(1)
    })

    test('reports for result.toExponential() where result is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'val' } }, 'toExponential'))
      expect(reports.length).toBe(1)
    })

    test('reports for call result getValue().toExponential()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getValue' }, arguments: [] }, 'toExponential'))
      expect(reports.length).toBe(1)
    })

    test('report message mentions toExponential', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toExponential'))
      expect(reports[0].message).toMatch(/toExponential/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toExponential'))
      expect(reports[0].message).toBe(
        `num.toExponential() without arguments uses default fraction digits. Consider using toString() or explicit digits.`,
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toExponential'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toExponential'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'num' }, 'toExponential')
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toExponential', [], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'toExponential'))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'toExponential'))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'toExponential'))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'toExponential'))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toExponential'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for Math.PI-like chain access', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'Math' }, property: { type: 'Identifier', name: 'PI' } }, 'toExponential'))
      expect(reports.length).toBe(1)
    })

    test('reports for negative number literal (-1).toExponential()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'UnaryExpression', operator: '-', prefix: true, argument: { type: 'Literal', value: 1 } }, 'toExponential'))
      expect(reports.length).toBe(1)
    })

    test('reports for binary expression result (a + b).toExponential()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } }, 'toExponential'))
      expect(reports.length).toBe(1)
    })

    test('reports for parenthesized expression (x).toExponential()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'toExponential'))
      expect(reports.length).toBe(1)
    })

    test('reports for zero value (0).toExponential()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 0 }, 'toExponential'))
      expect(reports.length).toBe(1)
    })

    test('reports for very large number (1e20).toExponential()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 1e20 }, 'toExponential'))
      expect(reports.length).toBe(1)
    })

    test('reports for float (3.14).toExponential()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 3.14 }, 'toExponential'))
      expect(reports.length).toBe(1)
    })

    test('reports for Infinity.toExponential()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Infinity' }, 'toExponential'))
      expect(reports.length).toBe(1)
    })

    test('reports for assigned variable result.toExponential()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'result' }, 'toExponential'))
      expect(reports.length).toBe(1)
    })

    test('reports for array element access arr[0].toExponential()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'arr' }, property: { type: 'Literal', value: 0 }, computed: true }, 'toExponential'))
      expect(reports.length).toBe(1)
    })

    test('reports for nested call result getVal().toExponential()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getVal' }, arguments: [{ type: 'Identifier', name: 'x' }] }, 'toExponential'))
      expect(reports.length).toBe(1)
    })

    test('report loc end values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toExponential', [], 3, 5, 3, 25))
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports for chained obj.prop.val.toExponential()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }, property: { type: 'Identifier', name: 'val' } }, 'toExponential'))
      expect(reports.length).toBe(1)
    })

    test('reports for conditional expression (cond ? a : b).toExponential()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'cond' }, consequent: { type: 'Identifier', name: 'a' }, alternate: { type: 'Identifier', name: 'b' } }, 'toExponential'))
      expect(reports.length).toBe(1)
    })

    test('reports for Number(x).toExponential()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'Number' }, arguments: [{ type: 'Identifier', name: 'x' }] }, 'toExponential'))
      expect(reports.length).toBe(1)
    })

    test('reports for parseFloat(str).toExponential()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'parseFloat' }, arguments: [{ type: 'Identifier', name: 'str' }] }, 'toExponential'))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (38) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for num.toExponential(2) — with numeric argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toExponential', [{ type: 'Literal', value: 2 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for num.toExponential(0) — zero argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toExponential', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for num.toExponential(10) — max fraction digits', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toExponential', [{ type: 'Literal', value: 10 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for num.toExponential(x) — with Identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toExponential', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for num.toExponential(2, extra) — more than 1 argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toExponential', [{ type: 'Literal', value: 2 }, { type: 'Identifier', name: 'extra' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for num.toString() — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toString'))
      expect(reports.length).toBe(0)
    })

    test('does not report for num.toFixed() — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toFixed'))
      expect(reports.length).toBe(0)
    })

    test('does not report for num.toPrecision() — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toPrecision'))
      expect(reports.length).toBe(0)
    })

    test('does not report for num.valueOf() — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'valueOf'))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'num' },
          property: { type: 'Literal', value: 'toExponential' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "toExponential" with computed access', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'num' },
          property: { type: 'Identifier', name: 'toExponential' },
          computed: true,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "toFixed"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toFixed'))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'num' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'num' },
          property: null,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "toexponential" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toexponential'))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "TOEXPONENTIAL" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'TOEXPONENTIAL'))
      expect(reports.length).toBe(0)
    })

    test('does not report for num.toExponential(3) — explicit fraction digits', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toExponential', [{ type: 'Literal', value: 3 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for num.toExponential(fractionDigits) — with variable argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toExponential', [{ type: 'Identifier', name: 'fractionDigits' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.toLowerCase() — unrelated method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toLowerCase'))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is computed with string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'num' },
          property: { type: 'Literal', value: 'toExponential' },
          computed: true,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression({ type: 'ExpressionStatement', expression: {}, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression({ type: 'FunctionDeclaration', id: { type: 'Identifier', name: 'fn' }, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for num.toExponential(n + 1) — with BinaryExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toExponential', [{ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'n' }, right: { type: 'Literal', value: 1 } }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (17) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryNumberToExponentialDefaultRule.create(ctx1)
      const visitor2 = noUnnecessaryNumberToExponentialDefaultRule.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toExponential'))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toExponential', [{ type: 'Literal', value: 2 }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'toExponential'))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'toExponential', [{ type: 'Literal', value: 5 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'c' }, 'toExponential'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'num' },
          property: { type: 'Identifier', name: 'toExponential' },
          computed: false,
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'num' },
          property: { type: 'Identifier', name: 'toExponential' },
          computed: false,
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toExponential'))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toExponential', [{ type: 'Literal', value: 2 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toFixed'))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toExponential'))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toExponential', [{ type: 'Literal', value: 5 }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      const visitor2 = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryNumberToExponentialDefaultRule.meta
      const meta2 = noUnnecessaryNumberToExponentialDefaultRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'num' },
          property: { type: 'Identifier', name: 'toExponential' },
          computed: false,
        },
        arguments: [],
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
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'num' },
          property: { type: 'Identifier', name: 'toExponential' },
          computed: false,
        },
        arguments: [],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'num' },
          property: { type: 'Identifier', name: 'toExponential' },
          computed: false,
        },
        arguments: [],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'num' }, 'toExponential')
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryNumberToExponentialDefaultRule).toBeDefined()
      expect(typeof noUnnecessaryNumberToExponentialDefaultRule.create).toBe('function')
      expect(typeof noUnnecessaryNumberToExponentialDefaultRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'num' },
          property: { type: 'Identifier', name: 'toExponential' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toExponential', [], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'toExponential'))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'toExponential'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('does not report for num.toExponential(undefined) with undefined Identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toExponential', [{ type: 'Identifier', name: 'undefined' }]))
      expect(reports.length).toBe(0)
    })

    test('does not crash when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToExponentialDefaultRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'num' },
          property: { type: 'Identifier', name: 'toExponential' },
          computed: false,
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })
})
