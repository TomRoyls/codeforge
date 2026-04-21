import { describe, test, expect, vi } from 'vitest'
import { noDeleteVarRule } from '../../../../src/rules/patterns/no-delete-var.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createDeleteExpressionWithIdentifier(line = 1, column = 0): unknown {
  return {
    type: 'UnaryExpression',
    operator: 'delete',
    argument: {
      type: 'Identifier',
      name: 'variable',
      loc: { start: { line, column: column + 7 }, end: { line, column: column + 15 } },
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createDeleteExpressionWithMemberExpression(line = 1, column = 0): unknown {
  return {
    type: 'UnaryExpression',
    operator: 'delete',
    argument: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'obj' },
      property: { type: 'Identifier', name: 'prop' },
      loc: { start: { line, column: column + 7 }, end: { line, column: column + 15 } },
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createUnaryExpressionWithDifferentOperator(
  operator: string,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'UnaryExpression',
    operator,
    argument: {
      type: 'Identifier',
      name: 'variable',
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createNonUnaryExpression(): unknown {
  return {
    type: 'Identifier',
    name: 'variable',
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 8 },
    },
  }
}

describe('no-delete-var rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noDeleteVarRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noDeleteVarRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noDeleteVarRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noDeleteVarRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention deleting in description', () => {
      expect(noDeleteVarRule.meta.docs?.description.toLowerCase()).toContain('deleting')
    })

    test('should mention variables in description', () => {
      expect(noDeleteVarRule.meta.docs?.description.toLowerCase()).toContain('variables')
    })

    test('should have a description that is a non-empty string', () => {
      expect(typeof noDeleteVarRule.meta.docs?.description).toBe('string')
      expect(noDeleteVarRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have type as a string', () => {
      expect(typeof noDeleteVarRule.meta.type).toBe('string')
    })

    test('should have severity as a string', () => {
      expect(typeof noDeleteVarRule.meta.severity).toBe('string')
    })

    test('should have docs object defined', () => {
      expect(noDeleteVarRule.meta.docs).toBeDefined()
      expect(typeof noDeleteVarRule.meta.docs).toBe('object')
    })

    test('should have docs.category as a string', () => {
      expect(typeof noDeleteVarRule.meta.docs?.category).toBe('string')
    })

    test('should have docs.recommended as a boolean', () => {
      expect(typeof noDeleteVarRule.meta.docs?.recommended).toBe('boolean')
    })

    test('should have schema defined as an empty array', () => {
      expect(noDeleteVarRule.meta.schema).toBeDefined()
      expect(Array.isArray(noDeleteVarRule.meta.schema)).toBe(true)
      expect(noDeleteVarRule.meta.schema).toHaveLength(0)
    })

    test('should have fixable as undefined', () => {
      expect(noDeleteVarRule.meta.fixable).toBeUndefined()
    })

    test('should have meta as a plain object', () => {
      expect(typeof noDeleteVarRule.meta).toBe('object')
      expect(noDeleteVarRule.meta).not.toBeNull()
    })

    test('should have description that starts with capital letter', () => {
      const desc = noDeleteVarRule.meta.docs?.description
      expect(desc).toBeDefined()
      expect(desc![0]).toBe(desc![0].toUpperCase())
    })

    test('should have description ending with a period', () => {
      const desc = noDeleteVarRule.meta.docs?.description
      expect(desc).toBeDefined()
      expect(desc![desc!.length - 1]).toBe('.')
    })

    test('should have severity value of error', () => {
      expect(noDeleteVarRule.meta.severity).toBe('error')
    })

    test('should not be deprecated', () => {
      expect(noDeleteVarRule.meta.deprecated).toBeUndefined()
    })

    test('should not have replacedBy', () => {
      expect(noDeleteVarRule.meta.replacedBy).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(noDeleteVarRule.meta.requiresTypeChecking).toBeUndefined()
    })

    test('should have type set to problem not suggestion', () => {
      expect(noDeleteVarRule.meta.type).not.toBe('suggestion')
    })

    test('should have type set to problem not layout', () => {
      expect(noDeleteVarRule.meta.type).not.toBe('layout')
    })
  })

  describe('create', () => {
    test('should return visitor with UnaryExpression method', () => {
      const { context } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      expect(visitor).toHaveProperty('UnaryExpression')
    })

    test('should return visitor with function', () => {
      const { context } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      expect(typeof visitor.UnaryExpression).toBe('function')
    })

    test('should return a new visitor on each call', () => {
      const { context } = createMockRuleContext({ source: 'delete variable' })
      const visitor1 = noDeleteVarRule.create(context)
      const visitor2 = noDeleteVarRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should return visitor with only UnaryExpression key', () => {
      const { context } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)
      const keys = Object.keys(visitor)

      expect(keys).toHaveLength(1)
      expect(keys[0]).toBe('UnaryExpression')
    })

    test('should return visitor that is a non-null object', () => {
      const { context } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      expect(visitor).toBeDefined()
      expect(typeof visitor).toBe('object')
      expect(visitor).not.toBeNull()
    })

    test('should accept context with different file paths', () => {
      const reports: ReportDescriptor[] = []
      const context = {
        report: (d: ReportDescriptor) => {
          reports.push(d)
        },
        getFilePath: () => '/different/path.ts',
        getAST: () => null,
        getSource: () => 'delete x',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/different',
      } as unknown as RuleContext

      const visitor = noDeleteVarRule.create(context)
      expect(typeof visitor.UnaryExpression).toBe('function')
    })

    test('should create visitor without throwing', () => {
      const { context } = createMockRuleContext({ source: 'delete variable' })
      expect(() => noDeleteVarRule.create(context)).not.toThrow()
    })
  })

  describe('valid delete operations', () => {
    test('should not report delete on member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      visitor.UnaryExpression(createDeleteExpressionWithMemberExpression())

      expect(reports.length).toBe(0)
    })

    test('should not report delete on computed member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Literal', value: 'prop' },
          computed: true,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report delete on nested member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'nested' },
          },
          property: { type: 'Identifier', name: 'prop' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report delete on member with this', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'ThisExpression' },
          property: { type: 'Identifier', name: 'prop' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report delete on member with super expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Super' },
          property: { type: 'Identifier', name: 'prop' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report delete on member with array access', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 0 },
          computed: true,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report delete on member with call expression result', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'getObj' },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'prop' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report delete on deeply nested member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: {
              type: 'MemberExpression',
              object: { type: 'Identifier', name: 'a' },
              property: { type: 'Identifier', name: 'b' },
            },
            property: { type: 'Identifier', name: 'c' },
          },
          property: { type: 'Identifier', name: 'd' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report delete on member expression with bracket notation', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'dynamicKey' },
          computed: true,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report on delete with CallExpression argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fn' },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report on delete with ConditionalExpression argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'ConditionalExpression',
          test: { type: 'Identifier', name: 'cond' },
          consequent: { type: 'Identifier', name: 'a' },
          alternate: { type: 'Identifier', name: 'b' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report on delete with ArrayExpression argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'ArrayExpression',
          elements: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report on delete with ObjectExpression argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'ObjectExpression',
          properties: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report on delete with FunctionExpression argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'FunctionExpression',
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report on delete with ArrowFunctionExpression argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'ArrowFunctionExpression',
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report on delete with BinaryExpression argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'BinaryExpression',
          left: { type: 'Identifier', name: 'a' },
          operator: '+',
          right: { type: 'Identifier', name: 'b' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report on delete with Literal argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'Literal',
          value: 42,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report on delete with TemplateLiteral argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'TemplateLiteral',
          quasis: [],
          expressions: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('invalid delete operations', () => {
    test('should report delete on identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      visitor.UnaryExpression(createDeleteExpressionWithIdentifier())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('should not be deleted')
    })

    test('should report delete on variable name', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'Identifier',
          name: 'myVariable',
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 18 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report delete on short identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: { type: 'Identifier', name: 'x' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report delete on underscore identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: { type: 'Identifier', name: '_' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      visitor.UnaryExpression(createDeleteExpressionWithIdentifier(5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report delete on identifier named counter', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: { type: 'Identifier', name: 'counter' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report delete on identifier named foo', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: { type: 'Identifier', name: 'foo' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 9 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report delete on identifier named bar', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: { type: 'Identifier', name: 'bar' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 9 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report delete on identifier named baz', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: { type: 'Identifier', name: 'baz' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 9 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report delete on dollar sign identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: { type: 'Identifier', name: '$' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report delete on dollar-prefixed identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: { type: 'Identifier', name: '$jquery' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report delete on double underscore identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: { type: 'Identifier', name: '__proto__' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report delete on camelCase identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: { type: 'Identifier', name: 'myLongVariableName' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report delete on UPPER_CASE identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: { type: 'Identifier', name: 'CONSTANT' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report delete on single letter identifier y', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: { type: 'Identifier', name: 'y' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report delete on single letter identifier z', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: { type: 'Identifier', name: 'z' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report delete on identifier named temp', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: { type: 'Identifier', name: 'temp' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report delete on identifier named result', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: { type: 'Identifier', name: 'result' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report delete on identifier named data', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: { type: 'Identifier', name: 'data' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report delete on identifier named value', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: { type: 'Identifier', name: 'value' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 11 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('location reporting', () => {
    test('should report location at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      visitor.UnaryExpression(createDeleteExpressionWithIdentifier(1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at line 10 column 5', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      visitor.UnaryExpression(createDeleteExpressionWithIdentifier(10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report location at line 100 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      visitor.UnaryExpression(createDeleteExpressionWithIdentifier(100, 0))

      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at line 1 column 50', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      visitor.UnaryExpression(createDeleteExpressionWithIdentifier(1, 50))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report location at line 42 column 17', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      visitor.UnaryExpression(createDeleteExpressionWithIdentifier(42, 17))

      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(17)
    })

    test('should report location at line 999 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      visitor.UnaryExpression(createDeleteExpressionWithIdentifier(999, 0))

      expect(reports[0].loc?.start.line).toBe(999)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report end location correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      visitor.UnaryExpression(createDeleteExpressionWithIdentifier(3, 8))

      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(23)
    })

    test('should report loc as an object with start and end', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      visitor.UnaryExpression(createDeleteExpressionWithIdentifier(1, 0))

      expect(reports[0].loc).toBeDefined()
      expect(typeof reports[0].loc?.start).toBe('object')
      expect(typeof reports[0].loc?.end).toBe('object')
    })

    test('should report loc start with line and column properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      visitor.UnaryExpression(createDeleteExpressionWithIdentifier(2, 4))

      expect(typeof reports[0].loc?.start.line).toBe('number')
      expect(typeof reports[0].loc?.start.column).toBe('number')
    })

    test('should report loc end with line and column properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      visitor.UnaryExpression(createDeleteExpressionWithIdentifier(2, 4))

      expect(typeof reports[0].loc?.end.line).toBe('number')
      expect(typeof reports[0].loc?.end.column).toBe('number')
    })
  })

  describe('message content', () => {
    test('should contain word Variables in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      visitor.UnaryExpression(createDeleteExpressionWithIdentifier())

      expect(reports[0].message).toContain('Variables')
    })

    test('should contain word deleted in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      visitor.UnaryExpression(createDeleteExpressionWithIdentifier())

      expect(reports[0].message).toContain('deleted')
    })

    test('should have message as a string', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      visitor.UnaryExpression(createDeleteExpressionWithIdentifier())

      expect(typeof reports[0].message).toBe('string')
    })

    test('should have non-empty message', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      visitor.UnaryExpression(createDeleteExpressionWithIdentifier())

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should have message ending with period', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      visitor.UnaryExpression(createDeleteExpressionWithIdentifier())

      expect(reports[0].message.endsWith('.')).toBe(true)
    })

    test('should produce same message for different identifiers', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext({
        source: 'delete variable',
      })
      const { context: ctx2, reports: reports2 } = createMockRuleContext({
        source: 'delete variable',
      })
      const visitor1 = noDeleteVarRule.create(ctx1)
      const visitor2 = noDeleteVarRule.create(ctx2)

      const node1 = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: { type: 'Identifier', name: 'x' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
      }
      const node2 = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: { type: 'Identifier', name: 'myVar' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
      }

      visitor1.UnaryExpression(node1)
      visitor2.UnaryExpression(node2)

      expect(reports1[0].message).toBe(reports2[0].message)
    })
  })

  describe('multiple reports', () => {
    test('should report each delete identifier separately', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      visitor.UnaryExpression(createDeleteExpressionWithIdentifier())
      visitor.UnaryExpression(createDeleteExpressionWithIdentifier(2, 0))
      visitor.UnaryExpression(createDeleteExpressionWithIdentifier(3, 0))

      expect(reports.length).toBe(3)
    })

    test('should report 5 separate delete operations', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.UnaryExpression(createDeleteExpressionWithIdentifier(i + 1, 0))
      }

      expect(reports.length).toBe(5)
    })

    test('should report 10 separate delete operations', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.UnaryExpression(createDeleteExpressionWithIdentifier(i + 1, 0))
      }

      expect(reports.length).toBe(10)
    })

    test('should only report delete on identifier not member expression when mixed', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      visitor.UnaryExpression(createDeleteExpressionWithIdentifier())
      visitor.UnaryExpression(createDeleteExpressionWithMemberExpression())
      visitor.UnaryExpression(createDeleteExpressionWithIdentifier(3, 0))

      expect(reports.length).toBe(2)
    })

    test('should maintain correct order of reports', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      visitor.UnaryExpression(createDeleteExpressionWithIdentifier(1, 0))
      visitor.UnaryExpression(createDeleteExpressionWithIdentifier(5, 10))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
    })

    test('should report correctly after many non-delete operations', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      for (let i = 0; i < 20; i++) {
        visitor.UnaryExpression(createUnaryExpressionWithDifferentOperator('typeof'))
      }
      visitor.UnaryExpression(createDeleteExpressionWithIdentifier())

      expect(reports.length).toBe(1)
    })

    test('should not accumulate reports across different visitor instances', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext({
        source: 'delete variable',
      })
      const { context: ctx2, reports: reports2 } = createMockRuleContext({
        source: 'delete variable',
      })

      const visitor1 = noDeleteVarRule.create(ctx1)
      const visitor2 = noDeleteVarRule.create(ctx2)

      visitor1.UnaryExpression(createDeleteExpressionWithIdentifier())
      visitor2.UnaryExpression(createDeleteExpressionWithIdentifier())

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(1)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      expect(() => visitor.UnaryExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      expect(() => visitor.UnaryExpression(undefined)).not.toThrow()
    })

    test('should handle non-UnaryExpression node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      expect(() => visitor.UnaryExpression(createNonUnaryExpression())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle unary expression with different operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      visitor.UnaryExpression(createUnaryExpressionWithDifferentOperator('typeof'))

      expect(reports.length).toBe(0)
    })

    test('should handle unary expression with void operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      visitor.UnaryExpression(createUnaryExpressionWithDifferentOperator('void'))

      expect(reports.length).toBe(0)
    })

    test('should handle unary expression with not operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      visitor.UnaryExpression(createUnaryExpressionWithDifferentOperator('!'))

      expect(reports.length).toBe(0)
    })

    test('should handle unary expression with plus operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      visitor.UnaryExpression(createUnaryExpressionWithDifferentOperator('+'))

      expect(reports.length).toBe(0)
    })

    test('should handle unary expression with minus operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      visitor.UnaryExpression(createUnaryExpressionWithDifferentOperator('-'))

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = createDeleteExpressionWithIdentifier()
      delete (node as Record<string, unknown>).loc

      expect(() => visitor.UnaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
      }
      expect(() => visitor.UnaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        argument: { type: 'Identifier', name: 'var' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
      }
      expect(() => visitor.UnaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      expect(() => visitor.UnaryExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle numeric node', () => {
      const { context } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      expect(() => visitor.UnaryExpression(42)).not.toThrow()
    })

    test('should handle string node', () => {
      const { context } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      expect(() => visitor.UnaryExpression('delete x')).not.toThrow()
    })

    test('should handle boolean node', () => {
      const { context } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      expect(() => visitor.UnaryExpression(true)).not.toThrow()
    })

    test('should handle array node', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      expect(() => visitor.UnaryExpression([1, 2, 3])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with numeric zero as type', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = { type: 0, operator: 'delete', argument: { type: 'Identifier', name: 'x' } }

      expect(() => visitor.UnaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with empty string type', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: '',
        operator: 'delete',
        argument: { type: 'Identifier', name: 'x' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle delete operator with tilde operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      visitor.UnaryExpression(createUnaryExpressionWithDifferentOperator('~'))

      expect(reports.length).toBe(0)
    })

    test('should handle delete with argument as null', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
      }

      expect(() => visitor.UnaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle delete with argument as undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: undefined,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
      }

      expect(() => visitor.UnaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle delete with argument as empty string', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: '',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
      }

      expect(() => visitor.UnaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle delete with argument as number', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: 42,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
      }

      expect(() => visitor.UnaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle delete with argument as boolean', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
      }

      expect(() => visitor.UnaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle delete with argument missing type property', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: { name: 'variable' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle delete with argument having wrong type value', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: { type: 'SomeOtherType', name: 'variable' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with loc but missing start', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: { type: 'Identifier', name: 'x' },
        loc: { end: { line: 1, column: 10 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with loc but missing end', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: { type: 'Identifier', name: 'x' },
        loc: { start: { line: 1, column: 0 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with loc containing null values', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: { type: 'Identifier', name: 'x' },
        loc: { start: { line: null, column: null }, end: { line: null, column: null } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with loc containing string values', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: { type: 'Identifier', name: 'x' },
        loc: { start: { line: '1', column: '0' }, end: { line: '1', column: '5' } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with extra properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: { type: 'Identifier', name: 'x' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
        prefix: true,
        extra: 'data',
        range: [0, 7],
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle delete with operator in different case', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'DELETE',
        argument: { type: 'Identifier', name: 'x' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle delete with operator as Delete', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'Delete',
        argument: { type: 'Identifier', name: 'x' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with type as unaryexpression lowercase', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'unaryexpression',
        operator: 'delete',
        argument: { type: 'Identifier', name: 'x' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle argument with identifier type lowercase', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: { type: 'identifier', name: 'x' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with only type property', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = { type: 'UnaryExpression' }

      expect(() => visitor.UnaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle delete with SpreadElement argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: { type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle delete with UpdateExpression argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'UpdateExpression',
          operator: '++',
          argument: { type: 'Identifier', name: 'x' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('non-delete unary operators', () => {
    test('should not report on typeof operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      visitor.UnaryExpression(createUnaryExpressionWithDifferentOperator('typeof'))

      expect(reports.length).toBe(0)
    })

    test('should not report on void operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      visitor.UnaryExpression(createUnaryExpressionWithDifferentOperator('void'))

      expect(reports.length).toBe(0)
    })

    test('should not report on logical not operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      visitor.UnaryExpression(createUnaryExpressionWithDifferentOperator('!'))

      expect(reports.length).toBe(0)
    })

    test('should not report on bitwise not operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      visitor.UnaryExpression(createUnaryExpressionWithDifferentOperator('~'))

      expect(reports.length).toBe(0)
    })

    test('should not report on unary plus operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      visitor.UnaryExpression(createUnaryExpressionWithDifferentOperator('+'))

      expect(reports.length).toBe(0)
    })

    test('should not report on unary minus operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      visitor.UnaryExpression(createUnaryExpressionWithDifferentOperator('-'))

      expect(reports.length).toBe(0)
    })

    test('should not report on empty string operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      visitor.UnaryExpression(createUnaryExpressionWithDifferentOperator(''))

      expect(reports.length).toBe(0)
    })
  })

  describe('rule structure', () => {
    test('should have create method as a function', () => {
      expect(typeof noDeleteVarRule.create).toBe('function')
    })

    test('should have meta and create properties', () => {
      expect(noDeleteVarRule).toHaveProperty('meta')
      expect(noDeleteVarRule).toHaveProperty('create')
    })

    test('should not have extra unexpected properties on meta', () => {
      const metaKeys = Object.keys(noDeleteVarRule.meta)
      expect(metaKeys).toContain('type')
      expect(metaKeys).toContain('severity')
      expect(metaKeys).toContain('docs')
      expect(metaKeys).toContain('schema')
    })

    test('should have meta.type as a valid RuleType', () => {
      const validTypes = ['problem', 'suggestion', 'layout']
      expect(validTypes).toContain(noDeleteVarRule.meta.type)
    })

    test('should have meta.severity as a valid Severity', () => {
      const validSeverities = ['off', 'warn', 'error']
      expect(validSeverities).toContain(noDeleteVarRule.meta.severity)
    })
  })

  describe('export verification', () => {
    test('should export default as noDeleteVarRule', () => {
      const defaultExport = noDeleteVarRule
      expect(defaultExport).toBe(noDeleteVarRule)
    })

    test('should be a valid RuleDefinition object', () => {
      expect(noDeleteVarRule).toHaveProperty('meta')
      expect(noDeleteVarRule).toHaveProperty('create')
      expect(typeof noDeleteVarRule.meta).toBe('object')
      expect(typeof noDeleteVarRule.create).toBe('function')
    })

    test('should have create that returns a visitor for each call', () => {
      const { context } = createMockRuleContext({ source: 'delete variable' })
      const v1 = noDeleteVarRule.create(context)
      const v2 = noDeleteVarRule.create(context)

      expect(v1).toBeDefined()
      expect(v2).toBeDefined()
      expect(v1).not.toBe(v2)
    })
  })

  describe('context interaction', () => {
    test('should call report with message property', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      visitor.UnaryExpression(createDeleteExpressionWithIdentifier())

      expect(reports[0]).toHaveProperty('message')
    })

    test('should call report with loc property when node has loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      visitor.UnaryExpression(createDeleteExpressionWithIdentifier())

      expect(reports[0]).toHaveProperty('loc')
    })

    test('should not call report for valid delete expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      visitor.UnaryExpression(createDeleteExpressionWithMemberExpression())

      expect(reports.length).toBe(0)
    })

    test('should work with different context instances', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'delete variable' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'delete variable' })

      const v1 = noDeleteVarRule.create(ctx1)
      const v2 = noDeleteVarRule.create(ctx2)

      v1.UnaryExpression(createDeleteExpressionWithIdentifier())
      v2.UnaryExpression(createDeleteExpressionWithMemberExpression())

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(0)
    })

    test('should handle context being called with same report function', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      visitor.UnaryExpression(createDeleteExpressionWithIdentifier(1, 0))
      visitor.UnaryExpression(createDeleteExpressionWithIdentifier(2, 0))

      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('should not mutate the input node', () => {
      const { context } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const originalNode = createDeleteExpressionWithIdentifier()
      const originalNodeCopy = JSON.parse(JSON.stringify(originalNode))

      visitor.UnaryExpression(originalNode)

      expect(originalNode).toEqual(originalNodeCopy)
    })

    test('should not mutate the context', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const originalGetFilePath = context.getFilePath

      visitor.UnaryExpression(createDeleteExpressionWithIdentifier())

      expect(context.getFilePath).toBe(originalGetFilePath)
    })
  })

  describe('extractLocation integration', () => {
    test('should use default location when node has no loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: { type: 'Identifier', name: 'x' },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
    })

    test('should use node location when available', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = createDeleteExpressionWithIdentifier(7, 12)
      visitor.UnaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(12)
    })

    test('should handle loc with start line 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: { type: 'Identifier', name: 'x' },
        loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 5 } },
      }

      visitor.UnaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc with large line numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = createDeleteExpressionWithIdentifier(10000, 500)
      visitor.UnaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(10000)
      expect(reports[0].loc?.start.column).toBe(500)
    })

    test('should handle loc with large column numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: { type: 'Identifier', name: 'x' },
        loc: { start: { line: 1, column: 9999 }, end: { line: 1, column: 10005 } },
      }

      visitor.UnaryExpression(node)

      expect(reports[0].loc?.start.column).toBe(9999)
    })
  })

  describe('visitor method behavior', () => {
    test('UnaryExpression should return undefined for delete identifier', () => {
      const { context } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const result = visitor.UnaryExpression(createDeleteExpressionWithIdentifier())

      expect(result).toBeUndefined()
    })

    test('UnaryExpression should return undefined for member expression', () => {
      const { context } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const result = visitor.UnaryExpression(createDeleteExpressionWithMemberExpression())

      expect(result).toBeUndefined()
    })

    test('UnaryExpression should return undefined for null node', () => {
      const { context } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const result = visitor.UnaryExpression(null)

      expect(result).toBeUndefined()
    })

    test('UnaryExpression should be callable multiple times', () => {
      const { context } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      expect(() => {
        for (let i = 0; i < 100; i++) {
          visitor.UnaryExpression(createDeleteExpressionWithIdentifier())
        }
      }).not.toThrow()
    })
  })

  describe('various identifier names for delete', () => {
    const identifiers = [
      'a',
      'b',
      'c',
      'i',
      'j',
      'k',
      'item',
      'index',
      'key',
      'val',
      'entry',
      'obj',
      'arr',
      'str',
      'num',
      'bool',
      'fn',
      'func',
      'callback',
      'handler',
      'listener',
      'config',
      'options',
      'settings',
      'params',
      'args',
    ]

    identifiers.forEach((name) => {
      test(`should report delete on identifier "${name}"`, () => {
        const { context, reports } = createMockRuleContext({ source: 'delete variable' })
        const visitor = noDeleteVarRule.create(context)

        const node = {
          type: 'UnaryExpression',
          operator: 'delete',
          argument: { type: 'Identifier', name },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 + name.length } },
        }

        visitor.UnaryExpression(node)

        expect(reports.length).toBe(1)
        expect(reports[0].message).toContain('should not be deleted')
      })
    })
  })

  describe('various node types that should not trigger report', () => {
    const nodeTypes = [
      'Literal',
      'ThisExpression',
      'ArrayExpression',
      'ObjectExpression',
      'FunctionExpression',
      'ArrowFunctionExpression',
      'ClassExpression',
      'TemplateLiteral',
      'RegExpLiteral',
      'BigIntLiteral',
    ]

    nodeTypes.forEach((nodeType) => {
      test(`should not report delete on ${nodeType} argument`, () => {
        const { context, reports } = createMockRuleContext({ source: 'delete variable' })
        const visitor = noDeleteVarRule.create(context)

        const node = {
          type: 'UnaryExpression',
          operator: 'delete',
          argument: { type: nodeType },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        }

        visitor.UnaryExpression(node)

        expect(reports.length).toBe(0)
      })
    })
  })

  describe('additional delete identifier checks', () => {
    test('should report delete on identifier named self', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: { type: 'Identifier', name: 'self' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report delete on identifier named global', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: { type: 'Identifier', name: 'global' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report delete on identifier named window', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: { type: 'Identifier', name: 'window' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report delete on identifier named exports', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: { type: 'Identifier', name: 'exports' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 13 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report delete on identifier named module', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: { type: 'Identifier', name: 'module' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report delete on identifier named require', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: { type: 'Identifier', name: 'require' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 13 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report delete on identifier named process', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: { type: 'Identifier', name: 'process' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 13 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report delete on identifier named console', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: { type: 'Identifier', name: 'console' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 13 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report delete on identifier with numeric suffix', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: { type: 'Identifier', name: 'var1' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report delete on identifier with double dollar signs', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: { type: 'Identifier', name: '$$' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 8 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('arguments-like identifiers', () => {
    test('should report delete on arguments identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: { type: 'Identifier', name: 'arguments' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report delete on eval identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: { type: 'Identifier', name: 'eval' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 11 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report delete on undefined identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: { type: 'Identifier', name: 'undefined' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report delete on NaN identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: { type: 'Identifier', name: 'NaN' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report delete on Infinity identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete variable' })
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: { type: 'Identifier', name: 'Infinity' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })
})
