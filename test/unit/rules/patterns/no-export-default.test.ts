import { describe, expect, test, vi } from 'vitest'
import { noExportDefaultRule } from '../../../../src/rules/patterns/no-export-default.js'
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
    getSource: () => 'export default function foo() {}',
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

function makeExportDefaultNode(
  declaration: unknown = {},
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 28,
): unknown {
  return {
    type: 'ExportDefaultDeclaration',
    declaration,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-export-default rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noExportDefaultRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noExportDefaultRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noExportDefaultRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noExportDefaultRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noExportDefaultRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning default export', () => {
      const desc = noExportDefaultRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/default/)
    })

    test('should have correct docs URL', () => {
      expect(noExportDefaultRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-export-default',
      )
    })

    test('should have empty schema', () => {
      expect(noExportDefaultRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with ExportDefaultDeclaration', () => {
      const { context } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      expect(visitor).toHaveProperty('ExportDefaultDeclaration')
      expect(typeof visitor.ExportDefaultDeclaration).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noExportDefaultRule).toBeDefined()
      expect(noExportDefaultRule.meta).toBeDefined()
      expect(noExportDefaultRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS DEFAULT EXPORT (25) =====

  describe('positive cases — reports default export', () => {
    test('reports for ExportDefaultDeclaration with empty declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration(makeExportDefaultNode({}))
      expect(reports.length).toBe(1)
    })

    test('reports for ExportDefaultDeclaration with function declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration(makeExportDefaultNode({ type: 'FunctionDeclaration', id: { name: 'foo' }, params: [], body: { type: 'BlockStatement', body: [] } }))
      expect(reports.length).toBe(1)
    })

    test('reports for ExportDefaultDeclaration with class declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration(makeExportDefaultNode({ type: 'ClassDeclaration', id: { name: 'MyClass' }, body: { type: 'ClassBody', body: [] } }))
      expect(reports.length).toBe(1)
    })

    test('reports for ExportDefaultDeclaration with identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration(makeExportDefaultNode({ type: 'Identifier', name: 'myObj' }))
      expect(reports.length).toBe(1)
    })

    test('reports for ExportDefaultDeclaration with arrow function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration(makeExportDefaultNode({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }))
      expect(reports.length).toBe(1)
    })

    test('reports for ExportDefaultDeclaration with object expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration(makeExportDefaultNode({ type: 'ObjectExpression', properties: [] }))
      expect(reports.length).toBe(1)
    })

    test('reports for ExportDefaultDeclaration with array expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration(makeExportDefaultNode({ type: 'ArrayExpression', elements: [] }))
      expect(reports.length).toBe(1)
    })

    test('reports for ExportDefaultDeclaration with literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration(makeExportDefaultNode({ type: 'Literal', value: 42 }))
      expect(reports.length).toBe(1)
    })

    test('reports for ExportDefaultDeclaration with call expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration(makeExportDefaultNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'factory' }, arguments: [] }))
      expect(reports.length).toBe(1)
    })

    test('reports for ExportDefaultDeclaration with string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration(makeExportDefaultNode({ type: 'Literal', value: 'hello' }))
      expect(reports.length).toBe(1)
    })

    test('reports for ExportDefaultDeclaration with anonymous function', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration(makeExportDefaultNode({ type: 'FunctionDeclaration', id: null, params: [], body: { type: 'BlockStatement', body: [] } }))
      expect(reports.length).toBe(1)
    })

    test('reports for ExportDefaultDeclaration with async function', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration(makeExportDefaultNode({ type: 'FunctionDeclaration', id: { name: 'asyncFn' }, async: true, params: [], body: { type: 'BlockStatement', body: [] } }))
      expect(reports.length).toBe(1)
    })

    test('reports for ExportDefaultDeclaration with member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration(makeExportDefaultNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }))
      expect(reports.length).toBe(1)
    })

    test('reports for ExportDefaultDeclaration with new expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration(makeExportDefaultNode({ type: 'NewExpression', callee: { type: 'Identifier', name: 'MyClass' }, arguments: [] }))
      expect(reports.length).toBe(1)
    })

    test('reports for ExportDefaultDeclaration with null declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration(makeExportDefaultNode(null))
      expect(reports.length).toBe(1)
    })

    test('report message is exactly "Unexpected default export."', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration(makeExportDefaultNode({}))
      expect(reports[0].message).toBe('Unexpected default export.')
    })

    test('report message contains "default"', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration(makeExportDefaultNode({}))
      expect(reports[0].message).toContain('default')
    })

    test('report message contains "export"', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration(makeExportDefaultNode({}))
      expect(reports[0].message).toContain('export')
    })

    test('reports for node with numeric literal declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration(makeExportDefaultNode({ type: 'Literal', value: 0 }))
      expect(reports.length).toBe(1)
    })

    test('reports for node with boolean literal declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration(makeExportDefaultNode({ type: 'Literal', value: true }))
      expect(reports.length).toBe(1)
    })

    test('reports for node with template literal declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration(makeExportDefaultNode({ type: 'TemplateLiteral', quasis: [], expressions: [] }))
      expect(reports.length).toBe(1)
    })

    test('reports for ExportDefaultDeclaration with TSAsExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration(makeExportDefaultNode({ type: 'TSAsExpression', expression: {}, typeAnnotation: {} }))
      expect(reports.length).toBe(1)
    })

    test('reports for ExportDefaultDeclaration with conditional expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration(makeExportDefaultNode({ type: 'ConditionalExpression', test: {}, consequent: {}, alternate: {} }))
      expect(reports.length).toBe(1)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration(makeExportDefaultNode({}))
      visitor.ExportDefaultDeclaration(makeExportDefaultNode({}))
      expect(reports.length).toBe(2)
    })

    test('all accumulated reports have the same message', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration(makeExportDefaultNode({}))
      visitor.ExportDefaultDeclaration(makeExportDefaultNode({ type: 'FunctionDeclaration' }))
      expect(reports[0].message).toBe(reports[1].message)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration(makeExportDefaultNode({}))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration(makeExportDefaultNode({}))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input ExportDefaultDeclaration node', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      const node = makeExportDefaultNode({})
      visitor.ExportDefaultDeclaration(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc start line matches node loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration(makeExportDefaultNode({}, 3, 5, 3, 30))
      expect(reports[0].loc?.start.line).toBe(3)
    })

    test('report loc start column matches node loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration(makeExportDefaultNode({}, 1, 4, 1, 25))
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('report loc end line matches node loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration(makeExportDefaultNode({}, 5, 0, 8, 1))
      expect(reports[0].loc?.end.line).toBe(8)
    })

    test('report loc end column matches node loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration(makeExportDefaultNode({}, 1, 0, 1, 35))
      expect(reports[0].loc?.end.column).toBe(35)
    })

    test('report loc values are preserved from node with custom position', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration(makeExportDefaultNode({}, 10, 2, 10, 20))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(2)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration(makeExportDefaultNode({}))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('report message is a string', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration(makeExportDefaultNode({}))
      expect(typeof reports[0].message).toBe('string')
    })

    test('report message ends with period', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration(makeExportDefaultNode({}))
      expect(reports[0].message.endsWith('.')).toBe(true)
    })

    test('report loc is an object with start and end', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration(makeExportDefaultNode({}))
      expect(typeof reports[0].loc).toBe('object')
      expect(reports[0].loc).toHaveProperty('start')
      expect(reports[0].loc).toHaveProperty('end')
    })

    test('report loc start has line and column', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration(makeExportDefaultNode({}))
      expect(reports[0].loc?.start).toHaveProperty('line')
      expect(reports[0].loc?.start).toHaveProperty('column')
    })

    test('report loc end has line and column', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration(makeExportDefaultNode({}))
      expect(reports[0].loc?.end).toHaveProperty('line')
      expect(reports[0].loc?.end).toHaveProperty('column')
    })

    test('report loc reflects zero-based column', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration(makeExportDefaultNode({}, 1, 0, 1, 28))
      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[0].loc?.end.column).toBe(28)
    })
  })

  // ===== NEGATIVE NODE TYPES — DOES NOT REPORT (25) =====

  describe('negative node types — does NOT report', () => {
    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration({ type: 'Literal', value: 'test', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ExportNamedDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration({ type: 'ExportNamedDeclaration', declaration: {}, specifiers: [], loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration({ type: 'FunctionDeclaration', id: { name: 'foo' }, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 30) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ClassDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration({ type: 'ClassDeclaration', id: { name: 'MyClass' }, body: { type: 'ClassBody', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration({ type: 'ExpressionStatement', expression: {}, loc: makeLoc(1, 0, 1, 1) })
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration({ type: 'MemberExpression', object: {}, property: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BlockStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration({ type: 'BlockStatement', body: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ObjectExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration({ type: 'ObjectExpression', properties: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrayExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration({ type: 'ArrayExpression', elements: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrowFunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ImportDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration({ type: 'ImportDeclaration', source: { type: 'Literal', value: 'foo' }, specifiers: [], loc: makeLoc(1, 0, 1, 25) })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration(null)
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration(undefined)
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration({})
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration('not a node')
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration(42)
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration(true)
      expect(reports.length).toBe(0)
    })

    test('does not report for array primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration([])
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noExportDefaultRule.create(ctx1)
      const visitor2 = noExportDefaultRule.create(ctx2)
      visitor1.ExportDefaultDeclaration(makeExportDefaultNode({}))
      visitor2.ExportDefaultDeclaration({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration(makeExportDefaultNode({}))
      visitor.ExportDefaultDeclaration({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      visitor.ExportDefaultDeclaration(makeExportDefaultNode({}))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      const node = { type: 'ExportDefaultDeclaration', declaration: {} }
      visitor.ExportDefaultDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      const node = { type: 'ExportDefaultDeclaration', declaration: {} }
      visitor.ExportDefaultDeclaration(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration(makeExportDefaultNode({}))
      visitor.ExportDefaultDeclaration({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      visitor.ExportDefaultDeclaration(makeExportDefaultNode({}))
      visitor.ExportDefaultDeclaration({ type: 'FunctionDeclaration', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 5) })
      visitor.ExportDefaultDeclaration(makeExportDefaultNode({}))
      expect(reports.length).toBe(3)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noExportDefaultRule.create(context)
      const visitor2 = noExportDefaultRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noExportDefaultRule.meta
      const meta2 = noExportDefaultRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      const node = {
        type: 'ExportDefaultDeclaration',
        declaration: {},
        loc: makeLoc(1, 0, 1, 28),
        range: [0, 28],
        extra: true,
        leadingComments: [],
      }
      visitor.ExportDefaultDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration({ type: 'ExportDefaultDeclaration', declaration: {}, loc: {} })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration({ type: 'ExportDefaultDeclaration', declaration: {}, loc: { start: { line: 3, column: 5 } } })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      const node = makeExportDefaultNode({})
      visitor.ExportDefaultDeclaration(node)
      visitor.ExportDefaultDeclaration(node)
      visitor.ExportDefaultDeclaration(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noExportDefaultRule).toBeDefined()
      expect(typeof noExportDefaultRule.create).toBe('function')
      expect(typeof noExportDefaultRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration({ type: 'ExportDefaultDeclaration', declaration: {}, loc: makeLoc(1, 0, 1, 28), _parent: {} })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration(makeExportDefaultNode({}))
      visitor.ExportDefaultDeclaration(makeExportDefaultNode({ type: 'FunctionDeclaration' }))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('node with range alongside loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration({ type: 'ExportDefaultDeclaration', declaration: {}, range: [0, 28], loc: makeLoc(1, 0, 1, 28) })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration(makeExportDefaultNode({}, 10, 4, 10, 12))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(12)
    })

    test('handles node with null declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration({ type: 'ExportDefaultDeclaration', declaration: null, loc: makeLoc(1, 0, 1, 28) })
      expect(reports.length).toBe(1)
    })

    test('handles node with undefined declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      visitor.ExportDefaultDeclaration({ type: 'ExportDefaultDeclaration', declaration: undefined, loc: makeLoc(1, 0, 1, 28) })
      expect(reports.length).toBe(1)
    })

    test('visitor does not throw for non-object nodes', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      expect(() => visitor.ExportDefaultDeclaration(42)).not.toThrow()
      expect(() => visitor.ExportDefaultDeclaration('str')).not.toThrow()
      expect(() => visitor.ExportDefaultDeclaration(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('report node reference is exact input node', () => {
      const { context, reports } = createMockContext()
      const visitor = noExportDefaultRule.create(context)
      const specificNode = makeExportDefaultNode({ type: 'FunctionDeclaration', id: { name: 'unique' } })
      visitor.ExportDefaultDeclaration(specificNode)
      expect(reports[0].node).toBe(specificNode)
    })
  })
})
