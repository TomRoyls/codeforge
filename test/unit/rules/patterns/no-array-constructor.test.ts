import { describe, test, expect, vi } from 'vitest'
import { noArrayConstructorRule } from '../../../../src/rules/patterns/no-array-constructor.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  fix?: { range: [number, number]; text: string }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'new Array();',
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
        fix: descriptor.fix,
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

function createNewExpression(callee: unknown, args: unknown[], line = 1, column = 0): unknown {
  return {
    type: 'NewExpression',
    callee,
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

function createLiteral(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
  }
}

describe('no-array-constructor rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noArrayConstructorRule.meta.type).toBe('problem')
    })

    test('should have warn severity', () => {
      expect(noArrayConstructorRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noArrayConstructorRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noArrayConstructorRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noArrayConstructorRule.meta.schema).toBeDefined()
    })

    test('should be fixable', () => {
      expect(noArrayConstructorRule.meta.fixable).toBe('code')
    })

    test('should mention Array in description', () => {
      expect(noArrayConstructorRule.meta.docs?.description).toContain('Array')
    })

    test('should mention literal in description', () => {
      expect(noArrayConstructorRule.meta.docs?.description.toLowerCase()).toContain('literal')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noArrayConstructorRule.create(context)

      expect(visitor).toHaveProperty('NewExpression')
    })
  })

  describe('detecting Array constructor calls', () => {
    test('should report new Array() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Array'), []))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('[]')
    })

    test('should report new Array(5) with single numeric argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Array'), [createLiteral(5)]))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('length')
    })

    test('should report new Array(1, 2) with multiple arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayConstructorRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('Array'), [createLiteral(1), createLiteral(2)]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('[')
    })

    test('should not report new Other()', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Other'), []))

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noArrayConstructorRule.create(context)

      expect(() => visitor.NewExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noArrayConstructorRule.create(context)

      expect(() => visitor.NewExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noArrayConstructorRule.create(context)

      expect(() => visitor.NewExpression('string')).not.toThrow()
      expect(() => visitor.NewExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Array'),
        arguments: [],
      }

      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Array'), [], 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noArrayConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Array'), []))

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
        getSource: () => 'new Array();',
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

      const visitor = noArrayConstructorRule.create(context)

      expect(() =>
        visitor.NewExpression(createNewExpression(createIdentifier('Array'), [])),
      ).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })

  describe('message quality', () => {
    test('should mention literal for no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Array'), []))

      expect(reports[0].message).toContain('[]')
    })

    test('should mention length for single numeric argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Array'), [createLiteral(5)]))

      expect(reports[0].message.toLowerCase()).toContain('length')
    })

    test('should mention array literal for multiple arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayConstructorRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('Array'), [createLiteral(1), createLiteral(2)]),
      )

      expect(reports[0].message).toContain('[')
    })
  })

  describe('loc edge cases', () => {
    test('should handle loc with non-number line', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Array'),
        arguments: [],
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
      const { context, reports } = createMockContext()
      const visitor = noArrayConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Array'),
        arguments: [],
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
      const { context, reports } = createMockContext()
      const visitor = noArrayConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Array'),
        arguments: [],
        loc: {
          end: { line: 1, column: 10 },
        },
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle loc with undefined end', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Array'),
        arguments: [],
        loc: {
          start: { line: 1, column: 0 },
        },
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Array'),
        arguments: [],
        loc: {},
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('auto-fix', () => {
    test('should provide fix for new Array()', () => {
      const source = 'new Array()'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = noArrayConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Array'),
        arguments: [],
        range: [0, 11] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 11 } },
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('[]')
      expect(reports[0].fix?.range).toEqual([0, 11])
    })

    test('should provide fix for new Array(1, 2, 3)', () => {
      const source = 'new Array(1, 2, 3)'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = noArrayConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Array'),
        arguments: [
          { type: 'Literal', value: 1, range: [10, 11] },
          { type: 'Literal', value: 2, range: [13, 14] },
          { type: 'Literal', value: 3, range: [16, 17] },
        ],
        range: [0, 18] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 18 } },
      }

      visitor.NewExpression(node)

      expect(reports[0].fix?.text).toBe('[1, 2, 3]')
    })

    test('should NOT provide fix for new Array(5) with single argument', () => {
      const source = 'new Array(5)'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = noArrayConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Array'),
        arguments: [{ type: 'Literal', value: 5, range: [10, 11] }],
        range: [0, 12] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })
  })
})
