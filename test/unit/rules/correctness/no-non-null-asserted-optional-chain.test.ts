import { describe, expect, test, vi } from 'vitest'
import { noNonNullAssertedOptionalChainRule } from '../../../../src/rules/correctness/no-non-null-asserted-optional-chain.js'
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
    getSource: () => 'obj?.foo!',
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

function makeOptionalCallNode(line = 1, column = 0): unknown {
  return {
    type: 'TSNonNullExpression',
    expression: {
      type: 'OptionalCallExpression',
      callee: { type: 'Identifier', name: 'fn' },
      arguments: [],
      optional: true,
    },
    loc: makeLoc(line, column, line, column + 10),
  }
}

function makeOptionalMemberNode(line = 1, column = 0): unknown {
  return {
    type: 'TSNonNullExpression',
    expression: {
      type: 'OptionalMemberExpression',
      object: { type: 'Identifier', name: 'obj' },
      property: { type: 'Identifier', name: 'prop' },
      optional: true,
    },
    loc: makeLoc(line, column, line, column + 10),
  }
}

describe('no-non-null-asserted-optional-chain rule', () => {
  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noNonNullAssertedOptionalChainRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noNonNullAssertedOptionalChainRule.meta.severity).toBe('warn')
    })

    test('should have correct category "correctness"', () => {
      expect(noNonNullAssertedOptionalChainRule.meta.docs?.category).toBe('correctness')
    })

    test('should be recommended', () => {
      expect(noNonNullAssertedOptionalChainRule.meta.docs?.recommended).toBe(true)
    })

    test('should have a description', () => {
      expect(noNonNullAssertedOptionalChainRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning "optional chain" and "contradictory"', () => {
      const desc = noNonNullAssertedOptionalChainRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/optional/)
      expect(desc).toMatch(/chain/)
    })

    test('should have correct docs URL', () => {
      expect(noNonNullAssertedOptionalChainRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-non-null-asserted-optional-chain',
      )
    })

    test('should have empty schema', () => {
      expect(noNonNullAssertedOptionalChainRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====
  describe('structure', () => {
    test('create() returns visitor with TSNonNullExpression', () => {
      const { context } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      expect(visitor).toHaveProperty('TSNonNullExpression')
      expect(typeof visitor.TSNonNullExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noNonNullAssertedOptionalChainRule).toBeDefined()
      expect(noNonNullAssertedOptionalChainRule.meta).toBeDefined()
      expect(noNonNullAssertedOptionalChainRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES (20) =====
  describe('positive cases — reports non-null on optional chain', () => {
    test('reports OptionalCallExpression with non-null assertion', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      visitor.TSNonNullExpression(makeOptionalCallNode())
      expect(reports.length).toBe(1)
    })

    test('reports OptionalMemberExpression with non-null assertion', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      visitor.TSNonNullExpression(makeOptionalMemberNode())
      expect(reports.length).toBe(1)
    })

    test('message contains "Non-null assertion"', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      visitor.TSNonNullExpression(makeOptionalCallNode())
      expect(reports[0].message).toContain('Non-null assertion')
    })

    test('message contains "contradictory"', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      visitor.TSNonNullExpression(makeOptionalCallNode())
      expect(reports[0].message).toContain('contradictory')
    })

    test('message contains "optional chain"', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      visitor.TSNonNullExpression(makeOptionalCallNode())
      expect(reports[0].message.toLowerCase()).toContain('optional chain')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      visitor.TSNonNullExpression(makeOptionalCallNode())
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      visitor.TSNonNullExpression(makeOptionalCallNode())
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the original node passed in', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      const node = makeOptionalCallNode()
      visitor.TSNonNullExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('reports obj?.prop! — OptionalMemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'OptionalMemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'prop' },
          optional: true,
        },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports fn?.()! — OptionalCallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'OptionalCallExpression',
          callee: { type: 'Identifier', name: 'fn' },
          arguments: [],
          optional: true,
        },
        loc: makeLoc(1, 0, 1, 8),
      }
      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports chained optional member: obj?.a?.b!', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'OptionalMemberExpression',
          object: {
            type: 'OptionalMemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'a' },
            optional: true,
          },
          property: { type: 'Identifier', name: 'b' },
          optional: true,
        },
        loc: makeLoc(1, 0, 1, 12),
      }
      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports optional call with arguments: fn?.(arg)!', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'OptionalCallExpression',
          callee: { type: 'Identifier', name: 'fn' },
          arguments: [{ type: 'Identifier', name: 'arg' }],
          optional: true,
        },
        loc: makeLoc(1, 0, 1, 11),
      }
      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports with correct location line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      visitor.TSNonNullExpression(makeOptionalCallNode(5, 8))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(18)
    })

    test('reports multiple violations in same source', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      visitor.TSNonNullExpression(makeOptionalCallNode())
      visitor.TSNonNullExpression(makeOptionalMemberNode())
      visitor.TSNonNullExpression(makeOptionalCallNode())
      expect(reports.length).toBe(3)
    })

    test('reports each violation once per call', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      visitor.TSNonNullExpression(makeOptionalCallNode())
      expect(reports.length).toBe(1)
    })

    test('message mentions implies and asserts', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      visitor.TSNonNullExpression(makeOptionalCallNode())
      expect(reports[0].message.toLowerCase()).toContain('implies')
      expect(reports[0].message.toLowerCase()).toContain('asserts')
    })

    test('report for OptionalMemberExpression has correct node', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      const node = makeOptionalMemberNode()
      visitor.TSNonNullExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('reports obj?.method()! — OptionalCallExpression on member', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'OptionalCallExpression',
          callee: {
            type: 'OptionalMemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'method' },
            optional: true,
          },
          arguments: [],
          optional: true,
        },
        loc: makeLoc(1, 0, 1, 14),
      }
      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(1)
    })

    test('visitor accumulates reports across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      visitor.TSNonNullExpression(makeOptionalCallNode())
      visitor.TSNonNullExpression(makeOptionalMemberNode())
      visitor.TSNonNullExpression(makeOptionalCallNode())
      visitor.TSNonNullExpression(makeOptionalMemberNode())
      expect(reports.length).toBe(4)
    })

    test('reports optional member with computed property', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'OptionalMemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Literal', value: 'key' },
          optional: true,
          computed: true,
        },
        loc: makeLoc(1, 0, 1, 12),
      }
      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES (35) =====
  describe('negative cases — does NOT report', () => {
    test('does not report Identifier expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      const node = {
        type: 'TSNonNullExpression',
        expression: { type: 'Identifier', name: 'foo' },
        loc: makeLoc(1, 0, 1, 4),
      }
      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report CallExpression expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fn' },
          arguments: [],
        },
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report MemberExpression expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'prop' },
        },
        loc: makeLoc(1, 0, 1, 8),
      }
      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      expect(() => visitor.TSNonNullExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      expect(() => visitor.TSNonNullExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles empty object node — wrong type', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      expect(() => visitor.TSNonNullExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report null expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      const node = {
        type: 'TSNonNullExpression',
        expression: null,
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report undefined expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      const node = {
        type: 'TSNonNullExpression',
        expression: undefined,
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report wrong node type — Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      const node = { type: 'Literal', value: 42 }
      expect(() => visitor.TSNonNullExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report ArrowFunctionExpression expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'ArrowFunctionExpression',
          params: [],
          body: { type: 'Identifier', name: 'x' },
        },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report FunctionExpression expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'FunctionExpression',
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report BinaryExpression expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'BinaryExpression',
          operator: '+',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        },
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report UnaryExpression expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'UnaryExpression',
          operator: '!',
          argument: { type: 'Identifier', name: 'x' },
        },
        loc: makeLoc(1, 0, 1, 3),
      }
      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report ConditionalExpression expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'ConditionalExpression',
          test: { type: 'Identifier', name: 'x' },
          consequent: { type: 'Identifier', name: 'a' },
          alternate: { type: 'Identifier', name: 'b' },
        },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report LogicalExpression expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'LogicalExpression',
          operator: '&&',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        },
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report ObjectExpression expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'ObjectExpression',
          properties: [],
        },
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report ArrayExpression expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'ArrayExpression',
          elements: [],
        },
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report NewExpression expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'NewExpression',
          callee: { type: 'Identifier', name: 'Foo' },
          arguments: [],
        },
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report TemplateLiteral expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'TemplateLiteral',
          quasis: [],
          expressions: [],
        },
        loc: makeLoc(1, 0, 1, 8),
      }
      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report TaggedTemplateExpression expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'TaggedTemplateExpression',
          tag: { type: 'Identifier', name: 'html' },
          quasi: { type: 'TemplateLiteral', expressions: [] },
        },
        loc: makeLoc(1, 0, 1, 8),
      }
      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report SequenceExpression expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'SequenceExpression',
          expressions: [
            { type: 'Literal', value: 1 },
            { type: 'Literal', value: 2 },
          ],
        },
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report UpdateExpression expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'UpdateExpression',
          operator: '++',
          argument: { type: 'Identifier', name: 'x' },
          prefix: false,
        },
        loc: makeLoc(1, 0, 1, 4),
      }
      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report AwaitExpression expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'AwaitExpression',
          argument: { type: 'Identifier', name: 'promise' },
        },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report YieldExpression expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'YieldExpression',
          argument: { type: 'Identifier', name: 'value' },
        },
        loc: makeLoc(1, 0, 1, 8),
      }
      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report AssignmentExpression expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'AssignmentExpression',
          operator: '=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 1 },
        },
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report TSAsExpression expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'TSAsExpression',
          expression: { type: 'Identifier', name: 'x' },
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
        loc: makeLoc(1, 0, 1, 8),
      }
      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report TSTypeAssertion expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'TSTypeAssertion',
          expression: { type: 'Identifier', name: 'x' },
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
        loc: makeLoc(1, 0, 1, 8),
      }
      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report non-object node (string primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      expect(() => visitor.TSNonNullExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report non-object node (number primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      expect(() => visitor.TSNonNullExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report node with missing expression property', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      const node = {
        type: 'TSNonNullExpression',
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report ExpressionStatement expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'ExpressionStatement',
          expression: { type: 'Literal', value: 1 },
        },
        loc: makeLoc(1, 0, 1, 3),
      }
      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report ThisExpression expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      const node = {
        type: 'TSNonNullExpression',
        expression: { type: 'ThisExpression' },
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report SpreadElement expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'SpreadElement',
          argument: { type: 'Identifier', name: 'args' },
        },
        loc: makeLoc(1, 0, 1, 6),
      }
      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report node type that is not TSNonNullExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'OptionalCallExpression',
          callee: { type: 'Identifier', name: 'fn' },
          arguments: [],
        },
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when expression type is a random string', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      const node = {
        type: 'TSNonNullExpression',
        expression: { type: 'SomeRandomType' },
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report TSNonNullExpression wrapping another TSNonNullExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'TSNonNullExpression',
          expression: { type: 'Identifier', name: 'x' },
        },
        loc: makeLoc(1, 0, 1, 4),
      }
      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====
  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noNonNullAssertedOptionalChainRule.create(ctx1)
      const visitor2 = noNonNullAssertedOptionalChainRule.create(ctx2)

      visitor1.TSNonNullExpression(makeOptionalCallNode())
      visitor2.TSNonNullExpression({
        type: 'TSNonNullExpression',
        expression: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 2),
      })

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      visitor.TSNonNullExpression(makeOptionalCallNode())
      visitor.TSNonNullExpression(makeOptionalMemberNode())
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'OptionalCallExpression',
          callee: { type: 'Identifier', name: 'fn' },
          arguments: [],
        },
      }
      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'OptionalMemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'prop' },
        },
      }
      visitor.TSNonNullExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      visitor.TSNonNullExpression(makeOptionalCallNode())
      visitor.TSNonNullExpression(makeOptionalCallNode())
      visitor.TSNonNullExpression(makeOptionalCallNode())
      expect(reports.length).toBe(3)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      visitor.TSNonNullExpression(makeOptionalCallNode())
      visitor.TSNonNullExpression({
        type: 'TSNonNullExpression',
        expression: { type: 'Identifier', name: 'x' },
        loc: makeLoc(2, 0, 2, 2),
      })
      visitor.TSNonNullExpression(makeOptionalMemberNode())
      visitor.TSNonNullExpression({
        type: 'TSNonNullExpression',
        expression: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fn' },
          arguments: [],
        },
        loc: makeLoc(3, 0, 3, 5),
      })
      visitor.TSNonNullExpression(makeOptionalCallNode())
      expect(reports.length).toBe(3)
    })

    test('create returns a new visitor each call (not same reference)', () => {
      const { context } = createMockContext()
      const visitor1 = noNonNullAssertedOptionalChainRule.create(context)
      const visitor2 = noNonNullAssertedOptionalChainRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('handles node with null expression gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      const node = {
        type: 'TSNonNullExpression',
        expression: null,
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(0)
    })

    test('location with specific line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      visitor.TSNonNullExpression(makeOptionalMemberNode(10, 4))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('handles node with missing loc on inner expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'OptionalCallExpression',
          callee: { type: 'Identifier', name: 'fn' },
          arguments: [],
        },
        loc: makeLoc(3, 5, 3, 15),
      }
      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
    })

    test('handles boolean false node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      expect(() => visitor.TSNonNullExpression(false)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles node where expression is an empty object', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      const node = {
        type: 'TSNonNullExpression',
        expression: {},
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles node with loc containing non-numeric values', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'OptionalCallExpression',
          callee: { type: 'Identifier', name: 'fn' },
          arguments: [],
        },
        loc: { start: {}, end: {} },
      }
      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('handles node with partial loc (only start)', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'OptionalMemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'prop' },
        },
        loc: { start: { line: 2, column: 3 } },
      }
      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('node type matching is case-sensitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'optionalcallexpression',
          callee: { type: 'Identifier', name: 'fn' },
          arguments: [],
        },
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  // ===== ADDITIONAL CASES (15) =====
  describe('additional coverage', () => {
    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      visitor.TSNonNullExpression(makeOptionalCallNode())
      visitor.TSNonNullExpression(makeOptionalMemberNode())
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('all violation messages are identical for the same rule', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      visitor.TSNonNullExpression(makeOptionalCallNode())
      visitor.TSNonNullExpression(makeOptionalMemberNode())
      visitor.TSNonNullExpression(makeOptionalCallNode())
      const messages = reports.map(r => r.message)
      expect(new Set(messages).size).toBe(1)
    })

    test('rule meta is deeply equal across multiple accesses', () => {
      const meta1 = noNonNullAssertedOptionalChainRule.meta
      const meta2 = noNonNullAssertedOptionalChainRule.meta
      expect(meta1).toBe(meta2)
    })

    test('rule name is exported as noNonNullAssertedOptionalChainRule', () => {
      expect(noNonNullAssertedOptionalChainRule).toBeDefined()
      expect(typeof noNonNullAssertedOptionalChainRule.create).toBe('function')
      expect(typeof noNonNullAssertedOptionalChainRule.meta).toBe('object')
    })

    test('message mentions "null/undefined"', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      visitor.TSNonNullExpression(makeOptionalCallNode())
      expect(reports[0].message).toContain('null/undefined')
    })

    test('does not report ParenthesizedExpression expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'ParenthesizedExpression',
          expression: { type: 'Identifier', name: 'x' },
        },
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report ClassExpression expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'ClassExpression',
          id: { type: 'Identifier', name: 'Foo' },
          body: { type: 'ClassBody', body: [] },
        },
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(0)
    })

    test('report node matches original for OptionalMemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      const node = makeOptionalMemberNode()
      visitor.TSNonNullExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('does not report TSTypeReference expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'TSTypeReference',
          typeName: { type: 'Identifier', name: 'MyType' },
        },
        loc: makeLoc(1, 0, 1, 8),
      }
      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report VoidExpression expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'UnaryExpression',
          operator: 'void',
          argument: { type: 'Identifier', name: 'x' },
        },
        loc: makeLoc(1, 0, 1, 7),
      }
      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(0)
    })

    test('message mentions ?.  and ! characters', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      visitor.TSNonNullExpression(makeOptionalCallNode())
      expect(reports[0].message).toContain('?.')
      expect(reports[0].message).toContain('!')
    })

    test('does not report when expression type is exactly OptionalCallExpression but node type is wrong', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      const node = {
        type: 'SomeOtherExpression',
        expression: {
          type: 'OptionalCallExpression',
          callee: { type: 'Identifier', name: 'fn' },
          arguments: [],
        },
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(0)
    })

    test('reports OptionalCallExpression with member callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertedOptionalChainRule.create(context)
      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'OptionalCallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'method' },
          },
          arguments: [{ type: 'Identifier', name: 'arg' }],
          optional: true,
        },
        loc: makeLoc(1, 0, 1, 16),
      }
      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(1)
    })

    test('description mentions non-null assertions', () => {
      const desc = noNonNullAssertedOptionalChainRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/non-null/)
      expect(desc).toMatch(/assertion/)
    })
  })
})
