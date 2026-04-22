import { preferFunctionTypeRule } from '../../../../src/rules/patterns/prefer-function-type.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

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

function createTSPropertySignature(name = 'value'): unknown {
  return {
    type: 'TSPropertySignature',
    key: { type: 'Identifier', name },
  }
}

function createTSMethodSignature(name = 'method'): unknown {
  return {
    type: 'TSMethodSignature',
    key: { type: 'Identifier', name },
  }
}

function createReturnType(typeKeyword: string, typeName?: string): unknown {
  if (typeKeyword === 'TSTypeReference') {
    return {
      type: 'TSTypeAnnotation',
      typeAnnotation: {
        type: 'TSTypeReference',
        typeName: { type: 'Identifier', name: typeName ?? 'CustomType' },
      },
    }
  }
  return {
    type: 'TSTypeAnnotation',
    typeAnnotation: { type: typeKeyword },
  }
}

describe('prefer-function-type rule', () => {
  describe('meta properties', () => {
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

    test('should be fixable as code', () => {
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

    test('should have documentation URL containing rule name', () => {
      expect(preferFunctionTypeRule.meta.docs?.url).toContain('prefer-function-type')
    })

    test('should have defined docs object', () => {
      expect(preferFunctionTypeRule.meta.docs).toBeDefined()
    })

    test('should have non-empty description string', () => {
      expect(typeof preferFunctionTypeRule.meta.docs?.description).toBe('string')
      expect(preferFunctionTypeRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should mention concise in description', () => {
      const description = preferFunctionTypeRule.meta.docs?.description.toLowerCase()
      expect(description).toContain('concise')
    })

    test('should mention idiomatic in description', () => {
      const description = preferFunctionTypeRule.meta.docs?.description.toLowerCase()
      expect(description).toContain('idiomatic')
    })

    test('should have docs URL starting with https', () => {
      expect(preferFunctionTypeRule.meta.docs?.url).toMatch(/^https:/)
    })

    test('should not be deprecated', () => {
      expect(preferFunctionTypeRule.meta.deprecated).toBeFalsy()
    })

    test('should not have replacedBy', () => {
      expect(preferFunctionTypeRule.meta.replacedBy).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(preferFunctionTypeRule.meta.requiresTypeChecking).toBeFalsy()
    })

    test('should have meta type as valid RuleType', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(preferFunctionTypeRule.meta.type)
    })

    test('should have meta severity as valid Severity', () => {
      expect(['off', 'warn', 'error']).toContain(preferFunctionTypeRule.meta.severity)
    })

    test('should have docs category as string', () => {
      expect(typeof preferFunctionTypeRule.meta.docs?.category).toBe('string')
    })
  })

  describe('create and visitor structure', () => {
    test('should return visitor object from create', () => {
      const { context } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      expect(typeof visitor).toBe('object')
      expect(visitor).not.toBeNull()
    })

    test('should have TSInterfaceDeclaration method', () => {
      const { context } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      expect(visitor).toHaveProperty('TSInterfaceDeclaration')
    })

    test('should have TSInterfaceDeclaration as a function', () => {
      const { context } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      expect(typeof visitor.TSInterfaceDeclaration).toBe('function')
    })

    test('should have exactly one visitor key', () => {
      const { context } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      expect(Object.keys(visitor)).toHaveLength(1)
    })

    test('should not report during create call', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      preferFunctionTypeRule.create(context)
      expect(reports.length).toBe(0)
    })

    test('should work with empty options', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('Fn', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
    })

    test('should work with different file paths', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }', filePath: '/project/src/utils.ts' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('Fn', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
    })

    test('should return new visitor object on each create call', () => {
      const { context } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor1 = preferFunctionTypeRule.create(context)
      const visitor2 = preferFunctionTypeRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('should accept function-type visitor method', () => {
      const { context } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      expect(visitor.TSInterfaceDeclaration.length).toBeGreaterThanOrEqual(1)
    })

    test('should not throw when visitor is created with minimal context', () => {
      const { context } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      expect(() => preferFunctionTypeRule.create(context)).not.toThrow()
    })
  })

  describe('detecting interfaces with only call signatures', () => {
    test('should report interface with single call signature and no params', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('Callable', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Callable')
      expect(reports[0].message).toContain('function type')
    })

    test('should report interface with call signature and single identifier param', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const params = [{ type: 'Identifier', name: 'x' }]
      const callSignature = createTSCallSignatureDeclaration(params)
      const interfaceNode = createTSInterfaceDeclaration('UnaryFn', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toContain('x')
    })

    test('should report interface with call signature and two named params', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const params = [
        { type: 'Identifier', name: 'a' },
        { type: 'Identifier', name: 'b' },
      ]
      const callSignature = createTSCallSignatureDeclaration(params)
      const interfaceNode = createTSInterfaceDeclaration('BinaryFn', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toContain('a, b')
    })

    test('should report interface with call signature and three named params', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const params = [
        { type: 'Identifier', name: 'x' },
        { type: 'Identifier', name: 'y' },
        { type: 'Identifier', name: 'z' },
      ]
      const callSignature = createTSCallSignatureDeclaration(params)
      const interfaceNode = createTSInterfaceDeclaration('TernaryFn', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toContain('x, y, z')
    })

    test('should report interface with void return type', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const returnType = createReturnType('TSVoidKeyword')
      const callSignature = createTSCallSignatureDeclaration([], returnType)
      const interfaceNode = createTSInterfaceDeclaration('VoidFn', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toContain('=> void')
    })

    test('should report interface with string return type', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const returnType = createReturnType('TSStringKeyword')
      const callSignature = createTSCallSignatureDeclaration([], returnType)
      const interfaceNode = createTSInterfaceDeclaration('StringFn', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toContain('=> string')
    })

    test('should report interface with number return type', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const returnType = createReturnType('TSNumberKeyword')
      const callSignature = createTSCallSignatureDeclaration([], returnType)
      const interfaceNode = createTSInterfaceDeclaration('NumberFn', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toContain('=> number')
    })

    test('should report interface with boolean return type', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const returnType = createReturnType('TSBooleanKeyword')
      const callSignature = createTSCallSignatureDeclaration([], returnType)
      const interfaceNode = createTSInterfaceDeclaration('BoolFn', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toContain('=> boolean')
    })

    test('should report interface with any return type', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const returnType = createReturnType('TSAnyKeyword')
      const callSignature = createTSCallSignatureDeclaration([], returnType)
      const interfaceNode = createTSInterfaceDeclaration('AnyFn', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toContain('=> any')
    })

    test('should report interface with custom type reference return', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const returnType = createReturnType('TSTypeReference', 'MyType')
      const callSignature = createTSCallSignatureDeclaration([], returnType)
      const interfaceNode = createTSInterfaceDeclaration('CustomFn', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toContain('=> MyType')
    })

    test('should report interface with multiple call signatures (overload)', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
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

    test('should report interface with three call signatures', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const interfaceNode = createTSInterfaceDeclaration('TripleOverload', [
        createTSCallSignatureDeclaration(),
        createTSCallSignatureDeclaration(),
        createTSCallSignatureDeclaration(),
      ])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
    })

    test('should report interface with rest parameters', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const params = [{ type: 'RestElement', argument: { type: 'Identifier', name: 'args' } }]
      const callSignature = createTSCallSignatureDeclaration(params)
      const interfaceNode = createTSInterfaceDeclaration('VariadicFn', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toContain('...args')
    })

    test('should report interface with unnamed params using param index', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const params = [{ type: 'unknown' }, { type: 'unknown' }]
      const callSignature = createTSCallSignatureDeclaration(params)
      const interfaceNode = createTSInterfaceDeclaration('UnnamedParams', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toContain('param1')
      expect(reports[0].fix?.text).toContain('param2')
    })

    test('should report interface with mixed named and unnamed params', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const params = [{ type: 'Identifier', name: 'x' }, { type: 'unknown' }]
      const callSignature = createTSCallSignatureDeclaration(params)
      const interfaceNode = createTSInterfaceDeclaration('MixedParams', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toContain('x, param2')
    })

    test('should default to void when no return type specified', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration([], undefined)
      const interfaceNode = createTSInterfaceDeclaration('NoReturn', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toContain('=> void')
    })

    test('should detect interface named Fn', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('Fn', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Fn')
    })

    test('should detect interface named Callback', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('Callback', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
    })

    test('should detect interface named Handler', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('Handler', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
    })

    test('should detect interface named Converter', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('Converter', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
    })

    test('should detect interface named Predicate', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('Predicate', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
    })

    test('should detect interface named Resolver', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('Resolver', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
    })

    test('should detect interface named Mapper', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('Mapper', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
    })

    test('should detect interface with type parameters', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const node = {
        type: 'TSInterfaceDeclaration',
        id: { type: 'Identifier', name: 'Generic' },
        typeParameters: {
          type: 'TSTypeParameterDeclaration',
          params: [{ type: 'TSTypeParameter', name: { type: 'Identifier', name: 'T' } }],
        },
        body: { type: 'TSInterfaceBody', body: [callSignature] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20] as const,
      }
      visitor.TSInterfaceDeclaration(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Generic')
    })

    test('should detect interface with five named params', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const params = [
        { type: 'Identifier', name: 'a' },
        { type: 'Identifier', name: 'b' },
        { type: 'Identifier', name: 'c' },
        { type: 'Identifier', name: 'd' },
        { type: 'Identifier', name: 'e' },
      ]
      const callSignature = createTSCallSignatureDeclaration(params)
      const interfaceNode = createTSInterfaceDeclaration('FiveParams', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toContain('a, b, c, d, e')
    })

    test('should produce fix starting with type keyword', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('MyFn', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports[0].fix?.text).toMatch(/^type MyFn/)
    })

    test('should produce fix with arrow syntax', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('Arrow', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports[0].fix?.text).toContain('=>')
    })

    test('should produce fix with parentheses for params', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('Parens', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports[0].fix?.text).toContain('()')
    })

    test('should detect call signature with single RestElement param', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const params = [{ type: 'RestElement', argument: { type: 'Identifier', name: 'rest' } }]
      const callSignature = createTSCallSignatureDeclaration(params)
      const interfaceNode = createTSInterfaceDeclaration('RestFn', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toContain('...args')
    })

    test('should detect interface with params and return type combined', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const params = [{ type: 'Identifier', name: 'n' }]
      const returnType = createReturnType('TSNumberKeyword')
      const callSignature = createTSCallSignatureDeclaration(params, returnType)
      const interfaceNode = createTSInterfaceDeclaration('Combined', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toContain('n')
      expect(reports[0].fix?.text).toContain('=> number')
    })

    test('should detect interface named with single character T', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('T', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'T'")
    })

    test('should detect interface with long name', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const longName = 'VeryLongInterfaceNameThatDescribesACallableType'
      const interfaceNode = createTSInterfaceDeclaration(longName, [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toContain(`type ${longName}`)
    })

    test('should detect interface with call signature having empty params array', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration([])
      const interfaceNode = createTSInterfaceDeclaration('EmptyParams', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
    })

    test('should detect interface with TSNeverKeyword return type defaulting to void', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const returnType = createReturnType('TSNeverKeyword')
      const callSignature = createTSCallSignatureDeclaration([], returnType)
      const interfaceNode = createTSInterfaceDeclaration('NeverReturn', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toContain('=> void')
    })

    test('should detect interface with TSNullKeyword return defaulting to void', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const returnType = createReturnType('TSNullKeyword')
      const callSignature = createTSCallSignatureDeclaration([], returnType)
      const interfaceNode = createTSInterfaceDeclaration('NullReturn', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toContain('=> void')
    })

    test('should detect interface with TSUndefinedKeyword return defaulting to void', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const returnType = createReturnType('TSUndefinedKeyword')
      const callSignature = createTSCallSignatureDeclaration([], returnType)
      const interfaceNode = createTSInterfaceDeclaration('UndefinedReturn', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toContain('=> void')
    })

    test('should detect interface named Callable', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('Callable', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Callable')
    })
  })

  describe('not reporting non-call-signature interfaces', () => {
    test('should not report interface with property signature', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const interfaceNode = createTSInterfaceDeclaration('Obj', [createTSPropertySignature()])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(0)
    })

    test('should not report interface with method signature', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const interfaceNode = createTSInterfaceDeclaration('WithMethods', [createTSMethodSignature()])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(0)
    })

    test('should not report interface with mixed call and property signatures', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const interfaceNode = createTSInterfaceDeclaration('Mixed', [
        createTSCallSignatureDeclaration(),
        createTSPropertySignature(),
      ])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(0)
    })

    test('should not report interface with mixed call and method signatures', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const interfaceNode = createTSInterfaceDeclaration('MixedCallMethod', [
        createTSCallSignatureDeclaration(),
        createTSMethodSignature(),
      ])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(0)
    })

    test('should not report empty interface', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const interfaceNode = createTSInterfaceDeclaration('Empty', [])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(0)
    })

    test('should not report interface with construct signature', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const constructSig = { type: 'TSConstructSignatureDeclaration' }
      const interfaceNode = createTSInterfaceDeclaration('Constructible', [constructSig])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(0)
    })

    test('should not report interface with index signature', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const indexSig = { type: 'TSIndexSignature' }
      const interfaceNode = createTSInterfaceDeclaration('Indexable', [indexSig])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(0)
    })

    test('should not report interface with type literal member', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const typeLiteral = { type: 'TSTypeLiteral' }
      const interfaceNode = createTSInterfaceDeclaration('WithLiteral', [typeLiteral])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(0)
    })

    test('should not report interface with property and method (no call sigs)', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const interfaceNode = createTSInterfaceDeclaration('ObjectLike', [
        createTSPropertySignature(),
        createTSMethodSignature(),
      ])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(0)
    })

    test('should not report interface with null body member', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const interfaceNode = createTSInterfaceDeclaration('WithNull', [null])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(0)
    })

    test('should not report interface with undefined body member', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const interfaceNode = createTSInterfaceDeclaration('WithUndefined', [undefined])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(0)
    })

    test('should not report interface with empty object member', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const interfaceNode = createTSInterfaceDeclaration('WithEmpty', [{}])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(0)
    })

    test('should not report for null node', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      visitor.TSInterfaceDeclaration(null)
      expect(reports.length).toBe(0)
    })

    test('should not report for undefined node', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      visitor.TSInterfaceDeclaration(undefined)
      expect(reports.length).toBe(0)
    })

    test('should not report for string node', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      visitor.TSInterfaceDeclaration('some string')
      expect(reports.length).toBe(0)
    })

    test('should not report for number node', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      visitor.TSInterfaceDeclaration(42)
      expect(reports.length).toBe(0)
    })

    test('should not report for boolean node', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      visitor.TSInterfaceDeclaration(true)
      expect(reports.length).toBe(0)
    })

    test('should not report for array node', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      visitor.TSInterfaceDeclaration([])
      expect(reports.length).toBe(0)
    })

    test('should not report for empty object node', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      visitor.TSInterfaceDeclaration({})
      expect(reports.length).toBe(0)
    })

    test('should not report for node with wrong type string', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      visitor.TSInterfaceDeclaration({ type: 'TSTypeAliasDeclaration' })
      expect(reports.length).toBe(0)
    })

    test('should not report for node with type ExpressionStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      visitor.TSInterfaceDeclaration({ type: 'ExpressionStatement' })
      expect(reports.length).toBe(0)
    })

    test('should not report interface with two properties and a method', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const interfaceNode = createTSInterfaceDeclaration('Complex', [
        createTSPropertySignature('name'),
        createTSPropertySignature('age'),
        createTSMethodSignature('greet'),
      ])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(0)
    })

    test('should not report interface with TSEnumMember body', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const enumMember = { type: 'TSEnumMember' }
      const interfaceNode = createTSInterfaceDeclaration('WithEnum', [enumMember])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(0)
    })

    test('should not report interface with TSAbstractProperty body', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const abstractProp = { type: 'TSAbstractProperty' }
      const interfaceNode = createTSInterfaceDeclaration('WithAbstract', [abstractProp])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(0)
    })

    test('should not report for false boolean node', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      visitor.TSInterfaceDeclaration(false)
      expect(reports.length).toBe(0)
    })

    test('should not report for zero number node', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      visitor.TSInterfaceDeclaration(0)
      expect(reports.length).toBe(0)
    })

    test('should not report for empty string node', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      visitor.TSInterfaceDeclaration('')
      expect(reports.length).toBe(0)
    })

    test('should not report interface with call sig and construct sig mixed', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const interfaceNode = createTSInterfaceDeclaration('Mixed', [
        createTSCallSignatureDeclaration(),
        { type: 'TSConstructSignatureDeclaration' },
      ])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(0)
    })

    test('should not report interface with member having unknown type', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const unknownMember = { type: 'SomeUnknownNodeType' }
      const interfaceNode = createTSInterfaceDeclaration('UnknownMember', [unknownMember])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      expect(() => visitor.TSInterfaceDeclaration(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      expect(() => visitor.TSInterfaceDeclaration(undefined)).not.toThrow()
    })

    test('should handle string node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      expect(() => visitor.TSInterfaceDeclaration('string')).not.toThrow()
    })

    test('should handle number node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      expect(() => visitor.TSInterfaceDeclaration(123)).not.toThrow()
    })

    test('should throw for node without body property', () => {
      const { context } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const node = {
        type: 'TSInterfaceDeclaration',
        id: { type: 'Identifier', name: 'NoBody' },
      }
      expect(() => visitor.TSInterfaceDeclaration(node)).toThrow()
    })

    test('should handle node without id with empty body', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const node = {
        type: 'TSInterfaceDeclaration',
        body: { type: 'TSInterfaceBody', body: [] },
      }
      expect(() => visitor.TSInterfaceDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should report node without loc or range but provide default location', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const node = {
        type: 'TSInterfaceDeclaration',
        id: { type: 'Identifier', name: 'NoLoc' },
        body: { type: 'TSInterfaceBody', body: [callSignature] },
      }
      visitor.TSInterfaceDeclaration(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].fix).toBeUndefined()
    })

    test('should handle malformed call signature gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const malformedCallSignature = { type: 'TSCallSignatureDeclaration' }
      const interfaceNode = createTSInterfaceDeclaration('Malformed', [malformedCallSignature])
      expect(() => visitor.TSInterfaceDeclaration(interfaceNode)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle call signature with null params', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = { type: 'TSCallSignatureDeclaration', params: null }
      const interfaceNode = createTSInterfaceDeclaration('NullParams', [callSignature])
      expect(() => visitor.TSInterfaceDeclaration(interfaceNode)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toContain('() => void')
    })

    test('should handle call signature with undefined params', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = { type: 'TSCallSignatureDeclaration', params: undefined }
      const interfaceNode = createTSInterfaceDeclaration('UndefinedParams', [callSignature])
      expect(() => visitor.TSInterfaceDeclaration(interfaceNode)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle returnType as null', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration([], null)
      const interfaceNode = createTSInterfaceDeclaration('NullReturn', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toContain('=> void')
    })

    test('should handle returnType as non-object string', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration([], 'string')
      const interfaceNode = createTSInterfaceDeclaration('StringReturn', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toContain('=> void')
    })

    test('should handle returnType without typeAnnotation', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const returnType = { type: 'TSTypeAnnotation' }
      const callSignature = createTSCallSignatureDeclaration([], returnType)
      const interfaceNode = createTSInterfaceDeclaration('NoAnnotation', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toContain('=> void')
    })

    test('should handle returnType with unknown type keyword', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const returnType = {
        type: 'TSTypeAnnotation',
        typeAnnotation: { type: 'TSObjectKeyword' },
      }
      const callSignature = createTSCallSignatureDeclaration([], returnType)
      const interfaceNode = createTSInterfaceDeclaration('ObjectReturn', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toContain('=> void')
    })

    test('should handle interface at high line number', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('FarAway', [callSignature], 500, 100)
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(500)
      expect(reports[0].loc?.start.column).toBe(100)
    })

    test('should handle interface at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('Origin', [callSignature], 1, 0)
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle node with type TSInterfaceDeclaration but body as non-interface-body', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const node = {
        type: 'TSInterfaceDeclaration',
        id: { type: 'Identifier', name: 'WeirdBody' },
        body: { type: 'TSInterfaceBody', body: [createTSCallSignatureDeclaration()] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        range: [0, 10] as const,
      }
      visitor.TSInterfaceDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('should handle TSTypeReference return without typeName', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const returnType = {
        type: 'TSTypeAnnotation',
        typeAnnotation: { type: 'TSTypeReference' },
      }
      const callSignature = createTSCallSignatureDeclaration([], returnType)
      const interfaceNode = createTSInterfaceDeclaration('NoTypeName', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toContain('=> void')
    })

    test('should handle TSTypeReference return with null typeName', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const returnType = {
        type: 'TSTypeAnnotation',
        typeAnnotation: { type: 'TSTypeReference', typeName: null },
      }
      const callSignature = createTSCallSignatureDeclaration([], returnType)
      const interfaceNode = createTSInterfaceDeclaration('NullTypeName', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toContain('=> void')
    })

    test('should handle interface name with underscores', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('__PrivateFn__', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('__PrivateFn__')
    })

    test('should handle interface name with dollar sign', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('$Handler', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('$Handler')
    })

    test('should handle interface name ending with numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('Handler123', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toContain('type Handler123')
    })

    test('should handle call signature with typeParameters', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = {
        type: 'TSCallSignatureDeclaration',
        params: [],
        returnType: undefined,
        typeParameters: { type: 'TSTypeParameterDeclaration', params: [] },
      }
      const interfaceNode = createTSInterfaceDeclaration('GenericCall', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
    })
  })

  describe('reporting location', () => {
    test('should report correct start line', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('Test', [callSignature], 10, 5)
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports[0].loc?.start.line).toBe(10)
    })

    test('should report correct start column', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('Test', [callSignature], 1, 25)
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports[0].loc?.start.column).toBe(25)
    })

    test('should report correct end line', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('Test', [callSignature], 5, 0)
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports[0].loc?.end.line).toBe(5)
    })

    test('should report correct end column', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('Test', [callSignature], 1, 0)
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports[0].loc?.end.column).toBe('Test'.length + 10)
    })

    test('should provide fix range as tuple', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('Test', [callSignature], 1, 10)
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports[0].fix?.range).toBeDefined()
      expect(Array.isArray(reports[0].fix?.range)).toBe(true)
    })

    test('should have fix range with two elements', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('Test', [callSignature], 1, 5)
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports[0].fix?.range?.length).toBe(2)
    })

    test('should have fix range start matching node range start', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('Test', [callSignature], 1, 15)
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports[0].fix?.range?.[0]).toBe(15)
    })

    test('should have fix range end matching node range end', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('Test', [callSignature], 1, 0)
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports[0].fix?.range?.[1]).toBe('Test'.length + 10)
    })

    test('should report location at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('A', [callSignature], 1, 0)
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports[0].loc?.start).toEqual({ line: 1, column: 0 })
    })

    test('should report location at offset column', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('B', [callSignature], 3, 8)
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports[0].loc?.start).toEqual({ line: 3, column: 8 })
    })

    test('should provide location with start and end objects', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('C', [callSignature], 1, 0)
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should provide location with line and column in start', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('D', [callSignature], 1, 0)
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(typeof reports[0].loc?.start.line).toBe('number')
      expect(typeof reports[0].loc?.start.column).toBe('number')
    })

    test('should provide location with line and column in end', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('E', [callSignature], 1, 0)
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(typeof reports[0].loc?.end.line).toBe('number')
      expect(typeof reports[0].loc?.end.column).toBe('number')
    })

    test('should provide fix with range and text', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('F', [callSignature], 1, 0)
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports[0].fix?.range).toBeDefined()
      expect(reports[0].fix?.text).toBeDefined()
      expect(typeof reports[0].fix?.text).toBe('string')
    })

    test('should not provide fix when range is missing', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const node = {
        type: 'TSInterfaceDeclaration',
        id: { type: 'Identifier', name: 'NoRange' },
        body: { type: 'TSInterfaceBody', body: [callSignature] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.TSInterfaceDeclaration(node)
      expect(reports[0].fix).toBeUndefined()
    })
  })

  describe('message quality', () => {
    test('should include interface name in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('MyInterface', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports[0].message).toContain('MyInterface')
    })

    test('should mention call signature in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('Test', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports[0].message).toContain('call signature')
    })

    test('should mention function type in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('Test', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports[0].message).toContain('function type')
    })

    test('should include suggested type in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('Test', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports[0].message).toContain('type Test')
    })

    test('should wrap suggestion in backticks', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('Test', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports[0].message).toContain('`type Test')
    })

    test('should start message with Interface', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('Test', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports[0].message).toMatch(/^Interface/)
    })

    test('should contain has only in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('Test', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports[0].message).toContain('has only')
    })

    test('should produce non-empty message string', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('Test', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(typeof reports[0].message).toBe('string')
      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should include arrow in suggested fix within message', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('Test', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports[0].message).toContain('=>')
    })

    test('should include interface name in quotes in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('Quoted', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports[0].message).toContain("'Quoted'")
    })

    test('should include complete suggestion for void return', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('Complete', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports[0].message).toContain('type Complete = () => void')
    })

    test('should include complete suggestion for typed return', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const returnType = createReturnType('TSStringKeyword')
      const callSignature = createTSCallSignatureDeclaration([], returnType)
      const interfaceNode = createTSInterfaceDeclaration('StrFn', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports[0].message).toContain('type StrFn = () => string')
    })

    test('should include complete suggestion for param case', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const params = [{ type: 'Identifier', name: 'x' }]
      const callSignature = createTSCallSignatureDeclaration(params)
      const interfaceNode = createTSInterfaceDeclaration('ParamFn', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports[0].message).toContain('type ParamFn = (x) => void')
    })

    test('should mention Use in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('Test', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports[0].message).toContain('Use a function type')
    })
  })

  describe('multiple reports', () => {
    test('should report two different interfaces independently', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const interfaceNode1 = createTSInterfaceDeclaration('Fn1', [
        createTSCallSignatureDeclaration(),
      ])
      const interfaceNode2 = createTSInterfaceDeclaration('Fn2', [
        createTSCallSignatureDeclaration(),
      ])
      visitor.TSInterfaceDeclaration(interfaceNode1)
      visitor.TSInterfaceDeclaration(interfaceNode2)
      expect(reports.length).toBe(2)
    })

    test('should report same interface called twice', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const interfaceNode = createTSInterfaceDeclaration('Repeated', [
        createTSCallSignatureDeclaration(),
      ])
      visitor.TSInterfaceDeclaration(interfaceNode)
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(2)
    })

    test('should handle reportable then non-reportable', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const reportable = createTSInterfaceDeclaration('Reportable', [
        createTSCallSignatureDeclaration(),
      ])
      const nonReportable = createTSInterfaceDeclaration('NonReportable', [
        createTSPropertySignature(),
      ])
      visitor.TSInterfaceDeclaration(reportable)
      visitor.TSInterfaceDeclaration(nonReportable)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Reportable')
    })

    test('should handle non-reportable then reportable', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const nonReportable = createTSInterfaceDeclaration('NonReportable', [
        createTSPropertySignature(),
      ])
      const reportable = createTSInterfaceDeclaration('Reportable', [
        createTSCallSignatureDeclaration(),
      ])
      visitor.TSInterfaceDeclaration(nonReportable)
      visitor.TSInterfaceDeclaration(reportable)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Reportable')
    })

    test('should report five different interfaces', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      for (let i = 0; i < 5; i++) {
        const interfaceNode = createTSInterfaceDeclaration(`Fn${i}`, [
          createTSCallSignatureDeclaration(),
        ])
        visitor.TSInterfaceDeclaration(interfaceNode)
      }
      expect(reports.length).toBe(5)
    })

    test('should keep reports independent', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const interfaceNode1 = createTSInterfaceDeclaration('First', [
        createTSCallSignatureDeclaration(),
      ])
      const returnType = createReturnType('TSStringKeyword')
      const interfaceNode2 = createTSInterfaceDeclaration('Second', [
        createTSCallSignatureDeclaration([], returnType),
      ])
      visitor.TSInterfaceDeclaration(interfaceNode1)
      visitor.TSInterfaceDeclaration(interfaceNode2)
      expect(reports[0].message).toContain('First')
      expect(reports[1].message).toContain('Second')
      expect(reports[0].fix?.text).toContain('=> void')
      expect(reports[1].fix?.text).toContain('=> string')
    })

    test('should handle null between reportable calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const interfaceNode = createTSInterfaceDeclaration('Around', [
        createTSCallSignatureDeclaration(),
      ])
      visitor.TSInterfaceDeclaration(interfaceNode)
      visitor.TSInterfaceDeclaration(null)
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(2)
    })

    test('should handle ten sequential calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      for (let i = 0; i < 10; i++) {
        const interfaceNode = createTSInterfaceDeclaration(`Fn${i}`, [
          createTSCallSignatureDeclaration(),
        ])
        visitor.TSInterfaceDeclaration(interfaceNode)
      }
      expect(reports.length).toBe(10)
    })

    test('should have separate visitors from same context produce independent reports', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor1 = preferFunctionTypeRule.create(context)
      const visitor2 = preferFunctionTypeRule.create(context)
      const interfaceNode = createTSInterfaceDeclaration('Shared', [
        createTSCallSignatureDeclaration(),
      ])
      visitor1.TSInterfaceDeclaration(interfaceNode)
      visitor2.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(2)
    })

    test('should produce reports with correct messages for each interface', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const interfaceNodeA = createTSInterfaceDeclaration('Alpha', [
        createTSCallSignatureDeclaration(),
      ])
      const interfaceNodeB = createTSInterfaceDeclaration('Beta', [
        createTSCallSignatureDeclaration(),
      ])
      visitor.TSInterfaceDeclaration(interfaceNodeA)
      visitor.TSInterfaceDeclaration(interfaceNodeB)
      expect(reports[0].message).toContain('Alpha')
      expect(reports[1].message).toContain('Beta')
    })

    test('should produce reports with correct fix text for each interface', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const interfaceNodeA = createTSInterfaceDeclaration('Alpha', [
        createTSCallSignatureDeclaration(),
      ])
      const interfaceNodeB = createTSInterfaceDeclaration('Beta', [
        createTSCallSignatureDeclaration(),
      ])
      visitor.TSInterfaceDeclaration(interfaceNodeA)
      visitor.TSInterfaceDeclaration(interfaceNodeB)
      expect(reports[0].fix?.text).toContain('type Alpha')
      expect(reports[1].fix?.text).toContain('type Beta')
    })

    test('should produce reports with correct locations for each interface', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const interfaceNodeA = createTSInterfaceDeclaration(
        'Alpha',
        [createTSCallSignatureDeclaration()],
        1,
        0,
      )
      const interfaceNodeB = createTSInterfaceDeclaration(
        'Beta',
        [createTSCallSignatureDeclaration()],
        5,
        10,
      )
      visitor.TSInterfaceDeclaration(interfaceNodeA)
      visitor.TSInterfaceDeclaration(interfaceNodeB)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
    })
  })

  describe('context interaction', () => {
    test('should use context getFilePath', () => {
      const { context } = createMockRuleContext({ source: 'interface Callable { (): void }', filePath: '/custom/path.ts' })
      expect(context.getFilePath()).toBe('/custom/path.ts')
    })

    test('should use context getSource', () => {
      const { context } = createMockRuleContext({ source: 'custom source', filePath: '/src/file.ts' })
      expect(context.getSource()).toBe('custom source')
    })

    test('should have config set on context', () => {
      const { context } = createMockRuleContext({ options: [{ strict: true }], source: 'interface Callable { (): void }' })
      expect(context.config).toBeDefined()
    })

    test('should have logger set on context', () => {
      const { context } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      expect(context.logger).toBeDefined()
    })

    test('should have workspaceRoot set on context', () => {
      const { context } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      expect(context.workspaceRoot).toBe('/src')
    })

    test('should work with different options', () => {
      const { context, reports } = createMockRuleContext({ options: [{ someOption: true }], source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('Ctx', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
    })

    test('should work with different file paths', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }', filePath: '/different/project/file.ts' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('Path', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const { context, reports } = createMockRuleContext({ source: 'type MyFn = () => void', filePath: '/src/file.ts' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('MyFn', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
    })

    test('should not call logger debug during detection', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('Logger', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
      expect(context.logger.debug).not.toHaveBeenCalled()
    })

    test('should not call logger info during detection', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('Logger', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
      expect(context.logger.info).not.toHaveBeenCalled()
    })

    test('should not call logger warn during detection', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('Logger', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
      expect(context.logger.warn).not.toHaveBeenCalled()
    })
  })

  describe('fix generation', () => {
    test('should generate fix with type keyword', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('Fix', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports[0].fix?.text).toContain('type Fix')
    })

    test('should generate fix with equals sign', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('Eq', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports[0].fix?.text).toContain('type Eq = ')
    })

    test('should generate fix with arrow for void return', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('Arrow', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports[0].fix?.text).toBe('type Arrow = () => void')
    })

    test('should generate fix with arrow for string return', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const returnType = createReturnType('TSStringKeyword')
      const callSignature = createTSCallSignatureDeclaration([], returnType)
      const interfaceNode = createTSInterfaceDeclaration('Str', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports[0].fix?.text).toBe('type Str = () => string')
    })

    test('should generate fix with arrow for number return', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const returnType = createReturnType('TSNumberKeyword')
      const callSignature = createTSCallSignatureDeclaration([], returnType)
      const interfaceNode = createTSInterfaceDeclaration('Num', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports[0].fix?.text).toBe('type Num = () => number')
    })

    test('should generate fix with arrow for boolean return', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const returnType = createReturnType('TSBooleanKeyword')
      const callSignature = createTSCallSignatureDeclaration([], returnType)
      const interfaceNode = createTSInterfaceDeclaration('Bool', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports[0].fix?.text).toBe('type Bool = () => boolean')
    })

    test('should generate fix with arrow for any return', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const returnType = createReturnType('TSAnyKeyword')
      const callSignature = createTSCallSignatureDeclaration([], returnType)
      const interfaceNode = createTSInterfaceDeclaration('Any', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports[0].fix?.text).toBe('type Any = () => any')
    })

    test('should generate fix with arrow for custom type return', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const returnType = createReturnType('TSTypeReference', 'Result')
      const callSignature = createTSCallSignatureDeclaration([], returnType)
      const interfaceNode = createTSInterfaceDeclaration('Custom', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports[0].fix?.text).toBe('type Custom = () => Result')
    })

    test('should generate fix with named params', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const params = [
        { type: 'Identifier', name: 'x' },
        { type: 'Identifier', name: 'y' },
      ]
      const callSignature = createTSCallSignatureDeclaration(params)
      const interfaceNode = createTSInterfaceDeclaration('Params', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports[0].fix?.text).toBe('type Params = (x, y) => void')
    })

    test('should generate fix with rest params', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const params = [{ type: 'RestElement', argument: { type: 'Identifier', name: 'args' } }]
      const callSignature = createTSCallSignatureDeclaration(params)
      const interfaceNode = createTSInterfaceDeclaration('Rest', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports[0].fix?.text).toBe('type Rest = (...args) => void')
    })

    test('should generate fix with unnamed params', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const params = [{ type: 'unknown' }]
      const callSignature = createTSCallSignatureDeclaration(params)
      const interfaceNode = createTSInterfaceDeclaration('Unnamed', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports[0].fix?.text).toBe('type Unnamed = (param1) => void')
    })

    test('should generate fix with mixed named and unnamed params', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const params = [
        { type: 'Identifier', name: 'a' },
        { type: 'unknown' },
        { type: 'Identifier', name: 'c' },
      ]
      const callSignature = createTSCallSignatureDeclaration(params)
      const interfaceNode = createTSInterfaceDeclaration('MixedFix', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports[0].fix?.text).toBe('type MixedFix = (a, param2, c) => void')
    })

    test('should generate fix with params and return type', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const params = [{ type: 'Identifier', name: 'n' }]
      const returnType = createReturnType('TSNumberKeyword')
      const callSignature = createTSCallSignatureDeclaration(params, returnType)
      const interfaceNode = createTSInterfaceDeclaration('Full', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports[0].fix?.text).toBe('type Full = (n) => number')
    })

    test('should generate fix using first call signature for overloads', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSig1 = createTSCallSignatureDeclaration(
        [{ type: 'Identifier', name: 'x' }],
        createReturnType('TSNumberKeyword'),
      )
      const callSig2 = createTSCallSignatureDeclaration(
        [{ type: 'Identifier', name: 's' }],
        createReturnType('TSStringKeyword'),
      )
      const interfaceNode = createTSInterfaceDeclaration('Overload', [callSig1, callSig2])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports[0].fix?.text).toBe('type Overload = (x) => number')
    })

    test('should generate fix text as non-empty string', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('NonEmpty', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports[0].fix?.text.length).toBeGreaterThan(0)
    })

    test('should generate fix text starting with type keyword', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('StartType', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports[0].fix?.text?.startsWith('type ')).toBe(true)
    })

    test('should generate fix with empty params parentheses', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration([])
      const interfaceNode = createTSInterfaceDeclaration('EmptyParens', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports[0].fix?.text).toContain('()')
    })
  })

  describe('parameterized return type detection', () => {
    test.each([
      { keyword: 'TSVoidKeyword', expected: 'void' },
      { keyword: 'TSStringKeyword', expected: 'string' },
      { keyword: 'TSNumberKeyword', expected: 'number' },
      { keyword: 'TSBooleanKeyword', expected: 'boolean' },
      { keyword: 'TSAnyKeyword', expected: 'any' },
    ])(
      'should detect interface with $keyword return type and produce => $expected',
      ({ keyword, expected }) => {
        const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
        const visitor = preferFunctionTypeRule.create(context)
        const returnType = createReturnType(keyword)
        const callSignature = createTSCallSignatureDeclaration([], returnType)
        const interfaceNode = createTSInterfaceDeclaration('Typed', [callSignature])
        visitor.TSInterfaceDeclaration(interfaceNode)
        expect(reports.length).toBe(1)
        expect(reports[0].fix?.text).toContain(`=> ${expected}`)
      },
    )

    test.each([
      { keyword: 'TSNeverKeyword', expected: 'void' },
      { keyword: 'TSNullKeyword', expected: 'void' },
      { keyword: 'TSUndefinedKeyword', expected: 'void' },
      { keyword: 'TSObjectKeyword', expected: 'void' },
      { keyword: 'TSSymbolKeyword', expected: 'void' },
    ])('should default unhandled $keyword return type to => $expected', ({ keyword, expected }) => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const returnType = createReturnType(keyword)
      const callSignature = createTSCallSignatureDeclaration([], returnType)
      const interfaceNode = createTSInterfaceDeclaration('Unhandled', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toContain(`=> ${expected}`)
    })
  })

  describe('parameterized param configurations', () => {
    test.each([
      { params: [], expected: '()' },
      { params: [{ type: 'Identifier', name: 'x' }], expected: '(x)' },
      {
        params: [
          { type: 'Identifier', name: 'a' },
          { type: 'Identifier', name: 'b' },
        ],
        expected: '(a, b)',
      },
      { params: [{ type: 'unknown' }], expected: '(param1)' },
      {
        params: [{ type: 'unknown' }, { type: 'unknown' }],
        expected: '(param1, param2)',
      },
      {
        params: [{ type: 'Identifier', name: 'a' }, { type: 'unknown' }],
        expected: '(a, param2)',
      },
      {
        params: [{ type: 'RestElement', argument: { type: 'Identifier', name: 'args' } }],
        expected: '(...args)',
      },
      {
        params: [
          { type: 'Identifier', name: 'first' },
          { type: 'RestElement', argument: { type: 'Identifier', name: 'rest' } },
        ],
        expected: '(first, ...args)',
      },
      {
        params: [
          { type: 'Identifier', name: 'a' },
          { type: 'Identifier', name: 'b' },
          { type: 'Identifier', name: 'c' },
        ],
        expected: '(a, b, c)',
      },
      {
        params: [
          { type: 'Identifier', name: 'p1' },
          { type: 'unknown' },
          { type: 'RestElement', argument: { type: 'Identifier', name: 'rest' } },
        ],
        expected: '(p1, param2, ...args)',
      },
    ])('should produce fix with params $expected', ({ params, expected }) => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration(params)
      const interfaceNode = createTSInterfaceDeclaration('ParamTest', [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toContain(expected)
    })
  })

  describe('parameterized interface names', () => {
    test.each([
      'Fn',
      'Callable',
      'Callback',
      'Handler',
      'Converter',
      'Mapper',
      'Predicate',
      'Resolver',
      'T',
      'Op',
      'Fn0',
      'MyFunc',
    ])('should detect reportable interface named %s', (name) => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration(name, [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain(name)
      expect(reports[0].fix?.text).toContain(`type ${name}`)
    })
  })

  describe('parameterized non-reportable members', () => {
    test.each([
      {
        member: { type: 'TSPropertySignature', key: { type: 'Identifier', name: 'prop' } },
        desc: 'TSPropertySignature',
      },
      {
        member: { type: 'TSMethodSignature', key: { type: 'Identifier', name: 'method' } },
        desc: 'TSMethodSignature',
      },
      { member: { type: 'TSIndexSignature' }, desc: 'TSIndexSignature' },
      {
        member: { type: 'TSConstructSignatureDeclaration' },
        desc: 'TSConstructSignatureDeclaration',
      },
      { member: { type: 'TSTypeLiteral' }, desc: 'TSTypeLiteral' },
      { member: { type: 'TSEnumMember' }, desc: 'TSEnumMember' },
      { member: { type: 'TSAbstractProperty' }, desc: 'TSAbstractProperty' },
      { member: { type: 'TSAbstractMethodSignature' }, desc: 'TSAbstractMethodSignature' },
      {
        member: { type: 'TSPropertySignature', key: { type: 'Identifier', name: 'x' } },
        desc: 'TSPropertySignature with call sig',
      },
      { member: null, desc: 'null member' },
      { member: undefined, desc: 'undefined member' },
      { member: {}, desc: 'empty object member' },
    ])('should not report when body has $desc', ({ member }) => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const interfaceNode = createTSInterfaceDeclaration('NotReportable', [member])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(0)
    })
  })

  describe('parameterized edge case nodes', () => {
    test.each([
      { node: null, desc: 'null' },
      { node: undefined, desc: 'undefined' },
      { node: '', desc: 'empty string' },
      { node: 0, desc: 'zero' },
      { node: false, desc: 'false' },
      { node: true, desc: 'true' },
      { node: [], desc: 'empty array' },
      { node: {}, desc: 'empty object' },
      { node: { type: 'Other' }, desc: 'wrong type' },
      { node: { type: 'TSTypeAliasDeclaration' }, desc: 'TSTypeAliasDeclaration' },
    ])('should not report for $desc node', ({ node }) => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      expect(() => visitor.TSInterfaceDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('parameterized location variations', () => {
    test.each([
      { line: 1, column: 0 },
      { line: 1, column: 5 },
      { line: 5, column: 0 },
      { line: 10, column: 10 },
      { line: 100, column: 0 },
      { line: 1, column: 100 },
      { line: 50, column: 50 },
      { line: 2, column: 3 },
      { line: 99, column: 99 },
      { line: 1, column: 42 },
    ])('should report correct location at line $line column $column', ({ line, column }) => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration()
      const interfaceNode = createTSInterfaceDeclaration('Loc', [callSignature], line, column)
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(line)
      expect(reports[0].loc?.start.column).toBe(column)
    })
  })

  describe('parameterized complete fix output', () => {
    test.each([
      {
        name: 'A',
        params: [] as unknown[],
        returnType: undefined as unknown,
        expected: 'type A = () => void',
      },
      {
        name: 'B',
        params: [{ type: 'Identifier', name: 'x' }],
        returnType: undefined as unknown,
        expected: 'type B = (x) => void',
      },
      {
        name: 'C',
        params: [] as unknown[],
        returnType: createReturnType('TSStringKeyword'),
        expected: 'type C = () => string',
      },
      {
        name: 'D',
        params: [] as unknown[],
        returnType: createReturnType('TSNumberKeyword'),
        expected: 'type D = () => number',
      },
      {
        name: 'E',
        params: [] as unknown[],
        returnType: createReturnType('TSBooleanKeyword'),
        expected: 'type E = () => boolean',
      },
      {
        name: 'F',
        params: [] as unknown[],
        returnType: createReturnType('TSAnyKeyword'),
        expected: 'type F = () => any',
      },
      {
        name: 'G',
        params: [] as unknown[],
        returnType: createReturnType('TSTypeReference', 'MyType'),
        expected: 'type G = () => MyType',
      },
      {
        name: 'H',
        params: [{ type: 'Identifier', name: 'n' }],
        returnType: createReturnType('TSNumberKeyword'),
        expected: 'type H = (n) => number',
      },
      {
        name: 'I',
        params: [
          { type: 'Identifier', name: 'a' },
          { type: 'Identifier', name: 'b' },
        ],
        returnType: createReturnType('TSVoidKeyword'),
        expected: 'type I = (a, b) => void',
      },
      {
        name: 'J',
        params: [{ type: 'RestElement', argument: { type: 'Identifier', name: 'args' } }],
        returnType: undefined as unknown,
        expected: 'type J = (...args) => void',
      },
      {
        name: 'K',
        params: [{ type: 'unknown' }],
        returnType: undefined as unknown,
        expected: 'type K = (param1) => void',
      },
      {
        name: 'L',
        params: [
          { type: 'Identifier', name: 'x' },
          { type: 'Identifier', name: 'y' },
        ],
        returnType: createReturnType('TSStringKeyword'),
        expected: 'type L = (x, y) => string',
      },
    ])('should generate fix "$expected"', ({ name, params, returnType, expected }) => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const callSignature = createTSCallSignatureDeclaration(params, returnType)
      const interfaceNode = createTSInterfaceDeclaration(name, [callSignature])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toBe(expected)
    })
  })

  describe('additional individual coverage', () => {
    test('should detect call signature interface named Action', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const interfaceNode = createTSInterfaceDeclaration('Action', [
        createTSCallSignatureDeclaration(),
      ])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
    })

    test('should detect call signature interface named Effect', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const interfaceNode = createTSInterfaceDeclaration('Effect', [
        createTSCallSignatureDeclaration(),
      ])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
    })

    test('should detect call signature interface named Dispatcher', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const interfaceNode = createTSInterfaceDeclaration('Dispatcher', [
        createTSCallSignatureDeclaration(),
      ])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
    })

    test('should detect call signature interface named Subscriber', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const interfaceNode = createTSInterfaceDeclaration('Subscriber', [
        createTSCallSignatureDeclaration(),
      ])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
    })

    test('should detect call signature interface named Operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const interfaceNode = createTSInterfaceDeclaration('Operator', [
        createTSCallSignatureDeclaration(),
      ])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
    })

    test('should detect call signature interface named Validator', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const interfaceNode = createTSInterfaceDeclaration('Validator', [
        createTSCallSignatureDeclaration(),
      ])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
    })

    test('should detect call signature interface named Comparator', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const interfaceNode = createTSInterfaceDeclaration('Comparator', [
        createTSCallSignatureDeclaration(),
      ])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
    })

    test('should not report interface with two properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const interfaceNode = createTSInterfaceDeclaration('TwoProps', [
        createTSPropertySignature('name'),
        createTSPropertySignature('value'),
      ])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(0)
    })

    test('should not report interface with two methods', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const interfaceNode = createTSInterfaceDeclaration('TwoMethods', [
        createTSMethodSignature('run'),
        createTSMethodSignature('stop'),
      ])
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(0)
    })

    test('should report interface at line 0 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const interfaceNode = createTSInterfaceDeclaration(
        'Zero',
        [createTSCallSignatureDeclaration()],
        0,
        0,
      )
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(0)
    })

    test('should not report for NaN node', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      visitor.TSInterfaceDeclaration(Number.NaN)
      expect(reports.length).toBe(0)
    })

    test('should not report for Symbol node', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      expect(() => visitor.TSInterfaceDeclaration(Symbol('test'))).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should report with correct end location for short interface name', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const interfaceNode = createTSInterfaceDeclaration(
        'A',
        [createTSCallSignatureDeclaration()],
        1,
        0,
      )
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports[0].loc?.end.column).toBe('A'.length + 10)
    })

    test('should produce fix range start at column offset', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const interfaceNode = createTSInterfaceDeclaration(
        'Ranged',
        [createTSCallSignatureDeclaration()],
        1,
        20,
      )
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports[0].fix?.range?.[0]).toBe(20)
    })

    test('should produce fix range end at column plus name length', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Callable { (): void }' })
      const visitor = preferFunctionTypeRule.create(context)
      const interfaceNode = createTSInterfaceDeclaration(
        'Measured',
        [createTSCallSignatureDeclaration()],
        1,
        0,
      )
      visitor.TSInterfaceDeclaration(interfaceNode)
      expect(reports[0].fix?.range?.[1]).toBe('Measured'.length + 10)
    })
  })
})
