import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryAssertRule } from '../../../../src/rules/patterns/no-unnecessary-assert.js'
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
    getSource: () => 'value!',
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

function makeTSNonNullNode(
  expression: unknown = { type: 'Literal', value: 'hello' },
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 7,
): unknown {
  return {
    type: 'TSNonNullExpression',
    expression,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-assert rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryAssertRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryAssertRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryAssertRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryAssertRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryAssertRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning non-null assertion', () => {
      const desc = noUnnecessaryAssertRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/non-null/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryAssertRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-assert',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryAssertRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with TSNonNullExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      expect(visitor).toHaveProperty('TSNonNullExpression')
      expect(typeof visitor.TSNonNullExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryAssertRule).toBeDefined()
      expect(noUnnecessaryAssertRule.meta).toBeDefined()
      expect(noUnnecessaryAssertRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS UNNECESSARY ASSERTION (25) =====

  describe('positive cases — reports unnecessary assertion', () => {
    test('reports for string literal assertion', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Literal', value: 'hello' }))
      expect(reports.length).toBe(1)
    })

    test('reports for number literal assertion', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Literal', value: 42 }))
      expect(reports.length).toBe(1)
    })

    test('reports for boolean true literal assertion', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Literal', value: true }))
      expect(reports.length).toBe(1)
    })

    test('reports for boolean false literal assertion', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Literal', value: false }))
      expect(reports.length).toBe(1)
    })

    test('reports for null literal assertion', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Literal', value: null }))
      expect(reports.length).toBe(1)
    })

    test('reports for empty string literal assertion', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Literal', value: '' }))
      expect(reports.length).toBe(1)
    })

    test('reports for numeric zero literal assertion', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Literal', value: 0 }))
      expect(reports.length).toBe(1)
    })

    test('reports for negative number literal assertion', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Literal', value: -1 }))
      expect(reports.length).toBe(1)
    })

    test('reports for floating point literal assertion', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Literal', value: 3.14 }))
      expect(reports.length).toBe(1)
    })

    test('reports for single-char string literal assertion', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Literal', value: 'a' }))
      expect(reports.length).toBe(1)
    })

    test('reports for multi-word string literal assertion', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Literal', value: 'hello world' }))
      expect(reports.length).toBe(1)
    })

    test('reports for literal with long string value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Literal', value: 'a'.repeat(100) }))
      expect(reports.length).toBe(1)
    })

    test('reports for literal with special characters in value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Literal', value: '\n\t\r' }))
      expect(reports.length).toBe(1)
    })

    test('reports for large number literal assertion', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Literal', value: 999999999 }))
      expect(reports.length).toBe(1)
    })

    test('reports for literal expression with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Literal', value: 'test', raw: "'test'" }))
      expect(reports.length).toBe(1)
    })

    test('report message mentions literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Literal', value: 'hello' }))
      expect(reports[0].message.toLowerCase()).toContain('literal')
    })

    test('report message mentions non-null assertion', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Literal', value: 'hello' }))
      expect(reports[0].message.toLowerCase()).toContain('non-null')
    })

    test('reports for literal with undefined value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Literal', value: undefined }))
      expect(reports.length).toBe(1)
    })

    test('reports for regex literal value assertion', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Literal', value: /test/ }))
      expect(reports.length).toBe(1)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Literal', value: 'a' }))
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Literal', value: 'b' }))
      expect(reports.length).toBe(2)
    })

    test('reports only once per node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Literal', value: 'hello' }))
      expect(reports.length).toBe(1)
    })

    test('reports for deeply nested location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Literal', value: 'hello' }, 100, 50, 100, 57))
      expect(reports.length).toBe(1)
    })

    test('reports with multiple different literal types', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Literal', value: 'str' }))
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Literal', value: 42 }))
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Literal', value: true }))
      expect(reports.length).toBe(3)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Literal', value: 'a' }))
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Literal', value: 42 }))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for literal with unicode string value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Literal', value: '🎉' }))
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES TESTS (15) =====

  describe('report properties', () => {
    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Literal', value: 'hello' }))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Literal', value: 'hello' }))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input TSNonNullExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      const node = makeTSNonNullNode({ type: 'Literal', value: 'hello' })
      visitor.TSNonNullExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Literal', value: 'hello' }))
      expect(reports[0].message).toBe(
        'Unnecessary non-null assertion on a literal value.',
      )
    })

    test('report loc preserves node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Literal', value: 'hello' }, 5, 10, 5, 17))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report loc start line is correct', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Literal', value: 'hello' }, 7, 2, 7, 9))
      expect(reports[0].loc?.start.line).toBe(7)
    })

    test('report loc start column is correct', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Literal', value: 'hello' }, 1, 15, 1, 22))
      expect(reports[0].loc?.start.column).toBe(15)
    })

    test('report loc end line is correct', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Literal', value: 'hello' }, 3, 0, 4, 1))
      expect(reports[0].loc?.end.line).toBe(4)
    })

    test('report loc end column is correct', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Literal', value: 'hello' }, 1, 0, 1, 20))
      expect(reports[0].loc?.end.column).toBe(20)
    })

    test('report descriptor has message property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Literal', value: 'hello' }))
      expect(reports[0]).toHaveProperty('message')
    })

    test('report descriptor has loc property defined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Literal', value: 'hello' }))
      expect(reports[0]).toHaveProperty('loc')
    })

    test('report has correct structure with message, loc, and node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Literal', value: 'hello' }))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('multiple reports each have correct message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Literal', value: 'a' }))
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Literal', value: 'b' }))
      expect(reports[0].message).toBe('Unnecessary non-null assertion on a literal value.')
      expect(reports[1].message).toBe('Unnecessary non-null assertion on a literal value.')
    })

    test('report node is the TSNonNullExpression node not the expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      const node = makeTSNonNullNode({ type: 'Literal', value: 'hello' })
      visitor.TSNonNullExpression(node)
      const reportNode = reports[0].node as Record<string, unknown>
      expect(reportNode.type).toBe('TSNonNullExpression')
    })

    test('reports accumulate correctly with mixed calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Literal', value: 'a' }))
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Identifier', name: 'x' }))
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Literal', value: 'b' }))
      expect(reports.length).toBe(2)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Identifier expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Identifier', name: 'foo' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'MemberExpression', object: {}, property: {} }))
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'CallExpression', callee: {}, arguments: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'BinaryExpression', operator: '+', left: {}, right: {} }))
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {} }))
      expect(reports.length).toBe(0)
    })

    test('does not report for ConditionalExpression expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'ConditionalExpression', test: {}, consequent: {}, alternate: {} }))
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrayExpression expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'ArrayExpression', elements: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for ObjectExpression expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'ObjectExpression', properties: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrowFunctionExpression expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for TemplateLiteral expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'TemplateLiteral', quasis: [], expressions: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      expect(() => visitor.TSNonNullExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      expect(() => visitor.TSNonNullExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      expect(() => visitor.TSNonNullExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for non-TSNonNullExpression type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      expect(() => visitor.TSNonNullExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      expect(() => visitor.TSNonNullExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      expect(() => visitor.TSNonNullExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when expression is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression({ type: 'TSNonNullExpression', loc: makeLoc(1, 0, 1, 7) })
      expect(reports.length).toBe(0)
    })

    test('does not report when expression is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression({ type: 'TSNonNullExpression', expression: null, loc: makeLoc(1, 0, 1, 7) })
      expect(reports.length).toBe(0)
    })

    test('does not report when expression is a string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression({ type: 'TSNonNullExpression', expression: 'literal', loc: makeLoc(1, 0, 1, 7) })
      expect(reports.length).toBe(0)
    })

    test('does not report when expression is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression({ type: 'TSNonNullExpression', expression: 42, loc: makeLoc(1, 0, 1, 7) })
      expect(reports.length).toBe(0)
    })

    test('does not report when expression type is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ value: 'hello' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for AssignmentExpression expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'AssignmentExpression', operator: '=', left: {}, right: {} }))
      expect(reports.length).toBe(0)
    })

    test('does not report for NewExpression expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'NewExpression', callee: {}, arguments: [] }))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryAssertRule.create(ctx1)
      const visitor2 = noUnnecessaryAssertRule.create(ctx2)
      visitor1.TSNonNullExpression(makeTSNonNullNode({ type: 'Literal', value: 'a' }))
      visitor2.TSNonNullExpression(makeTSNonNullNode({ type: 'Identifier', name: 'x' }))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Literal', value: 'a' }))
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Identifier', name: 'x' }))
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Literal', value: 'b' }))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      const node = { type: 'TSNonNullExpression', expression: { type: 'Literal', value: 'hello' } }
      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      const node = { type: 'TSNonNullExpression', expression: { type: 'Literal', value: 'hello' } }
      visitor.TSNonNullExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Identifier', name: 'x' }))
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Literal', value: 'a' }))
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'MemberExpression', object: {}, property: {} }))
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Literal', value: 'b' }))
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'CallExpression', callee: {}, arguments: [] }))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryAssertRule.create(context)
      const visitor2 = noUnnecessaryAssertRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryAssertRule.meta
      const meta2 = noUnnecessaryAssertRule.meta
      expect(meta1).toBe(meta2)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Literal', value: 'hello' }))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      const node = {
        type: 'TSNonNullExpression',
        expression: { type: 'Literal', value: 'hello' },
        loc: makeLoc(1, 0, 1, 7),
        range: [0, 7],
        extra: true,
        _eslintParent: {},
      }
      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression({ type: 'TSNonNullExpression', expression: { type: 'Literal', value: 'hello' }, loc: {} })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression({ type: 'TSNonNullExpression', expression: { type: 'Literal', value: 'hello' }, loc: { start: { line: 3, column: 5 } } })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      const node = makeTSNonNullNode({ type: 'Literal', value: 'hello' })
      visitor.TSNonNullExpression(node)
      visitor.TSNonNullExpression(node)
      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryAssertRule).toBeDefined()
      expect(typeof noUnnecessaryAssertRule.create).toBe('function')
      expect(typeof noUnnecessaryAssertRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression({ type: 'TSNonNullExpression', expression: { type: 'Literal', value: 'hello' }, loc: makeLoc(1, 0, 1, 7), _parent: {} })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Literal', value: 'a' }))
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Literal', value: 'b' }))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('node with range property still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression({ type: 'TSNonNullExpression', expression: { type: 'Literal', value: 'hello' }, loc: makeLoc(1, 0, 1, 7), range: [0, 7] })
      expect(reports.length).toBe(1)
    })

    test('handles expression with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Literal', value: 'hello', raw: "'hello'", range: [0, 7] }))
      expect(reports.length).toBe(1)
    })

    test('handles TSNonNullExpression with no expression property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression({ type: 'TSNonNullExpression', loc: makeLoc(1, 0, 1, 7) })
      expect(reports.length).toBe(0)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression(makeTSNonNullNode({ type: 'Literal', value: 'hello' }, 10, 4, 10, 12))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(12)
    })

    test('does not report when expression is an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssertRule.create(context)
      visitor.TSNonNullExpression({ type: 'TSNonNullExpression', expression: [{ type: 'Literal', value: 'a' }], loc: makeLoc(1, 0, 1, 7) })
      expect(reports.length).toBe(0)
    })
  })
})
