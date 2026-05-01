import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryWaitRule } from '../../../../src/rules/patterns/no-unnecessary-wait.js'
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
    getSource: () => '',
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
  calleeName = 'waitFor',
  firstArgValue: unknown = 500,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: calleeName },
    arguments: [{ type: 'Literal', value: firstArgValue }],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-wait rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryWaitRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryWaitRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryWaitRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryWaitRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryWaitRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning waitFor', () => {
      const desc = noUnnecessaryWaitRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/waitfor/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryWaitRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-wait',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryWaitRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryWaitRule).toBeDefined()
      expect(noUnnecessaryWaitRule.meta).toBeDefined()
      expect(noUnnecessaryWaitRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS WAITFOR WITH NUMERIC LITERAL (25) =====

  describe('positive cases — reports waitFor with numeric literal', () => {
    test('reports waitFor(500)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression(makeCallNode('waitFor', 500))
      expect(reports.length).toBe(1)
    })

    test('reports waitFor(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression(makeCallNode('waitFor', 0))
      expect(reports.length).toBe(1)
    })

    test('reports waitFor(1000)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression(makeCallNode('waitFor', 1000))
      expect(reports.length).toBe(1)
    })

    test('reports waitFor(1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression(makeCallNode('waitFor', 1))
      expect(reports.length).toBe(1)
    })

    test('reports waitFor(9999)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression(makeCallNode('waitFor', 9999))
      expect(reports.length).toBe(1)
    })

    test('reports waitFor(3.14)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression(makeCallNode('waitFor', 3.14))
      expect(reports.length).toBe(1)
    })

    test('reports waitFor(-1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression(makeCallNode('waitFor', -1))
      expect(reports.length).toBe(1)
    })

    test('reports waitFor(0.001)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression(makeCallNode('waitFor', 0.001))
      expect(reports.length).toBe(1)
    })

    test('reports waitFor(1e3)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression(makeCallNode('waitFor', 1e3))
      expect(reports.length).toBe(1)
    })

    test('reports waitFor(Infinity)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression(makeCallNode('waitFor', Infinity))
      expect(reports.length).toBe(1)
    })

    test('reports waitFor(NaN)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression(makeCallNode('waitFor', NaN))
      expect(reports.length).toBe(1)
    })

    test('report message mentions "waitFor"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression(makeCallNode('waitFor', 500))
      expect(reports[0].message).toContain('waitFor')
    })

    test('report message mentions "numeric literal"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression(makeCallNode('waitFor', 500))
      expect(reports[0].message).toContain('numeric literal')
    })

    test('report message mentions "condition"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression(makeCallNode('waitFor', 500))
      expect(reports[0].message).toContain('condition')
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression(makeCallNode('waitFor', 500))
      expect(reports[0].message).toBe(
        'Avoid waitFor with a numeric literal. Prefer waiting for a condition.',
      )
    })

    test('reports with multiple numeric arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'waitFor' },
        arguments: [
          { type: 'Literal', value: 500 },
          { type: 'Literal', value: 100 },
        ],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(1)
    })

    test('reports with extra properties on node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'waitFor' },
        arguments: [{ type: 'Literal', value: 500 }],
        loc: makeLoc(1, 0, 1, 20),
        range: [0, 20],
        extra: true,
      })
      expect(reports.length).toBe(1)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression(makeCallNode('waitFor', 500))
      visitor.CallExpression(makeCallNode('waitFor', 100))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression(makeCallNode('waitFor', 500))
      visitor.CallExpression(makeCallNode('waitFor', 1000))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for waitFor(42)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression(makeCallNode('waitFor', 42))
      expect(reports.length).toBe(1)
    })

    test('reports for waitFor(200) with loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression(makeCallNode('waitFor', 200, 3, 5, 3, 20))
      expect(reports.length).toBe(1)
    })

    test('reports for waitFor(50.5)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression(makeCallNode('waitFor', 50.5))
      expect(reports.length).toBe(1)
    })

    test('reports for waitFor(1e-6)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression(makeCallNode('waitFor', 1e-6))
      expect(reports.length).toBe(1)
    })

    test('reports for waitFor(-999)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression(makeCallNode('waitFor', -999))
      expect(reports.length).toBe(1)
    })

    test('reports for waitFor(123456789)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression(makeCallNode('waitFor', 123456789))
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression(makeCallNode('waitFor', 500))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression(makeCallNode('waitFor', 500))
      expect(reports[0].node).toBeDefined()
    })

    test('report loc start line is preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression(makeCallNode('waitFor', 500, 5, 10, 5, 25))
      expect(reports[0].loc?.start.line).toBe(5)
    })

    test('report loc start column is preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression(makeCallNode('waitFor', 500, 5, 10, 5, 25))
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report loc end line is preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression(makeCallNode('waitFor', 500, 2, 0, 4, 15))
      expect(reports[0].loc?.end.line).toBe(4)
    })

    test('report loc end column is preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression(makeCallNode('waitFor', 500, 2, 0, 4, 15))
      expect(reports[0].loc?.end.column).toBe(15)
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      const node = makeCallNode('waitFor', 500)
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression(makeCallNode('waitFor', 500))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('report message is a non-empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression(makeCallNode('waitFor', 500))
      expect(typeof reports[0].message).toBe('string')
      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('report loc has start and end objects', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression(makeCallNode('waitFor', 500))
      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('report loc start has line and column', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression(makeCallNode('waitFor', 500))
      expect(typeof reports[0].loc?.start.line).toBe('number')
      expect(typeof reports[0].loc?.start.column).toBe('number')
    })

    test('report loc end has line and column', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression(makeCallNode('waitFor', 500))
      expect(typeof reports[0].loc?.end.line).toBe('number')
      expect(typeof reports[0].loc?.end.column).toBe('number')
    })

    test('report reflects specific location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression(makeCallNode('waitFor', 500, 10, 4, 10, 22))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(22)
    })

    test('two reports from different nodes have different loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression(makeCallNode('waitFor', 500, 1, 0, 1, 15))
      visitor.CallExpression(makeCallNode('waitFor', 100, 5, 3, 5, 18))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
    })

    test('two reports from different nodes have different node references', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      const node1 = makeCallNode('waitFor', 500)
      const node2 = makeCallNode('waitFor', 100)
      visitor.CallExpression(node1)
      visitor.CallExpression(node2)
      expect(reports[0].node).toBe(node1)
      expect(reports[1].node).toBe(node2)
      expect(reports[0].node).not.toBe(reports[1].node)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when callee name is not waitFor', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression(makeCallNode('setTimeout', 500))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee type is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: {}, property: {} },
        arguments: [{ type: 'Literal', value: 500 }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when node type is not CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression({
        type: 'Identifier',
        name: 'waitFor',
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when first argument is a string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression(makeCallNode('waitFor', '500'))
      expect(reports.length).toBe(0)
    })

    test('does not report when first argument is a boolean literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression(makeCallNode('waitFor', true))
      expect(reports.length).toBe(0)
    })

    test('does not report when first argument is null literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression(makeCallNode('waitFor', null))
      expect(reports.length).toBe(0)
    })

    test('does not report when first argument is an ArrowFunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'waitFor' },
        arguments: [{ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when first argument is a FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'waitFor' },
        arguments: [{ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when first argument is an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'waitFor' },
        arguments: [{ type: 'Identifier', name: 'timeout' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array is empty', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'waitFor' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 12),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'waitFor' },
        arguments: 'not-array',
        loc: makeLoc(1, 0, 1, 12),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: null,
        arguments: [{ type: 'Literal', value: 500 }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is a string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: 'waitFor',
        arguments: [{ type: 'Literal', value: 500 }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee name is "wait" instead of "waitFor"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression(makeCallNode('wait', 500))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee name is "WaitFor" (case-sensitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression(makeCallNode('WaitFor', 500))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when first argument type is not Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'waitFor' },
        arguments: [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression({ type: 'MemberExpression', object: {}, property: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when first argument is an object expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'waitFor' },
        arguments: [{ type: 'ObjectExpression', properties: [] }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryWaitRule.create(ctx1)
      const visitor2 = noUnnecessaryWaitRule.create(ctx2)
      visitor1.CallExpression(makeCallNode('waitFor', 500))
      visitor2.CallExpression(makeCallNode('setTimeout', 500))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression(makeCallNode('waitFor', 500))
      visitor.CallExpression(makeCallNode('setTimeout', 500))
      visitor.CallExpression(makeCallNode('waitFor', 100))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'waitFor' },
        arguments: [{ type: 'Literal', value: 500 }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'waitFor' },
        arguments: [{ type: 'Literal', value: 500 }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression(makeCallNode('waitFor', 500))
      visitor.CallExpression(makeCallNode('waitFor', 'condition'))
      visitor.CallExpression(makeCallNode('setTimeout', 500))
      visitor.CallExpression(makeCallNode('waitFor', 100))
      visitor.CallExpression(makeCallNode('wait', 500))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryWaitRule.create(context)
      const visitor2 = noUnnecessaryWaitRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryWaitRule.meta
      const meta2 = noUnnecessaryWaitRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'waitFor' },
        arguments: [{ type: 'Literal', value: 500 }],
        loc: makeLoc(1, 0, 1, 20),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      const node = makeCallNode('waitFor', 500)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryWaitRule).toBeDefined()
      expect(typeof noUnnecessaryWaitRule.create).toBe('function')
      expect(typeof noUnnecessaryWaitRule.meta).toBe('object')
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'waitFor' },
        arguments: [{ type: 'Literal', value: 500 }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'waitFor' },
        arguments: [{ type: 'Literal', value: 500 }],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('handles array primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      expect(() => visitor.CallExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression(makeCallNode('waitFor', 500))
      visitor.CallExpression(makeCallNode('waitFor', 1000))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('does not report when callee type is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { name: 'waitFor' },
        arguments: [{ type: 'Literal', value: 500 }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when first argument is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'waitFor' },
        arguments: [undefined],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('reports when first arg Literal value is 0 (falsy number)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression(makeCallNode('waitFor', 0))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe(
        'Avoid waitFor with a numeric literal. Prefer waiting for a condition.',
      )
    })

    test('does not report when first argument object has no type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'waitFor' },
        arguments: [{ value: 500 }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('handles node with range property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'waitFor' },
        arguments: [{ type: 'Literal', value: 500 }],
        loc: makeLoc(1, 0, 1, 20),
        range: [0, 20],
      })
      expect(reports.length).toBe(1)
    })

    test('does not report for first argument with type Literal but string value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryWaitRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'waitFor' },
        arguments: [{ type: 'Literal', value: '500' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })
  })
})
