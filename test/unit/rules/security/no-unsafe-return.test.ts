import { describe, test, expect, vi } from 'vitest'
import { noUnsafeReturnRule } from '../../../../src/rules/security/no-unsafe-return.js'
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

function createFunctionDeclaration(returnTypeName: string | null, line = 1, column = 0): unknown {
  if (!returnTypeName) {
    return {
      type: 'FunctionDeclaration',
      id: { type: 'Identifier', name: 'test' },
      loc: { start: { line, column }, end: { line, column: column + 20 } },
    }
  }

  const typeAnnotation =
    returnTypeName === 'any'
      ? { type: 'TSAnyKeyword' }
      : returnTypeName === 'unknown'
        ? { type: 'TSUnknownKeyword' }
        : { type: 'TSTypeReference', typeName: { type: 'Identifier', name: returnTypeName } }

  return {
    type: 'FunctionDeclaration',
    id: { type: 'Identifier', name: 'test' },
    returnType: { typeAnnotation },
    loc: { start: { line, column }, end: { line, column: column + 20 } },
  }
}

function createArrowFunction(returnTypeName: string | null, line = 1, column = 0): unknown {
  if (!returnTypeName) {
    return {
      type: 'ArrowFunctionExpression',
      loc: { start: { line, column }, end: { line, column: column + 20 } },
    }
  }

  const typeAnnotation =
    returnTypeName === 'any'
      ? { type: 'TSAnyKeyword' }
      : returnTypeName === 'unknown'
        ? { type: 'TSUnknownKeyword' }
        : { type: 'TSTypeReference', typeName: { type: 'Identifier', name: returnTypeName } }

  return {
    type: 'ArrowFunctionExpression',
    returnType: { typeAnnotation },
    loc: { start: { line, column }, end: { line, column: column + 20 } },
  }
}

function createFunctionExpression(returnTypeName: string | null, line = 1, column = 0): unknown {
  if (!returnTypeName) {
    return {
      type: 'FunctionExpression',
      loc: { start: { line, column }, end: { line, column: column + 20 } },
    }
  }

  const typeAnnotation =
    returnTypeName === 'any'
      ? { type: 'TSAnyKeyword' }
      : returnTypeName === 'unknown'
        ? { type: 'TSUnknownKeyword' }
        : { type: 'TSTypeReference', typeName: { type: 'Identifier', name: returnTypeName } }

  return {
    type: 'FunctionExpression',
    returnType: { typeAnnotation },
    loc: { start: { line, column }, end: { line, column: column + 20 } },
  }
}

function createReturnStatement(argument: unknown, line = 1, column = 0): unknown {
  return {
    type: 'ReturnStatement',
    argument,
    loc: { start: { line, column }, end: { line, column: column + 10 } },
  }
}

function createAnyExpression(line = 1, column = 0): unknown {
  return {
    type: 'TSAsExpression',
    expression: { type: 'Identifier', name: 'anyValue' },
    typeAnnotation: { type: 'TSAnyKeyword' },
    loc: { start: { line, column }, end: { line, column: column + 10 } },
  }
}

function createUnknownExpression(line = 1, column = 0): unknown {
  return {
    type: 'TSAsExpression',
    expression: { type: 'Identifier', name: 'unknownValue' },
    typeAnnotation: { type: 'TSUnknownKeyword' },
    loc: { start: { line, column }, end: { line, column: column + 10 } },
  }
}

function createTypedExpression(typeName: string, line = 1, column = 0): unknown {
  return {
    type: 'Identifier',
    name: 'typedValue',
    typeAnnotation: { type: 'TSTypeReference', typeName: { type: 'Identifier', name: typeName } },
    loc: { start: { line, column }, end: { line, column: column + 10 } },
  }
}

