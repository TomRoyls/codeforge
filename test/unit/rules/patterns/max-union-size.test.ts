import { describe, test, expect, vi } from 'vitest'
import { maxUnionSizeRule } from '../../../../src/rules/patterns/max-union-size.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'type X = A | B | C;',
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

function createUnionType(typeCount: number, line = 1, column = 0): unknown {
  const types = []
  for (let i = 0; i < typeCount; i++) {
    types.push({
      type: 'TSTypeReference',
      typeName: {
        type: 'Identifier',
        name: `Type${i}`,
      },
    })
  }

  return {
    type: 'TSUnionType',
    types,
    loc: {
      start: { line, column },
      end: { line, column: column + 50 },
    },
  }
}

function createNonUnionType(line = 1, column = 0): unknown {
  return {
    type: 'TSTypeReference',
    typeName: {
      type: 'Identifier',
      name: 'SomeType',
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

describe('max-union-size rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(maxUnionSizeRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(maxUnionSizeRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(maxUnionSizeRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(maxUnionSizeRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(maxUnionSizeRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(maxUnionSizeRule.meta.fixable).toBeUndefined()
    })

    test('should mention union in description', () => {
      expect(maxUnionSizeRule.meta.docs?.description.toLowerCase()).toContain('union')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = maxUnionSizeRule.create(context)

      expect(visitor).toHaveProperty('TSUnionType')
    })
  })

  describe('detecting large unions', () => {
    test('should report union with more than 5 types (default)', () => {
      const { context, reports } = createMockContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(6))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('6')
      expect(reports[0].message).toContain('5')
    })

    test('should report union with many types', () => {
      const { context, reports } = createMockContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(10))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('10')
    })

    test('should not report union with exactly 5 types (default)', () => {
      const { context, reports } = createMockContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(5))

      expect(reports.length).toBe(0)
    })

    test('should not report union with fewer than 5 types (default)', () => {
      const { context, reports } = createMockContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(3))

      expect(reports.length).toBe(0)
    })

    test('should not report non-union types', () => {
      const { context, reports } = createMockContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createNonUnionType())

      expect(reports.length).toBe(0)
    })
  })

  describe('options - max', () => {
    test('should respect custom max value', () => {
      const { context, reports } = createMockContext({ max: 3 })
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(4))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('4')
      expect(reports[0].message).toContain('3')
    })

    test('should not report when union size equals custom max', () => {
      const { context, reports } = createMockContext({ max: 3 })
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(3))

      expect(reports.length).toBe(0)
    })

    test('should not report when union size is less than custom max', () => {
      const { context, reports } = createMockContext({ max: 10 })
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(8))

      expect(reports.length).toBe(0)
    })

    test('should handle max value of 1', () => {
      const { context, reports } = createMockContext({ max: 1 })
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(2))

      expect(reports.length).toBe(1)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = maxUnionSizeRule.create(context)

      expect(() => visitor.TSUnionType(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = maxUnionSizeRule.create(context)

      expect(() => visitor.TSUnionType(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = maxUnionSizeRule.create(context)

      expect(() => visitor.TSUnionType('string')).not.toThrow()
      expect(() => visitor.TSUnionType(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = maxUnionSizeRule.create(context)

      const node = {
        type: 'TSUnionType',
        types: [
          { type: 'TSTypeReference', typeName: { type: 'Identifier', name: 'A' } },
          { type: 'TSTypeReference', typeName: { type: 'Identifier', name: 'B' } },
          { type: 'TSTypeReference', typeName: { type: 'Identifier', name: 'C' } },
          { type: 'TSTypeReference', typeName: { type: 'Identifier', name: 'D' } },
          { type: 'TSTypeReference', typeName: { type: 'Identifier', name: 'E' } },
          { type: 'TSTypeReference', typeName: { type: 'Identifier', name: 'F' } },
        ],
      }

      expect(() => visitor.TSUnionType(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(6, 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(6))

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
        getSource: () => 'type X = A | B | C;',
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

      const visitor = maxUnionSizeRule.create(context)

      expect(() => visitor.TSUnionType(createUnionType(6))).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without types array', () => {
      const { context, reports } = createMockContext()
      const visitor = maxUnionSizeRule.create(context)

      const node = {
        type: 'TSUnionType',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.TSUnionType(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with empty types array', () => {
      const { context, reports } = createMockContext()
      const visitor = maxUnionSizeRule.create(context)

      const node = {
        type: 'TSUnionType',
        types: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.TSUnionType(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should mention union in message', () => {
      const { context, reports } = createMockContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(6))

      expect(reports[0].message.toLowerCase()).toContain('union')
    })

    test('should mention member count in message', () => {
      const { context, reports } = createMockContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(8))

      expect(reports[0].message).toContain('8')
    })

    test('should mention maximum in message', () => {
      const { context, reports } = createMockContext({ max: 3 })
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(4))

      expect(reports[0].message.toLowerCase()).toContain('maximum')
    })

    test('should suggest refactoring in message', () => {
      const { context, reports } = createMockContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(6))

      expect(reports[0].message.toLowerCase()).toContain('refactor')
    })
  })
})
