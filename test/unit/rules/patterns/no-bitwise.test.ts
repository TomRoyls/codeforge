import { describe, test, expect, vi } from 'vitest'
import { noBitwiseRule } from '../../../../src/rules/patterns/no-bitwise.js'
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
    config: { rules: { 'no-bitwise': ['error', options] } },
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

function createBinaryExpression(operator: string, lineNumber = 1, column = 0): unknown {
  return {
    type: 'BinaryExpression',
    operator: operator,
    left: { type: 'Identifier', name: 'x' },
    right: { type: 'Identifier', name: 'y' },
    loc: {
      start: { line: lineNumber, column },
      end: { line: lineNumber, column: operator.length + 5 },
    },
  }
}

function createUnaryExpression(operator: string, lineNumber = 1, column = 0): unknown {
  return {
    type: 'UnaryExpression',
    operator: operator,
    argument: { type: 'Identifier', name: 'x' },
    loc: {
      start: { line: lineNumber, column },
      end: { line: lineNumber, column: operator.length + 2 },
    },
  }
}

function createAssignmentExpression(operator: string, lineNumber = 1, column = 0): unknown {
  return {
    type: 'AssignmentExpression',
    operator: operator,
    left: { type: 'Identifier', name: 'x' },
    right: { type: 'Identifier', name: 'y' },
    loc: {
      start: { line: lineNumber, column },
      end: { line: lineNumber, column: operator.length + 3 },
    },
  }
}

