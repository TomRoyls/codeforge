import { describe, expect, test, vi } from 'vitest'
import { noPlusplusRule } from '../../../../src/rules/patterns/no-plusplus.js'
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
    getSource: () => 'i++',
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

function makeUpdateNode(
  operator: string,
  prefix: boolean,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 3,
): unknown {
  return {
    type: 'UpdateExpression',
    operator,
    prefix,
    argument: { type: 'Identifier', name: 'i' },
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

describe('no-plusplus rule', () => {
  // ===== META TESTS (8) =====

  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noPlusplusRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noPlusplusRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noPlusplusRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noPlusplusRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noPlusplusRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning ++ or --', () => {
      const desc = noPlusplusRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/\+\+|--/)
    })

    test('should have correct docs URL', () => {
      expect(noPlusplusRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-plusplus',
      )
    })

    test('should have empty schema', () => {
      expect(noPlusplusRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with UpdateExpression', () => {
      const { context } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      expect(visitor).toHaveProperty('UpdateExpression')
      expect(typeof visitor.UpdateExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noPlusplusRule).toBeDefined()
      expect(noPlusplusRule.meta).toBeDefined()
      expect(noPlusplusRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — POSTFIX ++ (10) =====

  describe('positive cases — postfix ++', () => {
    test('reports for postfix i++', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression(makeUpdateNode('++', false))
      expect(reports.length).toBe(1)
    })

    test('postfix ++ message mentions postfix', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression(makeUpdateNode('++', false))
      expect(reports[0].message).toContain('postfix')
    })

    test('postfix ++ message mentions ++ operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression(makeUpdateNode('++', false))
      expect(reports[0].message).toContain('++')
    })

    test('postfix ++ message suggests += 1', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression(makeUpdateNode('++', false))
      expect(reports[0].message).toContain('+= 1')
    })

    test('postfix ++ report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression(makeUpdateNode('++', false))
      expect(reports[0].loc).toBeDefined()
    })

    test('postfix ++ report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression(makeUpdateNode('++', false))
      expect(reports[0].node).toBeDefined()
    })

    test('postfix ++ report node matches input node', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      const node = makeUpdateNode('++', false)
      visitor.UpdateExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('postfix ++ message is exactly as defined', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression(makeUpdateNode('++', false))
      expect(reports[0].message).toBe(
        "Unexpected postfix '++' operator. Use '+= 1' instead.",
      )
    })

    test('postfix ++ report loc reflects node location', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression(makeUpdateNode('++', false, 5, 10, 5, 13))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('postfix ++ report loc end is preserved', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression(makeUpdateNode('++', false, 2, 4, 2, 7))
      expect(reports[0].loc?.end.line).toBe(2)
      expect(reports[0].loc?.end.column).toBe(7)
    })
  })

  // ===== POSITIVE CASES — PREFIX ++ (10) =====

  describe('positive cases — prefix ++', () => {
    test('reports for prefix ++i', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression(makeUpdateNode('++', true))
      expect(reports.length).toBe(1)
    })

    test('prefix ++ message mentions prefix', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression(makeUpdateNode('++', true))
      expect(reports[0].message).toContain('prefix')
    })

    test('prefix ++ message mentions ++ operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression(makeUpdateNode('++', true))
      expect(reports[0].message).toContain('++')
    })

    test('prefix ++ message suggests += 1', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression(makeUpdateNode('++', true))
      expect(reports[0].message).toContain('+= 1')
    })

    test('prefix ++ message is exactly as defined', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression(makeUpdateNode('++', true))
      expect(reports[0].message).toBe(
        "Unexpected prefix '++' operator. Use '+= 1' instead.",
      )
    })

    test('prefix ++ report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression(makeUpdateNode('++', true))
      expect(reports[0].loc).toBeDefined()
    })

    test('prefix ++ report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression(makeUpdateNode('++', true))
      expect(reports[0].node).toBeDefined()
    })

    test('prefix ++ report node matches input node', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      const node = makeUpdateNode('++', true)
      visitor.UpdateExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('prefix ++ report loc values preserved', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression(makeUpdateNode('++', true, 3, 5, 3, 8))
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('prefix ++ report loc end preserved', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression(makeUpdateNode('++', true, 7, 1, 7, 4))
      expect(reports[0].loc?.end.line).toBe(7)
      expect(reports[0].loc?.end.column).toBe(4)
    })
  })

  // ===== POSITIVE CASES — POSTFIX -- (8) =====

  describe('positive cases — postfix --', () => {
    test('reports for postfix i--', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression(makeUpdateNode('--', false))
      expect(reports.length).toBe(1)
    })

    test('postfix -- message mentions postfix', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression(makeUpdateNode('--', false))
      expect(reports[0].message).toContain('postfix')
    })

    test('postfix -- message mentions -- operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression(makeUpdateNode('--', false))
      expect(reports[0].message).toContain('--')
    })

    test('postfix -- message suggests -= 1', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression(makeUpdateNode('--', false))
      expect(reports[0].message).toContain('-= 1')
    })

    test('postfix -- message is exactly as defined', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression(makeUpdateNode('--', false))
      expect(reports[0].message).toBe(
        "Unexpected postfix '--' operator. Use '-= 1' instead.",
      )
    })

    test('postfix -- report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression(makeUpdateNode('--', false))
      expect(reports[0].loc).toBeDefined()
    })

    test('postfix -- report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression(makeUpdateNode('--', false))
      expect(reports[0].node).toBeDefined()
    })

    test('postfix -- report node matches input node', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      const node = makeUpdateNode('--', false)
      visitor.UpdateExpression(node)
      expect(reports[0].node).toBe(node)
    })
  })

  // ===== POSITIVE CASES — PREFIX -- (8) =====

  describe('positive cases — prefix --', () => {
    test('reports for prefix --i', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression(makeUpdateNode('--', true))
      expect(reports.length).toBe(1)
    })

    test('prefix -- message mentions prefix', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression(makeUpdateNode('--', true))
      expect(reports[0].message).toContain('prefix')
    })

    test('prefix -- message mentions -- operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression(makeUpdateNode('--', true))
      expect(reports[0].message).toContain('--')
    })

    test('prefix -- message suggests -= 1', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression(makeUpdateNode('--', true))
      expect(reports[0].message).toContain('-= 1')
    })

    test('prefix -- message is exactly as defined', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression(makeUpdateNode('--', true))
      expect(reports[0].message).toBe(
        "Unexpected prefix '--' operator. Use '-= 1' instead.",
      )
    })

    test('prefix -- report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression(makeUpdateNode('--', true))
      expect(reports[0].loc).toBeDefined()
    })

    test('prefix -- report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression(makeUpdateNode('--', true))
      expect(reports[0].node).toBeDefined()
    })

    test('prefix -- report node matches input node', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      const node = makeUpdateNode('--', true)
      visitor.UpdateExpression(node)
      expect(reports[0].node).toBe(node)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (30) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      expect(() => visitor.UpdateExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      expect(() => visitor.UpdateExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression({})
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      expect(() => visitor.UpdateExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      expect(() => visitor.UpdateExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      expect(() => visitor.UpdateExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      expect(() => visitor.UpdateExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression({ type: 'Literal', value: 42, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression({ type: 'MemberExpression', object: {}, property: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for AssignmentExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression({ type: 'AssignmentExpression', operator: '+=', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrowFunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression({ type: 'ExpressionStatement', expression: {}, loc: makeLoc(1, 0, 1, 1) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BlockStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression({ type: 'BlockStatement', body: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ObjectExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression({ type: 'ObjectExpression', properties: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrayExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression({ type: 'ArrayExpression', elements: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ConditionalExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression({ type: 'ConditionalExpression', test: {}, consequent: {}, alternate: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UpdateExpression with operator !== ++ or --', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression({ type: 'UpdateExpression', operator: '!', prefix: false, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UpdateExpression with operator +', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression({ type: 'UpdateExpression', operator: '+', prefix: false, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UpdateExpression with operator -', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression({ type: 'UpdateExpression', operator: '-', prefix: false, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UpdateExpression with missing operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression({ type: 'UpdateExpression', prefix: false, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UpdateExpression with null operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression({ type: 'UpdateExpression', operator: null, prefix: false, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UpdateExpression with number operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression({ type: 'UpdateExpression', operator: 1, prefix: false, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (19) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noPlusplusRule.create(ctx1)
      const visitor2 = noPlusplusRule.create(ctx2)
      visitor1.UpdateExpression(makeUpdateNode('++', false))
      visitor2.UpdateExpression({ type: 'Identifier', name: 'x', loc: makeLoc(1, 0, 1, 1) })
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression(makeUpdateNode('++', false))
      visitor.UpdateExpression(makeUpdateNode('--', true))
      visitor.UpdateExpression(makeUpdateNode('++', true))
      expect(reports.length).toBe(3)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      const node = { type: 'UpdateExpression', operator: '++', prefix: false, argument: { type: 'Identifier', name: 'x' } }
      visitor.UpdateExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      const node = { type: 'UpdateExpression', operator: '++', prefix: false, argument: { type: 'Identifier', name: 'x' } }
      visitor.UpdateExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression(makeUpdateNode('++', false))
      visitor.UpdateExpression({ type: 'Identifier', name: 'x', loc: makeLoc(1, 0, 1, 1) })
      visitor.UpdateExpression(makeUpdateNode('--', false))
      visitor.UpdateExpression({ type: 'Literal', value: 1, loc: makeLoc(1, 0, 1, 1) })
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noPlusplusRule.create(context)
      const visitor2 = noPlusplusRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noPlusplusRule.meta
      const meta2 = noPlusplusRule.meta
      expect(meta1).toBe(meta2)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression(makeUpdateNode('++', false))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      const node = {
        type: 'UpdateExpression',
        operator: '++',
        prefix: false,
        argument: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 3),
        range: [0, 3],
        extra: true,
        _parent: {},
      }
      visitor.UpdateExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression({ type: 'UpdateExpression', operator: '++', prefix: false, argument: {}, loc: {} })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc missing end', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression({ type: 'UpdateExpression', operator: '++', prefix: false, argument: {}, loc: { start: { line: 3, column: 5 } } })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      const node = makeUpdateNode('++', false)
      visitor.UpdateExpression(node)
      visitor.UpdateExpression(node)
      visitor.UpdateExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noPlusplusRule).toBeDefined()
      expect(typeof noPlusplusRule.create).toBe('function')
      expect(typeof noPlusplusRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression({
        type: 'UpdateExpression',
        operator: '--',
        prefix: true,
        argument: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 3),
        _parent: { type: 'ExpressionStatement' },
      })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression(makeUpdateNode('++', false))
      visitor.UpdateExpression(makeUpdateNode('--', true))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('postfix')
      expect(reports[1].message).toContain('prefix')
    })

    test('all postfix ++ reports have same message', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression(makeUpdateNode('++', false))
      visitor.UpdateExpression(makeUpdateNode('++', false, 5, 0, 5, 3))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('all prefix -- reports have same message', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression(makeUpdateNode('--', true))
      visitor.UpdateExpression(makeUpdateNode('--', true, 10, 2, 10, 5))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression(makeUpdateNode('++', false, 10, 4, 10, 7))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(7)
    })

    test('handles node with UpdateExpression type but operator as array', () => {
      const { context, reports } = createMockContext()
      const visitor = noPlusplusRule.create(context)
      visitor.UpdateExpression({ type: 'UpdateExpression', operator: ['++'], prefix: false, argument: {}, loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })
  })
})
