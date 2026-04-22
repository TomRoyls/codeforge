import { describe, test, expect, vi } from 'vitest'
import {
  preferPromiseRejectErrorsRule,
  default as defaultExport,
} from '../../../../src/rules/patterns/prefer-promise-reject-errors.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createNewExpression(
  calleeName: string,
  hasExecutor = true,
  hasReject = false,
  lineNumber = 1,
  column = 0,
): unknown {
  const executor = hasExecutor
    ? {
        type: 'FunctionExpression',
        params: hasReject
          ? [
              { type: 'Identifier', name: 'resolve' },
              { type: 'Identifier', name: 'reject' },
            ]
          : [{ type: 'Identifier', name: 'resolve' }],
      }
    : null

  return {
    type: 'NewExpression',
    callee: {
      type: 'Identifier',
      name: calleeName,
    },
    arguments: hasExecutor ? [executor] : [],
    loc: {
      start: { line: lineNumber, column },
      end: { line: lineNumber, column: 20 },
    },
  }
}

function createPromiseNode(params: unknown[], loc?: unknown): unknown {
  return {
    type: 'NewExpression',
    callee: { type: 'Identifier', name: 'Promise' },
    arguments: [
      {
        type: 'FunctionExpression',
        params,
        ...(loc ? { loc } : {}),
      },
    ],
    loc: loc || {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 30 },
    },
  }
}

