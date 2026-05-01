import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringToNumberRule } from '../../../../src/rules/patterns/no-unnecessary-string-to-number.js'
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
    getSource: () => 'Number(42)',
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
  locEndCol = 10,
  extra?: Record<string, unknown>,
): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: calleeName },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
    ...extra,
  }
}

function makeNumericLiteral(value: number): unknown {
  return { type: 'Literal', value }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-string-to-number rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringToNumberRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringToNumberRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringToNumberRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringToNumberRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringToNumberRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Number', () => {
      const desc = noUnnecessaryStringToNumberRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toContain('number')
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringToNumberRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-string-to-number',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringToNumberRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringToNumberRule).toBeDefined()
      expect(noUnnecessaryStringToNumberRule.meta).toBeDefined()
      expect(noUnnecessaryStringToNumberRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS UNNECESSARY NUMBER() (25) =====

  describe('positive cases — reports unnecessary Number()', () => {
    test('reports for Number(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for Number(42)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [makeNumericLiteral(42)]))
      expect(reports.length).toBe(1)
    })

    test('reports for Number(3.14)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [makeNumericLiteral(3.14)]))
      expect(reports.length).toBe(1)
    })

    test('reports for Number(-1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [makeNumericLiteral(-1)]))
      expect(reports.length).toBe(1)
    })

    test('reports for Number(100)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [makeNumericLiteral(100)]))
      expect(reports.length).toBe(1)
    })

    test('reports for Number(0.5)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [makeNumericLiteral(0.5)]))
      expect(reports.length).toBe(1)
    })

    test('reports for Number(999)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [makeNumericLiteral(999)]))
      expect(reports.length).toBe(1)
    })

    test('reports for Number(1e5)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [makeNumericLiteral(1e5)]))
      expect(reports.length).toBe(1)
    })

    test('reports for Number(1.5) with loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [makeNumericLiteral(1.5)], 5, 10, 5, 20))
      expect(reports.length).toBe(1)
    })

    test('reports for Number(7) with extra properties on node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [makeNumericLiteral(7)], 1, 0, 1, 10, { range: [0, 10] }))
      expect(reports.length).toBe(1)
    })

    test('reports for Number(256)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [makeNumericLiteral(256)]))
      expect(reports.length).toBe(1)
    })

    test('reports for Number(0.001)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [makeNumericLiteral(0.001)]))
      expect(reports.length).toBe(1)
    })

    test('reports for Number(-99.9)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [makeNumericLiteral(-99.9)]))
      expect(reports.length).toBe(1)
    })

    test('reports for Number(1) with extra properties on literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [{ type: 'Literal', value: 1, raw: '1' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Number(50) with loc on literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [{ type: 'Literal', value: 50, loc: makeLoc(1, 7, 1, 9) }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Number(33)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [makeNumericLiteral(33)]))
      expect(reports.length).toBe(1)
    })

    test('reports for Number(88)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [makeNumericLiteral(88)]))
      expect(reports.length).toBe(1)
    })

    test('reports for Number(2)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [makeNumericLiteral(2)]))
      expect(reports.length).toBe(1)
    })

    test('reports for Number(10)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [makeNumericLiteral(10)]))
      expect(reports.length).toBe(1)
    })

    test('reports for Number(77)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [makeNumericLiteral(77)]))
      expect(reports.length).toBe(1)
    })

    test('reports for Number(44)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [makeNumericLiteral(44)]))
      expect(reports.length).toBe(1)
    })

    test('reports for Number(555)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [makeNumericLiteral(555)]))
      expect(reports.length).toBe(1)
    })

    test('reports for Number(66)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [makeNumericLiteral(66)]))
      expect(reports.length).toBe(1)
    })

    test('reports for Number(17)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [makeNumericLiteral(17)]))
      expect(reports.length).toBe(1)
    })

    test('reports for Number(23) with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Number' },
        arguments: [makeNumericLiteral(23)],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report message mentions "Unnecessary"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [makeNumericLiteral(42)]))
      expect(reports[0].message).toContain('Unnecessary')
    })

    test('report message mentions "Number()"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [makeNumericLiteral(42)]))
      expect(reports[0].message).toContain('Number()')
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [makeNumericLiteral(42)]))
      expect(reports[0].message).toBe(
        'Unnecessary Number() call on a numeric literal. Use the value directly.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [makeNumericLiteral(42)]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [makeNumericLiteral(42)]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      const node = makeCallExpr('Number', [makeNumericLiteral(42)])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [makeNumericLiteral(42)], 5, 10, 5, 20))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [makeNumericLiteral(42)]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [makeNumericLiteral(1)]))
      visitor.CallExpression(makeCallExpr('Number', [makeNumericLiteral(2)]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [makeNumericLiteral(1)]))
      visitor.CallExpression(makeCallExpr('Number', [makeNumericLiteral(99)]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports only once per call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [makeNumericLiteral(42)]))
      expect(reports.length).toBe(1)
    })

    test('message mentions "numeric literal"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [makeNumericLiteral(42)]))
      expect(reports[0].message.toLowerCase()).toContain('numeric literal')
    })

    test('message mentions "directly"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [makeNumericLiteral(42)]))
      expect(reports[0].message.toLowerCase()).toContain('directly')
    })

    test('report loc end values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [makeNumericLiteral(42)], 3, 5, 7, 15))
      expect(reports[0].loc?.end.line).toBe(7)
      expect(reports[0].loc?.end.column).toBe(15)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [makeNumericLiteral(42)], 10, 4, 10, 12))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(12)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Number("42") with string arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [{ type: 'Literal', value: '42' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number(true) with boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [{ type: 'Literal', value: true }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number(x) with Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number() no args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number(1, 2) with 2 args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [makeNumericLiteral(1), makeNumericLiteral(2)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Number(42) — NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Number' },
        arguments: [makeNumericLiteral(42)],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-Number callee String(42)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('String', [makeNumericLiteral(42)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression({})
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'foo' }, property: { type: 'Identifier', name: 'bar' } },
        arguments: [makeNumericLiteral(42)],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee name is "NumberConstructor"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('NumberConstructor', [makeNumericLiteral(42)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number(null) — null argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [null]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number(undefined) — undefined argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [undefined]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number with Literal of string type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [{ type: 'Literal', value: 'hello' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number with Literal of null value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [{ type: 'Literal', value: null }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for parseInt(42) — wrong callee name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('parseInt', [makeNumericLiteral(42)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number with Literal of boolean value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [{ type: 'Literal', value: false }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number with Literal of regex value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [{ type: 'Literal', value: /abc/ }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number with TemplateLiteral arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [{ type: 'TemplateLiteral', quasis: [], expressions: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number with 3 args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [makeNumericLiteral(1), makeNumericLiteral(2), makeNumericLiteral(3)]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringToNumberRule.create(ctx1)
      const visitor2 = noUnnecessaryStringToNumberRule.create(ctx2)
      visitor1.CallExpression(makeCallExpr('Number', [makeNumericLiteral(42)]))
      visitor2.CallExpression(makeCallExpr('String', [makeNumericLiteral(42)]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [makeNumericLiteral(1)]))
      visitor.CallExpression(makeCallExpr('Number', [makeNumericLiteral(2)]))
      visitor.CallExpression(makeCallExpr('Number', [makeNumericLiteral(3)]))
      expect(reports.length).toBe(3)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Number' },
        arguments: [makeNumericLiteral(42)],
      })
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Number' },
        arguments: [makeNumericLiteral(42)],
      })
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [makeNumericLiteral(42)]))
      visitor.CallExpression(makeCallExpr('Number', [{ type: 'Literal', value: '42' }]))
      visitor.CallExpression(makeCallExpr('String', [makeNumericLiteral(42)]))
      visitor.CallExpression(makeCallExpr('Number', [makeNumericLiteral(7)]))
      visitor.CallExpression(makeCallExpr('Number', []))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringToNumberRule.create(context)
      const visitor2 = noUnnecessaryStringToNumberRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringToNumberRule.meta
      const meta2 = noUnnecessaryStringToNumberRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [makeNumericLiteral(42)], 1, 0, 1, 10, { range: [0, 10], extra: true }))
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Number' },
        arguments: [makeNumericLiteral(42)],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Number' },
        arguments: [makeNumericLiteral(42)],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      const node = makeCallExpr('Number', [makeNumericLiteral(42)])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringToNumberRule).toBeDefined()
      expect(typeof noUnnecessaryStringToNumberRule.create).toBe('function')
      expect(typeof noUnnecessaryStringToNumberRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Number' },
        arguments: [makeNumericLiteral(42)],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [makeNumericLiteral(1)]))
      visitor.CallExpression(makeCallExpr('Number', [makeNumericLiteral(2)]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('does not report when arguments is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Number' },
        arguments: 'not-array',
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: null,
        arguments: [makeNumericLiteral(42)],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee type is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } },
        arguments: [makeNumericLiteral(42)],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [makeNumericLiteral(42)], 10, 4, 10, 12))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(12)
    })

    test('does not report for Number(Infinity) — NaN/Infinity are not number literals in practice', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [{ type: 'Identifier', name: 'Infinity' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when first argument is an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToNumberRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', [{ type: 'ArrayExpression', elements: [] }]))
      expect(reports.length).toBe(0)
    })
  })
})
