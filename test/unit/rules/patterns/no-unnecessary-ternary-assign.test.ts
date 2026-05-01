import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryTernaryAssignRule } from '../../../../src/rules/patterns/no-unnecessary-ternary-assign.js'
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
    getSource: () => '',
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

function makeCondExpr(
  testNode: unknown = { type: 'Identifier', name: 'x' },
  consequentNode: unknown = { type: 'Literal', value: true },
  alternateNode: unknown = { type: 'Literal', value: false },
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'ConditionalExpression',
    test: testNode,
    consequent: consequentNode,
    alternate: alternateNode,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-ternary-assign rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryTernaryAssignRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryTernaryAssignRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryTernaryAssignRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryTernaryAssignRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryTernaryAssignRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning ternary', () => {
      const desc = noUnnecessaryTernaryAssignRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/ternary/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryTernaryAssignRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-ternary-assign',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryTernaryAssignRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with ConditionalExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      expect(visitor).toHaveProperty('ConditionalExpression')
      expect(typeof visitor.ConditionalExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryTernaryAssignRule).toBeDefined()
      expect(noUnnecessaryTernaryAssignRule.meta).toBeDefined()
      expect(noUnnecessaryTernaryAssignRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS UNNECESSARY TERNARY (25) =====

  describe('positive cases — reports unnecessary ternary', () => {
    test('reports for x ? true : false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression(makeCondExpr())
      expect(reports.length).toBe(1)
    })

    test('reports for y ? true : false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression(makeCondExpr({ type: 'Identifier', name: 'y' }))
      expect(reports.length).toBe(1)
    })

    test('reports for condition with CallExpression test node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression(makeCondExpr({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }))
      expect(reports.length).toBe(1)
    })

    test('reports for condition with BinaryExpression test node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression(makeCondExpr({ type: 'BinaryExpression', operator: '>', left: { type: 'Identifier', name: 'a' }, right: { type: 'Literal', value: 5 } }))
      expect(reports.length).toBe(1)
    })

    test('reports for condition with MemberExpression test node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression(makeCondExpr({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'flag' } }))
      expect(reports.length).toBe(1)
    })

    test('reports for condition with UnaryExpression test node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression(makeCondExpr({ type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'flag' } }))
      expect(reports.length).toBe(1)
    })

    test('reports for condition with LogicalExpression test node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression(makeCondExpr({ type: 'LogicalExpression', operator: '&&', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } }))
      expect(reports.length).toBe(1)
    })

    test('reports for deeply nested test node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression(makeCondExpr({
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'BinaryExpression', operator: '===', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: 1 } },
        right: { type: 'Identifier', name: 'y' },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports for test node that is a Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression(makeCondExpr({ type: 'Literal', value: 1 }))
      expect(reports.length).toBe(1)
    })

    test('reports with custom loc values line 5 col 10', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression(makeCondExpr(undefined, undefined, undefined, 5, 10, 5, 30))
      expect(reports.length).toBe(1)
    })

    test('reports with loc spanning multiple lines', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression(makeCondExpr(undefined, undefined, undefined, 2, 0, 4, 25))
      expect(reports.length).toBe(1)
    })

    test('reports for node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression({
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'x' },
        consequent: { type: 'Literal', value: true },
        alternate: { type: 'Literal', value: false },
        loc: makeLoc(1, 0, 1, 20),
        range: [0, 20],
        extra: true,
        parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('reports for consequent with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression(makeCondExpr(
        undefined,
        { type: 'Literal', value: true, raw: 'true', extra: true },
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for alternate with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression(makeCondExpr(
        undefined,
        undefined,
        { type: 'Literal', value: false, raw: 'false', extra: true },
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for test node that is UpdateExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression(makeCondExpr({ type: 'UpdateExpression', operator: '++', prefix: false, argument: { type: 'Identifier', name: 'i' } }))
      expect(reports.length).toBe(1)
    })

    test('reports for test node that is ConditionalExpression (nested ternary)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression(makeCondExpr({
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'a' },
        consequent: { type: 'Literal', value: true },
        alternate: { type: 'Literal', value: false },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports for test node that is AssignmentExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression(makeCondExpr({ type: 'AssignmentExpression', operator: '=', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: 5 } }))
      expect(reports.length).toBe(1)
    })

    test('reports for test node that is ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression(makeCondExpr({ type: 'ArrayExpression', elements: [] }))
      expect(reports.length).toBe(1)
    })

    test('reports for test node that is ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression(makeCondExpr({ type: 'ObjectExpression', properties: [] }))
      expect(reports.length).toBe(1)
    })

    test('reports for test node that is TemplateLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression(makeCondExpr({ type: 'TemplateLiteral', quasis: [], expressions: [] }))
      expect(reports.length).toBe(1)
    })

    test('reports for consequent value true with Boolean(...) semantic', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression(makeCondExpr(
        { type: 'Identifier', name: 'isValid' },
        { type: 'Literal', value: true },
        { type: 'Literal', value: false },
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for consecutive calls to same visitor', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression(makeCondExpr())
      visitor.ConditionalExpression(makeCondExpr())
      expect(reports.length).toBe(2)
    })

    test('reports for node without range property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression({
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'x' },
        consequent: { type: 'Literal', value: true },
        alternate: { type: 'Literal', value: false },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for node with parent reference', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression({
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'x' },
        consequent: { type: 'Literal', value: true },
        alternate: { type: 'Literal', value: false },
        loc: makeLoc(1, 0, 1, 20),
        _parent: { type: 'VariableDeclarator' },
      })
      expect(reports.length).toBe(1)
    })

    test('reports for test node that is NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression(makeCondExpr({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Foo' }, arguments: [] }))
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report message mentions "Unnecessary ternary"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression(makeCondExpr())
      expect(reports[0].message).toContain('Unnecessary ternary')
    })

    test('report message mentions "condition ? true : false"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression(makeCondExpr())
      expect(reports[0].message).toContain('condition ? true : false')
    })

    test('report message mentions "simplified"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression(makeCondExpr())
      expect(reports[0].message.toLowerCase()).toContain('simplif')
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression(makeCondExpr())
      expect(reports[0].message).toBe(
        'Unnecessary ternary: condition ? true : false can be simplified to the condition itself.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression(makeCondExpr())
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression(makeCondExpr())
      expect(reports[0].node).toBeDefined()
    })

    test('report loc start line matches node loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression(makeCondExpr(undefined, undefined, undefined, 7, 3, 7, 23))
      expect(reports[0].loc?.start.line).toBe(7)
    })

    test('report loc start column matches node loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression(makeCondExpr(undefined, undefined, undefined, 7, 3, 7, 23))
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('report loc end line matches node loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression(makeCondExpr(undefined, undefined, undefined, 7, 3, 9, 15))
      expect(reports[0].loc?.end.line).toBe(9)
    })

    test('report loc end column matches node loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression(makeCondExpr(undefined, undefined, undefined, 7, 3, 7, 23))
      expect(reports[0].loc?.end.column).toBe(23)
    })

    test('report node matches the input ConditionalExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      const node = makeCondExpr()
      visitor.ConditionalExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression(makeCondExpr())
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('multiple reports all have same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression(makeCondExpr())
      visitor.ConditionalExpression(makeCondExpr({ type: 'Identifier', name: 'z' }))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression(makeCondExpr(undefined, undefined, undefined, 10, 4, 10, 28))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(28)
    })

    test('report loc preserves multiline location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression(makeCondExpr(undefined, undefined, undefined, 3, 5, 8, 10))
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
      expect(reports[0].loc?.end.line).toBe(8)
      expect(reports[0].loc?.end.column).toBe(10)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for consequent value false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression(makeCondExpr(undefined, { type: 'Literal', value: false }))
      expect(reports.length).toBe(0)
    })

    test('does not report for alternate value true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression(makeCondExpr(undefined, undefined, { type: 'Literal', value: true }))
      expect(reports.length).toBe(0)
    })

    test('does not report for consequent value 1 (truthy number)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression(makeCondExpr(undefined, { type: 'Literal', value: 1 }))
      expect(reports.length).toBe(0)
    })

    test('does not report for alternate value 0 (falsy number)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression(makeCondExpr(undefined, undefined, { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(0)
    })

    test('does not report for consequent type Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression(makeCondExpr(undefined, { type: 'Identifier', name: 'a' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for alternate type Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression(makeCondExpr(undefined, undefined, { type: 'Identifier', name: 'b' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for consequent string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression(makeCondExpr(undefined, { type: 'Literal', value: 'yes' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for alternate string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression(makeCondExpr(undefined, undefined, { type: 'Literal', value: 'no' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      expect(() => visitor.ConditionalExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      expect(() => visitor.ConditionalExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      expect(() => visitor.ConditionalExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      expect(() => visitor.ConditionalExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      expect(() => visitor.ConditionalExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      expect(() => visitor.ConditionalExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      expect(() => visitor.ConditionalExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong node type Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression({ type: 'Identifier', name: 'x', loc: makeLoc(1, 0, 1, 1) })
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong node type Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression({ type: 'Literal', value: 42, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong node type CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when consequent is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression({
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'x' },
        consequent: null,
        alternate: { type: 'Literal', value: false },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when alternate is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression({
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'x' },
        consequent: { type: 'Literal', value: true },
        alternate: null,
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when consequent is string primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression({
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'x' },
        consequent: 'not-an-object',
        alternate: { type: 'Literal', value: false },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when alternate is number primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression({
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'x' },
        consequent: { type: 'Literal', value: true },
        alternate: 42,
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for x ? true : true (both same)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression(makeCondExpr(undefined, { type: 'Literal', value: true }, { type: 'Literal', value: true }))
      expect(reports.length).toBe(0)
    })

    test('does not report for x ? false : false (both same)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression(makeCondExpr(undefined, { type: 'Literal', value: false }, { type: 'Literal', value: false }))
      expect(reports.length).toBe(0)
    })

    test('does not report for consequent CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression(makeCondExpr(undefined, { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryTernaryAssignRule.create(ctx1)
      const visitor2 = noUnnecessaryTernaryAssignRule.create(ctx2)
      visitor1.ConditionalExpression(makeCondExpr())
      visitor2.ConditionalExpression(makeCondExpr(undefined, { type: 'Identifier', name: 'a' }))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression(makeCondExpr())
      visitor.ConditionalExpression(makeCondExpr(undefined, { type: 'Identifier', name: 'a' }))
      visitor.ConditionalExpression(makeCondExpr())
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      const node = {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'x' },
        consequent: { type: 'Literal', value: true },
        alternate: { type: 'Literal', value: false },
      }
      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      const node = {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'x' },
        consequent: { type: 'Literal', value: true },
        alternate: { type: 'Literal', value: false },
      }
      visitor.ConditionalExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression(makeCondExpr())
      visitor.ConditionalExpression(makeCondExpr(undefined, { type: 'Identifier', name: 'a' }))
      visitor.ConditionalExpression(makeCondExpr())
      visitor.ConditionalExpression(makeCondExpr(undefined, { type: 'Literal', value: 1 }))
      visitor.ConditionalExpression(makeCondExpr())
      expect(reports.length).toBe(3)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryTernaryAssignRule.create(context)
      const visitor2 = noUnnecessaryTernaryAssignRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryTernaryAssignRule.meta
      const meta2 = noUnnecessaryTernaryAssignRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression({
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'x' },
        consequent: { type: 'Literal', value: true },
        alternate: { type: 'Literal', value: false },
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression({
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'x' },
        consequent: { type: 'Literal', value: true },
        alternate: { type: 'Literal', value: false },
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression({
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'x' },
        consequent: { type: 'Literal', value: true },
        alternate: { type: 'Literal', value: false },
        loc: makeLoc(1, 0, 1, 20),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      const node = makeCondExpr()
      visitor.ConditionalExpression(node)
      visitor.ConditionalExpression(node)
      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryTernaryAssignRule).toBeDefined()
      expect(typeof noUnnecessaryTernaryAssignRule.create).toBe('function')
      expect(typeof noUnnecessaryTernaryAssignRule.meta).toBe('object')
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression(makeCondExpr())
      visitor.ConditionalExpression(makeCondExpr({ type: 'Identifier', name: 'z' }))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('consequent with value true (boolean) is strict not truthy', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression(makeCondExpr(undefined, { type: 'Literal', value: 'true' }, { type: 'Literal', value: false }))
      expect(reports.length).toBe(0)
    })

    test('alternate with value false (boolean) is strict not falsy', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression(makeCondExpr(undefined, { type: 'Literal', value: true }, { type: 'Literal', value: '' }))
      expect(reports.length).toBe(0)
    })

    test('consequent type must be exactly Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression(makeCondExpr(undefined, { type: 'BooleanLiteral', value: true }))
      expect(reports.length).toBe(0)
    })

    test('alternate type must be exactly Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression(makeCondExpr(undefined, { type: 'Literal', value: true }, { type: 'BooleanLiteral', value: false }))
      expect(reports.length).toBe(0)
    })

    test('handles consequent with undefined value property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression(makeCondExpr(undefined, { type: 'Literal' }))
      expect(reports.length).toBe(0)
    })

    test('handles node type mismatch gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('consequent value true number 1 does not match', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryAssignRule.create(context)
      visitor.ConditionalExpression(makeCondExpr(undefined, { type: 'Literal', value: 1 }, { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(0)
    })
  })
})