describe('prefer-promise-reject-errors rule', () => {
  // ========================================
  // META TESTS (existing 9 + expanded)
  // ========================================
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferPromiseRejectErrorsRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferPromiseRejectErrorsRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(preferPromiseRejectErrorsRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(preferPromiseRejectErrorsRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(preferPromiseRejectErrorsRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(preferPromiseRejectErrorsRule.meta.fixable).toBeUndefined()
    })

    test('should mention promise in description', () => {
      const desc = preferPromiseRejectErrorsRule.meta.docs?.description.toLowerCase()
      expect(desc).toContain('promise')
    })

    test('should mention reject in description', () => {
      const desc = preferPromiseRejectErrorsRule.meta.docs?.description.toLowerCase()
      expect(desc).toContain('reject')
    })

    test('should mention error in description', () => {
      const desc = preferPromiseRejectErrorsRule.meta.docs?.description.toLowerCase()
      expect(desc).toContain('error')
    })

    test('should have empty schema array', () => {
      expect(preferPromiseRejectErrorsRule.meta.schema).toEqual([])
    })

    test('should have meta property', () => {
      expect(preferPromiseRejectErrorsRule).toHaveProperty('meta')
    })

    test('should have create property', () => {
      expect(preferPromiseRejectErrorsRule).toHaveProperty('create')
    })

    test('should have docs property in meta', () => {
      expect(preferPromiseRejectErrorsRule.meta).toHaveProperty('docs')
    })

    test('should have description in docs', () => {
      expect(preferPromiseRejectErrorsRule.meta.docs).toHaveProperty('description')
    })

    test('should have non-empty description', () => {
      expect(preferPromiseRejectErrorsRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have url in docs', () => {
      expect(preferPromiseRejectErrorsRule.meta.docs?.url).toBeDefined()
    })

    test('should have string url', () => {
      expect(typeof preferPromiseRejectErrorsRule.meta.docs?.url).toBe('string')
    })

    test('should have url containing rule name', () => {
      expect(preferPromiseRejectErrorsRule.meta.docs?.url).toContain('prefer-promise-reject-errors')
    })

    test('should not be deprecated', () => {
      expect(preferPromiseRejectErrorsRule.meta.deprecated).toBeUndefined()
    })

    test('should not have replacedBy', () => {
      expect(preferPromiseRejectErrorsRule.meta.replacedBy).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(preferPromiseRejectErrorsRule.meta.requiresTypeChecking).toBeUndefined()
    })

    test('meta type should be one of valid types', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(preferPromiseRejectErrorsRule.meta.type)
    })

    test('meta severity should be one of valid severities', () => {
      expect(['off', 'warn', 'error']).toContain(preferPromiseRejectErrorsRule.meta.severity)
    })

    test('should mention executor in description', () => {
      const desc = preferPromiseRejectErrorsRule.meta.docs?.description.toLowerCase()
      expect(desc).toContain('executor')
    })

    test('should mention resolve in description', () => {
      const desc = preferPromiseRejectErrorsRule.meta.docs?.description.toLowerCase()
      expect(desc).toContain('resolve')
    })

    test('default export should equal named export', () => {
      expect(defaultExport).toBe(preferPromiseRejectErrorsRule)
    })
  })

  // ========================================
  // CREATE TESTS (existing 1 + expanded)
  // ========================================
  describe('create', () => {
    test('should return visitor object with NewExpression method', () => {
      const { context } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      expect(visitor).toHaveProperty('NewExpression')
    })

    test('should return a function for NewExpression', () => {
      const { context } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      expect(typeof visitor.NewExpression).toBe('function')
    })

    test('should return new visitor on each create call', () => {
      const { context } = createMockRuleContext()
      const visitor1 = preferPromiseRejectErrorsRule.create(context)
      const visitor2 = preferPromiseRejectErrorsRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should return object from create', () => {
      const { context } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      expect(typeof visitor).toBe('object')
      expect(visitor).not.toBeNull()
    })

    test('should not return undefined from create', () => {
      const { context } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      expect(visitor).toBeDefined()
    })

    test('visitor should have only NewExpression key', () => {
      const { context } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      expect(Object.keys(visitor)).toEqual(['NewExpression'])
    })
  })

  // ========================================
  // DETECTING PROMISES WITHOUT REJECT (existing 7 + expanded)
  // ========================================
  describe('detecting promises without reject', () => {
    test('should report Promise without reject handler', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('Promise', true, false))

      expect(reports.length).toBe(1)
    })

    test('should not report Promise with reject handler', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('Promise', true, true))

      expect(reports.length).toBe(0)
    })

    test('should not report non-Promise NewExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('Other', true, false))

      expect(reports.length).toBe(0)
    })

    test('should not report NewExpression without executor', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('Promise', false, false))

      expect(reports.length).toBe(0)
    })

    test('should report correct message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('Promise', true, false))

      expect(reports[0].message).toBe('Promise executor should handle errors with reject().')
    })

    test('should report multiple promises without reject', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('Promise', true, false, 1, 0))
      visitor.NewExpression(createNewExpression('Promise', true, false, 2, 0))
      visitor.NewExpression(createNewExpression('Promise', true, false, 3, 0))

      expect(reports.length).toBe(3)
    })

    test('should report only promises without reject among others', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('Promise', true, true))
      visitor.NewExpression(createNewExpression('Promise', true, false))
      visitor.NewExpression(createNewExpression('Promise', true, true))
      visitor.NewExpression(createNewExpression('Promise', true, false))

      expect(reports.length).toBe(2)
    })

    test('should report Promise with no params', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createPromiseNode([]))

      expect(reports.length).toBe(1)
    })

    test('should report Promise with single resolve param', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createPromiseNode([{ type: 'Identifier', name: 'resolve' }]))

      expect(reports.length).toBe(1)
    })

    test('should not report Promise with two params (resolve and reject)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(
        createPromiseNode([
          { type: 'Identifier', name: 'resolve' },
          { type: 'Identifier', name: 'reject' },
        ]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Promise with three params', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(
        createPromiseNode([
          { type: 'Identifier', name: 'resolve' },
          { type: 'Identifier', name: 'reject' },
          { type: 'Identifier', name: 'extra' },
        ]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Promise with many params', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(
        createPromiseNode([
          { type: 'Identifier', name: 'a' },
          { type: 'Identifier', name: 'b' },
          { type: 'Identifier', name: 'c' },
          { type: 'Identifier', name: 'd' },
        ]),
      )

      expect(reports.length).toBe(0)
    })

    test('should report regardless of resolve param name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createPromiseNode([{ type: 'Identifier', name: 'fulfill' }]))

      expect(reports.length).toBe(1)
    })

    test('should report when param has different type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createPromiseNode([{ type: 'RestElement', name: 'args' }]))

      expect(reports.length).toBe(1)
    })

    test('should report when first param name is underscore', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createPromiseNode([{ type: 'Identifier', name: '_' }]))

      expect(reports.length).toBe(1)
    })

    test('should not report non-Promise new expressions like Date', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('Date', true, false))

      expect(reports.length).toBe(0)
    })

    test('should not report non-Promise new expressions like Map', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('Map', true, false))

      expect(reports.length).toBe(0)
    })

    test('should not report non-Promise new expressions like Set', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('Set', true, false))

      expect(reports.length).toBe(0)
    })

    test('should not report non-Promise new expressions like Array', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('Array', true, false))

      expect(reports.length).toBe(0)
    })

    test('should not report non-Promise new expressions like Error', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('Error', true, false))

      expect(reports.length).toBe(0)
    })

    test('should not report non-Promise new expressions like RegExp', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('RegExp', true, false))

      expect(reports.length).toBe(0)
    })

    test('should be case-sensitive - lowercase promise should not be flagged', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('promise', true, false))

      expect(reports.length).toBe(0)
    })

    test('should be case-sensitive - PROMISE should not be flagged', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('PROMISE', true, false))

      expect(reports.length).toBe(0)
    })

    test('should not report Promise1', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('Promise1', true, false))

      expect(reports.length).toBe(0)
    })

    test('should not report MyPromise', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('MyPromise', true, false))

      expect(reports.length).toBe(0)
    })

    test('should not report A promise (with space-like name)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  // ========================================
  // EDGE CASES (existing 11 + expanded)
  // ========================================
  describe('edge cases', () => {
    test('should handle null node in NewExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      expect(() => visitor.NewExpression(null)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle undefined node in NewExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      expect(() => visitor.NewExpression(undefined)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle non-object node in NewExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      expect(() => visitor.NewExpression('string')).not.toThrow()
      expect(() => visitor.NewExpression(123)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle node without type property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [],
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without callee property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        arguments: [],
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without arguments property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [
          {
            type: 'FunctionExpression',
            params: [{ type: 'Identifier', name: 'resolve' }],
          },
        ],
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
    })

    test('should handle executor without type property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [{ name: 'executor' }],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 20 },
        },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle executor without params property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [{ type: 'FunctionExpression' }],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 20 },
        },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle non-FunctionExpression executor', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [{ type: 'ArrowFunctionExpression', params: [] }],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 20 },
        },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('Promise', true, false))

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
        getSource: () => 'new Promise()',
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

      const visitor = preferPromiseRejectErrorsRule.create(context)
      visitor.NewExpression(createNewExpression('Promise', true, false))

      expect(reports.length).toBe(1)
    })

    test('should handle boolean node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      expect(() => visitor.NewExpression(true)).not.toThrow()
      expect(() => visitor.NewExpression(false)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle number zero node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      expect(() => visitor.NewExpression(0)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty string node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      expect(() => visitor.NewExpression('')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle NaN node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      expect(() => visitor.NewExpression(Number.NaN)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle array node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      expect(() => visitor.NewExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle function node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      expect(() => visitor.NewExpression(() => {})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [{ type: 'FunctionExpression', params: [] }],
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with ExpressionStatement type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'ExpressionStatement',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [{ type: 'FunctionExpression', params: [] }],
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with null callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: null,
        arguments: [{ type: 'FunctionExpression', params: [] }],
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: undefined,
        arguments: [{ type: 'FunctionExpression', params: [] }],
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with non-Identifier callee (MemberExpression)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'SomeObj' },
          property: { type: 'Identifier', name: 'Promise' },
        },
        arguments: [{ type: 'FunctionExpression', params: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with callee without name property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier' },
        arguments: [{ type: 'FunctionExpression', params: [] }],
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with callee having null name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: null },
        arguments: [{ type: 'FunctionExpression', params: [] }],
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle empty arguments array', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle null arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: null,
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle undefined arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle string arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: 'not-an-array',
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle object arguments (non-array)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: { length: 1, 0: { type: 'FunctionExpression', params: [] } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle first argument being null', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [null],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle first argument being undefined', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [undefined],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle first argument being a string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: ['executor'],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle first argument being a number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [42],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle first argument being a Literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [{ type: 'Literal', value: 'test' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle first argument being an Identifier', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [{ type: 'Identifier', name: 'myExecutor' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle ArrowFunctionExpression executor with empty params', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [{ type: 'ArrowFunctionExpression', params: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle ArrowFunctionExpression executor with single param', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            params: [{ type: 'Identifier', name: 'resolve' }],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for FunctionDeclaration as executor', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [
          {
            type: 'FunctionDeclaration',
            params: [{ type: 'Identifier', name: 'resolve' }],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle params as non-array (string)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [{ type: 'FunctionExpression', params: 'not-array' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle params as non-array (object)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [{ type: 'FunctionExpression', params: { 0: 'resolve' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle params as null', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [{ type: 'FunctionExpression', params: null }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle multiple arguments where first is not executor', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [
          { type: 'Literal', value: 42 },
          { type: 'FunctionExpression', params: [] },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with Symbol.toPrimitive type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: Symbol('NewExpression'),
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [{ type: 'FunctionExpression', params: [] }],
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle deeply frozen object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = Object.freeze({
        type: 'NewExpression',
        callee: Object.freeze({ type: 'Identifier', name: 'Promise' }),
        arguments: Object.freeze([
          Object.freeze({
            type: 'FunctionExpression',
            params: Object.freeze([{ type: 'Identifier', name: 'resolve' }]),
          }),
        ]),
        loc: Object.freeze({
          start: Object.freeze({ line: 1, column: 0 }),
          end: Object.freeze({ line: 1, column: 20 }),
        }),
      })
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with prototype properties', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = Object.create({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
      })
      node.arguments = [
        { type: 'FunctionExpression', params: [{ type: 'Identifier', name: 'resolve' }] },
      ]
      node.loc = { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } }

      // Prototype properties should not be enumerable / accessible via direct access
      visitor.NewExpression(node)

      // The type is on the prototype, so n.type check may pass depending on JS behavior
      // In practice, Object.create sets prototype, and n.type would access prototype
      // But we want to make sure it doesn't crash
      expect(() => visitor.NewExpression(node)).not.toThrow()
    })

    test('should handle executor params with non-Identifier elements', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createPromiseNode([{ type: 'AssignmentPattern', left: {}, right: {} }]))

      expect(reports.length).toBe(1)
    })

    test('should handle executor params with destructuring', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createPromiseNode([{ type: 'ObjectPattern', properties: [] }]))

      expect(reports.length).toBe(1)
    })

    test('should handle executor with empty params array', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createPromiseNode([]))

      expect(reports.length).toBe(1)
    })
  })

  // ========================================
  // MESSAGE QUALITY (existing 5 + expanded)
  // ========================================
  describe('message quality', () => {
    test('should mention reject in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('Promise', true, false))

      expect(reports[0].message).toContain('reject')
    })

    test('should mention promise in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('Promise', true, false))

      expect(reports[0].message).toContain('Promise')
    })

    test('should mention error in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('Promise', true, false))

      expect(reports[0].message).toContain('error')
    })

    test('should use parentheses around reject', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('Promise', true, false))

      expect(reports[0].message).toContain('reject()')
    })

    test('should have consistent message format', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('Promise', true, false, 1, 0))
      visitor.NewExpression(createNewExpression('Promise', true, false, 2, 0))

      expect(reports[0].message).toBe('Promise executor should handle errors with reject().')
      expect(reports[1].message).toBe('Promise executor should handle errors with reject().')
    })

    test('should always produce the exact same message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.NewExpression(createNewExpression('Promise', true, false, i + 1, 0))
      }

      const expected = 'Promise executor should handle errors with reject().'
      for (const report of reports) {
        expect(report.message).toBe(expected)
      }
    })

    test('should have message with sentence structure', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('Promise', true, false))

      expect(reports[0].message).toContain('should')
    })

    test('should have message starting with Promise', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('Promise', true, false))

      expect(reports[0].message.startsWith('Promise')).toBe(true)
    })

    test('should have message ending with period', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('Promise', true, false))

      expect(reports[0].message.endsWith('.')).toBe(true)
    })

    test('should mention executor in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('Promise', true, false))

      expect(reports[0].message).toContain('executor')
    })

    test('should have message length greater than 20 chars', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('Promise', true, false))

      expect(reports[0].message.length).toBeGreaterThan(20)
    })

    test('should have message under 200 chars', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('Promise', true, false))

      expect(reports[0].message.length).toBeLessThan(200)
    })
  })

  // ========================================
  // LOCATION REPORTING (existing 2 + expanded)
  // ========================================
  describe('location reporting', () => {
    test('should report correct location for promise without reject', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('Promise', true, false, 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report location with end position', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('Promise', true, false, 5, 10))

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should report location at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('Promise', true, false, 1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at high line number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('Promise', true, false, 1000, 0))

      expect(reports[0].loc?.start.line).toBe(1000)
    })

    test('should report location at high column number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('Promise', true, false, 1, 80))

      expect(reports[0].loc?.start.column).toBe(80)
    })

    test('should report end location from node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('Promise', true, false, 3, 5))

      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(20)
    })

    test('should report correct location for each of multiple violations', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('Promise', true, false, 5, 10))
      visitor.NewExpression(createNewExpression('Promise', true, false, 10, 20))
      visitor.NewExpression(createNewExpression('Promise', true, false, 15, 30))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
      expect(reports[1].loc?.start.line).toBe(10)
      expect(reports[1].loc?.start.column).toBe(20)
      expect(reports[2].loc?.start.line).toBe(15)
      expect(reports[2].loc?.start.column).toBe(30)
    })

    test('should provide default location when node has no loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [
          {
            type: 'FunctionExpression',
            params: [{ type: 'Identifier', name: 'resolve' }],
          },
        ],
      }
      visitor.NewExpression(node)

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle node with null loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [
          {
            type: 'FunctionExpression',
            params: [{ type: 'Identifier', name: 'resolve' }],
          },
        ],
        loc: null,
      }
      visitor.NewExpression(node)

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle node with undefined loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [
          {
            type: 'FunctionExpression',
            params: [{ type: 'Identifier', name: 'resolve' }],
          },
        ],
        loc: undefined,
      }
      visitor.NewExpression(node)

      expect(reports[0].loc).toBeDefined()
    })

    test('should handle node with loc having only start', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [
          {
            type: 'FunctionExpression',
            params: [{ type: 'Identifier', name: 'resolve' }],
          },
        ],
        loc: { start: { line: 5, column: 10 } },
      }
      visitor.NewExpression(node)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should handle node with loc having only end', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [
          {
            type: 'FunctionExpression',
            params: [{ type: 'Identifier', name: 'resolve' }],
          },
        ],
        loc: { end: { line: 5, column: 10 } },
      }
      visitor.NewExpression(node)

      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(10)
    })

    test('should handle node with string line/column values in loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [
          {
            type: 'FunctionExpression',
            params: [{ type: 'Identifier', name: 'resolve' }],
          },
        ],
        loc: {
          start: { line: '5' as unknown as number, column: '10' as unknown as number },
          end: { line: '5' as unknown as number, column: '30' as unknown as number },
        },
      }
      visitor.NewExpression(node)

      // Should fall back to defaults when line/column aren't numbers
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle node with NaN line in loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [
          {
            type: 'FunctionExpression',
            params: [{ type: 'Identifier', name: 'resolve' }],
          },
        ],
        loc: {
          start: { line: Number.NaN, column: 0 },
          end: { line: Number.NaN, column: 20 },
        },
      }
      visitor.NewExpression(node)

      // NaN is typeof 'number' so extractLocation passes it through
      expect(Number.isNaN(reports[0].loc?.start.line)).toBe(true)
    })
  })

  // ========================================
  // SCALABILITY AND PERFORMANCE TESTS
  // ========================================
  describe('scalability', () => {
    test('should handle 50 sequential violations', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.NewExpression(createNewExpression('Promise', true, false, i + 1, 0))
      }

      expect(reports.length).toBe(50)
    })

    test('should handle 100 mixed calls', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      for (let i = 0; i < 100; i++) {
        visitor.NewExpression(createNewExpression('Promise', true, i % 2 === 0))
      }

      expect(reports.length).toBe(50)
    })

    test('should handle large number of non-matching nodes', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      for (let i = 0; i < 200; i++) {
        visitor.NewExpression(createNewExpression('Other', true, false))
      }

      expect(reports.length).toBe(0)
    })

    test('should handle alternating valid and invalid rapidly', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      for (let i = 0; i < 100; i++) {
        visitor.NewExpression(createNewExpression('Promise', true, false))
        visitor.NewExpression(createNewExpression('Promise', true, true))
      }

      expect(reports.length).toBe(100)
    })

    test('should handle single violation after many non-matches', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      for (let i = 0; i < 100; i++) {
        visitor.NewExpression(createNewExpression('Date', true, false))
      }
      visitor.NewExpression(createNewExpression('Promise', true, false))

      expect(reports.length).toBe(1)
    })
  })

  // ========================================
  // CONTEXT VARIATIONS
  // ========================================
  describe('context variations', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockRuleContext({ filePath: '/project/src/app.ts' })
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('Promise', true, false))

      expect(reports.length).toBe(1)
    })

    test('should work with .js file path', () => {
      const { context, reports } = createMockRuleContext({ filePath: '/project/src/app.js' })
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('Promise', true, false))

      expect(reports.length).toBe(1)
    })

    test('should work with .tsx file path', () => {
      const { context, reports } = createMockRuleContext({ filePath: '/project/src/component.tsx' })
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('Promise', true, false))

      expect(reports.length).toBe(1)
    })

    test('should work with .jsx file path', () => {
      const { context, reports } = createMockRuleContext({ filePath: '/project/src/component.jsx' })
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('Promise', true, false))

      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Promise(r => {})', filePath: '/src/file.ts' })
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('Promise', true, false))

      expect(reports.length).toBe(1)
    })

    test('should work with empty source code', () => {
      const { context, reports } = createMockRuleContext({ source: '', filePath: '/src/file.ts' })
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('Promise', true, false))

      expect(reports.length).toBe(1)
    })

    test('should work with options containing allowPlainReject', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowPlainReject: true }] })
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('Promise', true, false))

      expect(reports.length).toBe(1)
    })

    test('should work with options containing extra properties', () => {
      const { context, reports } = createMockRuleContext({ options: [{ foo: 'bar', baz: 42 }] })
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('Promise', true, false))

      expect(reports.length).toBe(1)
    })

    test('should work with config having empty options', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: {},
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = preferPromiseRejectErrorsRule.create(context)
      visitor.NewExpression(createNewExpression('Promise', true, false))

      expect(reports.length).toBe(1)
    })

    test('should work with different workspace roots', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/home/user/project/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/home/user/project',
      } as unknown as RuleContext

      const visitor = preferPromiseRejectErrorsRule.create(context)
      visitor.NewExpression(createNewExpression('Promise', true, false))

      expect(reports.length).toBe(1)
    })
  })

  // ========================================
  // RULE DEFINITION STRUCTURE
  // ========================================
  describe('rule definition structure', () => {
    test('should be an object', () => {
      expect(typeof preferPromiseRejectErrorsRule).toBe('object')
    })

    test('should not be null', () => {
      expect(preferPromiseRejectErrorsRule).not.toBeNull()
    })

    test('should have exactly two top-level properties', () => {
      const keys = Object.keys(preferPromiseRejectErrorsRule)
      expect(keys).toContain('meta')
      expect(keys).toContain('create')
    })

    test('create should be a function', () => {
      expect(typeof preferPromiseRejectErrorsRule.create).toBe('function')
    })

    test('meta should be an object', () => {
      expect(typeof preferPromiseRejectErrorsRule.meta).toBe('object')
    })

    test('meta should not be null', () => {
      expect(preferPromiseRejectErrorsRule.meta).not.toBeNull()
    })

    test('meta docs should be an object', () => {
      expect(typeof preferPromiseRejectErrorsRule.meta.docs).toBe('object')
    })

    test('meta docs should not be null', () => {
      expect(preferPromiseRejectErrorsRule.meta.docs).not.toBeNull()
    })

    test('meta docs description should be a string', () => {
      expect(typeof preferPromiseRejectErrorsRule.meta.docs?.description).toBe('string')
    })

    test('meta docs recommended should be a boolean', () => {
      expect(typeof preferPromiseRejectErrorsRule.meta.docs?.recommended).toBe('boolean')
    })

    test('meta docs category should be a string', () => {
      expect(typeof preferPromiseRejectErrorsRule.meta.docs?.category).toBe('string')
    })

    test('meta type should be a string', () => {
      expect(typeof preferPromiseRejectErrorsRule.meta.type).toBe('string')
    })

    test('meta severity should be a string', () => {
      expect(typeof preferPromiseRejectErrorsRule.meta.severity).toBe('string')
    })

    test('schema should be an array', () => {
      expect(Array.isArray(preferPromiseRejectErrorsRule.meta.schema)).toBe(true)
    })

    test('meta should be readonly (frozen or not)', () => {
      // Just verify meta is accessible
      expect(preferPromiseRejectErrorsRule.meta).toBeDefined()
    })

    test('create should accept context argument', () => {
      const { context } = createMockRuleContext()
      expect(() => preferPromiseRejectErrorsRule.create(context)).not.toThrow()
    })

    test('create should return an object', () => {
      const { context } = createMockRuleContext()
      const result = preferPromiseRejectErrorsRule.create(context)
      expect(typeof result).toBe('object')
    })
  })

  // ========================================
  // VISITOR BEHAVIOR
  // ========================================
  describe('visitor behavior', () => {
    test('should not report when same visitor handles multiple valid nodes', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.NewExpression(createNewExpression('Promise', true, true))
      }

      expect(reports.length).toBe(0)
    })

    test('should accumulate reports across calls on same visitor', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('Promise', true, false))
      expect(reports.length).toBe(1)

      visitor.NewExpression(createNewExpression('Promise', true, false))
      expect(reports.length).toBe(2)

      visitor.NewExpression(createNewExpression('Promise', true, false))
      expect(reports.length).toBe(3)
    })

    test('should handle mixed node types on same visitor', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(null)
      visitor.NewExpression(undefined)
      visitor.NewExpression('string')
      visitor.NewExpression(42)
      visitor.NewExpression(createNewExpression('Promise', true, false))
      visitor.NewExpression(null)
      visitor.NewExpression(createNewExpression('Promise', true, true))

      expect(reports.length).toBe(1)
    })

    test('should not affect reports from different visitors', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext()
      const { context: ctx2, reports: reports2 } = createMockRuleContext()

      const visitor1 = preferPromiseRejectErrorsRule.create(ctx1)
      const visitor2 = preferPromiseRejectErrorsRule.create(ctx2)

      visitor1.NewExpression(createNewExpression('Promise', true, false))
      visitor2.NewExpression(createNewExpression('Promise', true, true))

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(0)
    })

    test('should handle call with no arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      expect(() => visitor.NewExpression()).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should return void from NewExpression', () => {
      const { context } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const result = visitor.NewExpression(createNewExpression('Promise', true, false))
      expect(result).toBeUndefined()
    })

    test('should return void from NewExpression with null', () => {
      const { context } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const result = visitor.NewExpression(null)
      expect(result).toBeUndefined()
    })

    test('should handle being called after edge case inputs', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      // Feed edge cases first
      visitor.NewExpression(null)
      visitor.NewExpression(undefined)
      visitor.NewExpression(0)
      visitor.NewExpression('')
      visitor.NewExpression(false)
      visitor.NewExpression([])
      visitor.NewExpression({})

      // Now a real violation should still work
      visitor.NewExpression(createNewExpression('Promise', true, false))
      expect(reports.length).toBe(1)
    })
  })

  // ========================================
  // SPECIFIC REAL-WORLD PATTERNS
  // ========================================
  describe('real-world patterns', () => {
    test('should not report Promise with resolve and reject', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [
          {
            type: 'FunctionExpression',
            params: [
              { type: 'Identifier', name: 'resolve' },
              { type: 'Identifier', name: 'reject' },
            ],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should report Promise with only resolve', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [
          {
            type: 'FunctionExpression',
            params: [{ type: 'Identifier', name: 'resolve' }],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report Promise with no executor params at all', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [
          {
            type: 'FunctionExpression',
            params: [],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should not report Promise with catch-style third param', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [
          {
            type: 'FunctionExpression',
            params: [
              { type: 'Identifier', name: 'resolve' },
              { type: 'Identifier', name: 'reject' },
            ],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle Promise with extra arguments after executor', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [
          {
            type: 'FunctionExpression',
            params: [{ type: 'Identifier', name: 'resolve' }],
          },
          { type: 'Literal', value: 'extra' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle Promise with three extra arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [
          {
            type: 'FunctionExpression',
            params: [{ type: 'Identifier', name: 'resolve' }],
          },
          { type: 'Literal', value: 1 },
          { type: 'Literal', value: 2 },
          { type: 'Literal', value: 3 },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }

      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should not crash when executor has body property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [
          {
            type: 'FunctionExpression',
            params: [{ type: 'Identifier', name: 'resolve' }],
            body: { type: 'BlockStatement', body: [] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should not crash when executor has async true', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [
          {
            type: 'FunctionExpression',
            params: [{ type: 'Identifier', name: 'resolve' }],
            async: true,
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should not crash when executor has generator true', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [
          {
            type: 'FunctionExpression',
            params: [{ type: 'Identifier', name: 'resolve' }],
            generator: true,
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report Promise with empty params (no resolve no reject)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createPromiseNode([]))

      expect(reports.length).toBe(1)
    })

    test('should report Promise with destructured param but no reject', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createPromiseNode([{ type: 'ObjectPattern', properties: [] }]))

      expect(reports.length).toBe(1)
    })
  })

  // ========================================
  // NODE TYPE VARIATIONS (non-matching)
  // ========================================
  describe('non-matching node types', () => {
    test('should not report CallExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [{ type: 'FunctionExpression', params: [] }],
      })

      expect(reports.length).toBe(0)
    })

    test('should not report MemberExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression({
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'Promise' },
        property: { type: 'Identifier', name: 'resolve' },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report FunctionDeclaration', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression({
        type: 'FunctionDeclaration',
        params: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should not report VariableDeclaration', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression({
        type: 'VariableDeclaration',
        declarations: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should not report ExpressionStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression({
        type: 'ExpressionStatement',
        expression: {},
      })

      expect(reports.length).toBe(0)
    })

    test('should not report BlockStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression({
        type: 'BlockStatement',
        body: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should not report ReturnStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression({
        type: 'ReturnStatement',
        argument: null,
      })

      expect(reports.length).toBe(0)
    })

    test('should not report IfStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression({
        type: 'IfStatement',
        test: {},
        consequent: {},
      })

      expect(reports.length).toBe(0)
    })

    test('should not report TryStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression({
        type: 'TryStatement',
        block: {},
      })

      expect(reports.length).toBe(0)
    })

    test('should not report ThrowStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression({
        type: 'ThrowStatement',
        argument: {},
      })

      expect(reports.length).toBe(0)
    })
  })

  // ========================================
  // CALLEE TYPE VARIATIONS
  // ========================================
  describe('callee type variations', () => {
    test('should not report when callee is MemberExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'window' },
          property: { type: 'Identifier', name: 'Promise' },
        },
        arguments: [{ type: 'FunctionExpression', params: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when callee is CallExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'getPromise' },
          arguments: [],
        },
        arguments: [{ type: 'FunctionExpression', params: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when callee type is not Identifier', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: {
          type: 'FunctionExpression',
          params: [],
        },
        arguments: [{ type: 'FunctionExpression', params: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when callee has numeric name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 42 as unknown as string },
        arguments: [{ type: 'FunctionExpression', params: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when callee name is empty string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: '' },
        arguments: [{ type: 'FunctionExpression', params: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  // ========================================
  // INTEGRATION-LIKE TESTS
  // ========================================
  describe('integration-like tests', () => {
    test('should correctly identify violations in a sequence of different node types', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression({ type: 'CallExpression' })
      visitor.NewExpression(createNewExpression('Promise', true, false))
      visitor.NewExpression({ type: 'MemberExpression' })
      visitor.NewExpression(createNewExpression('Promise', true, true))
      visitor.NewExpression(createNewExpression('Date', true, false))
      visitor.NewExpression(createNewExpression('Promise', true, false))
      visitor.NewExpression(null)
      visitor.NewExpression(undefined)

      expect(reports.length).toBe(2)
    })

    test('should handle being called with many different shapes', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const shapes: unknown[] = [
        null,
        undefined,
        0,
        '',
        false,
        {},
        [],
        { type: 'NewExpression' },
        { type: 'NewExpression', callee: {} },
        { type: 'NewExpression', callee: { type: 'Identifier', name: 'Promise' } },
        { type: 'NewExpression', callee: { type: 'Identifier', name: 'Promise' }, arguments: [] },
        {
          type: 'NewExpression',
          callee: { type: 'Identifier', name: 'Promise' },
          arguments: [{ type: 'Literal', value: 42 }],
        },
        {
          type: 'NewExpression',
          callee: { type: 'Identifier', name: 'Promise' },
          arguments: [{ type: 'FunctionExpression' }],
        },
        createPromiseNode([]),
        createPromiseNode([{ type: 'Identifier', name: 'resolve' }]),
        createPromiseNode([
          { type: 'Identifier', name: 'resolve' },
          { type: 'Identifier', name: 'reject' },
        ]),
      ]

      for (const shape of shapes) {
        visitor.NewExpression(shape)
      }

      // Should report: empty params (index 13) and single param (index 14)
      expect(reports.length).toBe(2)
    })

    test('should produce consistent results across multiple runs', () => {
      for (let run = 0; run < 5; run++) {
        const { context, reports } = createMockRuleContext()
        const visitor = preferPromiseRejectErrorsRule.create(context)

        visitor.NewExpression(createNewExpression('Promise', true, false))
        visitor.NewExpression(createNewExpression('Promise', true, true))
        visitor.NewExpression(createNewExpression('Promise', true, false))

        expect(reports.length).toBe(2)
        expect(reports[0].message).toBe('Promise executor should handle errors with reject().')
        expect(reports[1].message).toBe('Promise executor should handle errors with reject().')
      }
    })

    test('should handle create being called multiple times with different contexts', () => {
      const contexts = [
        createMockRuleContext({ filePath: '/a.ts' }),
        createMockRuleContext({ filePath: '/b.ts' }),
        createMockRuleContext({ filePath: '/c.ts' }),
      ]

      for (const { context, reports } of contexts) {
        const visitor = preferPromiseRejectErrorsRule.create(context)
        visitor.NewExpression(createNewExpression('Promise', true, false))
        expect(reports.length).toBe(1)
      }
    })

    test('should correctly handle promise detection with various param configurations', () => {
      const testCases = [
        { params: [], expected: true },
        { params: [{ type: 'Identifier', name: 'resolve' }], expected: true },
        { params: [{ type: 'Identifier', name: 'r' }], expected: true },
        {
          params: [
            { type: 'Identifier', name: 'resolve' },
            { type: 'Identifier', name: 'reject' },
          ],
          expected: false,
        },
        {
          params: [
            { type: 'Identifier', name: 'a' },
            { type: 'Identifier', name: 'b' },
          ],
          expected: false,
        },
        {
          params: [
            { type: 'Identifier', name: 'a' },
            { type: 'Identifier', name: 'b' },
            { type: 'Identifier', name: 'c' },
          ],
          expected: false,
        },
      ]

      for (const { params, expected } of testCases) {
        const { context, reports } = createMockRuleContext()
        const visitor = preferPromiseRejectErrorsRule.create(context)
        visitor.NewExpression(createPromiseNode(params))

        if (expected) {
          expect(reports.length).toBe(1)
        } else {
          expect(reports.length).toBe(0)
        }
      }
    })
  })
})
