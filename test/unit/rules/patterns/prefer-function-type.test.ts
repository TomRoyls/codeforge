import { describe, test, expect, vi } from 'vitest'
import { preferFunctionTypeRule } from '../../../../src/rules/patterns/prefer-function-type.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  fix?: { range: readonly [number, number]; text: string }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'interface Callable { (): void }',
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
        fix: descriptor.fix,
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

function createTSInterfaceDeclaration(
  name: string,
  body: unknown[],
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'TSInterfaceDeclaration',
    id: {
      type: 'Identifier',
      name,
    },
    body: {
      type: 'TSInterfaceBody',
      body,
    },
    loc: {
      start: { line, column },
      end: { line, column: name.length + 10 },
    },
    range: [column, column + name.length + 10],
  }
}

function createTSCallSignatureDeclaration(params: unknown[] = [], returnType?: unknown): unknown {
  return {
    type: 'TSCallSignatureDeclaration',
    params,
    returnType,
  }
}

function createTSPropertySignature(): unknown {
  return {
    type: 'TSPropertySignature',
    key: {
      type: 'Identifier',
      name: 'value',
    },
  }
}

function createTSMethodSignature(): unknown {
  return {
    type: 'TSMethodSignature',
    key: {
      type: 'Identifier',
      name: 'method',
    },
  }
}

