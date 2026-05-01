import { describe, expect, test, vi } from 'vitest'
import { noStaticOnlyClassRule } from '../../../../src/rules/patterns/no-static-only-class.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  node?: unknown
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
    getSource: () => 'class Foo { static bar() {} }',
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

function makeLoc(startLine: number, startCol: number, endLine: number, endCol: number) {
  return {
    start: { line: startLine, column: startCol },
    end: { line: endLine, column: endCol },
  }
}

function makeStaticClassDecl(
  members: unknown[] = [{ type: 'MethodDefinition', static: true, kind: 'method' }],
): unknown {
  return {
    type: 'ClassDeclaration',
    id: { type: 'Identifier', name: 'Foo' },
    body: { body: members },
    loc: makeLoc(1, 0, 5, 1),
  }
}

function makeStaticClassExpr(
  members: unknown[] = [{ type: 'PropertyDefinition', static: true, kind: 'property' }],
): unknown {
  return {
    type: 'ClassExpression',
    id: null,
    body: { body: members },
    loc: makeLoc(1, 0, 3, 2),
  }
}

describe('no-static-only-class rule', () => {
  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noStaticOnlyClassRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noStaticOnlyClassRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noStaticOnlyClassRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noStaticOnlyClassRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noStaticOnlyClassRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning static and class', () => {
      const desc = noStaticOnlyClassRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/static/)
      expect(desc).toMatch(/class/)
    })

    test('should have correct docs URL', () => {
      expect(noStaticOnlyClassRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-static-only-class',
      )
    })

    test('should have empty schema', () => {
      expect(noStaticOnlyClassRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====
  describe('structure', () => {
    test('create() returns visitor with ClassDeclaration and ClassExpression', () => {
      const { context } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      expect(visitor).toHaveProperty('ClassDeclaration')
      expect(visitor).toHaveProperty('ClassExpression')
      expect(typeof visitor.ClassDeclaration).toBe('function')
      expect(typeof visitor.ClassExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noStaticOnlyClassRule).toBeDefined()
      expect(noStaticOnlyClassRule.meta).toBeDefined()
      expect(noStaticOnlyClassRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES (20) =====
  describe('positive cases — reports static-only classes', () => {
    test('reports ClassDeclaration with only static method', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration(makeStaticClassDecl())
      expect(reports.length).toBe(1)
    })

    test('reports ClassDeclaration with only static property', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration(makeStaticClassDecl([
        { type: 'PropertyDefinition', static: true, kind: 'property' },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports ClassDeclaration with static method and constructor', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration(makeStaticClassDecl([
        { type: 'MethodDefinition', static: true, kind: 'method' },
        { type: 'MethodDefinition', static: false, kind: 'constructor' },
      ]))
      expect(reports.length).toBe(1)
    })

    test('message contains "only static"', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration(makeStaticClassDecl())
      expect(reports[0].message.toLowerCase()).toContain('only static')
    })

    test('message contains "plain object"', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration(makeStaticClassDecl())
      expect(reports[0].message.toLowerCase()).toContain('plain object')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration(makeStaticClassDecl())
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration(makeStaticClassDecl())
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the original node', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      const node = makeStaticClassDecl()
      visitor.ClassDeclaration(node)
      expect(reports[0].node).toBe(node)
    })

    test('reports multiple static-only classes via accumulation', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration(makeStaticClassDecl())
      visitor.ClassDeclaration(makeStaticClassDecl())
      visitor.ClassDeclaration(makeStaticClassDecl())
      expect(reports.length).toBe(3)
    })

    test('reports with correct location line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      const node = {
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'Foo' },
        body: { body: [{ type: 'MethodDefinition', static: true, kind: 'method' }] },
        loc: makeLoc(5, 8, 10, 1),
      }
      visitor.ClassDeclaration(node)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(1)
    })

    test('reports ClassExpression with only static members', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassExpression(makeStaticClassExpr())
      expect(reports.length).toBe(1)
    })

    test('reports ClassExpression with only static method', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassExpression(makeStaticClassExpr([
        { type: 'MethodDefinition', static: true, kind: 'method' },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports ClassExpression with static method and constructor', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassExpression(makeStaticClassExpr([
        { type: 'MethodDefinition', static: true, kind: 'method' },
        { type: 'MethodDefinition', static: false, kind: 'constructor' },
      ]))
      expect(reports.length).toBe(1)
    })

    test('message for ClassExpression matches ClassDeclaration', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const v1 = noStaticOnlyClassRule.create(ctx1)
      const v2 = noStaticOnlyClassRule.create(ctx2)
      v1.ClassDeclaration(makeStaticClassDecl())
      v2.ClassExpression(makeStaticClassExpr())
      expect(rep1[0].message).toBe(rep2[0].message)
    })

    test('reports class with only static getter', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration(makeStaticClassDecl([
        { type: 'MethodDefinition', static: true, kind: 'get' },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports class with only static setter', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration(makeStaticClassDecl([
        { type: 'MethodDefinition', static: true, kind: 'set' },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports class with multiple static methods', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration(makeStaticClassDecl([
        { type: 'MethodDefinition', static: true, kind: 'method' },
        { type: 'MethodDefinition', static: true, kind: 'method' },
        { type: 'PropertyDefinition', static: true, kind: 'property' },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports class with only static property definition', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration(makeStaticClassDecl([
        { type: 'PropertyDefinition', static: true },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports each violation once per call', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration(makeStaticClassDecl())
      expect(reports.length).toBe(1)
    })

    test('visitor accumulates reports across ClassDeclaration and ClassExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration(makeStaticClassDecl())
      visitor.ClassExpression(makeStaticClassExpr())
      expect(reports.length).toBe(2)
    })
  })

  // ===== NEGATIVE CASES (35) =====
  describe('negative cases — does NOT report', () => {
    test('does not report class with instance method', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration(makeStaticClassDecl([
        { type: 'MethodDefinition', static: true, kind: 'method' },
        { type: 'MethodDefinition', static: false, kind: 'method' },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report class with instance property', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration(makeStaticClassDecl([
        { type: 'PropertyDefinition', static: true },
        { type: 'PropertyDefinition', static: false },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report class with mixed static and instance members', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration(makeStaticClassDecl([
        { type: 'MethodDefinition', static: true, kind: 'method' },
        { type: 'MethodDefinition', static: false, kind: 'method' },
        { type: 'PropertyDefinition', static: true },
        { type: 'PropertyDefinition', static: false },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report empty class body', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration(makeStaticClassDecl([]))
      expect(reports.length).toBe(0)
    })

    test('handles null node gracefully for ClassDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      expect(() => visitor.ClassDeclaration(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles undefined node gracefully for ClassDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      expect(() => visitor.ClassDeclaration(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles null node gracefully for ClassExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      expect(() => visitor.ClassExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles undefined node gracefully for ClassExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      expect(() => visitor.ClassExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclarator node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.ClassDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 3, 1),
      }
      visitor.ClassDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when body is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration({
        type: 'ClassDeclaration',
        body: null,
        loc: makeLoc(1, 0, 3, 1),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when body.body is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration({
        type: 'ClassDeclaration',
        body: {},
        loc: makeLoc(1, 0, 3, 1),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when body.body is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration({
        type: 'ClassDeclaration',
        body: { body: null },
        loc: makeLoc(1, 0, 3, 1),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when body.body is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration({
        type: 'ClassDeclaration',
        body: { body: 'not-array' },
        loc: makeLoc(1, 0, 3, 1),
      })
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (string) for ClassDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      expect(() => visitor.ClassDeclaration('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (number) for ClassDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      expect(() => visitor.ClassDeclaration(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      expect(() => visitor.ClassDeclaration({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report class with instance getter', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration(makeStaticClassDecl([
        { type: 'MethodDefinition', static: true, kind: 'method' },
        { type: 'MethodDefinition', static: false, kind: 'get' },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report class with instance setter', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration(makeStaticClassDecl([
        { type: 'MethodDefinition', static: true, kind: 'method' },
        { type: 'MethodDefinition', static: false, kind: 'set' },
      ]))
      expect(reports.length).toBe(0)
    })

    test('reports class with only constructor (no static, no instance)', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration(makeStaticClassDecl([
        { type: 'MethodDefinition', static: false, kind: 'constructor' },
      ]))
      expect(reports.length).toBe(1)
    })

    test('does not report for ExpressionStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration({
        type: 'ExpressionStatement',
        expression: { type: 'Literal', value: 1 },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when member has static: undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration(makeStaticClassDecl([
        { type: 'MethodDefinition', static: undefined, kind: 'method' },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report when member has static: false', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration(makeStaticClassDecl([
        { type: 'MethodDefinition', static: false, kind: 'method' },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report for AssignmentExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 1 },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report class with instance method among static members', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration(makeStaticClassDecl([
        { type: 'MethodDefinition', static: true, kind: 'method' },
        { type: 'PropertyDefinition', static: true },
        { type: 'MethodDefinition', static: false, kind: 'method' },
      ]))
      expect(reports.length).toBe(0)
    })

    test('handles member that is null gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration(makeStaticClassDecl([
        { type: 'MethodDefinition', static: true, kind: 'method' },
        null,
      ]))
      expect(reports.length).toBe(1)
    })

    test('handles member that is undefined gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration(makeStaticClassDecl([
        { type: 'MethodDefinition', static: true, kind: 'method' },
        undefined,
      ]))
      expect(reports.length).toBe(1)
    })

    test('does not report for Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration({ type: 'Literal', value: 42 })
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'foo' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report class with member having static as string "true"', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration(makeStaticClassDecl([
        { type: 'MethodDefinition', static: 'true', kind: 'method' },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration({
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report class with only non-constructor, non-static first member', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration(makeStaticClassDecl([
        { type: 'MethodDefinition', static: false, kind: 'method' },
        { type: 'MethodDefinition', static: true, kind: 'method' },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report ClassExpression with instance member', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassExpression(makeStaticClassExpr([
        { type: 'MethodDefinition', static: true, kind: 'method' },
        { type: 'MethodDefinition', static: false, kind: 'method' },
      ]))
      expect(reports.length).toBe(0)
    })

    test('handles non-object node for ClassExpression (boolean)', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      expect(() => visitor.ClassExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration({
        type: 'ReturnStatement',
        argument: null,
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====
  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noStaticOnlyClassRule.create(ctx1)
      const visitor2 = noStaticOnlyClassRule.create(ctx2)

      visitor1.ClassDeclaration(makeStaticClassDecl())
      visitor2.ClassDeclaration(makeStaticClassDecl([
        { type: 'MethodDefinition', static: false, kind: 'method' },
      ]))

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration(makeStaticClassDecl())
      visitor.ClassDeclaration(makeStaticClassDecl())
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration({
        type: 'ClassDeclaration',
        body: { body: [{ type: 'MethodDefinition', static: true, kind: 'method' }] },
      })
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration({
        type: 'ClassDeclaration',
        body: { body: [{ type: 'MethodDefinition', static: true, kind: 'method' }] },
      })
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid and invalid classes report only violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration(makeStaticClassDecl())
      visitor.ClassDeclaration(makeStaticClassDecl([
        { type: 'MethodDefinition', static: false, kind: 'method' },
      ]))
      visitor.ClassDeclaration(makeStaticClassDecl())
      visitor.ClassExpression(makeStaticClassExpr([
        { type: 'MethodDefinition', static: false, kind: 'method' },
      ]))
      expect(reports.length).toBe(2)
    })

    test('class with constructor only still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration(makeStaticClassDecl([
        { type: 'MethodDefinition', static: false, kind: 'constructor' },
      ]))
      expect(reports.length).toBe(1)
    })

    test('class with constructor and static reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration(makeStaticClassDecl([
        { type: 'MethodDefinition', static: false, kind: 'constructor' },
        { type: 'MethodDefinition', static: true, kind: 'method' },
      ]))
      expect(reports.length).toBe(1)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration(makeStaticClassDecl())
      visitor.ClassDeclaration(makeStaticClassDecl())
      visitor.ClassDeclaration(makeStaticClassDecl())
      expect(reports.length).toBe(3)
    })

    test('create returns a new visitor each call (not same reference)', () => {
      const { context } = createMockContext()
      const visitor1 = noStaticOnlyClassRule.create(context)
      const visitor2 = noStaticOnlyClassRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('location with specific line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      const node = {
        type: 'ClassDeclaration',
        body: { body: [{ type: 'MethodDefinition', static: true, kind: 'method' }] },
        loc: makeLoc(10, 4, 15, 1),
      }
      visitor.ClassDeclaration(node)
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('class with only static members but body.body is empty array does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration({
        type: 'ClassDeclaration',
        body: { body: [] },
        loc: makeLoc(1, 0, 3, 1),
      })
      expect(reports.length).toBe(0)
    })

    test('ClassExpression with null id still reports when static-only', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassExpression({
        type: 'ClassExpression',
        id: null,
        body: { body: [{ type: 'MethodDefinition', static: true, kind: 'method' }] },
        loc: makeLoc(1, 0, 3, 1),
      })
      expect(reports.length).toBe(1)
    })

    test('class with member missing static property is treated as instance', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration(makeStaticClassDecl([
        { type: 'MethodDefinition', kind: 'method' },
      ]))
      expect(reports.length).toBe(0)
    })

    test('class with member missing kind property is treated as instance', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration(makeStaticClassDecl([
        { type: 'MethodDefinition', static: false },
      ]))
      expect(reports.length).toBe(0)
    })

    test('handles node with body but no body.body property', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration({
        type: 'ClassDeclaration',
        body: { type: 'ClassBody' },
        loc: makeLoc(1, 0, 3, 1),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== ADDITIONAL CASES (15) =====
  describe('additional coverage', () => {
    test('reports two violations with identical messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration(makeStaticClassDecl())
      visitor.ClassExpression(makeStaticClassExpr())
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('all violation messages are identical for the same rule', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration(makeStaticClassDecl())
      visitor.ClassDeclaration(makeStaticClassDecl([
        { type: 'PropertyDefinition', static: true },
      ]))
      visitor.ClassDeclaration(makeStaticClassDecl([
        { type: 'MethodDefinition', static: true, kind: 'method' },
        { type: 'MethodDefinition', static: false, kind: 'constructor' },
      ]))
      const messages = reports.map(r => r.message)
      expect(new Set(messages).size).toBe(1)
    })

    test('rule meta is same reference across multiple accesses', () => {
      const meta1 = noStaticOnlyClassRule.meta
      const meta2 = noStaticOnlyClassRule.meta
      expect(meta1).toBe(meta2)
    })

    test('rule name is exported as noStaticOnlyClassRule', () => {
      expect(noStaticOnlyClassRule).toBeDefined()
      expect(typeof noStaticOnlyClassRule.create).toBe('function')
      expect(typeof noStaticOnlyClassRule.meta).toBe('object')
    })

    test('message mentions "module"', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration(makeStaticClassDecl())
      expect(reports[0].message.toLowerCase()).toContain('module')
    })

    test('does not report class with only instance members', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration(makeStaticClassDecl([
        { type: 'MethodDefinition', static: false, kind: 'method' },
        { type: 'PropertyDefinition', static: false },
      ]))
      expect(reports.length).toBe(0)
    })

    test('class expression assigned to variable reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassExpression({
        type: 'ClassExpression',
        id: { type: 'Identifier', name: 'Foo' },
        body: { body: [{ type: 'MethodDefinition', static: true, kind: 'method' }] },
        loc: makeLoc(1, 6, 3, 2),
      })
      expect(reports.length).toBe(1)
    })

    test('class with static: 1 (truthy but not true) does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration(makeStaticClassDecl([
        { type: 'MethodDefinition', static: 1, kind: 'method' },
      ]))
      expect(reports.length).toBe(0)
    })

    test('class with kind: "Constructor" (capital C) does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration(makeStaticClassDecl([
        { type: 'MethodDefinition', static: false, kind: 'Constructor' },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report class with mixed members via ClassExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassExpression(makeStaticClassExpr([
        { type: 'MethodDefinition', static: true, kind: 'method' },
        { type: 'PropertyDefinition', static: false },
      ]))
      expect(reports.length).toBe(0)
    })

    test('report descriptor has all three properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration(makeStaticClassDecl())
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('class with StaticBlockMember does not affect rule', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration(makeStaticClassDecl([
        { type: 'StaticBlock', static: true },
        { type: 'MethodDefinition', static: true, kind: 'method' },
      ]))
      expect(reports.length).toBe(1)
    })

    test('handles boolean node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      expect(() => visitor.ClassDeclaration(false)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report class with accessor (kind not constructor)', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration(makeStaticClassDecl([
        { type: 'MethodDefinition', static: false, kind: 'accessor' },
      ]))
      expect(reports.length).toBe(0)
    })

    test('reports class with only TsPropertySignature static members', () => {
      const { context, reports } = createMockContext()
      const visitor = noStaticOnlyClassRule.create(context)
      visitor.ClassDeclaration(makeStaticClassDecl([
        { type: 'TSPropertySignature', static: true, kind: 'property' },
      ]))
      expect(reports.length).toBe(1)
    })
  })
})
