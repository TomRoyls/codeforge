import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryParseFloatRule } from '../../../../src/rules/patterns/no-unnecessary-parse-float.js'
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
    getSource: () => 'parseFloat(42)',
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
  argValue: unknown,
  calleeName = 'parseFloat',
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 15,
): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: calleeName },
    arguments: [{ type: 'Literal', value: argValue }],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-parse-float rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryParseFloatRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryParseFloatRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryParseFloatRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryParseFloatRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryParseFloatRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning parseFloat', () => {
      const desc = noUnnecessaryParseFloatRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/parsefloat/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryParseFloatRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-parse-float',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryParseFloatRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryParseFloatRule).toBeDefined()
      expect(noUnnecessaryParseFloatRule.meta).toBeDefined()
      expect(noUnnecessaryParseFloatRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS UNNECESSARY PARSEFLOAT (25) =====

  describe('positive cases — reports unnecessary parseFloat', () => {
    test('reports for parseFloat(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      visitor.CallExpression(makeCallExpr(0))
      expect(reports.length).toBe(1)
    })

    test('reports for parseFloat(42)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      visitor.CallExpression(makeCallExpr(42))
      expect(reports.length).toBe(1)
    })

    test('reports for parseFloat(3.14)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      visitor.CallExpression(makeCallExpr(3.14))
      expect(reports.length).toBe(1)
    })

    test('reports for parseFloat(-1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      visitor.CallExpression(makeCallExpr(-1))
      expect(reports.length).toBe(1)
    })

    test('reports for parseFloat(0.5)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      visitor.CallExpression(makeCallExpr(0.5))
      expect(reports.length).toBe(1)
    })

    test('reports for parseFloat(100)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      visitor.CallExpression(makeCallExpr(100))
      expect(reports.length).toBe(1)
    })

    test('reports for parseFloat(999.999)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      visitor.CallExpression(makeCallExpr(999.999))
      expect(reports.length).toBe(1)
    })

    test('reports for parseFloat(1e10)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      visitor.CallExpression(makeCallExpr(1e10))
      expect(reports.length).toBe(1)
    })

    test('reports for parseFloat(1.5e-3)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      visitor.CallExpression(makeCallExpr(1.5e-3))
      expect(reports.length).toBe(1)
    })

    test('reports for parseFloat(0.0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      visitor.CallExpression(makeCallExpr(0.0))
      expect(reports.length).toBe(1)
    })

    test('reports for parseFloat(123456789)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      visitor.CallExpression(makeCallExpr(123456789))
      expect(reports.length).toBe(1)
    })

    test('reports for parseFloat(2.718)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      visitor.CallExpression(makeCallExpr(2.718))
      expect(reports.length).toBe(1)
    })

    test('reports for parseFloat(1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      visitor.CallExpression(makeCallExpr(1))
      expect(reports.length).toBe(1)
    })

    test('reports for parseFloat(256)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      visitor.CallExpression(makeCallExpr(256))
      expect(reports.length).toBe(1)
    })

    test('reports for parseFloat(6.022e23)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      visitor.CallExpression(makeCallExpr(6.022e23))
      expect(reports.length).toBe(1)
    })

    test('reports with custom loc coordinates', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      visitor.CallExpression(makeCallExpr(42, 'parseFloat', 5, 10, 5, 25))
      expect(reports.length).toBe(1)
    })

    test('reports with extra properties on node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseFloat' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 15),
        range: [0, 15],
        extra: true,
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseFloat' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 15),
        _parent: {},
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports with range property on node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseFloat' },
        arguments: [{ type: 'Literal', value: 7 }],
        loc: makeLoc(1, 0, 1, 14),
        range: [0, 14],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for parseFloat(Infinity)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      visitor.CallExpression(makeCallExpr(Infinity))
      expect(reports.length).toBe(1)
    })

    test('reports for parseFloat(NaN)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      visitor.CallExpression(makeCallExpr(NaN))
      expect(reports.length).toBe(1)
    })

    test('reports for parseFloat(-0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      visitor.CallExpression(makeCallExpr(-0))
      expect(reports.length).toBe(1)
    })

    test('reports for parseFloat(1.7976931348623157e+308)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      visitor.CallExpression(makeCallExpr(1.7976931348623157e+308))
      expect(reports.length).toBe(1)
    })

    test('reports for parseFloat(5e-324)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      visitor.CallExpression(makeCallExpr(5e-324))
      expect(reports.length).toBe(1)
    })

    test('reports for parseFloat(-99.99)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      visitor.CallExpression(makeCallExpr(-99.99))
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report message mentions "Unnecessary"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      visitor.CallExpression(makeCallExpr(42))
      expect(reports[0].message).toContain('Unnecessary')
    })

    test('report message mentions "parseFloat"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      visitor.CallExpression(makeCallExpr(42))
      expect(reports[0].message).toContain('parseFloat')
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      visitor.CallExpression(makeCallExpr(42))
      expect(reports[0].message).toBe(
        'Unnecessary parseFloat() call on a numeric literal. Use the value directly.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      visitor.CallExpression(makeCallExpr(42))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      visitor.CallExpression(makeCallExpr(42))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      const node = makeCallExpr(42)
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc start values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      visitor.CallExpression(makeCallExpr(42, 'parseFloat', 5, 10, 5, 25))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report loc end values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      visitor.CallExpression(makeCallExpr(42, 'parseFloat', 5, 10, 5, 25))
      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      visitor.CallExpression(makeCallExpr(42))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      visitor.CallExpression(makeCallExpr(1))
      visitor.CallExpression(makeCallExpr(2))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      visitor.CallExpression(makeCallExpr(1))
      visitor.CallExpression(makeCallExpr(3.14))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports only once per CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      visitor.CallExpression(makeCallExpr(42))
      expect(reports.length).toBe(1)
    })

    test('multiple violations accumulate correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      visitor.CallExpression(makeCallExpr(1))
      visitor.CallExpression(makeCallExpr(2))
      visitor.CallExpression(makeCallExpr(3))
      expect(reports.length).toBe(3)
    })

    test('report message mentions "numeric literal"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      visitor.CallExpression(makeCallExpr(42))
      expect(reports[0].message.toLowerCase()).toContain('numeric literal')
    })

    test('report message mentions "Use the value directly"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      visitor.CallExpression(makeCallExpr(42))
      expect(reports[0].message).toContain('Use the value directly')
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for string arg parseFloat("42")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      visitor.CallExpression(makeCallExpr('42'))
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean arg parseFloat(true)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      visitor.CallExpression(makeCallExpr(true))
      expect(reports.length).toBe(0)
    })

    test('does not report for identifier arg parseFloat(x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseFloat' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: makeLoc(1, 0, 1, 14),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for no args parseFloat()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseFloat' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 13),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for 2 args parseFloat(1, 10)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseFloat' },
        arguments: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 10 }],
        loc: makeLoc(1, 0, 1, 18),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for non-parseFloat callee parseInt(42)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      visitor.CallExpression(makeCallExpr(42, 'parseInt'))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      expect(() => visitor.CallExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'Math' }, property: { type: 'Identifier', name: 'parseFloat' } },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for null arg value in Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseFloat' },
        arguments: [{ type: 'Literal', value: null }],
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for string Literal arg parseFloat("hello")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      visitor.CallExpression(makeCallExpr('hello'))
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean Literal arg parseFloat(true)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      visitor.CallExpression(makeCallExpr(false))
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong callee name "Number"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      visitor.CallExpression(makeCallExpr(42, 'Number'))
      expect(reports.length).toBe(0)
    })

    test('does not report for missing callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      const node = {
        type: 'CallExpression',
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for null callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: null,
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type as top-level', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type as top-level', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      visitor.CallExpression({ type: 'Literal', value: 42, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is not array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseFloat' },
        arguments: 'not-array',
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when arg type is not Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseFloat' },
        arguments: [{ type: 'TemplateLiteral', value: 42 }],
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when callee type is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'FunctionExpression', name: 'parseFloat' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryParseFloatRule.create(ctx1)
      const visitor2 = noUnnecessaryParseFloatRule.create(ctx2)
      visitor1.CallExpression(makeCallExpr(42))
      visitor2.CallExpression(makeCallExpr('42'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly (mixed)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      visitor.CallExpression(makeCallExpr(42))
      visitor.CallExpression(makeCallExpr('42'))
      visitor.CallExpression(makeCallExpr(3.14))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseFloat' },
        arguments: [{ type: 'Literal', value: 42 }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseFloat' },
        arguments: [{ type: 'Literal', value: 42 }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      visitor.CallExpression(makeCallExpr(42))
      visitor.CallExpression(makeCallExpr('42'))
      visitor.CallExpression(makeCallExpr(3.14))
      visitor.CallExpression(makeCallExpr(true))
      visitor.CallExpression(makeCallExpr(0))
      expect(reports.length).toBe(3)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryParseFloatRule.create(context)
      const visitor2 = noUnnecessaryParseFloatRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryParseFloatRule.meta
      const meta2 = noUnnecessaryParseFloatRule.meta
      expect(meta1).toBe(meta2)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      visitor.CallExpression(makeCallExpr(42))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseFloat' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 15),
        range: [0, 15],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseFloat' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: {},
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseFloat' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: { start: { line: 3, column: 5 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      const node = makeCallExpr(42)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryParseFloatRule).toBeDefined()
      expect(typeof noUnnecessaryParseFloatRule.create).toBe('function')
      expect(typeof noUnnecessaryParseFloatRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseFloat' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 15),
        _parent: { type: 'ExpressionStatement' },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      visitor.CallExpression(makeCallExpr(42))
      visitor.CallExpression(makeCallExpr(3.14))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('node with range alongside loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseFloat' },
        arguments: [{ type: 'Literal', value: 8 }],
        loc: makeLoc(1, 0, 1, 14),
        range: [0, 14],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('does not report when arguments property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseFloat' },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      visitor.CallExpression(makeCallExpr(42, 'parseFloat', 10, 4, 10, 19))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(19)
    })

    test('does not report when first arg is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseFloat' },
        arguments: [null],
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg is a string primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseFloat' },
        arguments: ['not-an-object'],
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })
  })
})
