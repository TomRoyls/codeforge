import { describe, test, expect, vi } from 'vitest'
import { noSparseArraysRule } from '../../../../src/rules/patterns/no-sparse-arrays.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'const arr = [1, , 3];',
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

function createArrayExpression(elements: unknown[], line = 1, column = 0): unknown {
  return {
    type: 'ArrayExpression',
    elements,
    loc: {
      start: { line, column },
      end: { line, column: 10 },
    },
  }
}

function createLiteral(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
  }
}

describe('no-sparse-arrays rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noSparseArraysRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noSparseArraysRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noSparseArraysRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noSparseArraysRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noSparseArraysRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noSparseArraysRule.meta.fixable).toBeUndefined()
    })

    test('should mention sparse in description', () => {
      expect(noSparseArraysRule.meta.docs?.description.toLowerCase()).toContain('sparse')
    })

    test('should mention arrays in description', () => {
      expect(noSparseArraysRule.meta.docs?.description.toLowerCase()).toContain('arrays')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      expect(visitor).toHaveProperty('ArrayExpression')
    })
  })

  describe('valid arrays (no holes)', () => {
    test('should not report array with all elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(
        createArrayExpression([createLiteral(1), createLiteral(2), createLiteral(3)]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report empty array', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([]))

      expect(reports.length).toBe(0)
    })

    test('should not report array with single element', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createLiteral(1)]))

      expect(reports.length).toBe(0)
    })
  })

  describe('invalid arrays (with holes)', () => {
    test('should report sparse array with one hole in middle', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createLiteral(1), null, createLiteral(3)]))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('sparse')
    })

    test('should report sparse array with hole at start', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([null, createLiteral(2), createLiteral(3)]))

      expect(reports.length).toBe(1)
    })

    test('should report sparse array with hole at end', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createLiteral(1), createLiteral(2), null]))

      expect(reports.length).toBe(1)
    })

    test('should report sparse array with multiple holes', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(
        createArrayExpression([createLiteral(1), null, createLiteral(3), null, createLiteral(5)]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report sparse array with consecutive holes', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(
        createArrayExpression([createLiteral(1), null, null, createLiteral(4)]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report array with only holes', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([null, null, null]))

      expect(reports.length).toBe(1)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      expect(() => visitor.ArrayExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      expect(() => visitor.ArrayExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      expect(() => visitor.ArrayExpression('string')).not.toThrow()
      expect(() => visitor.ArrayExpression(123)).not.toThrow()
    })

    test('should handle node without type', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = {
        elements: [createLiteral(1), null, createLiteral(3)],
      }

      expect(() => visitor.ArrayExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        elements: [createLiteral(1), null, createLiteral(3)],
      }

      expect(() => visitor.ArrayExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = {
        type: 'ArrayExpression',
      }

      expect(() => visitor.ArrayExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-array elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: 'not-an-array',
      }

      expect(() => visitor.ArrayExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle null elements array', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: null,
      }

      expect(() => visitor.ArrayExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined elements array', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: undefined,
      }

      expect(() => visitor.ArrayExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [createLiteral(1), null, createLiteral(3)],
      }

      expect(() => visitor.ArrayExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createLiteral(1), null], 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createLiteral(1), null]))

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
        getSource: () => 'const arr = [1, , 3];',
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

      const visitor = noSparseArraysRule.create(context)

      expect(() =>
        visitor.ArrayExpression(createArrayExpression([createLiteral(1), null])),
      ).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })

  describe('message quality', () => {
    test('should mention sparse in error message', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createLiteral(1), null]))

      expect(reports[0].message.toLowerCase()).toContain('sparse')
    })

    test('should mention array in error message', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createLiteral(1), null]))

      expect(reports[0].message.toLowerCase()).toContain('array')
    })

    test('should start with unexpected for sparse arrays', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createLiteral(1), null]))

      expect(reports[0].message).toContain('Unexpected')
    })
  })

  describe('loc edge cases', () => {
    test('should handle loc with non-number line', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [createLiteral(1), null],
        loc: {
          start: { line: 'not-a-number' as unknown as number, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with non-number column', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [createLiteral(1), null],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 'not-a-number' as unknown as number },
        },
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.end.column).toBe(0)
    })

    test('should handle loc with undefined start', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [createLiteral(1), null],
        loc: {
          end: { line: 1, column: 10 },
        },
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle loc with undefined end', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [createLiteral(1), null],
        loc: {
          start: { line: 1, column: 0 },
        },
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [createLiteral(1), null],
        loc: {},
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
    })
  })
})
