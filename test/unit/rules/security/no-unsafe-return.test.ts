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

  describe('rule metadata expanded', () => {
    test('should have meta property on rule', () => {
      expect(noUnsafeReturnRule).toHaveProperty('meta')
    })

    test('should have create property on rule', () => {
      expect(noUnsafeReturnRule).toHaveProperty('create')
    })

    test('should have docs property in meta', () => {
      expect(noUnsafeReturnRule.meta).toHaveProperty('docs')
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(noUnsafeReturnRule.meta.schema)).toBe(true)
    })

    test('should have schema with at least one item', () => {
      expect(noUnsafeReturnRule.meta.schema.length).toBeGreaterThanOrEqual(1)
    })

    test('should have allowAny in schema properties', () => {
      const schema = noUnsafeReturnRule.meta.schema[0] as Record<string, unknown>
      const props = schema.properties as Record<string, unknown>
      expect(props).toHaveProperty('allowAny')
    })

    test('should have allowUnknown in schema properties', () => {
      const schema = noUnsafeReturnRule.meta.schema[0] as Record<string, unknown>
      const props = schema.properties as Record<string, unknown>
      expect(props).toHaveProperty('allowUnknown')
    })

    test('should have url in docs', () => {
      expect(noUnsafeReturnRule.meta.docs?.url).toBeDefined()
    })
  })

  describe('create function visitor structure', () => {
    test('should return an object from create', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      expect(typeof visitor).toBe('object')
    })

    test('should have all 7 visitor keys', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      const keys = Object.keys(visitor)
      expect(keys.length).toBe(7)
    })

    test('should have FunctionDeclaration as a function', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      expect(typeof visitor.FunctionDeclaration).toBe('function')
    })

    test('should have FunctionExpression as a function', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      expect(typeof visitor.FunctionExpression).toBe('function')
    })

    test('should have ArrowFunctionExpression as a function', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      expect(typeof visitor.ArrowFunctionExpression).toBe('function')
    })

    test('should have ReturnStatement as a function', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      expect(typeof visitor.ReturnStatement).toBe('function')
    })

    test('should have FunctionDeclaration:exit as a function', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      expect(typeof visitor['FunctionDeclaration:exit']).toBe('function')
    })

    test('should have FunctionExpression:exit as a function', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      expect(typeof visitor['FunctionExpression:exit']).toBe('function')
    })

    test('should have ArrowFunctionExpression:exit as a function', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      expect(typeof visitor['ArrowFunctionExpression:exit']).toBe('function')
    })

    test('should create independent visitors per call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnsafeReturnRule.create(context)
      const visitor2 = noUnsafeReturnRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })
  })

  describe('returning any from typed function', () => {
    test('should report any returned to string-typed function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(1)
    })

    test('should report any returned to number-typed function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('number'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(1)
    })

    test('should report any returned to boolean-typed function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('boolean'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(1)
    })

    test('should report any returned to MyType-typed function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('MyType'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(1)
    })

    test('should report any returned to void-typed function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('void'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(1)
    })

    test('should report any returned to unknown-typed function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('unknown'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(1)
    })

    test('should report any returned from arrow function typed number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.ArrowFunctionExpression(createArrowFunction('number'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['ArrowFunctionExpression:exit'](null)
      expect(reports.length).toBe(1)
    })

    test('should report any returned from function expression typed string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionExpression(createFunctionExpression('string'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['FunctionExpression:exit'](null)
      expect(reports.length).toBe(1)
    })

    test('should report any with message containing "bypasses type safety"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports[0].message).toContain('bypasses type safety')
    })

    test('should report multiple any returns in same function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression(), 3, 0))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression(), 5, 0))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression(), 7, 0))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(3)
    })

    test('should report any returned via TSAsExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createAsExpression('any')))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(1)
    })

    test('should report any from function typed Date', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('Date'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(1)
    })

    test('should report any from function typed Promise', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('Promise'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(1)
    })

    test('should report any from function typed Array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('Array'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(1)
    })

    test('should report any from function typed Record', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('Record'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(1)
    })
  })

  describe('returning unknown from typed function', () => {
    test('should report unknown returned to string-typed function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createUnknownExpression()))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(1)
    })

    test('should report unknown returned to number-typed function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('number'))
      visitor.ReturnStatement(createReturnStatement(createUnknownExpression()))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(1)
    })

    test('should report unknown returned to boolean-typed function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('boolean'))
      visitor.ReturnStatement(createReturnStatement(createUnknownExpression()))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(1)
    })

    test('should report unknown returned to MyType-typed function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('MyType'))
      visitor.ReturnStatement(createReturnStatement(createUnknownExpression()))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(1)
    })

    test('should report unknown returned to any-typed function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('any'))
      visitor.ReturnStatement(createReturnStatement(createUnknownExpression()))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(1)
    })

    test('should report unknown from arrow function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.ArrowFunctionExpression(createArrowFunction('string'))
      visitor.ReturnStatement(createReturnStatement(createUnknownExpression()))
      visitor['ArrowFunctionExpression:exit'](null)
      expect(reports.length).toBe(1)
    })

    test('should report unknown from function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionExpression(createFunctionExpression('number'))
      visitor.ReturnStatement(createReturnStatement(createUnknownExpression()))
      visitor['FunctionExpression:exit'](null)
      expect(reports.length).toBe(1)
    })

    test('should report unknown with message containing "without type narrowing"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createUnknownExpression()))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports[0].message).toContain('without type narrowing')
    })

    test('should report multiple unknown returns in same function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createUnknownExpression(), 3, 0))
      visitor.ReturnStatement(createReturnStatement(createUnknownExpression(), 5, 0))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(2)
    })

    test('should report unknown via TSAsExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createAsExpression('unknown')))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(1)
    })

    test('should report unknown returned to void-typed function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('void'))
      visitor.ReturnStatement(createReturnStatement(createUnknownExpression()))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(1)
    })

    test('should report unknown returned to Date-typed function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('Date'))
      visitor.ReturnStatement(createReturnStatement(createUnknownExpression()))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(1)
    })

    test('should report unknown returned to CustomInterface-typed function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('CustomInterface'))
      visitor.ReturnStatement(createReturnStatement(createUnknownExpression()))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(1)
    })

    test('should report unknown via TSTypeAssertion cast', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      const typeAssertion = {
        type: 'TSTypeAssertion',
        typeAnnotation: { type: 'TSUnknownKeyword' },
        expression: { type: 'Identifier', name: 'value' },
      }
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(typeAssertion))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(1)
    })

    test('should report unknown returned to Promise-typed function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('Promise'))
      visitor.ReturnStatement(createReturnStatement(createUnknownExpression()))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(1)
    })
  })

  describe('type narrowing prevents report', () => {
    test('should not report unknown narrowed via String()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createNarrowedCall('String')))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should not report unknown narrowed via Number()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('number'))
      visitor.ReturnStatement(createReturnStatement(createNarrowedCall('Number')))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should not report unknown narrowed via Boolean()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('boolean'))
      visitor.ReturnStatement(createReturnStatement(createNarrowedCall('Boolean')))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should not report unknown narrowed via Array.isArray()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('boolean'))
      visitor.ReturnStatement(createReturnStatement(createNarrowedCall('Array.isArray')))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should not report unknown narrowed via Object.keys()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createNarrowedCall('Object.keys')))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should not report unknown narrowed via Object.values()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createNarrowedCall('Object.values')))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should not report narrowed via as string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createAsExpression('string')))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should not report narrowed via as number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('number'))
      visitor.ReturnStatement(createReturnStatement(createAsExpression('number')))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should not report narrowed via as boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('boolean'))
      visitor.ReturnStatement(createReturnStatement(createAsExpression('boolean')))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should not report narrowed via as MyCustomType', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createAsExpression('MyCustomType')))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should still report narrowing to any (not safe)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createAsExpression('any')))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(1)
    })

    test('should still report narrowing to unknown (not safe)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createAsExpression('unknown')))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(1)
    })

    test('should not report narrowed via TSTypeAssertion to string', () => {
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

    test('should report TSTypeAssertion to any', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      const typeAssertion = {
        type: 'TSTypeAssertion',
        typeAnnotation: { type: 'TSAnyKeyword' },
        expression: { type: 'Identifier', name: 'value' },
      }
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(typeAssertion))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(1)
    })

    test('should report TSTypeAssertion to unknown', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      const typeAssertion = {
        type: 'TSTypeAssertion',
        typeAnnotation: { type: 'TSUnknownKeyword' },
        expression: { type: 'Identifier', name: 'value' },
      }
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(typeAssertion))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(1)
    })

    test('should not report CallExpression with non-narrowing callee as unsafe if value is not any/unknown', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'someRandomFunction' },
        arguments: [{ type: 'Identifier', name: 'value' }],
      }
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(call))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should not report narrowed via as Date', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createAsExpression('Date')))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })
  })

  describe('allowAny option', () => {
    test('should not report any when allowAny is true', () => {
      const { context, reports } = createMockContext({ allowAny: true })
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should report any when allowAny is false', () => {
      const { context, reports } = createMockContext({ allowAny: false })
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(1)
    })

    test('should report any by default when allowAny not set', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(1)
    })

    test('should still report unknown when allowAny is true', () => {
      const { context, reports } = createMockContext({ allowAny: true })
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createUnknownExpression()))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(1)
    })

    test('should not report any in arrow function when allowAny is true', () => {
      const { context, reports } = createMockContext({ allowAny: true })
      const visitor = noUnsafeReturnRule.create(context)
      visitor.ArrowFunctionExpression(createArrowFunction('number'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['ArrowFunctionExpression:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should not report any in function expression when allowAny is true', () => {
      const { context, reports } = createMockContext({ allowAny: true })
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionExpression(createFunctionExpression('string'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['FunctionExpression:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should not report any via as when allowAny is true', () => {
      const { context, reports } = createMockContext({ allowAny: true })
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createAsExpression('any')))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should allow both any and unknown when both options true', () => {
      const { context, reports } = createMockContext({ allowAny: true, allowUnknown: true })
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor.ReturnStatement(createReturnStatement(createUnknownExpression()))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should report multiple any returns when allowAny is false', () => {
      const { context, reports } = createMockContext({ allowAny: false })
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression(), 3, 0))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression(), 5, 0))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(2)
    })

    test('should not affect typed returns when allowAny is true', () => {
      const { context, reports } = createMockContext({ allowAny: true })
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createTypedExpression('string')))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })
  })

  describe('allowUnknown option', () => {
    test('should not report unknown when allowUnknown is true', () => {
      const { context, reports } = createMockContext({ allowUnknown: true })
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createUnknownExpression()))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should report unknown when allowUnknown is false', () => {
      const { context, reports } = createMockContext({ allowUnknown: false })
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createUnknownExpression()))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(1)
    })

    test('should report unknown by default when allowUnknown not set', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createUnknownExpression()))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(1)
    })

    test('should still report any when allowUnknown is true', () => {
      const { context, reports } = createMockContext({ allowUnknown: true })
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(1)
    })

    test('should not report unknown in arrow function when allowUnknown is true', () => {
      const { context, reports } = createMockContext({ allowUnknown: true })
      const visitor = noUnsafeReturnRule.create(context)
      visitor.ArrowFunctionExpression(createArrowFunction('string'))
      visitor.ReturnStatement(createReturnStatement(createUnknownExpression()))
      visitor['ArrowFunctionExpression:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should not report unknown in function expression when allowUnknown is true', () => {
      const { context, reports } = createMockContext({ allowUnknown: true })
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionExpression(createFunctionExpression('number'))
      visitor.ReturnStatement(createReturnStatement(createUnknownExpression()))
      visitor['FunctionExpression:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should not report unknown via as when allowUnknown is true', () => {
      const { context, reports } = createMockContext({ allowUnknown: true })
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createAsExpression('unknown')))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should not report narrowed unknown even when allowUnknown is false', () => {
      const { context, reports } = createMockContext({ allowUnknown: false })
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createNarrowedCall('String')))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should not report narrowed unknown when allowUnknown is true', () => {
      const { context, reports } = createMockContext({ allowUnknown: true })
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createNarrowedCall('Number')))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should report multiple unknown returns when allowUnknown is false', () => {
      const { context, reports } = createMockContext({ allowUnknown: false })
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createUnknownExpression(), 3, 0))
      visitor.ReturnStatement(createReturnStatement(createUnknownExpression(), 5, 0))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(2)
    })

    test('should not affect typed returns when allowUnknown is true', () => {
      const { context, reports } = createMockContext({ allowUnknown: true })
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createTypedExpression('string')))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })
  })

  describe('NOT flagged: safe returns', () => {
    test('should not report returning typed string value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createTypedExpression('string')))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should not report returning typed number value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('number'))
      visitor.ReturnStatement(createReturnStatement(createTypedExpression('number')))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should not report returning typed boolean value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('boolean'))
      visitor.ReturnStatement(createReturnStatement(createTypedExpression('boolean')))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should not report returning typed value from arrow function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.ArrowFunctionExpression(createArrowFunction('string'))
      visitor.ReturnStatement(createReturnStatement(createTypedExpression('string')))
      visitor['ArrowFunctionExpression:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should not report returning typed value from function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionExpression(createFunctionExpression('string'))
      visitor.ReturnStatement(createReturnStatement(createTypedExpression('string')))
      visitor['FunctionExpression:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should not report when function has no explicit return type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration(null))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should not report when arrow has no explicit return type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.ArrowFunctionExpression(createArrowFunction(null))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['ArrowFunctionExpression:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should not report when function expression has no explicit return type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionExpression(createFunctionExpression(null))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['FunctionExpression:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should not report identifier without type annotation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      const identifier = { type: 'Identifier', name: 'plainValue' }
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(identifier))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should not report plain object literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      const objectLiteral = { type: 'ObjectExpression', properties: [] }
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(objectLiteral))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should not report call expression returning non-any/non-unknown', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'getData' },
        arguments: [],
      }
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(call))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should not report return of narrowed value in arrow function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.ArrowFunctionExpression(createArrowFunction('string'))
      visitor.ReturnStatement(createReturnStatement(createNarrowedCall('String')))
      visitor['ArrowFunctionExpression:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should not report return of narrowed value in function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionExpression(createFunctionExpression('number'))
      visitor.ReturnStatement(createReturnStatement(createNarrowedCall('Number')))
      visitor['FunctionExpression:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should not report as-cast to concrete type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createAsExpression('string')))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should not report as-cast to MyCustomType', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createAsExpression('MyCustomType')))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })
  })

  describe('NOT flagged: returning any from any-typed function', () => {
    test('should not report any returned to any-typed FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('any'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should not report any returned to any-typed ArrowFunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.ArrowFunctionExpression(createArrowFunction('any'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['ArrowFunctionExpression:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should not report any returned to any-typed FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionExpression(createFunctionExpression('any'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['FunctionExpression:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should not report multiple any returns in any-typed function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('any'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression(), 3, 0))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression(), 5, 0))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should not report as any in any-typed function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('any'))
      visitor.ReturnStatement(createReturnStatement(createAsExpression('any')))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })
  })

  describe('NOT flagged: returning unknown from unknown-typed function', () => {
    test('should not report unknown returned to unknown-typed FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('unknown'))
      visitor.ReturnStatement(createReturnStatement(createUnknownExpression()))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should not report unknown returned to unknown-typed ArrowFunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.ArrowFunctionExpression(createArrowFunction('unknown'))
      visitor.ReturnStatement(createReturnStatement(createUnknownExpression()))
      visitor['ArrowFunctionExpression:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should not report unknown returned to unknown-typed FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionExpression(createFunctionExpression('unknown'))
      visitor.ReturnStatement(createReturnStatement(createUnknownExpression()))
      visitor['FunctionExpression:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should not report as unknown in unknown-typed function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('unknown'))
      visitor.ReturnStatement(createReturnStatement(createAsExpression('unknown')))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should not report multiple unknown returns in unknown-typed function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('unknown'))
      visitor.ReturnStatement(createReturnStatement(createUnknownExpression(), 3, 0))
      visitor.ReturnStatement(createReturnStatement(createUnknownExpression(), 5, 0))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })
  })

  describe('function stack management', () => {
    test('should handle nested FunctionDeclaration inside FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.FunctionDeclaration(createFunctionDeclaration('number'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['FunctionDeclaration:exit'](null)
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(2)
    })

    test('should track correct function after inner function exits', () => {
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

    test('should handle deeply nested three levels', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.FunctionExpression(createFunctionExpression('number'))
      visitor.ArrowFunctionExpression(createArrowFunction('boolean'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['ArrowFunctionExpression:exit'](null)
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['FunctionExpression:exit'](null)
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(3)
    })

    test('should handle exit without matching enter', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      expect(() => visitor['FunctionDeclaration:exit'](null)).not.toThrow()
      expect(() => visitor['FunctionExpression:exit'](null)).not.toThrow()
      expect(() => visitor['ArrowFunctionExpression:exit'](null)).not.toThrow()
    })

    test('should handle multiple consecutive exits', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor['FunctionDeclaration:exit'](null)
      expect(() => visitor['FunctionDeclaration:exit'](null)).not.toThrow()
    })

    test('should handle enter-exit-enter pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['FunctionDeclaration:exit'](null)
      visitor.FunctionDeclaration(createFunctionDeclaration('number'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(2)
    })

    test('should not report return after all functions exited', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor['FunctionDeclaration:exit'](null)
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      expect(reports.length).toBe(0)
    })

    test('should handle interleaved function types', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ArrowFunctionExpression(createArrowFunction(null))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['ArrowFunctionExpression:exit'](null)
      visitor.FunctionExpression(createFunctionExpression('number'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['FunctionExpression:exit'](null)
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(1)
    })

    test('should handle function with no returns', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should handle function with only safe returns', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createTypedExpression('string')))
      visitor.ReturnStatement(createReturnStatement(createTypedExpression('string')))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should handle same function type nested', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.ArrowFunctionExpression(createArrowFunction('string'))
      visitor.ArrowFunctionExpression(createArrowFunction('number'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['ArrowFunctionExpression:exit'](null)
      visitor['ArrowFunctionExpression:exit'](null)
      expect(reports.length).toBe(1)
    })
  })

  describe('ArrowFunctionExpression specific', () => {
    test('should report any return in arrow function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.ArrowFunctionExpression(createArrowFunction('string'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['ArrowFunctionExpression:exit'](null)
      expect(reports.length).toBe(1)
    })

    test('should report unknown return in arrow function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.ArrowFunctionExpression(createArrowFunction('string'))
      visitor.ReturnStatement(createReturnStatement(createUnknownExpression()))
      visitor['ArrowFunctionExpression:exit'](null)
      expect(reports.length).toBe(1)
    })

    test('should not report safe return in arrow function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.ArrowFunctionExpression(createArrowFunction('string'))
      visitor.ReturnStatement(createReturnStatement(createTypedExpression('string')))
      visitor['ArrowFunctionExpression:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should handle null node in ArrowFunctionExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      expect(() => visitor.ArrowFunctionExpression(null)).not.toThrow()
    })

    test('should handle arrow function with no return type and any return', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.ArrowFunctionExpression(createArrowFunction(null))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['ArrowFunctionExpression:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should handle arrow function with narrowed return', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.ArrowFunctionExpression(createArrowFunction('string'))
      visitor.ReturnStatement(createReturnStatement(createNarrowedCall('String')))
      visitor['ArrowFunctionExpression:exit'](null)
      expect(reports.length).toBe(0)
    })
  })

  describe('FunctionExpression specific', () => {
    test('should report any return in function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionExpression(createFunctionExpression('string'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['FunctionExpression:exit'](null)
      expect(reports.length).toBe(1)
    })

    test('should report unknown return in function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionExpression(createFunctionExpression('string'))
      visitor.ReturnStatement(createReturnStatement(createUnknownExpression()))
      visitor['FunctionExpression:exit'](null)
      expect(reports.length).toBe(1)
    })

    test('should not report safe return in function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionExpression(createFunctionExpression('number'))
      visitor.ReturnStatement(createReturnStatement(createTypedExpression('number')))
      visitor['FunctionExpression:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should handle null node in FunctionExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      expect(() => visitor.FunctionExpression(null)).not.toThrow()
    })

    test('should handle function expression with no return type and any return', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionExpression(createFunctionExpression(null))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['FunctionExpression:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should handle function expression with narrowed return', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionExpression(createFunctionExpression('boolean'))
      visitor.ReturnStatement(createReturnStatement(createNarrowedCall('Boolean')))
      visitor['FunctionExpression:exit'](null)
      expect(reports.length).toBe(0)
    })
  })

  describe('ReturnStatement edge cases', () => {
    test('should handle return with no argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should handle return with undefined argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: undefined,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should handle return with null argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should handle return with empty string argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: '',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should handle return with 0 argument (falsy)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: 0,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should handle return with false argument (falsy)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: false,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should handle return outside any function context', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      expect(reports.length).toBe(0)
    })

    test('should handle return with non-object argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: 42,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })
  })

  describe('violation properties', () => {
    test('should include correct start line in loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression(), 10, 5))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports[0].loc?.start.line).toBe(10)
    })

    test('should include correct start column in loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression(), 10, 5))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should include end location in loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression(), 10, 5))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should have correct end column', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression(), 10, 5))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports[0].loc?.end.column).toBe(15)
    })

    test('should include Unsafe return prefix in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports[0].message).toMatch(/^Unsafe return\./)
    })

    test('should include type guards guidance in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports[0].message).toContain('type guards or validation')
    })

    test('should have complete message for any return', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports[0].message).toBe(
        'Unsafe return. Returning a value of type any bypasses type safety. Use type guards or validation before returning.',
      )
    })

    test('should have complete message for unknown return', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createUnknownExpression()))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports[0].message).toBe(
        'Unsafe return. Returning a value of type unknown without type narrowing is unsafe. Use type guards or validation before returning.',
      )
    })
  })

  describe('extractLocation edge cases', () => {
    test('should return default loc for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement({ type: 'ReturnStatement', argument: createAnyExpression() })
      visitor['FunctionDeclaration:exit'](null)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should return default loc for undefined loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      const node = { type: 'ReturnStatement', argument: createAnyExpression() }
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(node)
      visitor['FunctionDeclaration:exit'](null)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle partial loc with missing end', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      const node = {
        type: 'ReturnStatement',
        argument: createAnyExpression(),
        loc: { start: { line: 5, column: 3 } },
      }
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(node)
      visitor['FunctionDeclaration:exit'](null)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(3)
      expect(reports[0].loc?.end.line).toBe(1)
      expect(reports[0].loc?.end.column).toBe(0)
    })

    test('should handle partial loc with missing start', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      const node = {
        type: 'ReturnStatement',
        argument: createAnyExpression(),
        loc: { end: { line: 10, column: 5 } },
      }
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(node)
      visitor['FunctionDeclaration:exit'](null)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc with non-number line', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      const node = {
        type: 'ReturnStatement',
        argument: createAnyExpression(),
        loc: { start: { line: 'abc', column: 0 }, end: { line: 1, column: 5 } },
      }
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(node)
      visitor['FunctionDeclaration:exit'](null)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with non-number column', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      const node = {
        type: 'ReturnStatement',
        argument: createAnyExpression(),
        loc: { start: { line: 1, column: 'abc' }, end: { line: 1, column: 5 } },
      }
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(node)
      visitor['FunctionDeclaration:exit'](null)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc with null start', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      const node = {
        type: 'ReturnStatement',
        argument: createAnyExpression(),
        loc: { start: null, end: { line: 5, column: 3 } },
      }
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(node)
      visitor['FunctionDeclaration:exit'](null)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  describe('multiple violations', () => {
    test('should report two any returns in same function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression(), 3, 0))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression(), 5, 0))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(2)
    })

    test('should report three any returns in same function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression(), 3, 0))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression(), 5, 0))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression(), 7, 0))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(3)
    })

    test('should report mixed any and unknown returns in same function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression(), 3, 0))
      visitor.ReturnStatement(createReturnStatement(createUnknownExpression(), 5, 0))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(2)
    })

    test('should report only unsafe returns, not safe ones', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createTypedExpression('string'), 3, 0))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression(), 5, 0))
      visitor.ReturnStatement(createReturnStatement(createTypedExpression('string'), 7, 0))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
    })

    test('should report violations across separate functions', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['FunctionDeclaration:exit'](null)
      visitor.ArrowFunctionExpression(createArrowFunction('number'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['ArrowFunctionExpression:exit'](null)
      expect(reports.length).toBe(2)
    })

    test('should report violations across three functions', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['FunctionDeclaration:exit'](null)
      visitor.FunctionExpression(createFunctionExpression('number'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['FunctionExpression:exit'](null)
      visitor.ArrowFunctionExpression(createArrowFunction('boolean'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['ArrowFunctionExpression:exit'](null)
      expect(reports.length).toBe(3)
    })

    test('should report 4+ violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression(), 2, 0))
      visitor.ReturnStatement(createReturnStatement(createUnknownExpression(), 3, 0))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression(), 4, 0))
      visitor.ReturnStatement(createReturnStatement(createUnknownExpression(), 5, 0))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression(), 6, 0))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(5)
    })

    test('should report violations in nested functions separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression(), 2, 0))
      visitor.ArrowFunctionExpression(createArrowFunction('number'))
      visitor.ReturnStatement(createReturnStatement(createUnknownExpression(), 4, 0))
      visitor['ArrowFunctionExpression:exit'](null)
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(2)
    })
  })

  describe('additional edge cases', () => {
    test('should handle undefined node in ArrowFunctionExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      expect(() => visitor.ArrowFunctionExpression(undefined)).not.toThrow()
    })

    test('should handle undefined node in FunctionExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      expect(() => visitor.FunctionExpression(undefined)).not.toThrow()
    })

    test('should handle string node in FunctionExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      expect(() => visitor.FunctionExpression('function')).not.toThrow()
    })

    test('should handle number node in ArrowFunctionExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      expect(() => visitor.ArrowFunctionExpression(42)).not.toThrow()
    })

    test('should handle node with returnType but no typeAnnotation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      const funcNode = {
        type: 'FunctionDeclaration',
        returnType: {},
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.FunctionDeclaration(funcNode)
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should handle node with returnType.typeAnnotation as null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      const funcNode = {
        type: 'FunctionDeclaration',
        returnType: { typeAnnotation: null },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.FunctionDeclaration(funcNode)
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression with non-Identifier callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      const call = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'fn' },
        },
        arguments: [],
      }
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(call))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression with non-narrowing callee name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      const call = createNarrowedCall('parseInt')
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(call))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should handle node with typeAnnotation of unknown type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      const expr = {
        type: 'SomeOtherExpression',
        typeAnnotation: { type: 'TSVoidKeyword' },
      }
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(expr))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should handle return statement node being non-object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      expect(() => visitor.ReturnStatement('return')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle TSAsExpression with null typeAnnotation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      const expr = {
        type: 'TSAsExpression',
        expression: { type: 'Identifier', name: 'val' },
        typeAnnotation: null,
      }
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(expr))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should handle TSTypeReference with non-Identifier typeName', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      const expr = {
        type: 'TSAsExpression',
        expression: { type: 'Identifier', name: 'val' },
        typeAnnotation: {
          type: 'TSTypeReference',
          typeName: {
            type: 'QualifiedIdentifier',
            left: { type: 'Identifier', name: 'NS' },
            right: { type: 'Identifier', name: 'Type' },
          },
        },
      }
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(expr))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should handle typeAnnotation with bare Identifier type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      const expr = {
        type: 'SomeExpr',
        typeAnnotation: { type: 'Identifier', name: 'MyType' },
      }
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(expr))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-string name in Identifier typeAnnotation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      const expr = {
        type: 'SomeExpr',
        typeAnnotation: { type: 'Identifier', name: 123 },
      }
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(expr))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should handle empty object as return argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {},
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should handle createMockContext with custom file path', () => {
      const { context, reports } = createMockContext({}, '/custom/path.ts')
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(1)
    })

    test('should handle createMockContext with custom source', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'function test(): string { return x as any; }',
      )
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement(createReturnStatement(createAnyExpression()))
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(1)
    })

    test('should handle boolean false argument in return (falsy check)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement({ type: 'ReturnStatement', argument: false })
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should handle zero argument in return (falsy check)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement({ type: 'ReturnStatement', argument: 0 })
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })

    test('should handle empty string argument in return (falsy check)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeReturnRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('string'))
      visitor.ReturnStatement({ type: 'ReturnStatement', argument: '' })
      visitor['FunctionDeclaration:exit'](null)
      expect(reports.length).toBe(0)
    })
  })
})
