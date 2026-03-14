import { describe, test, expect, vi } from 'vitest'
import { noExplicitAnyRule } from '../../../../src/rules/patterns/no-explicit-any.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'const x: any = 1;',
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

function createAnyKeywordNode(line = 1, column = 0): unknown {
  return {
    type: 'TSAnyKeyword',
    loc: {
      start: { line, column },
      end: { line, column: column + 3 },
    },
  }
}

function createArrayTypeWithAny(line = 1, column = 0): unknown {
  return {
    type: 'TSArrayType',
    elementType: {
      type: 'TSAnyKeyword',
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 5 },
    },
  }
}

function createAsExpressionWithAny(line = 1, column = 0): unknown {
  return {
    type: 'TSAsExpression',
    typeAnnotation: {
      type: 'TSAnyKeyword',
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createTypeAssertionWithAny(line = 1, column = 0): unknown {
  return {
    type: 'TSTypeAssertion',
    typeAnnotation: {
      type: 'TSAnyKeyword',
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createStringTypeNode(line = 1, column = 0): unknown {
  return {
    type: 'TSStringKeyword',
    loc: {
      start: { line, column },
      end: { line, column: column + 6 },
    },
  }
}

describe('no-explicit-any rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noExplicitAnyRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noExplicitAnyRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noExplicitAnyRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noExplicitAnyRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noExplicitAnyRule.meta.schema).toBeDefined()
    })

    test('should be fixable', () => {
      expect(noExplicitAnyRule.meta.fixable).toBe('code')
    })

    test('should mention any in description', () => {
      expect(noExplicitAnyRule.meta.docs?.description.toLowerCase()).toContain('any')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noExplicitAnyRule.create(context)

      expect(visitor).toHaveProperty('TSAnyKeyword')
      expect(visitor).toHaveProperty('TSArrayType')
      expect(visitor).toHaveProperty('TSAsExpression')
      expect(visitor).toHaveProperty('TSTypeAssertion')
    })
  })

  describe('detecting any usage', () => {
    test('should report TSAnyKeyword', () => {
      const { context, reports } = createMockContext()
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNode())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('any')
    })

    test('should report array with any element type', () => {
      const { context, reports } = createMockContext()
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSArrayType(createArrayTypeWithAny())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('any')
    })

    test('should report as expression with any', () => {
      const { context, reports } = createMockContext()
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAsExpression(createAsExpressionWithAny())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('any')
    })

    test('should report type assertion with any', () => {
      const { context, reports } = createMockContext()
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSTypeAssertion(createTypeAssertionWithAny())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('any')
    })

    test('should not report non-any types', () => {
      const { context, reports } = createMockContext()
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createStringTypeNode())

      expect(reports.length).toBe(0)
    })
  })

  describe('options - allowInGenericArrays', () => {
    test('should allow any in arrays when option is true', () => {
      const { context, reports } = createMockContext({ allowInGenericArrays: true })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSArrayType(createArrayTypeWithAny())

      expect(reports.length).toBe(0)
    })

    test('should still report any keyword even when allowInGenericArrays is true', () => {
      const { context, reports } = createMockContext({ allowInGenericArrays: true })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNode())

      expect(reports.length).toBe(1)
    })
  })

  describe('options - allowAsTypeAssertion', () => {
    test('should allow type assertion to any when option is true', () => {
      const { context, reports } = createMockContext({ allowAsTypeAssertion: true })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAsExpression(createAsExpressionWithAny())

      expect(reports.length).toBe(0)
    })

    test('should allow TSTypeAssertion to any when option is true', () => {
      const { context, reports } = createMockContext({ allowAsTypeAssertion: true })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSTypeAssertion(createTypeAssertionWithAny())

      expect(reports.length).toBe(0)
    })

    test('should still report any keyword even when allowAsTypeAssertion is true', () => {
      const { context, reports } = createMockContext({ allowAsTypeAssertion: true })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNode())

      expect(reports.length).toBe(1)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noExplicitAnyRule.create(context)

      expect(() => visitor.TSAnyKeyword(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noExplicitAnyRule.create(context)

      expect(() => visitor.TSAnyKeyword(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noExplicitAnyRule.create(context)

      expect(() => visitor.TSAnyKeyword('string')).not.toThrow()
      expect(() => visitor.TSAnyKeyword(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noExplicitAnyRule.create(context)

      const node = {
        type: 'TSAnyKeyword',
      }

      expect(() => visitor.TSAnyKeyword(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNode(10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNode())

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
        getSource: () => 'const x: any = 1;',
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

      const visitor = noExplicitAnyRule.create(context)

      expect(() => visitor.TSAnyKeyword(createAnyKeywordNode())).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with partial loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noExplicitAnyRule.create(context)

      const node = {
        type: 'TSAnyKeyword',
        loc: {
          start: { line: 1, column: 0 },
        },
      }

      expect(() => visitor.TSAnyKeyword(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle array type without element type', () => {
      const { context, reports } = createMockContext()
      const visitor = noExplicitAnyRule.create(context)

      const node = {
        type: 'TSArrayType',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.TSArrayType(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle as expression without type annotation', () => {
      const { context, reports } = createMockContext()
      const visitor = noExplicitAnyRule.create(context)

      const node = {
        type: 'TSAsExpression',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.TSAsExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should mention type safety in any keyword message', () => {
      const { context, reports } = createMockContext()
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNode())

      expect(reports[0].message.toLowerCase()).toContain('type')
    })

    test('should mention array type in array message', () => {
      const { context, reports } = createMockContext()
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSArrayType(createArrayTypeWithAny())

      expect(reports[0].message.toLowerCase()).toContain('array')
    })

    test('should mention type assertion in assertion message', () => {
      const { context, reports } = createMockContext()
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAsExpression(createAsExpressionWithAny())

      expect(reports[0].message.toLowerCase()).toContain('assertion')
    })
  })
})
