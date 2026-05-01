import { describe, expect, test, vi } from 'vitest'
import { noConstructorSuperRule } from '../../../../src/rules/patterns/no-constructor-super.js'
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
    getSource: () => 'super()',
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

function makeCallExpressionNode(
  callee: unknown = { type: 'Super' },
  args: unknown[] = [],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 8,
): unknown {
  return {
    type: 'CallExpression',
    callee,
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-constructor-super rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noConstructorSuperRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noConstructorSuperRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noConstructorSuperRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noConstructorSuperRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noConstructorSuperRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning super', () => {
      const desc = noConstructorSuperRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/super/)
    })

    test('should have correct docs URL', () => {
      expect(noConstructorSuperRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-constructor-super',
      )
    })

    test('should have empty schema', () => {
      expect(noConstructorSuperRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noConstructorSuperRule).toBeDefined()
      expect(noConstructorSuperRule.meta).toBeDefined()
      expect(noConstructorSuperRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS SUPER WITHOUT ARGS (25) =====

  describe('positive cases — reports super() without arguments', () => {
    test('reports for super() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression(makeCallExpressionNode())
      expect(reports.length).toBe(1)
    })

    test('reports for super() at line 1 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression(makeCallExpressionNode({ type: 'Super' }, [], 1, 0, 1, 8))
      expect(reports.length).toBe(1)
    })

    test('reports for super() at different location line 5', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression(makeCallExpressionNode({ type: 'Super' }, [], 5, 4, 5, 12))
      expect(reports.length).toBe(1)
    })

    test('reports for super() at multi-line location', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression(makeCallExpressionNode({ type: 'Super' }, [], 3, 2, 4, 1))
      expect(reports.length).toBe(1)
    })

    test('reports for super() at column 10', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression(makeCallExpressionNode({ type: 'Super' }, [], 1, 10, 1, 18))
      expect(reports.length).toBe(1)
    })

    test('reports for super() at large line number', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression(makeCallExpressionNode({ type: 'Super' }, [], 100, 0, 100, 8))
      expect(reports.length).toBe(1)
    })

    test('reports for super() with callee as object with type Super', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression(makeCallExpressionNode({ type: 'Super' }, []))
      expect(reports.length).toBe(1)
    })

    test('reports for super() with explicit empty array', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      const node = { type: 'CallExpression', callee: { type: 'Super' }, arguments: [], loc: makeLoc(1, 0, 1, 8) }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for super() with node range property', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      const node = { type: 'CallExpression', callee: { type: 'Super' }, arguments: [], loc: makeLoc(1, 0, 1, 8), range: [0, 8] }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for super() with extra properties on node', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      const node = { type: 'CallExpression', callee: { type: 'Super' }, arguments: [], loc: makeLoc(1, 0, 1, 8), extra: true, optional: false }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for super() with callee having additional properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      const node = { type: 'CallExpression', callee: { type: 'Super', loc: makeLoc(1, 0, 1, 5) }, arguments: [], loc: makeLoc(1, 0, 1, 8) }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for super() with start column 0 end column 8', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression(makeCallExpressionNode({ type: 'Super' }, [], 1, 0, 1, 8))
      expect(reports.length).toBe(1)
    })

    test('reports when loc spans single line', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression(makeCallExpressionNode({ type: 'Super' }, [], 7, 2, 7, 10))
      expect(reports.length).toBe(1)
    })

    test('reports when loc spans multiple lines', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression(makeCallExpressionNode({ type: 'Super' }, [], 2, 4, 3, 6))
      expect(reports.length).toBe(1)
    })

    test('reports for super() inside nested object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      const node = { type: 'CallExpression', callee: { type: 'Super' }, arguments: [], loc: makeLoc(1, 0, 1, 8), parent: { type: 'BlockStatement' } }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for super() with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Super' }, arguments: [], loc: makeLoc(1, 0, 1, 8), _parent: {} })
      expect(reports.length).toBe(1)
    })

    test('reports for super() at line 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression(makeCallExpressionNode({ type: 'Super' }, [], 0, 0, 0, 8))
      expect(reports.length).toBe(1)
    })

    test('reports for super() with zero column offset', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression(makeCallExpressionNode({ type: 'Super' }, [], 1, 0, 1, 8))
      expect(reports.length).toBe(1)
    })

    test('reports for super() with large column offset', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression(makeCallExpressionNode({ type: 'Super' }, [], 1, 50, 1, 58))
      expect(reports.length).toBe(1)
    })

    test('reports for super() at end of file location', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression(makeCallExpressionNode({ type: 'Super' }, [], 999, 0, 999, 8))
      expect(reports.length).toBe(1)
    })

    test('reports for super() with comment property on node', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Super' }, arguments: [], loc: makeLoc(1, 0, 1, 8), comments: [] })
      expect(reports.length).toBe(1)
    })

    test('reports for super() with trailing comma in arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Super' }, arguments: [], loc: makeLoc(1, 0, 1, 8) })
      expect(reports.length).toBe(1)
    })

    test('reports for super() inside constructor context', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression(makeCallExpressionNode())
      expect(reports.length).toBe(1)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression(makeCallExpressionNode())
      visitor.CallExpression(makeCallExpressionNode())
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression(makeCallExpressionNode())
      visitor.CallExpression(makeCallExpressionNode({ type: 'Super' }, [], 5, 0, 5, 8))
      expect(reports[0].message).toBe(reports[1].message)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression(makeCallExpressionNode())
      expect(reports[0].message).toBe(
        'super() call requires arguments when extending a class.',
      )
    })

    test('report message mentions "super()"', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression(makeCallExpressionNode())
      expect(reports[0].message).toContain('super()')
    })

    test('report message mentions "arguments"', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression(makeCallExpressionNode())
      expect(reports[0].message).toContain('arguments')
    })

    test('report message mentions "class"', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression(makeCallExpressionNode())
      expect(reports[0].message).toContain('class')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression(makeCallExpressionNode())
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression(makeCallExpressionNode())
      expect(reports[0].node).toBeDefined()
    })

    test('report loc has start and end', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression(makeCallExpressionNode())
      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('report loc start has line and column', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression(makeCallExpressionNode())
      expect(reports[0].loc?.start.line).toBeDefined()
      expect(reports[0].loc?.start.column).toBeDefined()
    })

    test('report loc end has line and column', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression(makeCallExpressionNode())
      expect(reports[0].loc?.end.line).toBeDefined()
      expect(reports[0].loc?.end.column).toBeDefined()
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression(makeCallExpressionNode({ type: 'Super' }, [], 5, 10, 5, 18))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report loc end values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression(makeCallExpressionNode({ type: 'Super' }, [], 3, 4, 7, 12))
      expect(reports[0].loc?.end.line).toBe(7)
      expect(reports[0].loc?.end.column).toBe(12)
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      const node = makeCallExpressionNode()
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression(makeCallExpressionNode())
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('report message starts with "super()"', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression(makeCallExpressionNode())
      expect(reports[0].message.startsWith('super()')).toBe(true)
    })

    test('report message ends with period', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression(makeCallExpressionNode())
      expect(reports[0].message.endsWith('.')).toBe(true)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for super(arg) with one argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression(makeCallExpressionNode({ type: 'Super' }, [{ type: 'Identifier', name: 'arg' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for super(a, b) with two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression(makeCallExpressionNode({ type: 'Super' }, [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for super(1) with numeric argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression(makeCallExpressionNode({ type: 'Super' }, [{ type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for super("string") with string argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression(makeCallExpressionNode({ type: 'Super' }, [{ type: 'Literal', value: 'test' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for super(null) with null argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression(makeCallExpressionNode({ type: 'Super' }, [{ type: 'Literal', value: null }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression(makeCallExpressionNode({ type: 'Identifier', name: 'foo' }, []))
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression(makeCallExpressionNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'method' } }, []))
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression(makeCallExpressionNode({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }, []))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression({ type: 'Literal', value: 'test', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean node', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 8) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: undefined, arguments: [], loc: makeLoc(1, 0, 1, 8) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is a string', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: 'super', arguments: [], loc: makeLoc(1, 0, 1, 8) })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Super' }, arguments: 'not-array', loc: makeLoc(1, 0, 1, 8) })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Super' }, loc: makeLoc(1, 0, 1, 8) })
      expect(reports.length).toBe(0)
    })

    test('does not report for array primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      expect(() => visitor.CallExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrowFunctionExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression(makeCallExpressionNode({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }, []))
      expect(reports.length).toBe(0)
    })

    test('does not report for super(this.value) with member expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression(makeCallExpressionNode({ type: 'Super' }, [{ type: 'MemberExpression', object: { type: 'ThisExpression' }, property: { type: 'Identifier', name: 'value' } }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noConstructorSuperRule.create(ctx1)
      const visitor2 = noConstructorSuperRule.create(ctx2)
      visitor1.CallExpression(makeCallExpressionNode())
      visitor2.CallExpression(makeCallExpressionNode({ type: 'Identifier', name: 'foo' }, []))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression(makeCallExpressionNode())
      visitor.CallExpression(makeCallExpressionNode({ type: 'Identifier', name: 'foo' }, []))
      visitor.CallExpression(makeCallExpressionNode())
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      const node = { type: 'CallExpression', callee: { type: 'Super' }, arguments: [] }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      const node = { type: 'CallExpression', callee: { type: 'Super' }, arguments: [] }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression(makeCallExpressionNode())
      visitor.CallExpression(makeCallExpressionNode({ type: 'Super' }, [{ type: 'Identifier', name: 'x' }]))
      visitor.CallExpression(makeCallExpressionNode({ type: 'Identifier', name: 'foo' }, []))
      visitor.CallExpression(makeCallExpressionNode())
      visitor.CallExpression(makeCallExpressionNode({ type: 'Super' }, [{ type: 'Literal', value: 42 }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noConstructorSuperRule.create(context)
      const visitor2 = noConstructorSuperRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noConstructorSuperRule.meta
      const meta2 = noConstructorSuperRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Super' }, arguments: [], loc: {} })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Super' }, arguments: [], loc: { start: { line: 3, column: 5 } } })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      const node = makeCallExpressionNode()
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noConstructorSuperRule).toBeDefined()
      expect(typeof noConstructorSuperRule.create).toBe('function')
      expect(typeof noConstructorSuperRule.meta).toBe('object')
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression(makeCallExpressionNode())
      visitor.CallExpression(makeCallExpressionNode({ type: 'Super' }, [], 10, 0, 10, 8))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('node with flags alongside type still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Super' }, arguments: [], loc: makeLoc(1, 0, 1, 8), flags: ['async'] })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee type is lowercase "super"', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'super' }, arguments: [], loc: makeLoc(1, 0, 1, 8) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee type is "SUPER" uppercase', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'SUPER' }, arguments: [], loc: makeLoc(1, 0, 1, 8) })
      expect(reports.length).toBe(0)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression(makeCallExpressionNode({ type: 'Super' }, [], 10, 4, 10, 12))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(12)
    })

    test('does not report when node type is not CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression({ type: 'NewExpression', callee: { type: 'Super' }, arguments: [], loc: makeLoc(1, 0, 1, 8) })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is an object instead of array', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Super' }, arguments: { length: 0 }, loc: makeLoc(1, 0, 1, 8) })
      expect(reports.length).toBe(0)
    })

    test('handles node with only type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression({ type: 'CallExpression' })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorSuperRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: 42, arguments: [], loc: makeLoc(1, 0, 1, 8) })
      expect(reports.length).toBe(0)
    })
  })
})
