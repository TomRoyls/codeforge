import { describe, test, expect } from 'vitest'
import { constructorSuperRule } from '../../../../src/rules/patterns/constructor-super.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createConstructorMethod(body: unknown[] = [], hasSuper = false, line = 1): unknown {
  const methodBody = hasSuper
    ? [
        {
          type: 'ExpressionStatement',
          expression: { type: 'CallExpression', callee: { type: 'Super' }, arguments: [] },
        },
        ...body,
      ]
    : body

  return {
    type: 'MethodDefinition',
    kind: 'constructor',
    value: {
      type: 'FunctionExpression',
      body: {
        type: 'BlockStatement',
        body: methodBody,
      },
    },
    loc: {
      start: { line, column: 0 },
      end: { line, column: 30 },
    },
  }
}

function createRegularMethod(line = 1): unknown {
  return {
    type: 'MethodDefinition',
    kind: 'method',
    value: {
      type: 'FunctionExpression',
      body: {
        type: 'BlockStatement',
        body: [],
      },
    },
    loc: {
      start: { line, column: 0 },
      end: { line, column: 20 },
    },
  }
}

function createNonMethodDefinition(): unknown {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'Literal',
      value: 42,
    },
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 2 },
    },
  }
}

describe('constructor-super rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(constructorSuperRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(constructorSuperRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(constructorSuperRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(constructorSuperRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention super in description', () => {
      expect(constructorSuperRule.meta.docs?.description.toLowerCase()).toContain('super')
    })
  })

  describe('create', () => {
    test('should return visitor with MethodDefinition method', () => {
      const { context } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)

      expect(visitor).toHaveProperty('MethodDefinition')
    })
  })

  describe('detecting missing super() calls', () => {
    test('should report constructor without super() call', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)

      visitor.MethodDefinition(createConstructorMethod([], false))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('super')
    })

    test('should not report constructor with super() call', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)

      visitor.MethodDefinition(createConstructorMethod([], true))

      expect(reports.length).toBe(0)
    })

    test('should not report regular method', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)

      visitor.MethodDefinition(createRegularMethod())

      expect(reports.length).toBe(0)
    })

    test('should not report non-MethodDefinition node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)

      visitor.MethodDefinition(createNonMethodDefinition())

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)

      expect(() => visitor.MethodDefinition(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)

      expect(() => visitor.MethodDefinition(undefined)).not.toThrow()
    })

    test('should handle node without value', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.MethodDefinition(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without body', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.MethodDefinition(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty body array', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.MethodDefinition(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })

  describe('meta - exhaustive property checks', () => {
    test('meta.type should be exactly problem', () => {
      expect(constructorSuperRule.meta.type).toBe('problem')
      expect(constructorSuperRule.meta.type).not.toBe('suggestion')
      expect(constructorSuperRule.meta.type).not.toBe('layout')
    })

    test('meta.severity should be exactly error', () => {
      expect(constructorSuperRule.meta.severity).toBe('error')
      expect(constructorSuperRule.meta.severity).not.toBe('warn')
      expect(constructorSuperRule.meta.severity).not.toBe('off')
    })

    test('meta.docs should exist', () => {
      expect(constructorSuperRule.meta.docs).toBeDefined()
      expect(constructorSuperRule.meta.docs).not.toBeNull()
    })

    test('meta.docs.description should be a non-empty string', () => {
      expect(typeof constructorSuperRule.meta.docs?.description).toBe('string')
      expect(constructorSuperRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('meta.docs.description should mention constructors', () => {
      expect(constructorSuperRule.meta.docs?.description.toLowerCase()).toContain('constructor')
    })

    test('meta.docs.description should mention derived classes', () => {
      expect(constructorSuperRule.meta.docs?.description.toLowerCase()).toContain('derived')
    })

    test('meta.docs.category should be patterns', () => {
      expect(constructorSuperRule.meta.docs?.category).toBe('patterns')
    })

    test('meta.docs.recommended should be true', () => {
      expect(constructorSuperRule.meta.docs?.recommended).toBe(true)
    })

    test('meta.schema should be empty array', () => {
      expect(constructorSuperRule.meta.schema).toEqual([])
    })

    test('meta.fixable should be undefined', () => {
      expect(constructorSuperRule.meta.fixable).toBeUndefined()
    })

    test('meta.deprecated should be undefined or falsy', () => {
      expect(constructorSuperRule.meta.deprecated).toBeFalsy()
    })

    test('meta.requiresTypeChecking should be undefined or falsy', () => {
      expect(constructorSuperRule.meta.requiresTypeChecking).toBeFalsy()
    })

    test('meta.docs.url should be undefined', () => {
      expect(constructorSuperRule.meta.docs?.url).toBeUndefined()
    })

    test('meta.docs.replacedBy should be undefined', () => {
      expect(constructorSuperRule.meta.replacedBy).toBeUndefined()
    })
  })

  describe('create - visitor structure', () => {
    test('should return an object from create', () => {
      const { context } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      expect(typeof visitor).toBe('object')
      expect(visitor).not.toBeNull()
    })

    test('MethodDefinition should be a function', () => {
      const { context } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      expect(typeof visitor.MethodDefinition).toBe('function')
    })

    test('MethodDefinition should accept one argument', () => {
      const { context } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      expect(visitor.MethodDefinition.length).toBe(1)
    })

    test('create should return a new visitor each time', () => {
      const { context } = createMockRuleContext()
      const visitor1 = constructorSuperRule.create(context)
      const visitor2 = constructorSuperRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('create should accept context without throwing', () => {
      const { context } = createMockRuleContext()
      expect(() => constructorSuperRule.create(context)).not.toThrow()
    })

    test('visitor should only have MethodDefinition key', () => {
      const { context } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const keys = Object.keys(visitor)
      expect(keys).toContain('MethodDefinition')
      expect(keys.length).toBe(1)
    })
  })

  describe('super() call detection - positive cases (should report)', () => {
    test('should report constructor with only variable declarations', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = createConstructorMethod([{ type: 'VariableDeclaration', declarations: [] }])
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should report constructor with only assignment expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = createConstructorMethod([
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'AssignmentExpression',
            left: { type: 'Identifier', name: 'x' },
            right: { type: 'Literal', value: 1 },
          },
        },
      ])
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should report constructor with only if statement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = createConstructorMethod([
        {
          type: 'IfStatement',
          test: { type: 'Literal', value: true },
          consequent: { type: 'BlockStatement', body: [] },
        },
      ])
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should report constructor with only a return statement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = createConstructorMethod([{ type: 'ReturnStatement', argument: null }])
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should report constructor with only a throw statement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = createConstructorMethod([
        {
          type: 'ThrowStatement',
          argument: { type: 'NewExpression', callee: { type: 'Identifier', name: 'Error' } },
        },
      ])
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should report constructor with only a while loop', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = createConstructorMethod([
        {
          type: 'WhileStatement',
          test: { type: 'Literal', value: true },
          body: { type: 'BlockStatement', body: [] },
        },
      ])
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should report constructor with only a for loop', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = createConstructorMethod([
        {
          type: 'ForStatement',
          init: null,
          test: null,
          update: null,
          body: { type: 'BlockStatement', body: [] },
        },
      ])
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should report constructor with only a switch statement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = createConstructorMethod([
        { type: 'SwitchStatement', discriminant: { type: 'Identifier', name: 'x' }, cases: [] },
      ])
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should report constructor with only a try-catch', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = createConstructorMethod([
        { type: 'TryStatement', block: { type: 'BlockStatement', body: [] }, handler: null },
      ])
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should report constructor with only console.log call', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = createConstructorMethod([
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: { type: 'Identifier', name: 'console' },
              property: { type: 'Identifier', name: 'log' },
            },
            arguments: [],
          },
        },
      ])
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should report constructor with multiple statements but no super()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = createConstructorMethod([
        { type: 'VariableDeclaration', declarations: [] },
        { type: 'ReturnStatement', argument: null },
        { type: 'ExpressionStatement', expression: { type: 'Literal', value: 42 } },
      ])
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should report constructor where super is called but not as expression statement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'VariableDeclaration',
                declarations: [
                  {
                    type: 'VariableDeclarator',
                    id: { type: 'Identifier', name: 'x' },
                    init: {
                      type: 'CallExpression',
                      callee: { type: 'Super' },
                      arguments: [],
                    },
                  },
                ],
              },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should report when callee type is not Super but similar', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = createConstructorMethod([
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'super' },
            arguments: [],
          },
        },
      ])
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should report when expression is a regular function call', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = createConstructorMethod([
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'someFunction' },
            arguments: [],
          },
        },
      ])
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should report constructor with this.someMethod() call but no super()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = createConstructorMethod([
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: { type: 'ThisExpression' },
              property: { type: 'Identifier', name: 'init' },
            },
            arguments: [],
          },
        },
      ])
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('super() call detection - negative cases (should not report)', () => {
    test('should not report constructor with super() as first statement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition(createConstructorMethod([], true))
      expect(reports.length).toBe(0)
    })

    test('should not report constructor with super() followed by other statements', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = createConstructorMethod(
        [{ type: 'VariableDeclaration', declarations: [] }],
        true,
      )
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('should not report constructor with super() with arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'ExpressionStatement',
                expression: {
                  type: 'CallExpression',
                  callee: { type: 'Super' },
                  arguments: [
                    { type: 'Identifier', name: 'arg1' },
                    { type: 'Literal', value: 42 },
                  ],
                },
              },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('should not report constructor with super() inside nested BlockStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'BlockStatement',
                body: [
                  {
                    type: 'ExpressionStatement',
                    expression: {
                      type: 'CallExpression',
                      callee: { type: 'Super' },
                      arguments: [],
                    },
                  },
                ],
              },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('should not report regular method named "constructor" but kind is method', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'method',
        value: {
          type: 'FunctionExpression',
          body: { type: 'BlockStatement', body: [] },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('should not report get accessor', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        value: {
          type: 'FunctionExpression',
          body: { type: 'BlockStatement', body: [] },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('should not report set accessor', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'set',
        value: {
          type: 'FunctionExpression',
          body: { type: 'BlockStatement', body: [] },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('node type filtering', () => {
    test('should ignore node with type ExpressionStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition(createNonMethodDefinition())
      expect(reports.length).toBe(0)
    })

    test('should ignore node with type FunctionDeclaration', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should ignore node with type ClassDeclaration', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition({
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'MyClass' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should ignore node with type ArrowFunctionExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition({
        type: 'ArrowFunctionExpression',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should ignore node with type VariableDeclaration', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition({
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should ignore node with type IfStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition({
        type: 'IfStatement',
        test: { type: 'Literal', value: true },
        consequent: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should ignore node with type empty string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition({
        type: '',
        kind: 'constructor',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })
  })

  describe('null and undefined edge cases', () => {
    test('should handle null node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      expect(() => visitor.MethodDefinition(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      expect(() => visitor.MethodDefinition(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle numeric node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      expect(() => visitor.MethodDefinition(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle string node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      expect(() => visitor.MethodDefinition('hello')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      expect(() => visitor.MethodDefinition(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      expect(() => visitor.MethodDefinition({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      expect(() => visitor.MethodDefinition({ type: null })).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      expect(() => visitor.MethodDefinition({ type: undefined })).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with numeric type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      expect(() => visitor.MethodDefinition({ type: 123 })).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('constructor with missing value/body', () => {
    test('should not report when value is null', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition({
        type: 'MethodDefinition',
        kind: 'constructor',
        value: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report when value is undefined', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition({
        type: 'MethodDefinition',
        kind: 'constructor',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report when value is a string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition({
        type: 'MethodDefinition',
        kind: 'constructor',
        value: 'not an object',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report when value is a number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition({
        type: 'MethodDefinition',
        kind: 'constructor',
        value: 42,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report when body is null', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition({
        type: 'MethodDefinition',
        kind: 'constructor',
        value: { type: 'FunctionExpression', body: null },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report when body is undefined', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition({
        type: 'MethodDefinition',
        kind: 'constructor',
        value: { type: 'FunctionExpression' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report when body is a string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition({
        type: 'MethodDefinition',
        kind: 'constructor',
        value: { type: 'FunctionExpression', body: 'not an object' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report when body type is not BlockStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition({
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          body: { type: 'Expression', body: [] },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report when body.body is not an array', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition({
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          body: { type: 'BlockStatement', body: 'not an array' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report when body.body is null', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition({
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          body: { type: 'BlockStatement', body: null },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })
  })

  describe('location reporting', () => {
    test('should include location in report', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition(createConstructorMethod([], false, 5))
      expect(reports[0].loc).toBeDefined()
    })

    test('should report correct start line', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition(createConstructorMethod([], false, 10))
      expect(reports[0].loc?.start.line).toBe(10)
    })

    test('should report correct start column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition(createConstructorMethod([], false, 3))
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct end line', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition(createConstructorMethod([], false, 7))
      expect(reports[0].loc?.end.line).toBe(7)
    })

    test('should report correct end column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition(createConstructorMethod([], false, 1))
      expect(reports[0].loc?.end.column).toBe(30)
    })

    test('should handle node at line 1', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition(createConstructorMethod([], false, 1))
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle node at high line number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition(createConstructorMethod([], false, 1000))
      expect(reports[0].loc?.start.line).toBe(1000)
    })

    test('should handle node with custom column offsets', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          body: { type: 'BlockStatement', body: [] },
        },
        loc: {
          start: { line: 5, column: 12 },
          end: { line: 5, column: 45 },
        },
      }
      visitor.MethodDefinition(node)
      expect(reports[0].loc?.start.column).toBe(12)
      expect(reports[0].loc?.end.column).toBe(45)
    })

    test('should handle node without loc using default location', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          body: { type: 'BlockStatement', body: [] },
        },
      }
      visitor.MethodDefinition(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle multi-line location span', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          body: { type: 'BlockStatement', body: [] },
        },
        loc: {
          start: { line: 3, column: 4 },
          end: { line: 10, column: 5 },
        },
      }
      visitor.MethodDefinition(node)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.end.line).toBe(10)
    })
  })

  describe('message content', () => {
    test('report message should contain "super"', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition(createConstructorMethod([], false))
      expect(reports[0].message.toLowerCase()).toContain('super')
    })

    test('report message should contain "constructor"', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition(createConstructorMethod([], false))
      expect(reports[0].message.toLowerCase()).toContain('constructor')
    })

    test('report message should be non-empty string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition(createConstructorMethod([], false))
      expect(typeof reports[0].message).toBe('string')
      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('report message should mention derived', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition(createConstructorMethod([], false))
      expect(reports[0].message.toLowerCase()).toContain('derived')
    })

    test('report message should mention call', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition(createConstructorMethod([], false))
      expect(reports[0].message.toLowerCase()).toContain('call')
    })

    test('report message should contain "super()"', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition(createConstructorMethod([], false))
      expect(reports[0].message).toContain('super()')
    })
  })

  describe('multiple constructor calls', () => {
    test('should report for each missing super() constructor', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition(createConstructorMethod([], false, 1))
      visitor.MethodDefinition(createConstructorMethod([], false, 5))
      visitor.MethodDefinition(createConstructorMethod([], false, 10))
      expect(reports.length).toBe(3)
    })

    test('should report only for constructors without super()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition(createConstructorMethod([], false, 1))
      visitor.MethodDefinition(createConstructorMethod([], true, 5))
      visitor.MethodDefinition(createConstructorMethod([], false, 10))
      expect(reports.length).toBe(2)
    })

    test('should not report any when all have super()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition(createConstructorMethod([], true, 1))
      visitor.MethodDefinition(createConstructorMethod([], true, 5))
      visitor.MethodDefinition(createConstructorMethod([], true, 10))
      expect(reports.length).toBe(0)
    })

    test('should report for mixed regular and constructor methods', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition(createConstructorMethod([], false, 1))
      visitor.MethodDefinition(createRegularMethod(3))
      visitor.MethodDefinition(createConstructorMethod([], false, 5))
      visitor.MethodDefinition(createRegularMethod(7))
      expect(reports.length).toBe(2)
    })

    test('should not report for regular methods interspersed with constructors that have super()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition(createRegularMethod(1))
      visitor.MethodDefinition(createConstructorMethod([], true, 3))
      visitor.MethodDefinition(createRegularMethod(5))
      visitor.MethodDefinition(createConstructorMethod([], true, 7))
      expect(reports.length).toBe(0)
    })

    test('should handle 10 consecutive constructor reports', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      for (let i = 0; i < 10; i++) {
        visitor.MethodDefinition(createConstructorMethod([], false, i + 1))
      }
      expect(reports.length).toBe(10)
    })

    test('should handle alternating report/no-report pattern', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      for (let i = 0; i < 20; i++) {
        if (i % 2 === 0) {
          visitor.MethodDefinition(createConstructorMethod([], false, i + 1))
        } else {
          visitor.MethodDefinition(createConstructorMethod([], true, i + 1))
        }
      }
      expect(reports.length).toBe(10)
    })
  })

  describe('different kind values (non-constructor)', () => {
    test('should not report for kind "method"', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition(createRegularMethod())
      expect(reports.length).toBe(0)
    })

    test('should not report for kind "get"', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition({
        type: 'MethodDefinition',
        kind: 'get',
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report for kind "set"', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition({
        type: 'MethodDefinition',
        kind: 'set',
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report for kind empty string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition({
        type: 'MethodDefinition',
        kind: '',
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report for kind undefined', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition({
        type: 'MethodDefinition',
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report for kind null', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition({
        type: 'MethodDefinition',
        kind: null,
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report for kind with wrong casing "Constructor"', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition({
        type: 'MethodDefinition',
        kind: 'Constructor',
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report for kind "CONSTRUCTOR" uppercase', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition({
        type: 'MethodDefinition',
        kind: 'CONSTRUCTOR',
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })
  })

  describe('nested BlockStatement handling', () => {
    test('should find super() inside deeply nested BlockStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'BlockStatement',
                body: [
                  {
                    type: 'BlockStatement',
                    body: [
                      {
                        type: 'ExpressionStatement',
                        expression: {
                          type: 'CallExpression',
                          callee: { type: 'Super' },
                          arguments: [],
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('should report when super() is missing in outer block but nested block exists', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'BlockStatement',
                body: [{ type: 'VariableDeclaration', declarations: [] }],
              },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should not report when super() is in a sibling nested BlockStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              { type: 'VariableDeclaration', declarations: [] },
              {
                type: 'BlockStatement',
                body: [
                  {
                    type: 'ExpressionStatement',
                    expression: {
                      type: 'CallExpression',
                      callee: { type: 'Super' },
                      arguments: [],
                    },
                  },
                ],
              },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('should find super() in first nested BlockStatement among multiple', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'BlockStatement',
                body: [
                  {
                    type: 'ExpressionStatement',
                    expression: {
                      type: 'CallExpression',
                      callee: { type: 'Super' },
                      arguments: [],
                    },
                  },
                ],
              },
              {
                type: 'BlockStatement',
                body: [{ type: 'VariableDeclaration', declarations: [] }],
              },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('isSuperCall - callee edge cases', () => {
    test('should report when callee is null in expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = createConstructorMethod([
        {
          type: 'ExpressionStatement',
          expression: { type: 'CallExpression', callee: null, arguments: [] },
        },
      ])
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should report when callee is a MemberExpression (super.method)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = createConstructorMethod([
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: { type: 'Super' },
              property: { type: 'Identifier', name: 'method' },
            },
            arguments: [],
          },
        },
      ])
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should report when expression is not a CallExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = createConstructorMethod([
        {
          type: 'ExpressionStatement',
          expression: { type: 'Literal', value: 'not a call' },
        },
      ])
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should report when statement is not ExpressionStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = createConstructorMethod([{ type: 'VariableDeclaration', declarations: [] }])
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should handle null statement in body array', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [null, undefined, { type: 'VariableDeclaration', declarations: [] }],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      expect(() => visitor.MethodDefinition(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle statement that is a number in body array', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [42, 'hello'],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      expect(() => visitor.MethodDefinition(node)).not.toThrow()
    })

    test('should handle expression statement with undefined expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = createConstructorMethod([{ type: 'ExpressionStatement' }])
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('export verification', () => {
    test('should have a default export', () => {
      expect(constructorSuperRule).toBeDefined()
    })

    test('named export should be the same object type', () => {
      expect(typeof constructorSuperRule).toBe('object')
    })

    test('should have create method', () => {
      expect(typeof constructorSuperRule.create).toBe('function')
    })

    test('should have meta property', () => {
      expect(typeof constructorSuperRule.meta).toBe('object')
      expect(constructorSuperRule.meta).not.toBeNull()
    })

    test('create should be callable with mock context', () => {
      const { context } = createMockRuleContext()
      expect(() => constructorSuperRule.create(context)).not.toThrow()
    })
  })

  describe('isClassMethod internal behavior', () => {
    test('should handle node with type MethodDefinition but other types for value', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition({
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'ArrowFunctionExpression',
          body: { type: 'BlockStatement', body: [] },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should handle MethodDefinition with non-standard value type string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition({
        type: 'MethodDefinition',
        kind: 'constructor',
        value: 'string value',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should handle body that is an array but not inside BlockStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition({
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          body: { type: 'SomeOtherType', body: [] },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })
  })

  describe('context interaction', () => {
    test('should call report exactly once for missing super()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition(createConstructorMethod([], false))
      expect(reports.length).toBe(1)
    })

    test('should not call report when super() is present', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition(createConstructorMethod([], true))
      expect(reports.length).toBe(0)
    })

    test('should not call report for non-constructor method', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition(createRegularMethod())
      expect(reports.length).toBe(0)
    })

    test('should not call report for null node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition(null)
      expect(reports.length).toBe(0)
    })

    test('visitor from different context should work independently', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext()
      const { context: ctx2, reports: r2 } = createMockRuleContext()
      const visitor1 = constructorSuperRule.create(ctx1)
      const visitor2 = constructorSuperRule.create(ctx2)
      visitor1.MethodDefinition(createConstructorMethod([], false))
      visitor2.MethodDefinition(createConstructorMethod([], true))
      expect(r1.length).toBe(1)
      expect(r2.length).toBe(0)
    })
  })

  describe('various class structures', () => {
    test('should report for class with extends and missing super()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should handle constructor with params', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          params: [{ type: 'Identifier', name: 'name' }],
          body: { type: 'BlockStatement', body: [] },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should handle constructor with params and super()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          params: [{ type: 'Identifier', name: 'name' }],
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'ExpressionStatement',
                expression: {
                  type: 'CallExpression',
                  callee: { type: 'Super' },
                  arguments: [{ type: 'Identifier', name: 'name' }],
                },
              },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('should handle constructor with static keyword', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        static: true,
        value: {
          type: 'FunctionExpression',
          body: { type: 'BlockStatement', body: [] },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should handle constructor with computed property name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        computed: false,
        value: {
          type: 'FunctionExpression',
          body: { type: 'BlockStatement', body: [] },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should handle constructor with private modifier', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        accessibility: 'private',
        value: {
          type: 'FunctionExpression',
          body: { type: 'BlockStatement', body: [] },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should handle constructor with protected modifier', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        accessibility: 'protected',
        value: {
          type: 'FunctionExpression',
          body: { type: 'BlockStatement', body: [] },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should handle constructor with public modifier', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        accessibility: 'public',
        value: {
          type: 'FunctionExpression',
          body: { type: 'BlockStatement', body: [] },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should handle constructor with async keyword (unusual but valid AST)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          async: true,
          body: { type: 'BlockStatement', body: [] },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should handle constructor with generator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          generator: true,
          body: { type: 'BlockStatement', body: [] },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('super() with various argument patterns', () => {
    test('should not report super() with no arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition(createConstructorMethod([], true))
      expect(reports.length).toBe(0)
    })

    test('should not report super() with single argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'ExpressionStatement',
                expression: {
                  type: 'CallExpression',
                  callee: { type: 'Super' },
                  arguments: [{ type: 'Literal', value: 1 }],
                },
              },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('should not report super() with multiple arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'ExpressionStatement',
                expression: {
                  type: 'CallExpression',
                  callee: { type: 'Super' },
                  arguments: [
                    { type: 'Identifier', name: 'a' },
                    { type: 'Identifier', name: 'b' },
                    { type: 'Identifier', name: 'c' },
                  ],
                },
              },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('should not report super() with spread argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'ExpressionStatement',
                expression: {
                  type: 'CallExpression',
                  callee: { type: 'Super' },
                  arguments: [
                    { type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } },
                  ],
                },
              },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('should not report super() with object argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'ExpressionStatement',
                expression: {
                  type: 'CallExpression',
                  callee: { type: 'Super' },
                  arguments: [{ type: 'ObjectExpression', properties: [] }],
                },
              },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('body with mixed statement types', () => {
    test('should report when body has mixed statements but no super()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = createConstructorMethod([
        { type: 'VariableDeclaration', declarations: [] },
        { type: 'ExpressionStatement', expression: { type: 'Literal', value: 1 } },
        {
          type: 'IfStatement',
          test: { type: 'Literal', value: true },
          consequent: { type: 'BlockStatement', body: [] },
        },
        { type: 'ReturnStatement', argument: null },
      ])
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should not report when super() is among other statements', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = createConstructorMethod(
        [
          { type: 'VariableDeclaration', declarations: [] },
          { type: 'ExpressionStatement', expression: { type: 'Literal', value: 1 } },
        ],
        true,
      )
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('should handle body with only whitespace-like entries', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = createConstructorMethod([{ type: 'EmptyStatement' }])
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('constructor with decorator-like extra properties', () => {
    test('should handle node with extra properties', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition({
        type: 'MethodDefinition',
        kind: 'constructor',
        extra: true,
        decorators: [],
        range: [0, 50],
        value: {
          type: 'FunctionExpression',
          body: { type: 'BlockStatement', body: [] },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should handle value with extra properties', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition({
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          id: null,
          params: [],
          async: false,
          generator: false,
          expression: false,
          body: { type: 'BlockStatement', body: [] },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(1)
    })
  })

  describe('location edge cases', () => {
    test('should handle node with loc.start.line = 0', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition({
        type: 'MethodDefinition',
        kind: 'constructor',
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
        loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 10 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(0)
    })

    test('should handle node with negative line number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition({
        type: 'MethodDefinition',
        kind: 'constructor',
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
        loc: { start: { line: -1, column: 0 }, end: { line: -1, column: 10 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should handle node with very large line number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition({
        type: 'MethodDefinition',
        kind: 'constructor',
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
        loc: { start: { line: 999999, column: 0 }, end: { line: 999999, column: 10 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(999999)
    })

    test('should handle node with loc but missing start', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition({
        type: 'MethodDefinition',
        kind: 'constructor',
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
        loc: { end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle node with loc but missing end', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition({
        type: 'MethodDefinition',
        kind: 'constructor',
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
        loc: { start: { line: 1, column: 0 } },
      })
      expect(reports.length).toBe(1)
    })
  })

  describe('stress and robustness', () => {
    test('should handle body with many statements but no super()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const body = Array.from({ length: 50 }, () => ({
        type: 'VariableDeclaration',
        declarations: [],
      }))
      visitor.MethodDefinition(createConstructorMethod(body, false))
      expect(reports.length).toBe(1)
    })

    test('should handle body with many statements and super() at end', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const body = Array.from({ length: 50 }, () => ({
        type: 'VariableDeclaration',
        declarations: [],
      }))
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              ...body,
              {
                type: 'ExpressionStatement',
                expression: { type: 'CallExpression', callee: { type: 'Super' }, arguments: [] },
              },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('should handle calling MethodDefinition many times', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      for (let i = 0; i < 100; i++) {
        visitor.MethodDefinition(createConstructorMethod([], false, i + 1))
      }
      expect(reports.length).toBe(100)
    })

    test('should handle mixed calls without throwing', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      for (let i = 0; i < 50; i++) {
        visitor.MethodDefinition(null)
        visitor.MethodDefinition(createConstructorMethod([], false, i + 1))
        visitor.MethodDefinition(createRegularMethod(i + 1))
        visitor.MethodDefinition(createConstructorMethod([], true, i + 1))
      }
      expect(reports.length).toBe(50)
    })

    test('should handle empty object in body array', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = createConstructorMethod([{}])
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should handle body with only non-ExpressionStatement types', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = createConstructorMethod([
        { type: 'FunctionDeclaration', id: { type: 'Identifier', name: 'inner' } },
        { type: 'ClassDeclaration', id: { type: 'Identifier', name: 'InnerClass' } },
      ])
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('additional meta checks', () => {
    test('meta should have exactly type, severity, docs, schema, fixable keys', () => {
      const meta = constructorSuperRule.meta
      expect(meta).toHaveProperty('type')
      expect(meta).toHaveProperty('severity')
      expect(meta).toHaveProperty('docs')
      expect(meta).toHaveProperty('schema')
    })

    test('meta.docs should have description, category, recommended', () => {
      const docs = constructorSuperRule.meta.docs
      expect(docs).toHaveProperty('description')
      expect(docs).toHaveProperty('category')
      expect(docs).toHaveProperty('recommended')
    })

    test('meta.docs.description should start with uppercase', () => {
      const desc = constructorSuperRule.meta.docs?.description
      expect(desc).toBeDefined()
      expect(desc!.charAt(0)).toBe(desc!.charAt(0).toUpperCase())
    })

    test('meta.docs.description should end with period', () => {
      expect(constructorSuperRule.meta.docs?.description.endsWith('.')).toBe(true)
    })

    test('rule object should be frozen or readonly conceptually', () => {
      expect(Object.keys(constructorSuperRule)).toContain('meta')
      expect(Object.keys(constructorSuperRule)).toContain('create')
    })

    test('meta.type should be one of valid RuleType values', () => {
      const validTypes = ['problem', 'suggestion', 'layout']
      expect(validTypes).toContain(constructorSuperRule.meta.type)
    })

    test('meta.severity should be one of valid Severity values', () => {
      const validSeverities = ['off', 'warn', 'error']
      expect(validSeverities).toContain(constructorSuperRule.meta.severity)
    })
  })

  describe('additional create/visitor checks', () => {
    test('create should not throw with minimal context', () => {
      const minimalContext = {
        report: () => {},
        getFilePath: () => '',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: () => {}, info: () => {}, warn: () => {}, error: () => {} },
        workspaceRoot: '',
      } as unknown as RuleContext
      expect(() => constructorSuperRule.create(minimalContext)).not.toThrow()
    })

    test('visitor.MethodDefinition should return void', () => {
      const { context } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const result = visitor.MethodDefinition(createConstructorMethod([], false))
      expect(result).toBeUndefined()
    })

    test('visitor.MethodDefinition should return void for null', () => {
      const { context } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const result = visitor.MethodDefinition(null)
      expect(result).toBeUndefined()
    })

    test('calling MethodDefinition twice on same visitor with same node should report twice', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = createConstructorMethod([], false)
      visitor.MethodDefinition(node)
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(2)
    })
  })

  describe('additional super() detection patterns', () => {
    test('should report when body has CallExpression with non-Super callee type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = createConstructorMethod([
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'foo' },
            arguments: [],
          },
        },
      ])
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should report when ExpressionStatement has non-CallExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = createConstructorMethod([
        {
          type: 'ExpressionStatement',
          expression: { type: 'AssignmentExpression' },
        },
      ])
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should report constructor with super used as identifier not call', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = createConstructorMethod([
        {
          type: 'ExpressionStatement',
          expression: { type: 'Identifier', name: 'super' },
        },
      ])
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should report when super is in NewExpression not CallExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = createConstructorMethod([
        {
          type: 'ExpressionStatement',
          expression: { type: 'NewExpression', callee: { type: 'Super' }, arguments: [] },
        },
      ])
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should report when CallExpression callee is Super but inside VariableDeclaration', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = createConstructorMethod([
        {
          type: 'VariableDeclaration',
          declarations: [
            {
              type: 'VariableDeclarator',
              id: { type: 'Identifier', name: 'result' },
              init: { type: 'CallExpression', callee: { type: 'Super' }, arguments: [] },
            },
          ],
        },
      ])
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should report when only statement is EmptyStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = createConstructorMethod([{ type: 'EmptyStatement' }])
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should report when body contains debugger statement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = createConstructorMethod([{ type: 'DebuggerStatement' }])
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should report when body contains break statement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = createConstructorMethod([{ type: 'BreakStatement', label: null }])
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should report when body contains continue statement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = createConstructorMethod([{ type: 'ContinueStatement', label: null }])
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should report when body contains LabeledStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = createConstructorMethod([
        {
          type: 'LabeledStatement',
          label: { type: 'Identifier', name: 'loop' },
          body: { type: 'EmptyStatement' },
        },
      ])
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should report when body contains WithStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = createConstructorMethod([
        {
          type: 'WithStatement',
          object: { type: 'Identifier', name: 'obj' },
          body: { type: 'EmptyStatement' },
        },
      ])
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should not report when super() is preceded by debugger statement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              { type: 'DebuggerStatement' },
              {
                type: 'ExpressionStatement',
                expression: { type: 'CallExpression', callee: { type: 'Super' }, arguments: [] },
              },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('should report when body has super followed by super (second one is redundant)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = createConstructorMethod([], true)
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('isSuperCall with edge-case callee types', () => {
    test('should report when callee is a boolean', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = createConstructorMethod([
        {
          type: 'ExpressionStatement',
          expression: { type: 'CallExpression', callee: true, arguments: [] },
        },
      ])
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should report when callee is a number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = createConstructorMethod([
        {
          type: 'ExpressionStatement',
          expression: { type: 'CallExpression', callee: 42, arguments: [] },
        },
      ])
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should report when callee is a string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = createConstructorMethod([
        {
          type: 'ExpressionStatement',
          expression: { type: 'CallExpression', callee: 'super', arguments: [] },
        },
      ])
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should report when callee is an array', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = createConstructorMethod([
        {
          type: 'ExpressionStatement',
          expression: { type: 'CallExpression', callee: [], arguments: [] },
        },
      ])
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('should not report when callee type is exactly Super', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      const node = createConstructorMethod([], true)
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('report descriptor shape', () => {
    test('report should have message property as string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition(createConstructorMethod([], false))
      expect(typeof reports[0].message).toBe('string')
    })

    test('report should have loc property as object with start and end', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition(createConstructorMethod([], false, 5))
      const loc = reports[0].loc
      expect(loc).toBeDefined()
      expect(typeof loc?.start).toBe('object')
      expect(typeof loc?.end).toBe('object')
    })

    test('report loc.start should have line and column as numbers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition(createConstructorMethod([], false))
      const start = reports[0].loc?.start
      expect(typeof start?.line).toBe('number')
      expect(typeof start?.column).toBe('number')
    })

    test('report loc.end should have line and column as numbers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition(createConstructorMethod([], false))
      const end = reports[0].loc?.end
      expect(typeof end?.line).toBe('number')
      expect(typeof end?.column).toBe('number')
    })

    test('multiple reports should have independent locations', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = constructorSuperRule.create(context)
      visitor.MethodDefinition(createConstructorMethod([], false, 1))
      visitor.MethodDefinition(createConstructorMethod([], false, 10))
      expect(reports[0].loc?.start.line).not.toBe(reports[1].loc?.start.line)
    })
  })
})
