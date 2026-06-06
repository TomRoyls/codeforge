import { describe, expect, test, vi } from 'vitest'
import { noThisAliasRule } from '../../../../src/rules/patterns/no-this-alias.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
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
    getSource: () => 'const self = this',
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

function makeThisExpr(
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 4,
): unknown {
  return {
    type: 'ThisExpression',
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeIdentifier(name: string): unknown {
  return { type: 'Identifier', name, loc: makeLoc(1, 0, 1, name.length) }
}

function makeVarDeclarator(
  idName: string,
  init: unknown,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 15,
): unknown {
  return {
    type: 'VariableDeclarator',
    id: makeIdentifier(idName),
    init,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-this-alias rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noThisAliasRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noThisAliasRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noThisAliasRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noThisAliasRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noThisAliasRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning this aliasing', () => {
      const desc = noThisAliasRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/alias/)
    })

    test('should have correct docs URL', () => {
      expect(noThisAliasRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-this-alias',
      )
    })

    test('should have empty schema', () => {
      expect(noThisAliasRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with VariableDeclarator', () => {
      const { context } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      expect(visitor).toHaveProperty('VariableDeclarator')
      expect(typeof visitor.VariableDeclarator).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noThisAliasRule).toBeDefined()
      expect(noThisAliasRule.meta).toBeDefined()
      expect(noThisAliasRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS THIS ALIAS (20) =====

  describe('positive cases — reports this alias', () => {
    test('reports const self = this', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('self', makeThisExpr()))
      expect(reports.length).toBe(1)
    })

    test('report message mentions aliasing', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('self', makeThisExpr()))
      expect(reports[0].message.toLowerCase()).toContain('aliasing')
    })

    test('report message mentions this', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('self', makeThisExpr()))
      expect(reports[0].message).toContain('this')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('self', makeThisExpr()))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('self', makeThisExpr()))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the VariableDeclarator node', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      const node = makeVarDeclarator('self', makeThisExpr())
      visitor.VariableDeclarator(node)
      expect(reports[0].node).toBe(node)
    })

    test('reports const that = this', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('that', makeThisExpr()))
      expect(reports.length).toBe(1)
    })

    test('reports const me = this', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('me', makeThisExpr()))
      expect(reports.length).toBe(1)
    })

    test('reports const _this = this', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('_this', makeThisExpr()))
      expect(reports.length).toBe(1)
    })

    test('reports const vm = this', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('vm', makeThisExpr()))
      expect(reports.length).toBe(1)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('self', makeThisExpr()))
      visitor.VariableDeclarator(makeVarDeclarator('that', makeThisExpr()))
      expect(reports.length).toBe(2)
    })

    test('report loc reflects the node location', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('self', makeThisExpr(), 3, 5, 3, 20))
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('report loc has both start and end', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('self', makeThisExpr()))
      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('self', makeThisExpr()))
      visitor.VariableDeclarator(makeVarDeclarator('that', makeThisExpr()))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('message is exactly as defined in the rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('self', makeThisExpr()))
      expect(reports[0].message).toBe(
        "Unexpected aliasing of 'this'. Use arrow functions or bind() instead.",
      )
    })

    test('reports with long identifier name', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('currentContext', makeThisExpr()))
      expect(reports.length).toBe(1)
    })

    test('reports with single-character identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('t', makeThisExpr()))
      expect(reports.length).toBe(1)
    })

    test('reports message mentions arrow functions', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('self', makeThisExpr()))
      expect(reports[0].message.toLowerCase()).toContain('arrow functions')
    })

    test('reports message mentions bind', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('self', makeThisExpr()))
      expect(reports[0].message.toLowerCase()).toContain('bind')
    })

    test('report loc end reflects the node end position', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('self', makeThisExpr(), 5, 2, 5, 17))
      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(17)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (35) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for init being undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('x', undefined))
      expect(reports.length).toBe(0)
    })

    test('does not report for init being null', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('x', null))
      expect(reports.length).toBe(0)
    })

    test('does not report for init being an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('x', makeIdentifier('other')))
      expect(reports.length).toBe(0)
    })

    test('does not report for init being a Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('x', { type: 'Literal', value: 42, loc: makeLoc(1, 0, 1, 2) }))
      expect(reports.length).toBe(0)
    })

    test('does not report for init being a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('x', { type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) }))
      expect(reports.length).toBe(0)
    })

    test('does not report for init being a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('x', { type: 'MemberExpression', object: makeIdentifier('obj'), property: makeIdentifier('prop'), loc: makeLoc(1, 0, 1, 7) }))
      expect(reports.length).toBe(0)
    })

    test('does not report for init being a BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('x', { type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) }))
      expect(reports.length).toBe(0)
    })

    test('does not report for init being an ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('x', { type: 'ObjectExpression', properties: [], loc: makeLoc(1, 0, 1, 2) }))
      expect(reports.length).toBe(0)
    })

    test('does not report for init being an ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('x', { type: 'ArrayExpression', elements: [], loc: makeLoc(1, 0, 1, 2) }))
      expect(reports.length).toBe(0)
    })

    test('does not report for init being a FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('x', { type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) }))
      expect(reports.length).toBe(0)
    })

    test('does not report for init being an ArrowFunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('x', { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 15) }))
      expect(reports.length).toBe(0)
    })

    test('does not report for init being a NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('x', { type: 'NewExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 8) }))
      expect(reports.length).toBe(0)
    })

    test('does not report for init being a ConditionalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('x', { type: 'ConditionalExpression', test: {}, consequent: {}, alternate: {}, loc: makeLoc(1, 0, 1, 15) }))
      expect(reports.length).toBe(0)
    })

    test('does not report for init being a UnaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('x', { type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) }))
      expect(reports.length).toBe(0)
    })

    test('does not report for init being a LogicalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('x', { type: 'LogicalExpression', operator: '&&', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) }))
      expect(reports.length).toBe(0)
    })

    test('does not report for init being a TemplateLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('x', { type: 'TemplateLiteral', quasis: [], expressions: [], loc: makeLoc(1, 0, 1, 5) }))
      expect(reports.length).toBe(0)
    })

    test('does not report for init being an AssignmentExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('x', { type: 'AssignmentExpression', operator: '=', left: {}, right: {}, loc: makeLoc(1, 0, 1, 10) }))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      expect(() => visitor.VariableDeclarator(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      expect(() => visitor.VariableDeclarator(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      expect(() => visitor.VariableDeclarator({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for non-object node (string)', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      expect(() => visitor.VariableDeclarator('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for non-object node (number)', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      expect(() => visitor.VariableDeclarator(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for non-object node (boolean)', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      expect(() => visitor.VariableDeclarator(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      expect(() => visitor.VariableDeclarator([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for node with wrong type Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      visitor.VariableDeclarator(makeIdentifier('foo'))
      expect(reports.length).toBe(0)
    })

    test('does not report for node with wrong type ExpressionStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      visitor.VariableDeclarator({ type: 'ExpressionStatement', expression: {}, loc: makeLoc(1, 0, 1, 1) })
      expect(reports.length).toBe(0)
    })

    test('does not report for node with wrong type BlockStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      visitor.VariableDeclarator({ type: 'BlockStatement', body: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for node with wrong type ReturnStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      visitor.VariableDeclarator({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for node with wrong type IfStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      visitor.VariableDeclarator({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for node with wrong type VariableDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      visitor.VariableDeclarator({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for node type StringLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      visitor.VariableDeclarator({ type: 'Literal', value: 'test', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for init being a string primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      visitor.VariableDeclarator({ type: 'VariableDeclarator', id: makeIdentifier('x'), init: 'hello', loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for init being a number primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      visitor.VariableDeclarator({ type: 'VariableDeclarator', id: makeIdentifier('x'), init: 42, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for init being an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      visitor.VariableDeclarator({ type: 'VariableDeclarator', id: makeIdentifier('x'), init: [1, 2, 3], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for init missing from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      visitor.VariableDeclarator({ type: 'VariableDeclarator', id: makeIdentifier('x'), loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (30) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noThisAliasRule.create(ctx1)
      const visitor2 = noThisAliasRule.create(ctx2)
      visitor1.VariableDeclarator(makeVarDeclarator('self', makeThisExpr()))
      visitor2.VariableDeclarator(makeVarDeclarator('x', makeIdentifier('other')))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly with mixed calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('self', makeThisExpr()))
      visitor.VariableDeclarator(makeVarDeclarator('x', makeIdentifier('other')))
      visitor.VariableDeclarator(makeVarDeclarator('that', makeThisExpr()))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      const node = { type: 'VariableDeclarator', id: makeIdentifier('self'), init: { type: 'ThisExpression' } }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      const node = { type: 'VariableDeclarator', id: makeIdentifier('self'), init: { type: 'ThisExpression' } }
      visitor.VariableDeclarator(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('self', makeThisExpr()))
      visitor.VariableDeclarator(makeVarDeclarator('x', makeIdentifier('y')))
      visitor.VariableDeclarator(makeVarDeclarator('z', undefined))
      visitor.VariableDeclarator(makeVarDeclarator('that', makeThisExpr()))
      visitor.VariableDeclarator(makeVarDeclarator('a', { type: 'Literal', value: 1, loc: makeLoc(1, 0, 1, 1) }))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call (not same reference)', () => {
      const { context } = createMockContext()
      const visitor1 = noThisAliasRule.create(context)
      const visitor2 = noThisAliasRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noThisAliasRule.meta
      const meta2 = noThisAliasRule.meta
      expect(meta1).toBe(meta2)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('self', makeThisExpr()))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: makeIdentifier('self'),
        init: makeThisExpr(),
        loc: makeLoc(1, 0, 1, 15),
        range: [0, 15],
        extra: true,
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      const node = { type: 'VariableDeclarator', id: makeIdentifier('self'), init: { type: 'ThisExpression', loc: {} }, loc: {} }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      const node = { type: 'VariableDeclarator', id: makeIdentifier('self'), init: makeThisExpr(), loc: { start: { line: 3, column: 5 } } }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      const node = makeVarDeclarator('self', makeThisExpr())
      visitor.VariableDeclarator(node)
      visitor.VariableDeclarator(node)
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(3)
    })

    test('rule name is exported correctly', () => {
      expect(noThisAliasRule).toBeDefined()
      expect(typeof noThisAliasRule.create).toBe('function')
      expect(typeof noThisAliasRule.meta).toBe('object')
    })

    test('reports only once per node for same this alias', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('self', makeThisExpr()))
      expect(reports.length).toBe(1)
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: makeIdentifier('self'),
        init: makeThisExpr(),
        loc: makeLoc(1, 0, 1, 15),
        _parent: { type: 'VariableDeclaration', kind: 'const' },
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('self', makeThisExpr()))
      visitor.VariableDeclarator(makeVarDeclarator('that', makeThisExpr()))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('location with specific line/column values preserved', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('self', makeThisExpr(), 10, 4, 10, 19))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(19)
    })

    test('handles ThisExpression init without loc on init itself', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      const node = { type: 'VariableDeclarator', id: makeIdentifier('self'), init: { type: 'ThisExpression' }, loc: makeLoc(1, 0, 1, 15) }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
    })

    test('handles ThisExpression init with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      const node = { type: 'VariableDeclarator', id: makeIdentifier('self'), init: { type: 'ThisExpression', loc: makeLoc(1, 0, 1, 4), range: [0, 4] }, loc: makeLoc(1, 0, 1, 15) }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
    })

    test('handles node where init type is not ThisExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      const node = { type: 'VariableDeclarator', id: makeIdentifier('x'), init: { type: 'Identifier', name: 'y' }, loc: makeLoc(1, 0, 1, 5) }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('handles node where init is ThisExpression but node type is not VariableDeclarator', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      visitor.VariableDeclarator({ type: 'AssignmentExpression', operator: '=', left: makeIdentifier('self'), right: makeThisExpr(), loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('handles node where id is destructuring pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      const node = { type: 'VariableDeclarator', id: { type: 'ObjectPattern', properties: [] }, init: makeThisExpr(), loc: makeLoc(1, 0, 1, 20) }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
    })

    test('handles node where id is array destructuring pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      const node = { type: 'VariableDeclarator', id: { type: 'ArrayPattern', elements: [] }, init: makeThisExpr(), loc: makeLoc(1, 0, 1, 20) }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
    })

    test('handles boolean node (non-object) without throwing', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      expect(() => visitor.VariableDeclarator(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles number node (non-object) without throwing', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      expect(() => visitor.VariableDeclarator(0)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles string node (non-object) without throwing', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      expect(() => visitor.VariableDeclarator('var')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for ThisExpression used as object in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      const memberExpr = { type: 'MemberExpression', object: makeThisExpr(), property: makeIdentifier('prop'), loc: makeLoc(1, 0, 1, 9) }
      visitor.VariableDeclarator(makeVarDeclarator('x', memberExpr))
      expect(reports.length).toBe(0)
    })

    test('handles init being ThisExpression but node missing type field', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      visitor.VariableDeclarator({ id: makeIdentifier('self'), init: makeThisExpr(), loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('handles VariableDeclarator with init being a nested ThisExpression in CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      const callExpr = { type: 'CallExpression', callee: makeThisExpr(), arguments: [], loc: makeLoc(1, 0, 1, 10) }
      visitor.VariableDeclarator(makeVarDeclarator('x', callExpr))
      expect(reports.length).toBe(0)
    })

    test('handles destructured id with this init still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisAliasRule.create(context)
      const node = { type: 'VariableDeclarator', id: { type: 'Identifier', name: 'ref' }, init: { type: 'ThisExpression' }, loc: makeLoc(1, 0, 1, 14) }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe("Unexpected aliasing of 'this'. Use arrow functions or bind() instead.")
    })
  })
})
