import { describe, expect, test, vi } from 'vitest'
import { noMixedEnumsRule } from '../../../../src/rules/patterns/no-mixed-enums.js'
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
    getSource: () => 'enum Foo { A, B = 1 }',
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

function makeEnumDecl(members: Array<Record<string, unknown>>, line = 1, col = 0): unknown {
  return {
    type: 'TSEnumDeclaration',
    id: { type: 'Identifier', name: 'MyEnum' },
    body: { type: 'TSEnumBody', members },
    loc: makeLoc(line, col, line, col + 20),
  }
}

function implicitMember(name: string): Record<string, unknown> {
  return { type: 'TSEnumMember', id: { type: 'Identifier', name }, initializer: null }
}

function explicitMember(name: string, value: unknown = 1): Record<string, unknown> {
  return { type: 'TSEnumMember', id: { type: 'Identifier', name }, initializer: { type: 'NumericLiteral', value } }
}

describe('no-mixed-enums rule', () => {
  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noMixedEnumsRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noMixedEnumsRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noMixedEnumsRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noMixedEnumsRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noMixedEnumsRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning enum and mixed', () => {
      const desc = noMixedEnumsRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/enum/)
      expect(desc).toMatch(/mixed/)
    })

    test('should have correct docs URL', () => {
      expect(noMixedEnumsRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-mixed-enums',
      )
    })

    test('should have empty schema', () => {
      expect(noMixedEnumsRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====
  describe('structure', () => {
    test('create() returns visitor with TSEnumDeclaration', () => {
      const { context } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      expect(visitor).toHaveProperty('TSEnumDeclaration')
      expect(typeof visitor.TSEnumDeclaration).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noMixedEnumsRule).toBeDefined()
      expect(noMixedEnumsRule.meta).toBeDefined()
      expect(noMixedEnumsRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — reports mixed enums (20) =====
  describe('positive cases — reports mixed implicit and explicit', () => {
    test('reports enum with one implicit and one explicit member', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      visitor.TSEnumDeclaration(makeEnumDecl([implicitMember('A'), explicitMember('B')]))
      expect(reports.length).toBe(1)
    })

    test('reports enum with two implicit and one explicit member', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      visitor.TSEnumDeclaration(makeEnumDecl([implicitMember('A'), implicitMember('B'), explicitMember('C')]))
      expect(reports.length).toBe(1)
    })

    test('reports enum with one implicit and two explicit members', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      visitor.TSEnumDeclaration(makeEnumDecl([implicitMember('A'), explicitMember('B'), explicitMember('C')]))
      expect(reports.length).toBe(1)
    })

    test('message contains "mixed"', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      visitor.TSEnumDeclaration(makeEnumDecl([implicitMember('A'), explicitMember('B')]))
      expect(reports[0].message.toLowerCase()).toContain('mixed')
    })

    test('message contains "implicit"', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      visitor.TSEnumDeclaration(makeEnumDecl([implicitMember('A'), explicitMember('B')]))
      expect(reports[0].message.toLowerCase()).toContain('implicit')
    })

    test('message contains "explicit"', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      visitor.TSEnumDeclaration(makeEnumDecl([implicitMember('A'), explicitMember('B')]))
      expect(reports[0].message.toLowerCase()).toContain('explicit')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      visitor.TSEnumDeclaration(makeEnumDecl([implicitMember('A'), explicitMember('B')]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      visitor.TSEnumDeclaration(makeEnumDecl([implicitMember('A'), explicitMember('B')]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches original node passed in', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      const node = makeEnumDecl([implicitMember('A'), explicitMember('B')])
      visitor.TSEnumDeclaration(node)
      expect(reports[0].node).toBe(node)
    })

    test('reports when explicit comes before implicit', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      visitor.TSEnumDeclaration(makeEnumDecl([explicitMember('A'), implicitMember('B')]))
      expect(reports.length).toBe(1)
    })

    test('reports with many mixed members', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      visitor.TSEnumDeclaration(makeEnumDecl([
        implicitMember('A'), explicitMember('B'), implicitMember('C'), explicitMember('D'),
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports with correct location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      visitor.TSEnumDeclaration(makeEnumDecl([implicitMember('A'), explicitMember('B')], 5, 8))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('reports only once per mixed enum', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      visitor.TSEnumDeclaration(makeEnumDecl([implicitMember('A'), explicitMember('B')]))
      expect(reports.length).toBe(1)
    })

    test('accumulates reports across multiple mixed enums', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      visitor.TSEnumDeclaration(makeEnumDecl([implicitMember('A'), explicitMember('B')]))
      visitor.TSEnumDeclaration(makeEnumDecl([implicitMember('X'), explicitMember('Y')]))
      expect(reports.length).toBe(2)
    })

    test('reports when initializer is undefined (not null)', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      const node = makeEnumDecl([
        { type: 'TSEnumMember', id: { type: 'Identifier', name: 'A' } },
        explicitMember('B'),
      ])
      visitor.TSEnumDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('reports when first member has no initializer property at all', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      const node = makeEnumDecl([
        { type: 'TSEnumMember', id: { type: 'Identifier', name: 'A' } } as Record<string, unknown>,
        explicitMember('B'),
      ])
      visitor.TSEnumDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('reports with initializer as string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      visitor.TSEnumDeclaration(makeEnumDecl([
        implicitMember('A'),
        { type: 'TSEnumMember', id: { type: 'Identifier', name: 'B' }, initializer: { type: 'StringLiteral', value: 'hello' } },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports with initializer as computed expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      visitor.TSEnumDeclaration(makeEnumDecl([
        implicitMember('A'),
        { type: 'TSEnumMember', id: { type: 'Identifier', name: 'B' }, initializer: { type: 'BinaryExpression', operator: '+' } },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports enum with explicit member initialized to zero', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      visitor.TSEnumDeclaration(makeEnumDecl([
        implicitMember('A'),
        explicitMember('B', 0),
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports enum with explicit member initialized to empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      visitor.TSEnumDeclaration(makeEnumDecl([
        implicitMember('A'),
        { type: 'TSEnumMember', id: { type: 'Identifier', name: 'B' }, initializer: { type: 'StringLiteral', value: '' } },
      ]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — does NOT report (35) =====
  describe('negative cases — does NOT report', () => {
    test('does not report null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      expect(() => visitor.TSEnumDeclaration(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      expect(() => visitor.TSEnumDeclaration(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report empty object — wrong type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      expect(() => visitor.TSEnumDeclaration({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      const node = { type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) }
      visitor.TSEnumDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('does not report Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      const node = { type: 'Literal', value: 42, loc: makeLoc(1, 0, 1, 2) }
      visitor.TSEnumDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('does not report TSEnumDeclaration with single implicit member', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      visitor.TSEnumDeclaration(makeEnumDecl([implicitMember('A')]))
      expect(reports.length).toBe(0)
    })

    test('does not report TSEnumDeclaration with single explicit member', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      visitor.TSEnumDeclaration(makeEnumDecl([explicitMember('A')]))
      expect(reports.length).toBe(0)
    })

    test('does not report enum with all implicit members', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      visitor.TSEnumDeclaration(makeEnumDecl([implicitMember('A'), implicitMember('B'), implicitMember('C')]))
      expect(reports.length).toBe(0)
    })

    test('does not report enum with all explicit members', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      visitor.TSEnumDeclaration(makeEnumDecl([explicitMember('A'), explicitMember('B'), explicitMember('C')]))
      expect(reports.length).toBe(0)
    })

    test('does not report enum with empty members array', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      visitor.TSEnumDeclaration(makeEnumDecl([]))
      expect(reports.length).toBe(0)
    })

    test('does not report when members is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      const node = { type: 'TSEnumDeclaration', id: { type: 'Identifier', name: 'E' }, members: 'not-array', loc: makeLoc(1, 0, 1, 5) }
      visitor.TSEnumDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when members is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      const node = { type: 'TSEnumDeclaration', id: { type: 'Identifier', name: 'E' }, members: null, loc: makeLoc(1, 0, 1, 5) }
      visitor.TSEnumDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when members is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      const node = { type: 'TSEnumDeclaration', id: { type: 'Identifier', name: 'E' }, loc: makeLoc(1, 0, 1, 5) }
      visitor.TSEnumDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('does not report BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      const node = { type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) }
      visitor.TSEnumDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('does not report CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      const node = { type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) }
      visitor.TSEnumDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('does not report MemberExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      const node = { type: 'MemberExpression', object: {}, property: {}, loc: makeLoc(1, 0, 1, 8) }
      visitor.TSEnumDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('does not report FunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      const node = { type: 'FunctionExpression', id: {}, params: [], body: {}, loc: makeLoc(1, 0, 1, 20) }
      visitor.TSEnumDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('does not report ArrowFunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      const node = { type: 'ArrowFunctionExpression', params: [], body: {}, loc: makeLoc(1, 0, 1, 15) }
      visitor.TSEnumDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('does not report VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      const node = { type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) }
      visitor.TSEnumDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('does not report ExpressionStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      const node = { type: 'ExpressionStatement', expression: {}, loc: makeLoc(1, 0, 1, 1) }
      visitor.TSEnumDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('does not report BlockStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      const node = { type: 'BlockStatement', body: [], loc: makeLoc(1, 0, 1, 2) }
      visitor.TSEnumDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('does not report ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      const node = { type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) }
      visitor.TSEnumDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('does not report IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      const node = { type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) }
      visitor.TSEnumDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('does not report AssignmentExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      const node = { type: 'AssignmentExpression', operator: '=', left: {}, right: {}, loc: makeLoc(1, 0, 1, 10) }
      visitor.TSEnumDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('does not report UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      const node = { type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) }
      visitor.TSEnumDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('does not report ObjectExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      const node = { type: 'ObjectExpression', properties: [], loc: makeLoc(1, 0, 1, 2) }
      visitor.TSEnumDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('does not report ArrayExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      const node = { type: 'ArrayExpression', elements: [], loc: makeLoc(1, 0, 1, 2) }
      visitor.TSEnumDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('does not report ConditionalExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      const node = { type: 'ConditionalExpression', test: {}, consequent: {}, alternate: {}, loc: makeLoc(1, 0, 1, 15) }
      visitor.TSEnumDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('does not report NewExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      const node = { type: 'NewExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 8) }
      visitor.TSEnumDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for non-object node (string primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      expect(() => visitor.TSEnumDeclaration('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for non-object node (number primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      expect(() => visitor.TSEnumDeclaration(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report TSEnumDeclaration with no members property', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      const node = { type: 'TSEnumDeclaration', id: { type: 'Identifier', name: 'E' }, loc: makeLoc(1, 0, 1, 5) }
      visitor.TSEnumDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when members contain non-object entries (null)', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      visitor.TSEnumDeclaration(makeEnumDecl([null as unknown as Record<string, unknown>, explicitMember('A')]))
      expect(reports.length).toBe(0)
    })

    test('does not report when members contain non-object entries (string)', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      visitor.TSEnumDeclaration(makeEnumDecl(['bad' as unknown as Record<string, unknown>, explicitMember('A')]))
      expect(reports.length).toBe(0)
    })

    test('does not report when member initializer is false (not null/undefined)', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      visitor.TSEnumDeclaration(makeEnumDecl([
        { type: 'TSEnumMember', id: { type: 'Identifier', name: 'A' }, initializer: false },
        { type: 'TSEnumMember', id: { type: 'Identifier', name: 'B' }, initializer: null },
      ]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== EDGE CASES (15) =====
  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noMixedEnumsRule.create(ctx1)
      const visitor2 = noMixedEnumsRule.create(ctx2)
      visitor1.TSEnumDeclaration(makeEnumDecl([implicitMember('A'), explicitMember('B')]))
      visitor2.TSEnumDeclaration(makeEnumDecl([implicitMember('X'), implicitMember('Y')]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      const node = {
        type: 'TSEnumDeclaration',
        id: { type: 'Identifier', name: 'MyEnum' },
        members: [implicitMember('A'), explicitMember('B')],
      }
      visitor.TSEnumDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      const node = {
        type: 'TSEnumDeclaration',
        id: { type: 'Identifier', name: 'MyEnum' },
        members: [implicitMember('A'), explicitMember('B')],
      }
      visitor.TSEnumDeclaration(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      const node = {
        type: 'TSEnumDeclaration',
        id: { type: 'Identifier', name: 'MyEnum' },
        members: [implicitMember('A'), explicitMember('B')],
        loc: {},
      }
      visitor.TSEnumDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      const node = {
        type: 'TSEnumDeclaration',
        id: { type: 'Identifier', name: 'MyEnum' },
        members: [implicitMember('A'), explicitMember('B')],
        loc: { start: { line: 3, column: 5 } },
      }
      visitor.TSEnumDeclaration(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      const node = {
        type: 'TSEnumDeclaration',
        id: { type: 'Identifier', name: 'MyEnum' },
        members: [implicitMember('A'), explicitMember('B')],
        loc: makeLoc(1, 0, 1, 20),
        range: [0, 20],
        extra: true,
        parent: {},
      }
      visitor.TSEnumDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      visitor.TSEnumDeclaration(makeEnumDecl([implicitMember('A'), implicitMember('B')]))
      visitor.TSEnumDeclaration(makeEnumDecl([implicitMember('A'), explicitMember('B')]))
      visitor.TSEnumDeclaration(makeEnumDecl([explicitMember('A'), explicitMember('B')]))
      visitor.TSEnumDeclaration(makeEnumDecl([implicitMember('X'), explicitMember('Y')]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call (not same reference)', () => {
      const { context } = createMockContext()
      const visitor1 = noMixedEnumsRule.create(context)
      const visitor2 = noMixedEnumsRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('location with specific line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      visitor.TSEnumDeclaration(makeEnumDecl([implicitMember('A'), explicitMember('B')], 10, 4))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('does not report enum with exactly 2 all-implicit members', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      visitor.TSEnumDeclaration(makeEnumDecl([implicitMember('A'), implicitMember('B')]))
      expect(reports.length).toBe(0)
    })

    test('does not report enum with exactly 2 all-explicit members', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      visitor.TSEnumDeclaration(makeEnumDecl([explicitMember('A'), explicitMember('B')]))
      expect(reports.length).toBe(0)
    })

    test('enum with many members all implicit is not reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      visitor.TSEnumDeclaration(makeEnumDecl([
        implicitMember('A'), implicitMember('B'), implicitMember('C'),
        implicitMember('D'), implicitMember('E'),
      ]))
      expect(reports.length).toBe(0)
    })

    test('enum with many members all explicit is not reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      visitor.TSEnumDeclaration(makeEnumDecl([
        explicitMember('A', 1), explicitMember('B', 2), explicitMember('C', 3),
        explicitMember('D', 4), explicitMember('E', 5),
      ]))
      expect(reports.length).toBe(0)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      visitor.TSEnumDeclaration(makeEnumDecl([implicitMember('A'), explicitMember('B')]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('message is exactly as defined in the rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      visitor.TSEnumDeclaration(makeEnumDecl([implicitMember('A'), explicitMember('B')]))
      expect(reports[0].message).toBe(
        'Enum has mixed implicit and explicit member values. Use either all explicit or all implicit values for consistency.',
      )
    })
  })

  // ===== ADDITIONAL COVERAGE (15) =====
  describe('additional coverage', () => {
    test('reports two mixed enums with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      visitor.TSEnumDeclaration(makeEnumDecl([implicitMember('A'), explicitMember('B')]))
      visitor.TSEnumDeclaration(makeEnumDecl([implicitMember('X'), explicitMember('Y')]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('all reports follow same message pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      visitor.TSEnumDeclaration(makeEnumDecl([implicitMember('A'), explicitMember('B')]))
      visitor.TSEnumDeclaration(makeEnumDecl([explicitMember('P'), implicitMember('Q')]))
      for (const r of reports) {
        expect(r.message).toContain('mixed implicit and explicit')
      }
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noMixedEnumsRule.meta
      const meta2 = noMixedEnumsRule.meta
      expect(meta1).toBe(meta2)
    })

    test('rule name is exported as noMixedEnumsRule', () => {
      expect(noMixedEnumsRule).toBeDefined()
      expect(typeof noMixedEnumsRule.create).toBe('function')
      expect(typeof noMixedEnumsRule.meta).toBe('object')
    })

    test('multiple same mixed enums report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      visitor.TSEnumDeclaration(makeEnumDecl([implicitMember('A'), explicitMember('B')]))
      visitor.TSEnumDeclaration(makeEnumDecl([implicitMember('A'), explicitMember('B')]))
      visitor.TSEnumDeclaration(makeEnumDecl([implicitMember('A'), explicitMember('B')]))
      expect(reports.length).toBe(3)
    })

    test('handles node with only type and members (minimal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      const node = {
        type: 'TSEnumDeclaration',
        members: [implicitMember('A'), explicitMember('B')],
      }
      visitor.TSEnumDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('reports enum with initializer as object (truthy)', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      visitor.TSEnumDeclaration(makeEnumDecl([
        implicitMember('A'),
        { type: 'TSEnumMember', id: { type: 'Identifier', name: 'B' }, initializer: {} },
      ]))
      expect(reports.length).toBe(1)
    })

    test('does not report when both members have initializer set to zero', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      visitor.TSEnumDeclaration(makeEnumDecl([
        explicitMember('A', 0),
        explicitMember('B', 0),
      ]))
      expect(reports.length).toBe(0)
    })

    test('reports mixed enum with five members', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      visitor.TSEnumDeclaration(makeEnumDecl([
        implicitMember('A'), implicitMember('B'), implicitMember('C'),
        explicitMember('D'), explicitMember('E'),
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports when only one member is implicit among many explicit', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      visitor.TSEnumDeclaration(makeEnumDecl([
        explicitMember('A'), explicitMember('B'), explicitMember('C'), implicitMember('D'),
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports when only one member is explicit among many implicit', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      visitor.TSEnumDeclaration(makeEnumDecl([
        implicitMember('A'), implicitMember('B'), implicitMember('C'), explicitMember('D'),
      ]))
      expect(reports.length).toBe(1)
    })

    test('visitor accumulates reports correctly with mixed valid and invalid', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      visitor.TSEnumDeclaration(makeEnumDecl([implicitMember('A'), implicitMember('B')]))
      visitor.TSEnumDeclaration(makeEnumDecl([implicitMember('A'), explicitMember('B')]))
      visitor.TSEnumDeclaration(makeEnumDecl([explicitMember('A'), explicitMember('B')]))
      expect(reports.length).toBe(1)
    })

    test('handles node with members containing only null initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      visitor.TSEnumDeclaration(makeEnumDecl([
        { type: 'TSEnumMember', id: { type: 'Identifier', name: 'A' }, initializer: null },
        { type: 'TSEnumMember', id: { type: 'Identifier', name: 'B' }, initializer: null },
      ]))
      expect(reports.length).toBe(0)
    })

    test('handles large mixed enum with alternating members', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      visitor.TSEnumDeclaration(makeEnumDecl([
        implicitMember('A'), explicitMember('B'), implicitMember('C'),
        explicitMember('D'), implicitMember('E'), explicitMember('F'),
      ]))
      expect(reports.length).toBe(1)
    })

    test('does not report TsTypeAliasDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedEnumsRule.create(context)
      const node = { type: 'TsTypeAliasDeclaration', id: {}, typeAnnotation: {}, loc: makeLoc(1, 0, 1, 10) }
      visitor.TSEnumDeclaration(node)
      expect(reports.length).toBe(0)
    })
  })
})
