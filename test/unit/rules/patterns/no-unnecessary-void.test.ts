import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryVoidRule } from '../../../../src/rules/patterns/no-unnecessary-void.js'
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
    getSource: () => 'void undefined;',
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

function makeVoidUndefinedNode(
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 15,
): unknown {
  return {
    type: 'UnaryExpression',
    operator: 'void',
    prefix: true,
    argument: { type: 'Literal', value: undefined, raw: 'undefined' },
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-void rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryVoidRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryVoidRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryVoidRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryVoidRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryVoidRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning void', () => {
      const desc = noUnnecessaryVoidRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/void/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryVoidRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-void',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryVoidRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with UnaryExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      expect(visitor).toHaveProperty('UnaryExpression')
      expect(typeof visitor.UnaryExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryVoidRule).toBeDefined()
      expect(noUnnecessaryVoidRule.meta).toBeDefined()
      expect(noUnnecessaryVoidRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES (25) =====

  describe('positive cases — reports void undefined', () => {
    test('reports for basic void undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression(makeVoidUndefinedNode())
      expect(reports.length).toBe(1)
    })

    test('reports for void undefined with prefix true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression({ ...makeVoidUndefinedNode(), prefix: true })
      expect(reports.length).toBe(1)
    })

    test('reports for void undefined with different loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression(makeVoidUndefinedNode(5, 10, 5, 25))
      expect(reports.length).toBe(1)
    })

    test('reports for void undefined with range property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression({ ...makeVoidUndefinedNode(), range: [0, 15] })
      expect(reports.length).toBe(1)
    })

    test('reports for void undefined with extra properties on node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression({ ...makeVoidUndefinedNode(), extra: true, flags: 'test' })
      expect(reports.length).toBe(1)
    })

    test('reports for void undefined with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression({ ...makeVoidUndefinedNode(), _parent: {} })
      expect(reports.length).toBe(1)
    })

    test('reports for void undefined with argument having extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'void',
        prefix: true,
        argument: { type: 'Literal', value: undefined, raw: 'undefined', extra: true },
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for void undefined with minimal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'void',
        argument: { type: 'Literal', value: undefined },
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for void undefined with different start/end loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression(makeVoidUndefinedNode(3, 5, 7, 10))
      expect(reports.length).toBe(1)
    })

    test('reports for void undefined in expression-like context', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      const node = makeVoidUndefinedNode()
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports multiple violations accumulated across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression(makeVoidUndefinedNode())
      visitor.UnaryExpression(makeVoidUndefinedNode())
      expect(reports.length).toBe(2)
    })

    test('reports for void undefined with argument having raw property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'void',
        argument: { type: 'Literal', value: undefined, raw: 'undefined' },
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for void undefined with prefix false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'void',
        prefix: false,
        argument: { type: 'Literal', value: undefined },
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(1)
    })

    test('reports consistently for same input across contexts', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryVoidRule.create(ctx1)
      const visitor2 = noUnnecessaryVoidRule.create(ctx2)
      visitor1.UnaryExpression(makeVoidUndefinedNode())
      visitor2.UnaryExpression(makeVoidUndefinedNode())
      expect(rep1.length).toBe(rep2.length)
    })

    test('reports for void undefined with large line/column numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression(makeVoidUndefinedNode(100, 50, 100, 65))
      expect(reports.length).toBe(1)
    })

    test('reports for void undefined with multi-line location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression(makeVoidUndefinedNode(1, 10, 3, 5))
      expect(reports.length).toBe(1)
    })

    test('reports for void undefined with zero line and column', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression(makeVoidUndefinedNode(0, 0, 0, 15))
      expect(reports.length).toBe(1)
    })

    test('reports for void undefined with regex-like flags on argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'void',
        argument: { type: 'Literal', value: undefined, regex: { pattern: '', flags: '' } },
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for void undefined with bigint property on argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'void',
        argument: { type: 'Literal', value: undefined, bigint: undefined },
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for void undefined with decorators array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression({
        ...makeVoidUndefinedNode(),
        decorators: [],
      })
      expect(reports.length).toBe(1)
    })

    test('reports for void undefined as only violation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression(makeVoidUndefinedNode())
      expect(reports.length).toBe(1)
      expect(reports[0].message).toBeTruthy()
    })

    test('reports for void undefined after non-matching node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      visitor.UnaryExpression(makeVoidUndefinedNode())
      expect(reports.length).toBe(1)
    })

    test('reports for void undefined with async parent context', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression({
        ...makeVoidUndefinedNode(),
        parent: { type: 'ArrowFunctionExpression', async: true },
      })
      expect(reports.length).toBe(1)
    })

    test('reports for void undefined before non-matching node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression(makeVoidUndefinedNode())
      visitor.UnaryExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(1)
    })

    test('reports for void undefined with empty loc on argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'void',
        argument: { type: 'Literal', value: undefined, loc: {} },
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report message mentions "Unnecessary void undefined"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression(makeVoidUndefinedNode())
      expect(reports[0].message).toContain('Unnecessary void undefined')
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression(makeVoidUndefinedNode())
      expect(reports[0].message).toBe(
        'Unnecessary void undefined. Use undefined directly.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression(makeVoidUndefinedNode())
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression(makeVoidUndefinedNode())
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input UnaryExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      const node = makeVoidUndefinedNode()
      visitor.UnaryExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc start values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression(makeVoidUndefinedNode(5, 10, 5, 25))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report loc end values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression(makeVoidUndefinedNode(3, 5, 7, 10))
      expect(reports[0].loc?.end.line).toBe(7)
      expect(reports[0].loc?.end.column).toBe(10)
    })

    test('report descriptor has message property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression(makeVoidUndefinedNode())
      expect(reports[0]).toHaveProperty('message')
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression(makeVoidUndefinedNode())
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('consistent messages across multiple violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression(makeVoidUndefinedNode())
      visitor.UnaryExpression(makeVoidUndefinedNode(2, 0, 2, 15))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('single report per violation call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression(makeVoidUndefinedNode())
      expect(reports.length).toBe(1)
    })

    test('accumulation of reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression(makeVoidUndefinedNode())
      visitor.UnaryExpression(makeVoidUndefinedNode())
      visitor.UnaryExpression(makeVoidUndefinedNode())
      expect(reports.length).toBe(3)
    })

    test('report message mentions "undefined directly"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression(makeVoidUndefinedNode())
      expect(reports[0].message).toContain('undefined directly')
    })

    test('report loc start line is correct for given input', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression(makeVoidUndefinedNode(10, 4, 10, 19))
      expect(reports[0].loc?.start.line).toBe(10)
    })

    test('report loc start column is correct for given input', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression(makeVoidUndefinedNode(10, 4, 10, 19))
      expect(reports[0].loc?.start.column).toBe(4)
    })
  })

  // ===== NEGATIVE CASES (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for void 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'void',
        argument: { type: 'Literal', value: 0 },
        loc: makeLoc(1, 0, 1, 7),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for void "string"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'void',
        argument: { type: 'Literal', value: 'string' },
        loc: makeLoc(1, 0, 1, 14),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for void null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'void',
        argument: { type: 'Literal', value: null },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for void 42', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'void',
        argument: { type: 'Literal', value: 42 },
        loc: makeLoc(1, 0, 1, 8),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for void with Identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'void',
        argument: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 7),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for just undefined as Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression({ type: 'Identifier', name: 'undefined', loc: makeLoc(1, 0, 1, 9) })
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'typeof',
        argument: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for operator ! (not void)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: '!',
        argument: { type: 'Literal', value: undefined },
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for operator - (not void)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: '-',
        argument: { type: 'Literal', value: 1 },
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for operator + (not void)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: '+',
        argument: { type: 'Literal', value: 1 },
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for operator ~ (not void)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: '~',
        argument: { type: 'Literal', value: 1 },
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-UnaryExpression BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression({
        type: 'BinaryExpression',
        operator: '+',
        left: {},
        right: {},
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      expect(() => visitor.UnaryExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      expect(() => visitor.UnaryExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      expect(() => visitor.UnaryExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      expect(() => visitor.UnaryExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      expect(() => visitor.UnaryExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      expect(() => visitor.UnaryExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      expect(() => visitor.UnaryExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression({ type: 'MemberExpression', object: {}, property: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for void with no argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'void',
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for void with non-object argument (string)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'void',
        argument: 'not-an-object',
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for void with non-object argument (number)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'void',
        argument: 42,
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for void with argument missing type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'void',
        argument: { value: undefined },
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryVoidRule.create(ctx1)
      const visitor2 = noUnnecessaryVoidRule.create(ctx2)
      visitor1.UnaryExpression(makeVoidUndefinedNode())
      visitor2.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'void',
        argument: { type: 'Literal', value: 0 },
        loc: makeLoc(1, 0, 1, 7),
      })
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly with mixed inputs', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression(makeVoidUndefinedNode())
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'void',
        argument: { type: 'Literal', value: 0 },
        loc: makeLoc(1, 0, 1, 7),
      })
      visitor.UnaryExpression(makeVoidUndefinedNode())
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: { type: 'Literal', value: undefined },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: { type: 'Literal', value: undefined },
      }
      visitor.UnaryExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'void',
        argument: { type: 'Literal', value: 0 },
        loc: makeLoc(1, 0, 1, 7),
      })
      visitor.UnaryExpression(makeVoidUndefinedNode())
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'void',
        argument: { type: 'Literal', value: null },
        loc: makeLoc(1, 0, 1, 10),
      })
      visitor.UnaryExpression(makeVoidUndefinedNode())
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: '!',
        argument: { type: 'Literal', value: undefined },
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryVoidRule.create(context)
      const visitor2 = noUnnecessaryVoidRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryVoidRule.meta
      const meta2 = noUnnecessaryVoidRule.meta
      expect(meta1).toBe(meta2)
    })

    test('report descriptor has all expected properties in edge case', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression(makeVoidUndefinedNode())
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: { type: 'Literal', value: undefined },
        loc: makeLoc(1, 0, 1, 15),
        range: [0, 15],
        extra: true,
        flags: 'g',
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'void',
        argument: { type: 'Literal', value: undefined },
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'void',
        argument: { type: 'Literal', value: undefined },
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      const node = makeVoidUndefinedNode()
      visitor.UnaryExpression(node)
      visitor.UnaryExpression(node)
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryVoidRule).toBeDefined()
      expect(typeof noUnnecessaryVoidRule.create).toBe('function')
      expect(typeof noUnnecessaryVoidRule.meta).toBe('object')
    })

    test('handles node with _parent property in edge case', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'void',
        argument: { type: 'Literal', value: undefined },
        loc: makeLoc(1, 0, 1, 15),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression(makeVoidUndefinedNode())
      visitor.UnaryExpression(makeVoidUndefinedNode(2, 0, 2, 15))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression(makeVoidUndefinedNode(10, 4, 10, 19))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(19)
    })

    test('handles null argument gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'void',
        argument: null,
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('handles undefined argument gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'void',
        argument: undefined,
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('handles non-object argument gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'void',
        argument: 42,
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('handles argument with wrong value type string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'void',
        argument: { type: 'Literal', value: 'undefined' },
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })
  })
})