function createAsExpression(targetType: string, line = 1, column = 0): unknown {
  return {
    type: 'TSAsExpression',
    expression: { type: 'Identifier', name: 'value' },
    typeAnnotation:
      targetType === 'any'
        ? { type: 'TSAnyKeyword' }
        : targetType === 'unknown'
          ? { type: 'TSUnknownKeyword' }
          : { type: 'TSTypeReference', typeName: { type: 'Identifier', name: targetType } },
    loc: { start: { line, column }, end: { line, column: column + 15 } },
  }
}

function createNarrowedCall(calleeName: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: calleeName },
    arguments: [{ type: 'Identifier', name: 'value' }],
    loc: { start: { line, column }, end: { line, column: column + 20 } },
  }
}

describe('no-unsafe-return rule', () => {
  describe('meta', () => {
    test('should have correct rule type', () => {
      expect(noUnsafeReturnRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noUnsafeReturnRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noUnsafeReturnRule.meta.docs?.recommended).toBe(true)
    })

    test('should have correct category', () => {
      expect(noUnsafeReturnRule.meta.docs?.category).toBe('security')
    })

    test('should have schema defined', () => {
      expect(noUnsafeReturnRule.meta.schema).toBeDefined()
    })

    test('should have correct description', () => {
      expect(noUnsafeReturnRule.meta.docs?.description).toContain('unsafe return')
    })

    test('should mention type safety in description', () => {
      expect(noUnsafeReturnRule.meta.docs?.description.toLowerCase()).toContain('type safety')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)

      expect(visitor).toHaveProperty('FunctionDeclaration')
      expect(visitor).toHaveProperty('FunctionExpression')
      expect(visitor).toHaveProperty('ArrowFunctionExpression')
      expect(visitor).toHaveProperty('ReturnStatement')
      expect(visitor).toHaveProperty('FunctionDeclaration:exit')
      expect(visitor).toHaveProperty('FunctionExpression:exit')
      expect(visitor).toHaveProperty('ArrowFunctionExpression:exit')
    })

    test('should report returning any typed value to typed function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['FunctionDeclaration:exit'](null)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Unsafe return')
      expect(reports[0].message).toContain('any')
    })

    test('should report returning unknown typed value to typed function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createUnknownExpression()))
      visitor['FunctionDeclaration:exit'](null)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Unsafe return')
      expect(reports[0].message).toContain('unknown')
    })

    test('should not report returning typed value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createTypedExpression('string')))
      visitor['FunctionDeclaration:exit'](null)

      expect(reports.length).toBe(0)
    })

    test('should not report returning any to function returning any', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('any'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['FunctionDeclaration:exit'](null)

      expect(reports.length).toBe(0)
    })

    test('should not report returning unknown to function returning unknown', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('unknown'))
      visitor.ReturnStatement(createReturnStatement(createUnknownExpression()))
      visitor['FunctionDeclaration:exit'](null)

      expect(reports.length).toBe(0)
    })

    test('should not report return without explicit return type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(null))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['FunctionDeclaration:exit'](null)

      expect(reports.length).toBe(0)
    })

    test('should work with arrow functions', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunction('number'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['ArrowFunctionExpression:exit'](null)

      expect(reports.length).toBe(1)
    })

    test('should work with function expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)

      visitor.FunctionExpression(createFunctionExpression('boolean'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['FunctionExpression:exit'](null)

      expect(reports.length).toBe(1)
    })

    test('should handle nested functions correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ArrowFunctionExpression(createArrowFunction('number'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['ArrowFunctionExpression:exit'](null)
      visitor.ReturnStatement(createReturnStatement(createTypedExpression('string')))
      visitor['FunctionDeclaration:exit'](null)

      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression(), 5, 10))
      visitor['FunctionDeclaration:exit'](null)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })
  })

  describe('options', () => {
    test('should respect allowAny option', () => {
      const { context, reports } = createMockContext({ allowAny: true })
      const visitor = noUnsafeReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['FunctionDeclaration:exit'](null)

      expect(reports.length).toBe(0)
    })

    test('should respect allowUnknown option', () => {
      const { context, reports } = createMockContext({ allowUnknown: true })
      const visitor = noUnsafeReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createUnknownExpression()))
      visitor['FunctionDeclaration:exit'](null)

      expect(reports.length).toBe(0)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noUnsafeReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['FunctionDeclaration:exit'](null)

      expect(reports.length).toBe(1)
    })

    test('should handle undefined options array', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
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

      const visitor = noUnsafeReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['FunctionDeclaration:exit'](null)

      expect(reports.length).toBe(1)
    })
  })

  describe('type narrowing', () => {
    test('should not report narrowed unknown via String()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createNarrowedCall('String')))
      visitor['FunctionDeclaration:exit'](null)

      expect(reports.length).toBe(0)
    })

    test('should not report narrowed unknown via Number()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('number'))
      visitor.ReturnStatement(createReturnStatement(createNarrowedCall('Number')))
      visitor['FunctionDeclaration:exit'](null)

      expect(reports.length).toBe(0)
    })

    test('should not report narrowed unknown via Boolean()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('boolean'))
      visitor.ReturnStatement(createReturnStatement(createNarrowedCall('Boolean')))
      visitor['FunctionDeclaration:exit'](null)

      expect(reports.length).toBe(0)
    })

    test('should not report narrowed unknown via Array.isArray()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('boolean'))
      visitor.ReturnStatement(createReturnStatement(createNarrowedCall('Array.isArray')))
      visitor['FunctionDeclaration:exit'](null)

      expect(reports.length).toBe(0)
    })

    test('should not report narrowed unknown via as expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createAsExpression('string')))
      visitor['FunctionDeclaration:exit'](null)

      expect(reports.length).toBe(0)
    })

    test('should still report as any narrowing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createAsExpression('any')))
      visitor['FunctionDeclaration:exit'](null)

      expect(reports.length).toBe(1)
    })
  })

  describe('edge cases', () => {
    test('should handle null node in FunctionDeclaration', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)

      expect(() => visitor.FunctionDeclaration(null)).not.toThrow()
    })

    test('should handle undefined node in FunctionDeclaration', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)

      expect(() => visitor.FunctionDeclaration(undefined)).not.toThrow()
    })

    test('should handle null node in ReturnStatement', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      expect(() => visitor.ReturnStatement(null)).not.toThrow()
    })

    test('should handle return statement without argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement({ type: 'ReturnStatement' })
      visitor['FunctionDeclaration:exit'](null)

      expect(reports.length).toBe(0)
    })

    test('should handle return statement outside function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))

      expect(reports.length).toBe(0)
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)

      expect(() => visitor.FunctionDeclaration('string')).not.toThrow()
      expect(() => visitor.FunctionDeclaration(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: createAnyExpression(),
      }

      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      expect(() => visitor.ReturnStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle function stack imbalance gracefully', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)

      expect(() => visitor['FunctionDeclaration:exit'](null)).not.toThrow()
    })

    test('should handle empty function stack on return', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))

      expect(reports.length).toBe(0)
    })

    test('should handle TSTypeAssertion', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)

      const typeAssertion = {
        type: 'TSTypeAssertion',
        typeAnnotation: {
          type: 'TSTypeReference',
          typeName: { type: 'Identifier', name: 'string' },
        },
        expression: { type: 'Identifier', name: 'value' },
      }

      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(typeAssertion))
      visitor['FunctionDeclaration:exit'](null)

      expect(reports.length).toBe(0)
    })

    test('should handle identifier without type annotation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)

      const identifier = {
        type: 'Identifier',
        name: 'value',
      }

      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(identifier))
      visitor['FunctionDeclaration:exit'](null)

      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should include actionable guidance for any return', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['FunctionDeclaration:exit'](null)

      expect(reports[0].message).toContain('type guards')
    })

    test('should include actionable guidance for unknown return', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createUnknownExpression()))
      visitor['FunctionDeclaration:exit'](null)

      expect(reports[0].message).toContain('validation')
    })
  })
})
