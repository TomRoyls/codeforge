import { describe, expect, test, vi } from 'vitest'
import { noUnnecessarySpreadRule } from '../../../../src/rules/patterns/no-unnecessary-spread.js'
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
    getSource: () => '[...[1]]',
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

function makeSpreadNode(
  elements: unknown[],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 10,
): unknown {
  return {
    type: 'SpreadElement',
    argument: {
      type: 'ArrayExpression',
      elements,
    },
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessarySpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessarySpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessarySpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessarySpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessarySpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning spread', () => {
      const desc = noUnnecessarySpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/spread/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessarySpreadRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-spread',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessarySpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with SpreadElement', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      expect(visitor).toHaveProperty('SpreadElement')
      expect(typeof visitor.SpreadElement).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessarySpreadRule).toBeDefined()
      expect(noUnnecessarySpreadRule.meta).toBeDefined()
      expect(noUnnecessarySpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS SINGLE-ELEMENT SPREAD (25) =====

  describe('positive cases — reports single-element spread', () => {
    test('reports spread of single literal element [1]', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement(makeSpreadNode([{ type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(1)
    })

    test('reports spread of single string element ["hello"]', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement(makeSpreadNode([{ type: 'Literal', value: 'hello' }]))
      expect(reports.length).toBe(1)
    })

    test('reports spread of single Identifier element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement(makeSpreadNode([{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(1)
    })

    test('reports spread of single CallExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement(makeSpreadNode([{ type: 'CallExpression', callee: {}, arguments: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports spread of single object element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement(makeSpreadNode([{ type: 'ObjectExpression', properties: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports spread of single null element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement(makeSpreadNode([null]))
      expect(reports.length).toBe(1)
    })

    test('reports spread of single SpreadElement element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement(makeSpreadNode([{ type: 'SpreadElement', argument: {} }]))
      expect(reports.length).toBe(1)
    })

    test('reports spread of single MemberExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement(makeSpreadNode([{ type: 'MemberExpression', object: {}, property: {} }]))
      expect(reports.length).toBe(1)
    })

    test('reports spread of single ArrowFunctionExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement(makeSpreadNode([{ type: 'ArrowFunctionExpression', params: [], body: {} }]))
      expect(reports.length).toBe(1)
    })

    test('reports spread of single BinaryExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement(makeSpreadNode([{ type: 'BinaryExpression', operator: '+', left: {}, right: {} }]))
      expect(reports.length).toBe(1)
    })

    test('reports spread of single TemplateLiteral element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement(makeSpreadNode([{ type: 'TemplateLiteral', quasis: [], expressions: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports spread of single ConditionalExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement(makeSpreadNode([{ type: 'ConditionalExpression', test: {}, consequent: {}, alternate: {} }]))
      expect(reports.length).toBe(1)
    })

    test('reports spread of single ArrayExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement(makeSpreadNode([{ type: 'ArrayExpression', elements: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports spread of single FunctionExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement(makeSpreadNode([{ type: 'FunctionExpression', id: null, params: [], body: {} }]))
      expect(reports.length).toBe(1)
    })

    test('reports spread of single UnaryExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement(makeSpreadNode([{ type: 'UnaryExpression', operator: '!', prefix: true, argument: {} }]))
      expect(reports.length).toBe(1)
    })

    test('reports spread of single NewExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement(makeSpreadNode([{ type: 'NewExpression', callee: {}, arguments: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports spread of single LogicalExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement(makeSpreadNode([{ type: 'LogicalExpression', operator: '&&', left: {}, right: {} }]))
      expect(reports.length).toBe(1)
    })

    test('reports spread of single AssignmentExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement(makeSpreadNode([{ type: 'AssignmentExpression', operator: '=', left: {}, right: {} }]))
      expect(reports.length).toBe(1)
    })

    test('reports spread of single UpdateExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement(makeSpreadNode([{ type: 'UpdateExpression', operator: '++', prefix: false, argument: {} }]))
      expect(reports.length).toBe(1)
    })

    test('reports spread of single AwaitExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement(makeSpreadNode([{ type: 'AwaitExpression', argument: {} }]))
      expect(reports.length).toBe(1)
    })

    test('reports spread of single YieldExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement(makeSpreadNode([{ type: 'YieldExpression', argument: null }]))
      expect(reports.length).toBe(1)
    })

    test('reports spread of single TaggedTemplateExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement(makeSpreadNode([{ type: 'TaggedTemplateExpression', tag: {}, quasi: {} }]))
      expect(reports.length).toBe(1)
    })

    test('reports spread of single ThisExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement(makeSpreadNode([{ type: 'ThisExpression' }]))
      expect(reports.length).toBe(1)
    })

    test('reports spread of single boolean literal element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement(makeSpreadNode([{ type: 'Literal', value: true }]))
      expect(reports.length).toBe(1)
    })

    test('reports spread of single numeric zero element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement(makeSpreadNode([{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report message is exactly "Unnecessary spread of single-element array."', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement(makeSpreadNode([{ type: 'Literal', value: 1 }]))
      expect(reports[0].message).toBe('Unnecessary spread of single-element array.')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement(makeSpreadNode([{ type: 'Literal', value: 1 }]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement(makeSpreadNode([{ type: 'Literal', value: 1 }]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input SpreadElement node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      const node = makeSpreadNode([{ type: 'Literal', value: 1 }])
      visitor.SpreadElement(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc start line is preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement(makeSpreadNode([{ type: 'Literal', value: 1 }], 5, 10, 5, 15))
      expect(reports[0].loc?.start.line).toBe(5)
    })

    test('report loc start column is preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement(makeSpreadNode([{ type: 'Literal', value: 1 }], 5, 10, 5, 15))
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report loc end line is preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement(makeSpreadNode([{ type: 'Literal', value: 1 }], 5, 10, 8, 20))
      expect(reports[0].loc?.end.line).toBe(8)
    })

    test('report loc end column is preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement(makeSpreadNode([{ type: 'Literal', value: 1 }], 5, 10, 8, 20))
      expect(reports[0].loc?.end.column).toBe(20)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement(makeSpreadNode([{ type: 'Literal', value: 1 }]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement(makeSpreadNode([{ type: 'Literal', value: 1 }]))
      visitor.SpreadElement(makeSpreadNode([{ type: 'Literal', value: 2 }]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement(makeSpreadNode([{ type: 'Literal', value: 1 }]))
      visitor.SpreadElement(makeSpreadNode([{ type: 'Identifier', name: 'x' }]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement(makeSpreadNode([{ type: 'Literal', value: 1 }]))
      visitor.SpreadElement(makeSpreadNode([{ type: 'Literal', value: 2 }]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement(makeSpreadNode([{ type: 'Literal', value: 1 }], 10, 4, 10, 12))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(12)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      const node = makeSpreadNode([{ type: 'Literal', value: 1 }])
      visitor.SpreadElement(node)
      visitor.SpreadElement(node)
      visitor.SpreadElement(node)
      expect(reports.length).toBe(3)
    })

    test('report message mentions unnecessary', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement(makeSpreadNode([{ type: 'Literal', value: 1 }]))
      expect(reports[0].message.toLowerCase()).toContain('unnecessary')
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for empty array spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement(makeSpreadNode([]))
      expect(reports.length).toBe(0)
    })

    test('does not report for two-element array spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement(makeSpreadNode([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for three-element array spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement(makeSpreadNode([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for non-ArrayExpression argument (ObjectExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement({
        type: 'SpreadElement',
        argument: { type: 'ObjectExpression', properties: [] },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-ArrayExpression argument (Identifier)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement({
        type: 'SpreadElement',
        argument: { type: 'Identifier', name: 'arr' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-ArrayExpression argument (CallExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement({
        type: 'SpreadElement',
        argument: { type: 'CallExpression', callee: {}, arguments: [] },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-ArrayExpression argument (MemberExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement({
        type: 'SpreadElement',
        argument: { type: 'MemberExpression', object: {}, property: {} },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-SpreadElement type (ArrayExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement({
        type: 'ArrayExpression',
        elements: [{ type: 'Literal', value: 1 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-SpreadElement type (Literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement({ type: 'Literal', value: 42, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-SpreadElement type (Identifier)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-SpreadElement type (CallExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-SpreadElement type (BinaryExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-SpreadElement type (ReturnStatement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-SpreadElement type (VariableDeclaration)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-SpreadElement type (ExpressionStatement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement({ type: 'ExpressionStatement', expression: {}, loc: makeLoc(1, 0, 1, 1) })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-SpreadElement type (BlockStatement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement({ type: 'BlockStatement', body: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-SpreadElement type (FunctionDeclaration)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement({ type: 'FunctionDeclaration', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for five-element array spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement(makeSpreadNode([
        { type: 'Literal', value: 1 },
        { type: 'Literal', value: 2 },
        { type: 'Literal', value: 3 },
        { type: 'Literal', value: 4 },
        { type: 'Literal', value: 5 },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      expect(() => visitor.SpreadElement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      expect(() => visitor.SpreadElement(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      expect(() => visitor.SpreadElement({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      expect(() => visitor.SpreadElement('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      expect(() => visitor.SpreadElement(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement({ type: 'SpreadElement', argument: null, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement({ type: 'SpreadElement', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessarySpreadRule.create(ctx1)
      const visitor2 = noUnnecessarySpreadRule.create(ctx2)
      visitor1.SpreadElement(makeSpreadNode([{ type: 'Literal', value: 1 }]))
      visitor2.SpreadElement(makeSpreadNode([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement(makeSpreadNode([{ type: 'Literal', value: 1 }]))
      visitor.SpreadElement(makeSpreadNode([]))
      visitor.SpreadElement(makeSpreadNode([{ type: 'Literal', value: 3 }]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      const node = {
        type: 'SpreadElement',
        argument: { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] },
      }
      visitor.SpreadElement(node)
      expect(reports.length).toBe(1)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement(makeSpreadNode([]))
      visitor.SpreadElement(makeSpreadNode([{ type: 'Literal', value: 1 }]))
      visitor.SpreadElement(makeSpreadNode([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]))
      visitor.SpreadElement(makeSpreadNode([{ type: 'Literal', value: 3 }]))
      visitor.SpreadElement(makeSpreadNode([{ type: 'Literal', value: 4 }, { type: 'Literal', value: 5 }, { type: 'Literal', value: 6 }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessarySpreadRule.create(context)
      const visitor2 = noUnnecessarySpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessarySpreadRule.meta
      const meta2 = noUnnecessarySpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      const node = {
        type: 'SpreadElement',
        argument: { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] },
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
      }
      visitor.SpreadElement(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement({
        type: 'SpreadElement',
        argument: { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] },
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement({
        type: 'SpreadElement',
        argument: { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] },
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessarySpreadRule).toBeDefined()
      expect(typeof noUnnecessarySpreadRule.create).toBe('function')
      expect(typeof noUnnecessarySpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement({
        type: 'SpreadElement',
        argument: { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] },
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when elements is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement({
        type: 'SpreadElement',
        argument: { type: 'ArrayExpression', elements: 'not-array' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when elements is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement({
        type: 'SpreadElement',
        argument: { type: 'ArrayExpression' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a string primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement({
        type: 'SpreadElement',
        argument: 'not-an-object',
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a number primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement({
        type: 'SpreadElement',
        argument: 42,
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is boolean primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement({
        type: 'SpreadElement',
        argument: true,
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('handles SpreadElement with argument lacking type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement({
        type: 'SpreadElement',
        argument: { elements: [{ type: 'Literal', value: 1 }] },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('handles SpreadElement with argument type non-matching string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      visitor.SpreadElement({
        type: 'SpreadElement',
        argument: { type: 'SomeOtherType', elements: [{ type: 'Literal', value: 1 }] },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      expect(() => visitor.SpreadElement(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadRule.create(context)
      expect(() => visitor.SpreadElement([])).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })
})
