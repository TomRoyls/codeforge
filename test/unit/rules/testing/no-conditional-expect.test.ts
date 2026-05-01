import { describe, test, expect, vi } from 'vitest'
import { noConditionalExpectRule } from '../../../../src/rules/testing/no-conditional-expect.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.test.ts',
  source = 'it("test", () => { expect(x).toBe(1); });',
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
      })
    },
    getFilePath: () => filePath,
    getAST: () => null,
    getSource: () => source,
    getTokens: () => [],
    getComments: () => [],
    config: { options: [options] },
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

function createIfStatementNode(line = 1, column = 0): unknown {
  return {
    type: 'IfStatement',
    test: { type: 'Identifier', name: 'condition' },
    consequent: { type: 'BlockStatement', body: [] },
    alternate: null,
    loc: { start: { line, column }, end: { line, column: column + 20 } },
  }
}

function createConditionalExpressionNode(line = 1, column = 0): unknown {
  return {
    type: 'ConditionalExpression',
    test: { type: 'Identifier', name: 'condition' },
    consequent: { type: 'Literal', value: true },
    alternate: { type: 'Literal', value: false },
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
}

function createCatchClauseNode(line = 1, column = 0): unknown {
  return {
    type: 'CatchClause',
    param: { type: 'Identifier', name: 'error' },
    body: { type: 'BlockStatement', body: [] },
    loc: { start: { line, column }, end: { line, column: column + 15 } },
  }
}

function createExpectCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'expect' },
    arguments: [{ type: 'Identifier', name: 'x' }],
    loc: { start: { line, column }, end: { line, column: column + 10 } },
  }
}

function createExpectChainCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [{ type: 'Identifier', name: 'x' }],
      },
      property: { type: 'Identifier', name: 'toBe' },
    },
    arguments: [{ type: 'Literal', value: 'expected' }],
    loc: { start: { line, column }, end: { line, column: column + 22 } },
  }
}

function createAssertCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'assert' },
    arguments: [{ type: 'Identifier', name: 'value' }],
    loc: { start: { line, column }, end: { line, column: column + 14 } },
  }
}

function createAssertMethodCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'assert' },
      property: { type: 'Identifier', name: 'equal' },
    },
    arguments: [
      { type: 'Identifier', name: 'a' },
      { type: 'Identifier', name: 'b' },
    ],
    loc: { start: { line, column }, end: { line, column: column + 20 } },
  }
}

function createSwitchStatementNode(line = 1, column = 0): unknown {
  return {
    type: 'SwitchStatement',
    discriminant: { type: 'Identifier', name: 'value' },
    cases: [],
    loc: { start: { line, column }, end: { line, column: column + 20 } },
  }
}

function createNormalCall(name: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name },
    arguments: [],
    loc: { start: { line, column }, end: { line, column: column + name.length + 2 } },
  }
}

function createTestCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'it' },
    arguments: [
      { type: 'Literal', value: 'test name' },
      { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] } },
    ],
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
}

