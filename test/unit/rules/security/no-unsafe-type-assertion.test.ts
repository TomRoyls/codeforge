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

  describe('rule metadata expanded', () => {
    test('should have a docs object', () => {
      expect(noUnsafeTypeAssertionRule.meta.docs).toBeDefined()
      expect(typeof noUnsafeTypeAssertionRule.meta.docs).toBe('object')
    })

    test('should have a docs description string', () => {
      expect(typeof noUnsafeTypeAssertionRule.meta.docs?.description).toBe('string')
      expect(noUnsafeTypeAssertionRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have a docs url', () => {
      expect(noUnsafeTypeAssertionRule.meta.docs?.url).toBeDefined()
      expect(typeof noUnsafeTypeAssertionRule.meta.docs?.url).toBe('string')
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(noUnsafeTypeAssertionRule.meta.schema)).toBe(true)
    })

    test('should have allowAnyToUnknown in schema properties', () => {
      const schema = noUnsafeTypeAssertionRule.meta.schema as Array<Record<string, unknown>>
      const props = (schema[0] as Record<string, unknown>)?.properties as Record<string, unknown>
      expect(props).toHaveProperty('allowAnyToUnknown')
    })

    test('should have allowUnknownToAny in schema properties', () => {
      const schema = noUnsafeTypeAssertionRule.meta.schema as Array<Record<string, unknown>>
      const props = (schema[0] as Record<string, unknown>)?.properties as Record<string, unknown>
      expect(props).toHaveProperty('allowUnknownToAny')
    })

    test('should have reportRedundant in schema properties', () => {
      const schema = noUnsafeTypeAssertionRule.meta.schema as Array<Record<string, unknown>>
      const props = (schema[0] as Record<string, unknown>)?.properties as Record<string, unknown>
      expect(props).toHaveProperty('reportRedundant')
    })

    test('should have type problem exactly', () => {
      expect(noUnsafeTypeAssertionRule.meta.type).toBe('problem')
    })
  })

  describe('create function returns valid visitor', () => {
    test('TSAsExpression should be a function', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      expect(typeof visitor.TSAsExpression).toBe('function')
    })

    test('TSTypeAssertion should be a function', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      expect(typeof visitor.TSTypeAssertion).toBe('function')
    })

    test('visitor should only have TSAsExpression and TSTypeAssertion keys', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      const keys = Object.keys(visitor)
      expect(keys).toContain('TSAsExpression')
      expect(keys).toContain('TSTypeAssertion')
    })

    test('create should return a new visitor each time', () => {
      const { context } = createMockContext()
      const visitor1 = noUnsafeTypeAssertionRule.create(context)
      const visitor2 = noUnsafeTypeAssertionRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })
  })

  describe('casting to any - expanded', () => {
    test('should report casting string to any', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('any', 'string'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('any')
    })

    test('should report casting number to any', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('any', 'number'))
      expect(reports.length).toBe(1)
    })

    test('should report casting boolean to any', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('any', 'boolean'))
      expect(reports.length).toBe(1)
    })

    test('should report casting unknown to any', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('any', 'unknown'))
      expect(reports.length).toBe(1)
    })

    test('should report casting from untyped expression to any', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('any'))
      expect(reports.length).toBe(1)
    })

    test('should report angle-bracket cast to any from string type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      const node = {
        type: 'TSTypeAssertion',
        typeAnnotation: { type: 'TSAnyKeyword' },
        expression: {
          type: 'Identifier',
          name: 'value',
          typeAnnotation: {
            type: 'TSTypeReference',
            typeName: { type: 'Identifier', name: 'string' },
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.TSTypeAssertion(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('<>')
    })

    test('should always report casting to any regardless of options', () => {
      const { context, reports } = createMockContext({ allowAnyToUnknown: true })
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('any'))
      expect(reports.length).toBe(1)
    })

    test('should report casting to any even with allowUnknownToAny true', () => {
      const { context, reports } = createMockContext({ allowUnknownToAny: true })
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('any', 'string'))
      expect(reports.length).toBe(1)
    })

    test('should report casting to any with reportRedundant true', () => {
      const { context, reports } = createMockContext({ reportRedundant: true })
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('any'))
      expect(reports.length).toBe(1)
    })

    test('should report casting to any on line 42 column 7', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('any', undefined, 42, 7))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(7)
    })
  })

  describe('casting from any to specific type - expanded', () => {
    test('should report any as string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('string', 'any'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('from any')
    })

    test('should report any as number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('number', 'any'))
      expect(reports.length).toBe(1)
    })

    test('should report any as boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('boolean', 'any'))
      expect(reports.length).toBe(1)
    })

    test('should report any as MyCustomType', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('MyCustomType', 'any'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('from any')
    })

    test('should report any as Array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('Array', 'any'))
      expect(reports.length).toBe(1)
    })

    test('should report any as Promise', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('Promise', 'any'))
      expect(reports.length).toBe(1)
    })

    test('should report any as Record', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('Record', 'any'))
      expect(reports.length).toBe(1)
    })

    test('should report any as unknown when allowAnyToUnknown is false', () => {
      const { context, reports } = createMockContext({ allowAnyToUnknown: false })
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('unknown', 'any'))
      expect(reports.length).toBe(1)
    })

    test('should report any as HTMLElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('HTMLElement', 'any'))
      expect(reports.length).toBe(1)
    })

    test('should report any as Event', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('Event', 'any'))
      expect(reports.length).toBe(1)
    })
  })

  describe('casting from unknown - expanded', () => {
    test('should report unknown as string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('string', 'unknown'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('from unknown')
    })

    test('should report unknown as number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('number', 'unknown'))
      expect(reports.length).toBe(1)
    })

    test('should report unknown as boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('boolean', 'unknown'))
      expect(reports.length).toBe(1)
    })

    test('should report unknown as MyType', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('MyType', 'unknown'))
      expect(reports.length).toBe(1)
    })

    test('should report unknown as Array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('Array', 'unknown'))
      expect(reports.length).toBe(1)
    })

    test('should report unknown as Promise', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('Promise', 'unknown'))
      expect(reports.length).toBe(1)
    })

    test('should report unknown as Record', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('Record', 'unknown'))
      expect(reports.length).toBe(1)
    })

    test('should report unknown as HTMLElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('HTMLElement', 'unknown'))
      expect(reports.length).toBe(1)
    })

    test('should mention type checking in unknown cast message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('string', 'unknown'))
      expect(reports[0].message).toContain('type checking')
    })

    test('should report unknown as angle-bracket assertion', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      const node = {
        type: 'TSTypeAssertion',
        typeAnnotation: {
          type: 'TSTypeReference',
          typeName: { type: 'Identifier', name: 'string' },
        },
        expression: {
          type: 'Identifier',
          name: 'value',
          typeAnnotation: { type: 'TSUnknownKeyword' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.TSTypeAssertion(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('from unknown')
    })
  })

  describe('double assertion via unknown - expanded', () => {
    test('should report x as unknown as string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createDoubleAssertion('unknown', 'string'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('double type assertion')
    })

    test('should report x as unknown as number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createDoubleAssertion('unknown', 'number'))
      expect(reports.length).toBe(1)
    })

    test('should report x as unknown as boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createDoubleAssertion('unknown', 'boolean'))
      expect(reports.length).toBe(1)
    })

    test('should report x as unknown as any', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createDoubleAssertion('unknown', 'any'))
      expect(reports.length).toBe(1)
    })

    test('should report double assertion even with allowAnyToUnknown true', () => {
      const { context, reports } = createMockContext({ allowAnyToUnknown: true })
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createDoubleAssertion('unknown', 'string'))
      expect(reports.length).toBe(1)
    })

    test('should report double assertion even with allowUnknownToAny true', () => {
      const { context, reports } = createMockContext({ allowUnknownToAny: true })
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createDoubleAssertion('unknown', 'string'))
      expect(reports.length).toBe(1)
    })

    test('should report double assertion even with reportRedundant true', () => {
      const { context, reports } = createMockContext({ reportRedundant: true })
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createDoubleAssertion('unknown', 'string'))
      expect(reports.length).toBe(1)
    })

    test('should not report double assertion via string intermediate', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createDoubleAssertion('string', 'number'))
      expect(reports.length).toBe(0)
    })

    test('should not report double assertion via number intermediate', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createDoubleAssertion('number', 'string'))
      expect(reports.length).toBe(0)
    })

    test('should not report double assertion via MyType intermediate', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createDoubleAssertion('MyType', 'string'))
      expect(reports.length).toBe(0)
    })
  })

  describe('NOT flagged: safe casts', () => {
    test('should not report casting to a custom type without any/unknown source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createSafeAssertion('MyType'))
      expect(reports.length).toBe(0)
    })

    test('should not report casting to AnotherType', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createSafeAssertion('AnotherType'))
      expect(reports.length).toBe(0)
    })

    test('should not report casting to HttpClient', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createSafeAssertion('HttpClient'))
      expect(reports.length).toBe(0)
    })

    test('should not report angle-bracket safe assertion', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSTypeAssertion(createAngleBracketAssertion('MyType'))
      expect(reports.length).toBe(0)
    })

    test('should not report angle-bracket safe assertion with CustomType', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSTypeAssertion(createAngleBracketAssertion('CustomType'))
      expect(reports.length).toBe(0)
    })

    test('should not report specific to specific type cast', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('number', 'string'))
      expect(reports.length).toBe(0)
    })

    test('should not report casting from string type to number type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('number', 'string'))
      expect(reports.length).toBe(0)
    })

    test('should not report casting from one custom type to another', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('TargetType', 'SourceType'))
      expect(reports.length).toBe(0)
    })
  })

  describe('NOT flagged: casting to unknown from non-any', () => {
    test('should not report string to unknown', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('unknown', 'string'))
      expect(reports.length).toBe(0)
    })

    test('should not report number to unknown', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('unknown', 'number'))
      expect(reports.length).toBe(0)
    })

    test('should not report boolean to unknown', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('unknown', 'boolean'))
      expect(reports.length).toBe(0)
    })

    test('should not report untyped expression to unknown', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('unknown'))
      expect(reports.length).toBe(0)
    })

    test('should not report angle-bracket to unknown', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSTypeAssertion(createAngleBracketAssertion('unknown'))
      expect(reports.length).toBe(0)
    })
  })

  describe('allowAnyToUnknown option - expanded', () => {
    test('should allow any to unknown when true via as syntax', () => {
      const { context, reports } = createMockContext({ allowAnyToUnknown: true })
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('unknown', 'any'))
      expect(reports.length).toBe(0)
    })

    test('should report any to unknown when false', () => {
      const { context, reports } = createMockContext({ allowAnyToUnknown: false })
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('unknown', 'any'))
      expect(reports.length).toBe(1)
    })

    test('should report any to unknown by default (no options)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('unknown', 'any'))
      expect(reports.length).toBe(1)
    })

    test('should still report any to string when allowAnyToUnknown is true', () => {
      const { context, reports } = createMockContext({ allowAnyToUnknown: true })
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('string', 'any'))
      expect(reports.length).toBe(1)
    })

    test('should still report unknown to string when allowAnyToUnknown is true', () => {
      const { context, reports } = createMockContext({ allowAnyToUnknown: true })
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('string', 'unknown'))
      expect(reports.length).toBe(1)
    })

    test('should still report casting to any when allowAnyToUnknown is true', () => {
      const { context, reports } = createMockContext({ allowAnyToUnknown: true })
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('any'))
      expect(reports.length).toBe(1)
    })

    test('should not affect string to unknown casts', () => {
      const { context, reports } = createMockContext({ allowAnyToUnknown: true })
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('unknown', 'string'))
      expect(reports.length).toBe(0)
    })

    test('should not affect number to unknown casts', () => {
      const { context, reports } = createMockContext({ allowAnyToUnknown: false })
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('unknown', 'number'))
      expect(reports.length).toBe(0)
    })

    test('should allow any to unknown with angle-bracket syntax', () => {
      const { context, reports } = createMockContext({ allowAnyToUnknown: true })
      const visitor = noUnsafeTypeAssertionRule.create(context)
      const node = {
        type: 'TSTypeAssertion',
        typeAnnotation: { type: 'TSUnknownKeyword' },
        expression: {
          type: 'Identifier',
          name: 'value',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.TSTypeAssertion(node)
      expect(reports.length).toBe(0)
    })

    test('should report any to unknown with angle-bracket when false', () => {
      const { context, reports } = createMockContext({ allowAnyToUnknown: false })
      const visitor = noUnsafeTypeAssertionRule.create(context)
      const node = {
        type: 'TSTypeAssertion',
        typeAnnotation: { type: 'TSUnknownKeyword' },
        expression: {
          type: 'Identifier',
          name: 'value',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.TSTypeAssertion(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('allowUnknownToAny option - expanded', () => {
    test('should allow unknown to any when true via as syntax', () => {
      const { context, reports } = createMockContext({ allowUnknownToAny: true })
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('any', 'unknown'))
      expect(reports.length).toBe(0)
    })

    test('should report unknown to any when false', () => {
      const { context, reports } = createMockContext({ allowUnknownToAny: false })
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('any', 'unknown'))
      expect(reports.length).toBe(1)
    })

    test('should report unknown to any by default', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('any', 'unknown'))
      expect(reports.length).toBe(1)
    })

    test('should still report unknown to string when allowUnknownToAny is true', () => {
      const { context, reports } = createMockContext({ allowUnknownToAny: true })
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('string', 'unknown'))
      expect(reports.length).toBe(1)
    })

    test('should still report any to unknown when allowUnknownToAny is true', () => {
      const { context, reports } = createMockContext({ allowUnknownToAny: true })
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('unknown', 'any'))
      expect(reports.length).toBe(1)
    })

    test('should still report casting to any from non-unknown when allowUnknownToAny is true', () => {
      const { context, reports } = createMockContext({ allowUnknownToAny: true })
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('any', 'string'))
      expect(reports.length).toBe(1)
    })

    test('should not affect string to any casts (always unsafe)', () => {
      const { context, reports } = createMockContext({ allowUnknownToAny: true })
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('any', 'string'))
      expect(reports.length).toBe(1)
    })

    test('should allow unknown to any with angle-bracket syntax when true', () => {
      const { context, reports } = createMockContext({ allowUnknownToAny: true })
      const visitor = noUnsafeTypeAssertionRule.create(context)
      const node = {
        type: 'TSTypeAssertion',
        typeAnnotation: { type: 'TSAnyKeyword' },
        expression: {
          type: 'Identifier',
          name: 'value',
          typeAnnotation: { type: 'TSUnknownKeyword' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.TSTypeAssertion(node)
      expect(reports.length).toBe(0)
    })

    test('should report unknown to any with angle-bracket when false', () => {
      const { context, reports } = createMockContext({ allowUnknownToAny: false })
      const visitor = noUnsafeTypeAssertionRule.create(context)
      const node = {
        type: 'TSTypeAssertion',
        typeAnnotation: { type: 'TSAnyKeyword' },
        expression: {
          type: 'Identifier',
          name: 'value',
          typeAnnotation: { type: 'TSUnknownKeyword' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.TSTypeAssertion(node)
      expect(reports.length).toBe(1)
    })

    test('should report unknown to any when untyped source even with option true', () => {
      const { context, reports } = createMockContext({ allowUnknownToAny: true })
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('any'))
      expect(reports.length).toBe(1)
    })
  })

  describe('reportRedundant option - expanded', () => {
    test('should report redundant string as string when true', () => {
      const { context, reports } = createMockContext({ reportRedundant: true })
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('string', 'string'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Redundant')
    })

    test('should not report redundant string as string when false', () => {
      const { context, reports } = createMockContext({ reportRedundant: false })
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('string', 'string'))
      expect(reports.length).toBe(0)
    })

    test('should not report redundant by default', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('string', 'string'))
      expect(reports.length).toBe(0)
    })

    test('should report redundant number as number when true', () => {
      const { context, reports } = createMockContext({ reportRedundant: true })
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('number', 'number'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Redundant')
    })

    test('should report redundant MyType as MyType when true', () => {
      const { context, reports } = createMockContext({ reportRedundant: true })
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('MyType', 'MyType'))
      expect(reports.length).toBe(1)
    })

    test('should report redundant boolean as boolean when true', () => {
      const { context, reports } = createMockContext({ reportRedundant: true })
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('boolean', 'boolean'))
      expect(reports.length).toBe(1)
    })

    test('should report redundant and mention the target type name', () => {
      const { context, reports } = createMockContext({ reportRedundant: true })
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('MyType', 'MyType'))
      expect(reports[0].message).toContain('MyType')
    })

    test('should still report unsafe assertion even when redundant is true', () => {
      const { context, reports } = createMockContext({ reportRedundant: true })
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('any'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Unsafe')
    })

    test('should not report redundant for any as any with reportRedundant true', () => {
      const { context, reports } = createMockContext({ reportRedundant: true })
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('any', 'any'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Unsafe')
    })

    test('should not report redundant for mismatched types even when true', () => {
      const { context, reports } = createMockContext({ reportRedundant: true })
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('string', 'number'))
      expect(reports.length).toBe(0)
    })
  })

  describe('TSTypeAssertion (angle-bracket) variants', () => {
    test('should report <any>x', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSTypeAssertion(createAngleBracketAssertion('any'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('<>')
    })

    test('should not report <unknown>x from untyped', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSTypeAssertion(createAngleBracketAssertion('unknown'))
      expect(reports.length).toBe(0)
    })

    test('should not report <MyType>x from untyped', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSTypeAssertion(createAngleBracketAssertion('MyType'))
      expect(reports.length).toBe(0)
    })

    test('should report <string>x from any source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      const node = {
        type: 'TSTypeAssertion',
        typeAnnotation: {
          type: 'TSTypeReference',
          typeName: { type: 'Identifier', name: 'string' },
        },
        expression: {
          type: 'Identifier',
          name: 'value',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.TSTypeAssertion(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('from any')
    })

    test('should report <number>x from unknown source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      const node = {
        type: 'TSTypeAssertion',
        typeAnnotation: {
          type: 'TSTypeReference',
          typeName: { type: 'Identifier', name: 'number' },
        },
        expression: {
          type: 'Identifier',
          name: 'value',
          typeAnnotation: { type: 'TSUnknownKeyword' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.TSTypeAssertion(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('from unknown')
    })

    test('should report angle-bracket on specific line and column', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSTypeAssertion(createAngleBracketAssertion('any', 5, 10))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should handle angle-bracket with TSTypeReference typeName', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      const node = {
        type: 'TSTypeAssertion',
        typeAnnotation: {
          type: 'TSTypeReference',
          typeName: { type: 'Identifier', name: 'CustomType' },
        },
        expression: { type: 'Identifier', name: 'value' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.TSTypeAssertion(node)
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node in TSTypeAssertion', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      expect(() => visitor.TSTypeAssertion(undefined)).not.toThrow()
    })

    test('should handle angle-bracket cast to any from string expression type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      const node = {
        type: 'TSTypeAssertion',
        typeAnnotation: { type: 'TSAnyKeyword' },
        expression: {
          type: 'Identifier',
          name: 'value',
          typeAnnotation: {
            type: 'TSTypeReference',
            typeName: { type: 'Identifier', name: 'string' },
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.TSTypeAssertion(node)
      expect(reports.length).toBe(1)
    })

    test('should handle angle-bracket redundant with reportRedundant', () => {
      const { context, reports } = createMockContext({ reportRedundant: true })
      const visitor = noUnsafeTypeAssertionRule.create(context)
      const node = {
        type: 'TSTypeAssertion',
        typeAnnotation: {
          type: 'TSTypeReference',
          typeName: { type: 'Identifier', name: 'string' },
        },
        expression: {
          type: 'Identifier',
          name: 'value',
          typeAnnotation: {
            type: 'TSTypeReference',
            typeName: { type: 'Identifier', name: 'string' },
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.TSTypeAssertion(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Redundant')
    })
  })

  describe('violation properties', () => {
    test('message contains Unsafe type assertion for as syntax', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('any'))
      expect(reports[0].message).toContain('Unsafe type assertion')
    })

    test('message contains "as" for as syntax casts', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('any'))
      expect(reports[0].message).toContain('as')
    })

    test('message contains "<>" for angle-bracket casts', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSTypeAssertion(createAngleBracketAssertion('any'))
      expect(reports[0].message).toContain('<>')
    })

    test('message contains target type name for as expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('any'))
      expect(reports[0].message).toContain('any')
    })

    test('message contains target type name for angle-bracket', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSTypeAssertion(createAngleBracketAssertion('any'))
      expect(reports[0].message).toContain('any')
    })

    test('report includes location with start and end', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('any', undefined, 3, 8))
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start).toEqual({ line: 3, column: 8 })
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('double assertion message contains double type assertion', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createDoubleAssertion('unknown', 'string'))
      expect(reports[0].message).toContain('double type assertion')
    })

    test('redundant message contains Redundant', () => {
      const { context, reports } = createMockContext({ reportRedundant: true })
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('string', 'string'))
      expect(reports[0].message).toContain('Redundant')
    })
  })

  describe('extractLocation edge cases', () => {
    test('should handle node with null loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      const node = {
        type: 'TSAsExpression',
        typeAnnotation: { type: 'TSAnyKeyword' },
        expression: { type: 'Identifier', name: 'value' },
        loc: null,
      }
      visitor.TSAsExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle node with missing loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      const node = {
        type: 'TSAsExpression',
        typeAnnotation: { type: 'TSAnyKeyword' },
        expression: { type: 'Identifier', name: 'value' },
      }
      visitor.TSAsExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      const node = {
        type: 'TSAsExpression',
        typeAnnotation: { type: 'TSAnyKeyword' },
        expression: { type: 'Identifier', name: 'value' },
        loc: { start: { line: 5, column: 3 } },
      }
      visitor.TSAsExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should handle node with loc missing start', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      const node = {
        type: 'TSAsExpression',
        typeAnnotation: { type: 'TSAnyKeyword' },
        expression: { type: 'Identifier', name: 'value' },
        loc: { end: { line: 1, column: 10 } },
      }
      visitor.TSAsExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle node with non-numeric line in loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      const node = {
        type: 'TSAsExpression',
        typeAnnotation: { type: 'TSAnyKeyword' },
        expression: { type: 'Identifier', name: 'value' },
        loc: { start: { line: 'abc', column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.TSAsExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('getTargetType edge cases', () => {
    test('should handle node that is not TSAsExpression or TSTypeAssertion', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      const node = {
        type: 'SomeOtherType',
        typeAnnotation: { type: 'TSAnyKeyword' },
        expression: { type: 'Identifier', name: 'value' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.TSAsExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle TSAsExpression without typeAnnotation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      const node = {
        type: 'TSAsExpression',
        expression: { type: 'Identifier', name: 'value' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.TSAsExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle TSTypeAssertion without typeAnnotation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      const node = {
        type: 'TSTypeAssertion',
        expression: { type: 'Identifier', name: 'value' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.TSTypeAssertion(node)
      expect(reports.length).toBe(0)
    })

    test('should handle typeAnnotation with unknown type string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      const node = {
        type: 'TSAsExpression',
        typeAnnotation: { type: 'SomeUnknownASTType' },
        expression: { type: 'Identifier', name: 'value' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.TSAsExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('getSourceExpression edge cases', () => {
    test('should handle null node for source expression', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      expect(() => visitor.TSAsExpression(null)).not.toThrow()
    })

    test('should handle node with missing expression gracefully', () => {
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

    test('should handle node with null expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      const node = {
        type: 'TSAsExpression',
        typeAnnotation: { type: 'TSAnyKeyword' },
        expression: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.TSAsExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('checkForDoubleAssertion edge cases', () => {
    test('should handle node without expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      const node = {
        type: 'TSAsExpression',
        typeAnnotation: { type: 'TSAnyKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.TSAsExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).not.toContain('double')
    })

    test('should handle expression that is not a type assertion', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      const node = {
        type: 'TSAsExpression',
        typeAnnotation: { type: 'TSAnyKeyword' },
        expression: { type: 'Identifier', name: 'value' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.TSAsExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).not.toContain('double')
    })

    test('should handle double assertion with non-unknown intermediate type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createDoubleAssertion('SomeType', 'string'))
      expect(reports.length).toBe(0)
    })

    test('should handle double assertion with any intermediate type - reports as unsafe from any', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createDoubleAssertion('any', 'string'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('from any')
    })

    test('should handle expression that is a plain object (not TSAsExpression/TSTypeAssertion)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      const node = {
        type: 'TSAsExpression',
        typeAnnotation: { type: 'TSAnyKeyword' },
        expression: { type: 'Literal', value: 42 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.TSAsExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('getExpressionType edge cases', () => {
    test('should handle expression with TSAsExpression type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      const node = {
        type: 'TSAsExpression',
        typeAnnotation: {
          type: 'TSTypeReference',
          typeName: { type: 'Identifier', name: 'string' },
        },
        expression: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
          expression: { type: 'Identifier', name: 'value' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.TSAsExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle expression with TSTypeAssertion type', () => {
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
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.TSAsExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('double type assertion')
    })

    test('should handle expression with typeAnnotation on Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('string', 'number'))
      expect(reports.length).toBe(0)
    })

    test('should handle expression that is a number primitive', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      const node = {
        type: 'TSAsExpression',
        typeAnnotation: { type: 'TSAnyKeyword' },
        expression: 42,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.TSAsExpression(node)).not.toThrow()
    })
  })

  describe('multiple violations', () => {
    test('should report multiple violations in sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)

      visitor.TSAsExpression(createAsExpression('any'))
      visitor.TSAsExpression(createAsExpression('string', 'unknown'))
      visitor.TSAsExpression(createAsExpression('number', 'any'))

      expect(reports.length).toBe(3)
    })

    test('should report violations from both TSAsExpression and TSTypeAssertion', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)

      visitor.TSAsExpression(createAsExpression('any'))
      visitor.TSTypeAssertion(createAngleBracketAssertion('any'))

      expect(reports.length).toBe(2)
    })

    test('should report correct count when mixing safe and unsafe', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)

      visitor.TSAsExpression(createSafeAssertion('MyType'))
      visitor.TSAsExpression(createAsExpression('any'))
      visitor.TSAsExpression(createSafeAssertion('AnotherType'))
      visitor.TSAsExpression(createAsExpression('string', 'unknown'))

      expect(reports.length).toBe(2)
    })

    test('should report correct locations for multiple violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)

      visitor.TSAsExpression(createAsExpression('any', undefined, 1, 0))
      visitor.TSAsExpression(createAsExpression('any', undefined, 5, 10))

      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
    })

    test('should report double assertion then unsafe in sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)

      visitor.TSAsExpression(createDoubleAssertion('unknown', 'string'))
      visitor.TSAsExpression(createAsExpression('any'))

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('double')
      expect(reports[1].message).toContain('Unsafe type assertion')
    })
  })

  describe('combined options', () => {
    test('should respect both allowAnyToUnknown and allowUnknownToAny when both true', () => {
      const { context, reports } = createMockContext({
        allowAnyToUnknown: true,
        allowUnknownToAny: true,
      })
      const visitor = noUnsafeTypeAssertionRule.create(context)

      visitor.TSAsExpression(createAsExpression('unknown', 'any'))
      visitor.TSAsExpression(createAsExpression('any', 'unknown'))

      expect(reports.length).toBe(0)
    })

    test('should respect both options when both false', () => {
      const { context, reports } = createMockContext({
        allowAnyToUnknown: false,
        allowUnknownToAny: false,
      })
      const visitor = noUnsafeTypeAssertionRule.create(context)

      visitor.TSAsExpression(createAsExpression('unknown', 'any'))
      visitor.TSAsExpression(createAsExpression('any', 'unknown'))

      expect(reports.length).toBe(2)
    })

    test('should apply reportRedundant alongside allowAnyToUnknown', () => {
      const { context, reports } = createMockContext({
        reportRedundant: true,
        allowAnyToUnknown: true,
      })
      const visitor = noUnsafeTypeAssertionRule.create(context)

      visitor.TSAsExpression(createAsExpression('string', 'string'))
      visitor.TSAsExpression(createAsExpression('unknown', 'any'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Redundant')
    })

    test('should apply reportRedundant alongside allowUnknownToAny', () => {
      const { context, reports } = createMockContext({
        reportRedundant: true,
        allowUnknownToAny: true,
      })
      const visitor = noUnsafeTypeAssertionRule.create(context)

      visitor.TSAsExpression(createAsExpression('any', 'unknown'))
      visitor.TSAsExpression(createAsExpression('string', 'string'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Redundant')
    })

    test('should handle all three options true simultaneously', () => {
      const { context, reports } = createMockContext({
        allowAnyToUnknown: true,
        allowUnknownToAny: true,
        reportRedundant: true,
      })
      const visitor = noUnsafeTypeAssertionRule.create(context)

      visitor.TSAsExpression(createAsExpression('unknown', 'any'))
      visitor.TSAsExpression(createAsExpression('any', 'unknown'))
      visitor.TSAsExpression(createAsExpression('string', 'string'))
      visitor.TSAsExpression(createSafeAssertion('MyType'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Redundant')
    })
  })

  describe('TSTypeAssertion angle-bracket with expression types', () => {
    test('should report angle-bracket from any to custom type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      const node = {
        type: 'TSTypeAssertion',
        typeAnnotation: {
          type: 'TSTypeReference',
          typeName: { type: 'Identifier', name: 'MyCustomType' },
        },
        expression: {
          type: 'Identifier',
          name: 'value',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.TSTypeAssertion(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('from any')
    })

    test('should report angle-bracket from unknown to custom type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      const node = {
        type: 'TSTypeAssertion',
        typeAnnotation: {
          type: 'TSTypeReference',
          typeName: { type: 'Identifier', name: 'MyCustomType' },
        },
        expression: {
          type: 'Identifier',
          name: 'value',
          typeAnnotation: { type: 'TSUnknownKeyword' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.TSTypeAssertion(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('from unknown')
    })

    test('should not report angle-bracket from specific to specific type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      const node = {
        type: 'TSTypeAssertion',
        typeAnnotation: {
          type: 'TSTypeReference',
          typeName: { type: 'Identifier', name: 'TargetType' },
        },
        expression: {
          type: 'Identifier',
          name: 'value',
          typeAnnotation: {
            type: 'TSTypeReference',
            typeName: { type: 'Identifier', name: 'SourceType' },
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.TSTypeAssertion(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('location precision', () => {
    test('should report location at line 1 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('any', undefined, 1, 0))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at line 100 column 50', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('any', undefined, 100, 50))
      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should include end location in report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('any', undefined, 1, 0))
      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(1)
      expect(reports[0].loc?.end.column).toBe(20)
    })
  })

  describe('message format details', () => {
    test('should include target type in unsafe assertion message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('any'))
      expect(reports[0].message).toMatch(/as\s+any/)
    })

    test('should include angle-bracket syntax marker for TSTypeAssertion', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSTypeAssertion(createAngleBracketAssertion('any'))
      expect(reports[0].message).toMatch(/<>\s+any/)
    })

    test('should include type guards suggestion in unsafe message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('string', 'any'))
      expect(reports[0].message).toContain('type guards')
    })

    test('should include validation suggestion in unsafe message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('string', 'any'))
      expect(reports[0].message).toContain('validation')
    })

    test('should include validation suggestion in double assertion message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createDoubleAssertion('unknown', 'string'))
      expect(reports[0].message).toContain('validation')
    })

    test('should include type name in redundant assertion message', () => {
      const { context, reports } = createMockContext({ reportRedundant: true })
      const visitor = noUnsafeTypeAssertionRule.create(context)
      visitor.TSAsExpression(createAsExpression('SomeTypeName', 'SomeTypeName'))
      expect(reports[0].message).toContain('SomeTypeName')
      expect(reports[0].message).toContain('already of type')
    })
  })

  describe('null and undefined node handling for TSTypeAssertion', () => {
    test('should handle undefined node in TSTypeAssertion', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      expect(() => visitor.TSTypeAssertion(undefined)).not.toThrow()
    })

    test('should handle string node in TSTypeAssertion', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      expect(() => visitor.TSTypeAssertion('bad')).not.toThrow()
    })

    test('should handle numeric node in TSTypeAssertion', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      expect(() => visitor.TSTypeAssertion(42)).not.toThrow()
    })

    test('should handle boolean node in TSTypeAssertion', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeTypeAssertionRule.create(context)
      expect(() => visitor.TSTypeAssertion(true)).not.toThrow()
    })
  })
})
