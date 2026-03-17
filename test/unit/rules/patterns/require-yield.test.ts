import { describe, test, expect, vi } from 'vitest'
import { requireYieldRule } from '../../../../src/rules/patterns/require-yield.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'function* foo() { }',
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
  generator: boolean,
  body: unknown,
  params: unknown[] = [],
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'FunctionDeclaration',
    generator,
    params,
    body,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createFunctionExpression(
  generator: boolean,
  body: unknown,
  params: unknown[] = [],
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'FunctionExpression',
    generator,
    params,
    body,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createArrowFunction(
  generator: boolean,
  body: unknown,
  params: unknown[] = [],
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'ArrowFunctionExpression',
    generator,
    params,
    body,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createBlockStatement(statements: unknown[]): unknown {
  return {
    type: 'BlockStatement',
    body: statements,
  }
}

function createYieldExpression(argument: unknown): unknown {
  return {
    type: 'YieldExpression',
    argument,
  }
}

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: name.length },
    },
  }
}

function createReturnStatement(argument: unknown): unknown {
  return {
    type: 'ReturnStatement',
    argument,
  }
}

function createVariableDeclaration(declarations: unknown[]): unknown {
  return {
    type: 'VariableDeclaration',
    declarations,
  }
}

function createVariableDeclarator(id: unknown, init: unknown): unknown {
  return {
    type: 'VariableDeclarator',
    id,
    init,
  }
}

describe('require-yield rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(requireYieldRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(requireYieldRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(requireYieldRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(requireYieldRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention yield in description', () => {
      expect(requireYieldRule.meta.docs?.description.toLowerCase()).toContain('yield')
    })

    test('should mention generator in description', () => {
      expect(requireYieldRule.meta.docs?.description.toLowerCase()).toContain('generator')
    })

    test('should have empty schema', () => {
      expect(requireYieldRule.meta.schema).toEqual([])
    })

    test('should not be fixable', () => {
      expect(requireYieldRule.meta.fixable).toBeUndefined()
    })
  })

  describe('create', () => {
    test('should return visitor object with FunctionDeclaration method', () => {
      const { context } = createMockContext()
      const visitor = requireYieldRule.create(context)

      expect(visitor).toHaveProperty('FunctionDeclaration')
      expect(typeof visitor.FunctionDeclaration).toBe('function')
    })

    test('should return visitor object with FunctionExpression method', () => {
      const { context } = createMockContext()
      const visitor = requireYieldRule.create(context)

      expect(visitor).toHaveProperty('FunctionExpression')
      expect(typeof visitor.FunctionExpression).toBe('function')
    })
  })

  describe('detecting generator functions without yield', () => {
    test('should report generator function declaration without yield', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      const node = createFunctionDeclaration(true, body)

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('yield')
    })

    test('should report generator function expression without yield', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      const node = createFunctionExpression(true, body)

      visitor.FunctionExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('yield')
    })

    test('should report generator function with only synchronous operations', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createVariableDeclaration([
          createVariableDeclarator(createIdentifier('x'), createIdentifier('y')),
        ]),
      ])
      const node = createFunctionDeclaration(true, body)

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should report generator function with empty body', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([])
      const node = createFunctionDeclaration(true, body)

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([])
      const node = createFunctionDeclaration(true, body, [], 42, 10)

      visitor.FunctionDeclaration(node)

      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(10)
    })
  })

  describe('not reporting valid generator functions', () => {
    test('should not report non-generator function', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      const node = createFunctionDeclaration(false, body)

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report generator function with yield', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([createYieldExpression(createIdentifier('value'))])
      const node = createFunctionDeclaration(true, body)

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report generator function with yield in return', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createReturnStatement(createYieldExpression(createIdentifier('value'))),
      ])
      const node = createFunctionDeclaration(true, body)

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report generator function with multiple yields', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createYieldExpression(createIdentifier('value1')),
        createYieldExpression(createIdentifier('value2')),
        createYieldExpression(createIdentifier('value3')),
      ])
      const node = createFunctionDeclaration(true, body)

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report generator function expression with yield', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([createYieldExpression(createIdentifier('value'))])
      const node = createFunctionExpression(true, body)

      visitor.FunctionExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report generator function without body', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        generator: true,
        params: [],
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should mention generator function in message', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports[0].message.toLowerCase()).toContain('generator')
    })

    test('should mention yield in message', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports[0].message.toLowerCase()).toContain('yield')
    })

    test('should mention does not have in message', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports[0].message.toLowerCase()).toContain('does not have')
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully in FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      expect(() => visitor.FunctionDeclaration(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully in FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      expect(() => visitor.FunctionDeclaration(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node gracefully in FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      expect(() => visitor.FunctionDeclaration('string')).not.toThrow()
      expect(() => visitor.FunctionDeclaration(123)).not.toThrow()
      expect(() => visitor.FunctionDeclaration(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle null node gracefully in FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      expect(() => visitor.FunctionExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully in FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      expect(() => visitor.FunctionExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without type property', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const node = {
        generator: true,
        body: createBlockStatement([]),
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without generator property', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        body: createBlockStatement([]),
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without body property', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        generator: true,
        params: [],
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([])
      const node = createFunctionDeclaration(true, body)
      delete (node as Record<string, unknown>).loc
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeUndefined()
    })

    test('should handle null body', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        generator: true,
        params: [],
        body: null,
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle undefined body', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        generator: true,
        params: [],
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(1)
    })

    test('should handle function declaration with incorrect type', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const node = {
        type: 'NotFunctionDeclaration',
        generator: true,
        body: createBlockStatement([]),
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle function expression with incorrect type', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const node = {
        type: 'NotFunctionExpression',
        generator: true,
        body: createBlockStatement([]),
      }
      visitor.FunctionExpression(node)

      expect(reports.length).toBe(0)
    })
  })
})
