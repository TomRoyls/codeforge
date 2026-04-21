import { describe, test, expect, vi } from 'vitest'
import { noAsyncPromiseExecutorRule } from '../../../../src/rules/patterns/no-async-promise-executor.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createNewExpression(callee: unknown, args: unknown[], line = 1, column = 0): unknown {
  return {
    type: 'NewExpression',
    callee,
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

function createAsyncFunctionExpression(): unknown {
  return {
    type: 'FunctionExpression',
    async: true,
    params: [
      { type: 'Identifier', name: 'resolve' },
      { type: 'Identifier', name: 'reject' },
    ],
    body: {
      type: 'BlockStatement',
      body: [],
    },
  }
}

function createAsyncArrowFunction(): unknown {
  return {
    type: 'ArrowFunctionExpression',
    async: true,
    params: [{ type: 'Identifier', name: 'resolve' }],
    body: {
      type: 'BlockStatement',
      body: [],
    },
  }
}

function createSyncFunctionExpression(): unknown {
  return {
    type: 'FunctionExpression',
    async: false,
    params: [
      { type: 'Identifier', name: 'resolve' },
      { type: 'Identifier', name: 'reject' },
    ],
    body: {
      type: 'BlockStatement',
      body: [],
    },
  }
}

function createSyncArrowFunction(): unknown {
  return {
    type: 'ArrowFunctionExpression',
    async: false,
    params: [{ type: 'Identifier', name: 'resolve' }],
    body: {
      type: 'BlockStatement',
      body: [],
    },
  }
}

describe('no-async-promise-executor rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noAsyncPromiseExecutorRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noAsyncPromiseExecutorRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noAsyncPromiseExecutorRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noAsyncPromiseExecutorRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noAsyncPromiseExecutorRule.meta.schema).toBeDefined()
    })

    test('should be fixable', () => {
      expect(noAsyncPromiseExecutorRule.meta.fixable).toBe('code')
    })

    test('should mention async in description', () => {
      expect(noAsyncPromiseExecutorRule.meta.docs?.description.toLowerCase()).toContain('async')
    })

    test('should mention promise in description', () => {
      expect(noAsyncPromiseExecutorRule.meta.docs?.description.toLowerCase()).toContain('promise')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      expect(visitor).toHaveProperty('NewExpression')
    })
  })

  describe('detecting async promise executors', () => {
    test('should report new Promise(async function() {})', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = createNewExpression(createIdentifier('Promise'), [
        createAsyncFunctionExpression(),
      ])

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('async')
    })

    test('should report new Promise(async () => {})', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = createNewExpression(createIdentifier('Promise'), [createAsyncArrowFunction()])

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report new Promise(function() {})', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = createNewExpression(createIdentifier('Promise'), [
        createSyncFunctionExpression(),
      ])

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Promise(() => {})', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = createNewExpression(createIdentifier('Promise'), [createSyncArrowFunction()])

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Other(async function() {})', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = createNewExpression(createIdentifier('Other'), [createAsyncFunctionExpression()])

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Promise() without arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = createNewExpression(createIdentifier('Promise'), [])

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Promise(resolve => resolve())', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const syncFn = {
        type: 'ArrowFunctionExpression',
        async: false,
        params: [{ type: 'Identifier', name: 'resolve' }],
        body: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'resolve' },
          arguments: [],
        },
      }
      const node = createNewExpression(createIdentifier('Promise'), [syncFn])

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      expect(() => visitor.NewExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      expect(() => visitor.NewExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      expect(() => visitor.NewExpression('string')).not.toThrow()
      expect(() => visitor.NewExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Promise'),
        arguments: [createAsyncFunctionExpression()],
      }

      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = createNewExpression(
        createIdentifier('Promise'),
        [createAsyncFunctionExpression()],
        20,
        10,
      )

      visitor.NewExpression(node)

      expect(reports[0].loc?.start.line).toBe(20)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('Promise'), [createAsyncFunctionExpression()]),
      )

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
        getSource: () => 'new Promise(async (resolve) => {});',
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

      const visitor = noAsyncPromiseExecutorRule.create(context)

      expect(() =>
        visitor.NewExpression(
          createNewExpression(createIdentifier('Promise'), [createAsyncFunctionExpression()]),
        ),
      ).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })

  describe('message quality', () => {
    test('should mention async in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('Promise'), [createAsyncFunctionExpression()]),
      )

      expect(reports[0].message.toLowerCase()).toContain('async')
    })

    test('should mention promise in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('Promise'), [createAsyncFunctionExpression()]),
      )

      expect(reports[0].message.toLowerCase()).toContain('promise')
    })

    test('should mention executor in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('Promise'), [createAsyncFunctionExpression()]),
      )

      expect(reports[0].message.toLowerCase()).toContain('executor')
    })
  })

  describe('loc edge cases', () => {
    test('should handle loc with non-number line', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Promise'),
        arguments: [createAsyncFunctionExpression()],
        loc: {
          start: { line: 'not-a-number' as unknown as number, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with non-number column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Promise'),
        arguments: [createAsyncFunctionExpression()],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 'not-a-number' as unknown as number },
        },
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.end.column).toBe(0)
    })

    test('should handle loc with undefined start', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Promise'),
        arguments: [createAsyncFunctionExpression()],
        loc: {
          end: { line: 1, column: 10 },
        },
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle loc with undefined end', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Promise'),
        arguments: [createAsyncFunctionExpression()],
        loc: {
          start: { line: 1, column: 0 },
        },
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle empty loc object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Promise'),
        arguments: [createAsyncFunctionExpression()],
        loc: {},
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('meta - extended properties', () => {
    test('should have meta as an object', () => {
      expect(typeof noAsyncPromiseExecutorRule.meta).toBe('object')
    })

    test('should have meta.type as a string', () => {
      expect(typeof noAsyncPromiseExecutorRule.meta.type).toBe('string')
    })

    test('should have meta.severity as a string', () => {
      expect(typeof noAsyncPromiseExecutorRule.meta.severity).toBe('string')
    })

    test('should have meta.docs as an object', () => {
      expect(typeof noAsyncPromiseExecutorRule.meta.docs).toBe('object')
    })

    test('should have meta.docs.description as non-empty string', () => {
      expect(noAsyncPromiseExecutorRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have meta.docs.category as a string', () => {
      expect(typeof noAsyncPromiseExecutorRule.meta.docs?.category).toBe('string')
    })

    test('should have meta.docs.recommended as a boolean', () => {
      expect(typeof noAsyncPromiseExecutorRule.meta.docs?.recommended).toBe('boolean')
    })

    test('should have meta.docs.url as a string', () => {
      expect(typeof noAsyncPromiseExecutorRule.meta.docs?.url).toBe('string')
    })

    test('should have meta.docs.url containing https', () => {
      expect(noAsyncPromiseExecutorRule.meta.docs?.url).toContain('https://')
    })

    test('should have meta.docs.url containing codeforge', () => {
      expect(noAsyncPromiseExecutorRule.meta.docs?.url).toContain('codeforge')
    })

    test('should have meta.fixable as code', () => {
      expect(noAsyncPromiseExecutorRule.meta.fixable).toBe('code')
    })

    test('should have meta.schema as an array', () => {
      expect(Array.isArray(noAsyncPromiseExecutorRule.meta.schema)).toBe(true)
    })

    test('should have meta.schema as empty array', () => {
      expect(noAsyncPromiseExecutorRule.meta.schema).toEqual([])
    })

    test('should have description longer than 20 characters', () => {
      expect(noAsyncPromiseExecutorRule.meta.docs?.description.length).toBeGreaterThan(20)
    })

    test('should have description mentioning wrapping', () => {
      expect(noAsyncPromiseExecutorRule.meta.docs?.description.toLowerCase()).toContain('wrapping')
    })

    test('should have description mentioning redundant', () => {
      expect(noAsyncPromiseExecutorRule.meta.docs?.description.toLowerCase()).toContain('redundant')
    })

    test('should not have meta.deprecated set to true', () => {
      expect(noAsyncPromiseExecutorRule.meta.deprecated).not.toBe(true)
    })

    test('should not have meta.replacedBy', () => {
      expect(noAsyncPromiseExecutorRule.meta.replacedBy).toBeUndefined()
    })

    test('should not have meta.requiresTypeChecking set to true', () => {
      expect(noAsyncPromiseExecutorRule.meta.requiresTypeChecking).not.toBe(true)
    })

    test('should have valid severity level', () => {
      expect(['off', 'warn', 'error']).toContain(noAsyncPromiseExecutorRule.meta.severity)
    })

    test('should have valid type', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(noAsyncPromiseExecutorRule.meta.type)
    })

    test('should have recommended set to true explicitly', () => {
      expect(noAsyncPromiseExecutorRule.meta.docs?.recommended).toBe(true)
    })
  })

  describe('create - extended visitor checks', () => {
    test('should return an object from create', () => {
      const { context } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)
      expect(typeof visitor).toBe('object')
    })

    test('should return a non-null visitor', () => {
      const { context } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)
      expect(visitor).not.toBeNull()
    })

    test('should have NewExpression as a function', () => {
      const { context } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)
      expect(typeof visitor.NewExpression).toBe('function')
    })

    test('should return consistent visitor type', () => {
      const { context } = createMockRuleContext()
      const visitor1 = noAsyncPromiseExecutorRule.create(context)
      const visitor2 = noAsyncPromiseExecutorRule.create(context)
      expect(typeof visitor1).toBe(typeof visitor2)
    })

    test('should have exactly one visitor method', () => {
      const { context } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)
      const keys = Object.keys(visitor)
      expect(keys.length).toBe(1)
    })

    test('should have visitor method named NewExpression', () => {
      const { context } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)
      expect(Object.keys(visitor)).toContain('NewExpression')
    })

    test('should not have FunctionExpression visitor', () => {
      const { context } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)
      expect(visitor).not.toHaveProperty('FunctionExpression')
    })

    test('should not have ArrowFunctionExpression visitor', () => {
      const { context } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)
      expect(visitor).not.toHaveProperty('ArrowFunctionExpression')
    })

    test('should not have CallExpression visitor', () => {
      const { context } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)
      expect(visitor).not.toHaveProperty('CallExpression')
    })

    test('should not have ExpressionStatement visitor', () => {
      const { context } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)
      expect(visitor).not.toHaveProperty('ExpressionStatement')
    })

    test('should return independent visitors for different contexts', () => {
      const { context: ctx1 } = createMockRuleContext()
      const { context: ctx2 } = createMockRuleContext()
      const visitor1 = noAsyncPromiseExecutorRule.create(ctx1)
      const visitor2 = noAsyncPromiseExecutorRule.create(ctx2)
      expect(visitor1).not.toBe(visitor2)
    })

    test('should accept context without throwing', () => {
      const { context } = createMockRuleContext()
      expect(() => noAsyncPromiseExecutorRule.create(context)).not.toThrow()
    })
  })

  describe('detecting async executors - function expressions', () => {
    test('should detect async function with no params', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const asyncFn = {
        type: 'FunctionExpression',
        async: true,
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }
      const node = createNewExpression(createIdentifier('Promise'), [asyncFn])

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect async function with single resolve param', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const asyncFn = {
        type: 'FunctionExpression',
        async: true,
        params: [{ type: 'Identifier', name: 'resolve' }],
        body: { type: 'BlockStatement', body: [] },
      }
      const node = createNewExpression(createIdentifier('Promise'), [asyncFn])

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect async function with resolve and reject params', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = createNewExpression(createIdentifier('Promise'), [
        createAsyncFunctionExpression(),
      ])
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect async function with extra params', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const asyncFn = {
        type: 'FunctionExpression',
        async: true,
        params: [
          { type: 'Identifier', name: 'resolve' },
          { type: 'Identifier', name: 'reject' },
          { type: 'Identifier', name: 'extra' },
        ],
        body: { type: 'BlockStatement', body: [] },
      }
      const node = createNewExpression(createIdentifier('Promise'), [asyncFn])

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect async function named executor', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const asyncFn = {
        type: 'FunctionExpression',
        async: true,
        id: { type: 'Identifier', name: 'executor' },
        params: [{ type: 'Identifier', name: 'resolve' }],
        body: { type: 'BlockStatement', body: [] },
      }
      const node = createNewExpression(createIdentifier('Promise'), [asyncFn])

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect async arrow with block body', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = createNewExpression(createIdentifier('Promise'), [createAsyncArrowFunction()])
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect async arrow with expression body', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const asyncArrow = {
        type: 'ArrowFunctionExpression',
        async: true,
        params: [{ type: 'Identifier', name: 'resolve' }],
        body: { type: 'Identifier', name: 'resolve' },
      }
      const node = createNewExpression(createIdentifier('Promise'), [asyncArrow])

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect async arrow with no params', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const asyncArrow = {
        type: 'ArrowFunctionExpression',
        async: true,
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }
      const node = createNewExpression(createIdentifier('Promise'), [asyncArrow])

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect async arrow with destructured param', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const asyncArrow = {
        type: 'ArrowFunctionExpression',
        async: true,
        params: [{ type: 'ObjectPattern', properties: [] }],
        body: { type: 'BlockStatement', body: [] },
      }
      const node = createNewExpression(createIdentifier('Promise'), [asyncArrow])

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting - negative callee checks', () => {
    test('should not report new Foo(async function() {})', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = createNewExpression(createIdentifier('Foo'), [createAsyncFunctionExpression()])
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new MyPromise(async function() {})', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = createNewExpression(createIdentifier('MyPromise'), [
        createAsyncFunctionExpression(),
      ])
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new promise (lowercase) with async', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = createNewExpression(createIdentifier('promise'), [
        createAsyncFunctionExpression(),
      ])
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new PROMISE (uppercase) with async', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = createNewExpression(createIdentifier('PROMISE'), [
        createAsyncFunctionExpression(),
      ])
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Array(async function() {})', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = createNewExpression(createIdentifier('Array'), [createAsyncFunctionExpression()])
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Map(async function() {})', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = createNewExpression(createIdentifier('Map'), [createAsyncFunctionExpression()])
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Set(async function() {})', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = createNewExpression(createIdentifier('Set'), [createAsyncFunctionExpression()])
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report with MemberExpression callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const memberCallee = {
        type: 'MemberExpression',
        object: createIdentifier('window'),
        property: createIdentifier('Promise'),
      }
      const node = createNewExpression(memberCallee, [createAsyncFunctionExpression()])
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report with null callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: null,
        arguments: [createAsyncFunctionExpression()],
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report with undefined callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: undefined,
        arguments: [createAsyncFunctionExpression()],
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report with numeric callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Literal', value: 42 },
        arguments: [createAsyncFunctionExpression()],
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report with string callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Literal', value: 'Promise' },
        arguments: [createAsyncFunctionExpression()],
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report with empty identifier name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = createNewExpression(createIdentifier(''), [createAsyncFunctionExpression()])
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report with promiseLike (case-sensitive) callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = createNewExpression(createIdentifier('PromiseLike'), [
        createAsyncFunctionExpression(),
      ])
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report with AsyncFunction constructor', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = createNewExpression(createIdentifier('AsyncFunction'), [
        createAsyncFunctionExpression(),
      ])
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('detecting - negative executor checks', () => {
    test('should not report sync function expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = createNewExpression(createIdentifier('Promise'), [
        createSyncFunctionExpression(),
      ])
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report sync arrow function', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = createNewExpression(createIdentifier('Promise'), [createSyncArrowFunction()])
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when first arg is a string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = createNewExpression(createIdentifier('Promise'), [
        { type: 'Literal', value: 'not a function' },
      ])
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when first arg is a number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = createNewExpression(createIdentifier('Promise'), [
        { type: 'Literal', value: 42 },
      ])
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when first arg is an object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = createNewExpression(createIdentifier('Promise'), [
        { type: 'ObjectExpression', properties: [] },
      ])
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when first arg is an identifier', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = createNewExpression(createIdentifier('Promise'), [createIdentifier('fn')])
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when first arg is a call expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const callExpr = {
        type: 'CallExpression',
        callee: createIdentifier('getExecutor'),
        arguments: [],
      }
      const node = createNewExpression(createIdentifier('Promise'), [callExpr])
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when first arg is a member expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const memberExpr = {
        type: 'MemberExpression',
        object: createIdentifier('obj'),
        property: createIdentifier('fn'),
      }
      const node = createNewExpression(createIdentifier('Promise'), [memberExpr])
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when first arg is null', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = createNewExpression(createIdentifier('Promise'), [null])
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when function has async false', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const syncFn = {
        type: 'FunctionExpression',
        async: false,
        params: [{ type: 'Identifier', name: 'resolve' }],
        body: { type: 'BlockStatement', body: [] },
      }
      const node = createNewExpression(createIdentifier('Promise'), [syncFn])
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when async is undefined on function', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const fn = {
        type: 'FunctionExpression',
        params: [{ type: 'Identifier', name: 'resolve' }],
        body: { type: 'BlockStatement', body: [] },
      }
      const node = createNewExpression(createIdentifier('Promise'), [fn])
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when async is string "true"', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const fn = {
        type: 'FunctionExpression',
        async: 'true',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }
      const node = createNewExpression(createIdentifier('Promise'), [fn])
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when async is 1 (truthy number)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const fn = {
        type: 'FunctionExpression',
        async: 1,
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }
      const node = createNewExpression(createIdentifier('Promise'), [fn])
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report with second async arg (not first)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const syncFn = createSyncFunctionExpression()
      const asyncFn = createAsyncFunctionExpression()
      const node = createNewExpression(createIdentifier('Promise'), [syncFn, asyncFn])
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report with no arguments array', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Promise'),
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report with null arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Promise'),
        arguments: null,
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report with empty array arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = createNewExpression(createIdentifier('Promise'), [])
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('detecting - node type guards', () => {
    test('should not report for CallExpression node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: createIdentifier('Promise'),
        arguments: [createAsyncFunctionExpression()],
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for ExpressionStatement node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = {
        type: 'ExpressionStatement',
        expression: createNewExpression(createIdentifier('Promise'), [
          createAsyncFunctionExpression(),
        ]),
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for VariableDeclaration node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      visitor.NewExpression({ type: 'VariableDeclaration', declarations: [] })

      expect(reports.length).toBe(0)
    })

    test('should not report for FunctionDeclaration node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      visitor.NewExpression({
        type: 'FunctionDeclaration',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report for empty object node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      visitor.NewExpression({})

      expect(reports.length).toBe(0)
    })

    test('should not report for array node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      visitor.NewExpression([])

      expect(reports.length).toBe(0)
    })

    test('should not report for boolean node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      visitor.NewExpression(true)

      expect(reports.length).toBe(0)
    })

    test('should not report for number node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      visitor.NewExpression(42)

      expect(reports.length).toBe(0)
    })
  })

  describe('location - extended', () => {
    test('should report location at line 1 column 0 by default', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = createNewExpression(
        createIdentifier('Promise'),
        [createAsyncFunctionExpression()],
        1,
        0,
      )
      visitor.NewExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at high line numbers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = createNewExpression(
        createIdentifier('Promise'),
        [createAsyncFunctionExpression()],
        999,
        50,
      )
      visitor.NewExpression(node)

      expect(reports[0].loc?.start.line).toBe(999)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report location at line 0', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = createNewExpression(
        createIdentifier('Promise'),
        [createAsyncFunctionExpression()],
        0,
        0,
      )
      visitor.NewExpression(node)

      expect(reports[0].loc?.start.line).toBe(0)
    })

    test('should report location with non-zero column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = createNewExpression(
        createIdentifier('Promise'),
        [createAsyncFunctionExpression()],
        5,
        25,
      )
      visitor.NewExpression(node)

      expect(reports[0].loc?.start.column).toBe(25)
    })

    test('should report end location from node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = createNewExpression(
        createIdentifier('Promise'),
        [createAsyncFunctionExpression()],
        3,
        10,
      )
      visitor.NewExpression(node)

      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(40)
    })

    test('should handle node with NaN line', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Promise'),
        arguments: [createAsyncFunctionExpression()],
        loc: {
          start: { line: NaN, column: 0 },
          end: { line: NaN, column: 0 },
        },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with Infinity column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Promise'),
        arguments: [createAsyncFunctionExpression()],
        loc: {
          start: { line: 1, column: Infinity },
          end: { line: 1, column: Infinity },
        },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with negative line', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Promise'),
        arguments: [createAsyncFunctionExpression()],
        loc: {
          start: { line: -1, column: 0 },
          end: { line: -1, column: 10 },
        },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(-1)
    })

    test('should handle node with negative column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Promise'),
        arguments: [createAsyncFunctionExpression()],
        loc: {
          start: { line: 1, column: -5 },
          end: { line: 1, column: 5 },
        },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(-5)
    })

    test('should handle loc with null start', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Promise'),
        arguments: [createAsyncFunctionExpression()],
        loc: {
          start: null,
          end: { line: 1, column: 10 },
        },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle loc with null end', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Promise'),
        arguments: [createAsyncFunctionExpression()],
        loc: {
          start: { line: 1, column: 0 },
          end: null,
        },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle loc where start.line is missing', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Promise'),
        arguments: [createAsyncFunctionExpression()],
        loc: {
          start: { column: 5 },
          end: { line: 1, column: 10 },
        },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc where start.column is missing', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Promise'),
        arguments: [createAsyncFunctionExpression()],
        loc: {
          start: { line: 5 },
          end: { line: 5, column: 10 },
        },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc where end.line is missing', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Promise'),
        arguments: [createAsyncFunctionExpression()],
        loc: {
          start: { line: 5, column: 0 },
          end: { column: 10 },
        },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.end.line).toBe(1)
    })

    test('should handle loc where end.column is missing', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Promise'),
        arguments: [createAsyncFunctionExpression()],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1 },
        },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.end.column).toBe(0)
    })

    test('should handle loc with extra properties', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Promise'),
        arguments: [createAsyncFunctionExpression()],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
          source: 'test.ts',
        },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('message - extended quality checks', () => {
    test('should have non-empty message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('Promise'), [createAsyncFunctionExpression()]),
      )

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should mention executor in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('Promise'), [createAsyncFunctionExpression()]),
      )

      expect(reports[0].message.toLowerCase()).toContain('executor')
    })

    test('should have message longer than 30 characters', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('Promise'), [createAsyncFunctionExpression()]),
      )

      expect(reports[0].message.length).toBeGreaterThan(30)
    })

    test('should include suggestion in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('Promise'), [createAsyncFunctionExpression()]),
      )

      expect(reports[0].message).toContain('refactor')
    })

    test('should have same message for async function and async arrow', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext()
      const { context: ctx2, reports: r2 } = createMockRuleContext()

      const v1 = noAsyncPromiseExecutorRule.create(ctx1)
      const v2 = noAsyncPromiseExecutorRule.create(ctx2)

      v1.NewExpression(
        createNewExpression(createIdentifier('Promise'), [createAsyncFunctionExpression()]),
      )
      v2.NewExpression(
        createNewExpression(createIdentifier('Promise'), [createAsyncArrowFunction()]),
      )

      expect(r1[0].message).toBe(r2[0].message)
    })

    test('should have message containing should not', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('Promise'), [createAsyncFunctionExpression()]),
      )

      expect(reports[0].message.toLowerCase()).toContain('should not')
    })

    test('should report message as a string type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('Promise'), [createAsyncFunctionExpression()]),
      )

      expect(typeof reports[0].message).toBe('string')
    })

    test('should not have undefined message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('Promise'), [createAsyncFunctionExpression()]),
      )

      expect(reports[0].message).toBeDefined()
    })
  })

  describe('report descriptor shape', () => {
    test('should report with loc property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('Promise'), [createAsyncFunctionExpression()]),
      )

      expect(reports[0].loc).toBeDefined()
    })

    test('should report loc with start and end', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('Promise'), [createAsyncFunctionExpression()]),
      )

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should report loc.start with line and column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('Promise'), [createAsyncFunctionExpression()]),
      )

      expect(reports[0].loc?.start).toHaveProperty('line')
      expect(reports[0].loc?.start).toHaveProperty('column')
    })

    test('should report loc.end with line and column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('Promise'), [createAsyncFunctionExpression()]),
      )

      expect(reports[0].loc?.end).toHaveProperty('line')
      expect(reports[0].loc?.end).toHaveProperty('column')
    })

    test('should report exactly one report per detection', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('Promise'), [createAsyncFunctionExpression()]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report with numeric line number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('Promise'), [createAsyncFunctionExpression()]),
      )

      expect(typeof reports[0].loc?.start.line).toBe('number')
    })

    test('should report with numeric column number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('Promise'), [createAsyncFunctionExpression()]),
      )

      expect(typeof reports[0].loc?.start.column).toBe('number')
    })
  })

  describe('context interaction', () => {
    test('should call report once for async executor', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('Promise'), [createAsyncFunctionExpression()]),
      )

      expect(reports.length).toBe(1)
    })

    test('should not call report for sync executor', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('Promise'), [createSyncFunctionExpression()]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not call report for non-Promise callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('Other'), [createAsyncFunctionExpression()]),
      )

      expect(reports.length).toBe(0)
    })

    test('should handle context with custom file path', () => {
      const { context, reports } = createMockRuleContext({ filePath: '/custom/path.ts' })
      const visitor = noAsyncPromiseExecutorRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('Promise'), [createAsyncFunctionExpression()]),
      )

      expect(reports.length).toBe(1)
    })

    test('should handle context with different source code', () => {
      const { context, reports } = createMockRuleContext({
        source: 'const x = new Promise(async () => {});',
      })
      const visitor = noAsyncPromiseExecutorRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('Promise'), [createAsyncFunctionExpression()]),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with config having extra options', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ checkAsync: true, strict: true }],
      })
      const visitor = noAsyncPromiseExecutorRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('Promise'), [createAsyncFunctionExpression()]),
      )

      expect(reports.length).toBe(1)
    })
  })

  describe('multiple calls', () => {
    test('should report each call independently', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('Promise'), [createAsyncFunctionExpression()]),
      )
      visitor.NewExpression(
        createNewExpression(createIdentifier('Promise'), [createAsyncFunctionExpression()]),
      )

      expect(reports.length).toBe(2)
    })

    test('should report three calls independently', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      for (let i = 0; i < 3; i++) {
        visitor.NewExpression(
          createNewExpression(createIdentifier('Promise'), [createAsyncFunctionExpression()]),
        )
      }

      expect(reports.length).toBe(3)
    })

    test('should mix detected and non-detected calls', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('Promise'), [createAsyncFunctionExpression()]),
      )
      visitor.NewExpression(
        createNewExpression(createIdentifier('Promise'), [createSyncFunctionExpression()]),
      )
      visitor.NewExpression(
        createNewExpression(createIdentifier('Promise'), [createAsyncArrowFunction()]),
      )

      expect(reports.length).toBe(2)
    })

    test('should report for mixed valid and invalid in sequence', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Promise'), []))
      visitor.NewExpression(
        createNewExpression(createIdentifier('Promise'), [createAsyncFunctionExpression()]),
      )
      visitor.NewExpression(
        createNewExpression(createIdentifier('Other'), [createAsyncFunctionExpression()]),
      )
      visitor.NewExpression(
        createNewExpression(createIdentifier('Promise'), [createAsyncArrowFunction()]),
      )

      expect(reports.length).toBe(2)
    })

    test('should not accumulate state between calls', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      visitor.NewExpression(null)
      visitor.NewExpression(
        createNewExpression(createIdentifier('Promise'), [createAsyncFunctionExpression()]),
      )

      expect(reports.length).toBe(1)
    })

    test('should handle many rapid calls', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.NewExpression(
          createNewExpression(createIdentifier('Promise'), [createAsyncFunctionExpression()]),
        )
      }

      expect(reports.length).toBe(50)
    })

    test('should handle alternating detect/non-detect calls', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      for (let i = 0; i < 20; i++) {
        if (i % 2 === 0) {
          visitor.NewExpression(
            createNewExpression(createIdentifier('Promise'), [createAsyncFunctionExpression()]),
          )
        } else {
          visitor.NewExpression(
            createNewExpression(createIdentifier('Promise'), [createSyncFunctionExpression()]),
          )
        }
      }

      expect(reports.length).toBe(10)
    })
  })

  describe('robustness - malformed inputs', () => {
    test('should handle node with type as number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      visitor.NewExpression({ type: 42 })

      expect(reports.length).toBe(0)
    })

    test('should handle node with type as boolean', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      visitor.NewExpression({ type: true })

      expect(reports.length).toBe(0)
    })

    test('should handle node with type as null', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      visitor.NewExpression({ type: null })

      expect(reports.length).toBe(0)
    })

    test('should handle node with arguments as object not array', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Promise'),
        arguments: { length: 1, 0: createAsyncFunctionExpression() },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with callee as function', () => {
      const { context } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: () => {},
        arguments: [createAsyncFunctionExpression()],
      }

      expect(() => visitor.NewExpression(node)).not.toThrow()
    })

    test('should handle node with circular arguments', () => {
      const { context } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const circular: Record<string, unknown> = {}
      circular.self = circular
      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Promise'),
        arguments: [circular],
      }

      expect(() => visitor.NewExpression(node)).not.toThrow()
    })

    test('should handle Date object as node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      visitor.NewExpression(new Date())

      expect(reports.length).toBe(0)
    })

    test('should handle RegExp as node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      visitor.NewExpression(/test/)

      expect(reports.length).toBe(0)
    })

    test('should handle Error object as node', () => {
      const { context } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      expect(() => visitor.NewExpression(new Error('test'))).not.toThrow()
    })

    test('should handle Map as node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      visitor.NewExpression(new Map())

      expect(reports.length).toBe(0)
    })

    test('should handle Set as node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      visitor.NewExpression(new Set())

      expect(reports.length).toBe(0)
    })

    test('should handle Promise.resolve-like node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Promise'),
        arguments: [{ type: 'CallExpression', callee: createIdentifier('resolve'), arguments: [] }],
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('exports', () => {
    test('should export the rule as named export', () => {
      expect(noAsyncPromiseExecutorRule).toBeDefined()
    })

    test('should export rule with meta property', () => {
      expect(noAsyncPromiseExecutorRule).toHaveProperty('meta')
    })

    test('should export rule with create property', () => {
      expect(noAsyncPromiseExecutorRule).toHaveProperty('create')
    })

    test('should export create as a function', () => {
      expect(typeof noAsyncPromiseExecutorRule.create).toBe('function')
    })

    test('should export meta as an object not null', () => {
      expect(noAsyncPromiseExecutorRule.meta).not.toBeNull()
    })

    test('should have exactly meta and create properties', () => {
      const keys = Object.keys(noAsyncPromiseExecutorRule)
      expect(keys).toContain('meta')
      expect(keys).toContain('create')
    })
  })

  describe('createMockContext helper', () => {
    test('should create context with default options', () => {
      const { context, reports } = createMockRuleContext()
      expect(context).toBeDefined()
      expect(reports).toBeDefined()
      expect(Array.isArray(reports)).toBe(true)
    })

    test('should create context with custom options', () => {
      const { context } = createMockRuleContext({ options: [{ customOption: true }] })
      expect(context.config.options).toEqual([{ customOption: true }])
    })

    test('should create context with default file path', () => {
      const { context } = createMockRuleContext()
      expect(context.getFilePath()).toBe('/src/file.ts')
    })

    test('should create context with custom file path', () => {
      const { context } = createMockRuleContext({ filePath: '/custom/file.ts' })
      expect(context.getFilePath()).toBe('/custom/file.ts')
    })

    test('should create context with default source', () => {
      const { context } = createMockRuleContext({ source: 'new Promise(async (resolve) => {});' })
      expect(context.getSource()).toBe('new Promise(async (resolve) => {});')
    })

    test('should create context with custom source', () => {
      const { context } = createMockRuleContext({ source: 'custom source' })
      expect(context.getSource()).toBe('custom source')
    })

    test('should have working report function', () => {
      const { context, reports } = createMockRuleContext()
      context.report({ message: 'test' })
      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('test')
    })

    test('should return empty tokens by default', () => {
      const { context } = createMockRuleContext()
      expect(context.getTokens()).toEqual([])
    })

    test('should return empty comments by default', () => {
      const { context } = createMockRuleContext()
      expect(context.getComments()).toEqual([])
    })

    test('should return null AST by default', () => {
      const { context } = createMockRuleContext()
      expect(context.getAST()).toBeNull()
    })

    test('should have workspace root set', () => {
      const { context } = createMockRuleContext()
      expect(context.workspaceRoot).toBe('/src')
    })
  })

  describe('helper function createNewExpression', () => {
    test('should create node with NewExpression type', () => {
      const node = createNewExpression(createIdentifier('Promise'), [])
      expect(node).toHaveProperty('type', 'NewExpression')
    })

    test('should create node with provided callee', () => {
      const callee = createIdentifier('Test')
      const node = createNewExpression(callee, [])
      expect((node as Record<string, unknown>).callee).toBe(callee)
    })

    test('should create node with provided arguments', () => {
      const args = [createAsyncFunctionExpression()]
      const node = createNewExpression(createIdentifier('Promise'), args)
      expect((node as Record<string, unknown>).arguments).toBe(args)
    })

    test('should create node with default location', () => {
      const node = createNewExpression(createIdentifier('Promise'), [])
      const loc = (node as Record<string, unknown>).loc as Record<string, unknown>
      const start = loc.start as Record<string, unknown>
      expect(start.line).toBe(1)
      expect(start.column).toBe(0)
    })

    test('should create node with custom location', () => {
      const node = createNewExpression(createIdentifier('Promise'), [], 10, 5)
      const loc = (node as Record<string, unknown>).loc as Record<string, unknown>
      const start = loc.start as Record<string, unknown>
      expect(start.line).toBe(10)
      expect(start.column).toBe(5)
    })
  })

  describe('helper function createIdentifier', () => {
    test('should create node with Identifier type', () => {
      const node = createIdentifier('test')
      expect(node).toHaveProperty('type', 'Identifier')
    })

    test('should create node with provided name', () => {
      const node = createIdentifier('Promise')
      expect((node as Record<string, unknown>).name).toBe('Promise')
    })

    test('should create node with empty string name', () => {
      const node = createIdentifier('')
      expect((node as Record<string, unknown>).name).toBe('')
    })
  })

  describe('helper function createAsyncFunctionExpression', () => {
    test('should create node with FunctionExpression type', () => {
      const node = createAsyncFunctionExpression()
      expect((node as Record<string, unknown>).type).toBe('FunctionExpression')
    })

    test('should create node with async true', () => {
      const node = createAsyncFunctionExpression()
      expect((node as Record<string, unknown>).async).toBe(true)
    })

    test('should create node with params', () => {
      const node = createAsyncFunctionExpression()
      const params = (node as Record<string, unknown>).params as unknown[]
      expect(params.length).toBe(2)
    })
  })

  describe('helper function createAsyncArrowFunction', () => {
    test('should create node with ArrowFunctionExpression type', () => {
      const node = createAsyncArrowFunction()
      expect((node as Record<string, unknown>).type).toBe('ArrowFunctionExpression')
    })

    test('should create node with async true', () => {
      const node = createAsyncArrowFunction()
      expect((node as Record<string, unknown>).async).toBe(true)
    })

    test('should create node with params', () => {
      const node = createAsyncArrowFunction()
      const params = (node as Record<string, unknown>).params as unknown[]
      expect(params.length).toBe(1)
    })
  })

  describe('helper function createSyncFunctionExpression', () => {
    test('should create node with FunctionExpression type', () => {
      const node = createSyncFunctionExpression()
      expect((node as Record<string, unknown>).type).toBe('FunctionExpression')
    })

    test('should create node with async false', () => {
      const node = createSyncFunctionExpression()
      expect((node as Record<string, unknown>).async).toBe(false)
    })
  })

  describe('helper function createSyncArrowFunction', () => {
    test('should create node with ArrowFunctionExpression type', () => {
      const node = createSyncArrowFunction()
      expect((node as Record<string, unknown>).type).toBe('ArrowFunctionExpression')
    })

    test('should create node with async false', () => {
      const node = createSyncArrowFunction()
      expect((node as Record<string, unknown>).async).toBe(false)
    })
  })
})
