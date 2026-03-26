import { describe, test, expect, vi } from 'vitest'
import { preferArrowCallbackRule } from '../../../../src/rules/patterns/prefer-arrow-callback.js'
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
  })

  describe('create', () => {
    test('should return visitor object with FunctionExpression method', () => {
      const { context } = createMockContext()
      const visitor = preferArrowCallbackRule.create(context)

      expect(visitor).toHaveProperty('FunctionExpression')
    })
  })

  describe('detecting function expressions', () => {
    test('should report function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createFunctionExpression())

      expect(reports.length).toBe(1)
    })

    test('should report correct message for function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createFunctionExpression())

      expect(reports[0].message).toBe('Use arrow function for callback')
    })

    test('should report multiple function expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(1, 0))
      visitor.FunctionExpression(createFunctionExpression(2, 0))
      visitor.FunctionExpression(createFunctionExpression(3, 0))

      expect(reports.length).toBe(3)
    })
  })

  describe('not reporting arrow functions', () => {
    test('should not report arrow function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createArrowFunctionExpression())

      expect(reports.length).toBe(0)
    })

    test('should not report arrow functions among function expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(1, 0))
      visitor.FunctionExpression(createArrowFunctionExpression(2, 0))
      visitor.FunctionExpression(createFunctionExpression(3, 0))

      expect(reports.length).toBe(2)
    })
  })

  describe('non-function expressions', () => {
    test('should allow identifier expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createIdentifier())

      expect(reports.length).toBe(0)
    })

    test('should handle non-function node types', () => {
      const { context, reports } = createMockContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'foo' },
        arguments: [],
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferArrowCallbackRule.create(context)

      expect(() => visitor.FunctionExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferArrowCallbackRule.create(context)

      expect(() => visitor.FunctionExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferArrowCallbackRule.create(context)

      expect(() => visitor.FunctionExpression('string')).not.toThrow()
      expect(() => visitor.FunctionExpression(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without type property', () => {
      const { context, reports } = createMockContext()
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
      const { context, reports } = createMockContext()
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
      const { context, reports } = createMockContext({})
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
  })

  describe('location reporting', () => {
    test('should report correct location for function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report location with end position', () => {
      const { context, reports } = createMockContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(5, 10))

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })
  })

  describe('message quality', () => {
    test('should mention arrow in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createFunctionExpression())

      expect(reports[0].message).toContain('arrow')
    })

    test('should mention function in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createFunctionExpression())

      expect(reports[0].message).toContain('function')
    })

    test('should mention callback in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createFunctionExpression())

      expect(reports[0].message).toContain('callback')
    })

    test('should have consistent message format', () => {
      const { context, reports } = createMockContext()
      const visitor = preferArrowCallbackRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(1, 0))
      visitor.FunctionExpression(createFunctionExpression(2, 0))

      expect(reports[0].message).toBe('Use arrow function for callback')
      expect(reports[1].message).toBe('Use arrow function for callback')
    })
  })
})
