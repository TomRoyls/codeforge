import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringLengthCompareRule } from '../../../../src/rules/patterns/no-unnecessary-string-length-compare.js'
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

function makeLengthNode(object: unknown): unknown {
  return {
    type: 'MemberExpression',
    object,
    property: { type: 'Identifier', name: 'length' },
  }
}

function makeBinaryExpr(
  left: unknown,
  operator: string,
  right: unknown,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'BinaryExpression',
    operator,
    left,
    right,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-string-length-compare rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringLengthCompareRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringLengthCompareRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringLengthCompareRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringLengthCompareRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringLengthCompareRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning length', () => {
      const desc = noUnnecessaryStringLengthCompareRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/length/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringLengthCompareRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-string-length-compare.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringLengthCompareRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with BinaryExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      expect(visitor).toHaveProperty('BinaryExpression')
      expect(typeof visitor.BinaryExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringLengthCompareRule).toBeDefined()
      expect(noUnnecessaryStringLengthCompareRule.meta).toBeDefined()
      expect(noUnnecessaryStringLengthCompareRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (35) =====

  describe('positive cases — reports str.length > 0', () => {
    test('reports for str.length > 0 with Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'Identifier', name: 'str' }), '>', { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.length > 0 with Identifier object named arr', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'Identifier', name: 'arr' }), '>', { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(1)
    })

    test('reports for "hello".length > 0 with Literal object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'Literal', value: 'hello' }), '>', { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(1)
    })

    test('reports for array literal .length > 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'ArrayExpression', elements: [] }), '>', { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(1)
    })

    test('reports for call expression .length > 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getStr' }, arguments: [] }), '>', { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(1)
    })

    test('reports for nested member expression .length > 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'items' } }), '>', { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(1)
    })

    test('report message mentions .length > 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'Identifier', name: 'str' }), '>', { type: 'Literal', value: 0 }))
      expect(reports[0].message).toMatch(/length/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'Identifier', name: 'str' }), '>', { type: 'Literal', value: 0 }))
      expect(reports[0].message).toBe(
        'Unnecessary .length > 0 comparison. Use the string directly in a boolean context (truthy check) or .length > 0 can be simplified.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'Identifier', name: 'str' }), '>', { type: 'Literal', value: 0 }))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'Identifier', name: 'str' }), '>', { type: 'Literal', value: 0 }))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input BinaryExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      const node = makeBinaryExpr(makeLengthNode({ type: 'Identifier', name: 'str' }), '>', { type: 'Literal', value: 0 })
      visitor.BinaryExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'Identifier', name: 'str' }), '>', { type: 'Literal', value: 0 }, 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'Identifier', name: 'str' }), '>', { type: 'Literal', value: 0 }))
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'Identifier', name: 'arr' }), '>', { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'Identifier', name: 'str' }), '>', { type: 'Literal', value: 0 }))
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'Identifier', name: 'arr' }), '>', { type: 'Literal', value: 0 }))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for template literal .length > 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'TemplateLiteral', quasis: [], expressions: [] }), '>', { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(1)
    })

    test('reports for binary expression .length > 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } }), '>', { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'Identifier', name: 'str' }), '>', { type: 'Literal', value: 0 }))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for empty string literal .length > 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'Literal', value: '' }), '>', { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(1)
    })

    test('reports for function expression .length > 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }), '>', { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(1)
    })

    test('reports for arrow function .length > 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }), '>', { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(1)
    })

    test('reports for object expression .length > 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'ObjectExpression', properties: [] }), '>', { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(1)
    })

    test('reports for conditional expression .length > 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 'a' }, alternate: { type: 'Literal', value: 'b' } }), '>', { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(1)
    })

    test('reports for parenthesized expression .length > 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'ParenthesizedExpression', expression: { type: 'Identifier', name: 'str' } }), '>', { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(1)
    })

    test('reports for logical expression .length > 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'LogicalExpression', operator: '||', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } }), '>', { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(1)
    })

    test('reports for assignment expression .length > 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'AssignmentExpression', operator: '=', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: 'hi' } }), '>', { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(1)
    })

    test('reports for new expression .length > 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Array' }, arguments: [] }), '>', { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof expression .length > 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'UnaryExpression', operator: 'typeof', prefix: true, argument: { type: 'Identifier', name: 'x' } }), '>', { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(1)
    })

    test('reports for sequence expression .length > 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'SequenceExpression', expressions: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'str' }] }), '>', { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(1)
    })

    test('reports for tagged template .length > 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'TaggedTemplateExpression', tag: { type: 'Identifier', name: 'tag' }, quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] } }), '>', { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(1)
    })

    test('reports for class expression .length > 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'ClassExpression', body: { type: 'ClassBody', body: [] } }), '>', { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(1)
    })

    test('reports for spread element array .length > 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'ArrayExpression', elements: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }] }), '>', { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(1)
    })

    test('reports for number literal .length > 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'Literal', value: 42 }), '>', { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(1)
    })

    test('reports for boolean literal .length > 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'Literal', value: true }), '>', { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(1)
    })

    test('reports for regex literal .length > 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'Literal', value: /test/ }), '>', { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(1)
    })

    test('reports for null literal .length > 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'Literal', value: null }), '>', { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(1)
    })

    test('reports for update expression .length > 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'UpdateExpression', operator: '++', prefix: false, argument: { type: 'Identifier', name: 'x' } }), '>', { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (33) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for str.length >= 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'Identifier', name: 'str' }), '>=', { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.length < 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'Identifier', name: 'str' }), '<', { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.length <= 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'Identifier', name: 'str' }), '<=', { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.length === 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'Identifier', name: 'str' }), '===', { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.length !== 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'Identifier', name: 'str' }), '!==', { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.length == 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'Identifier', name: 'str' }), '==', { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.length > 1', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'Identifier', name: 'str' }), '>', { type: 'Literal', value: 1 }))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.length > 5', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'Identifier', name: 'str' }), '>', { type: 'Literal', value: 5 }))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.length > -1', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'Identifier', name: 'str' }), '>', { type: 'Literal', value: -1 }))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.length > x where x is Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'Identifier', name: 'str' }), '>', { type: 'Identifier', name: 'x' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.size > 0 — not .length', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr({
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'str' },
        property: { type: 'Identifier', name: 'size' },
      }, '>', { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.count > 0 — not .length', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr({
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'str' },
        property: { type: 'Identifier', name: 'count' },
      }, '>', { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(0)
    })

    test('does not report for 0 > str.length — wrong operand order', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr({ type: 'Literal', value: 0 }, '>', makeLengthNode({ type: 'Identifier', name: 'str' })))
      expect(reports.length).toBe(0)
    })

    test('does not report for str > 0 — not .length access', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr({ type: 'Identifier', name: 'str' }, '>', { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      expect(() => visitor.BinaryExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      expect(() => visitor.BinaryExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      expect(() => visitor.BinaryExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      expect(() => visitor.BinaryExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      expect(() => visitor.BinaryExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when left is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression({ type: 'BinaryExpression', operator: '>', right: { type: 'Literal', value: 0 }, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when right is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression({ type: 'BinaryExpression', operator: '>', left: makeLengthNode({ type: 'Identifier', name: 'str' }), loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when left is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression({ type: 'BinaryExpression', operator: '>', left: null, right: { type: 'Literal', value: 0 }, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when right is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression({ type: 'BinaryExpression', operator: '>', left: makeLengthNode({ type: 'Identifier', name: 'str' }), right: null, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when left property is not Identifier (Literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr({
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'str' },
        property: { type: 'Literal', value: 'length' },
      }, '>', { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(0)
    })

    test('does not report when left is not MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr({ type: 'Literal', value: 5 }, '>', { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(0)
    })

    test('does not report when right is StringLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'Identifier', name: 'str' }), '>', { type: 'Literal', value: '0' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for + operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'Identifier', name: 'str' }), '+', { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(0)
    })

    test('does not report for - operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'Identifier', name: 'str' }), '-', { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(0)
    })

    test('does not report for * operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'Identifier', name: 'str' }), '*', { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(0)
    })

    test('does not report for / operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'Identifier', name: 'str' }), '/', { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr({
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'str' },
      }, '>', { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (17) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringLengthCompareRule.create(ctx1)
      const visitor2 = noUnnecessaryStringLengthCompareRule.create(ctx2)
      visitor1.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'Identifier', name: 'str' }), '>', { type: 'Literal', value: 0 }))
      visitor2.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'Identifier', name: 'str' }), '>=', { type: 'Literal', value: 0 }))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'Identifier', name: 'str' }), '>', { type: 'Literal', value: 0 }))
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'Identifier', name: 'str' }), '>=', { type: 'Literal', value: 0 }))
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'Identifier', name: 'arr' }), '>', { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '>',
        left: makeLengthNode({ type: 'Identifier', name: 'str' }),
        right: { type: 'Literal', value: 0 },
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '>',
        left: makeLengthNode({ type: 'Identifier', name: 'str' }),
        right: { type: 'Literal', value: 0 },
      }
      visitor.BinaryExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'Identifier', name: 'str' }), '>', { type: 'Literal', value: 0 }))
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'Identifier', name: 'str' }), '>=', { type: 'Literal', value: 0 }))
      visitor.BinaryExpression(makeBinaryExpr({ type: 'Identifier', name: 'str' }, '>', { type: 'Literal', value: 0 }))
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'Identifier', name: 'arr' }), '>', { type: 'Literal', value: 0 }))
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'Identifier', name: 'str' }), '>', { type: 'Literal', value: 1 }))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringLengthCompareRule.create(context)
      const visitor2 = noUnnecessaryStringLengthCompareRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringLengthCompareRule.meta
      const meta2 = noUnnecessaryStringLengthCompareRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '>',
        left: makeLengthNode({ type: 'Identifier', name: 'str' }),
        right: { type: 'Literal', value: 0 },
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
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '>',
        left: makeLengthNode({ type: 'Identifier', name: 'str' }),
        right: { type: 'Literal', value: 0 },
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '>',
        left: makeLengthNode({ type: 'Identifier', name: 'str' }),
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      const node = makeBinaryExpr(makeLengthNode({ type: 'Identifier', name: 'str' }), '>', { type: 'Literal', value: 0 })
      visitor.BinaryExpression(node)
      visitor.BinaryExpression(node)
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringLengthCompareRule).toBeDefined()
      expect(typeof noUnnecessaryStringLengthCompareRule.create).toBe('function')
      expect(typeof noUnnecessaryStringLengthCompareRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '>',
        left: makeLengthNode({ type: 'Identifier', name: 'str' }),
        right: { type: 'Literal', value: 0 },
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'Identifier', name: 'str' }), '>', { type: 'Literal', value: 0 }, 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLengthCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'Identifier', name: 'str' }), '>', { type: 'Literal', value: 0 }))
      visitor.BinaryExpression(makeBinaryExpr(makeLengthNode({ type: 'Identifier', name: 'arr' }), '>', { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})
