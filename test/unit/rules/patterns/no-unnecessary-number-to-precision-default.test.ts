import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryNumberToPrecisionDefaultRule } from '../../../../src/rules/patterns/no-unnecessary-number-to-precision-default.js'
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

function makeNumExpr(): unknown {
  return { type: 'Literal', value: 42 }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-number-to-precision-default rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryNumberToPrecisionDefaultRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryNumberToPrecisionDefaultRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryNumberToPrecisionDefaultRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryNumberToPrecisionDefaultRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryNumberToPrecisionDefaultRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning toPrecision', () => {
      const desc = noUnnecessaryNumberToPrecisionDefaultRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/toprecision/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryNumberToPrecisionDefaultRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-number-to-precision-default.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryNumberToPrecisionDefaultRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryNumberToPrecisionDefaultRule).toBeDefined()
      expect(noUnnecessaryNumberToPrecisionDefaultRule.meta).toBeDefined()
      expect(noUnnecessaryNumberToPrecisionDefaultRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports toPrecision() without arguments', () => {
    test('reports for num.toPrecision()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumExpr(), 'toPrecision'))
      expect(reports.length).toBe(1)
    })

    test('reports for identifier.toPrecision()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toPrecision'))
      expect(reports.length).toBe(1)
    })

    test('reports for member.toPrecision()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'num' } }, 'toPrecision'))
      expect(reports.length).toBe(1)
    })

    test('reports for call result toPrecision()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getNum' }, arguments: [] }, 'toPrecision'))
      expect(reports.length).toBe(1)
    })

    test('reports for literal number 3.14.toPrecision()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 3.14 }, 'toPrecision'))
      expect(reports.length).toBe(1)
    })

    test('reports for binary expression result toPrecision()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'BinaryExpression', operator: '+', left: { type: 'Literal', value: 1 }, right: { type: 'Literal', value: 2 } }, 'toPrecision'))
      expect(reports.length).toBe(1)
    })

    test('report message mentions toPrecision', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumExpr(), 'toPrecision'))
      expect(reports[0].message).toMatch(/toPrecision/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumExpr(), 'toPrecision'))
      expect(reports[0].message).toBe(
        `num.toPrecision() without arguments defaults to toString(). Consider using toString() directly or specifying precision.`,
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumExpr(), 'toPrecision'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumExpr(), 'toPrecision'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      const node = makeCallNode(makeNumExpr(), 'toPrecision')
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumExpr(), 'toPrecision', [], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumExpr(), 'toPrecision'))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'toPrecision'))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumExpr(), 'toPrecision'))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'toPrecision'))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumExpr(), 'toPrecision'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for unary expression result toPrecision()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'UnaryExpression', operator: '-', prefix: true, argument: { type: 'Literal', value: 5 } }, 'toPrecision'))
      expect(reports.length).toBe(1)
    })

    test('reports for conditional expression toPrecision()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 2 } }, 'toPrecision'))
      expect(reports.length).toBe(1)
    })

    test('reports for parenthesized expression toPrecision()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ParenthesizedExpression', expression: { type: 'Literal', value: 42 } }, 'toPrecision'))
      expect(reports.length).toBe(1)
    })

    test('reports for type cast expression toPrecision()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'TSAsExpression', expression: { type: 'Literal', value: 42 }, typeAnnotation: { type: 'TSNumberKeyword' } }, 'toPrecision'))
      expect(reports.length).toBe(1)
    })

    test('reports for update expression toPrecision()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'UpdateExpression', operator: '++', prefix: false, argument: { type: 'Identifier', name: 'x' } }, 'toPrecision'))
      expect(reports.length).toBe(1)
    })

    test('reports for chained member num.val.toPrecision()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'val' } },
        'toPrecision',
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for literal 0 toPrecision()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 0 }, 'toPrecision'))
      expect(reports.length).toBe(1)
    })

    test('reports for negative literal toPrecision()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'UnaryExpression', operator: '-', prefix: true, argument: { type: 'Literal', value: 100 } }, 'toPrecision'))
      expect(reports.length).toBe(1)
    })

    test('reports for array access arr[0].toPrecision()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'arr' }, property: { type: 'Literal', value: 0 }, computed: true }, 'toPrecision'))
      expect(reports.length).toBe(1)
    })

    test('reports for template literal tagged toPrecision()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'TemplateLiteral', quasis: [], expressions: [] }, 'toPrecision'))
      expect(reports.length).toBe(1)
    })

    test('reports for assignment expression result toPrecision()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'AssignmentExpression', operator: '=', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: 42 } }, 'toPrecision'))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (43) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for num.toPrecision(2) — has argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumExpr(), 'toPrecision', [{ type: 'Literal', value: 2 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for num.toPrecision(5) — has argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumExpr(), 'toPrecision', [{ type: 'Literal', value: 5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for num.toPrecision(1) — has argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumExpr(), 'toPrecision', [{ type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for num.toPrecision(21) — max precision', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumExpr(), 'toPrecision', [{ type: 'Literal', value: 21 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for num.toPrecision(precision) — identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumExpr(), 'toPrecision', [{ type: 'Identifier', name: 'precision' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for num.toPrecision(n) — variable argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumExpr(), 'toPrecision', [{ type: 'Identifier', name: 'n' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for num.toPrecision(getN()) — call expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumExpr(), 'toPrecision', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'getN' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for num.toPrecision(obj.n) — member expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumExpr(), 'toPrecision', [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'n' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for num.toFixed() — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumExpr(), 'toFixed'))
      expect(reports.length).toBe(0)
    })

    test('does not report for num.toString() — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumExpr(), 'toString'))
      expect(reports.length).toBe(0)
    })

    test('does not report for num.toExponential() — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumExpr(), 'toExponential'))
      expect(reports.length).toBe(0)
    })

    test('does not report for num.toLocaleString() — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumExpr(), 'toLocaleString'))
      expect(reports.length).toBe(0)
    })

    test('does not report for num.valueOf() — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumExpr(), 'valueOf'))
      expect(reports.length).toBe(0)
    })

    test('does not report for num.toPrecision() with undefined argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumExpr(), 'toPrecision', [{ type: 'Identifier', name: 'undefined' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeNumExpr(),
          property: { type: 'Literal', value: 'toPrecision' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "ToPrecision" (different case)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumExpr(), 'ToPrecision'))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "TOPRECISION" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumExpr(), 'TOPRECISION'))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "toprecision" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumExpr(), 'toprecision'))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeNumExpr(),
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeNumExpr(),
          property: null,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for num.toPrecision(2, extra) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumExpr(), 'toPrecision', [{ type: 'Literal', value: 2 }, { type: 'Literal', value: 'extra' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.trim() — completely different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'trim'))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.push(x) — completely different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'push', [{ type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for obj.method() — different method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'obj' }, 'method'))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is not an array but has length > 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeNumExpr(),
          property: { type: 'Identifier', name: 'toPrecision' },
        },
        arguments: [{ type: 'Literal', value: 2 }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when node type is not CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression({ type: 'ExpressionStatement', expression: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for num.toPrecision(undefined) — has argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumExpr(), 'toPrecision', [{ type: 'Literal', value: undefined }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (17) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryNumberToPrecisionDefaultRule.create(ctx1)
      const visitor2 = noUnnecessaryNumberToPrecisionDefaultRule.create(ctx2)
      visitor1.CallExpression(makeCallNode(makeNumExpr(), 'toPrecision'))
      visitor2.CallExpression(makeCallNode(makeNumExpr(), 'toPrecision', [{ type: 'Literal', value: 2 }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumExpr(), 'toPrecision'))
      visitor.CallExpression(makeCallNode(makeNumExpr(), 'toPrecision', [{ type: 'Literal', value: 2 }]))
      visitor.CallExpression(makeCallNode(makeNumExpr(), 'toPrecision'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeNumExpr(),
          property: { type: 'Identifier', name: 'toPrecision' },
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeNumExpr(),
          property: { type: 'Identifier', name: 'toPrecision' },
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumExpr(), 'toPrecision', [{ type: 'Literal', value: 2 }]))
      visitor.CallExpression(makeCallNode(makeNumExpr(), 'toPrecision'))
      visitor.CallExpression(makeCallNode(makeNumExpr(), 'toFixed'))
      visitor.CallExpression(makeCallNode(makeNumExpr(), 'toPrecision'))
      visitor.CallExpression(makeCallNode(makeNumExpr(), 'toString'))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      const visitor2 = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryNumberToPrecisionDefaultRule.meta
      const meta2 = noUnnecessaryNumberToPrecisionDefaultRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeNumExpr(),
          property: { type: 'Identifier', name: 'toPrecision' },
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
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeNumExpr(),
          property: { type: 'Identifier', name: 'toPrecision' },
        },
        arguments: [],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeNumExpr(),
          property: { type: 'Identifier', name: 'toPrecision' },
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
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      const node = makeCallNode(makeNumExpr(), 'toPrecision')
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryNumberToPrecisionDefaultRule).toBeDefined()
      expect(typeof noUnnecessaryNumberToPrecisionDefaultRule.create).toBe('function')
      expect(typeof noUnnecessaryNumberToPrecisionDefaultRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeNumExpr(),
          property: { type: 'Identifier', name: 'toPrecision' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumExpr(), 'toPrecision', [], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles computed member expression property — not computed', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeNumExpr(),
          property: { type: 'Identifier', name: 'toPrecision' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeNumExpr(),
          property: { type: 'Literal', value: 'toPrecision' },
          computed: true,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToPrecisionDefaultRule.create(context)
      visitor.CallExpression(makeCallNode(makeNumExpr(), 'toPrecision'))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'toPrecision'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})
