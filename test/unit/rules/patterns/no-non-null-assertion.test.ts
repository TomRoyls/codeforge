import { describe, test, expect, vi } from 'vitest'
import { noNonNullAssertionRule } from '../../../../src/rules/patterns/no-non-null-assertion.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'const x = value!;',
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

function createTSNonNullExpression(line = 1, column = 0): unknown {
  return {
    type: 'TSNonNullExpression',
    expression: {
      type: 'Identifier',
      name: 'value',
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createRegularExpression(line = 1, column = 0): unknown {
  return {
    type: 'Identifier',
    name: 'value',
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createMemberExpression(line = 1, column = 0): unknown {
  return {
    type: 'MemberExpression',
    object: {
      type: 'Identifier',
      name: 'obj',
    },
    property: {
      type: 'Identifier',
      name: 'prop',
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

describe('no-non-null-assertion rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noNonNullAssertionRule.meta.type).toBe('suggestion')
    })

    test('should have warning severity', () => {
      expect(noNonNullAssertionRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noNonNullAssertionRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noNonNullAssertionRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noNonNullAssertionRule.meta.schema).toBeDefined()
    })

    test('should be fixable', () => {
      expect(noNonNullAssertionRule.meta.fixable).toBe('code')
    })

    test('should mention non-null assertion in description', () => {
      expect(noNonNullAssertionRule.meta.docs?.description.toLowerCase()).toContain('non-null')
    })

    test('should have empty schema array', () => {
      expect(noNonNullAssertionRule.meta.schema).toEqual([])
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noNonNullAssertionRule.create(context)

      expect(visitor).toHaveProperty('TSNonNullExpression')
    })
  })

  describe('detecting non-null assertions', () => {
    test('should report TSNonNullExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('!')
    })

    test('should report with correct message', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression())

      expect(reports[0].message).toBe("Unexpected use of non-null assertion operator '!'.")
    })
  })

  describe('allowing other expressions', () => {
    test('should not report regular expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createRegularExpression())

      expect(reports.length).toBe(0)
    })

    test('should not report member expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createMemberExpression())

      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should mention ! operator in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression())

      expect(reports[0].message).toContain('!')
    })

    test('should use single quotes around !', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression())

      expect(reports[0].message).toContain("'!'")
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noNonNullAssertionRule.create(context)

      expect(() => visitor.TSNonNullExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noNonNullAssertionRule.create(context)

      expect(() => visitor.TSNonNullExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noNonNullAssertionRule.create(context)

      expect(() => visitor.TSNonNullExpression('string')).not.toThrow()
      expect(() => visitor.TSNonNullExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertionRule.create(context)

      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'Identifier',
          name: 'value',
        },
      }

      expect(() => visitor.TSNonNullExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertionRule.create(context)

      const node = {
        type: 'TSNonNullExpression',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.TSNonNullExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with non-TSNonNullExpression type', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertionRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: {
          type: 'Identifier',
          name: 'console',
        },
        property: {
          type: 'Identifier',
          name: 'log',
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.TSNonNullExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression(10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression())

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
        getSource: () => 'const x = value!;',
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

      const visitor = noNonNullAssertionRule.create(context)

      expect(() => visitor.TSNonNullExpression(createTSNonNullExpression())).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with partial loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertionRule.create(context)

      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'Identifier',
          name: 'value',
        },
        loc: {
          start: { line: 1, column: 0 },
        },
      }

      expect(() => visitor.TSNonNullExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle different expression types', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertionRule.create(context)

      const memberExprNode = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'MemberExpression',
          object: {
            type: 'Identifier',
            name: 'obj',
          },
          property: {
            type: 'Identifier',
            name: 'prop',
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.TSNonNullExpression(memberExprNode)

      expect(reports.length).toBe(1)
    })
  })

  describe('multiple non-null assertions', () => {
    test('should report multiple non-null assertions', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression(1, 0))
      visitor.TSNonNullExpression(createTSNonNullExpression(2, 0))
      visitor.TSNonNullExpression(createTSNonNullExpression(3, 0))

      expect(reports.length).toBe(3)
    })

    test('should report non-null but not regular expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression())
      visitor.TSNonNullExpression(createRegularExpression())
      visitor.TSNonNullExpression(createMemberExpression())

      expect(reports.length).toBe(1)
    })
  })

  describe('additional scenarios', () => {
    test('should handle chained non-null assertions', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertionRule.create(context)

      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'TSNonNullExpression',
          expression: {
            type: 'Identifier',
            name: 'value',
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.TSNonNullExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle call expression with non-null', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonNullAssertionRule.create(context)

      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'Identifier',
            name: 'fn',
          },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.TSNonNullExpression(node)

      expect(reports.length).toBe(1)
    })
  })
})
