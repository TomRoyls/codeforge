import { describe, test, expect, beforeEach, vi } from 'vitest'
import { noUnsafeTypeAssertionRule } from '../../../../src/rules/security/no-unsafe-type-assertion.js'
import type { RuleContext, RuleVisitor } from '../../../../src/plugins/types.js'

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

function createAsExpression(
  targetType: string,
  expressionType?: string,
  line = 1,
  column = 0,
): unknown {
  const typeAnnotation =
    targetType === 'any'
      ? { type: 'TSAnyKeyword' }
      : targetType === 'unknown'
        ? { type: 'TSUnknownKeyword' }
        : { type: 'TSTypeReference', typeName: { type: 'Identifier', name: targetType } }

  const expression = expressionType
    ? {
        type: 'Identifier',
        name: 'value',
        typeAnnotation:
          expressionType === 'any'
            ? { type: 'TSAnyKeyword' }
            : expressionType === 'unknown'
              ? { type: 'TSUnknownKeyword' }
              : { type: 'TSTypeReference', typeName: { type: 'Identifier', name: expressionType } },
      }
    : { type: 'Identifier', name: 'value' }

  return {
    type: 'TSAsExpression',
    typeAnnotation,
    expression,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createAngleBracketAssertion(targetType: string, line = 1, column = 0): unknown {
  const typeAnnotation =
    targetType === 'any'
      ? { type: 'TSAnyKeyword' }
      : targetType === 'unknown'
        ? { type: 'TSUnknownKeyword' }
        : { type: 'TSTypeReference', typeName: { type: 'Identifier', name: targetType } }

  return {
    type: 'TSTypeAssertion',
    typeAnnotation,
    expression: { type: 'Identifier', name: 'value' },
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createDoubleAssertion(
  intermediateType: string,
  targetType: string,
  line = 1,
  column = 0,
): unknown {
  const outerTypeAnnotation =
    targetType === 'any'
      ? { type: 'TSAnyKeyword' }
      : targetType === 'unknown'
        ? { type: 'TSUnknownKeyword' }
        : { type: 'TSTypeReference', typeName: { type: 'Identifier', name: targetType } }

  const innerTypeAnnotation =
    intermediateType === 'any'
      ? { type: 'TSAnyKeyword' }
      : intermediateType === 'unknown'
        ? { type: 'TSUnknownKeyword' }
        : { type: 'TSTypeReference', typeName: { type: 'Identifier', name: intermediateType } }

  return {
    type: 'TSAsExpression',
    typeAnnotation: outerTypeAnnotation,
    expression: {
      type: 'TSAsExpression',
      typeAnnotation: innerTypeAnnotation,
      expression: { type: 'Identifier', name: 'value' },
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function createSafeAssertion(targetType: string, line = 1, column = 0): unknown {
  return {
    type: 'TSAsExpression',
    typeAnnotation: { type: 'TSTypeReference', typeName: { type: 'Identifier', name: targetType } },
    expression: { type: 'Identifier', name: 'value' },
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

describe('no-unsafe-type-assertion rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noUnsafeTypeAssertionRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noUnsafeTypeAssertionRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noUnsafeTypeAssertionRule.meta.docs?.recommended).toBe(true)
    })

    test('should have security category', () => {
      expect(noUnsafeTypeAssertionRule.meta.docs?.category).toBe('security')
    })

    test('should have schema defined', () => {
      expect(noUnsafeTypeAssertionRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noUnsafeTypeAssertionRule.meta.fixable).toBeUndefined()
    })

    test('should mention type assertions in description', () => {
      expect(noUnsafeTypeAssertionRule.meta.docs?.description.toLowerCase()).toContain(
        'type assertion',
      )
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)

      expect(visitor).toHaveProperty('TSAsExpression')
      expect(visitor).toHaveProperty('TSTypeAssertion')
    })
  })

  describe('casting to any', () => {
    test('should report casting to any using as syntax', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)

      visitor.TSAsExpression(createAsExpression('any'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Unsafe type assertion')
      expect(reports[0].message).toContain('any')
    })

    test('should report casting to any using angle-bracket syntax', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)

      visitor.TSTypeAssertion(createAngleBracketAssertion('any'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('<>')
    })

    test('should mention bypasses type safety', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)

      visitor.TSAsExpression(createAsExpression('any'))

      expect(reports[0].message).toContain('bypasses type safety')
    })
  })

  describe('casting from any', () => {
    test('should report casting from any to specific type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)

      visitor.TSAsExpression(createAsExpression('MyType', 'any'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('from any')
    })
  })

  describe('casting from unknown', () => {
    test('should report casting from unknown to specific type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)

      visitor.TSAsExpression(createAsExpression('MyType', 'unknown'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('from unknown')
    })

    test('should mention type guards or validation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)

      visitor.TSAsExpression(createAsExpression('MyType', 'unknown'))

      expect(reports[0].message).toMatch(/type guards|validation/)
    })
  })

  describe('double assertions', () => {
    test('should report double assertion via unknown', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)

      visitor.TSAsExpression(createDoubleAssertion('unknown', 'string'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('double type assertion')
      expect(reports[0].message).toContain('unknown')
    })

    test('should not report double assertion via other types', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)

      visitor.TSAsExpression(createDoubleAssertion('object', 'string'))

      expect(reports.length).toBe(0)
    })
  })

  describe('safe assertions', () => {
    test('should not report safe type assertions', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)

      visitor.TSAsExpression(createSafeAssertion('MyType'))

      expect(reports.length).toBe(0)
    })

    test('should not report casting to unknown', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)

      visitor.TSAsExpression(createAsExpression('unknown'))

      expect(reports.length).toBe(0)
    })
  })

  describe('options - allowAnyToUnknown', () => {
    test('should allow any to unknown when option is true', () => {
      const { context, reports } = createMockContext({ allowAnyToUnknown: true })
      const visitor = noUnsafeTypeAssertionRule.create(context)

      visitor.TSAsExpression(createAsExpression('unknown', 'any'))

      expect(reports.length).toBe(0)
    })

    test('should report any to unknown when option is false', () => {
      const { context, reports } = createMockContext({ allowAnyToUnknown: false })
      const visitor = noUnsafeTypeAssertionRule.create(context)

      visitor.TSAsExpression(createAsExpression('unknown', 'any'))

      expect(reports.length).toBe(1)
    })
  })

  describe('options - allowUnknownToAny', () => {
    test('should allow unknown to any when option is true', () => {
      const { context, reports } = createMockContext({ allowUnknownToAny: true })
      const visitor = noUnsafeTypeAssertionRule.create(context)

      visitor.TSAsExpression(createAsExpression('any', 'unknown'))

      expect(reports.length).toBe(0)
    })

    test('should report unknown to any when option is false', () => {
      const { context, reports } = createMockContext({ allowUnknownToAny: false })
      const visitor = noUnsafeTypeAssertionRule.create(context)

      visitor.TSAsExpression(createAsExpression('any', 'unknown'))

      expect(reports.length).toBe(1)
    })
  })

  describe('options - reportRedundant', () => {
    test('should report redundant cast when option is true', () => {
      const { context, reports } = createMockContext({ reportRedundant: true })
      const visitor = noUnsafeTypeAssertionRule.create(context)

      visitor.TSAsExpression(createDoubleAssertion('MyType', 'MyType'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Redundant')
    })

    test('should not report redundant cast when option is false', () => {
      const { context, reports } = createMockContext({ reportRedundant: false })
      const visitor = noUnsafeTypeAssertionRule.create(context)

      visitor.TSAsExpression(createDoubleAssertion('MyType', 'MyType'))

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully in TSAsExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)

      expect(() => visitor.TSAsExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully in TSAsExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)

      expect(() => visitor.TSAsExpression(undefined)).not.toThrow()
    })

    test('should handle null node gracefully in TSTypeAssertion', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)

      expect(() => visitor.TSTypeAssertion(null)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)

      expect(() => visitor.TSAsExpression('string')).not.toThrow()
      expect(() => visitor.TSAsExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)

      const node = {
        type: 'TSAsExpression',
        typeAnnotation: { type: 'TSAnyKeyword' },
        expression: { type: 'Identifier', name: 'value' },
      }

      expect(() => visitor.TSAsExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without typeAnnotation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)

      const node = {
        type: 'TSAsExpression',
        expression: { type: 'Identifier', name: 'value' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.TSAsExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)

      const node = {
        type: 'TSAsExpression',
        typeAnnotation: { type: 'TSAnyKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.TSAsExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)

      visitor.TSAsExpression(createAsExpression('any', undefined, 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noUnsafeTypeAssertionRule.create(context)

      visitor.TSAsExpression(createAsExpression('any'))

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
        getSource: () => 'const x = 1;',
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

      const visitor = noUnsafeTypeAssertionRule.create(context)

      expect(() => visitor.TSAsExpression(createAsExpression('any'))).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle TSTypeAssertion with unknown type annotation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)

      const node = {
        type: 'TSTypeAssertion',
        typeAnnotation: { type: 'TSUnknownKeyword' },
        expression: { type: 'Identifier', name: 'value' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.TSTypeAssertion(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle type annotation with Identifier type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)

      const node = {
        type: 'TSAsExpression',
        typeAnnotation: { type: 'Identifier', name: 'MyType' },
        expression: { type: 'Identifier', name: 'value' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.TSAsExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle double assertion with angle-bracket inner', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)

      const node = {
        type: 'TSAsExpression',
        typeAnnotation: {
          type: 'TSTypeReference',
          typeName: { type: 'Identifier', name: 'string' },
        },
        expression: {
          type: 'TSTypeAssertion',
          typeAnnotation: { type: 'TSUnknownKeyword' },
          expression: { type: 'Identifier', name: 'value' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      expect(() => visitor.TSAsExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('double type assertion')
    })

    test('should handle TSTypeReference without typeName', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)

      const node = {
        type: 'TSAsExpression',
        typeAnnotation: { type: 'TSTypeReference' },
        expression: { type: 'Identifier', name: 'value' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.TSAsExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should suggest type guards in unsafe assertion message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)

      visitor.TSAsExpression(createAsExpression('any'))

      expect(reports[0].message).toContain('type guards')
    })

    test('should suggest validation in unsafe assertion message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)

      visitor.TSAsExpression(createAsExpression('any'))

      expect(reports[0].message).toContain('validation')
    })

    test('should mention bypasses type safety in double assertion', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)

      visitor.TSAsExpression(createDoubleAssertion('unknown', 'string'))

      expect(reports[0].message).toContain('bypasses type safety')
    })
  })
})