describe('no-bitwise rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noBitwiseRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noBitwiseRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noBitwiseRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noBitwiseRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noBitwiseRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noBitwiseRule.meta.fixable).toBeUndefined()
    })

    test('should mention bitwise operators in description', () => {
      const desc = noBitwiseRule.meta.docs?.description.toLowerCase()
      expect(desc).toMatch(/bitwise/)
    })
  })

  describe('create', () => {
    test('should return visitor object with BinaryExpression method', () => {
      const { context } = createMockContext()
      const visitor = noBitwiseRule.create(context)

      expect(visitor).toHaveProperty('BinaryExpression')
    })

    test('should return visitor object with UnaryExpression method', () => {
      const { context } = createMockContext()
      const visitor = noBitwiseRule.create(context)

      expect(visitor).toHaveProperty('UnaryExpression')
    })

    test('should return visitor object with AssignmentExpression method', () => {
      const { context } = createMockContext()
      const visitor = noBitwiseRule.create(context)

      expect(visitor).toHaveProperty('AssignmentExpression')
    })
  })

  describe('detecting bitwise AND (&)', () => {
    test('should report bitwise AND operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('&'))

      expect(reports.length).toBe(1)
    })

    test('should report correct message for & operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('&'))

      expect(reports[0].message).toContain("Unexpected use of bitwise operator '&'")
      expect(reports[0].message).toContain('&&')
    })
  })

  describe('detecting bitwise OR (|)', () => {
    test('should report bitwise OR operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('|'))

      expect(reports.length).toBe(1)
    })

    test('should report correct message for | operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('|'))

      expect(reports[0].message).toContain("Unexpected use of bitwise operator '|'")
      expect(reports[0].message).toContain('||')
    })
  })

  describe('detecting bitwise XOR (^)', () => {
    test('should report bitwise XOR operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('^'))

      expect(reports.length).toBe(1)
    })

    test('should report correct message for ^ operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('^'))

      expect(reports[0].message).toContain("Unexpected use of bitwise operator '^'")
    })
  })

  describe('detecting bitwise NOT (~)', () => {
    test('should report bitwise NOT operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noBitwiseRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('~'))

      expect(reports.length).toBe(1)
    })

    test('should report correct message for ~ operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noBitwiseRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('~'))

      expect(reports[0].message).toContain("Unexpected use of bitwise NOT operator '~'")
    })
  })

  describe('detecting shift operators', () => {
    test('should report left shift operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('<<'))

      expect(reports.length).toBe(1)
    })

    test('should report right shift operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('>>'))

      expect(reports.length).toBe(1)
    })

    test('should report unsigned right shift operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('>>>'))

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting bitwise assignment operators', () => {
    test('should report bitwise AND assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noBitwiseRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('&='))

      expect(reports.length).toBe(1)
    })

    test('should report bitwise OR assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noBitwiseRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('|='))

      expect(reports.length).toBe(1)
    })

    test('should report bitwise XOR assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noBitwiseRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('^='))

      expect(reports.length).toBe(1)
    })

    test('should report left shift assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noBitwiseRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('<<='))

      expect(reports.length).toBe(1)
    })

    test('should report right shift assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noBitwiseRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('>>='))

      expect(reports.length).toBe(1)
    })

    test('should report unsigned right shift assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noBitwiseRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('>>>='))

      expect(reports.length).toBe(1)
    })
  })

  describe('allow option', () => {
    test('should not report allowed operators', () => {
      const { context, reports } = createMockContext({ allow: ['&', '|'] })
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('&'))
      visitor.BinaryExpression(createBinaryExpression('|'))

      expect(reports.length).toBe(0)
    })

    test('should still report non-allowed operators when some are allowed', () => {
      const { context, reports } = createMockContext({ allow: ['&'] })
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('&'))
      visitor.BinaryExpression(createBinaryExpression('|'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('|')
    })

    test('should allow shift operators', () => {
      const { context, reports } = createMockContext({ allow: ['<<', '>>', '>>>'] })
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('<<'))
      visitor.BinaryExpression(createBinaryExpression('>>'))
      visitor.BinaryExpression(createBinaryExpression('>>>'))

      expect(reports.length).toBe(0)
    })
  })

  describe('not reporting non-bitwise operators', () => {
    test('should not report logical AND operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('&&'))

      expect(reports.length).toBe(0)
    })

    test('should not report logical OR operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('||'))

      expect(reports.length).toBe(0)
    })

    test('should not report regular assignment operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noBitwiseRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('='))

      expect(reports.length).toBe(0)
    })

    test('should not report arithmetic operators', () => {
      const { context, reports } = createMockContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('+'))
      visitor.BinaryExpression(createBinaryExpression('-'))
      visitor.BinaryExpression(createBinaryExpression('*'))

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noBitwiseRule.create(context)

      expect(() => visitor.BinaryExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noBitwiseRule.create(context)

      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noBitwiseRule.create(context)

      expect(() => visitor.BinaryExpression('string')).not.toThrow()
      expect(() => visitor.BinaryExpression(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without operator property', () => {
      const { context, reports } = createMockContext()
      const visitor = noBitwiseRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'y' },
      }
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle empty allow option', () => {
      const { context, reports } = createMockContext({ allow: [] })
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('&'))

      expect(reports.length).toBe(1)
    })

    test('should handle undefined allow option', () => {
      const { context, reports } = createMockContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('&'))

      expect(reports.length).toBe(1)
    })

    test('should handle empty rule config', () => {
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
        getSource: () => 'x & y',
        getTokens: () => [],
        getComments: () => [],
        config: { rules: {} },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noBitwiseRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('&'))

      expect(reports.length).toBe(1)
    })
  })

  describe('location reporting', () => {
    test('should report correct location for bitwise operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('&', 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report location with end position', () => {
      const { context, reports } = createMockContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('|', 5, 10))

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })
  })

  describe('message quality', () => {
    test('should mention the operator in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('&'))

      expect(reports[0].message).toContain('&')
    })

    test('should suggest logical AND for bitwise AND', () => {
      const { context, reports } = createMockContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('&'))

      expect(reports[0].message).toContain('&&')
    })

    test('should suggest logical OR for bitwise OR', () => {
      const { context, reports } = createMockContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('|'))

      expect(reports[0].message).toContain('||')
    })

    test('should mention bitwise in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('^'))

      expect(reports[0].message).toContain('bitwise')
    })
  })
})
