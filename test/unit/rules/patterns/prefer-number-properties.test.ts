import { describe, test, expect, vi } from 'vitest'
import { preferNumberPropertiesRule } from '../../../../src/rules/patterns/prefer-number-properties.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'x === NaN;',
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
  operator: string,
  left: unknown,
  right: unknown,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'BinaryExpression',
    operator,
    left,
    right,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

function createMemberExpression(object: string, property: string): unknown {
  return {
    type: 'MemberExpression',
    object: createIdentifier(object),
    property: createIdentifier(property),
    computed: false,
  }
}

describe('prefer-number-properties rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferNumberPropertiesRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferNumberPropertiesRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(preferNumberPropertiesRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(preferNumberPropertiesRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(preferNumberPropertiesRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(preferNumberPropertiesRule.meta.fixable).toBeUndefined()
    })

    test('should mention Number.isNaN in description', () => {
      expect(preferNumberPropertiesRule.meta.docs?.description).toContain('Number.isNaN')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = preferNumberPropertiesRule.create(context)

      expect(visitor).toHaveProperty('BinaryExpression')
    })
  })

  describe('detecting NaN comparisons', () => {
    test('should report x === NaN', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('===', createIdentifier('x'), createIdentifier('NaN'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Number.isNaN')
    })

    test('should report NaN === x', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('===', createIdentifier('NaN'), createIdentifier('x'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report x == NaN', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('==', createIdentifier('x'), createIdentifier('NaN'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report x !== NaN', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('!==', createIdentifier('x'), createIdentifier('NaN'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('!Number.isNaN')
    })

    test('should report x != NaN', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('!=', createIdentifier('x'), createIdentifier('NaN'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report x === Number.NaN', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createIdentifier('x'),
        createMemberExpression('Number', 'NaN'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report Number.NaN === x', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createMemberExpression('Number', 'NaN'),
        createIdentifier('x'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting Infinity comparisons', () => {
    test('should report x === Infinity', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createIdentifier('x'),
        createIdentifier('Infinity'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Number.isFinite')
    })

    test('should report Infinity === x', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createIdentifier('Infinity'),
        createIdentifier('x'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report x !== Infinity', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '!==',
        createIdentifier('x'),
        createIdentifier('Infinity'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('!Number.isFinite')
    })

    test('should report x === Number.POSITIVE_INFINITY', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createIdentifier('x'),
        createMemberExpression('Number', 'POSITIVE_INFINITY'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report x === Number.NEGATIVE_INFINITY', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createIdentifier('x'),
        createMemberExpression('Number', 'NEGATIVE_INFINITY'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('not reporting valid comparisons', () => {
    test('should not report x === 5', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('===', createIdentifier('x'), {
        type: 'Literal',
        value: 5,
      })

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x === y', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('===', createIdentifier('x'), createIdentifier('y'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x > 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('>', createIdentifier('x'), { type: 'Literal', value: 0 })

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x + y', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('+', createIdentifier('x'), createIdentifier('y'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x === undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createIdentifier('x'),
        createIdentifier('undefined'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x === null', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('===', createIdentifier('x'), {
        type: 'Literal',
        value: null,
      })

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferNumberPropertiesRule.create(context)

      expect(() => visitor.BinaryExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferNumberPropertiesRule.create(context)

      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferNumberPropertiesRule.create(context)

      expect(() => visitor.BinaryExpression('string')).not.toThrow()
      expect(() => visitor.BinaryExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberPropertiesRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: createIdentifier('x'),
        right: createIdentifier('NaN'),
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createIdentifier('x'),
        createIdentifier('NaN'),
        25,
        10,
      )

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(25)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(1)
    })

    test('should handle node without operator', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberPropertiesRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createIdentifier('x'),
        right: createIdentifier('NaN'),
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without left/right', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberPropertiesRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '===',
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
    })
  })

  describe('message quality', () => {
    test('should mention Number.isNaN for NaN comparison', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports[0].message).toContain('Number.isNaN')
    })

    test('should mention !Number.isNaN for negative NaN comparison', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('!==', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports[0].message).toContain('!Number.isNaN')
    })

    test('should mention Number.isFinite for Infinity comparison', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('Infinity')),
      )

      expect(reports[0].message).toContain('Number.isFinite')
    })

    test('should mention that NaN comparisons return false', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports[0].message.toLowerCase()).toContain('false')
    })
  })
})