describe('prefer-function-type rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferFunctionTypeRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferFunctionTypeRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(preferFunctionTypeRule.meta.docs?.recommended).toBe(false)
    })

    test('should have patterns category', () => {
      expect(preferFunctionTypeRule.meta.docs?.category).toBe('patterns')
    })

    test('should have empty schema', () => {
      expect(preferFunctionTypeRule.meta.schema).toEqual([])
    })

    test('should be fixable', () => {
      expect(preferFunctionTypeRule.meta.fixable).toBe('code')
    })

    test('should mention function type in description', () => {
      const description = preferFunctionTypeRule.meta.docs?.description.toLowerCase()
      expect(description).toContain('function type')
    })

    test('should mention call signature in description', () => {
      const description = preferFunctionTypeRule.meta.docs?.description.toLowerCase()
      expect(description).toContain('call signature')
    })

    test('should have documentation URL', () => {
      expect(preferFunctionTypeRule.meta.docs?.url).toContain('prefer-function-type')
    })
  })

  describe('create', () => {
    test('should return visitor object with TSInterfaceDeclaration method', () => {
      const { context } = createMockContext()
      const visitor = preferFunctionTypeRule.create(context)

      expect(visitor).toHaveProperty('TSInterfaceDeclaration')
      expect(typeof visitor.TSInterfaceDeclaration).toBe('function')
    })
  })

  describe('detecting interfaces with only call signatures', () => {
    test('should report interface with single call signature', () => {
      const { context, reports } = createMockContext()
      const visitor = preferFunctionTypeRule.create(context)

      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('Callable', [callSignature])

      visitor.TSInterfaceDeclaration(interfaceNode)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Callable')
      expect(reports[0].message).toContain('function type')
    })

    test('should report interface with multiple call signatures', () => {
      const { context, reports } = createMockContext()
      const visitor = preferFunctionTypeRule.create(context)

      const callSignature1 = createTSCallSignatureDeclaration()
      const callSignature2 = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('Overloaded', [
        callSignature1,
        callSignature2,
      ])

      visitor.TSInterfaceDeclaration(interfaceNode)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Overloaded')
    })

    test('should not report interface with property signatures', () => {
      const { context, reports } = createMockContext()
      const visitor = preferFunctionTypeRule.create(context)

      const propertySignature = createTSPropertySignature()
      const interfaceNode = createTSInterfaceDeclaration('ObjectLike', [propertySignature])

      visitor.TSInterfaceDeclaration(interfaceNode)

      expect(reports.length).toBe(0)
    })

    test('should not report interface with method signatures', () => {
      const { context, reports } = createMockContext()
      const visitor = preferFunctionTypeRule.create(context)

      const methodSignature = createTSMethodSignature()
      const interfaceNode = createTSInterfaceDeclaration('WithMethods', [methodSignature])

      visitor.TSInterfaceDeclaration(interfaceNode)

      expect(reports.length).toBe(0)
    })

    test('should not report interface with mixed call and property signatures', () => {
      const { context, reports } = createMockContext()
      const visitor = preferFunctionTypeRule.create(context)

      const callSignature = createTSCallSignatureDeclaration()
      const propertySignature = createTSPropertySignature()
      const interfaceNode = createTSInterfaceDeclaration('Mixed', [
        callSignature,
        propertySignature,
      ])

      visitor.TSInterfaceDeclaration(interfaceNode)

      expect(reports.length).toBe(0)
    })

    test('should not report empty interface', () => {
      const { context, reports } = createMockContext()
      const visitor = preferFunctionTypeRule.create(context)

      const interfaceNode = createTSInterfaceDeclaration('Empty', [])

      visitor.TSInterfaceDeclaration(interfaceNode)

      expect(reports.length).toBe(0)
    })
  })

  describe('fix generation', () => {
    test('should provide fix for interface with call signature', () => {
      const { context, reports } = createMockContext()
      const visitor = preferFunctionTypeRule.create(context)

      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('Callable', [callSignature])

      visitor.TSInterfaceDeclaration(interfaceNode)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toContain('type Callable')
    })

    test('should generate function type with arrow syntax', () => {
      const { context, reports } = createMockContext()
      const visitor = preferFunctionTypeRule.create(context)

      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('MyCallable', [callSignature])

      visitor.TSInterfaceDeclaration(interfaceNode)

      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toContain('=>')
    })

    test('should handle interface with parameters', () => {
      const { context, reports } = createMockContext()
      const visitor = preferFunctionTypeRule.create(context)

      const params = [
        { type: 'Identifier', name: 'x' },
        { type: 'Identifier', name: 'y' },
      ]
      const callSignature = createTSCallSignatureDeclaration(params)
      const interfaceNode = createTSInterfaceDeclaration('WithParams', [callSignature])

      visitor.TSInterfaceDeclaration(interfaceNode)

      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toContain('x, y')
    })

    test('should handle void return type', () => {
      const { context, reports } = createMockContext()
      const visitor = preferFunctionTypeRule.create(context)

      const returnType = {
        type: 'TSTypeAnnotation',
        typeAnnotation: { type: 'TSVoidKeyword' },
      }
      const callSignature = createTSCallSignatureDeclaration([], returnType)
      const interfaceNode = createTSInterfaceDeclaration('VoidReturn', [callSignature])

      visitor.TSInterfaceDeclaration(interfaceNode)

      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toContain('=> void')
    })

    test('should handle string return type', () => {
      const { context, reports } = createMockContext()
      const visitor = preferFunctionTypeRule.create(context)

      const returnType = {
        type: 'TSTypeAnnotation',
        typeAnnotation: { type: 'TSStringKeyword' },
      }
      const callSignature = createTSCallSignatureDeclaration([], returnType)
      const interfaceNode = createTSInterfaceDeclaration('StringReturn', [callSignature])

      visitor.TSInterfaceDeclaration(interfaceNode)

      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toContain('=> string')
    })

    test('should handle number return type', () => {
      const { context, reports } = createMockContext()
      const visitor = preferFunctionTypeRule.create(context)

      const returnType = {
        type: 'TSTypeAnnotation',
        typeAnnotation: { type: 'TSNumberKeyword' },
      }
      const callSignature = createTSCallSignatureDeclaration([], returnType)
      const interfaceNode = createTSInterfaceDeclaration('NumberReturn', [callSignature])

      visitor.TSInterfaceDeclaration(interfaceNode)

      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toContain('=> number')
    })

    test('should handle boolean return type', () => {
      const { context, reports } = createMockContext()
      const visitor = preferFunctionTypeRule.create(context)

      const returnType = {
        type: 'TSTypeAnnotation',
        typeAnnotation: { type: 'TSBooleanKeyword' },
      }
      const callSignature = createTSCallSignatureDeclaration([], returnType)
      const interfaceNode = createTSInterfaceDeclaration('BooleanReturn', [callSignature])

      visitor.TSInterfaceDeclaration(interfaceNode)

      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toContain('=> boolean')
    })

    test('should handle any return type', () => {
      const { context, reports } = createMockContext()
      const visitor = preferFunctionTypeRule.create(context)

      const returnType = {
        type: 'TSTypeAnnotation',
        typeAnnotation: { type: 'TSAnyKeyword' },
      }
      const callSignature = createTSCallSignatureDeclaration([], returnType)
      const interfaceNode = createTSInterfaceDeclaration('AnyReturn', [callSignature])

      visitor.TSInterfaceDeclaration(interfaceNode)

      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toContain('=> any')
    })

    test('should handle custom type reference', () => {
      const { context, reports } = createMockContext()
      const visitor = preferFunctionTypeRule.create(context)

      const returnType = {
        type: 'TSTypeAnnotation',
        typeAnnotation: {
          type: 'TSTypeReference',
          typeName: { type: 'Identifier', name: 'CustomType' },
        },
      }
      const callSignature = createTSCallSignatureDeclaration([], returnType)
      const interfaceNode = createTSInterfaceDeclaration('CustomReturn', [callSignature])

      visitor.TSInterfaceDeclaration(interfaceNode)

      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toContain('=> CustomType')
    })

    test('should handle rest parameters', () => {
      const { context, reports } = createMockContext()
      const visitor = preferFunctionTypeRule.create(context)

      const params = [{ type: 'RestElement', argument: { type: 'Identifier', name: 'args' } }]
      const callSignature = createTSCallSignatureDeclaration(params)
      const interfaceNode = createTSInterfaceDeclaration('WithRest', [callSignature])

      visitor.TSInterfaceDeclaration(interfaceNode)

      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toContain('...args')
    })

    test('should use param names for unnamed parameters', () => {
      const { context, reports } = createMockContext()
      const visitor = preferFunctionTypeRule.create(context)

      const params = [{ type: 'unknown' }, { type: 'unknown' }]
      const callSignature = createTSCallSignatureDeclaration(params)
      const interfaceNode = createTSInterfaceDeclaration('Unnamed', [callSignature])

      visitor.TSInterfaceDeclaration(interfaceNode)

      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toContain('param1')
      expect(reports[0].fix?.text).toContain('param2')
    })

    test('should default to void return type when missing', () => {
      const { context, reports } = createMockContext()
      const visitor = preferFunctionTypeRule.create(context)

      const callSignature = createTSCallSignatureDeclaration([])
      const interfaceNode = createTSInterfaceDeclaration('NoReturn', [callSignature])

      visitor.TSInterfaceDeclaration(interfaceNode)

      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toContain('=> void')
    })
  })

  describe('reporting location', () => {
    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferFunctionTypeRule.create(context)

      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('Test', [callSignature], 10, 5)

      visitor.TSInterfaceDeclaration(interfaceNode)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should include range in fix', () => {
      const { context, reports } = createMockContext()
      const visitor = preferFunctionTypeRule.create(context)

      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('Test', [callSignature], 1, 10)

      visitor.TSInterfaceDeclaration(interfaceNode)

      expect(reports.length).toBe(1)
      expect(reports[0].fix?.range).toBeDefined()
      expect(Array.isArray(reports[0].fix?.range)).toBe(true)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferFunctionTypeRule.create(context)

      expect(() => visitor.TSInterfaceDeclaration(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferFunctionTypeRule.create(context)

      expect(() => visitor.TSInterfaceDeclaration(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferFunctionTypeRule.create(context)

      expect(() => visitor.TSInterfaceDeclaration('string')).not.toThrow()
      expect(() => visitor.TSInterfaceDeclaration(123)).not.toThrow()
    })

    test('should handle node without body', () => {
      const { context, reports } = createMockContext()
      const visitor = preferFunctionTypeRule.create(context)

      const node = {
        type: 'TSInterfaceDeclaration',
        id: {
          type: 'Identifier',
          name: 'Test',
        },
      }

      expect(() => visitor.TSInterfaceDeclaration(node)).toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without id', () => {
      const { context, reports } = createMockContext()
      const visitor = preferFunctionTypeRule.create(context)

      const node = {
        type: 'TSInterfaceDeclaration',
        body: {
          type: 'TSInterfaceBody',
          body: [],
        },
      }

      expect(() => visitor.TSInterfaceDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc or range', () => {
      const { context, reports } = createMockContext()
      const visitor = preferFunctionTypeRule.create(context)

      const callSignature = createTSCallSignatureDeclaration()
      const node = {
        type: 'TSInterfaceDeclaration',
        id: {
          type: 'Identifier',
          name: 'Test',
        },
        body: {
          type: 'TSInterfaceBody',
          body: [callSignature],
        },
      }

      visitor.TSInterfaceDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].fix).toBeUndefined()
    })

    test('should handle interface with type parameters', () => {
      const { context, reports } = createMockContext()
      const visitor = preferFunctionTypeRule.create(context)

      const callSignature = createTSCallSignatureDeclaration()
      const node = {
        type: 'TSInterfaceDeclaration',
        id: {
          type: 'Identifier',
          name: 'Generic',
        },
        typeParameters: {
          type: 'TSTypeParameterDeclaration',
          params: [{ type: 'TSTypeParameter', name: { type: 'Identifier', name: 'T' } }],
        },
        body: {
          type: 'TSInterfaceBody',
          body: [callSignature],
        },
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 20 },
        },
        range: [0, 20],
      }

      visitor.TSInterfaceDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Generic')
    })

    test('should handle malformed call signature gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferFunctionTypeRule.create(context)

      const malformedCallSignature = { type: 'TSCallSignatureDeclaration' }
      const interfaceNode = createTSInterfaceDeclaration('Malformed', [malformedCallSignature])

      expect(() => visitor.TSInterfaceDeclaration(interfaceNode)).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })

  describe('message quality', () => {
    test('should include interface name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferFunctionTypeRule.create(context)

      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('MyInterface', [callSignature])

      visitor.TSInterfaceDeclaration(interfaceNode)

      expect(reports[0].message).toContain('MyInterface')
    })

    test('should mention call signature in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferFunctionTypeRule.create(context)

      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('Test', [callSignature])

      visitor.TSInterfaceDeclaration(interfaceNode)

      expect(reports[0].message).toContain('call signature')
    })

    test('should mention function type in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferFunctionTypeRule.create(context)

      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('Test', [callSignature])

      visitor.TSInterfaceDeclaration(interfaceNode)

      expect(reports[0].message).toContain('function type')
    })

    test('should include suggested type in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferFunctionTypeRule.create(context)

      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('Test', [callSignature])

      visitor.TSInterfaceDeclaration(interfaceNode)

      expect(reports[0].message).toContain('type Test')
    })
  })
})
