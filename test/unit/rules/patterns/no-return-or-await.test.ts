import { describe, test, expect, vi } from 'vitest'
import { noReturnOrAwaitRule } from '../../../../src/rules/patterns/no-return-or-await.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'const x = 1;',
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

function createFunctionDeclaration(
  type: 'FunctionDeclaration' | 'FunctionExpression' | 'ArrowFunctionExpression',
  async: boolean,
  body: unknown,
  lineNumber = 1,
  column = 0,
): unknown {
  return {
    type: type,
    async: async,
    body: body,
    loc: {
      start: { line: lineNumber, column },
      end: { line: lineNumber, column: column + 20 },
    },
  }
}

function createBlockStatement(body: unknown[] = []): unknown {
  return {
    type: 'BlockStatement',
    body: body,
  }
}

describe('no-return-or-await rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noReturnOrAwaitRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noReturnOrAwaitRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noReturnOrAwaitRule.meta.docs?.recommended).toBe(true)
    })

    test('should have performance category', () => {
      expect(noReturnOrAwaitRule.meta.docs?.category).toBe('performance')
    })

    test('should have schema defined', () => {
      expect(noReturnOrAwaitRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noReturnOrAwaitRule.meta.fixable).toBeUndefined()
    })

    test('should mention async in description', () => {
      expect(noReturnOrAwaitRule.meta.docs?.description.toLowerCase()).toContain('async')
    })

    test('should mention await or return in description', () => {
      const desc = noReturnOrAwaitRule.meta.docs?.description.toLowerCase()
      expect(desc).toMatch(/await|return/)
    })

    test('should have empty schema array', () => {
      expect(noReturnOrAwaitRule.meta.schema).toEqual([])
    })

    test('should have a meta property', () => {
      expect(noReturnOrAwaitRule.meta).toBeDefined()
    })

    test('should have docs property defined', () => {
      expect(noReturnOrAwaitRule.meta.docs).toBeDefined()
    })

    test('should have docs.description as a string', () => {
      expect(typeof noReturnOrAwaitRule.meta.docs?.description).toBe('string')
    })

    test('should have non-empty docs.description', () => {
      expect(noReturnOrAwaitRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have docs.description longer than 10 characters', () => {
      expect(noReturnOrAwaitRule.meta.docs!.description.length).toBeGreaterThan(10)
    })

    test('should have docs.url defined', () => {
      expect(noReturnOrAwaitRule.meta.docs?.url).toBeDefined()
    })

    test('should have docs.url as a string', () => {
      expect(typeof noReturnOrAwaitRule.meta.docs?.url).toBe('string')
    })

    test('should have docs.url starting with https', () => {
      expect(noReturnOrAwaitRule.meta.docs?.url).toMatch(/^https/)
    })

    test('should have docs.recommended as boolean', () => {
      expect(typeof noReturnOrAwaitRule.meta.docs?.recommended).toBe('boolean')
    })

    test('should have docs.category as string', () => {
      expect(typeof noReturnOrAwaitRule.meta.docs?.category).toBe('string')
    })

    test('should have deprecated as undefined', () => {
      expect(noReturnOrAwaitRule.meta.deprecated).toBeUndefined()
    })

    test('should have requiresTypeChecking as undefined', () => {
      expect(noReturnOrAwaitRule.meta.requiresTypeChecking).toBeUndefined()
    })

    test('should have replacedBy as undefined', () => {
      expect(noReturnOrAwaitRule.meta.replacedBy).toBeUndefined()
    })

    test('should have type as one of valid rule types', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(noReturnOrAwaitRule.meta.type)
    })

    test('should have severity as one of valid severities', () => {
      expect(['off', 'warn', 'error']).toContain(noReturnOrAwaitRule.meta.severity)
    })
  })

  describe('create', () => {
    test('should return visitor object with FunctionDeclaration method', () => {
      const { context } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      expect(visitor).toHaveProperty('FunctionDeclaration')
    })

    test('should return visitor object with FunctionExpression method', () => {
      const { context } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      expect(visitor).toHaveProperty('FunctionExpression')
    })

    test('should return visitor object with ArrowFunctionExpression method', () => {
      const { context } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      expect(visitor).toHaveProperty('ArrowFunctionExpression')
    })

    test('should return an object from create', () => {
      const { context } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      expect(typeof visitor).toBe('object')
      expect(visitor).not.toBeNull()
    })

    test('should return visitor with exactly 3 keys', () => {
      const { context } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      expect(Object.keys(visitor).length).toBe(3)
    })

    test('should have FunctionDeclaration as a function', () => {
      const { context } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      expect(typeof visitor.FunctionDeclaration).toBe('function')
    })

    test('should have FunctionExpression as a function', () => {
      const { context } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      expect(typeof visitor.FunctionExpression).toBe('function')
    })

    test('should have ArrowFunctionExpression as a function', () => {
      const { context } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      expect(typeof visitor.ArrowFunctionExpression).toBe('function')
    })

    test('should not throw when creating visitor with valid context', () => {
      const { context } = createMockContext()

      expect(() => noReturnOrAwaitRule.create(context)).not.toThrow()
    })

    test('should return independent visitors on multiple create calls', () => {
      const { context } = createMockContext()
      const visitor1 = noReturnOrAwaitRule.create(context)
      const visitor2 = noReturnOrAwaitRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should have create as a function on the rule', () => {
      expect(typeof noReturnOrAwaitRule.create).toBe('function')
    })

    test('should have meta and create as rule properties', () => {
      expect(noReturnOrAwaitRule).toHaveProperty('meta')
      expect(noReturnOrAwaitRule).toHaveProperty('create')
    })

    test('should allow calling same visitor method multiple times', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = { type: 'FunctionDeclaration', async: true, body: null }
      visitor.FunctionDeclaration(node)
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(2)
    })
  })

  describe('detecting async functions', () => {
    test('should not report non-async function declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const body = createBlockStatement([])
      visitor.FunctionDeclaration(createFunctionDeclaration('FunctionDeclaration', false, body))

      expect(reports.length).toBe(0)
    })

    test('should not report non-async function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const body = createBlockStatement([])
      visitor.FunctionExpression(createFunctionDeclaration('FunctionExpression', false, body))

      expect(reports.length).toBe(0)
    })

    test('should not report non-async arrow function', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const body = createBlockStatement([])
      visitor.ArrowFunctionExpression(
        createFunctionDeclaration('ArrowFunctionExpression', false, body),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report async function with BlockStatement body', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const body = createBlockStatement([])
      visitor.FunctionDeclaration(createFunctionDeclaration('FunctionDeclaration', true, body))

      expect(reports.length).toBe(0)
    })

    test('should report async function without BlockStatement body', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const body = {
        type: 'ExpressionStatement',
        expression: {
          type: 'Literal',
          value: 'test',
        },
      }
      visitor.FunctionDeclaration(createFunctionDeclaration('FunctionDeclaration', true, body))

      expect(reports.length).toBe(0)
    })

    test('should report async function with null body', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        async: true,
        body: null,
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Async function has no await or return.')
    })

    test('should report multiple violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node1 = {
        type: 'FunctionDeclaration',
        async: true,
        body: null,
      }
      const node2 = {
        type: 'FunctionExpression',
        async: true,
        body: null,
      }
      const node3 = {
        type: 'ArrowFunctionExpression',
        async: true,
        body: null,
      }
      visitor.FunctionDeclaration(node1)
      visitor.FunctionExpression(node2)
      visitor.ArrowFunctionExpression(node3)

      expect(reports.length).toBe(3)
    })
  })

  describe('non-async functions', () => {
    test('should not report non-async FunctionDeclaration with return in body', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const body = createBlockStatement([
        { type: 'ReturnStatement', argument: { type: 'Literal', value: 42 } },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration('FunctionDeclaration', false, body))

      expect(reports.length).toBe(0)
    })

    test('should not report non-async FunctionExpression with await in body', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const body = createBlockStatement([
        {
          type: 'ExpressionStatement',
          expression: { type: 'AwaitExpression', argument: { type: 'Identifier', name: 'p' } },
        },
      ])
      visitor.FunctionExpression(createFunctionDeclaration('FunctionExpression', false, body))

      expect(reports.length).toBe(0)
    })

    test('should not report non-async ArrowFunctionExpression with complex body', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const body = createBlockStatement([
        { type: 'VariableDeclaration', declarations: [], kind: 'const' },
        {
          type: 'ExpressionStatement',
          expression: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' } },
        },
      ])
      visitor.ArrowFunctionExpression(
        createFunctionDeclaration('ArrowFunctionExpression', false, body),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report when async is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        async: undefined,
        body: null,
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when async is false', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        async: false,
        body: null,
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when async is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        async: null,
        body: null,
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when async is 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        async: 0,
        body: null,
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when async is empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        async: '',
        body: null,
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report non-async FunctionDeclaration with null body', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        async: false,
        body: null,
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report non-async FunctionExpression with null body', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'FunctionExpression',
        async: false,
        body: null,
      }
      visitor.FunctionExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report non-async ArrowFunctionExpression with null body', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'ArrowFunctionExpression',
        async: false,
        body: null,
      }
      visitor.ArrowFunctionExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report non-async FunctionDeclaration with complex nested body', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const body = createBlockStatement([
        {
          type: 'IfStatement',
          test: { type: 'Literal', value: true },
          consequent: {
            type: 'BlockStatement',
            body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 1 } }],
          },
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration('FunctionDeclaration', false, body))

      expect(reports.length).toBe(0)
    })

    test('should not report when async is string "true"', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        async: 'true',
        body: null,
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when async is 1', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        async: 1,
        body: null,
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('async functions - no report cases', () => {
    test('should not report async function with expression body - Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const body = { type: 'Literal', value: 42 }
      visitor.ArrowFunctionExpression(
        createFunctionDeclaration('ArrowFunctionExpression', true, body),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report async function with expression body - CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const body = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [],
      }
      visitor.ArrowFunctionExpression(
        createFunctionDeclaration('ArrowFunctionExpression', true, body),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report async function with expression body - BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const body = {
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Literal', value: 1 },
        right: { type: 'Literal', value: 2 },
      }
      visitor.ArrowFunctionExpression(
        createFunctionDeclaration('ArrowFunctionExpression', true, body),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report async function with expression body - Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const body = { type: 'Identifier', name: 'value' }
      visitor.ArrowFunctionExpression(
        createFunctionDeclaration('ArrowFunctionExpression', true, body),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report async function with expression body - TemplateLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const body = {
        type: 'TemplateLiteral',
        quasis: [{ type: 'TemplateElement', value: { raw: 'hello' } }],
        expressions: [],
      }
      visitor.ArrowFunctionExpression(
        createFunctionDeclaration('ArrowFunctionExpression', true, body),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report async function with expression body - ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const body = {
        type: 'ObjectExpression',
        properties: [],
      }
      visitor.ArrowFunctionExpression(
        createFunctionDeclaration('ArrowFunctionExpression', true, body),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report async function with expression body - ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const body = {
        type: 'ArrayExpression',
        elements: [],
      }
      visitor.ArrowFunctionExpression(
        createFunctionDeclaration('ArrowFunctionExpression', true, body),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report async function with expression body - MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const body = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'prop' },
      }
      visitor.ArrowFunctionExpression(
        createFunctionDeclaration('ArrowFunctionExpression', true, body),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report async function with expression body - ConditionalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const body = {
        type: 'ConditionalExpression',
        test: { type: 'Literal', value: true },
        consequent: { type: 'Literal', value: 1 },
        alternate: { type: 'Literal', value: 2 },
      }
      visitor.ArrowFunctionExpression(
        createFunctionDeclaration('ArrowFunctionExpression', true, body),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report async function with BlockStatement containing only VariableDeclarations', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const body = createBlockStatement([
        {
          type: 'VariableDeclaration',
          declarations: [
            {
              type: 'VariableDeclarator',
              id: { type: 'Identifier', name: 'x' },
              init: { type: 'Literal', value: 1 },
            },
          ],
          kind: 'const',
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration('FunctionDeclaration', true, body))

      expect(reports.length).toBe(0)
    })

    test('should not report async function with BlockStatement containing ExpressionStatements', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const body = createBlockStatement([
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'console' },
            arguments: [],
          },
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration('FunctionDeclaration', true, body))

      expect(reports.length).toBe(0)
    })

    test('should not report async function with BlockStatement containing IfStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const body = createBlockStatement([
        {
          type: 'IfStatement',
          test: { type: 'Literal', value: true },
          consequent: {
            type: 'ExpressionStatement',
            expression: { type: 'Literal', value: 1 },
          },
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration('FunctionDeclaration', true, body))

      expect(reports.length).toBe(0)
    })

    test('should not report async function with BlockStatement containing ForStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const body = createBlockStatement([
        {
          type: 'ForStatement',
          init: { type: 'Literal', value: 0 },
          test: { type: 'Literal', value: true },
          update: null,
          body: { type: 'BlockStatement', body: [] },
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration('FunctionDeclaration', true, body))

      expect(reports.length).toBe(0)
    })

    test('should not report async function with BlockStatement containing WhileStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const body = createBlockStatement([
        {
          type: 'WhileStatement',
          test: { type: 'Literal', value: true },
          body: { type: 'BlockStatement', body: [] },
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration('FunctionDeclaration', true, body))

      expect(reports.length).toBe(0)
    })

    test('should not report async function with BlockStatement containing TryStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const body = createBlockStatement([
        {
          type: 'TryStatement',
          block: { type: 'BlockStatement', body: [] },
          handler: null,
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration('FunctionDeclaration', true, body))

      expect(reports.length).toBe(0)
    })

    test('should not report async function with BlockStatement containing nested FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const body = createBlockStatement([
        {
          type: 'FunctionDeclaration',
          id: { type: 'Identifier', name: 'inner' },
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration('FunctionDeclaration', true, body))

      expect(reports.length).toBe(0)
    })

    test('should not report async function with empty object body', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const body = {}
      visitor.ArrowFunctionExpression(
        createFunctionDeclaration('ArrowFunctionExpression', true, body),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report async function with array body', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const body: unknown[] = []
      visitor.ArrowFunctionExpression(
        createFunctionDeclaration('ArrowFunctionExpression', true, body),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report async function with SwitchStatement in body', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const body = createBlockStatement([
        {
          type: 'SwitchStatement',
          discriminant: { type: 'Identifier', name: 'x' },
          cases: [],
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration('FunctionDeclaration', true, body))

      expect(reports.length).toBe(0)
    })

    test('should not report async function with ThrowStatement only in body', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const body = createBlockStatement([
        {
          type: 'ThrowStatement',
          argument: { type: 'Identifier', name: 'error' },
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration('FunctionDeclaration', true, body))

      expect(reports.length).toBe(0)
    })
  })

  describe('async functions - report cases', () => {
    test('should report async FunctionDeclaration with null body', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('FunctionDeclaration', true, null))

      expect(reports.length).toBe(1)
    })

    test('should report async FunctionExpression with null body', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      visitor.FunctionExpression(createFunctionDeclaration('FunctionExpression', true, null))

      expect(reports.length).toBe(1)
    })

    test('should report async ArrowFunctionExpression with null body', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      visitor.ArrowFunctionExpression(
        createFunctionDeclaration('ArrowFunctionExpression', true, null),
      )

      expect(reports.length).toBe(1)
    })

    test('should report async function with undefined body', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        async: true,
        body: undefined,
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should report async function with body as 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        async: true,
        body: 0,
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should report async function with body as false', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        async: true,
        body: false,
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should report async function with body as NaN', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        async: true,
        body: NaN,
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should report async function with body as empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        async: true,
        body: '',
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should report async FunctionDeclaration with BlockStatement containing ReturnStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const body = createBlockStatement([
        { type: 'ReturnStatement', argument: { type: 'Literal', value: 42 } },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration('FunctionDeclaration', true, body))

      expect(reports.length).toBe(1)
    })

    test('should report async FunctionExpression with BlockStatement containing ReturnStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const body = createBlockStatement([
        { type: 'ReturnStatement', argument: { type: 'Literal', value: 42 } },
      ])
      visitor.FunctionExpression(createFunctionDeclaration('FunctionExpression', true, body))

      expect(reports.length).toBe(1)
    })

    test('should report async ArrowFunctionExpression with BlockStatement containing ReturnStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const body = createBlockStatement([
        { type: 'ReturnStatement', argument: { type: 'Literal', value: 42 } },
      ])
      visitor.ArrowFunctionExpression(
        createFunctionDeclaration('ArrowFunctionExpression', true, body),
      )

      expect(reports.length).toBe(1)
    })

    test('should report async function with BlockStatement containing AwaitExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const body = createBlockStatement([
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'AwaitExpression',
            argument: { type: 'Identifier', name: 'promise' },
          },
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration('FunctionDeclaration', true, body))

      expect(reports.length).toBe(1)
    })

    test('should report async function with BlockStatement containing both ReturnStatement and AwaitExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const body = createBlockStatement([
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'AwaitExpression',
            argument: { type: 'Identifier', name: 'promise' },
          },
        },
        { type: 'ReturnStatement', argument: { type: 'Literal', value: 42 } },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration('FunctionDeclaration', true, body))

      expect(reports.length).toBe(1)
    })

    test('should report async function with BlockStatement containing nested ReturnStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const body = createBlockStatement([
        {
          type: 'IfStatement',
          test: { type: 'Literal', value: true },
          consequent: {
            type: 'BlockStatement',
            body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 1 } }],
          },
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration('FunctionDeclaration', true, body))

      expect(reports.length).toBe(1)
    })

    test('should report async function with deeply nested AwaitExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const body = createBlockStatement([
        {
          type: 'TryStatement',
          block: {
            type: 'BlockStatement',
            body: [
              {
                type: 'ExpressionStatement',
                expression: {
                  type: 'AwaitExpression',
                  argument: { type: 'Identifier', name: 'promise' },
                },
              },
            ],
          },
          handler: null,
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration('FunctionDeclaration', true, body))

      expect(reports.length).toBe(1)
    })
  })

  describe('edge cases', () => {
    test('should handle null node in FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      expect(() => visitor.FunctionDeclaration(null)).toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle undefined node in FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      expect(() => visitor.FunctionDeclaration(undefined)).toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle non-object node in FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      expect(() => visitor.FunctionDeclaration('string')).not.toThrow()
      expect(() => visitor.FunctionDeclaration(123)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle node without async property', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        body: createBlockStatement([]),
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without body property', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        async: true,
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node without loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        async: true,
        body: createBlockStatement([]),
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noReturnOrAwaitRule.create(context)

      const body = createBlockStatement([])
      visitor.FunctionDeclaration(createFunctionDeclaration('FunctionDeclaration', true, body))

      expect(reports.length).toBe(0)
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
        getSource: () => 'async function foo() {}',
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

      const visitor = noReturnOrAwaitRule.create(context)
      const body = createBlockStatement([])
      visitor.FunctionDeclaration(createFunctionDeclaration('FunctionDeclaration', true, body))

      expect(reports.length).toBe(0)
    })

    test('should handle null body', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        async: true,
        body: null,
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with extra unknown properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        async: true,
        body: null,
        id: { type: 'Identifier', name: 'foo' },
        params: [],
        generator: false,
        extraProp: 'value',
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with lowercase type', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'functiondeclaration',
        async: true,
        body: null,
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should handle boolean node in FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      expect(() => visitor.FunctionDeclaration(true)).not.toThrow()
      expect(() => visitor.FunctionDeclaration(false)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {}
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with only type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = { type: 'FunctionDeclaration' }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with only async property', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = { async: true }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should handle array as node', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = [{ type: 'FunctionDeclaration', async: true, body: null }]
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle Date object as node', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = new Date()
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with body as RegExp', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        async: true,
        body: /test/,
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with body as Map', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        async: true,
        body: new Map(),
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with body as Set', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        async: true,
        body: new Set(),
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle null node in FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      expect(() => visitor.FunctionExpression(null)).toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle null node in ArrowFunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      expect(() => visitor.ArrowFunctionExpression(null)).toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle undefined node in FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      expect(() => visitor.FunctionExpression(undefined)).toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle undefined node in ArrowFunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      expect(() => visitor.ArrowFunctionExpression(undefined)).toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle non-standard node type with async true', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'MethodDefinition',
        async: true,
        body: null,
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('message quality', () => {
    test('should mention async in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        async: true,
        body: null,
      }
      visitor.FunctionDeclaration(node)

      expect(reports[0].message.toLowerCase()).toContain('async')
    })

    test('should mention await in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        async: true,
        body: null,
      }
      visitor.FunctionDeclaration(node)

      expect(reports[0].message).toContain('await')
    })

    test('should mention return in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        async: true,
        body: null,
      }
      visitor.FunctionDeclaration(node)

      expect(reports[0].message).toContain('return')
    })

    test('should have consistent message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node1 = {
        type: 'FunctionDeclaration',
        async: true,
        body: null,
      }
      const node2 = {
        type: 'FunctionExpression',
        async: true,
        body: null,
      }
      visitor.FunctionDeclaration(node1)
      visitor.FunctionExpression(node2)

      expect(reports[0].message).toBe('Async function has no await or return.')
      expect(reports[1].message).toBe('Async function has no await or return.')
    })

    test('should have message ending with period', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        async: true,
        body: null,
      }
      visitor.FunctionDeclaration(node)

      expect(reports[0].message.endsWith('.')).toBe(true)
    })

    test('should have message as type string', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        async: true,
        body: null,
      }
      visitor.FunctionDeclaration(node)

      expect(typeof reports[0].message).toBe('string')
    })

    test('should have non-empty message', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        async: true,
        body: null,
      }
      visitor.FunctionDeclaration(node)

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should not contain placeholder tokens in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        async: true,
        body: null,
      }
      visitor.FunctionDeclaration(node)

      expect(reports[0].message).not.toContain('{{')
      expect(reports[0].message).not.toContain('}}')
    })

    test('should have same message for all three visitor methods', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      visitor.FunctionDeclaration({ type: 'FunctionDeclaration', async: true, body: null })
      visitor.FunctionExpression({ type: 'FunctionExpression', async: true, body: null })
      visitor.ArrowFunctionExpression({
        type: 'ArrowFunctionExpression',
        async: true,
        body: null,
      })

      expect(reports[0].message).toBe(reports[1].message)
      expect(reports[1].message).toBe(reports[2].message)
    })

    test('should have message without undefined or null substrings', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        async: true,
        body: null,
      }
      visitor.FunctionDeclaration(node)

      expect(reports[0].message).not.toContain('undefined')
      expect(reports[0].message).not.toContain('null')
    })

    test('should have consistent message across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = { type: 'FunctionDeclaration', async: true, body: null }
      visitor.FunctionDeclaration(node)
      visitor.FunctionDeclaration(node)
      visitor.FunctionDeclaration(node)

      expect(reports[0].message).toBe(reports[1].message)
      expect(reports[1].message).toBe(reports[2].message)
    })
  })

  describe('location reporting', () => {
    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        async: true,
        body: null,
        loc: {
          start: { line: 10, column: 5 },
          end: { line: 10, column: 25 },
        },
      }
      visitor.FunctionDeclaration(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report location with end position', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        async: true,
        body: null,
        loc: {
          start: { line: 5, column: 10 },
          end: { line: 5, column: 30 },
        },
      }
      visitor.FunctionDeclaration(node)

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should report default location when node has no loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        async: true,
        body: null,
      }
      visitor.FunctionDeclaration(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report multi-line location span', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        async: true,
        body: null,
        loc: {
          start: { line: 5, column: 0 },
          end: { line: 15, column: 1 },
        },
      }
      visitor.FunctionDeclaration(node)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.end.line).toBe(15)
    })

    test('should report location with column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        async: true,
        body: null,
        loc: {
          start: { line: 3, column: 0 },
          end: { line: 3, column: 20 },
        },
      }
      visitor.FunctionDeclaration(node)

      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location with large line numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        async: true,
        body: null,
        loc: {
          start: { line: 500, column: 30 },
          end: { line: 550, column: 1 },
        },
      }
      visitor.FunctionDeclaration(node)

      expect(reports[0].loc?.start.line).toBe(500)
      expect(reports[0].loc?.start.column).toBe(30)
    })

    test('should report different locations for different nodes', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node1 = {
        type: 'FunctionDeclaration',
        async: true,
        body: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const node2 = {
        type: 'FunctionExpression',
        async: true,
        body: null,
        loc: { start: { line: 20, column: 5 }, end: { line: 20, column: 15 } },
      }
      visitor.FunctionDeclaration(node1)
      visitor.FunctionExpression(node2)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(20)
    })

    test('should report location for FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'FunctionExpression',
        async: true,
        body: null,
        loc: {
          start: { line: 8, column: 2 },
          end: { line: 8, column: 22 },
        },
      }
      visitor.FunctionExpression(node)

      expect(reports[0].loc?.start.line).toBe(8)
      expect(reports[0].loc?.start.column).toBe(2)
    })

    test('should report location for ArrowFunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'ArrowFunctionExpression',
        async: true,
        body: null,
        loc: {
          start: { line: 12, column: 4 },
          end: { line: 12, column: 24 },
        },
      }
      visitor.ArrowFunctionExpression(node)

      expect(reports[0].loc?.start.line).toBe(12)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should use default location when loc has null start', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        async: true,
        body: null,
        loc: {
          start: null,
          end: { line: 1, column: 10 },
        },
      }
      visitor.FunctionDeclaration(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should use default when start.line is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        async: true,
        body: null,
        loc: {
          start: { column: 5 },
          end: { line: 1, column: 10 },
        },
      }
      visitor.FunctionDeclaration(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should use default column when start.column is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        async: true,
        body: null,
        loc: {
          start: { line: 3 },
          end: { line: 3, column: 10 },
        },
      }
      visitor.FunctionDeclaration(node)

      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should use default when start.line is non-numeric', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        async: true,
        body: null,
        loc: {
          start: { line: 'three', column: 5 },
          end: { line: 3, column: 10 },
        },
      }
      visitor.FunctionDeclaration(node)

      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should use default column when start.column is non-numeric', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        async: true,
        body: null,
        loc: {
          start: { line: 3, column: 'five' },
          end: { line: 3, column: 10 },
        },
      }
      visitor.FunctionDeclaration(node)

      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should preserve individual locations across multiple reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node1 = {
        type: 'FunctionDeclaration',
        async: true,
        body: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const node2 = {
        type: 'FunctionDeclaration',
        async: true,
        body: null,
        loc: { start: { line: 100, column: 50 }, end: { line: 100, column: 60 } },
      }
      visitor.FunctionDeclaration(node1)
      visitor.FunctionDeclaration(node2)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.line).not.toBe(reports[1].loc?.start.line)
    })

    test('should report end location correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        async: true,
        body: null,
        loc: {
          start: { line: 2, column: 4 },
          end: { line: 6, column: 1 },
        },
      }
      visitor.FunctionDeclaration(node)

      expect(reports[0].loc?.end.line).toBe(6)
      expect(reports[0].loc?.end.column).toBe(1)
    })

    test('should use default when loc.end is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        async: true,
        body: null,
        loc: {
          start: { line: 2, column: 4 },
        },
      }
      visitor.FunctionDeclaration(node)

      expect(reports[0].loc?.end.line).toBe(1)
      expect(reports[0].loc?.end.column).toBe(0)
    })
  })

  describe('context variations', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockContext({}, '/project/src/utils/helper.ts')
      const visitor = noReturnOrAwaitRule.create(context)

      visitor.FunctionDeclaration({ type: 'FunctionDeclaration', async: true, body: null })

      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'async function foo() { return await bar(); }',
      )
      const visitor = noReturnOrAwaitRule.create(context)

      visitor.FunctionDeclaration({ type: 'FunctionDeclaration', async: true, body: null })

      expect(reports.length).toBe(1)
    })

    test('should work with empty source code', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', '')
      const visitor = noReturnOrAwaitRule.create(context)

      visitor.FunctionDeclaration({ type: 'FunctionDeclaration', async: true, body: null })

      expect(reports.length).toBe(1)
    })

    test('should work with source code containing async keyword', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'async function test() {}')
      const visitor = noReturnOrAwaitRule.create(context)

      visitor.FunctionDeclaration({ type: 'FunctionDeclaration', async: true, body: null })

      expect(reports.length).toBe(1)
    })

    test('should work with different workspace root', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/custom/project/file.ts',
        getAST: () => null,
        getSource: () => 'code',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/custom/project',
      } as unknown as RuleContext

      const visitor = noReturnOrAwaitRule.create(context)
      visitor.FunctionDeclaration({ type: 'FunctionDeclaration', async: true, body: null })

      expect(reports.length).toBe(1)
    })

    test('should call report function correctly', () => {
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
        config: { options: [{}] },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noReturnOrAwaitRule.create(context)
      visitor.FunctionDeclaration({ type: 'FunctionDeclaration', async: true, body: null })

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Async function has no await or return.')
    })

    test('should have accessible getFilePath in context', () => {
      const { context } = createMockContext({}, '/src/my-file.ts')
      expect(context.getFilePath()).toBe('/src/my-file.ts')

      const visitor = noReturnOrAwaitRule.create(context)
      visitor.FunctionDeclaration({ type: 'FunctionDeclaration', async: true, body: null })
    })

    test('should have accessible getSource in context', () => {
      const { context } = createMockContext({}, '/src/file.ts', 'const x = 1;')
      expect(context.getSource()).toBe('const x = 1;')

      const visitor = noReturnOrAwaitRule.create(context)
      visitor.FunctionDeclaration({ type: 'FunctionDeclaration', async: true, body: null })
    })

    test('should work with complex options object', () => {
      const { context, reports } = createMockContext({
        checkArrowFunctions: true,
        allowForEach: false,
        maxDepth: 5,
      })
      const visitor = noReturnOrAwaitRule.create(context)

      visitor.FunctionDeclaration({ type: 'FunctionDeclaration', async: true, body: null })

      expect(reports.length).toBe(1)
    })

    test('should produce same result for visitors from separate contexts', () => {
      const { context: ctx1, reports: reports1 } = createMockContext()
      const { context: ctx2, reports: reports2 } = createMockContext()

      const visitor1 = noReturnOrAwaitRule.create(ctx1)
      const visitor2 = noReturnOrAwaitRule.create(ctx2)

      const node = { type: 'FunctionDeclaration', async: true, body: null }
      visitor1.FunctionDeclaration(node)
      visitor2.FunctionDeclaration(node)

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(1)
    })

    test('should work with long file path', () => {
      const longPath = '/very/long/path/to/project/src/deeply/nested/directory/structure/file.ts'
      const { context, reports } = createMockContext({}, longPath)
      const visitor = noReturnOrAwaitRule.create(context)

      visitor.FunctionDeclaration({ type: 'FunctionDeclaration', async: true, body: null })

      expect(reports.length).toBe(1)
    })

    test('should have accessible logger in context', () => {
      const { context } = createMockContext()
      expect(context.logger).toBeDefined()
      expect(typeof context.logger.debug).toBe('function')
      expect(typeof context.logger.info).toBe('function')
      expect(typeof context.logger.warn).toBe('function')
      expect(typeof context.logger.error).toBe('function')
    })

    test('should have accessible config in context', () => {
      const { context } = createMockContext({ key: 'value' })
      expect(context.config).toBeDefined()
      expect(context.config.options).toBeDefined()
    })

    test('should work when context getAST returns object', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => ({ type: 'Program', body: [] }),
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
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noReturnOrAwaitRule.create(context)
      visitor.FunctionDeclaration({ type: 'FunctionDeclaration', async: true, body: null })

      expect(reports.length).toBe(1)
    })

    test('should work when context getTokens returns array', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [{ type: 'Keyword', value: 'async' }],
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

      const visitor = noReturnOrAwaitRule.create(context)
      visitor.FunctionDeclaration({ type: 'FunctionDeclaration', async: true, body: null })

      expect(reports.length).toBe(1)
    })
  })

  describe('export verification', () => {
    test('should have a default export', () => {
      const imported = noReturnOrAwaitRule
      expect(imported).toBeDefined()
    })

    test('should have named export matching default', () => {
      const rule = noReturnOrAwaitRule
      expect(rule).toBe(noReturnOrAwaitRule)
    })

    test('should export a rule with meta property', () => {
      expect(noReturnOrAwaitRule.meta).toBeDefined()
      expect(typeof noReturnOrAwaitRule.meta).toBe('object')
    })

    test('should export a rule with create property', () => {
      expect(noReturnOrAwaitRule.create).toBeDefined()
      expect(typeof noReturnOrAwaitRule.create).toBe('function')
    })

    test('should export rule with correct meta type', () => {
      expect(noReturnOrAwaitRule.meta.type).toBe('suggestion')
    })

    test('should export rule with correct meta severity', () => {
      expect(noReturnOrAwaitRule.meta.severity).toBe('warn')
    })
  })

  describe('report descriptor structure', () => {
    test('should have message property in report', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      visitor.FunctionDeclaration({ type: 'FunctionDeclaration', async: true, body: null })

      expect(reports[0]).toHaveProperty('message')
    })

    test('should have loc property in report', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      visitor.FunctionDeclaration({ type: 'FunctionDeclaration', async: true, body: null })

      expect(reports[0]).toHaveProperty('loc')
    })

    test('should have loc.start in report', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      visitor.FunctionDeclaration({ type: 'FunctionDeclaration', async: true, body: null })

      expect(reports[0].loc).toHaveProperty('start')
    })

    test('should have loc.end in report', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      visitor.FunctionDeclaration({ type: 'FunctionDeclaration', async: true, body: null })

      expect(reports[0].loc).toHaveProperty('end')
    })

    test('should have loc.start.line as number', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      visitor.FunctionDeclaration({ type: 'FunctionDeclaration', async: true, body: null })

      expect(typeof reports[0].loc?.start.line).toBe('number')
    })

    test('should have loc.start.column as number', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      visitor.FunctionDeclaration({ type: 'FunctionDeclaration', async: true, body: null })

      expect(typeof reports[0].loc?.start.column).toBe('number')
    })

    test('should have loc.end.line as number', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      visitor.FunctionDeclaration({ type: 'FunctionDeclaration', async: true, body: null })

      expect(typeof reports[0].loc?.end.line).toBe('number')
    })

    test('should have loc.end.column as number', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      visitor.FunctionDeclaration({ type: 'FunctionDeclaration', async: true, body: null })

      expect(typeof reports[0].loc?.end.column).toBe('number')
    })

    test('should have exact expected message string', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      visitor.FunctionDeclaration({ type: 'FunctionDeclaration', async: true, body: null })

      expect(reports[0].message).toBe('Async function has no await or return.')
    })

    test('should report message for each visitor method independently', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      visitor.FunctionDeclaration({ type: 'FunctionDeclaration', async: true, body: null })
      visitor.FunctionExpression({ type: 'FunctionExpression', async: true, body: null })
      visitor.ArrowFunctionExpression({
        type: 'ArrowFunctionExpression',
        async: true,
        body: null,
      })

      reports.forEach((r) => {
        expect(r.message).toBe('Async function has no await or return.')
      })
    })
  })

  describe('hasReturnOrAwait behavior', () => {
    test('should not report async with BlockStatement containing only BreakStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const body = createBlockStatement([
        {
          type: 'BreakStatement',
          label: null,
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration('FunctionDeclaration', true, body))

      expect(reports.length).toBe(0)
    })

    test('should not report async with BlockStatement containing only ContinueStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const body = createBlockStatement([
        {
          type: 'ContinueStatement',
          label: null,
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration('FunctionDeclaration', true, body))

      expect(reports.length).toBe(0)
    })

    test('should not report async with BlockStatement containing only VariableDeclarations', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const body = createBlockStatement([
        {
          type: 'VariableDeclaration',
          declarations: [
            {
              type: 'VariableDeclarator',
              id: { type: 'Identifier', name: 'x' },
              init: { type: 'Literal', value: 42 },
            },
          ],
          kind: 'let',
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration('FunctionDeclaration', true, body))

      expect(reports.length).toBe(0)
    })

    test('should not report async with BlockStatement containing ExpressionStatement with regular call', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const body = createBlockStatement([
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'console' },
            arguments: [{ type: 'Literal', value: 'log' }],
          },
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration('FunctionDeclaration', true, body))

      expect(reports.length).toBe(0)
    })

    test('should report async with BlockStatement containing ReturnStatement in nested function', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const body = createBlockStatement([
        {
          type: 'FunctionDeclaration',
          id: { type: 'Identifier', name: 'inner' },
          params: [],
          body: {
            type: 'BlockStatement',
            body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 1 } }],
          },
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration('FunctionDeclaration', true, body))

      expect(reports.length).toBe(1)
    })

    test('should report async with AwaitExpression in arrow function argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const body = createBlockStatement([
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'fn' },
            arguments: [
              {
                type: 'ArrowFunctionExpression',
                params: [],
                body: {
                  type: 'AwaitExpression',
                  argument: { type: 'Identifier', name: 'p' },
                },
              },
            ],
          },
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration('FunctionDeclaration', true, body))

      expect(reports.length).toBe(1)
    })

    test('should report async with ReturnStatement in IfStatement consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const body = createBlockStatement([
        {
          type: 'IfStatement',
          test: { type: 'Literal', value: true },
          consequent: { type: 'ReturnStatement', argument: { type: 'Literal', value: 1 } },
          alternate: null,
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration('FunctionDeclaration', true, body))

      expect(reports.length).toBe(1)
    })

    test('should report async with AwaitExpression in TryStatement catch', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const body = createBlockStatement([
        {
          type: 'TryStatement',
          block: { type: 'BlockStatement', body: [] },
          handler: {
            type: 'CatchClause',
            param: { type: 'Identifier', name: 'e' },
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ExpressionStatement',
                  expression: {
                    type: 'AwaitExpression',
                    argument: { type: 'Identifier', name: 'recover' },
                  },
                },
              ],
            },
          },
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration('FunctionDeclaration', true, body))

      expect(reports.length).toBe(1)
    })

    test('should report async with AwaitExpression in CallExpression arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const body = createBlockStatement([
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'fn' },
            arguments: [
              {
                type: 'AwaitExpression',
                argument: { type: 'Identifier', name: 'promise' },
              },
            ],
          },
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration('FunctionDeclaration', true, body))

      expect(reports.length).toBe(1)
    })

    test('should report async with ReturnStatement in ForStatement body', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const body = createBlockStatement([
        {
          type: 'ForStatement',
          init: null,
          test: { type: 'Literal', value: true },
          update: null,
          body: {
            type: 'BlockStatement',
            body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 1 } }],
          },
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration('FunctionDeclaration', true, body))

      expect(reports.length).toBe(1)
    })

    test('should report async with AwaitExpression in WhileStatement body', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const body = createBlockStatement([
        {
          type: 'WhileStatement',
          test: { type: 'Literal', value: true },
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'ExpressionStatement',
                expression: {
                  type: 'AwaitExpression',
                  argument: { type: 'Identifier', name: 'poll' },
                },
              },
            ],
          },
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration('FunctionDeclaration', true, body))

      expect(reports.length).toBe(1)
    })

    test('should report async with ReturnStatement in SwitchCase', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const body = createBlockStatement([
        {
          type: 'SwitchStatement',
          discriminant: { type: 'Identifier', name: 'x' },
          cases: [
            {
              type: 'SwitchCase',
              test: { type: 'Literal', value: 1 },
              consequent: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 'a' } }],
            },
          ],
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration('FunctionDeclaration', true, body))

      expect(reports.length).toBe(1)
    })

    test('should not report async with ThrowStatement without return/await', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const body = createBlockStatement([
        {
          type: 'ThrowStatement',
          argument: {
            type: 'NewExpression',
            callee: { type: 'Identifier', name: 'Error' },
            arguments: [{ type: 'Literal', value: 'fail' }],
          },
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration('FunctionDeclaration', true, body))

      expect(reports.length).toBe(0)
    })

    test('should not report async with only LabeledStatement in body', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const body = createBlockStatement([
        {
          type: 'LabeledStatement',
          label: { type: 'Identifier', name: 'loop' },
          body: {
            type: 'ExpressionStatement',
            expression: { type: 'Literal', value: 1 },
          },
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration('FunctionDeclaration', true, body))

      expect(reports.length).toBe(0)
    })
  })

  describe('visitor independence and isolation', () => {
    test('should report independently for each visitor method', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      visitor.FunctionDeclaration({ type: 'FunctionDeclaration', async: true, body: null })
      visitor.FunctionExpression({ type: 'FunctionExpression', async: true, body: null })
      visitor.ArrowFunctionExpression({
        type: 'ArrowFunctionExpression',
        async: true,
        body: null,
      })

      expect(reports.length).toBe(3)
    })

    test('should not cross-contaminate between visitor methods', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        async: false,
        body: null,
      })
      visitor.FunctionExpression({
        type: 'FunctionExpression',
        async: true,
        body: null,
      })

      expect(reports.length).toBe(1)
    })

    test('should handle rapid sequential calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.FunctionDeclaration({
          type: 'FunctionDeclaration',
          async: true,
          body: null,
        })
      }

      expect(reports.length).toBe(10)
    })

    test('should handle mix of reporting and non-reporting calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      visitor.FunctionDeclaration({ type: 'FunctionDeclaration', async: true, body: null })
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        async: false,
        body: null,
      })
      visitor.FunctionDeclaration({ type: 'FunctionDeclaration', async: true, body: null })
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        async: true,
        body: createBlockStatement([]),
      })

      expect(reports.length).toBe(2)
    })

    test('should produce fresh visitor for each create call', () => {
      const { context, reports } = createMockContext()
      const visitor1 = noReturnOrAwaitRule.create(context)
      const visitor2 = noReturnOrAwaitRule.create(context)

      visitor1.FunctionDeclaration({
        type: 'FunctionDeclaration',
        async: true,
        body: null,
      })
      visitor2.FunctionDeclaration({
        type: 'FunctionDeclaration',
        async: true,
        body: null,
      })

      expect(reports.length).toBe(2)
    })

    test('should handle all three visitor methods with same node data', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const nodeData = {
        async: true,
        body: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } },
      }

      visitor.FunctionDeclaration({ type: 'FunctionDeclaration', ...nodeData })
      visitor.FunctionExpression({ type: 'FunctionExpression', ...nodeData })
      visitor.ArrowFunctionExpression({ type: 'ArrowFunctionExpression', ...nodeData })

      expect(reports.length).toBe(3)
      reports.forEach((r) => {
        expect(r.message).toBe('Async function has no await or return.')
      })
    })

    test('should handle async FunctionDeclaration followed by non-async FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      visitor.FunctionDeclaration({ type: 'FunctionDeclaration', async: true, body: null })
      visitor.FunctionExpression({
        type: 'FunctionExpression',
        async: false,
        body: createBlockStatement([]),
      })

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Async function has no await or return.')
    })

    test('should handle non-async ArrowFunction followed by async FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      visitor.ArrowFunctionExpression({
        type: 'ArrowFunctionExpression',
        async: false,
        body: { type: 'Identifier', name: 'x' },
      })
      visitor.FunctionDeclaration({ type: 'FunctionDeclaration', async: true, body: null })

      expect(reports.length).toBe(1)
    })

    test('should handle alternating valid and invalid nodes', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const validNode = {
        type: 'FunctionDeclaration' as const,
        async: false,
        body: createBlockStatement([]),
      }
      const invalidNode = {
        type: 'FunctionDeclaration' as const,
        async: true,
        body: null,
      }

      for (let i = 0; i < 5; i++) {
        visitor.FunctionDeclaration(validNode)
        visitor.FunctionDeclaration(invalidNode)
      }

      expect(reports.length).toBe(5)
    })

    test('should handle single valid node producing no reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration('FunctionDeclaration', false, createBlockStatement([])),
      )
      visitor.FunctionExpression(
        createFunctionDeclaration('FunctionExpression', false, createBlockStatement([])),
      )
      visitor.ArrowFunctionExpression(
        createFunctionDeclaration('ArrowFunctionExpression', false, createBlockStatement([])),
      )

      expect(reports.length).toBe(0)
    })
  })
})
