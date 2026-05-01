import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryNumberToFixedRule } from '../../../../src/rules/patterns/no-unnecessary-number-to-fixed.js'
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
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeNumericLiteral(value: number): unknown {
  return { type: 'NumericLiteral', value }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-number-to-fixed rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryNumberToFixedRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryNumberToFixedRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryNumberToFixedRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryNumberToFixedRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryNumberToFixedRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning toFixed', () => {
      const desc = noUnnecessaryNumberToFixedRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/tofixed/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryNumberToFixedRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-number-to-fixed.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryNumberToFixedRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryNumberToFixedRule).toBeDefined()
      expect(noUnnecessaryNumberToFixedRule.meta).toBeDefined()
      expect(noUnnecessaryNumberToFixedRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (30) =====

  describe('positive cases — reports unnecessary toFixed', () => {
    test('reports for 42.toFixed() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumericLiteral(42), 'toFixed'))
      expect(reports.length).toBe(1)
    })

    test('reports for 0.toFixed() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumericLiteral(0), 'toFixed'))
      expect(reports.length).toBe(1)
    })

    test('reports for 100.toFixed() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumericLiteral(100), 'toFixed'))
      expect(reports.length).toBe(1)
    })

    test('reports for 3.14.toFixed() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumericLiteral(3.14), 'toFixed'))
      expect(reports.length).toBe(1)
    })

    test('reports for 42.toFixed(0) with literal zero argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumericLiteral(42), 'toFixed', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for 0.toFixed(0) with literal zero argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumericLiteral(0), 'toFixed', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for 999.toFixed(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumericLiteral(999), 'toFixed', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for 1.toFixed() — small number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumericLiteral(1), 'toFixed'))
      expect(reports.length).toBe(1)
    })

    test('reports for negative number literal (-5).toFixed()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumericLiteral(-5), 'toFixed'))
      expect(reports.length).toBe(1)
    })

    test('reports for large number 1e6.toFixed()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumericLiteral(1e6), 'toFixed'))
      expect(reports.length).toBe(1)
    })

    test('reports for 42.toFixed(-0) — negative zero as UnaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      const negZero = {
        type: 'UnaryExpression',
        operator: '-',
        argument: makeNumericLiteral(0),
      }
      visitor.CallExpression(makeCallNode(makeNumericLiteral(42), 'toFixed', [negZero]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions unnecessary toFixed', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumericLiteral(42), 'toFixed'))
      expect(reports[0].message).toMatch(/toFixed/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumericLiteral(42), 'toFixed'))
      expect(reports[0].message).toBe(
        'Unnecessary .toFixed() call without fractional digits. Use String() or template literal instead.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumericLiteral(42), 'toFixed'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumericLiteral(42), 'toFixed'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      const node = makeCallNode(makeNumericLiteral(42), 'toFixed')
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumericLiteral(42), 'toFixed', [], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumericLiteral(42), 'toFixed'))
      visitor.CallExpression(makeCallNode(makeNumericLiteral(100), 'toFixed'))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumericLiteral(42), 'toFixed'))
      visitor.CallExpression(makeCallNode(makeNumericLiteral(0), 'toFixed', [makeNumericLiteral(0)]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumericLiteral(42), 'toFixed'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for 2.5.toFixed(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumericLiteral(2.5), 'toFixed', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for 0.001.toFixed()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumericLiteral(0.001), 'toFixed'))
      expect(reports.length).toBe(1)
    })

    test('reports for NaN literal .toFixed() — NumericLiteral with NaN value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'NumericLiteral', value: NaN }, 'toFixed'))
      expect(reports.length).toBe(1)
    })

    test('reports for Infinity.toFixed()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumericLiteral(Infinity), 'toFixed'))
      expect(reports.length).toBe(1)
    })

    test('reports for 123.456.toFixed(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumericLiteral(123.456), 'toFixed', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for -0.toFixed() — negative zero value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumericLiteral(-0), 'toFixed'))
      expect(reports.length).toBe(1)
    })

    test('reports for very small number 0.0001.toFixed()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumericLiteral(0.0001), 'toFixed'))
      expect(reports.length).toBe(1)
    })

    test('reports for very large number 1e20.toFixed()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumericLiteral(1e20), 'toFixed'))
      expect(reports.length).toBe(1)
    })

    test('reports for -100.toFixed(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumericLiteral(-100), 'toFixed', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for 7.toFixed() — single digit', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumericLiteral(7), 'toFixed'))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for 42.toFixed(2) — non-zero argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumericLiteral(42), 'toFixed', [makeNumericLiteral(2)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for 42.toFixed(1) — non-zero argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumericLiteral(42), 'toFixed', [makeNumericLiteral(1)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for 42.toFixed(5) — non-zero argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumericLiteral(42), 'toFixed', [makeNumericLiteral(5)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for variable.toFixed() — Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toFixed'))
      expect(reports.length).toBe(0)
    })

    test('does not report for "hello".toFixed() — Literal object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'toFixed'))
      expect(reports.length).toBe(0)
    })

    test('does not report for 42.toString() — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumericLiteral(42), 'toString'))
      expect(reports.length).toBe(0)
    })

    test('does not report for 42.toPrecision() — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumericLiteral(42), 'toPrecision'))
      expect(reports.length).toBe(0)
    })

    test('does not report for 42.toExponential() — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumericLiteral(42), 'toExponential'))
      expect(reports.length).toBe(0)
    })

    test('does not report for 42.valueOf() — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumericLiteral(42), 'valueOf'))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeNumericLiteral(42),
          property: { type: 'Literal', value: 'toFixed' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "TOFIXED" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumericLiteral(42), 'TOFIXED'))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "tofixed" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumericLiteral(42), 'tofixed'))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getNum' }, arguments: [] }, 'toFixed'))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'num' } }, 'toFixed'))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'toFixed' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'toFixed' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object type is ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ObjectExpression', properties: [] }, 'toFixed'))
      expect(reports.length).toBe(0)
    })

    test('does not report when object type is FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }, 'toFixed'))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeNumericLiteral(42),
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeNumericLiteral(42),
          property: null,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for 42.toFixed(3) — argument is not zero', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumericLiteral(42), 'toFixed', [makeNumericLiteral(3)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for 42.toFixed(-1) — negative argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumericLiteral(42), 'toFixed', [makeNumericLiteral(-1)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for 42.toFixed(0, 0) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumericLiteral(42), 'toFixed', [makeNumericLiteral(0), makeNumericLiteral(0)]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a member expression (not literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumericLiteral(42), 'toFixed', [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'digits' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is Identifier (not literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumericLiteral(42), 'toFixed', [{ type: 'Identifier', name: 'digits' }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryNumberToFixedRule.create(ctx1)
      const visitor2 = noUnnecessaryNumberToFixedRule.create(ctx2)
      visitor1.CallExpression(makeCallNode(makeNumericLiteral(42), 'toFixed'))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'toFixed'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumericLiteral(42), 'toFixed'))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'toFixed'))
      visitor.CallExpression(makeCallNode(makeNumericLiteral(100), 'toFixed'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeNumericLiteral(42),
          property: { type: 'Identifier', name: 'toFixed' },
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeNumericLiteral(42),
          property: { type: 'Identifier', name: 'toFixed' },
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumericLiteral(42), 'toFixed'))
      visitor.CallExpression(makeCallNode(makeNumericLiteral(42), 'toFixed', [makeNumericLiteral(2)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'toFixed'))
      visitor.CallExpression(makeCallNode(makeNumericLiteral(0), 'toFixed', [makeNumericLiteral(0)]))
      visitor.CallExpression(makeCallNode(makeNumericLiteral(42), 'toString'))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryNumberToFixedRule.create(context)
      const visitor2 = noUnnecessaryNumberToFixedRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryNumberToFixedRule.meta
      const meta2 = noUnnecessaryNumberToFixedRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeNumericLiteral(42),
          property: { type: 'Identifier', name: 'toFixed' },
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
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeNumericLiteral(42),
          property: { type: 'Identifier', name: 'toFixed' },
        },
        arguments: [],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeNumericLiteral(42),
          property: { type: 'Identifier', name: 'toFixed' },
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
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      const node = makeCallNode(makeNumericLiteral(42), 'toFixed')
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryNumberToFixedRule).toBeDefined()
      expect(typeof noUnnecessaryNumberToFixedRule.create).toBe('function')
      expect(typeof noUnnecessaryNumberToFixedRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeNumericLiteral(42),
          property: { type: 'Identifier', name: 'toFixed' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumericLiteral(42), 'toFixed', [], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToFixedRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumericLiteral(42), 'toFixed'))
      visitor.CallExpression(makeCallNode(makeNumericLiteral(0), 'toFixed', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})
