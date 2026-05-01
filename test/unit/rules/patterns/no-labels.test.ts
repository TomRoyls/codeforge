import { describe, expect, test, vi } from 'vitest'
import { noLabelsRule } from '../../../../src/rules/patterns/no-labels.js'
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
    getSource: () => 'label: foo();',
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

function makeLabeledStatement(
  label: string,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 10,
): unknown {
  return {
    type: 'LabeledStatement',
    label: { type: 'Identifier', name: label },
    body: { type: 'ExpressionStatement', expression: { type: 'Identifier', name: 'foo' } },
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-labels rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noLabelsRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noLabelsRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noLabelsRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noLabelsRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noLabelsRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning label', () => {
      const desc = noLabelsRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/label/)
    })

    test('should have correct docs URL', () => {
      expect(noLabelsRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-labels',
      )
    })

    test('should have empty schema', () => {
      expect(noLabelsRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with LabeledStatement', () => {
      const { context } = createMockContext()
      const visitor = noLabelsRule.create(context)
      expect(visitor).toHaveProperty('LabeledStatement')
      expect(typeof visitor.LabeledStatement).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noLabelsRule).toBeDefined()
      expect(noLabelsRule.meta).toBeDefined()
      expect(noLabelsRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS LABELED STATEMENT (34) =====

  describe('positive cases — reports labeled statement', () => {
    test('reports for simple labeled statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement(makeLabeledStatement('loop'))
      expect(reports.length).toBe(1)
    })

    test('reports for label named "outer"', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement(makeLabeledStatement('outer'))
      expect(reports.length).toBe(1)
    })

    test('reports for label named "inner"', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement(makeLabeledStatement('inner'))
      expect(reports.length).toBe(1)
    })

    test('reports for label named "loop1"', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement(makeLabeledStatement('loop1'))
      expect(reports.length).toBe(1)
    })

    test('reports for label with underscore prefix', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement(makeLabeledStatement('_private'))
      expect(reports.length).toBe(1)
    })

    test('reports for label with dollar sign', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement(makeLabeledStatement('$label'))
      expect(reports.length).toBe(1)
    })

    test('reports for single character label "a"', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement(makeLabeledStatement('a'))
      expect(reports.length).toBe(1)
    })

    test('reports for long label name', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement(makeLabeledStatement('veryLongDescriptiveLabelName'))
      expect(reports.length).toBe(1)
    })

    test('report message is "Unexpected labeled statement."', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement(makeLabeledStatement('x'))
      expect(reports[0].message).toBe('Unexpected labeled statement.')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement(makeLabeledStatement('x'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement(makeLabeledStatement('x'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input LabeledStatement node', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      const node = makeLabeledStatement('myLabel')
      visitor.LabeledStatement(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement(makeLabeledStatement('x', 5, 10, 5, 20))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report loc end values are preserved', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement(makeLabeledStatement('x', 3, 2, 7, 15))
      expect(reports[0].loc?.end.line).toBe(7)
      expect(reports[0].loc?.end.column).toBe(15)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement(makeLabeledStatement('a'))
      visitor.LabeledStatement(makeLabeledStatement('b'))
      expect(reports.length).toBe(2)
    })

    test('all accumulated reports have same message', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement(makeLabeledStatement('a'))
      visitor.LabeledStatement(makeLabeledStatement('b'))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for label named "breakTarget"', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement(makeLabeledStatement('breakTarget'))
      expect(reports.length).toBe(1)
    })

    test('reports for label named "continueTarget"', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement(makeLabeledStatement('continueTarget'))
      expect(reports.length).toBe(1)
    })

    test('reports for label with numeric suffix "label2"', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement(makeLabeledStatement('label2'))
      expect(reports.length).toBe(1)
    })

    test('reports for label on different line', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement(makeLabeledStatement('x', 42, 0, 42, 15))
      expect(reports.length).toBe(1)
    })

    test('reports for label at column offset', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement(makeLabeledStatement('x', 1, 8, 1, 20))
      expect(reports.length).toBe(1)
    })

    test('reports for label "start"', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement(makeLabeledStatement('start'))
      expect(reports.length).toBe(1)
    })

    test('reports for label "end"', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement(makeLabeledStatement('end'))
      expect(reports.length).toBe(1)
    })

    test('reports for label "retry"', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement(makeLabeledStatement('retry'))
      expect(reports.length).toBe(1)
    })

    test('reports for label "next"', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement(makeLabeledStatement('next'))
      expect(reports.length).toBe(1)
    })

    test('reports for label "skip"', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement(makeLabeledStatement('skip'))
      expect(reports.length).toBe(1)
    })

    test('reports for label "done"', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement(makeLabeledStatement('done'))
      expect(reports.length).toBe(1)
    })

    test('reports for label "process"', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement(makeLabeledStatement('process'))
      expect(reports.length).toBe(1)
    })

    test('reports for label "check"', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement(makeLabeledStatement('check'))
      expect(reports.length).toBe(1)
    })

    test('reports for label "validate"', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement(makeLabeledStatement('validate'))
      expect(reports.length).toBe(1)
    })

    test('reports for label "mainLoop"', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement(makeLabeledStatement('mainLoop'))
      expect(reports.length).toBe(1)
    })

    test('reports for label "cleanup"', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement(makeLabeledStatement('cleanup'))
      expect(reports.length).toBe(1)
    })

    test('reports for label "init"', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement(makeLabeledStatement('init'))
      expect(reports.length).toBe(1)
    })

    test('reports for label "handler"', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement(makeLabeledStatement('handler'))
      expect(reports.length).toBe(1)
    })

    test('reports for label "searchLoop"', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement(makeLabeledStatement('searchLoop'))
      expect(reports.length).toBe(1)
    })

  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (30) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      expect(() => visitor.LabeledStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      expect(() => visitor.LabeledStatement(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      expect(() => visitor.LabeledStatement({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement({ type: 'Literal', value: 'test', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      expect(() => visitor.LabeledStatement('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      expect(() => visitor.LabeledStatement(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      expect(() => visitor.LabeledStatement(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      expect(() => visitor.LabeledStatement([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement({ type: 'MemberExpression', object: {}, property: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrowFunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement({ type: 'ExpressionStatement', expression: {}, loc: makeLoc(1, 0, 1, 1) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BlockStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement({ type: 'BlockStatement', body: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ObjectExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement({ type: 'ObjectExpression', properties: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrayExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement({ type: 'ArrayExpression', elements: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ConditionalExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement({ type: 'ConditionalExpression', test: {}, consequent: {}, alternate: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ForStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement({ type: 'ForStatement', init: null, test: null, update: null, body: {}, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for WhileStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement({ type: 'WhileStatement', test: {}, body: {}, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for SwitchStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement({ type: 'SwitchStatement', discriminant: {}, cases: [], loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BreakStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement({ type: 'BreakStatement', label: null, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ContinueStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement({ type: 'ContinueStatement', label: null, loc: makeLoc(1, 0, 1, 9) })
      expect(reports.length).toBe(0)
    })

    test('does not report for TryStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement({ type: 'TryStatement', block: {}, handler: null, finalizer: null, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ThrowStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement({ type: 'ThrowStatement', argument: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noLabelsRule.create(ctx1)
      const visitor2 = noLabelsRule.create(ctx2)
      visitor1.LabeledStatement(makeLabeledStatement('a'))
      visitor2.LabeledStatement({ type: 'Identifier', name: 'foo' })
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement(makeLabeledStatement('a'))
      visitor.LabeledStatement({ type: 'Identifier', name: 'foo' })
      visitor.LabeledStatement(makeLabeledStatement('b'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      const node = { type: 'LabeledStatement', label: { type: 'Identifier', name: 'x' }, body: {} }
      visitor.LabeledStatement(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      const node = { type: 'LabeledStatement', label: { type: 'Identifier', name: 'x' }, body: {} }
      visitor.LabeledStatement(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noLabelsRule.create(context)
      const visitor2 = noLabelsRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noLabelsRule.meta
      const meta2 = noLabelsRule.meta
      expect(meta1).toBe(meta2)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement(makeLabeledStatement('x'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      const node = {
        type: 'LabeledStatement',
        label: { type: 'Identifier', name: 'x' },
        body: {},
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        _parent: {},
      }
      visitor.LabeledStatement(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement({ type: 'LabeledStatement', label: { type: 'Identifier', name: 'x' }, body: {}, loc: {} })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement({ type: 'LabeledStatement', label: { type: 'Identifier', name: 'x' }, body: {}, loc: { start: { line: 3, column: 5 } } })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      const node = makeLabeledStatement('loop')
      visitor.LabeledStatement(node)
      visitor.LabeledStatement(node)
      visitor.LabeledStatement(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noLabelsRule).toBeDefined()
      expect(typeof noLabelsRule.create).toBe('function')
      expect(typeof noLabelsRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement({ type: 'LabeledStatement', label: { type: 'Identifier', name: 'x' }, body: {}, loc: makeLoc(1, 0, 1, 5), _parent: {} })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement(makeLabeledStatement('a'))
      visitor.LabeledStatement(makeLabeledStatement('b'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('mixed valid/invalid nodes count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement(makeLabeledStatement('a'))
      visitor.LabeledStatement({ type: 'Identifier', name: 'foo' })
      visitor.LabeledStatement(makeLabeledStatement('b'))
      visitor.LabeledStatement({ type: 'Literal', value: 42 })
      visitor.LabeledStatement(makeLabeledStatement('c'))
      expect(reports.length).toBe(3)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement(makeLabeledStatement('x', 10, 4, 10, 20))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(20)
    })

    test('does not report when type property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement({ label: { type: 'Identifier', name: 'x' }, body: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for whitespace-only type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement({ type: '', label: {}, body: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for case-different type "labeledstatement"', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement({ type: 'labeledstatement', label: {}, body: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for "LABELEDSTATEMENT" (all caps)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLabelsRule.create(context)
      visitor.LabeledStatement({ type: 'LABELEDSTATEMENT', label: {}, body: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })
  })
})
