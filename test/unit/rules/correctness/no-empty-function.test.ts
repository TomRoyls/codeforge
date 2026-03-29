import { describe, test, expect, vi } from 'vitest'
import { noEmptyFunctionRule } from '../../../../src/rules/correctness/no-empty-function.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'function foo() {}',
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

function createFunctionDeclaration(name = 'foo', isEmpty = true, line = 1, column = 0): unknown {
  return {
    type: 'FunctionDeclaration',
    id: { type: 'Identifier', name },
    body: isEmpty
      ? { type: 'BlockStatement', body: [] }
      : {
          type: 'BlockStatement',
          body: [{ type: 'ExpressionStatement', expression: { type: 'Literal', value: 1 } }],
        },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createFunctionExpression(isEmpty = true, line = 1, column = 0): unknown {
  return {
    type: 'FunctionExpression',
    body: isEmpty
      ? { type: 'BlockStatement', body: [] }
      : {
          type: 'BlockStatement',
          body: [{ type: 'ExpressionStatement', expression: { type: 'Literal', value: 1 } }],
        },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createArrowFunctionExpression(
  isEmpty = true,
  hasExpressionBody = false,
  line = 1,
  column = 0,
): unknown {
  if (hasExpressionBody) {
    return {
      type: 'ArrowFunctionExpression',
      body: { type: 'Literal', value: 1 },
      loc: {
        start: { line, column },
        end: { line, column: column + 10 },
      },
    }
  }
  return {
    type: 'ArrowFunctionExpression',
    body: isEmpty
      ? { type: 'BlockStatement', body: [] }
      : {
          type: 'BlockStatement',
          body: [{ type: 'ExpressionStatement', expression: { type: 'Literal', value: 1 } }],
        },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createMethodDefinition(
  kind = 'method',
  name = 'foo',
  isEmpty = true,
  hasSuper = false,
  line = 1,
  column = 0,
): unknown {
  const body: unknown[] = []

  if (hasSuper) {
    body.push({
      type: 'ExpressionStatement',
      expression: {
        type: 'CallExpression',
        callee: { type: 'Super' },
        arguments: [],
      },
    })
  }

  if (!isEmpty && !hasSuper) {
    body.push({
      type: 'ExpressionStatement',
      expression: { type: 'Literal', value: 1 },
    })
  }

  return {
    type: 'MethodDefinition',
    kind,
    key: { type: 'Identifier', name },
    value: {
      type: 'FunctionExpression',
      body: { type: 'BlockStatement', body },
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createMethodWithDecorator(
  decoratorName = 'override',
  name = 'foo',
  isEmpty = true,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'MethodDefinition',
    kind: 'method',
    key: { type: 'Identifier', name },
    decorators: [
      {
        type: 'Decorator',
        expression: { type: 'Identifier', name: decoratorName },
      },
    ],
    value: {
      type: 'FunctionExpression',
      body: isEmpty
        ? { type: 'BlockStatement', body: [] }
        : {
            type: 'BlockStatement',
            body: [{ type: 'ExpressionStatement', expression: { type: 'Literal', value: 1 } }],
          },
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createAsyncFunction(isEmpty = true, line = 1, column = 0): unknown {
  return {
    type: 'FunctionDeclaration',
    async: true,
    id: { type: 'Identifier', name: 'asyncFoo' },
    body: isEmpty
      ? { type: 'BlockStatement', body: [] }
      : {
          type: 'BlockStatement',
          body: [{ type: 'ExpressionStatement', expression: { type: 'Literal', value: 1 } }],
        },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

describe('no-empty-function rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noEmptyFunctionRule.meta.type).toBe('problem')
    })

    test('should have warn severity', () => {
      expect(noEmptyFunctionRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noEmptyFunctionRule.meta.docs?.recommended).toBe(true)
    })

    test('should have correctness category', () => {
      expect(noEmptyFunctionRule.meta.docs?.category).toBe('correctness')
    })

    test('should have schema defined', () => {
      expect(noEmptyFunctionRule.meta.schema).toBeDefined()
    })

    test('should mention empty in description', () => {
      expect(noEmptyFunctionRule.meta.docs?.description.toLowerCase()).toContain('empty')
    })
  })

  describe('create', () => {
    test('should return visitor object with function methods', () => {
      const { context } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      expect(visitor).toHaveProperty('FunctionDeclaration')
      expect(visitor).toHaveProperty('FunctionExpression')
      expect(visitor).toHaveProperty('ArrowFunctionExpression')
      expect(visitor).toHaveProperty('MethodDefinition')
    })
  })

  describe('detecting empty functions', () => {
    test('should report empty function declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('foo', true))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('empty')
    })

    test('should report empty function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(true))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('empty')
    })

    test('should report empty arrow function', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('empty')
    })

    test('should report empty method', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('method', 'foo', true))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('empty')
    })

    test('should report empty constructor', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', 'constructor', true))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('empty')
    })

    test('should not report function with non-empty body', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('foo', false))

      expect(reports.length).toBe(0)
    })

    test('should not report arrow function with expression body', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(false, true))

      expect(reports.length).toBe(0)
    })

    test('should not report method with super call', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', 'constructor', true, true))

      expect(reports.length).toBe(0)
    })
  })

  describe('options - allowArrowFunctions', () => {
    test('should allow empty arrow functions when option is true', () => {
      const { context, reports } = createMockContext({ allowArrowFunctions: true })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true))

      expect(reports.length).toBe(0)
    })

    test('should still report empty regular functions when allowArrowFunctions is true', () => {
      const { context, reports } = createMockContext({ allowArrowFunctions: true })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('foo', true))

      expect(reports.length).toBe(1)
    })
  })

  describe('options - allowAsyncFunctions', () => {
    test('should allow empty async functions when option is true', () => {
      const { context, reports } = createMockContext({ allowAsyncFunctions: true })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunction(true))

      expect(reports.length).toBe(0)
    })

    test('should still report empty sync functions when allowAsyncFunctions is true', () => {
      const { context, reports } = createMockContext({ allowAsyncFunctions: true })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('foo', true))

      expect(reports.length).toBe(1)
    })
  })

  describe('options - allowConstructors', () => {
    test('should allow empty constructors when option is true', () => {
      const { context, reports } = createMockContext({ allowConstructors: true })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', 'constructor', true))

      expect(reports.length).toBe(0)
    })

    test('should still report empty methods when allowConstructors is true', () => {
      const { context, reports } = createMockContext({ allowConstructors: true })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('method', 'foo', true))

      expect(reports.length).toBe(1)
    })
  })

  describe('options - allowOverrideMethods', () => {
    test('should allow empty override methods when option is true', () => {
      const { context, reports } = createMockContext({ allowOverrideMethods: true })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(createMethodWithDecorator('override', 'foo', true))

      expect(reports.length).toBe(0)
    })

    test('should still report empty methods without override decorator', () => {
      const { context, reports } = createMockContext({ allowOverrideMethods: true })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('method', 'bar', true))

      expect(reports.length).toBe(1)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      expect(() => visitor.FunctionDeclaration(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      expect(() => visitor.FunctionDeclaration(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      expect(() => visitor.FunctionDeclaration('string')).not.toThrow()
      expect(() => visitor.FunctionDeclaration(123)).not.toThrow()
    })

    test('should handle node without body', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = { type: 'FunctionDeclaration', id: { type: 'Identifier', name: 'foo' } }

      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        body: { type: 'BlockStatement', body: [] },
      }

      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('foo', true, 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('foo', true))

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
        getSource: () => 'function foo() {}',
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

      const visitor = noEmptyFunctionRule.create(context)

      expect(() =>
        visitor.FunctionDeclaration(createFunctionDeclaration('foo', true)),
      ).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with partial loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        body: { type: 'BlockStatement', body: [] },
        loc: {
          start: { line: 1, column: 0 },
        },
      }

      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })

  describe('message quality', () => {
    test('should mention function name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('myFunction', true))

      expect(reports[0].message).toContain('myFunction')
    })

    test('should mention implementation in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('foo', true))

      expect(reports[0].message.toLowerCase()).toContain('implementation')
    })
  })
})
