import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryTemplateLiteralRule } from '../../../../src/rules/patterns/no-unnecessary-template-literal.js'
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
    getSource: () => '``',
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

function makeEmptyTemplateLiteralNode(
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 2,
): unknown {
  return {
    type: 'TemplateLiteral',
    expressions: [],
    quasis: [{ type: 'TemplateElement', value: '' }],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-template-literal rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryTemplateLiteralRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryTemplateLiteralRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryTemplateLiteralRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryTemplateLiteralRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryTemplateLiteralRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning template literal', () => {
      const desc = noUnnecessaryTemplateLiteralRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/template/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryTemplateLiteralRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-template-literal',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryTemplateLiteralRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with TemplateLiteral', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      expect(visitor).toHaveProperty('TemplateLiteral')
      expect(typeof visitor.TemplateLiteral).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryTemplateLiteralRule).toBeDefined()
      expect(noUnnecessaryTemplateLiteralRule.meta).toBeDefined()
      expect(noUnnecessaryTemplateLiteralRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS EMPTY TEMPLATE LITERAL (25) =====

  describe('positive cases — reports empty template literal', () => {
    test('reports for basic empty template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral(makeEmptyTemplateLiteralNode())
      expect(reports.length).toBe(1)
    })

    test('reports for empty template literal at different location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral(makeEmptyTemplateLiteralNode(5, 10, 5, 12))
      expect(reports.length).toBe(1)
    })

    test('reports for empty template literal spanning multiple lines', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral(makeEmptyTemplateLiteralNode(1, 0, 3, 2))
      expect(reports.length).toBe(1)
    })

    test('reports for empty template literal at line 10 column 4', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral(makeEmptyTemplateLiteralNode(10, 4, 10, 6))
      expect(reports.length).toBe(1)
    })

    test('reports for empty template literal at column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral(makeEmptyTemplateLiteralNode(1, 0, 1, 2))
      expect(reports.length).toBe(1)
    })

    test('reports for empty template literal with large column offset', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral(makeEmptyTemplateLiteralNode(1, 100, 1, 102))
      expect(reports.length).toBe(1)
    })

    test('reports for empty template literal at end of file', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral(makeEmptyTemplateLiteralNode(50, 30, 50, 32))
      expect(reports.length).toBe(1)
    })

    test('reports when quasi value is empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral({
        type: 'TemplateLiteral',
        expressions: [],
        quasis: [{ type: 'TemplateElement', value: '' }],
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(1)
    })

    test('reports when quasis has single element with empty value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral({
        type: 'TemplateLiteral',
        expressions: [],
        quasis: [{ type: 'TemplateElement', value: '' }],
        loc: makeLoc(2, 5, 2, 7),
      })
      expect(reports.length).toBe(1)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral(makeEmptyTemplateLiteralNode())
      visitor.TemplateLiteral(makeEmptyTemplateLiteralNode())
      expect(reports.length).toBe(2)
    })

    test('accumulates three reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral(makeEmptyTemplateLiteralNode())
      visitor.TemplateLiteral(makeEmptyTemplateLiteralNode())
      visitor.TemplateLiteral(makeEmptyTemplateLiteralNode())
      expect(reports.length).toBe(3)
    })

    test('reports for node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral({
        type: 'TemplateLiteral',
        expressions: [],
        quasis: [{ type: 'TemplateElement', value: '' }],
        loc: makeLoc(1, 0, 1, 2),
        range: [0, 2],
      })
      expect(reports.length).toBe(1)
    })

    test('reports for node with extra quasi properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral({
        type: 'TemplateLiteral',
        expressions: [],
        quasis: [{ type: 'TemplateElement', value: '', tail: true }],
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(1)
    })

    test('report message mentions "Unnecessary"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral(makeEmptyTemplateLiteralNode())
      expect(reports[0].message).toContain('Unnecessary')
    })

    test('report message mentions "template literal"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral(makeEmptyTemplateLiteralNode())
      expect(reports[0].message.toLowerCase()).toContain('template literal')
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral(makeEmptyTemplateLiteralNode())
      expect(reports[0].message).toBe('Unnecessary empty template literal.')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral(makeEmptyTemplateLiteralNode())
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral(makeEmptyTemplateLiteralNode())
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input TemplateLiteral node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      const node = makeEmptyTemplateLiteralNode()
      visitor.TemplateLiteral(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral(makeEmptyTemplateLiteralNode(5, 10, 5, 12))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report loc end values are preserved', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral(makeEmptyTemplateLiteralNode(3, 8, 7, 15))
      expect(reports[0].loc?.end.line).toBe(7)
      expect(reports[0].loc?.end.column).toBe(15)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral(makeEmptyTemplateLiteralNode())
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for node with range property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral({
        type: 'TemplateLiteral',
        expressions: [],
        quasis: [{ type: 'TemplateElement', value: '' }],
        loc: makeLoc(1, 0, 1, 2),
        range: [0, 2],
      })
      expect(reports.length).toBe(1)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral(makeEmptyTemplateLiteralNode())
      visitor.TemplateLiteral(makeEmptyTemplateLiteralNode(2, 3, 2, 5))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for empty template literal with zero column end', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral(makeEmptyTemplateLiteralNode(1, 0, 1, 0))
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report message contains "empty"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral(makeEmptyTemplateLiteralNode())
      expect(reports[0].message.toLowerCase()).toContain('empty')
    })

    test('report message ends with period', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral(makeEmptyTemplateLiteralNode())
      expect(reports[0].message.endsWith('.')).toBe(true)
    })

    test('report loc start is correct', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral(makeEmptyTemplateLiteralNode(4, 2, 4, 4))
      expect(reports[0].loc?.start).toEqual({ line: 4, column: 2 })
    })

    test('report loc end is correct', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral(makeEmptyTemplateLiteralNode(4, 2, 4, 4))
      expect(reports[0].loc?.end).toEqual({ line: 4, column: 4 })
    })

    test('report node is not null after detection', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral(makeEmptyTemplateLiteralNode())
      expect(reports[0].node).not.toBeNull()
    })

    test('report node is not undefined after detection', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral(makeEmptyTemplateLiteralNode())
      expect(reports[0].node).not.toBeUndefined()
    })

    test('report node has type TemplateLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral(makeEmptyTemplateLiteralNode())
      const reportedNode = reports[0].node as Record<string, unknown>
      expect(reportedNode.type).toBe('TemplateLiteral')
    })

    test('report message is a non-empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral(makeEmptyTemplateLiteralNode())
      expect(typeof reports[0].message).toBe('string')
      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('report loc start line is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral(makeEmptyTemplateLiteralNode())
      expect(typeof reports[0].loc?.start.line).toBe('number')
    })

    test('report loc start column is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral(makeEmptyTemplateLiteralNode())
      expect(typeof reports[0].loc?.start.column).toBe('number')
    })

    test('report loc end line is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral(makeEmptyTemplateLiteralNode())
      expect(typeof reports[0].loc?.end.line).toBe('number')
    })

    test('report loc end column is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral(makeEmptyTemplateLiteralNode())
      expect(typeof reports[0].loc?.end.column).toBe('number')
    })

    test('report has exactly 3 properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral(makeEmptyTemplateLiteralNode())
      expect(Object.keys(reports[0]).length).toBe(3)
    })

    test('report node has expressions array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral(makeEmptyTemplateLiteralNode())
      const reportedNode = reports[0].node as Record<string, unknown>
      expect(Array.isArray(reportedNode.expressions)).toBe(true)
    })

    test('report node has quasis array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral(makeEmptyTemplateLiteralNode())
      const reportedNode = reports[0].node as Record<string, unknown>
      expect(Array.isArray(reportedNode.quasis)).toBe(true)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for non-empty quasi value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral({
        type: 'TemplateLiteral',
        expressions: [],
        quasis: [{ type: 'TemplateElement', value: 'hello' }],
        loc: makeLoc(1, 0, 1, 9),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for template with expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral({
        type: 'TemplateLiteral',
        expressions: [{ type: 'Identifier', name: 'x' }],
        quasis: [{ type: 'TemplateElement', value: '' }, { type: 'TemplateElement', value: '' }],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral({ type: 'Literal', value: 'test', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      expect(() => visitor.TemplateLiteral(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      expect(() => visitor.TemplateLiteral(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      expect(() => visitor.TemplateLiteral({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      expect(() => visitor.TemplateLiteral('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      expect(() => visitor.TemplateLiteral(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      expect(() => visitor.TemplateLiteral(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for template with multi-char quasi', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral({
        type: 'TemplateLiteral',
        expressions: [],
        quasis: [{ type: 'TemplateElement', value: 'content' }],
        loc: makeLoc(1, 0, 1, 11),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for template with space quasi', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral({
        type: 'TemplateLiteral',
        expressions: [],
        quasis: [{ type: 'TemplateElement', value: ' ' }],
        loc: makeLoc(1, 0, 1, 3),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for template with numeric string quasi', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral({
        type: 'TemplateLiteral',
        expressions: [],
        quasis: [{ type: 'TemplateElement', value: '42' }],
        loc: makeLoc(1, 0, 1, 4),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for template with multiple quasis', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral({
        type: 'TemplateLiteral',
        expressions: [{ type: 'Identifier', name: 'a' }],
        quasis: [{ type: 'TemplateElement', value: '' }, { type: 'TemplateElement', value: '' }],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral({ type: 'MemberExpression', object: {}, property: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for quasi with wrong type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral({
        type: 'TemplateLiteral',
        expressions: [],
        quasis: [{ type: 'Identifier', value: '' }],
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for quasi with non-empty value and expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral({
        type: 'TemplateLiteral',
        expressions: [{ type: 'Identifier', name: 'x' }],
        quasis: [{ type: 'TemplateElement', value: 'hello ' }, { type: 'TemplateElement', value: '' }],
        loc: makeLoc(1, 0, 1, 12),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      expect(() => visitor.TemplateLiteral([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for quasi with number value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral({
        type: 'TemplateLiteral',
        expressions: [],
        quasis: [{ type: 'TemplateElement', value: 0 }],
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for quasi with null value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral({
        type: 'TemplateLiteral',
        expressions: [],
        quasis: [{ type: 'TemplateElement', value: null }],
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryTemplateLiteralRule.create(ctx1)
      const visitor2 = noUnnecessaryTemplateLiteralRule.create(ctx2)
      visitor1.TemplateLiteral(makeEmptyTemplateLiteralNode())
      visitor2.TemplateLiteral({
        type: 'TemplateLiteral',
        expressions: [],
        quasis: [{ type: 'TemplateElement', value: 'hello' }],
        loc: makeLoc(1, 0, 1, 9),
      })
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral(makeEmptyTemplateLiteralNode())
      visitor.TemplateLiteral({
        type: 'TemplateLiteral',
        expressions: [],
        quasis: [{ type: 'TemplateElement', value: 'hello' }],
        loc: makeLoc(1, 0, 1, 9),
      })
      visitor.TemplateLiteral(makeEmptyTemplateLiteralNode(2, 0, 2, 2))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      const node = {
        type: 'TemplateLiteral',
        expressions: [],
        quasis: [{ type: 'TemplateElement', value: '' }],
      }
      visitor.TemplateLiteral(node)
      expect(reports.length).toBe(1)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral({
        type: 'TemplateLiteral',
        expressions: [],
        quasis: [{ type: 'TemplateElement', value: 'text' }],
        loc: makeLoc(1, 0, 1, 6),
      })
      visitor.TemplateLiteral(makeEmptyTemplateLiteralNode())
      visitor.TemplateLiteral({
        type: 'Literal',
        value: 'hello',
        loc: makeLoc(1, 0, 1, 7),
      })
      visitor.TemplateLiteral(makeEmptyTemplateLiteralNode(3, 0, 3, 2))
      visitor.TemplateLiteral({
        type: 'TemplateLiteral',
        expressions: [{ type: 'Identifier', name: 'x' }],
        quasis: [{ type: 'TemplateElement', value: '' }, { type: 'TemplateElement', value: '' }],
        loc: makeLoc(4, 0, 4, 5),
      })
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryTemplateLiteralRule.create(context)
      const visitor2 = noUnnecessaryTemplateLiteralRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryTemplateLiteralRule.meta
      const meta2 = noUnnecessaryTemplateLiteralRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with empty expressions array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral({
        type: 'TemplateLiteral',
        expressions: [],
        quasis: [{ type: 'TemplateElement', value: '' }],
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with empty quasis array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral({
        type: 'TemplateLiteral',
        expressions: [],
        quasis: [],
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(0)
    })

    test('handles node with missing expressions property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral({
        type: 'TemplateLiteral',
        quasis: [{ type: 'TemplateElement', value: '' }],
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(0)
    })

    test('handles node with missing quasis property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral({
        type: 'TemplateLiteral',
        expressions: [],
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(0)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      const node = makeEmptyTemplateLiteralNode()
      visitor.TemplateLiteral(node)
      visitor.TemplateLiteral(node)
      visitor.TemplateLiteral(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryTemplateLiteralRule).toBeDefined()
      expect(typeof noUnnecessaryTemplateLiteralRule.create).toBe('function')
      expect(typeof noUnnecessaryTemplateLiteralRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral({
        type: 'TemplateLiteral',
        expressions: [],
        quasis: [{ type: 'TemplateElement', value: '' }],
        loc: makeLoc(1, 0, 1, 2),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral({
        type: 'TemplateLiteral',
        expressions: [],
        quasis: [{ type: 'TemplateElement', value: '' }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral({
        type: 'TemplateLiteral',
        expressions: [],
        quasis: [{ type: 'TemplateElement', value: '' }],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral(makeEmptyTemplateLiteralNode())
      visitor.TemplateLiteral(makeEmptyTemplateLiteralNode(5, 0, 5, 2))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('quasis with two elements does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral({
        type: 'TemplateLiteral',
        expressions: [],
        quasis: [{ type: 'TemplateElement', value: '' }, { type: 'TemplateElement', value: '' }],
        loc: makeLoc(1, 0, 1, 4),
      })
      expect(reports.length).toBe(0)
    })

    test('expressions with one element does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral({
        type: 'TemplateLiteral',
        expressions: [{ type: 'Identifier', name: 'x' }],
        quasis: [{ type: 'TemplateElement', value: '' }],
        loc: makeLoc(1, 0, 1, 4),
      })
      expect(reports.length).toBe(0)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral(makeEmptyTemplateLiteralNode(10, 4, 10, 6))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(6)
    })

    test('does not report when quasi is not an object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralRule.create(context)
      visitor.TemplateLiteral({
        type: 'TemplateLiteral',
        expressions: [],
        quasis: ['not an object'],
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(0)
    })
  })
})
