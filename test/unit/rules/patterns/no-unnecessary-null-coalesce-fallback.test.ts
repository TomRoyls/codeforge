import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryNullCoalesceFallbackRule } from '../../../../src/rules/patterns/no-unnecessary-null-coalesce-fallback.js'
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

function makeBinaryExpr(operator: string, left: unknown, right: unknown, locStartLine = 1, locStartCol = 0, locEndLine = 1, locEndCol = 20): unknown {
  return {
    type: 'BinaryExpression',
    operator,
    left,
    right,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeIdentifier(name: string): unknown {
  return { type: 'Identifier', name }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-null-coalesce-fallback rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryNullCoalesceFallbackRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryNullCoalesceFallbackRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryNullCoalesceFallbackRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryNullCoalesceFallbackRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryNullCoalesceFallbackRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning nullish coalescing', () => {
      const desc = noUnnecessaryNullCoalesceFallbackRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/nullish/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryNullCoalesceFallbackRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-null-coalesce-fallback.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryNullCoalesceFallbackRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with BinaryExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      expect(visitor).toHaveProperty('BinaryExpression')
      expect(typeof visitor.BinaryExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryNullCoalesceFallbackRule).toBeDefined()
      expect(noUnnecessaryNullCoalesceFallbackRule.meta).toBeDefined()
      expect(noUnnecessaryNullCoalesceFallbackRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (30) =====

  describe('positive cases — reports unnecessary nullish coalescing fallback', () => {
    test('reports for x ?? "" (empty string fallback)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('??', makeIdentifier('x'), { type: 'Literal', value: '' }))
      expect(reports.length).toBe(1)
    })

    test('reports for x ?? 0 (zero fallback)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('??', makeIdentifier('x'), { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(1)
    })

    test('reports for x ?? false (false fallback)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('??', makeIdentifier('x'), { type: 'BooleanLiteral', value: false }))
      expect(reports.length).toBe(1)
    })

    test('reports for x ?? null (null fallback)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('??', makeIdentifier('x'), { type: 'NullLiteral' }))
      expect(reports.length).toBe(1)
    })

    test('reports for x ?? "" using Literal type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('??', makeIdentifier('x'), { type: 'Literal', value: '' }))
      expect(reports.length).toBe(1)
    })

    test('reports for x ?? 0 using Literal type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('??', makeIdentifier('x'), { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(1)
    })

    test('reports for x ?? false using Literal type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('??', makeIdentifier('x'), { type: 'Literal', value: false }))
      expect(reports.length).toBe(1)
    })

    test('reports for x ?? null using Literal type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('??', makeIdentifier('x'), { type: 'Literal', value: null }))
      expect(reports.length).toBe(1)
    })

    test('reports for complex left-hand side ?? ""', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('??', { type: 'MemberExpression', object: makeIdentifier('obj'), property: makeIdentifier('prop') }, { type: 'Literal', value: '' }))
      expect(reports.length).toBe(1)
    })

    test('reports for call expression left-hand side ?? 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('??', { type: 'CallExpression', callee: makeIdentifier('fn'), arguments: [] }, { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(1)
    })

    test('report message mentions unnecessary nullish coalescing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('??', makeIdentifier('x'), { type: 'Literal', value: '' }))
      expect(reports[0].message).toMatch(/nullish coalescing/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('??', makeIdentifier('x'), { type: 'Literal', value: '' }))
      expect(reports[0].message).toBe(
        'Unnecessary nullish coalescing fallback. Using a falsy value like empty string, 0, false, or null defeats the purpose of ?? (which only coalesces null/undefined).',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('??', makeIdentifier('x'), { type: 'Literal', value: '' }))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('??', makeIdentifier('x'), { type: 'Literal', value: '' }))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input BinaryExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      const node = makeBinaryExpr('??', makeIdentifier('x'), { type: 'Literal', value: '' })
      visitor.BinaryExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('??', makeIdentifier('x'), { type: 'Literal', value: '' }, 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('??', makeIdentifier('x'), { type: 'Literal', value: '' }))
      visitor.BinaryExpression(makeBinaryExpr('??', makeIdentifier('y'), { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('??', makeIdentifier('x'), { type: 'Literal', value: '' }))
      visitor.BinaryExpression(makeBinaryExpr('??', makeIdentifier('y'), { type: 'Literal', value: 0 }))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('??', makeIdentifier('x'), { type: 'Literal', value: '' }))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for chained expression ?? false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      const left = makeBinaryExpr('??', makeIdentifier('a'), makeIdentifier('b'))
      visitor.BinaryExpression(makeBinaryExpr('??', left, { type: 'BooleanLiteral', value: false }))
      expect(reports.length).toBe(1)
    })

    test('reports for numeric literal 0 as fallback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('??', { type: 'Literal', value: 42 }, { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(1)
    })

    test('reports for function call result ?? null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('??', { type: 'CallExpression', callee: makeIdentifier('getConfig'), arguments: [] }, { type: 'NullLiteral' }))
      expect(reports.length).toBe(1)
    })

    test('reports for member expression ?? ""', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('??', { type: 'MemberExpression', object: makeIdentifier('config'), property: makeIdentifier('value') }, { type: 'Literal', value: '' }))
      expect(reports.length).toBe(1)
    })

    test('reports for conditional expression ?? 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('??', { type: 'ConditionalExpression', test: makeIdentifier('x'), consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 2 } }, { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(1)
    })

    test('reports for array expression ?? false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('??', { type: 'ArrayExpression', elements: [] }, { type: 'Literal', value: false }))
      expect(reports.length).toBe(1)
    })

    test('reports for object expression ?? null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('??', { type: 'ObjectExpression', properties: [] }, { type: 'NullLiteral' }))
      expect(reports.length).toBe(1)
    })

    test('reports for template literal ?? ""', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('??', { type: 'TemplateLiteral', quasis: [], expressions: [] }, { type: 'Literal', value: '' }))
      expect(reports.length).toBe(1)
    })

    test('reports for unary expression ?? 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('??', { type: 'UnaryExpression', operator: '!', prefix: true, argument: makeIdentifier('x') }, { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof expression ?? false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('??', { type: 'UnaryExpression', operator: 'typeof', prefix: true, argument: makeIdentifier('x') }, { type: 'BooleanLiteral', value: false }))
      expect(reports.length).toBe(1)
    })

    test('reports for parenthesized expression ?? null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('??', { type: 'ParenthesizedExpression', expression: makeIdentifier('x') }, { type: 'NullLiteral' }))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for x ?? "default" (meaningful string fallback)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('??', makeIdentifier('x'), { type: 'Literal', value: 'default' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for x ?? 42 (meaningful number fallback)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('??', makeIdentifier('x'), { type: 'Literal', value: 42 }))
      expect(reports.length).toBe(0)
    })

    test('does not report for x ?? true (true fallback)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('??', makeIdentifier('x'), { type: 'BooleanLiteral', value: true }))
      expect(reports.length).toBe(0)
    })

    test('does not report for x ?? y (identifier fallback)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('??', makeIdentifier('x'), makeIdentifier('y')))
      expect(reports.length).toBe(0)
    })

    test('does not report for x || "default" (different operator)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('||', makeIdentifier('x'), { type: 'Literal', value: '' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for x && y (different operator)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('&&', makeIdentifier('x'), makeIdentifier('y')))
      expect(reports.length).toBe(0)
    })

    test('does not report for x + y (different operator)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('+', makeIdentifier('x'), { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(0)
    })

    test('does not report for x ?? -1 (negative number fallback)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('??', makeIdentifier('x'), { type: 'Literal', value: -1 }))
      expect(reports.length).toBe(0)
    })

    test('does not report for x ?? 1 (non-zero number fallback)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('??', makeIdentifier('x'), { type: 'Literal', value: 1 }))
      expect(reports.length).toBe(0)
    })

    test('does not report for x ?? 0.5 (non-zero decimal fallback)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('??', makeIdentifier('x'), { type: 'Literal', value: 0.5 }))
      expect(reports.length).toBe(0)
    })

    test('does not report for x ?? " " (space string fallback)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('??', makeIdentifier('x'), { type: 'Literal', value: ' ' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for x ?? "0" (string zero fallback)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('??', makeIdentifier('x'), { type: 'Literal', value: '0' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for x ?? undefined (undefined is not in check set)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('??', makeIdentifier('x'), { type: 'Literal', value: undefined }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      expect(() => visitor.BinaryExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      expect(() => visitor.BinaryExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      expect(() => visitor.BinaryExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      expect(() => visitor.BinaryExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      expect(() => visitor.BinaryExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression({ type: 'CallExpression', callee: makeIdentifier('fn'), arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression({ type: 'MemberExpression', object: makeIdentifier('obj'), property: makeIdentifier('prop'), loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when right is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression({ type: 'BinaryExpression', operator: '??', left: makeIdentifier('x'), loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when right is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression({ type: 'BinaryExpression', operator: '??', left: makeIdentifier('x'), right: null, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when right is a string primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression({ type: 'BinaryExpression', operator: '??', left: makeIdentifier('x'), right: '', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when right is a number primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression({ type: 'BinaryExpression', operator: '??', left: makeIdentifier('x'), right: 0, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for x ?? [] (array expression fallback)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('??', makeIdentifier('x'), { type: 'ArrayExpression', elements: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for x ?? {} (object expression fallback)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('??', makeIdentifier('x'), { type: 'ObjectExpression', properties: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for x ?? fn() (call expression fallback)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('??', makeIdentifier('x'), { type: 'CallExpression', callee: makeIdentifier('fn'), arguments: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for x ?? obj.prop (member expression fallback)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('??', makeIdentifier('x'), { type: 'MemberExpression', object: makeIdentifier('obj'), property: makeIdentifier('prop') }))
      expect(reports.length).toBe(0)
    })

    test('does not report for x ?? (a ? b : c) (conditional expression fallback)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('??', makeIdentifier('x'), { type: 'ConditionalExpression', test: makeIdentifier('a'), consequent: makeIdentifier('b'), alternate: makeIdentifier('c') }))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression with === operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdentifier('x'), { type: 'Literal', value: null }))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression with !== operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!==', makeIdentifier('x'), { type: 'Literal', value: null }))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression with * operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('*', makeIdentifier('x'), { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression with - operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('-', makeIdentifier('x'), { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(0)
    })

    test('does not report when right type is Identifier (not a literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('??', makeIdentifier('x'), makeIdentifier('defaultValue')))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryNullCoalesceFallbackRule.create(ctx1)
      const visitor2 = noUnnecessaryNullCoalesceFallbackRule.create(ctx2)
      visitor1.BinaryExpression(makeBinaryExpr('??', makeIdentifier('x'), { type: 'Literal', value: '' }))
      visitor2.BinaryExpression(makeBinaryExpr('??', makeIdentifier('x'), { type: 'Literal', value: 'default' }))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly with mixed valid/invalid', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('??', makeIdentifier('x'), { type: 'Literal', value: '' }))
      visitor.BinaryExpression(makeBinaryExpr('??', makeIdentifier('y'), { type: 'Literal', value: 'default' }))
      visitor.BinaryExpression(makeBinaryExpr('??', makeIdentifier('z'), { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '??',
        left: makeIdentifier('x'),
        right: { type: 'Literal', value: '' },
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '??',
        left: makeIdentifier('x'),
        right: { type: 'Literal', value: '' },
      }
      visitor.BinaryExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('??', makeIdentifier('x'), { type: 'Literal', value: 'default' }))
      visitor.BinaryExpression(makeBinaryExpr('??', makeIdentifier('y'), { type: 'Literal', value: 0 }))
      visitor.BinaryExpression(makeBinaryExpr('||', makeIdentifier('z'), { type: 'Literal', value: '' }))
      visitor.BinaryExpression(makeBinaryExpr('??', makeIdentifier('a'), { type: 'BooleanLiteral', value: false }))
      visitor.BinaryExpression(makeBinaryExpr('??', makeIdentifier('b'), { type: 'Literal', value: 'value' }))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryNullCoalesceFallbackRule.create(context)
      const visitor2 = noUnnecessaryNullCoalesceFallbackRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryNullCoalesceFallbackRule.meta
      const meta2 = noUnnecessaryNullCoalesceFallbackRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '??',
        left: makeIdentifier('x'),
        right: { type: 'Literal', value: '' },
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        trailingComments: [],
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '??',
        left: makeIdentifier('x'),
        right: { type: 'Literal', value: 0 },
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '??',
        left: makeIdentifier('x'),
        right: { type: 'BooleanLiteral', value: false },
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      const node = makeBinaryExpr('??', makeIdentifier('x'), { type: 'Literal', value: '' })
      visitor.BinaryExpression(node)
      visitor.BinaryExpression(node)
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryNullCoalesceFallbackRule).toBeDefined()
      expect(typeof noUnnecessaryNullCoalesceFallbackRule.create).toBe('function')
      expect(typeof noUnnecessaryNullCoalesceFallbackRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '??',
        left: makeIdentifier('x'),
        right: { type: 'NullLiteral' },
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('??', makeIdentifier('x'), { type: 'Literal', value: '' }, 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('??', makeIdentifier('x'), { type: 'Literal', value: '' }))
      visitor.BinaryExpression(makeBinaryExpr('??', makeIdentifier('y'), { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports all four falsy literal fallback types individually', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCoalesceFallbackRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('??', makeIdentifier('a'), { type: 'Literal', value: '' }))
      visitor.BinaryExpression(makeBinaryExpr('??', makeIdentifier('b'), { type: 'Literal', value: 0 }))
      visitor.BinaryExpression(makeBinaryExpr('??', makeIdentifier('c'), { type: 'BooleanLiteral', value: false }))
      visitor.BinaryExpression(makeBinaryExpr('??', makeIdentifier('d'), { type: 'NullLiteral' }))
      expect(reports.length).toBe(4)
    })
  })
})
