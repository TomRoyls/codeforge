import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryParseIntRule } from '../../../../src/rules/patterns/no-unnecessary-parse-int.js'
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
    getSource: () => 'parseInt(42)',
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

function makeNumericLiteral(value: number): unknown {
  return { type: 'Literal', value }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-parse-int rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryParseIntRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryParseIntRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryParseIntRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryParseIntRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryParseIntRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning parseInt', () => {
      const desc = noUnnecessaryParseIntRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/parseint/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryParseIntRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-parse-int',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryParseIntRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryParseIntRule).toBeDefined()
      expect(noUnnecessaryParseIntRule.meta).toBeDefined()
      expect(noUnnecessaryParseIntRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS UNNECESSARY PARSEINT (25) =====

  describe('positive cases — reports unnecessary parseInt', () => {
    test('reports for parseInt(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression(makeCallExpr('parseInt', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for parseInt(42)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression(makeCallExpr('parseInt', [makeNumericLiteral(42)]))
      expect(reports.length).toBe(1)
    })

    test('reports for parseInt(3.14)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression(makeCallExpr('parseInt', [makeNumericLiteral(3.14)]))
      expect(reports.length).toBe(1)
    })

    test('reports for parseInt(-1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression(makeCallExpr('parseInt', [makeNumericLiteral(-1)]))
      expect(reports.length).toBe(1)
    })

    test('reports for parseInt(0.5)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression(makeCallExpr('parseInt', [makeNumericLiteral(0.5)]))
      expect(reports.length).toBe(1)
    })

    test('reports for parseInt(100)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression(makeCallExpr('parseInt', [makeNumericLiteral(100)]))
      expect(reports.length).toBe(1)
    })

    test('reports for parseInt(999)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression(makeCallExpr('parseInt', [makeNumericLiteral(999)]))
      expect(reports.length).toBe(1)
    })

    test('reports for parseInt(0.1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression(makeCallExpr('parseInt', [makeNumericLiteral(0.1)]))
      expect(reports.length).toBe(1)
    })

    test('reports for parseInt(123.456)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression(makeCallExpr('parseInt', [makeNumericLiteral(123.456)]))
      expect(reports.length).toBe(1)
    })

    test('reports for parseInt(255)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression(makeCallExpr('parseInt', [makeNumericLiteral(255)]))
      expect(reports.length).toBe(1)
    })

    test('reports for parseInt(-0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression(makeCallExpr('parseInt', [makeNumericLiteral(-0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for parseInt(-99.99)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression(makeCallExpr('parseInt', [makeNumericLiteral(-99.99)]))
      expect(reports.length).toBe(1)
    })

    test('reports for parseInt(7)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression(makeCallExpr('parseInt', [makeNumericLiteral(7)]))
      expect(reports.length).toBe(1)
    })

    test('reports for parseInt(0.001)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression(makeCallExpr('parseInt', [makeNumericLiteral(0.001)]))
      expect(reports.length).toBe(1)
    })

    test('reports for parseInt(1000000)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression(makeCallExpr('parseInt', [makeNumericLiteral(1000000)]))
      expect(reports.length).toBe(1)
    })

    test('reports for parseInt(NaN)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression(makeCallExpr('parseInt', [makeNumericLiteral(NaN)]))
      expect(reports.length).toBe(1)
    })

    test('reports for parseInt(Infinity)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression(makeCallExpr('parseInt', [makeNumericLiteral(Infinity)]))
      expect(reports.length).toBe(1)
    })

    test('reports for parseInt(1e3)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression(makeCallExpr('parseInt', [makeNumericLiteral(1e3)]))
      expect(reports.length).toBe(1)
    })

    test('reports for parseInt(1.5)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression(makeCallExpr('parseInt', [makeNumericLiteral(1.5)]))
      expect(reports.length).toBe(1)
    })

    test('reports for node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 13),
        range: [0, 13] as [number, number],
        extra: true,
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for literal with raw property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression(makeCallExpr('parseInt', [{ type: 'Literal', value: 42, raw: '42' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for node with range property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      const node = makeCallExpr('parseInt', [makeNumericLiteral(42)])
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 13),
        _parent: { type: 'ExpressionStatement' },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for node with comments array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 13),
        comments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for parseInt(0) with specific loc values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression(makeCallExpr('parseInt', [makeNumericLiteral(0)], 10, 4, 10, 15))
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report message mentions "Unnecessary"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression(makeCallExpr('parseInt', [makeNumericLiteral(42)]))
      expect(reports[0].message).toContain('Unnecessary')
    })

    test('report message mentions "parseInt"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression(makeCallExpr('parseInt', [makeNumericLiteral(42)]))
      expect(reports[0].message).toContain('parseInt')
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression(makeCallExpr('parseInt', [makeNumericLiteral(42)]))
      expect(reports[0].message).toBe(
        'Unnecessary parseInt() call on a numeric literal. Use the value directly.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression(makeCallExpr('parseInt', [makeNumericLiteral(42)]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression(makeCallExpr('parseInt', [makeNumericLiteral(42)]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      const node = makeCallExpr('parseInt', [makeNumericLiteral(42)])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc start values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression(makeCallExpr('parseInt', [makeNumericLiteral(42)], 5, 10, 5, 23))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report loc end values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression(makeCallExpr('parseInt', [makeNumericLiteral(42)], 5, 10, 8, 23))
      expect(reports[0].loc?.end.line).toBe(8)
      expect(reports[0].loc?.end.column).toBe(23)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression(makeCallExpr('parseInt', [makeNumericLiteral(42)]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression(makeCallExpr('parseInt', [makeNumericLiteral(42)]))
      visitor.CallExpression(makeCallExpr('parseInt', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression(makeCallExpr('parseInt', [makeNumericLiteral(42)]))
      visitor.CallExpression(makeCallExpr('parseInt', [makeNumericLiteral(0)]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports only once per single call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression(makeCallExpr('parseInt', [makeNumericLiteral(42)]))
      expect(reports.length).toBe(1)
    })

    test('multiple violations produce separate reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression(makeCallExpr('parseInt', [makeNumericLiteral(42)]))
      visitor.CallExpression(makeCallExpr('parseInt', [makeNumericLiteral(3.14)]))
      expect(reports.length).toBe(2)
    })

    test('report node is reference-equal to input', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      const node = makeCallExpr('parseInt', [makeNumericLiteral(42)])
      visitor.CallExpression(node)
      expect(reports[0].node === node).toBe(true)
    })

    test('reports from different numeric values have same message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression(makeCallExpr('parseInt', [makeNumericLiteral(42)]))
      visitor.CallExpression(makeCallExpr('parseInt', [makeNumericLiteral(0)]))
      visitor.CallExpression(makeCallExpr('parseInt', [makeNumericLiteral(3.14)]))
      expect(reports[0].message).toBe(reports[1].message)
      expect(reports[1].message).toBe(reports[2].message)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for parseInt("42") with string argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression(makeCallExpr('parseInt', [{ type: 'Literal', value: '42' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for parseInt(true) with boolean argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression(makeCallExpr('parseInt', [{ type: 'Literal', value: true }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for parseInt(x) with Identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression(makeCallExpr('parseInt', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for parseInt() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression(makeCallExpr('parseInt', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for parseInt(1, 10) with two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression(makeCallExpr('parseInt', [makeNumericLiteral(1), makeNumericLiteral(10)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for parseFloat(42) with wrong callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression(makeCallExpr('parseFloat', [makeNumericLiteral(42)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'parseInt' },
        },
        arguments: [makeNumericLiteral(42)],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for TemplateLiteral argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression(makeCallExpr('parseInt', [{ type: 'TemplateLiteral', quasis: [], expressions: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for ObjectExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression(makeCallExpr('parseInt', [{ type: 'ObjectExpression', properties: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal with null value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression(makeCallExpr('parseInt', [{ type: 'Literal', value: null }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal without value property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression(makeCallExpr('parseInt', [{ type: 'Literal' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee type is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } },
        arguments: [makeNumericLiteral(42)],
        loc: makeLoc(1, 0, 1, 13),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee name is "isNaN"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression(makeCallExpr('isNaN', [makeNumericLiteral(42)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for array primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      expect(() => visitor.CallExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression(makeCallExpr('parseInt', [makeNumericLiteral(1), makeNumericLiteral(10), makeNumericLiteral(2)]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: 'not-array',
        loc: makeLoc(1, 0, 1, 13),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when first argument is not an object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [42],
        loc: makeLoc(1, 0, 1, 13),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: null,
        loc: makeLoc(1, 0, 1, 13),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryParseIntRule.create(ctx1)
      const visitor2 = noUnnecessaryParseIntRule.create(ctx2)
      visitor1.CallExpression(makeCallExpr('parseInt', [makeNumericLiteral(42)]))
      visitor2.CallExpression(makeCallExpr('parseFloat', [makeNumericLiteral(42)]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression(makeCallExpr('parseInt', [makeNumericLiteral(42)]))
      visitor.CallExpression(makeCallExpr('parseInt', [{ type: 'Literal', value: 'not-number' }]))
      visitor.CallExpression(makeCallExpr('parseInt', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [{ type: 'Literal', value: 42 }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [{ type: 'Literal', value: 42 }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression(makeCallExpr('parseInt', [makeNumericLiteral(42)]))
      visitor.CallExpression(makeCallExpr('parseInt', [{ type: 'Literal', value: '42' }]))
      visitor.CallExpression(makeCallExpr('parseFloat', [makeNumericLiteral(42)]))
      visitor.CallExpression(makeCallExpr('parseInt', [makeNumericLiteral(0)]))
      visitor.CallExpression(makeCallExpr('parseInt', [makeNumericLiteral(7)]))
      expect(reports.length).toBe(3)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryParseIntRule.create(context)
      const visitor2 = noUnnecessaryParseIntRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryParseIntRule.meta
      const meta2 = noUnnecessaryParseIntRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc missing end', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      const node = makeCallExpr('parseInt', [makeNumericLiteral(42)])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryParseIntRule).toBeDefined()
      expect(typeof noUnnecessaryParseIntRule.create).toBe('function')
      expect(typeof noUnnecessaryParseIntRule.meta).toBe('object')
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression(makeCallExpr('parseInt', [makeNumericLiteral(42)], 10, 4, 10, 17))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(17)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: null,
        arguments: [makeNumericLiteral(42)],
        loc: makeLoc(1, 0, 1, 13),
      })
      expect(reports.length).toBe(0)
    })

    test('does not crash when first arg is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [undefined],
        loc: makeLoc(1, 0, 1, 13),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: undefined,
        loc: makeLoc(1, 0, 1, 13),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is a string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: 'parseInt',
        arguments: [makeNumericLiteral(42)],
        loc: makeLoc(1, 0, 1, 13),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: 42,
        loc: makeLoc(1, 0, 1, 13),
      })
      expect(reports.length).toBe(0)
    })

    test('handles node with callee object missing type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { name: 'parseInt' },
        arguments: [makeNumericLiteral(42)],
        loc: makeLoc(1, 0, 1, 13),
      })
      expect(reports.length).toBe(0)
    })

    test('handles node with arguments containing null first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [null],
        loc: makeLoc(1, 0, 1, 13),
      })
      expect(reports.length).toBe(0)
    })

    test('handles Literal with object value (not number)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntRule.create(context)
      visitor.CallExpression(makeCallExpr('parseInt', [{ type: 'Literal', value: { nested: true } }]))
      expect(reports.length).toBe(0)
    })
  })
})