describe('no-conditional-expect rule', () => {
  describe('meta', () => {
    test('should have correct rule type', () => {
      expect(noConditionalExpectRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noConditionalExpectRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noConditionalExpectRule.meta.docs?.recommended).toBe(true)
    })

    test('should have correct category', () => {
      expect(noConditionalExpectRule.meta.docs?.category).toBe('testing')
    })

    test('should have correct description mentioning conditional', () => {
      expect(noConditionalExpectRule.meta.docs?.description.toLowerCase()).toContain('conditional')
    })

    test('should have correct description mentioning assertion', () => {
      expect(noConditionalExpectRule.meta.docs?.description.toLowerCase()).toContain('assertion')
    })

    test('should have correct docs URL', () => {
      expect(noConditionalExpectRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-conditional-expect',
      )
    })

    test('should have schema with assertFunctionNames property', () => {
      const schema = noConditionalExpectRule.meta.schema as Record<string, unknown>[]
      expect(Array.isArray(schema)).toBe(true)
      expect(schema.length).toBeGreaterThan(0)
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return visitor object with IfStatement method', () => {
      const { context } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)
      expect(visitor).toHaveProperty('IfStatement')
    })

    test('should return visitor object with ConditionalExpression method', () => {
      const { context } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)
      expect(visitor).toHaveProperty('ConditionalExpression')
    })

    test('should return visitor object with CatchClause method', () => {
      const { context } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)
      expect(visitor).toHaveProperty('CatchClause')
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noConditionalExpectRule.create(context)
      const visitor2 = noConditionalExpectRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })
  })

  describe('detecting expect in if block', () => {
    test('should report expect() inside if block', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.IfStatement(createIfStatementNode())
      visitor.CallExpression(createExpectCall())
      visitor['IfStatement:exit'](createIfStatementNode())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('expect')
    })

    test('should report correct location for expect in if block', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.IfStatement(createIfStatementNode(3, 2))
      visitor.CallExpression(createExpectCall(5, 8))
      visitor['IfStatement:exit'](createIfStatementNode(3, 2))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should report multiple expects in if block', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.IfStatement(createIfStatementNode())
      visitor.CallExpression(createExpectCall(1, 0))
      visitor.CallExpression(createExpectCall(2, 0))
      visitor.CallExpression(createExpectCall(3, 0))
      visitor['IfStatement:exit'](createIfStatementNode())

      expect(reports.length).toBe(3)
    })

    test('should report expect in else block', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.IfStatement(createIfStatementNode())
      visitor.CallExpression(createExpectCall())
      visitor['IfStatement:exit'](createIfStatementNode())

      expect(reports.length).toBe(1)
    })

    test('should report expect in else if block', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.IfStatement(createIfStatementNode())
      visitor.IfStatement(createIfStatementNode())
      visitor.CallExpression(createExpectCall())
      visitor['IfStatement:exit'](createIfStatementNode())
      visitor['IfStatement:exit'](createIfStatementNode())

      expect(reports.length).toBe(1)
    })

    test('should report expect chain call inside if block', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.IfStatement(createIfStatementNode())
      visitor.CallExpression(createExpectChainCall())
      visitor.CallExpression(createExpectCall())
      visitor['IfStatement:exit'](createIfStatementNode())

      expect(reports.length).toBe(1)
    })

    test('should not report when if block has no expect', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.IfStatement(createIfStatementNode())
      visitor.CallExpression(createNormalCall('console.log'))
      visitor['IfStatement:exit'](createIfStatementNode())

      expect(reports.length).toBe(0)
    })

    test('should report expect in both if and else blocks', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.IfStatement(createIfStatementNode())
      visitor.CallExpression(createExpectCall(1, 0))
      visitor.CallExpression(createExpectCall(2, 0))
      visitor['IfStatement:exit'](createIfStatementNode())

      expect(reports.length).toBe(2)
    })
  })

  describe('detecting expect in ternary (ConditionalExpression)', () => {
    test('should report expect() inside ternary consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.ConditionalExpression(createConditionalExpressionNode())
      visitor.CallExpression(createExpectCall())
      visitor['ConditionalExpression:exit'](createConditionalExpressionNode())

      expect(reports.length).toBe(1)
    })

    test('should report expect() inside ternary alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.ConditionalExpression(createConditionalExpressionNode())
      visitor.CallExpression(createExpectCall())
      visitor['ConditionalExpression:exit'](createConditionalExpressionNode())

      expect(reports.length).toBe(1)
    })

    test('should report correct location for expect in ternary', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.ConditionalExpression(createConditionalExpressionNode(4, 2))
      visitor.CallExpression(createExpectCall(4, 15))
      visitor['ConditionalExpression:exit'](createConditionalExpressionNode(4, 2))

      expect(reports[0].loc?.start.line).toBe(4)
      expect(reports[0].loc?.start.column).toBe(15)
    })

    test('should report multiple expects inside ternary', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.ConditionalExpression(createConditionalExpressionNode())
      visitor.CallExpression(createExpectCall(1, 0))
      visitor.CallExpression(createExpectCall(2, 0))
      visitor['ConditionalExpression:exit'](createConditionalExpressionNode())

      expect(reports.length).toBe(2)
    })

    test('should not report non-assertion call inside ternary', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.ConditionalExpression(createConditionalExpressionNode())
      visitor.CallExpression(createNormalCall('getValue'))
      visitor['ConditionalExpression:exit'](createConditionalExpressionNode())

      expect(reports.length).toBe(0)
    })
  })

  describe('detecting expect in catch block', () => {
    test('should report expect() inside catch block', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.CatchClause(createCatchClauseNode())
      visitor.CallExpression(createExpectCall())
      visitor['CatchClause:exit'](createCatchClauseNode())

      expect(reports.length).toBe(1)
    })

    test('should report correct location for expect in catch', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.CatchClause(createCatchClauseNode(7, 4))
      visitor.CallExpression(createExpectCall(8, 6))
      visitor['CatchClause:exit'](createCatchClauseNode(7, 4))

      expect(reports[0].loc?.start.line).toBe(8)
      expect(reports[0].loc?.start.column).toBe(6)
    })

    test('should report multiple expects in catch block', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.CatchClause(createCatchClauseNode())
      visitor.CallExpression(createExpectCall(1, 0))
      visitor.CallExpression(createExpectCall(2, 0))
      visitor['CatchClause:exit'](createCatchClauseNode())

      expect(reports.length).toBe(2)
    })

    test('should not report when catch block has no expect', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.CatchClause(createCatchClauseNode())
      visitor.CallExpression(createNormalCall('logError'))
      visitor['CatchClause:exit'](createCatchClauseNode())

      expect(reports.length).toBe(0)
    })

    test('should report expect chain in catch block', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.CatchClause(createCatchClauseNode())
      visitor.CallExpression(createExpectChainCall())
      visitor.CallExpression(createExpectCall())
      visitor['CatchClause:exit'](createCatchClauseNode())

      expect(reports.length).toBe(1)
    })
  })

  describe('expect in try block is OK', () => {
    test('should not report expect() inside try block', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.CallExpression(createExpectCall())

      expect(reports.length).toBe(0)
    })

    test('should report expect in catch but not in try', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.CallExpression(createExpectCall(1, 0))
      visitor.CatchClause(createCatchClauseNode())
      visitor.CallExpression(createExpectCall(5, 0))
      visitor['CatchClause:exit'](createCatchClauseNode())

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
    })

    test('should not report expect outside any conditional', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.CallExpression(createExpectCall(10, 4))

      expect(reports.length).toBe(0)
    })
  })

  describe('expect outside conditional passes', () => {
    test('should not report expect() at top level', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.CallExpression(createExpectCall())

      expect(reports.length).toBe(0)
    })

    test('should not report expect() in function body', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.CallExpression(createExpectCall())

      expect(reports.length).toBe(0)
    })

    test('should not report expect() in arrow function', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.CallExpression(createExpectCall())

      expect(reports.length).toBe(0)
    })

    test('should not report non-assertion calls anywhere', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.CallExpression(createNormalCall('helper'))

      expect(reports.length).toBe(0)
    })

    test('should not report test function calls inside conditional', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.IfStatement(createIfStatementNode())
      visitor.CallExpression(createTestCall())
      visitor['IfStatement:exit'](createIfStatementNode())

      expect(reports.length).toBe(0)
    })
  })

  describe('custom assertFunctionNames option', () => {
    test('should report assert() when "assert" is in assertFunctionNames', () => {
      const { context, reports } = createMockContext({
        assertFunctionNames: ['expect', 'assert'],
      })
      const visitor = noConditionalExpectRule.create(context)

      visitor.IfStatement(createIfStatementNode())
      visitor.CallExpression(createAssertCall())
      visitor['IfStatement:exit'](createIfStatementNode())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('assert')
    })

    test('should report assert.equal() when "assert" is in assertFunctionNames', () => {
      const { context, reports } = createMockContext({
        assertFunctionNames: ['expect', 'assert'],
      })
      const visitor = noConditionalExpectRule.create(context)

      visitor.IfStatement(createIfStatementNode())
      visitor.CallExpression(createAssertMethodCall())
      visitor['IfStatement:exit'](createIfStatementNode())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('assert')
    })

    test('should not report assert() when "assert" is NOT in assertFunctionNames', () => {
      const { context, reports } = createMockContext({
        assertFunctionNames: ['expect'],
      })
      const visitor = noConditionalExpectRule.create(context)

      visitor.IfStatement(createIfStatementNode())
      visitor.CallExpression(createAssertCall())
      visitor['IfStatement:exit'](createIfStatementNode())

      expect(reports.length).toBe(0)
    })

    test('should report custom function name when in assertFunctionNames', () => {
      const { context, reports } = createMockContext({
        assertFunctionNames: ['expect', 'assert', 'should'],
      })
      const visitor = noConditionalExpectRule.create(context)

      visitor.IfStatement(createIfStatementNode())
      visitor.CallExpression(createNormalCall('should'))
      visitor['IfStatement:exit'](createIfStatementNode())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('should')
    })

    test('should use default assertFunctionNames when no options provided', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.IfStatement(createIfStatementNode())
      visitor.CallExpression(createExpectCall())
      visitor.CallExpression(createAssertCall())
      visitor['IfStatement:exit'](createIfStatementNode())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('expect')
    })
  })

  describe('nested conditionals', () => {
    test('should report expect in nested if statements', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.IfStatement(createIfStatementNode())
      visitor.IfStatement(createIfStatementNode())
      visitor.CallExpression(createExpectCall())
      visitor['IfStatement:exit'](createIfStatementNode())
      visitor['IfStatement:exit'](createIfStatementNode())

      expect(reports.length).toBe(1)
    })

    test('should report expect in if inside catch', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.CatchClause(createCatchClauseNode())
      visitor.IfStatement(createIfStatementNode())
      visitor.CallExpression(createExpectCall())
      visitor['IfStatement:exit'](createIfStatementNode())
      visitor['CatchClause:exit'](createCatchClauseNode())

      expect(reports.length).toBe(1)
    })

    test('should report expect in ternary inside if', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.IfStatement(createIfStatementNode())
      visitor.ConditionalExpression(createConditionalExpressionNode())
      visitor.CallExpression(createExpectCall())
      visitor['ConditionalExpression:exit'](createConditionalExpressionNode())
      visitor['IfStatement:exit'](createIfStatementNode())

      expect(reports.length).toBe(1)
    })

    test('should correctly reset depth after exiting nested conditionals', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.IfStatement(createIfStatementNode())
      visitor.CallExpression(createExpectCall(1, 0))
      visitor['IfStatement:exit'](createIfStatementNode())
      visitor.CallExpression(createExpectCall(2, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should track multiple sequential conditionals independently', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.IfStatement(createIfStatementNode())
      visitor.CallExpression(createExpectCall(1, 0))
      visitor['IfStatement:exit'](createIfStatementNode())

      visitor.IfStatement(createIfStatementNode())
      visitor.CallExpression(createExpectCall(2, 0))
      visitor['IfStatement:exit'](createIfStatementNode())

      expect(reports.length).toBe(2)
    })
  })

  describe('multiple assertions', () => {
    test('should report all assertions inside a single conditional', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.IfStatement(createIfStatementNode())
      for (let i = 0; i < 5; i++) {
        visitor.CallExpression(createExpectCall(i + 1, 0))
      }
      visitor['IfStatement:exit'](createIfStatementNode())

      expect(reports).toHaveLength(5)
    })

    test('should report assertions in different conditional types', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.IfStatement(createIfStatementNode())
      visitor.CallExpression(createExpectCall(1, 0))
      visitor['IfStatement:exit'](createIfStatementNode())

      visitor.CatchClause(createCatchClauseNode())
      visitor.CallExpression(createExpectCall(2, 0))
      visitor['CatchClause:exit'](createCatchClauseNode())

      visitor.ConditionalExpression(createConditionalExpressionNode())
      visitor.CallExpression(createExpectCall(3, 0))
      visitor['ConditionalExpression:exit'](createConditionalExpressionNode())

      expect(reports).toHaveLength(3)
    })

    test('should only report assertion calls not all calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.IfStatement(createIfStatementNode())
      visitor.CallExpression(createNormalCall('setup'))
      visitor.CallExpression(createExpectCall())
      visitor.CallExpression(createNormalCall('teardown'))
      visitor['IfStatement:exit'](createIfStatementNode())

      expect(reports.length).toBe(1)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.IfStatement(createIfStatementNode())
      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
      visitor['IfStatement:exit'](createIfStatementNode())

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [],
      }

      visitor.IfStatement(createIfStatementNode())
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      visitor['IfStatement:exit'](createIfStatementNode())
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.IfStatement(createIfStatementNode())
      visitor.CallExpression({ type: 'CallExpression', arguments: [] })
      visitor['IfStatement:exit'](createIfStatementNode())

      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression that is not assertion', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.IfStatement(createIfStatementNode())
      visitor.CallExpression(createNormalCall('getData'))
      visitor['IfStatement:exit'](createIfStatementNode())

      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.IfStatement(createIfStatementNode())
      expect(() => visitor.CallExpression({})).not.toThrow()
      visitor['IfStatement:exit'](createIfStatementNode())

      expect(reports.length).toBe(0)
    })

    test('should handle expect in loop inside if (still flagged)', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.IfStatement(createIfStatementNode())
      visitor.CallExpression(createExpectCall())
      visitor.CallExpression(createExpectCall())
      visitor['IfStatement:exit'](createIfStatementNode())

      expect(reports.length).toBe(2)
    })

    test('should handle expect in callback inside if (still flagged)', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.IfStatement(createIfStatementNode())
      visitor.CallExpression(createExpectCall())
      visitor['IfStatement:exit'](createIfStatementNode())

      expect(reports.length).toBe(1)
    })

    test('should not flag describe() inside conditional', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.IfStatement(createIfStatementNode())
      visitor.CallExpression(createNormalCall('describe'))
      visitor['IfStatement:exit'](createIfStatementNode())

      expect(reports.length).toBe(0)
    })
  })

  describe('state isolation between visitors', () => {
    test('separate visitors have separate conditional depth', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()

      const visitor1 = noConditionalExpectRule.create(ctx1)
      const visitor2 = noConditionalExpectRule.create(ctx2)

      visitor1.IfStatement(createIfStatementNode())
      visitor1.CallExpression(createExpectCall())

      visitor2.CallExpression(createExpectCall())

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)

      visitor1['IfStatement:exit'](createIfStatementNode())
    })

    test('visitor accumulates reports across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.IfStatement(createIfStatementNode())
      visitor.CallExpression(createExpectCall(1, 0))
      visitor['IfStatement:exit'](createIfStatementNode())

      visitor.CatchClause(createCatchClauseNode())
      visitor.CallExpression(createExpectCall(2, 0))
      visitor['CatchClause:exit'](createCatchClauseNode())

      expect(reports.length).toBe(2)
    })

    test('depth resets correctly between conditionals', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.IfStatement(createIfStatementNode())
      visitor.CallExpression(createExpectCall())
      visitor['IfStatement:exit'](createIfStatementNode())

      visitor.CallExpression(createExpectCall())

      expect(reports.length).toBe(1)
    })
  })

  describe('error message format', () => {
    test('message contains assertion function name', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.IfStatement(createIfStatementNode())
      visitor.CallExpression(createExpectCall())
      visitor['IfStatement:exit'](createIfStatementNode())

      expect(reports[0].message).toContain("'expect'")
    })

    test('message mentions conditional statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.IfStatement(createIfStatementNode())
      visitor.CallExpression(createExpectCall())
      visitor['IfStatement:exit'](createIfStatementNode())

      expect(reports[0].message).toContain('conditional')
    })

    test('message mentions silently pass', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.IfStatement(createIfStatementNode())
      visitor.CallExpression(createExpectCall())
      visitor['IfStatement:exit'](createIfStatementNode())

      expect(reports[0].message).toContain('silently pass')
    })

    test('message starts with "Unexpected"', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.IfStatement(createIfStatementNode())
      visitor.CallExpression(createExpectCall())
      visitor['IfStatement:exit'](createIfStatementNode())

      expect(reports[0].message).toMatch(/^Unexpected/)
    })

    test('message ends with period', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.IfStatement(createIfStatementNode())
      visitor.CallExpression(createExpectCall())
      visitor['IfStatement:exit'](createIfStatementNode())

      expect(reports[0].message).toMatch(/\.$/)
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.IfStatement(createIfStatementNode())
      visitor.CallExpression(createExpectCall(5, 10))
      visitor['IfStatement:exit'](createIfStatementNode())

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })
  })

  describe('extractLocation edge cases', () => {
    test('returns default location for node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [],
      }

      visitor.IfStatement(createIfStatementNode())
      visitor.CallExpression(node)
      visitor['IfStatement:exit'](createIfStatementNode())

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('handles loc with non-numeric line gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [],
        loc: { start: { line: 'bad', column: 0 }, end: { line: 1, column: 5 } },
      }

      visitor.IfStatement(createIfStatementNode())
      visitor.CallExpression(node)
      visitor['IfStatement:exit'](createIfStatementNode())

      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('handles valid loc correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.IfStatement(createIfStatementNode())
      visitor.CallExpression(createExpectCall(42, 7))
      visitor['IfStatement:exit'](createIfStatementNode())

      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(7)
    })
  })

  describe('chained expect calls', () => {
    test('should not report outer chained call (toBe) but inner expect is reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.IfStatement(createIfStatementNode())
      visitor.CallExpression(createExpectChainCall())
      visitor.CallExpression(createExpectCall())
      visitor['IfStatement:exit'](createIfStatementNode())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('expect')
    })

    test('should report inner expect() call in chain inside ternary', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.ConditionalExpression(createConditionalExpressionNode())
      visitor.CallExpression(createExpectChainCall())
      visitor.CallExpression(createExpectCall())
      visitor['ConditionalExpression:exit'](createConditionalExpressionNode())

      expect(reports.length).toBe(1)
    })
  })

  describe('conditional depth with all types mixed', () => {
    test('should correctly track depth across mixed conditional types', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.IfStatement(createIfStatementNode())
      visitor.CatchClause(createCatchClauseNode())
      visitor.CallExpression(createExpectCall())
      visitor['CatchClause:exit'](createCatchClauseNode())
      visitor['IfStatement:exit'](createIfStatementNode())

      expect(reports.length).toBe(1)
    })

    test('should correctly handle enter/exit order independence', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.IfStatement(createIfStatementNode())
      visitor.ConditionalExpression(createConditionalExpressionNode())
      visitor.CallExpression(createExpectCall())
      visitor['ConditionalExpression:exit'](createConditionalExpressionNode())
      visitor.CallExpression(createExpectCall())
      visitor['IfStatement:exit'](createIfStatementNode())

      expect(reports.length).toBe(2)
    })

    test('should handle deeply nested conditionals', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.IfStatement(createIfStatementNode())
      visitor.IfStatement(createIfStatementNode())
      visitor.IfStatement(createIfStatementNode())
      visitor.CallExpression(createExpectCall())
      visitor['IfStatement:exit'](createIfStatementNode())
      visitor['IfStatement:exit'](createIfStatementNode())
      visitor['IfStatement:exit'](createIfStatementNode())

      expect(reports.length).toBe(1)
    })

    test('should handle all three conditional types nested', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.IfStatement(createIfStatementNode())
      visitor.ConditionalExpression(createConditionalExpressionNode())
      visitor.CatchClause(createCatchClauseNode())
      visitor.CallExpression(createExpectCall())
      visitor['CatchClause:exit'](createCatchClauseNode())
      visitor['ConditionalExpression:exit'](createConditionalExpressionNode())
      visitor['IfStatement:exit'](createIfStatementNode())

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting expect in switch statement', () => {
    test('should report expect() inside switch case', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.SwitchStatement(createSwitchStatementNode())
      visitor.CallExpression(createExpectCall())
      visitor['SwitchStatement:exit'](createSwitchStatementNode())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('expect')
    })

    test('should report correct location for expect in switch', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.SwitchStatement(createSwitchStatementNode(10, 2))
      visitor.CallExpression(createExpectCall(12, 6))
      visitor['SwitchStatement:exit'](createSwitchStatementNode(10, 2))

      expect(reports[0].loc?.start.line).toBe(12)
      expect(reports[0].loc?.start.column).toBe(6)
    })

    test('should report multiple expects in different switch cases', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.SwitchStatement(createSwitchStatementNode())
      visitor.CallExpression(createExpectCall(5, 4))
      visitor.CallExpression(createExpectCall(8, 4))
      visitor.CallExpression(createExpectCall(11, 4))
      visitor['SwitchStatement:exit'](createSwitchStatementNode())

      expect(reports.length).toBe(3)
    })

    test('should not report non-assertion call in switch case', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.SwitchStatement(createSwitchStatementNode())
      visitor.CallExpression(createNormalCall('process'))
      visitor['SwitchStatement:exit'](createSwitchStatementNode())

      expect(reports.length).toBe(0)
    })

    test('should not report expect after switch exits', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.SwitchStatement(createSwitchStatementNode())
      visitor['SwitchStatement:exit'](createSwitchStatementNode())
      visitor.CallExpression(createExpectCall())

      expect(reports.length).toBe(0)
    })

    test('should report expect in nested switch inside if', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.IfStatement(createIfStatementNode())
      visitor.SwitchStatement(createSwitchStatementNode())
      visitor.CallExpression(createExpectCall())
      visitor['SwitchStatement:exit'](createSwitchStatementNode())
      visitor['IfStatement:exit'](createIfStatementNode())

      expect(reports.length).toBe(1)
    })
  })

  describe('default export', () => {
    test('rule should be the default export', () => {
      expect(noConditionalExpectRule).toBeDefined()
      expect(noConditionalExpectRule.meta).toBeDefined()
      expect(noConditionalExpectRule.create).toBeDefined()
    })
  })

  describe('assertFunctionNames option', () => {
    test('should report custom assert function inside if', () => {
      const { context, reports } = createMockContext({ assertFunctionNames: ['expect', 'assert'] })
      const visitor = noConditionalExpectRule.create(context)

      visitor.IfStatement(createIfStatementNode())
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'assert' },
        arguments: [],
      })
      visitor['IfStatement:exit'](createIfStatementNode())

      expect(reports.length).toBe(1)
    })

    test('should not report unknown function inside if', () => {
      const { context, reports } = createMockContext({ assertFunctionNames: ['expect'] })
      const visitor = noConditionalExpectRule.create(context)

      visitor.IfStatement(createIfStatementNode())
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'unknown' },
        arguments: [],
      })
      visitor['IfStatement:exit'](createIfStatementNode())

      expect(reports.length).toBe(0)
    })
  })

  describe('docs URL', () => {
    test('should have valid URL format', () => {
      const url = noConditionalExpectRule.meta.docs?.url
      expect(url).toMatch(/^https?:\/\/.+/)
      expect(url).toContain('no-conditional-expect')
    })
  })

  describe('test function calls with MemberExpression callee inside conditionals', () => {
    test('should not report it.skip() call inside if block', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      const itSkip = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'it' },
          property: { type: 'Identifier', name: 'skip' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.IfStatement(createIfStatementNode())
      visitor.CallExpression(itSkip)
      visitor['IfStatement:exit'](createIfStatementNode())

      expect(reports.length).toBe(0)
    })

    test('should not report test.only() call inside if block', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      const testOnly = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'test' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.IfStatement(createIfStatementNode())
      visitor.CallExpression(testOnly)
      visitor['IfStatement:exit'](createIfStatementNode())

      expect(reports.length).toBe(0)
    })
  })

  describe('mixed conditional nesting with switch', () => {
    test('should report expect inside catch clause nested in switch', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.SwitchStatement(createSwitchStatementNode())
      visitor.CatchClause(createCatchClauseNode())
      visitor.CallExpression(createExpectCall())
      visitor['CatchClause:exit'](createCatchClauseNode())
      visitor['SwitchStatement:exit'](createSwitchStatementNode())

      expect(reports.length).toBe(1)
    })

    test('should report expect in ternary nested inside switch', () => {
      const { context, reports } = createMockContext()
      const visitor = noConditionalExpectRule.create(context)

      visitor.SwitchStatement(createSwitchStatementNode())
      visitor.ConditionalExpression(createConditionalExpressionNode())
      visitor.CallExpression(createExpectCall())
      visitor['ConditionalExpression:exit'](createConditionalExpressionNode())
      visitor['SwitchStatement:exit'](createSwitchStatementNode())

      expect(reports.length).toBe(1)
    })

    test('should report custom assert method call inside catch clause', () => {
      const { context, reports } = createMockContext({ assertFunctionNames: ['expect', 'assert'] })
      const visitor = noConditionalExpectRule.create(context)

      visitor.CatchClause(createCatchClauseNode())
      visitor.CallExpression(createAssertMethodCall())
      visitor['CatchClause:exit'](createCatchClauseNode())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('assert')
    })
  })
})
