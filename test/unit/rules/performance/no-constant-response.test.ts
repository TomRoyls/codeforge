import { describe, expect, test, vi } from 'vitest'
import { noConstantResponseRule } from '../../../../src/rules/performance/no-constant-response.js'
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
    getSource: () => 'function foo() { return 42; }',
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

function makeFunctionWithReturn(arg: unknown, loc = makeLoc(1, 0, 3, 1)): unknown {
  return {
    type: 'FunctionDeclaration',
    id: { type: 'Identifier', name: 'foo' },
    body: {
      type: 'BlockStatement',
      body: [
        {
          type: 'ReturnStatement',
          argument: arg,
        },
      ],
    },
    loc,
  }
}

describe('no-constant-response rule', () => {
  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noConstantResponseRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noConstantResponseRule.meta.severity).toBe('warn')
    })

    test('should have correct category "performance"', () => {
      expect(noConstantResponseRule.meta.docs?.category).toBe('performance')
    })

    test('should not be recommended', () => {
      expect(noConstantResponseRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noConstantResponseRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning constant and return', () => {
      const desc = noConstantResponseRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/constant/)
      expect(desc).toMatch(/return/)
    })

    test('should have correct docs URL', () => {
      expect(noConstantResponseRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-constant-response',
      )
    })

    test('should have empty schema', () => {
      expect(noConstantResponseRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====
  describe('structure', () => {
    test('create() returns visitor with FunctionDeclaration', () => {
      const { context } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      expect(visitor).toHaveProperty('FunctionDeclaration')
      expect(typeof visitor.FunctionDeclaration).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noConstantResponseRule).toBeDefined()
      expect(noConstantResponseRule.meta).toBeDefined()
      expect(noConstantResponseRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES (20) =====
  describe('positive cases — reports constant return functions', () => {
    test('return number literal reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration(makeFunctionWithReturn({ type: 'Literal', value: 42 }))
      expect(reports.length).toBe(1)
    })

    test('return string literal reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration(makeFunctionWithReturn({ type: 'Literal', value: 'hello' }))
      expect(reports.length).toBe(1)
    })

    test('return true reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration(makeFunctionWithReturn({ type: 'Literal', value: true }))
      expect(reports.length).toBe(1)
    })

    test('return false reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration(makeFunctionWithReturn({ type: 'Literal', value: false }))
      expect(reports.length).toBe(1)
    })

    test('return null reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration(makeFunctionWithReturn({ type: 'Literal', value: null }))
      expect(reports.length).toBe(1)
    })

    test('message contains "constant"', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration(makeFunctionWithReturn({ type: 'Literal', value: 42 }))
      expect(reports[0].message.toLowerCase()).toContain('constant')
    })

    test('message contains "variable assignment"', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration(makeFunctionWithReturn({ type: 'Literal', value: 42 }))
      expect(reports[0].message.toLowerCase()).toContain('variable assignment')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration(makeFunctionWithReturn({ type: 'Literal', value: 42 }))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration(makeFunctionWithReturn({ type: 'Literal', value: 42 }))
      expect(reports[0].node).toBeDefined()
    })

    test('report loc matches node loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      const node = makeFunctionWithReturn({ type: 'Literal', value: 42 }, makeLoc(5, 8, 7, 9))
      visitor.FunctionDeclaration(node)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
      expect(reports[0].loc?.end.line).toBe(7)
      expect(reports[0].loc?.end.column).toBe(9)
    })

    test('report node is the function node', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      const node = makeFunctionWithReturn({ type: 'Literal', value: 42 })
      visitor.FunctionDeclaration(node)
      expect(reports[0].node).toBe(node)
    })

    test('return empty string reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration(makeFunctionWithReturn({ type: 'Literal', value: '' }))
      expect(reports.length).toBe(1)
    })

    test('return 0 reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration(makeFunctionWithReturn({ type: 'Literal', value: 0 }))
      expect(reports.length).toBe(1)
    })

    test('return negative number reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration(makeFunctionWithReturn({ type: 'Literal', value: -1 }))
      expect(reports.length).toBe(1)
    })

    test('return float reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration(makeFunctionWithReturn({ type: 'Literal', value: 3.14 }))
      expect(reports.length).toBe(1)
    })

    test('report message is exact match', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration(makeFunctionWithReturn({ type: 'Literal', value: 42 }))
      expect(reports[0].message).toBe(
        'Function always returns the same constant value. Consider using a simple variable assignment instead of a function wrapper.',
      )
    })

    test('function named "foo" reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration(makeFunctionWithReturn({ type: 'Literal', value: 42 }))
      expect(reports.length).toBe(1)
    })

    test('function named "getConstant" reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'getConstant' },
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 99 } }],
        },
        loc: makeLoc(1, 0, 3, 1),
      })
      expect(reports.length).toBe(1)
    })

    test('reports once per function call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration(makeFunctionWithReturn({ type: 'Literal', value: 42 }))
      expect(reports.length).toBe(1)
    })

    test('different loc values still report', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration(makeFunctionWithReturn({ type: 'Literal', value: 42 }, makeLoc(10, 5, 15, 2)))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(10)
    })
  })

  // ===== NEGATIVE CASES (35) =====
  describe('negative cases — does NOT report', () => {
    test('return Identifier NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration(makeFunctionWithReturn({ type: 'Identifier', name: 'x' }))
      expect(reports.length).toBe(0)
    })

    test('return CallExpression NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration(
        makeFunctionWithReturn({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }),
      )
      expect(reports.length).toBe(0)
    })

    test('0 statements NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 3, 1),
      })
      expect(reports.length).toBe(0)
    })

    test('2 statements NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        body: {
          type: 'BlockStatement',
          body: [
            { type: 'ExpressionStatement', expression: { type: 'Literal', value: 1 } },
            { type: 'ReturnStatement', argument: { type: 'Literal', value: 2 } },
          ],
        },
        loc: makeLoc(1, 0, 3, 1),
      })
      expect(reports.length).toBe(0)
    })

    test('3 statements NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        body: {
          type: 'BlockStatement',
          body: [
            { type: 'VariableDeclaration', declarations: [], kind: 'let' },
            { type: 'ExpressionStatement', expression: { type: 'Literal', value: 1 } },
            { type: 'ReturnStatement', argument: { type: 'Literal', value: 2 } },
          ],
        },
        loc: makeLoc(1, 0, 5, 1),
      })
      expect(reports.length).toBe(0)
    })

    test('bare return NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: null }],
        },
        loc: makeLoc(1, 0, 3, 1),
      })
      expect(reports.length).toBe(0)
    })

    test('return MemberExpression NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration(
        makeFunctionWithReturn({
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'prop' },
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('return BinaryExpression NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration(
        makeFunctionWithReturn({
          type: 'BinaryExpression',
          operator: '+',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('return ConditionalExpression NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration(
        makeFunctionWithReturn({
          type: 'ConditionalExpression',
          test: { type: 'Identifier', name: 'x' },
          consequent: { type: 'Literal', value: 'a' },
          alternate: { type: 'Literal', value: 'b' },
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('return ArrayExpression NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration(
        makeFunctionWithReturn({ type: 'ArrayExpression', elements: [] }),
      )
      expect(reports.length).toBe(0)
    })

    test('return ObjectExpression NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration(
        makeFunctionWithReturn({ type: 'ObjectExpression', properties: [] }),
      )
      expect(reports.length).toBe(0)
    })

    test('return ArrowFunctionExpression NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration(
        makeFunctionWithReturn({
          type: 'ArrowFunctionExpression',
          params: [],
          body: { type: 'Identifier', name: 'x' },
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('return TemplateLiteral NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration(
        makeFunctionWithReturn({ type: 'TemplateLiteral', quasis: [], expressions: [] }),
      )
      expect(reports.length).toBe(0)
    })

    test('null node handled gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      expect(() => visitor.FunctionDeclaration(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('undefined node handled gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      expect(() => visitor.FunctionDeclaration(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('wrong node type VariableDeclaration NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration({ type: 'VariableDeclaration', declarations: [], kind: 'let', loc: makeLoc(1, 0, 3, 1) })
      expect(reports.length).toBe(0)
    })

    test('wrong node type IfStatement NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration({ type: 'IfStatement', test: null, consequent: null, loc: makeLoc(1, 0, 3, 1) })
      expect(reports.length).toBe(0)
    })

    test('body is not BlockStatement NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        body: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 3, 1),
      })
      expect(reports.length).toBe(0)
    })

    test('body is null NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        body: null,
        loc: makeLoc(1, 0, 3, 1),
      })
      expect(reports.length).toBe(0)
    })

    test('body is undefined NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        loc: makeLoc(1, 0, 3, 1),
      })
      expect(reports.length).toBe(0)
    })

    test('body is string NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        body: 'not a block',
        loc: makeLoc(1, 0, 3, 1),
      })
      expect(reports.length).toBe(0)
    })

    test('body is number NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        body: 42,
        loc: makeLoc(1, 0, 3, 1),
      })
      expect(reports.length).toBe(0)
    })

    test('single ExpressionStatement NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ExpressionStatement', expression: { type: 'Literal', value: 42 } }],
        },
        loc: makeLoc(1, 0, 3, 1),
      })
      expect(reports.length).toBe(0)
    })

    test('single VariableDeclaration NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        body: {
          type: 'BlockStatement',
          body: [{ type: 'VariableDeclaration', declarations: [], kind: 'let' }],
        },
        loc: makeLoc(1, 0, 3, 1),
      })
      expect(reports.length).toBe(0)
    })

    test('return argument is undefined NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement' }],
        },
        loc: makeLoc(1, 0, 3, 1),
      })
      expect(reports.length).toBe(0)
    })

    test('return argument null NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: null }],
        },
        loc: makeLoc(1, 0, 3, 1),
      })
      expect(reports.length).toBe(0)
    })

    test('block body is not array NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        body: { type: 'BlockStatement', body: 'not-array' },
        loc: makeLoc(1, 0, 3, 1),
      })
      expect(reports.length).toBe(0)
    })

    test('IfStatement visitor NOT in visitor', () => {
      const { context } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      expect(visitor).not.toHaveProperty('IfStatement')
    })

    test('ForStatement visitor NOT in visitor', () => {
      const { context } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      expect(visitor).not.toHaveProperty('ForStatement')
    })

    test('non-FunctionDeclaration node type NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration({ type: 'ExpressionStatement', expression: { type: 'Literal', value: 42 } })
      expect(reports.length).toBe(0)
    })

    test('return UnaryExpression NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration(
        makeFunctionWithReturn({
          type: 'UnaryExpression',
          operator: '-',
          argument: { type: 'Identifier', name: 'x' },
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('return UpdateExpression NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration(
        makeFunctionWithReturn({
          type: 'UpdateExpression',
          operator: '++',
          argument: { type: 'Identifier', name: 'x' },
          prefix: false,
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('return LogicalExpression NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration(
        makeFunctionWithReturn({
          type: 'LogicalExpression',
          operator: '||',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('FunctionExpression visitor NOT in visitor', () => {
      const { context } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      expect(visitor).not.toHaveProperty('FunctionExpression')
    })

    test('block body length 5 NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        body: {
          type: 'BlockStatement',
          body: [
            { type: 'ExpressionStatement', expression: { type: 'Literal', value: 1 } },
            { type: 'ExpressionStatement', expression: { type: 'Literal', value: 2 } },
            { type: 'ExpressionStatement', expression: { type: 'Literal', value: 3 } },
            { type: 'ExpressionStatement', expression: { type: 'Literal', value: 4 } },
            { type: 'ReturnStatement', argument: { type: 'Literal', value: 5 } },
          ],
        },
        loc: makeLoc(1, 0, 7, 1),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====
  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noConstantResponseRule.create(ctx1)
      const visitor2 = noConstantResponseRule.create(ctx2)

      visitor1.FunctionDeclaration(makeFunctionWithReturn({ type: 'Literal', value: 42 }))
      visitor2.FunctionDeclaration(makeFunctionWithReturn({ type: 'Identifier', name: 'x' }))

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('accumulation across multiple functions', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration(makeFunctionWithReturn({ type: 'Literal', value: 1 }))
      visitor.FunctionDeclaration(makeFunctionWithReturn({ type: 'Literal', value: 2 }))
      visitor.FunctionDeclaration(makeFunctionWithReturn({ type: 'Literal', value: 3 }))
      expect(reports.length).toBe(3)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 42 } }],
        },
      })
      expect(reports.length).toBe(1)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noConstantResponseRule.create(context)
      const visitor2 = noConstantResponseRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('mixed violations and non-violations count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration(makeFunctionWithReturn({ type: 'Literal', value: 42 }))
      visitor.FunctionDeclaration(makeFunctionWithReturn({ type: 'Identifier', name: 'x' }))
      visitor.FunctionDeclaration(makeFunctionWithReturn({ type: 'Literal', value: 'hello' }))
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 3, 1),
      })
      expect(reports.length).toBe(2)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration(makeFunctionWithReturn({ type: 'Literal', value: 1 }))
      visitor.FunctionDeclaration(makeFunctionWithReturn({ type: 'Literal', value: 2 }))
      visitor.FunctionDeclaration(makeFunctionWithReturn({ type: 'Literal', value: 3 }))
      expect(reports.length).toBe(3)
    })

    test('handles node with missing body property', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration({ type: 'FunctionDeclaration', id: { type: 'Identifier', name: 'foo' }, loc: makeLoc(1, 0, 3, 1) })
      expect(reports.length).toBe(0)
    })

    test('reports with default location when node has no loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 42 } }],
        },
      })
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('function with params still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        params: [{ type: 'Identifier', name: 'x' }],
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 42 } }],
        },
        loc: makeLoc(1, 0, 3, 1),
      })
      expect(reports.length).toBe(1)
    })

    test('function with async flag still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        async: true,
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 42 } }],
        },
        loc: makeLoc(1, 0, 3, 1),
      })
      expect(reports.length).toBe(1)
    })

    test('function with id null still checked', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: null,
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 42 } }],
        },
        loc: makeLoc(1, 0, 3, 1),
      })
      expect(reports.length).toBe(1)
    })

    test('function without id property still checked', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 42 } }],
        },
        loc: makeLoc(1, 0, 3, 1),
      })
      expect(reports.length).toBe(1)
    })

    test('all reports have same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration(makeFunctionWithReturn({ type: 'Literal', value: 1 }))
      visitor.FunctionDeclaration(makeFunctionWithReturn({ type: 'Literal', value: 'hello' }))
      visitor.FunctionDeclaration(makeFunctionWithReturn({ type: 'Literal', value: true }))
      const messages = reports.map(r => r.message)
      expect(new Set(messages).size).toBe(1)
    })

    test('handles body as empty object NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        body: {},
        loc: makeLoc(1, 0, 3, 1),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== ADDITIONAL CASES (15) =====
  describe('additional coverage', () => {
    test('reports two violations with identical messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration(makeFunctionWithReturn({ type: 'Literal', value: 1 }))
      visitor.FunctionDeclaration(makeFunctionWithReturn({ type: 'Literal', value: 2 }))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('meta is same reference across accesses', () => {
      const meta1 = noConstantResponseRule.meta
      const meta2 = noConstantResponseRule.meta
      expect(meta1).toBe(meta2)
    })

    test('rule name is exported as noConstantResponseRule', () => {
      expect(noConstantResponseRule).toBeDefined()
      expect(typeof noConstantResponseRule.create).toBe('function')
      expect(typeof noConstantResponseRule.meta).toBe('object')
    })

    test('handles node as empty object', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration({})
      expect(reports.length).toBe(0)
    })

    test('function with generator flag still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        generator: true,
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 42 } }],
        },
        loc: makeLoc(1, 0, 3, 1),
      })
      expect(reports.length).toBe(1)
    })

    test('return regex literal reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration(
        makeFunctionWithReturn({ type: 'Literal', value: null, regex: { pattern: 'abc', flags: 'g' } }),
      )
      expect(reports.length).toBe(1)
    })

    test('does NOT report for IfStatement visitor absence', () => {
      const { context } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      expect(visitor).not.toHaveProperty('IfStatement')
    })

    test('does NOT report for ExpressionStatement visitor absence', () => {
      const { context } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      expect(visitor).not.toHaveProperty('ExpressionStatement')
    })

    test('message contains "function"', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration(makeFunctionWithReturn({ type: 'Literal', value: 42 }))
      expect(reports[0].message.toLowerCase()).toContain('function')
    })

    test('message contains "wrapper"', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration(makeFunctionWithReturn({ type: 'Literal', value: 42 }))
      expect(reports[0].message.toLowerCase()).toContain('wrapper')
    })

    test('handles body as BlockStatement with non-array body property', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        body: { type: 'BlockStatement', body: undefined },
        loc: makeLoc(1, 0, 3, 1),
      })
      expect(reports.length).toBe(0)
    })

    test('mixed positive and negative in sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration(makeFunctionWithReturn({ type: 'Literal', value: 42 }))
      visitor.FunctionDeclaration(makeFunctionWithReturn({ type: 'Identifier', name: 'x' }))
      visitor.FunctionDeclaration(makeFunctionWithReturn({ type: 'Literal', value: 'hello' }))
      visitor.FunctionDeclaration(makeFunctionWithReturn({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }))
      expect(reports.length).toBe(2)
    })

    test('multiple calls with same node report each time', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      const node = makeFunctionWithReturn({ type: 'Literal', value: 42 })
      visitor.FunctionDeclaration(node)
      visitor.FunctionDeclaration(node)
      expect(reports.length).toBe(2)
    })

    test('does NOT report for SwitchStatement visitor absence', () => {
      const { context } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      expect(visitor).not.toHaveProperty('SwitchStatement')
    })

    test('single ReturnStatement with NewExpression NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      visitor.FunctionDeclaration(
        makeFunctionWithReturn({
          type: 'NewExpression',
          callee: { type: 'Identifier', name: 'MyClass' },
          arguments: [],
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('does NOT report for WhileStatement visitor absence', () => {
      const { context } = createMockContext()
      const visitor = noConstantResponseRule.create(context)
      expect(visitor).not.toHaveProperty('WhileStatement')
    })
  })
})
