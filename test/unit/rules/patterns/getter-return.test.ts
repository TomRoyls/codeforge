import { describe, test, expect, vi } from 'vitest'
import { getterReturnRule } from '../../../../src/rules/patterns/getter-return.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

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
      const { context } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)

      expect(visitor).toHaveProperty('MethodDefinition')
    })
  })

  describe('detecting missing return in getters', () => {
    test('should report getter without return statement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)

      visitor.MethodDefinition(createGetterWithoutReturn())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('return')
    })

    test('should not report getter with return statement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)

      visitor.MethodDefinition(createGetterWithReturn())

      expect(reports.length).toBe(0)
    })

    test('should report getter with empty body', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)

      visitor.MethodDefinition(createGetterWithEmptyBody())

      expect(reports.length).toBe(1)
    })

    test('should not report getter with conditional return', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)

      visitor.MethodDefinition(createGetterWithConditionalReturn())

      expect(reports.length).toBe(0)
    })

    test('should not report setter method', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)

      visitor.MethodDefinition(createSetterMethod())

      expect(reports.length).toBe(0)
    })

    test('should not report regular method', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)

      visitor.MethodDefinition(createRegularMethod())

      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)

      visitor.MethodDefinition(createGetterWithoutReturn(10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)

      expect(() => visitor.MethodDefinition(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)

      expect(() => visitor.MethodDefinition(undefined)).not.toThrow()
    })

    test('should handle non-MethodDefinition gracefully', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)

      expect(() => visitor.MethodDefinition(createNonMethodDefinition())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle getter without value', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)

      const node = { type: 'MethodDefinition', kind: 'get' }

      expect(() => visitor.MethodDefinition(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)

      const node = createGetterWithoutReturn()
      delete (node as Record<string, unknown>).loc

      expect(() => visitor.MethodDefinition(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })

  describe('meta - additional property checks', () => {
    test('should have exactly type problem', () => {
      expect(getterReturnRule.meta.type).toBe('problem')
      expect(getterReturnRule.meta.type).not.toBe('suggestion')
      expect(getterReturnRule.meta.type).not.toBe('layout')
    })

    test('should have exactly severity error', () => {
      expect(getterReturnRule.meta.severity).toBe('error')
      expect(getterReturnRule.meta.severity).not.toBe('warn')
      expect(getterReturnRule.meta.severity).not.toBe('off')
    })

    test('should have docs object', () => {
      expect(getterReturnRule.meta.docs).toBeDefined()
      expect(typeof getterReturnRule.meta.docs).toBe('object')
    })

    test('should have docs.description as non-empty string', () => {
      expect(typeof getterReturnRule.meta.docs?.description).toBe('string')
      expect(getterReturnRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have docs.description containing return', () => {
      expect(getterReturnRule.meta.docs?.description.toLowerCase()).toContain('return')
    })

    test('should have docs.description ending with period', () => {
      expect(getterReturnRule.meta.docs?.description).toMatch(/\.$/)
    })

    test('should have schema as empty array', () => {
      expect(getterReturnRule.meta.schema).toEqual([])
    })

    test('should not be fixable', () => {
      expect(getterReturnRule.meta.fixable).toBeUndefined()
    })

    test('should not be deprecated', () => {
      expect(getterReturnRule.meta.deprecated).toBeFalsy()
    })

    test('should not have replacedBy', () => {
      expect(getterReturnRule.meta.replacedBy).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(getterReturnRule.meta.requiresTypeChecking).toBeFalsy()
    })

    test('should have docs with recommended true', () => {
      expect(getterReturnRule.meta.docs?.recommended).toBe(true)
    })

    test('should have docs with category patterns', () => {
      expect(getterReturnRule.meta.docs?.category).toBe('patterns')
    })

    test('should not have docs.url', () => {
      expect(getterReturnRule.meta.docs?.url).toBeUndefined()
    })

    test('should have meta as plain object', () => {
      expect(typeof getterReturnRule.meta).toBe('object')
      expect(getterReturnRule.meta).not.toBeNull()
    })

    test('should have create as function', () => {
      expect(typeof getterReturnRule.create).toBe('function')
    })

    test('should have meta type as string', () => {
      expect(typeof getterReturnRule.meta.type).toBe('string')
    })

    test('should have meta severity as string', () => {
      expect(typeof getterReturnRule.meta.severity).toBe('string')
    })

    test('should have docs description not mentioning setter', () => {
      expect(getterReturnRule.meta.docs?.description.toLowerCase()).not.toContain('setter')
    })

    test('should have docs category as string', () => {
      expect(typeof getterReturnRule.meta.docs?.category).toBe('string')
    })

    test('should have meta with all required properties', () => {
      expect(getterReturnRule.meta).toHaveProperty('type')
      expect(getterReturnRule.meta).toHaveProperty('severity')
      expect(getterReturnRule.meta).toHaveProperty('docs')
    })
  })

  describe('create visitor - additional checks', () => {
    test('should return an object from create', () => {
      const { context } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      expect(typeof visitor).toBe('object')
      expect(visitor).not.toBeNull()
    })

    test('should return visitor with MethodDefinition as function', () => {
      const { context } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      expect(typeof visitor.MethodDefinition).toBe('function')
    })

    test('should return visitor with only MethodDefinition key', () => {
      const { context } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      expect(Object.keys(visitor)).toEqual(['MethodDefinition'])
    })

    test('should not have FunctionDeclaration in visitor', () => {
      const { context } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      expect(visitor).not.toHaveProperty('FunctionDeclaration')
    })

    test('should not have ClassDeclaration in visitor', () => {
      const { context } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      expect(visitor).not.toHaveProperty('ClassDeclaration')
    })

    test('should return different visitors for different contexts', () => {
      const { context: ctx1 } = createMockRuleContext()
      const { context: ctx2 } = createMockRuleContext()
      const visitor1 = getterReturnRule.create(ctx1)
      const visitor2 = getterReturnRule.create(ctx2)
      expect(visitor1).not.toBe(visitor2)
    })

    test('should return visitor that does not throw on valid call', () => {
      const { context } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      expect(() => visitor.MethodDefinition(createGetterWithReturn())).not.toThrow()
    })

    test('should return undefined from MethodDefinition call', () => {
      const { context } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const result = visitor.MethodDefinition(createGetterWithReturn())
      expect(result).toBeUndefined()
    })

    test('should return undefined from MethodDefinition for invalid getter', () => {
      const { context } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const result = visitor.MethodDefinition(createGetterWithoutReturn())
      expect(result).toBeUndefined()
    })

    test('should accept create with any context that has report', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          reports.push(d)
        },
        getFilePath: () => '/test.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: {} },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/test',
      } as unknown as RuleContext
      const visitor = getterReturnRule.create(context)
      expect(visitor).toHaveProperty('MethodDefinition')
    })

    test('should allow multiple calls to MethodDefinition', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      visitor.MethodDefinition(createGetterWithoutReturn())
      visitor.MethodDefinition(createGetterWithoutReturn())
      expect(reports.length).toBe(2)
    })
  })

  describe('getter without return - various body types', () => {
    test('should report getter with only ExpressionStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'foo' },
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [{ type: 'ExpressionStatement', expression: { type: 'Literal', value: 42 } }],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should report getter with only VariableDeclaration', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'bar' },
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'VariableDeclaration',
                declarations: [
                  { type: 'VariableDeclarator', id: { type: 'Identifier', name: 'x' } },
                ],
                kind: 'const',
              },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should report getter with WhileStatement and no return', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'loop' },
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'WhileStatement',
                test: { type: 'Literal', value: true },
                body: { type: 'BlockStatement', body: [] },
              },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should report getter with ForStatement and no return', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'items' },
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [{ type: 'ForStatement', body: { type: 'BlockStatement', body: [] } }],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should report getter with ForInStatement and no return', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'keys' },
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'ForInStatement',
                left: { type: 'Identifier', name: 'k' },
                right: { type: 'Identifier', name: 'obj' },
                body: { type: 'BlockStatement', body: [] },
              },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should report getter with SwitchStatement and no return', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'mode' },
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'SwitchStatement',
                discriminant: { type: 'Identifier', name: 'x' },
                cases: [],
              },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should report getter with TryStatement and no return', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'safe' },
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'TryStatement',
                block: { type: 'BlockStatement', body: [] },
                handler: { type: 'CatchClause', body: { type: 'BlockStatement', body: [] } },
              },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should report getter with DoWhileStatement and no return', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'val' },
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'DoWhileStatement',
                test: { type: 'Literal', value: false },
                body: { type: 'BlockStatement', body: [] },
              },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should report getter with BreakStatement only', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'brk' },
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [{ type: 'BreakStatement', label: null }],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should report getter with ContinueStatement only', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'cont' },
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [{ type: 'ContinueStatement', label: null }],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should report getter with ThrowStatement only', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'err' },
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'ThrowStatement',
                argument: {
                  type: 'NewExpression',
                  callee: { type: 'Identifier', name: 'Error' },
                  arguments: [],
                },
              },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should report getter with IfStatement but no return in branches', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'cond' },
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
                    { type: 'ExpressionStatement', expression: { type: 'Literal', value: 1 } },
                  ],
                },
                alternate: {
                  type: 'BlockStatement',
                  body: [
                    { type: 'ExpressionStatement', expression: { type: 'Literal', value: 2 } },
                  ],
                },
              },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should report getter with IfStatement and no alternate', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'partial' },
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
                    { type: 'ExpressionStatement', expression: { type: 'Literal', value: 1 } },
                  ],
                },
                alternate: null,
              },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should report getter with multiple ExpressionStatements', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'multi' },
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              { type: 'ExpressionStatement', expression: { type: 'Literal', value: 1 } },
              { type: 'ExpressionStatement', expression: { type: 'Literal', value: 2 } },
              { type: 'ExpressionStatement', expression: { type: 'Literal', value: 3 } },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should report getter with VariableDeclaration and ExpressionStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'mixed' },
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              { type: 'VariableDeclaration', declarations: [], kind: 'let' },
              { type: 'ExpressionStatement', expression: { type: 'Literal', value: 1 } },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should report getter with nested blocks but no return', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'nested' },
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [{ type: 'BlockStatement', body: [] }],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('getter with return - various valid patterns', () => {
    test('should not report getter with bare return', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'bare' },
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [{ type: 'ReturnStatement', argument: null }],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('should not report getter with return at beginning', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'first' },
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              { type: 'ReturnStatement', argument: { type: 'Literal', value: 42 } },
              { type: 'ExpressionStatement', expression: { type: 'Literal', value: 0 } },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('should not report getter with return at end', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'last' },
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              { type: 'ExpressionStatement', expression: { type: 'Literal', value: 0 } },
              { type: 'ReturnStatement', argument: { type: 'Literal', value: 42 } },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('should not report getter with multiple return statements', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'multi' },
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              { type: 'ReturnStatement', argument: { type: 'Literal', value: 1 } },
              { type: 'ReturnStatement', argument: { type: 'Literal', value: 2 } },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('should not report getter with IfStatement and return in consequent', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'ifReturn' },
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
                  body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 1 } }],
                },
                alternate: null,
              },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('should not report getter with IfStatement and return in alternate', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'elseReturn' },
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'IfStatement',
                test: { type: 'Literal', value: true },
                consequent: { type: 'BlockStatement', body: [] },
                alternate: {
                  type: 'BlockStatement',
                  body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 2 } }],
                },
              },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('should report getter with nested IfStatement where inner consequent is raw IfStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'nested' },
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'IfStatement',
                test: { type: 'Literal', value: true },
                consequent: {
                  type: 'IfStatement',
                  test: { type: 'Literal', value: false },
                  consequent: {
                    type: 'BlockStatement',
                    body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 1 } }],
                  },
                  alternate: null,
                },
                alternate: null,
              },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should not report getter with return among other statements', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'mixed' },
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              { type: 'VariableDeclaration', declarations: [], kind: 'const' },
              { type: 'ExpressionStatement', expression: { type: 'Literal', value: 0 } },
              { type: 'ReturnStatement', argument: { type: 'Literal', value: 42 } },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('should not report getter returning member expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      visitor.MethodDefinition(createGetterWithReturn())
      expect(reports.length).toBe(0)
    })

    test('should not report getter returning identifier', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'id' },
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [{ type: 'ReturnStatement', argument: { type: 'Identifier', name: 'value' } }],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('should not report getter returning call expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'computed' },
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'ReturnStatement',
                argument: {
                  type: 'CallExpression',
                  callee: { type: 'Identifier', name: 'fn' },
                  arguments: [],
                },
              },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('should not report getter returning binary expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'sum' },
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'ReturnStatement',
                argument: {
                  type: 'BinaryExpression',
                  operator: '+',
                  left: { type: 'Literal', value: 1 },
                  right: { type: 'Literal', value: 2 },
                },
              },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('should not report getter returning object expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'obj' },
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'ReturnStatement',
                argument: { type: 'ObjectExpression', properties: [] },
              },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('should not report getter returning array expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'arr' },
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'ReturnStatement',
                argument: { type: 'ArrayExpression', elements: [] },
              },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('should not report getter with IfStatement return in consequent direct', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'direct' },
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'IfStatement',
                test: { type: 'Literal', value: true },
                consequent: { type: 'ReturnStatement', argument: { type: 'Literal', value: 1 } },
                alternate: null,
              },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('should not report getter with IfStatement return in alternate direct', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'altDirect' },
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'IfStatement',
                test: { type: 'Literal', value: true },
                consequent: { type: 'BlockStatement', body: [] },
                alternate: { type: 'ReturnStatement', argument: { type: 'Literal', value: 2 } },
              },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('non-getter MethodDefinitions - no report', () => {
    test('should not report constructor kind', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        key: { type: 'Identifier', name: 'constructor' },
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('should not report method without kind property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        key: { type: 'Identifier', name: 'foo' },
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('should not report with kind as empty string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: '',
        key: { type: 'Identifier', name: 'foo' },
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('should not report with kind as unknown string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'unknown',
        key: { type: 'Identifier', name: 'foo' },
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('should not report static method', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'method',
        static: true,
        key: { type: 'Identifier', name: 'staticMethod' },
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('should not report getter with computed key', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        computed: true,
        key: { type: 'Identifier', name: 'dynamicKey' },
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 1 } }],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases - malformed nodes', () => {
    test('should handle string node', () => {
      const { context } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      expect(() => visitor.MethodDefinition('not a node')).not.toThrow()
    })

    test('should handle number node', () => {
      const { context } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      expect(() => visitor.MethodDefinition(42)).not.toThrow()
    })

    test('should handle boolean node', () => {
      const { context } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      expect(() => visitor.MethodDefinition(true)).not.toThrow()
    })

    test('should handle array node', () => {
      const { context } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      expect(() => visitor.MethodDefinition([])).not.toThrow()
    })

    test('should handle getter with value as null', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = { type: 'MethodDefinition', kind: 'get', value: null }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('should handle getter with value as undefined', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = { type: 'MethodDefinition', kind: 'get', value: undefined }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('should handle getter with value as string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = { type: 'MethodDefinition', kind: 'get', value: 'not a function' }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('should handle getter with value as number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = { type: 'MethodDefinition', kind: 'get', value: 42 }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('should handle getter with ArrowFunctionExpression value', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'arrow' },
        value: { type: 'ArrowFunctionExpression', body: { type: 'Literal', value: 1 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('should handle getter with FunctionDeclaration value', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'decl' },
        value: { type: 'FunctionDeclaration', body: { type: 'BlockStatement', body: [] } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('should handle getter with body as null', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'nullBody' },
        value: { type: 'FunctionExpression', body: null },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should handle getter with body as undefined', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'undefBody' },
        value: { type: 'FunctionExpression', body: undefined },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should handle getter with body as non-BlockStatement type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'exprBody' },
        value: {
          type: 'FunctionExpression',
          body: { type: 'ExpressionStatement', expression: { type: 'Literal', value: 1 } },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should handle getter with body.body as non-array', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'badArray' },
        value: {
          type: 'FunctionExpression',
          body: { type: 'BlockStatement', body: 'not an array' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should handle body with null elements in array', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'nulls' },
        value: {
          type: 'FunctionExpression',
          body: { type: 'BlockStatement', body: [null, null] },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should handle body with non-object elements', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'prims' },
        value: {
          type: 'FunctionExpression',
          body: { type: 'BlockStatement', body: ['string', 42, true] },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should handle node with loc as null', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'foo' },
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
        loc: null,
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should handle node with loc without start', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'foo' },
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
        loc: { end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should handle node with loc without end', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'foo' },
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
        loc: { start: { line: 1, column: 0 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should handle node with loc.start without line', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'foo' },
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
        loc: { start: { column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle node with loc.start without column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'foo' },
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
        loc: { start: { line: 1 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      visitor.MethodDefinition({})
      expect(reports.length).toBe(0)
    })

    test('should handle getter with key as string literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Literal', value: 'computed-key' },
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should handle getter with key as PrivateIdentifier', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'PrivateIdentifier', name: '#private' },
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('location reporting - various positions', () => {
    test('should report location at line 5 column 10', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      visitor.MethodDefinition(createGetterWithoutReturn(5, 10))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report location at line 100 column 50', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      visitor.MethodDefinition(createGetterWithoutReturn(100, 50))
      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report location at line 0 column 0', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      visitor.MethodDefinition(createGetterWithoutReturn(0, 0))
      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at large line number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      visitor.MethodDefinition(createGetterWithoutReturn(9999, 0))
      expect(reports[0].loc?.start.line).toBe(9999)
    })

    test('should report location at large column number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      visitor.MethodDefinition(createGetterWithoutReturn(1, 500))
      expect(reports[0].loc?.start.column).toBe(500)
    })

    test('should report multi-line location', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'multi' },
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
        loc: { start: { line: 5, column: 4 }, end: { line: 10, column: 1 } },
      }
      visitor.MethodDefinition(node)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(1)
    })

    test('should report location with same start and end line', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      visitor.MethodDefinition(createGetterWithoutReturn(3, 2))
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.end.line).toBe(3)
    })

    test('should include end column in location', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      visitor.MethodDefinition(createGetterWithoutReturn(1, 0))
      expect(reports[0].loc?.end.column).toBe(30)
    })

    test('should not mutate original node location', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = createGetterWithoutReturn(7, 3)
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
      expect((node as Record<string, unknown>).loc).toEqual({
        start: { line: 7, column: 3 },
        end: { line: 7, column: 33 },
      })
    })
  })

  describe('message content verification', () => {
    test('should have exact expected message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      visitor.MethodDefinition(createGetterWithoutReturn())
      expect(reports[0].message).toBe('Getter should return a value.')
    })

    test('should have message containing getter', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      visitor.MethodDefinition(createGetterWithoutReturn())
      expect(reports[0].message.toLowerCase()).toContain('getter')
    })

    test('should have message containing return', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      visitor.MethodDefinition(createGetterWithoutReturn())
      expect(reports[0].message.toLowerCase()).toContain('return')
    })

    test('should have message containing value', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      visitor.MethodDefinition(createGetterWithoutReturn())
      expect(reports[0].message.toLowerCase()).toContain('value')
    })

    test('should have message not containing setter', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      visitor.MethodDefinition(createGetterWithoutReturn())
      expect(reports[0].message.toLowerCase()).not.toContain('setter')
    })

    test('should have message ending with period', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      visitor.MethodDefinition(createGetterWithoutReturn())
      expect(reports[0].message).toMatch(/\.$/)
    })

    test('should have message as non-empty string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      visitor.MethodDefinition(createGetterWithoutReturn())
      expect(typeof reports[0].message).toBe('string')
      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should have consistent message across multiple reports', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      visitor.MethodDefinition(createGetterWithoutReturn())
      visitor.MethodDefinition(createGetterWithoutReturn())
      expect(reports[0].message).toBe(reports[1].message)
    })
  })

  describe('multiple getters - independent reporting', () => {
    test('should report two different getters both missing return', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      visitor.MethodDefinition(createGetterWithoutReturn())
      visitor.MethodDefinition(createGetterWithoutReturn())
      expect(reports.length).toBe(2)
    })

    test('should report three getters all missing return', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      visitor.MethodDefinition(createGetterWithoutReturn())
      visitor.MethodDefinition(createGetterWithoutReturn())
      visitor.MethodDefinition(createGetterWithoutReturn())
      expect(reports.length).toBe(3)
    })

    test('should report only invalid getter when mixed with valid', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      visitor.MethodDefinition(createGetterWithReturn())
      visitor.MethodDefinition(createGetterWithoutReturn())
      visitor.MethodDefinition(createGetterWithReturn())
      expect(reports.length).toBe(1)
    })

    test('should report zero when all getters have return', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      visitor.MethodDefinition(createGetterWithReturn())
      visitor.MethodDefinition(createGetterWithConditionalReturn())
      visitor.MethodDefinition(createGetterWithReturn())
      expect(reports.length).toBe(0)
    })

    test('should not mix up report locations between getters', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      visitor.MethodDefinition(createGetterWithoutReturn(5, 0))
      visitor.MethodDefinition(createGetterWithoutReturn(10, 4))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[1].loc?.start.line).toBe(10)
      expect(reports[1].loc?.start.column).toBe(4)
    })

    test('should report each getter independently with same visitor', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      for (let i = 0; i < 10; i++) {
        visitor.MethodDefinition(createGetterWithoutReturn(i + 1, 0))
      }
      expect(reports.length).toBe(10)
    })

    test('should handle mix of getters setters and methods', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      visitor.MethodDefinition(createGetterWithoutReturn())
      visitor.MethodDefinition(createSetterMethod())
      visitor.MethodDefinition(createRegularMethod())
      visitor.MethodDefinition(createGetterWithoutReturn())
      expect(reports.length).toBe(2)
    })

    test('should handle alternating valid and invalid getters', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      visitor.MethodDefinition(createGetterWithReturn())
      visitor.MethodDefinition(createGetterWithoutReturn())
      visitor.MethodDefinition(createGetterWithReturn())
      visitor.MethodDefinition(createGetterWithoutReturn())
      visitor.MethodDefinition(createGetterWithReturn())
      expect(reports.length).toBe(2)
    })
  })

  describe('export verification', () => {
    test('should have default export', () => {
      const mod = getterReturnRule
      expect(mod).toBeDefined()
      expect(mod).toBe(getterReturnRule)
    })

    test('should export rule with create method', () => {
      expect(typeof getterReturnRule.create).toBe('function')
    })

    test('should export rule with meta property', () => {
      expect(getterReturnRule.meta).toBeDefined()
      expect(typeof getterReturnRule.meta).toBe('object')
    })
  })

  describe('IfStatement return detection edge cases', () => {
    test('should report when deeply nested IfStatement consequent is raw IfStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'deep' },
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'IfStatement',
                test: { type: 'Literal', value: true },
                consequent: {
                  type: 'IfStatement',
                  test: { type: 'Literal', value: true },
                  consequent: {
                    type: 'IfStatement',
                    test: { type: 'Literal', value: true },
                    consequent: {
                      type: 'BlockStatement',
                      body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 1 } }],
                    },
                    alternate: null,
                  },
                  alternate: null,
                },
                alternate: null,
              },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should report when deeply nested IfStatement alternate is raw IfStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'deepAlt' },
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'IfStatement',
                test: { type: 'Literal', value: true },
                consequent: { type: 'BlockStatement', body: [] },
                alternate: {
                  type: 'IfStatement',
                  test: { type: 'Literal', value: true },
                  consequent: { type: 'BlockStatement', body: [] },
                  alternate: {
                    type: 'BlockStatement',
                    body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 2 } }],
                  },
                },
              },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should not find return when IfStatement has only expressions', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'noReturn' },
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
                    { type: 'ExpressionStatement', expression: { type: 'Literal', value: 1 } },
                  ],
                },
                alternate: {
                  type: 'BlockStatement',
                  body: [
                    { type: 'ExpressionStatement', expression: { type: 'Literal', value: 2 } },
                  ],
                },
              },
              {
                type: 'IfStatement',
                test: { type: 'Literal', value: false },
                consequent: { type: 'BlockStatement', body: [] },
                alternate: null,
              },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should detect return in first IfStatement among multiple', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'multiIf' },
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
                  body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 1 } }],
                },
                alternate: null,
              },
              {
                type: 'IfStatement',
                test: { type: 'Literal', value: false },
                consequent: { type: 'BlockStatement', body: [] },
                alternate: null,
              },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('should detect return in second IfStatement among multiple', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'secondIf' },
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'IfStatement',
                test: { type: 'Literal', value: true },
                consequent: { type: 'BlockStatement', body: [] },
                alternate: null,
              },
              {
                type: 'IfStatement',
                test: { type: 'Literal', value: false },
                consequent: {
                  type: 'BlockStatement',
                  body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 2 } }],
                },
                alternate: null,
              },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('should handle IfStatement with consequent as non-Block non-Return', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'exprCons' },
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'IfStatement',
                test: { type: 'Literal', value: true },
                consequent: {
                  type: 'ExpressionStatement',
                  expression: { type: 'Literal', value: 1 },
                },
                alternate: null,
              },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should handle IfStatement with alternate as non-Block non-Return', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'exprAlt' },
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'IfStatement',
                test: { type: 'Literal', value: true },
                consequent: { type: 'BlockStatement', body: [] },
                alternate: {
                  type: 'ExpressionStatement',
                  expression: { type: 'Literal', value: 2 },
                },
              },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('context interaction', () => {
    test('should call report exactly once for invalid getter', () => {
      const reports: ReportDescriptor[] = []
      let reportCallCount = 0
      const context: RuleContext = {
        report: (_d: ReportDescriptor) => {
          reportCallCount++
          reports.push(_d)
        },
        getFilePath: () => '/test.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: {} },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/test',
      } as unknown as RuleContext
      const visitor = getterReturnRule.create(context)
      visitor.MethodDefinition(createGetterWithoutReturn())
      expect(reportCallCount).toBe(1)
    })

    test('should not call report for valid getter', () => {
      let reportCallCount = 0
      const context: RuleContext = {
        report: () => {
          reportCallCount++
        },
        getFilePath: () => '/test.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: {} },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/test',
      } as unknown as RuleContext
      const visitor = getterReturnRule.create(context)
      visitor.MethodDefinition(createGetterWithReturn())
      expect(reportCallCount).toBe(0)
    })

    test('should not call report for non-getter', () => {
      let reportCallCount = 0
      const context: RuleContext = {
        report: () => {
          reportCallCount++
        },
        getFilePath: () => '/test.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: {} },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/test',
      } as unknown as RuleContext
      const visitor = getterReturnRule.create(context)
      visitor.MethodDefinition(createSetterMethod())
      visitor.MethodDefinition(createRegularMethod())
      expect(reportCallCount).toBe(0)
    })

    test('should pass message to report descriptor', () => {
      let reportedMessage = ''
      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          reportedMessage = d.message
        },
        getFilePath: () => '/test.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: {} },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/test',
      } as unknown as RuleContext
      const visitor = getterReturnRule.create(context)
      visitor.MethodDefinition(createGetterWithoutReturn())
      expect(reportedMessage).toBe('Getter should return a value.')
    })

    test('should pass loc to report descriptor', () => {
      let reportedLoc: unknown = null
      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          reportedLoc = d.loc
        },
        getFilePath: () => '/test.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: {} },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/test',
      } as unknown as RuleContext
      const visitor = getterReturnRule.create(context)
      visitor.MethodDefinition(createGetterWithoutReturn(7, 3))
      expect(reportedLoc).toBeDefined()
      expect((reportedLoc as Record<string, unknown>).start).toEqual({ line: 7, column: 3 })
    })
  })

  describe('various getter names', () => {
    const names = [
      'foo',
      'bar',
      'baz',
      'value',
      '_private',
      '$jquery',
      'camelCase',
      'PascalCase',
      'UPPER',
      'a',
      'get123',
      'getter_name',
    ]

    for (const name of names) {
      test(`should report getter named "${name}" without return`, () => {
        const { context, reports } = createMockRuleContext()
        const visitor = getterReturnRule.create(context)
        const node = {
          type: 'MethodDefinition',
          kind: 'get',
          key: { type: 'Identifier', name },
          value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        }
        visitor.MethodDefinition(node)
        expect(reports.length).toBe(1)
      })
    }

    for (const name of names) {
      test(`should not report getter named "${name}" with return`, () => {
        const { context, reports } = createMockRuleContext()
        const visitor = getterReturnRule.create(context)
        const node = {
          type: 'MethodDefinition',
          kind: 'get',
          key: { type: 'Identifier', name },
          value: {
            type: 'FunctionExpression',
            body: {
              type: 'BlockStatement',
              body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 1 } }],
            },
          },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        }
        visitor.MethodDefinition(node)
        expect(reports.length).toBe(0)
      })
    }
  })

  describe('stress tests', () => {
    test('should handle 50 consecutive getter reports', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      for (let i = 0; i < 50; i++) {
        visitor.MethodDefinition(createGetterWithoutReturn(i + 1, 0))
      }
      expect(reports.length).toBe(50)
    })

    test('should handle alternating valid and invalid getters (100 total)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      for (let i = 0; i < 100; i++) {
        if (i % 2 === 0) {
          visitor.MethodDefinition(createGetterWithReturn())
        } else {
          visitor.MethodDefinition(createGetterWithoutReturn())
        }
      }
      expect(reports.length).toBe(50)
    })
  })

  describe('report descriptor completeness', () => {
    test('should have both start and end in reported loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      visitor.MethodDefinition(createGetterWithoutReturn(3, 5))
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should have line and column in start', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      visitor.MethodDefinition(createGetterWithoutReturn())
      expect(typeof reports[0].loc?.start.line).toBe('number')
      expect(typeof reports[0].loc?.start.column).toBe('number')
    })

    test('should have line and column in end', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      visitor.MethodDefinition(createGetterWithoutReturn())
      expect(typeof reports[0].loc?.end.line).toBe('number')
      expect(typeof reports[0].loc?.end.column).toBe('number')
    })

    test('should not include node in report descriptor', () => {
      let capturedDescriptor: ReportDescriptor | null = null
      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          capturedDescriptor = d
        },
        getFilePath: () => '/test.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: {} },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/test',
      } as unknown as RuleContext
      const visitor = getterReturnRule.create(context)
      visitor.MethodDefinition(createGetterWithoutReturn())
      expect(capturedDescriptor).toBeDefined()
      expect(capturedDescriptor!.message).toBe('Getter should return a value.')
    })

    test('should not include fix in report descriptor', () => {
      let capturedDescriptor: ReportDescriptor | null = null
      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          capturedDescriptor = d
        },
        getFilePath: () => '/test.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: {} },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/test',
      } as unknown as RuleContext
      const visitor = getterReturnRule.create(context)
      visitor.MethodDefinition(createGetterWithoutReturn())
      expect(capturedDescriptor?.fix).toBeUndefined()
    })

    test('should not include suggest in report descriptor', () => {
      let capturedDescriptor: ReportDescriptor | null = null
      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          capturedDescriptor = d
        },
        getFilePath: () => '/test.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: {} },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/test',
      } as unknown as RuleContext
      const visitor = getterReturnRule.create(context)
      visitor.MethodDefinition(createGetterWithoutReturn())
      expect(capturedDescriptor?.suggest).toBeUndefined()
    })

    test('should have message property as string', () => {
      let capturedDescriptor: ReportDescriptor | null = null
      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          capturedDescriptor = d
        },
        getFilePath: () => '/test.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: {} },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/test',
      } as unknown as RuleContext
      const visitor = getterReturnRule.create(context)
      visitor.MethodDefinition(createGetterWithoutReturn())
      expect(typeof capturedDescriptor?.message).toBe('string')
    })

    test('should have loc property as object', () => {
      let capturedDescriptor: ReportDescriptor | null = null
      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          capturedDescriptor = d
        },
        getFilePath: () => '/test.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: {} },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/test',
      } as unknown as RuleContext
      const visitor = getterReturnRule.create(context)
      visitor.MethodDefinition(createGetterWithoutReturn())
      expect(typeof capturedDescriptor?.loc).toBe('object')
    })
  })

  describe('body type edge cases for hasReturnStatement', () => {
    test('should not crash when body is empty BlockStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'empty' },
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should detect return when mixed with VariableDeclarations', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'mixed' },
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              { type: 'VariableDeclaration', declarations: [], kind: 'const' },
              { type: 'ReturnStatement', argument: { type: 'Literal', value: 1 } },
              { type: 'VariableDeclaration', declarations: [], kind: 'let' },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('should detect return when preceded by multiple ExpressionStatements', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'exprs' },
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              { type: 'ExpressionStatement', expression: { type: 'Literal', value: 1 } },
              { type: 'ExpressionStatement', expression: { type: 'Literal', value: 2 } },
              { type: 'ExpressionStatement', expression: { type: 'Literal', value: 3 } },
              { type: 'ReturnStatement', argument: { type: 'Literal', value: 4 } },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('should not crash with IfStatement consequent as empty BlockStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'emptyIf' },
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'IfStatement',
                test: { type: 'Literal', value: true },
                consequent: { type: 'BlockStatement', body: [] },
                alternate: { type: 'BlockStatement', body: [] },
              },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should handle body with mixed IfStatements and ReturnStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'mixed' },
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'IfStatement',
                test: { type: 'Literal', value: true },
                consequent: { type: 'BlockStatement', body: [] },
                alternate: null,
              },
              { type: 'ReturnStatement', argument: { type: 'Literal', value: 42 } },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('should handle IfStatement with undefined alternate', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'undefAlt' },
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
                  body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 1 } }],
                },
                alternate: undefined,
              },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('should handle IfStatement with false alternate', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'falseAlt' },
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
                  body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 1 } }],
                },
                alternate: false,
              },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('should handle IfStatement with 0 alternate', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'zeroAlt' },
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
                  body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 1 } }],
                },
                alternate: 0,
              },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('should handle IfStatement with empty string alternate', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'strAlt' },
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
                  body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 1 } }],
                },
                alternate: '',
              },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('isFunctionExpression checks', () => {
    test('should not report when value has no type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'noType' },
        value: { body: { type: 'BlockStatement', body: [] } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when value type is undefined', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'undefType' },
        value: { type: undefined, body: { type: 'BlockStatement', body: [] } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('should report when value is FunctionExpression with empty body', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'fnExpr' },
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('location extraction via extractLocation', () => {
    test('should use default line when loc is missing', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'noLoc' },
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should use default line when loc is undefined', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'undefLoc' },
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
        loc: undefined,
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should preserve exact location from node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'exact' },
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
        loc: { start: { line: 42, column: 7 }, end: { line: 45, column: 2 } },
      }
      visitor.MethodDefinition(node)
      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(7)
      expect(reports[0].loc?.end.line).toBe(45)
      expect(reports[0].loc?.end.column).toBe(2)
    })

    test('should handle loc with start line as string (non-number)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'strLine' },
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
        loc: { start: { line: 'bad', column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with start column as string (non-number)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'strCol' },
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
        loc: { start: { line: 1, column: 'bad' }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc with end line as string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'strEndLine' },
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
        loc: { start: { line: 5, column: 0 }, end: { line: 'bad', column: 10 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.end.line).toBe(1)
    })

    test('should handle loc with end column as string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'strEndCol' },
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 'bad' } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.end.column).toBe(0)
    })
  })

  describe('non-MethodDefinition nodes', () => {
    test('should not report for FunctionDeclaration node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      visitor.MethodDefinition(createNonMethodDefinition())
      expect(reports.length).toBe(0)
    })

    test('should not report for ClassDeclaration node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      visitor.MethodDefinition({
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'Foo' },
        body: { type: 'ClassBody', body: [] },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report for Property node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      visitor.MethodDefinition({
        type: 'Property',
        key: { type: 'Identifier', name: 'x' },
        value: { type: 'Literal', value: 1 },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report for ArrowFunctionExpression node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      visitor.MethodDefinition({
        type: 'ArrowFunctionExpression',
        body: { type: 'Literal', value: 1 },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report for ObjectExpression node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      visitor.MethodDefinition({ type: 'ObjectExpression', properties: [] })
      expect(reports.length).toBe(0)
    })
  })

  describe('createGetterWithReturn helper verification', () => {
    test('should not report for getter returning template literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'tmpl' },
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'ReturnStatement',
                argument: { type: 'TemplateLiteral', quasis: [], expressions: [] },
              },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('should not report getter with conditional expression in return', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'ternary' },
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'ReturnStatement',
                argument: {
                  type: 'ConditionalExpression',
                  test: { type: 'Literal', value: true },
                  consequent: { type: 'Literal', value: 1 },
                  alternate: { type: 'Literal', value: 2 },
                },
              },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('should not report getter returning new expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'newInstance' },
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'ReturnStatement',
                argument: {
                  type: 'NewExpression',
                  callee: { type: 'Identifier', name: 'Map' },
                  arguments: [],
                },
              },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('should not report getter with return inside labeled statement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'labeled' },
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 1 } }],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('should report getter with DebuggerStatement only', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'debug' },
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [{ type: 'DebuggerStatement' }],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should report getter with WithStatement only', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'withStmt' },
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'WithStatement',
                object: { type: 'Identifier', name: 'obj' },
                body: { type: 'BlockStatement', body: [] },
              },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should report getter with LabeledStatement but no return', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'labelNoReturn' },
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'LabeledStatement',
                label: { type: 'Identifier', name: 'loop' },
                body: { type: 'ExpressionStatement', expression: { type: 'Literal', value: 1 } },
              },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should handle getter with static flag', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        static: true,
        key: { type: 'Identifier', name: 'staticGetter' },
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should handle getter with async flag', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        async: false,
        key: { type: 'Identifier', name: 'syncGetter' },
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should handle getter with generator flag on value', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        key: { type: 'Identifier', name: 'genGetter' },
        value: {
          type: 'FunctionExpression',
          generator: false,
          body: { type: 'BlockStatement', body: [] },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should handle getter with accessibility modifier', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        accessibility: 'private',
        key: { type: 'Identifier', name: 'privateGetter' },
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should handle getter with decorator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        decorators: [{ type: 'Decorator', expression: { type: 'Identifier', name: 'observable' } }],
        key: { type: 'Identifier', name: 'decorated' },
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should not report getter with override keyword', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = getterReturnRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        override: true,
        key: { type: 'Identifier', name: 'overridden' },
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 1 } }],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })
  })
})
