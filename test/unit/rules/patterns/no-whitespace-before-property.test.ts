import { describe, expect, test, vi } from 'vitest'
import { noWhitespaceBeforePropertyRule } from '../../../../src/rules/patterns/no-whitespace-before-property.js'
import type { RuleContext, ReportDescriptor } from '../../../../src/plugins/types.js'

interface MockReport {
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

function createMockContext(source: string = 'obj .prop'): { context: RuleContext; reports: MockReport[] } {
  const reports: MockReport[] = []
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
    getSource: () => source,
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
  }
  return { context, reports }
}

function makeMemberExpr(
  objRange: [number, number],
  propRange: [number, number],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 10,
): unknown {
  return {
    type: 'MemberExpression',
    object: { type: 'Identifier', name: 'obj', range: objRange },
    property: { type: 'Identifier', name: 'prop', range: propRange },
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-whitespace-before-property rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noWhitespaceBeforePropertyRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noWhitespaceBeforePropertyRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noWhitespaceBeforePropertyRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noWhitespaceBeforePropertyRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noWhitespaceBeforePropertyRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning whitespace and property', () => {
      const desc = noWhitespaceBeforePropertyRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/whitespace/)
      expect(desc).toMatch(/property/)
    })

    test('should have correct docs URL', () => {
      expect(noWhitespaceBeforePropertyRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-whitespace-before-property',
      )
    })

    test('should have empty schema', () => {
      expect(noWhitespaceBeforePropertyRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with MemberExpression', () => {
      const { context } = createMockContext()
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      expect(visitor).toHaveProperty('MemberExpression')
      expect(typeof visitor.MemberExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noWhitespaceBeforePropertyRule).toBeDefined()
      expect(noWhitespaceBeforePropertyRule.meta).toBeDefined()
      expect(noWhitespaceBeforePropertyRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS WHITESPACE BEFORE DOT (30) =====

  describe('positive cases — reports whitespace before dot', () => {
    test('reports single space before dot in "obj .prop"', () => {
      const src = 'obj .prop'
      const { context, reports } = createMockContext(src)
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression(makeMemberExpr([0, 3], [5, 9]))
      expect(reports.length).toBe(1)
    })

    test('reports two spaces before dot in "obj  .prop"', () => {
      const src = 'obj  .prop'
      const { context, reports } = createMockContext(src)
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression(makeMemberExpr([0, 3], [6, 10]))
      expect(reports.length).toBe(1)
    })

    test('reports tab before dot in "obj\\t.prop"', () => {
      const src = 'obj\t.prop'
      const { context, reports } = createMockContext(src)
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression(makeMemberExpr([0, 3], [5, 9]))
      expect(reports.length).toBe(1)
    })

    test('reports newline before dot in "obj\\n.prop"', () => {
      const src = 'obj\n.prop'
      const { context, reports } = createMockContext(src)
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression(makeMemberExpr([0, 3], [5, 9]))
      expect(reports.length).toBe(1)
    })

    test('reports carriage return before dot in "obj\\r.prop"', () => {
      const src = 'obj\r.prop'
      const { context, reports } = createMockContext(src)
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression(makeMemberExpr([0, 3], [5, 9]))
      expect(reports.length).toBe(1)
    })

    test('reports space and tab before dot in "obj \\t.prop"', () => {
      const src = 'obj \t.prop'
      const { context, reports } = createMockContext(src)
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression(makeMemberExpr([0, 3], [6, 10]))
      expect(reports.length).toBe(1)
    })

    test('report message is exactly "Unexpected whitespace before property access dot."', () => {
      const src = 'obj .prop'
      const { context, reports } = createMockContext(src)
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression(makeMemberExpr([0, 3], [5, 9]))
      expect(reports[0].message).toBe('Unexpected whitespace before property access dot.')
    })

    test('report has loc property', () => {
      const src = 'obj .prop'
      const { context, reports } = createMockContext(src)
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression(makeMemberExpr([0, 3], [5, 9]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const src = 'obj .prop'
      const { context, reports } = createMockContext(src)
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression(makeMemberExpr([0, 3], [5, 9]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input MemberExpression node', () => {
      const src = 'obj .prop'
      const { context, reports } = createMockContext(src)
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      const node = makeMemberExpr([0, 3], [5, 9])
      visitor.MemberExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const src = 'obj .prop'
      const { context, reports } = createMockContext(src)
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression(makeMemberExpr([0, 3], [5, 9], 5, 10, 5, 20))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('reports for chained access with space before dot', () => {
      const src = 'a .b.c'
      const { context, reports } = createMockContext(src)
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression(makeMemberExpr([0, 1], [4, 5]))
      expect(reports.length).toBe(1)
    })

    test('reports for long variable name with space before dot', () => {
      const src = 'myVariable .property'
      const { context, reports } = createMockContext(src)
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression(makeMemberExpr([0, 10], [12, 20]))
      expect(reports.length).toBe(1)
    })

    test('reports for numeric property access with space', () => {
      const src = 'arr .0'
      const { context, reports } = createMockContext(src)
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression(makeMemberExpr([0, 3], [5, 6]))
      expect(reports.length).toBe(1)
    })

    test('reports for three spaces before dot', () => {
      const src = 'obj   .prop'
      const { context, reports } = createMockContext(src)
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression(makeMemberExpr([0, 3], [7, 11]))
      expect(reports.length).toBe(1)
    })

    test('accumulates reports across multiple calls', () => {
      const src = 'obj .prop'
      const { context, reports } = createMockContext(src)
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression(makeMemberExpr([0, 3], [5, 9]))
      visitor.MemberExpression(makeMemberExpr([0, 3], [5, 9]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const src = 'obj .prop'
      const { context, reports } = createMockContext(src)
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression(makeMemberExpr([0, 3], [5, 9]))
      visitor.MemberExpression(makeMemberExpr([0, 3], [5, 9]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for "this .prop" style access', () => {
      const src = 'this .prop'
      const { context, reports } = createMockContext(src)
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression(makeMemberExpr([0, 4], [6, 10]))
      expect(reports.length).toBe(1)
    })

    test('reports for "window .document" style access', () => {
      const src = 'window .document'
      const { context, reports } = createMockContext(src)
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression(makeMemberExpr([0, 6], [8, 16]))
      expect(reports.length).toBe(1)
    })

    test('reports when gap between obj end and prop start is " ."', () => {
      const src = 'foo .bar'
      const { context, reports } = createMockContext(src)
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression(makeMemberExpr([0, 3], [5, 8]))
      expect(reports.length).toBe(1)
    })

    test('reports when gap is exactly space-dot for single char obj', () => {
      const src = 'x .y'
      const { context, reports } = createMockContext(src)
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression(makeMemberExpr([0, 1], [3, 4]))
      expect(reports.length).toBe(1)
    })

    test('reports when gap is "  ." (two spaces then dot)', () => {
      const src = 'x  .y'
      const { context, reports } = createMockContext(src)
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression(makeMemberExpr([0, 1], [4, 5]))
      expect(reports.length).toBe(1)
    })

    test('reports when gap contains \\r\\n before dot', () => {
      const src = 'x\r\n.y'
      const { context, reports } = createMockContext(src)
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression(makeMemberExpr([0, 1], [4, 5]))
      expect(reports.length).toBe(1)
    })

    test('reports for computed member expression with space before dot', () => {
      const src = 'obj .[0]'
      const { context, reports } = createMockContext(src)
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression({
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj', range: [0, 3] },
        property: { type: 'Literal', value: 0, range: [6, 7] },
        computed: true,
        loc: makeLoc(1, 0, 1, 8),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for method call chain with space before dot', () => {
      const src = 'obj .method'
      const { context, reports } = createMockContext(src)
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression(makeMemberExpr([0, 3], [5, 11]))
      expect(reports.length).toBe(1)
    })

    test('reports for property starting after dot with two spaces before', () => {
      const src = 'a  .b'
      const { context, reports } = createMockContext(src)
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression(makeMemberExpr([0, 1], [4, 5]))
      expect(reports.length).toBe(1)
    })

    test('reports for unicode identifier with space before dot', () => {
      const src = 'π .value'
      const { context, reports } = createMockContext(src)
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression(makeMemberExpr([0, 1], [3, 8]))
      expect(reports.length).toBe(1)
    })

    test('reports when gap contains form feed before dot', () => {
      const src = 'obj\f.prop'
      const { context, reports } = createMockContext(src)
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression(makeMemberExpr([0, 3], [5, 9]))
      expect(reports.length).toBe(1)
    })

    test('reports when gap contains vertical tab before dot', () => {
      const src = 'obj\v.prop'
      const { context, reports } = createMockContext(src)
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression(makeMemberExpr([0, 3], [5, 9]))
      expect(reports.length).toBe(1)
    })

    test('reports when gap contains non-breaking space before dot', () => {
      const src = 'obj\u00A0.prop'
      const { context, reports } = createMockContext(src)
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression(makeMemberExpr([0, 3], [5, 9]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (30) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for normal access "obj.prop"', () => {
      const src = 'obj.prop'
      const { context, reports } = createMockContext(src)
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression(makeMemberExpr([0, 3], [4, 8]))
      expect(reports.length).toBe(0)
    })

    test('does not report when dot is at position 0 in gap', () => {
      const src = 'obj.prop'
      const { context, reports } = createMockContext(src)
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression(makeMemberExpr([0, 3], [4, 8]))
      expect(reports.length).toBe(0)
    })

    test('does not report for bracket notation without dot', () => {
      const src = 'obj[prop]'
      const { context, reports } = createMockContext(src)
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression({
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj', range: [0, 3] },
        property: { type: 'Identifier', name: 'prop', range: [4, 8] },
        computed: true,
        loc: makeLoc(1, 0, 1, 9),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      expect(() => visitor.MemberExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      expect(() => visitor.MemberExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      expect(() => visitor.MemberExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      expect(() => visitor.MemberExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      expect(() => visitor.MemberExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean node', () => {
      const { context, reports } = createMockContext()
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      expect(() => visitor.MemberExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression({ type: 'Literal', value: 'test', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing', () => {
      const { context, reports } = createMockContext('obj.prop')
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression({
        type: 'MemberExpression',
        property: { type: 'Identifier', name: 'prop', range: [4, 8] },
        loc: makeLoc(1, 0, 1, 8),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing', () => {
      const { context, reports } = createMockContext('obj.prop')
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression({
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj', range: [0, 3] },
        loc: makeLoc(1, 0, 1, 8),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object has no range', () => {
      const { context, reports } = createMockContext('obj.prop')
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression({
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'prop', range: [4, 8] },
        loc: makeLoc(1, 0, 1, 8),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property has no range', () => {
      const { context, reports } = createMockContext('obj.prop')
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression({
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj', range: [0, 3] },
        property: { type: 'Identifier', name: 'prop' },
        loc: makeLoc(1, 0, 1, 8),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when gap has no dot (bracket access)', () => {
      const src = 'obj [prop]'
      const { context, reports } = createMockContext(src)
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression(makeMemberExpr([0, 3], [5, 9]))
      expect(reports.length).toBe(0)
    })

    test('does not report when gap is only a dot (no whitespace)', () => {
      const src = 'obj.prop'
      const { context, reports } = createMockContext(src)
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression(makeMemberExpr([0, 3], [4, 8]))
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrowFunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression({ type: 'ExpressionStatement', expression: {}, loc: makeLoc(1, 0, 1, 1) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ObjectExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression({ type: 'ObjectExpression', properties: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      expect(() => visitor.MemberExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for ConditionalExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression({ type: 'ConditionalExpression', test: {}, consequent: {}, alternate: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report when gap contains only whitespace with no dot', () => {
      const src = 'obj prop'
      const { context, reports } = createMockContext(src)
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression(makeMemberExpr([0, 3], [4, 8]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (25) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext('obj .prop')
      const { context: ctx2, reports: rep2 } = createMockContext('obj.prop')
      const visitor1 = noWhitespaceBeforePropertyRule.create(ctx1)
      const visitor2 = noWhitespaceBeforePropertyRule.create(ctx2)
      visitor1.MemberExpression(makeMemberExpr([0, 3], [5, 9]))
      visitor2.MemberExpression(makeMemberExpr([0, 3], [4, 8]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly for mixed inputs', () => {
      const src = 'obj .prop'
      const { context, reports } = createMockContext(src)
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression(makeMemberExpr([0, 3], [5, 9]))
      visitor.MemberExpression(makeMemberExpr([0, 3], [4, 8]))
      visitor.MemberExpression(makeMemberExpr([0, 3], [5, 9]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const src = 'obj .prop'
      const { context, reports } = createMockContext(src)
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj', range: [0, 3] },
        property: { type: 'Identifier', name: 'prop', range: [5, 9] },
      }
      visitor.MemberExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const src = 'obj .prop'
      const { context, reports } = createMockContext(src)
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj', range: [0, 3] },
        property: { type: 'Identifier', name: 'prop', range: [5, 9] },
      }
      visitor.MemberExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const src = 'obj .prop'
      const { context, reports } = createMockContext(src)
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression(makeMemberExpr([0, 3], [4, 8]))
      visitor.MemberExpression(makeMemberExpr([0, 3], [5, 9]))
      visitor.MemberExpression(makeMemberExpr([0, 3], [4, 8]))
      visitor.MemberExpression(makeMemberExpr([0, 3], [5, 9]))
      visitor.MemberExpression(makeMemberExpr([0, 3], [4, 8]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noWhitespaceBeforePropertyRule.create(context)
      const visitor2 = noWhitespaceBeforePropertyRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noWhitespaceBeforePropertyRule.meta
      const meta2 = noWhitespaceBeforePropertyRule.meta
      expect(meta1).toBe(meta2)
    })

    test('report descriptor has all expected properties', () => {
      const src = 'obj .prop'
      const { context, reports } = createMockContext(src)
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression(makeMemberExpr([0, 3], [5, 9]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('handles node with extra properties', () => {
      const src = 'obj .prop'
      const { context, reports } = createMockContext(src)
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj', range: [0, 3] },
        property: { type: 'Identifier', name: 'prop', range: [5, 9] },
        loc: makeLoc(1, 0, 1, 9),
        range: [0, 9],
        extra: true,
        computed: false,
      }
      visitor.MemberExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const src = 'obj .prop'
      const { context, reports } = createMockContext(src)
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression({
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj', range: [0, 3] },
        property: { type: 'Identifier', name: 'prop', range: [5, 9] },
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const src = 'obj .prop'
      const { context, reports } = createMockContext(src)
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression({
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj', range: [0, 3] },
        property: { type: 'Identifier', name: 'prop', range: [5, 9] },
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const src = 'obj .prop'
      const { context, reports } = createMockContext(src)
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      const node = makeMemberExpr([0, 3], [5, 9])
      visitor.MemberExpression(node)
      visitor.MemberExpression(node)
      visitor.MemberExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noWhitespaceBeforePropertyRule).toBeDefined()
      expect(typeof noWhitespaceBeforePropertyRule.create).toBe('function')
      expect(typeof noWhitespaceBeforePropertyRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const src = 'obj .prop'
      const { context, reports } = createMockContext(src)
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression({
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj', range: [0, 3] },
        property: { type: 'Identifier', name: 'prop', range: [5, 9] },
        loc: makeLoc(1, 0, 1, 9),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const src = 'obj .prop'
      const { context, reports } = createMockContext(src)
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression(makeMemberExpr([0, 3], [5, 9]))
      visitor.MemberExpression(makeMemberExpr([0, 3], [5, 9]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report loc reflects specific node location values', () => {
      const src = 'obj .prop'
      const { context, reports } = createMockContext(src)
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression(makeMemberExpr([0, 3], [5, 9], 10, 4, 10, 14))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(14)
    })

    test('does not report when gap has dot but no whitespace before it', () => {
      const src = 'a.b'
      const { context, reports } = createMockContext(src)
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression(makeMemberExpr([0, 1], [2, 3]))
      expect(reports.length).toBe(0)
    })

    test('does not report when gap is empty (contiguous)', () => {
      const src = 'ab'
      const { context, reports } = createMockContext(src)
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression(makeMemberExpr([0, 1], [1, 2]))
      expect(reports.length).toBe(0)
    })

    test('handles object range ending at same position as property start', () => {
      const src = 'a.b'
      const { context, reports } = createMockContext(src)
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression(makeMemberExpr([0, 2], [2, 3]))
      expect(reports.length).toBe(0)
    })

    test('handles deeply nested member expression with whitespace', () => {
      const src = 'a.b .c'
      const { context, reports } = createMockContext(src)
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression(makeMemberExpr([0, 3], [5, 6]))
      expect(reports.length).toBe(1)
    })

    test('handles object with null range gracefully', () => {
      const { context, reports } = createMockContext('obj.prop')
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression({
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj', range: null },
        property: { type: 'Identifier', name: 'prop', range: [4, 8] },
        loc: makeLoc(1, 0, 1, 8),
      })
      expect(reports.length).toBe(0)
    })

    test('handles property with null range gracefully', () => {
      const { context, reports } = createMockContext('obj.prop')
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression({
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj', range: [0, 3] },
        property: { type: 'Identifier', name: 'prop', range: null },
        loc: makeLoc(1, 0, 1, 8),
      })
      expect(reports.length).toBe(0)
    })

    test('handles BlockStatement node type without error', () => {
      const { context, reports } = createMockContext()
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression({ type: 'BlockStatement', body: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('handles chained member expressions independently', () => {
      const src = 'a .b.c .d'
      const { context, reports } = createMockContext(src)
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression({
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'a', range: [0, 1] },
        property: { type: 'Identifier', name: 'b', range: [4, 5] },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(1)
    })

    test('reports correctly when object and property overlap at boundary', () => {
      const src = 'x .y'
      const { context, reports } = createMockContext(src)
      const visitor = noWhitespaceBeforePropertyRule.create(context)
      visitor.MemberExpression(makeMemberExpr([0, 1], [3, 4]))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Unexpected whitespace before property access dot.')
    })
  })
})
