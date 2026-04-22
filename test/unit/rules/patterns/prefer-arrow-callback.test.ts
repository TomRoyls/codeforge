import { describe, test, expect, vi } from 'vitest'
import { preferArrowCallbackRule } from '../../../../src/rules/patterns/prefer-arrow-callback.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createFunctionExpression(lineNumber = 1, column = 0): unknown {
  return {
    type: 'FunctionExpression',
    id: null,
    params: [],
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line: lineNumber, column },
      end: { line: lineNumber, column: 20 },
    },
  }
}

function createArrowFunctionExpression(lineNumber = 1, column = 0): unknown {
  return {
    type: 'ArrowFunctionExpression',
    params: [],
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line: lineNumber, column },
      end: { line: lineNumber, column: 20 },
    },
  }
}

function createIdentifier(): unknown {
  return {
    type: 'Identifier',
    name: 'x',
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 1 },
    },
  }
}

describe('prefer-arrow-callback rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferArrowCallbackRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferArrowCallbackRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(preferArrowCallbackRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(preferArrowCallbackRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(preferArrowCallbackRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(preferArrowCallbackRule.meta.fixable).toBeUndefined()
    })

    test('should mention arrow function in description', () => {
      expect(preferArrowCallbackRule.meta.docs?.description.toLowerCase()).toContain('arrow')
    })

    test('should mention callback in description', () => {
      expect(preferArrowCallbackRule.meta.docs?.description.toLowerCase()).toContain('callback')
    })

    test('should have empty schema array', () => {
      expect(preferArrowCallbackRule.meta.schema).toEqual([])
    })

    test('should have docs property', () => {
      expect(preferArrowCallbackRule.meta.docs).toBeDefined()
    })

    test('should have description in docs', () => {
      expect(preferArrowCallbackRule.meta.docs?.description).toBeDefined()
      expect(typeof preferArrowCallbackRule.meta.docs?.description).toBe('string')
    })

    test('should have a non-empty description', () => {
      expect(preferArrowCallbackRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should mention function expression in description', () => {
      expect(preferArrowCallbackRule.meta.docs?.description.toLowerCase()).toContain('function')
    })

    test('should have meta property', () => {
      expect(preferArrowCallbackRule).toHaveProperty('meta')
    })

    test('should have create property', () => {
      expect(preferArrowCallbackRule).toHaveProperty('create')
    })

    test('meta.type should be a string', () => {
      expect(typeof preferArrowCallbackRule.meta.type).toBe('string')
    })

    test('meta.severity should be a string', () => {
      expect(typeof preferArrowCallbackRule.meta.severity).toBe('string')
    })

    test('meta.docs.recommended should be a boolean', () => {
      expect(typeof preferArrowCallbackRule.meta.docs?.recommended).toBe('boolean')
    })

    test('meta.docs.category should be a string', () => {
      expect(typeof preferArrowCallbackRule.meta.docs?.category).toBe('string')
    })

    test('should have url in docs', () => {
      expect(preferArrowCallbackRule.meta.docs?.url).toBeDefined()
    })

    test('url should be a string', () => {
      expect(typeof preferArrowCallbackRule.meta.docs?.url).toBe('string')
    })

    test('url should contain codeforge', () => {
      expect(preferArrowCallbackRule.meta.docs?.url).toContain('codeforge')
    })

    test('url should contain prefer-arrow-callback', () => {
      expect(preferArrowCallbackRule.meta.docs?.url).toContain('prefer-arrow-callback')
    })

    test('should not be deprecated', () => {
      expect(preferArrowCallbackRule.meta.deprecated).toBeUndefined()
    })

    test('should not have replacedBy', () => {
      expect(preferArrowCallbackRule.meta.replacedBy).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(preferArrowCallbackRule.meta.requiresTypeChecking).toBeUndefined()
    })

    test('schema should be an array', () => {
      expect(Array.isArray(preferArrowCallbackRule.meta.schema)).toBe(true)
    })

    test('schema should have length 0', () => {
      expect(preferArrowCallbackRule.meta.schema).toHaveLength(0)
    })

    test('create should be a function', () => {
      expect(typeof preferArrowCallbackRule.create).toBe('function')
    })

    test('should have exactly two top-level properties', () => {
      const keys = Object.keys(preferArrowCallbackRule)
      expect(keys).toContain('meta')
      expect(keys).toContain('create')
    })
  })

  describe('create', () => {
    test('should return visitor object with FunctionExpression method', () => {
      const { context } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      expect(visitor).toHaveProperty('FunctionExpression')
    })

    test('should return a non-null visitor', () => {
      const { context } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      expect(visitor).not.toBeNull()
    })

    test('visitor should be an object', () => {
      const { context } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      expect(typeof visitor).toBe('object')
    })

    test('FunctionExpression should be a function', () => {
      const { context } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      expect(typeof visitor.FunctionExpression).toBe('function')
    })

    test('should return a new visitor each time create is called', () => {
      const { context } = createMockRuleContext()
      const visitor1 = preferArrowCallbackRule.create(context)
      const visitor2 = preferArrowCallbackRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('visitor should only have FunctionExpression key', () => {
      const { context } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      expect(Object.keys(visitor)).toEqual(['FunctionExpression'])
    })

    test('FunctionExpression should accept one argument', () => {
      const { context } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      expect(visitor.FunctionExpression.length).toBe(1)
    })

    test('create should not throw with valid context', () => {
      const { context } = createMockRuleContext()

      expect(() => preferArrowCallbackRule.create(context)).not.toThrow()
    })

    test('multiple visitors should be independent', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext()
      const { context: ctx2, reports: r2 } = createMockRuleContext()
      const visitor1 = preferArrowCallbackRule.create(ctx1)
      const visitor2 = preferArrowCallbackRule.create(ctx2)

      visitor1.FunctionExpression(createFunctionExpression())

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(0)
    })

    test('visitor should work with different context instances', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'a', filePath: '/src/a.ts' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'b', filePath: '/src/b.ts' })
      const v1 = preferArrowCallbackRule.create(ctx1)
      const v2 = preferArrowCallbackRule.create(ctx2)

      v1.FunctionExpression(createFunctionExpression())
      v2.FunctionExpression(createFunctionExpression())
      v2.FunctionExpression(createFunctionExpression())

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(2)
    })
  })

  describe('detecting function expressions', () => {
    test('should report function expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createFunctionExpression())

      expect(reports.length).toBe(1)
    })

    test('should report correct message for function expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createFunctionExpression())

      expect(reports[0].message).toBe('Use arrow function for callback')
    })

    test('should report multiple function expressions', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(1, 0))
      visitor.FunctionExpression(createFunctionExpression(2, 0))
      visitor.FunctionExpression(createFunctionExpression(3, 0))

      expect(reports.length).toBe(3)
    })

    test('should report function expression with single parameter', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'FunctionExpression',
        id: null,
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should report function expression with multiple parameters', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'FunctionExpression',
        id: null,
        params: [
          { type: 'Identifier', name: 'a' },
          { type: 'Identifier', name: 'b' },
          { type: 'Identifier', name: 'c' },
        ],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should report named function expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'FunctionExpression',
        id: { type: 'Identifier', name: 'myFunc' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should report function expression with return statement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'FunctionExpression',
        id: null,
        params: [{ type: 'Identifier', name: 'x' }],
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Identifier', name: 'x' } }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should report function expression with empty body', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should report function expression with complex body', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'FunctionExpression',
        id: null,
        params: [{ type: 'Identifier', name: 'x' }],
        body: {
          type: 'BlockStatement',
          body: [
            { type: 'VariableDeclaration', kind: 'const' },
            { type: 'ExpressionStatement' },
            { type: 'ReturnStatement' },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 1 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should report function expression with rest parameter', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'FunctionExpression',
        id: null,
        params: [{ type: 'RestElement', argument: { type: 'Identifier', name: 'args' } }],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should report function expression with default parameter', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'FunctionExpression',
        id: null,
        params: [
          {
            type: 'AssignmentPattern',
            left: { type: 'Identifier', name: 'x' },
            right: { type: 'Literal', value: 10 },
          },
        ],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should report function expression with destructured parameter', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'FunctionExpression',
        id: null,
        params: [{ type: 'ObjectPattern', properties: [] }],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should report generator function expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        generator: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should report async function expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        async: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should report async generator function expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        async: true,
        generator: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should report function expression with this usage', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ReturnStatement',
              argument: { type: 'ThisExpression' },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should report deeply nested function expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'FunctionDeclaration',
              id: { type: 'Identifier', name: 'inner' },
              params: [],
              body: { type: 'BlockStatement', body: [] },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 1 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should report function expression with try-catch body', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'FunctionExpression',
        id: null,
        params: [{ type: 'Identifier', name: 'err' }],
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'TryStatement',
              block: { type: 'BlockStatement', body: [] },
              handler: {
                type: 'CatchClause',
                param: { type: 'Identifier', name: 'e' },
                body: { type: 'BlockStatement', body: [] },
              },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 1 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should report function expression used as .map() callback', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'FunctionExpression',
        id: null,
        params: [{ type: 'Identifier', name: 'item' }],
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ReturnStatement',
              argument: { type: 'Identifier', name: 'item' },
            },
          ],
        },
        loc: { start: { line: 3, column: 12 }, end: { line: 3, column: 35 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should report function expression used as .filter() callback', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'FunctionExpression',
        id: null,
        params: [
          { type: 'Identifier', name: 'item' },
          { type: 'Identifier', name: 'index' },
        ],
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ReturnStatement',
              argument: { type: 'Identifier', name: 'item' },
            },
          ],
        },
        loc: { start: { line: 5, column: 14 }, end: { line: 5, column: 40 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should report function expression used as .reduce() callback', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'FunctionExpression',
        id: null,
        params: [
          { type: 'Identifier', name: 'acc' },
          { type: 'Identifier', name: 'cur' },
        ],
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ReturnStatement',
              argument: {
                type: 'BinaryExpression',
                operator: '+',
                left: { type: 'Identifier', name: 'acc' },
                right: { type: 'Identifier', name: 'cur' },
              },
            },
          ],
        },
        loc: { start: { line: 2, column: 15 }, end: { line: 2, column: 45 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should report function expression used as setTimeout callback', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ExpressionStatement' }],
        },
        loc: { start: { line: 1, column: 15 }, end: { line: 1, column: 30 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should report function expression used as event handler', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'FunctionExpression',
        id: null,
        params: [{ type: 'Identifier', name: 'event' }],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 10, column: 20 }, end: { line: 10, column: 50 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should report function expression used as Promise callback', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'FunctionExpression',
        id: null,
        params: [
          { type: 'Identifier', name: 'resolve' },
          { type: 'Identifier', name: 'reject' },
        ],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 40 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should report function expression used as then callback', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'FunctionExpression',
        id: null,
        params: [{ type: 'Identifier', name: 'result' }],
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ReturnStatement',
              argument: { type: 'Identifier', name: 'result' },
            },
          ],
        },
        loc: { start: { line: 4, column: 8 }, end: { line: 4, column: 30 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should report function expression used as catch callback', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'FunctionExpression',
        id: null,
        params: [{ type: 'Identifier', name: 'error' }],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 6, column: 8 }, end: { line: 6, column: 30 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should report function expression used as forEach callback', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'FunctionExpression',
        id: null,
        params: [
          { type: 'Identifier', name: 'element' },
          { type: 'Identifier', name: 'index' },
          { type: 'Identifier', name: 'array' },
        ],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should report function expression with type annotation params', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'FunctionExpression',
        id: null,
        params: [
          {
            type: 'Identifier',
            name: 'x',
            typeAnnotation: { type: 'TSTypeAnnotation' },
          },
        ],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should report function expression with extra properties', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
        leadingComments: [],
        trailingComments: [],
      })

      expect(reports.length).toBe(1)
    })
  })

  describe('not reporting arrow functions', () => {
    test('should not report arrow function expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createArrowFunctionExpression())

      expect(reports.length).toBe(0)
    })

    test('should not report arrow functions among function expressions', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(1, 0))
      visitor.FunctionExpression(createArrowFunctionExpression(2, 0))
      visitor.FunctionExpression(createFunctionExpression(3, 0))

      expect(reports.length).toBe(2)
    })

    test('should not report arrow function with params', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report arrow function with expression body', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'Identifier', name: 'x' },
        expression: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report async arrow function', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
        async: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should correctly count only FunctionExpression nodes in mixed sequence', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createArrowFunctionExpression())
      visitor.FunctionExpression(createFunctionExpression())
      visitor.FunctionExpression(createArrowFunctionExpression())
      visitor.FunctionExpression(createArrowFunctionExpression())

      expect(reports.length).toBe(1)
    })

    test('should not report when all nodes are arrow functions', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createArrowFunctionExpression(1, 0))
      visitor.FunctionExpression(createArrowFunctionExpression(2, 5))
      visitor.FunctionExpression(createArrowFunctionExpression(3, 10))

      expect(reports.length).toBe(0)
    })
  })

  describe('non-function expressions', () => {
    test('should allow identifier expressions', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createIdentifier())

      expect(reports.length).toBe(0)
    })

    test('should handle non-function node types', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'foo' },
        arguments: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should not report Literal nodes', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'Literal',
        value: 42,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report BinaryExpression nodes', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report MemberExpression nodes', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'prop' },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report ConditionalExpression nodes', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'x' },
        consequent: { type: 'Identifier', name: 'a' },
        alternate: { type: 'Identifier', name: 'b' },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report ArrayExpression nodes', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'ArrayExpression',
        elements: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should not report ObjectExpression nodes', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'ObjectExpression',
        properties: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should not report NewExpression nodes', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Map' },
        arguments: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should not report TemplateLiteral nodes', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'TemplateLiteral',
        quasis: [],
        expressions: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should not report UpdateExpression nodes', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'UpdateExpression',
        operator: '++',
        argument: { type: 'Identifier', name: 'x' },
        prefix: false,
      })

      expect(reports.length).toBe(0)
    })

    test('should not report UnaryExpression nodes', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'UnaryExpression',
        operator: '!',
        argument: { type: 'Identifier', name: 'x' },
        prefix: true,
      })

      expect(reports.length).toBe(0)
    })

    test('should not report AssignmentExpression nodes', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 1 },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report LogicalExpression nodes', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report ThisExpression nodes', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({ type: 'ThisExpression' })

      expect(reports.length).toBe(0)
    })

    test('should not report FunctionDeclaration nodes', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report ClassExpression nodes', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'ClassExpression',
        id: null,
        body: { type: 'ClassBody', body: [] },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report AwaitExpression nodes', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'AwaitExpression',
        argument: { type: 'Identifier', name: 'promise' },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report YieldExpression nodes', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'YieldExpression',
        argument: { type: 'Identifier', name: 'value' },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report SpreadElement nodes', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'SpreadElement',
        argument: { type: 'Identifier', name: 'arr' },
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      expect(() => visitor.FunctionExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      expect(() => visitor.FunctionExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      expect(() => visitor.FunctionExpression('string')).not.toThrow()
      expect(() => visitor.FunctionExpression(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without type property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      const node = {
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.FunctionExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      const node = {
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.FunctionExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createFunctionExpression())

      expect(reports.length).toBe(1)
    })

    test('should handle undefined options array', () => {
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
        getSource: () => 'function(x) { return x * 2 }',
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

      const visitor = preferArrowCallbackRule.create(context)
      visitor.FunctionExpression(createFunctionExpression())

      expect(reports.length).toBe(1)
    })

    test('should handle boolean node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      expect(() => visitor.FunctionExpression(true)).not.toThrow()
      expect(() => visitor.FunctionExpression(false)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle numeric node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      expect(() => visitor.FunctionExpression(0)).not.toThrow()
      expect(() => visitor.FunctionExpression(-1)).not.toThrow()
      expect(() => visitor.FunctionExpression(3.14)).not.toThrow()
      expect(() => visitor.FunctionExpression(NaN)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle string node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      expect(() => visitor.FunctionExpression('')).not.toThrow()
      expect(() => visitor.FunctionExpression('FunctionExpression')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle array node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      expect(() => visitor.FunctionExpression([])).not.toThrow()
      expect(() => visitor.FunctionExpression([1, 2, 3])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with type as number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({ type: 42 })

      expect(reports.length).toBe(0)
    })

    test('should handle node with type as boolean', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({ type: true })

      expect(reports.length).toBe(0)
    })

    test('should handle node with type as null', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({ type: null })

      expect(reports.length).toBe(0)
    })

    test('should handle node with type as object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({ type: { name: 'FunctionExpression' } })

      expect(reports.length).toBe(0)
    })

    test('should handle node with empty object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({})

      expect(reports.length).toBe(0)
    })

    test('should handle node with only loc property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should be case-sensitive for type check', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'functionexpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      })

      expect(reports.length).toBe(0)
    })

    test('should be case-sensitive for FUNCTIONEXPRESSION', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'FUNCTIONEXPRESSION',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      })

      expect(reports.length).toBe(0)
    })

    test('should be case-sensitive for Functionexpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'Functionexpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle loc with missing start', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'FunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should handle loc with missing end', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'FunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should handle loc with string line numbers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'FunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: {
          start: { line: '1', column: '0' },
          end: { line: '1', column: '10' },
        },
      })

      expect(reports.length).toBe(1)
    })

    test('should handle loc with null values', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'FunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: null, end: null },
      })

      expect(reports.length).toBe(1)
    })

    test('should handle loc with undefined values', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'FunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: undefined, end: undefined },
      })

      expect(reports.length).toBe(1)
    })

    test('should handle very large line numbers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(99999, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(99999)
    })

    test('should handle very large column numbers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(1, 99999))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(99999)
    })

    test('should handle zero line and column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(0, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle negative line numbers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(-1, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(-1)
    })

    test('should handle negative column numbers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(1, -5))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(-5)
    })

    test('should handle Infinity as line', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'FunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: Infinity, column: 0 }, end: { line: Infinity, column: 10 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should handle same visitor called many times', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      for (let i = 0; i < 100; i++) {
        visitor.FunctionExpression(createFunctionExpression(i + 1, 0))
      }

      expect(reports.length).toBe(100)
    })

    test('should not accumulate state between visitors', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext()
      const v1 = preferArrowCallbackRule.create(ctx1)
      v1.FunctionExpression(createFunctionExpression())
      v1.FunctionExpression(createFunctionExpression())

      const { context: ctx2, reports: r2 } = createMockRuleContext()
      const v2 = preferArrowCallbackRule.create(ctx2)
      v2.FunctionExpression(createFunctionExpression())

      expect(r1.length).toBe(2)
      expect(r2.length).toBe(1)
    })

    test('should handle Symbol as node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      expect(() => visitor.FunctionExpression(Symbol('test'))).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle Date as node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      expect(() => visitor.FunctionExpression(new Date())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle RegExp as node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      expect(() => visitor.FunctionExpression(/test/)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle Map as node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      expect(() => visitor.FunctionExpression(new Map())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle Set as node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      expect(() => visitor.FunctionExpression(new Set())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with prototype properties', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      const proto = { type: 'FunctionExpression' }
      const node = Object.create(proto)
      node.params = []
      node.body = { type: 'BlockStatement', body: [] }

      visitor.FunctionExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('location reporting', () => {
    test('should report correct location for function expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report location with end position', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(5, 10))

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should report correct end line', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(3, 0))

      expect(reports[0].loc?.end.line).toBe(3)
    })

    test('should report correct end column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(1, 0))

      expect(reports[0].loc?.end.column).toBe(20)
    })

    test('should report location for each function expression separately', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(1, 0))
      visitor.FunctionExpression(createFunctionExpression(5, 10))
      visitor.FunctionExpression(createFunctionExpression(20, 3))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[1].loc?.start.line).toBe(5)
      expect(reports[1].loc?.start.column).toBe(10)
      expect(reports[2].loc?.start.line).toBe(20)
      expect(reports[2].loc?.start.column).toBe(3)
    })

    test('should handle multiline function expression location', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 10, column: 1 },
        },
      })

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[0].loc?.end.column).toBe(1)
    })

    test('should provide default location when loc is missing', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
      })

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should preserve exact start location', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: {
          start: { line: 42, column: 7 },
          end: { line: 42, column: 30 },
        },
      })

      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(7)
    })

    test('should preserve exact end location', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 35 },
        },
      })

      expect(reports[0].loc?.end.line).toBe(1)
      expect(reports[0].loc?.end.column).toBe(35)
    })

    test('should handle location at file start', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle location with large values', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: {
          start: { line: 5000, column: 200 },
          end: { line: 5020, column: 5 },
        },
      })

      expect(reports[0].loc?.start.line).toBe(5000)
      expect(reports[0].loc?.start.column).toBe(200)
      expect(reports[0].loc?.end.line).toBe(5020)
      expect(reports[0].loc?.end.column).toBe(5)
    })
  })

  describe('message quality', () => {
    test('should mention arrow in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createFunctionExpression())

      expect(reports[0].message).toContain('arrow')
    })

    test('should mention function in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createFunctionExpression())

      expect(reports[0].message).toContain('function')
    })

    test('should mention callback in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createFunctionExpression())

      expect(reports[0].message).toContain('callback')
    })

    test('should have consistent message format', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(1, 0))
      visitor.FunctionExpression(createFunctionExpression(2, 0))

      expect(reports[0].message).toBe('Use arrow function for callback')
      expect(reports[1].message).toBe('Use arrow function for callback')
    })

    test('message should start with uppercase', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createFunctionExpression())

      expect(reports[0].message[0]).toBe(reports[0].message[0].toUpperCase())
    })

    test('message should not end with period', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createFunctionExpression())

      expect(reports[0].message.endsWith('.')).toBe(false)
    })

    test('message should be a non-empty string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createFunctionExpression())

      expect(typeof reports[0].message).toBe('string')
      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('message should be the same for all function expressions', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(1, 0))
      visitor.FunctionExpression({
        type: 'FunctionExpression',
        id: { type: 'Identifier', name: 'foo' },
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 5, column: 10 }, end: { line: 5, column: 30 } },
      })
      visitor.FunctionExpression({
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        async: true,
        loc: { start: { line: 10, column: 0 }, end: { line: 10, column: 20 } },
      })

      expect(reports[0].message).toBe(reports[1].message)
      expect(reports[1].message).toBe(reports[2].message)
    })

    test('message should contain actionable word', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createFunctionExpression())

      expect(reports[0].message).toContain('Use')
    })
  })

  describe('report descriptor shape', () => {
    test('report should have message property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createFunctionExpression())

      expect(reports[0]).toHaveProperty('message')
    })

    test('report should have loc property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createFunctionExpression())

      expect(reports[0]).toHaveProperty('loc')
    })

    test('loc should have start property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createFunctionExpression())

      expect(reports[0].loc).toHaveProperty('start')
    })

    test('loc should have end property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createFunctionExpression())

      expect(reports[0].loc).toHaveProperty('end')
    })

    test('start should have line and column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createFunctionExpression())

      expect(reports[0].loc?.start).toHaveProperty('line')
      expect(reports[0].loc?.start).toHaveProperty('column')
    })

    test('end should have line and column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createFunctionExpression())

      expect(reports[0].loc?.end).toHaveProperty('line')
      expect(reports[0].loc?.end).toHaveProperty('column')
    })

    test('start line should be a number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createFunctionExpression())

      expect(typeof reports[0].loc?.start.line).toBe('number')
    })

    test('start column should be a number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createFunctionExpression())

      expect(typeof reports[0].loc?.start.column).toBe('number')
    })

    test('end line should be a number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createFunctionExpression())

      expect(typeof reports[0].loc?.end.line).toBe('number')
    })

    test('end column should be a number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createFunctionExpression())

      expect(typeof reports[0].loc?.end.column).toBe('number')
    })
  })

  describe('context variations', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockRuleContext({ filePath: '/project/src/utils.ts' })
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createFunctionExpression())

      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.map(function(x) { return x; })', filePath: '/src/test.ts' })
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createFunctionExpression())

      expect(reports.length).toBe(1)
    })

    test('should work with empty source code', () => {
      const { context, reports } = createMockRuleContext({ source: '', filePath: '/src/empty.ts' })
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createFunctionExpression())

      expect(reports.length).toBe(1)
    })

    test('should work with config having options', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowNamedFunctions: true }] })
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createFunctionExpression())

      expect(reports.length).toBe(1)
    })

    test('should work with config having multiple options', () => {
      const { context, reports } = createMockRuleContext({ options: [{
        allowNamedFunctions: true,
        excludePatterns: ['test'],
      }] })
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createFunctionExpression())

      expect(reports.length).toBe(1)
    })

    test('should work with long file path', () => {
      const longPath = '/very/long/path/to/some/deeply/nested/directory/structure/file.ts'
      const { context, reports } = createMockRuleContext({ filePath: longPath })
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createFunctionExpression())

      expect(reports.length).toBe(1)
    })

    test('should work with different workspace roots', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/home/user/project/file.ts',
        getAST: () => null,
        getSource: () => 'code',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/home/user/project',
      } as unknown as RuleContext

      const visitor = preferArrowCallbackRule.create(context)
      visitor.FunctionExpression(createFunctionExpression())

      expect(reports.length).toBe(1)
    })

    test('should work with parserServices on context', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'code',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
        parserServices: {
          program: {},
          esTreeNodeToTSNodeMap: new Map(),
          tsNodeToESTreeNodeMap: new Map(),
        },
      } as unknown as RuleContext

      const visitor = preferArrowCallbackRule.create(context)
      visitor.FunctionExpression(createFunctionExpression())

      expect(reports.length).toBe(1)
    })
  })

  describe('export verification', () => {
    test('should export preferArrowCallbackRule as named export', () => {
      expect(preferArrowCallbackRule).toBeDefined()
    })

    test('should export a valid RuleDefinition', () => {
      expect(preferArrowCallbackRule).toHaveProperty('meta')
      expect(preferArrowCallbackRule).toHaveProperty('create')
      expect(typeof preferArrowCallbackRule.create).toBe('function')
    })

    test('should have correct meta structure', () => {
      const { meta } = preferArrowCallbackRule
      expect(meta).toHaveProperty('type')
      expect(meta).toHaveProperty('severity')
      expect(meta).toHaveProperty('docs')
      expect(meta).toHaveProperty('schema')
    })

    test('should be a frozen or sealed object for immutability', () => {
      expect(typeof preferArrowCallbackRule).toBe('object')
    })

    test('meta should be readonly-like (has expected properties)', () => {
      expect(Object.keys(preferArrowCallbackRule.meta)).toContain('type')
      expect(Object.keys(preferArrowCallbackRule.meta)).toContain('severity')
      expect(Object.keys(preferArrowCallbackRule.meta)).toContain('docs')
      expect(Object.keys(preferArrowCallbackRule.meta)).toContain('schema')
    })

    test('default export should be the same as named export', () => {
      expect(preferArrowCallbackRule.meta.type).toBe('suggestion')
    })
  })

  describe('logger interaction', () => {
    test('should not call logger.debug during normal operation', () => {
      const logger = { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'code',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger,
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = preferArrowCallbackRule.create(context)
      visitor.FunctionExpression(createFunctionExpression())

      expect(logger.debug).not.toHaveBeenCalled()
    })

    test('should not call logger.info during normal operation', () => {
      const logger = { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'code',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger,
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = preferArrowCallbackRule.create(context)
      visitor.FunctionExpression(createFunctionExpression())

      expect(logger.info).not.toHaveBeenCalled()
    })

    test('should not call logger.warn during normal operation', () => {
      const logger = { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'code',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger,
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = preferArrowCallbackRule.create(context)
      visitor.FunctionExpression(createFunctionExpression())

      expect(logger.warn).not.toHaveBeenCalled()
    })

    test('should not call logger.error during normal operation', () => {
      const logger = { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'code',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger,
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = preferArrowCallbackRule.create(context)
      visitor.FunctionExpression(createFunctionExpression())

      expect(logger.error).not.toHaveBeenCalled()
    })

    test('should not call logger for null node', () => {
      const logger = { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'code',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger,
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = preferArrowCallbackRule.create(context)
      visitor.FunctionExpression(null)

      expect(logger.warn).not.toHaveBeenCalled()
      expect(logger.error).not.toHaveBeenCalled()
    })

    test('should not call logger for invalid node types', () => {
      const logger = { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'code',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger,
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = preferArrowCallbackRule.create(context)
      visitor.FunctionExpression('not a node')
      visitor.FunctionExpression(42)
      visitor.FunctionExpression(undefined)

      expect(logger.error).not.toHaveBeenCalled()
    })
  })

  describe('mixed scenarios', () => {
    test('should handle alternating valid and invalid nodes', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(1, 0))
      visitor.FunctionExpression(createArrowFunctionExpression(2, 0))
      visitor.FunctionExpression(createFunctionExpression(3, 0))
      visitor.FunctionExpression(createArrowFunctionExpression(4, 0))
      visitor.FunctionExpression(createFunctionExpression(5, 0))

      expect(reports.length).toBe(3)
    })

    test('should handle function expression followed by edge cases', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createFunctionExpression())
      visitor.FunctionExpression(null)
      visitor.FunctionExpression(undefined)
      visitor.FunctionExpression('string')

      expect(reports.length).toBe(1)
    })

    test('should handle edge cases followed by function expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(null)
      visitor.FunctionExpression(undefined)
      visitor.FunctionExpression(createFunctionExpression())

      expect(reports.length).toBe(1)
    })

    test('should maintain correct order of reports', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(1, 0))
      visitor.FunctionExpression(createFunctionExpression(5, 10))
      visitor.FunctionExpression(createFunctionExpression(10, 20))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
      expect(reports[2].loc?.start.line).toBe(10)
    })

    test('should handle rapid fire function expressions', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferArrowCallbackRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.FunctionExpression(createFunctionExpression(i + 1, 0))
      }

      expect(reports.length).toBe(50)
      for (let i = 0; i < 50; i++) {
        expect(reports[i].loc?.start.line).toBe(i + 1)
      }
    })

    test('should handle interleaved create calls', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext()
      const { context: ctx2, reports: r2 } = createMockRuleContext()

      const v1 = preferArrowCallbackRule.create(ctx1)
      const v2 = preferArrowCallbackRule.create(ctx2)

      v1.FunctionExpression(createFunctionExpression())
      v2.FunctionExpression(createFunctionExpression())
      v2.FunctionExpression(createFunctionExpression())
      v1.FunctionExpression(createFunctionExpression())

      expect(r1.length).toBe(2)
      expect(r2.length).toBe(2)
    })
  })

  describe('context method usage', () => {
    test('should call context.report exactly once per function expression', () => {
      let reportCount = 0
      const context: RuleContext = {
        report: () => {
          reportCount++
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'code',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = preferArrowCallbackRule.create(context)
      visitor.FunctionExpression(createFunctionExpression())

      expect(reportCount).toBe(1)
    })

    test('should not call context.report for arrow function', () => {
      let reportCount = 0
      const context: RuleContext = {
        report: () => {
          reportCount++
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'code',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = preferArrowCallbackRule.create(context)
      visitor.FunctionExpression(createArrowFunctionExpression())

      expect(reportCount).toBe(0)
    })

    test('should not call context.report for null node', () => {
      let reportCount = 0
      const context: RuleContext = {
        report: () => {
          reportCount++
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'code',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = preferArrowCallbackRule.create(context)
      visitor.FunctionExpression(null)

      expect(reportCount).toBe(0)
    })

    test('should not call context.report for non-FunctionExpression type', () => {
      let reportCount = 0
      const context: RuleContext = {
        report: () => {
          reportCount++
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'code',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = preferArrowCallbackRule.create(context)
      visitor.FunctionExpression(createIdentifier())

      expect(reportCount).toBe(0)
    })

    test('should call context.report with message property', () => {
      let reportedMessage = ''
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reportedMessage = descriptor.message
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'code',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = preferArrowCallbackRule.create(context)
      visitor.FunctionExpression(createFunctionExpression())

      expect(reportedMessage).toBe('Use arrow function for callback')
    })

    test('should call context.report with loc property', () => {
      let reportedLoc: unknown = null
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reportedLoc = descriptor.loc
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'code',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = preferArrowCallbackRule.create(context)
      visitor.FunctionExpression(createFunctionExpression(7, 3))

      expect(reportedLoc).toBeDefined()
    })

    test('should pass correct loc start line to report', () => {
      let reportedLoc: unknown = null
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reportedLoc = descriptor.loc
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'code',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = preferArrowCallbackRule.create(context)
      visitor.FunctionExpression(createFunctionExpression(15, 8))

      const loc = reportedLoc as { start: { line: number; column: number } }
      expect(loc.start.line).toBe(15)
      expect(loc.start.column).toBe(8)
    })

    test('should accumulate reports correctly across calls', () => {
      let reportCount = 0
      const context: RuleContext = {
        report: () => {
          reportCount++
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'code',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = preferArrowCallbackRule.create(context)
      visitor.FunctionExpression(createFunctionExpression())
      visitor.FunctionExpression(createArrowFunctionExpression())
      visitor.FunctionExpression(createFunctionExpression())
      visitor.FunctionExpression(null)
      visitor.FunctionExpression(createFunctionExpression())

      expect(reportCount).toBe(3)
    })

    test('should not call report for FunctionDeclaration inside visitor', () => {
      let reportCount = 0
      const context: RuleContext = {
        report: () => {
          reportCount++
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'code',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = preferArrowCallbackRule.create(context)
      visitor.FunctionExpression({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reportCount).toBe(0)
    })

    test('should pass loc end to report descriptor', () => {
      let reportedLoc: unknown = null
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reportedLoc = descriptor.loc
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'code',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = preferArrowCallbackRule.create(context)
      visitor.FunctionExpression(createFunctionExpression(3, 5))

      const loc = reportedLoc as { end: { line: number; column: number } }
      expect(loc.end.line).toBe(3)
      expect(loc.end.column).toBe(20)
    })
  })
})
