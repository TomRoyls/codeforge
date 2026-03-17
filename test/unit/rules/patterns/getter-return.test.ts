import { describe, test, expect, vi } from 'vitest'
import { getterReturnRule } from '../../../../src/rules/patterns/getter-return.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
      })
    },
    getFilePath: () => '/src/file.ts',
    getAST: () => null,
    getSource: () => 'get foo() { return this._foo; }',
    getTokens: () => [],
    getComments: () => [],
    config: { options: [] },
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

function createGetterWithReturn(line = 1, column = 0): unknown {
  return {
    type: 'MethodDefinition',
    kind: 'get',
    key: { type: 'Identifier', name: 'foo' },
    value: {
      type: 'FunctionExpression',
      body: {
        type: 'BlockStatement',
        body: [
          {
            type: 'ReturnStatement',
            argument: {
              type: 'MemberExpression',
              object: { type: 'ThisExpression' },
              property: { type: 'Identifier', name: '_foo' },
            },
          },
        ],
      },
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function createGetterWithoutReturn(line = 1, column = 0): unknown {
  return {
    type: 'MethodDefinition',
    kind: 'get',
    key: { type: 'Identifier', name: 'foo' },
    value: {
      type: 'FunctionExpression',
      body: {
        type: 'BlockStatement',
        body: [],
      },
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function createGetterWithEmptyBody(line = 1, column = 0): unknown {
  return {
    type: 'MethodDefinition',
    kind: 'get',
    key: { type: 'Identifier', name: 'foo' },
    value: {
      type: 'FunctionExpression',
      body: {
        type: 'BlockStatement',
        body: [],
      },
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function createGetterWithConditionalReturn(line = 1, column = 0): unknown {
  return {
    type: 'MethodDefinition',
    kind: 'get',
    key: { type: 'Identifier', name: 'foo' },
    value: {
      type: 'FunctionExpression',
      body: {
        type: 'BlockStatement',
        body: [
          {
            type: 'IfStatement',
            test: { type: 'Literal', value: true },
            consequent: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ReturnStatement',
                  argument: { type: 'Literal', value: 1 },
                },
              ],
            },
            alternate: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ReturnStatement',
                  argument: { type: 'Literal', value: 2 },
                },
              ],
            },
          },
        ],
      },
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function createSetterMethod(): unknown {
  return {
    type: 'MethodDefinition',
    kind: 'set',
    key: { type: 'Identifier', name: 'foo' },
    value: {
      type: 'FunctionExpression',
      params: [{ type: 'Identifier', name: 'value' }],
      body: {
        type: 'BlockStatement',
        body: [
          {
            type: 'ExpressionStatement',
            expression: {
              type: 'AssignmentExpression',
              left: {
                type: 'MemberExpression',
                object: { type: 'ThisExpression' },
                property: { type: 'Identifier', name: '_foo' },
              },
              right: { type: 'Identifier', name: 'value' },
            },
          },
        ],
      },
    },
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 30 },
    },
  }
}

function createRegularMethod(): unknown {
  return {
    type: 'MethodDefinition',
    kind: 'method',
    key: { type: 'Identifier', name: 'foo' },
    value: {
      type: 'FunctionExpression',
      body: {
        type: 'BlockStatement',
        body: [],
      },
    },
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 30 },
    },
  }
}

function createNonMethodDefinition(): unknown {
  return {
    type: 'FunctionDeclaration',
    id: { type: 'Identifier', name: 'foo' },
    body: {
      type: 'BlockStatement',
      body: [],
    },
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 10 },
    },
  }
}

describe('getter-return rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(getterReturnRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(getterReturnRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(getterReturnRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(getterReturnRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention getter in description', () => {
      expect(getterReturnRule.meta.docs?.description.toLowerCase()).toContain('getter')
    })
  })

  describe('create', () => {
    test('should return visitor with MethodDefinition method', () => {
      const { context } = createMockContext()
      const visitor = getterReturnRule.create(context)

      expect(visitor).toHaveProperty('MethodDefinition')
    })
  })

  describe('detecting missing return in getters', () => {
    test('should report getter without return statement', () => {
      const { context, reports } = createMockContext()
      const visitor = getterReturnRule.create(context)

      visitor.MethodDefinition(createGetterWithoutReturn())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('return')
    })

    test('should not report getter with return statement', () => {
      const { context, reports } = createMockContext()
      const visitor = getterReturnRule.create(context)

      visitor.MethodDefinition(createGetterWithReturn())

      expect(reports.length).toBe(0)
    })

    test('should report getter with empty body', () => {
      const { context, reports } = createMockContext()
      const visitor = getterReturnRule.create(context)

      visitor.MethodDefinition(createGetterWithEmptyBody())

      expect(reports.length).toBe(1)
    })

    test('should not report getter with conditional return', () => {
      const { context, reports } = createMockContext()
      const visitor = getterReturnRule.create(context)

      visitor.MethodDefinition(createGetterWithConditionalReturn())

      expect(reports.length).toBe(0)
    })

    test('should not report setter method', () => {
      const { context, reports } = createMockContext()
      const visitor = getterReturnRule.create(context)

      visitor.MethodDefinition(createSetterMethod())

      expect(reports.length).toBe(0)
    })

    test('should not report regular method', () => {
      const { context, reports } = createMockContext()
      const visitor = getterReturnRule.create(context)

      visitor.MethodDefinition(createRegularMethod())

      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = getterReturnRule.create(context)

      visitor.MethodDefinition(createGetterWithoutReturn(10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = getterReturnRule.create(context)

      expect(() => visitor.MethodDefinition(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = getterReturnRule.create(context)

      expect(() => visitor.MethodDefinition(undefined)).not.toThrow()
    })

    test('should handle non-MethodDefinition gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = getterReturnRule.create(context)

      expect(() => visitor.MethodDefinition(createNonMethodDefinition())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle getter without value', () => {
      const { context, reports } = createMockContext()
      const visitor = getterReturnRule.create(context)

      const node = { type: 'MethodDefinition', kind: 'get' }

      expect(() => visitor.MethodDefinition(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = getterReturnRule.create(context)

      const node = createGetterWithoutReturn()
      delete (node as Record<string, unknown>).loc

      expect(() => visitor.MethodDefinition(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })
})
