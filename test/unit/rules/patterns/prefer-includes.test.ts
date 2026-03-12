import { describe, test, expect, vi } from 'vitest'
import { preferIncludesRule } from '../../../../src/rules/patterns/prefer-includes.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'arr.indexOf(x) >= 0;',
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

function createBinaryExpression(
  left: unknown,
  right: unknown,
  operator: string,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'BinaryExpression',
    left,
    right,
    operator,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createIndexOfCall(objectName: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: objectName,
      },
      property: {
        type: 'Identifier',
        name: 'indexOf',
      },
    },
    arguments: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 25 },
    },
  }
}

function createLiteral(value: number, line = 1, column = 0): unknown {
  return {
    type: 'Literal',
    value,
    loc: {
      start: { line, column },
      end: { line, column: column + 5 },
    },
  }
}

describe('prefer-includes rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferIncludesRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferIncludesRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(preferIncludesRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(preferIncludesRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(preferIncludesRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(preferIncludesRule.meta.fixable).toBeUndefined()
    })

    test('should mention includes in description', () => {
      expect(preferIncludesRule.meta.docs?.description.toLowerCase()).toContain('includes')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = preferIncludesRule.create(context)

      expect(visitor).toHaveProperty('BinaryExpression')
    })
  })

  describe('detecting indexOf >= 0', () => {
    test('should report indexOf >= 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferIncludesRule.create(context)

      const node = createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>=')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('includes')
    })

    test('should report indexOf !== -1', () => {
      const { context, reports } = createMockContext()
      const visitor = preferIncludesRule.create(context)

      const node = createBinaryExpression(createIndexOfCall('arr'), createLiteral(-1), '!==')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report indexOf > -1', () => {
      const { context, reports } = createMockContext()
      const visitor = preferIncludesRule.create(context)

      const node = createBinaryExpression(createIndexOfCall('arr'), createLiteral(-1), '>')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report indexOf < 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferIncludesRule.create(context)

      const node = createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '<')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when left is not indexOf call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferIncludesRule.create(context)

      const node = createBinaryExpression({ type: 'Identifier', name: 'x' }, createLiteral(0), '>=')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when operator is wrong', () => {
      const { context, reports } = createMockContext()
      const visitor = preferIncludesRule.create(context)

      const node = createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '===')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferIncludesRule.create(context)

      expect(() => visitor.BinaryExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferIncludesRule.create(context)

      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferIncludesRule.create(context)

      expect(() => visitor.BinaryExpression('string')).not.toThrow()
      expect(() => visitor.BinaryExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferIncludesRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'arr' },
            property: { type: 'Identifier', name: 'indexOf' },
          },
          arguments: [],
        },
        right: { type: 'Literal', value: 0 },
        operator: '>=',
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferIncludesRule.create(context)

      const node = createBinaryExpression(
        createIndexOfCall('arr', 10, 5),
        createLiteral(0, 10, 20),
        '>=',
        10,
        5,
      )

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
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
        getSource: () => 'arr.indexOf(x) >= 0;',
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

      const visitor = preferIncludesRule.create(context)

      expect(() =>
        visitor.BinaryExpression(
          createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
        ),
      ).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })

  describe('message quality', () => {
    test('should mention includes in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )

      expect(reports[0].message.toLowerCase()).toContain('includes')
    })

    test('should mention readability in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )

      expect(reports[0].message.toLowerCase()).toContain('readable')
    })
  })
})
