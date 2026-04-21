import { describe, test, expect, vi } from 'vitest'
import { preferReadonlyParameterRule } from '../../../../src/rules/patterns/prefer-readonly-parameter.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'function fn(arr: string[]) {}',
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

function createTypeAnnotation(type: string, typeName?: string): unknown {
  if (type === 'TSArrayType') {
    return {
      type: 'TSArrayType',
      elementType: {
        type: 'TSKeywordType',
        keyword: typeName ?? 'string',
      },
    }
  }
  if (type === 'TSTypeReference') {
    return {
      type: 'TSTypeReference',
      typeName: {
        type: 'Identifier',
        name: typeName ?? 'Array',
      },
    }
  }
  if (type === 'TSTypeLiteral') {
    return {
      type: 'TSTypeLiteral',
      members: [],
    }
  }
  if (type === 'TSObjectKeyword') {
    return { type: 'TSObjectKeyword' }
  }
  return null
}

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

function createParameter(name: string, typeAnnotation: unknown, line = 1, column = 0): unknown {
  return {
    type: 'Identifier',
    name,
    typeAnnotation: {
      type: 'TSTypeAnnotation',
      typeAnnotation,
    },
    loc: {
      start: { line, column },
      end: { line, column: name.length + 10 },
    },
  }
}

function createRestParameter(name: string, typeAnnotation: unknown, line = 1, column = 0): unknown {
  return {
    type: 'RestElement',
    argument: {
      type: 'Identifier',
      name,
    },
    typeAnnotation: {
      type: 'TSTypeAnnotation',
      typeAnnotation,
    },
    loc: {
      start: { line, column },
      end: { line, column: name.length + 10 },
    },
  }
}

function createObjectPatternParameter(
  properties: string[],
  typeAnnotation: unknown,
  line = 1,
  column = 0,
): unknown {
  const mappedProperties = properties.map((prop) => {
    const endColumn = column + prop.length
    const propObj = {
      type: 'Property',
      key: { type: 'Identifier', name: prop },
      value: { type: 'Identifier', name: prop },
      kind: 'init',
      loc: { start: { line, column }, end: { line, column: endColumn } },
    }
    return propObj
  })

  const endColumn2 = column + 20
  return {
    type: 'ObjectPattern',
    properties: mappedProperties,
    typeAnnotation: {
      type: 'TSTypeAnnotation',
      typeAnnotation,
    },
    loc: {
      start: { line, column },
      end: { line, column: endColumn2 },
    },
  }
}

function createArrayPatternParameter(
  elements: string[],
  typeAnnotation: unknown,
  line = 1,
  column = 0,
): unknown {
  const mappedElements = elements.map((elem) => {
    const endColumn = column + elem.length
    const elemObj = {
      type: 'Identifier',
      name: elem,
      loc: { start: { line, column }, end: { line, column: endColumn } },
    }
    return elemObj
  })

  const endColumn2 = column + 20
  return {
    type: 'ArrayPattern',
    elements: mappedElements,
    typeAnnotation: {
      type: 'TSTypeAnnotation',
      typeAnnotation,
    },
    loc: {
      start: { line, column },
      end: { line, column: endColumn2 },
    },
  }
}

function createFunctionDeclaration(params: unknown[], line = 1, column = 0): unknown {
  const endColumn = column + 30
  return {
    type: 'FunctionDeclaration',
    id: { type: 'Identifier', name: 'testFunction' },
    params,
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: endColumn },
    },
  }
}

function createFunctionExpression(params: unknown[], line = 1, column = 0): unknown {
  const endColumn = column + 30
  return {
    type: 'FunctionExpression',
    id: null,
    params,
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: endColumn },
    },
  }
}

function createArrowFunctionExpression(params: unknown[], line = 1, column = 0): unknown {
  const endColumn = column + 30
  return {
    type: 'ArrowFunctionExpression',
    params,
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: endColumn },
    },
  }
}

function createMemberExpression(object: unknown, property: string, computed = false): unknown {
  return {
    type: 'MemberExpression',
    object,
    property: {
      type: 'Identifier',
      name: property,
    },
    computed,
  }
}

function createCallExpression(callee: unknown, args?: unknown[]): unknown {
  return {
    type: 'CallExpression',
    callee,
    arguments: args ?? [],
  }
}

function createAssignmentExpression(left: unknown, right: unknown): unknown {
  return {
    type: 'AssignmentExpression',
    left,
    right,
  }
}

function createUpdateExpression(argument: unknown, operator = '++'): unknown {
  return {
    type: 'UpdateExpression',
    operator,
    argument,
    prefix: false,
  }
}

function createUnaryExpression(argument: unknown, operator = 'delete'): unknown {
  return {
    type: 'UnaryExpression',
    operator,
    argument,
    prefix: true,
  }
}

function createLiteral(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
  }
}

function createArrayExpression(elements: unknown[] = []): unknown {
  return {
    type: 'ArrayExpression',
    elements,
  }
}

describe('prefer-readonly-parameter rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferReadonlyParameterRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferReadonlyParameterRule.meta.severity).toBe('warn')
    })

    test('should not be recommended by default', () => {
      expect(preferReadonlyParameterRule.meta.docs?.recommended).toBe(false)
    })

    test('should have patterns category', () => {
      expect(preferReadonlyParameterRule.meta.docs?.category).toBe('patterns')
    })

    test('should have empty schema', () => {
      expect(preferReadonlyParameterRule.meta.schema).toEqual([])
    })

    test('should be fixable', () => {
      expect(preferReadonlyParameterRule.meta.fixable).toBe('code')
    })

    test('should mention readonly in description', () => {
      expect(preferReadonlyParameterRule.meta.docs?.description.toLowerCase()).toContain('readonly')
    })

    test('should mention parameters in description', () => {
      expect(preferReadonlyParameterRule.meta.docs?.description.toLowerCase()).toContain(
        'parameter',
      )
    })

    test('should have docs property', () => {
      expect(preferReadonlyParameterRule.meta.docs).toBeDefined()
    })

    test('should have a non-empty description', () => {
      expect(preferReadonlyParameterRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have a docs url', () => {
      expect(preferReadonlyParameterRule.meta.docs?.url).toBeDefined()
    })

    test('should have a url containing the rule name', () => {
      expect(preferReadonlyParameterRule.meta.docs?.url).toContain('prefer-readonly-parameter')
    })

    test('should not be deprecated', () => {
      expect(preferReadonlyParameterRule.meta.deprecated).toBeUndefined()
    })

    test('should not have replacedBy', () => {
      expect(preferReadonlyParameterRule.meta.replacedBy).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(preferReadonlyParameterRule.meta.requiresTypeChecking).toBeUndefined()
    })

    test('should have type as one of valid RuleType values', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(preferReadonlyParameterRule.meta.type)
    })

    test('should have severity as one of valid Severity values', () => {
      expect(['off', 'warn', 'error']).toContain(preferReadonlyParameterRule.meta.severity)
    })

    test('should have fixable as valid value', () => {
      expect(preferReadonlyParameterRule.meta.fixable).toBeOneOf(['code', 'whitespace'])
    })

    test('should have meta as a plain object', () => {
      expect(typeof preferReadonlyParameterRule.meta).toBe('object')
      expect(preferReadonlyParameterRule.meta).not.toBeNull()
    })

    test('should have meta.type as a string', () => {
      expect(typeof preferReadonlyParameterRule.meta.type).toBe('string')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      expect(visitor).toHaveProperty('FunctionDeclaration')
      expect(visitor).toHaveProperty('FunctionDeclaration:exit')
      expect(visitor).toHaveProperty('FunctionExpression')
      expect(visitor).toHaveProperty('FunctionExpression:exit')
      expect(visitor).toHaveProperty('ArrowFunctionExpression')
      expect(visitor).toHaveProperty('ArrowFunctionExpression:exit')
      expect(visitor).toHaveProperty('AssignmentExpression')
      expect(visitor).toHaveProperty('UpdateExpression')
      expect(visitor).toHaveProperty('CallExpression')
      expect(visitor).toHaveProperty('UnaryExpression')
    })

    test('should return a new visitor on each create call', () => {
      const { context } = createMockContext()
      const visitor1 = preferReadonlyParameterRule.create(context)
      const visitor2 = preferReadonlyParameterRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should have all visitor methods as functions', () => {
      const { context } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      expect(typeof visitor['FunctionDeclaration']).toBe('function')
      expect(typeof visitor['FunctionDeclaration:exit']).toBe('function')
      expect(typeof visitor['FunctionExpression']).toBe('function')
      expect(typeof visitor['FunctionExpression:exit']).toBe('function')
      expect(typeof visitor['ArrowFunctionExpression']).toBe('function')
      expect(typeof visitor['ArrowFunctionExpression:exit']).toBe('function')
      expect(typeof visitor['AssignmentExpression']).toBe('function')
      expect(typeof visitor['UpdateExpression']).toBe('function')
      expect(typeof visitor['CallExpression']).toBe('function')
      expect(typeof visitor['UnaryExpression']).toBe('function')
    })

    test('should have create as a function', () => {
      expect(typeof preferReadonlyParameterRule.create).toBe('function')
    })

    test('should accept context with empty options', () => {
      const { context } = createMockContext({})
      expect(() => preferReadonlyParameterRule.create(context)).not.toThrow()
    })

    test('should accept context with various file paths', () => {
      const { context } = createMockContext({}, '/custom/path.ts')
      expect(() => preferReadonlyParameterRule.create(context)).not.toThrow()
    })

    test('should accept context with various source code', () => {
      const { context } = createMockContext({}, '/src/file.ts', 'const x = 1;')
      expect(() => preferReadonlyParameterRule.create(context)).not.toThrow()
    })

    test('visitor should have exactly 10 keys', () => {
      const { context } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)
      expect(Object.keys(visitor).length).toBe(10)
    })
  })

  describe('detection', () => {
    test('should report unmodified array parameter in function declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('arr', createTypeAnnotation('TSArrayType'))]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('arr')
      expect(reports[0].message).toContain('readonly')
    })

    test('should report unmodified object parameter in function declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([
          createParameter('obj', createTypeAnnotation('TSTypeReference', 'Object')),
        ]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('obj')
    })

    test('should report unmodified array parameter in function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionExpression(
        createFunctionExpression([createParameter('items', createTypeAnnotation('TSArrayType'))]),
      )
      visitor['FunctionExpression:exit']()

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('items')
    })

    test('should report unmodified object parameter in function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionExpression(
        createFunctionExpression([
          createParameter('config', createTypeAnnotation('TSTypeLiteral')),
        ]),
      )
      visitor['FunctionExpression:exit']()

      expect(reports.length).toBe(1)
    })

    test('should report unmodified array parameter in arrow function', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.ArrowFunctionExpression(
        createArrowFunctionExpression([
          createParameter('list', createTypeAnnotation('TSArrayType')),
        ]),
      )
      visitor['ArrowFunctionExpression:exit']()

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('list')
    })

    test('should report unmodified object parameter in arrow function', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.ArrowFunctionExpression(
        createArrowFunctionExpression([
          createParameter('opts', createTypeAnnotation('TSTypeReference', 'Record')),
        ]),
      )
      visitor['ArrowFunctionExpression:exit']()

      expect(reports.length).toBe(1)
    })

    test('should report string[] parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([
          createParameter('arr', createTypeAnnotation('TSArrayType', 'string')),
        ]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(1)
    })

    test('should report number[] parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([
          createParameter('nums', createTypeAnnotation('TSArrayType', 'number')),
        ]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(1)
    })

    test('should report Array<T> parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([
          createParameter('arr', createTypeAnnotation('TSTypeReference', 'Array')),
        ]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(1)
    })

    test('should report Object type parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([
          createParameter('obj', createTypeAnnotation('TSTypeReference', 'Object')),
        ]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(1)
    })

    test('should report Map type parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([
          createParameter('map', createTypeAnnotation('TSTypeReference', 'Map')),
        ]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(1)
    })

    test('should report Set type parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([
          createParameter('set', createTypeAnnotation('TSTypeReference', 'Set')),
        ]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(1)
    })

    test('should report Record type parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([
          createParameter('rec', createTypeAnnotation('TSTypeReference', 'Record')),
        ]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(1)
    })

    test('should report type literal parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('obj', createTypeAnnotation('TSTypeLiteral'))]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(1)
    })

    test('should report TSObjectKeyword parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([
          createParameter('obj', createTypeAnnotation('TSObjectKeyword')),
        ]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(1)
    })

    test('should report unmodified rest array parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([
          createRestParameter('args', createTypeAnnotation('TSArrayType')),
        ]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('args')
    })

    test('should report unmodified object destructuring parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([
          createObjectPatternParameter(['a', 'b'], createTypeAnnotation('TSTypeLiteral')),
        ]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('a')
      expect(reports[1].message).toContain('b')
    })

    test('should report unmodified array destructuring parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([
          createArrayPatternParameter(['x', 'y'], createTypeAnnotation('TSArrayType')),
        ]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('x')
      expect(reports[1].message).toContain('y')
    })

    test('should report parameter with map call (non-mutating)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('arr', createTypeAnnotation('TSArrayType'))]),
      )
      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('arr'), 'map')),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(1)
    })

    test('should report parameter with filter call (non-mutating)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('arr', createTypeAnnotation('TSArrayType'))]),
      )
      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('arr'), 'filter')),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(1)
    })

    test('should report parameter with forEach call (non-mutating)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('arr', createTypeAnnotation('TSArrayType'))]),
      )
      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('arr'), 'forEach')),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(1)
    })

    test('should report Map parameter in arrow function', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.ArrowFunctionExpression(
        createArrowFunctionExpression([
          createParameter('myMap', createTypeAnnotation('TSTypeReference', 'Map')),
        ]),
      )
      visitor['ArrowFunctionExpression:exit']()

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('myMap')
    })

    test('should report Set parameter in function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionExpression(
        createFunctionExpression([
          createParameter('mySet', createTypeAnnotation('TSTypeReference', 'Set')),
        ]),
      )
      visitor['FunctionExpression:exit']()

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('mySet')
    })

    test('should report TSObjectKeyword parameter in arrow function', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.ArrowFunctionExpression(
        createArrowFunctionExpression([
          createParameter('obj', createTypeAnnotation('TSObjectKeyword')),
        ]),
      )
      visitor['ArrowFunctionExpression:exit']()

      expect(reports.length).toBe(1)
    })

    test('should report TSObjectKeyword parameter in function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionExpression(
        createFunctionExpression([createParameter('obj', createTypeAnnotation('TSObjectKeyword'))]),
      )
      visitor['FunctionExpression:exit']()

      expect(reports.length).toBe(1)
    })

    test('should report rest parameter with Array type reference', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.ArrowFunctionExpression(
        createArrowFunctionExpression([
          createRestParameter('rest', createTypeAnnotation('TSTypeReference', 'Array')),
        ]),
      )
      visitor['ArrowFunctionExpression:exit']()

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('rest')
    })

    test('should report rest parameter in function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionExpression(
        createFunctionExpression([
          createRestParameter('items', createTypeAnnotation('TSArrayType')),
        ]),
      )
      visitor['FunctionExpression:exit']()

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('items')
    })

    test('should report parameter with reduce call (non-mutating)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('arr', createTypeAnnotation('TSArrayType'))]),
      )
      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('arr'), 'reduce')),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(1)
    })

    test('should report parameter with concat call (non-mutating)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('arr', createTypeAnnotation('TSArrayType'))]),
      )
      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('arr'), 'concat')),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(1)
    })

    test('should report parameter with slice call (non-mutating)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('arr', createTypeAnnotation('TSArrayType'))]),
      )
      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('arr'), 'slice')),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(1)
    })
  })

  describe('not reporting', () => {
    test('should not report ReadonlyArray parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([
          createParameter('arr', createTypeAnnotation('TSTypeReference', 'ReadonlyArray')),
        ]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report ReadonlyMap parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([
          createParameter('map', createTypeAnnotation('TSTypeReference', 'ReadonlyMap')),
        ]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report ReadonlySet parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([
          createParameter('set', createTypeAnnotation('TSTypeReference', 'ReadonlySet')),
        ]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report Readonly type parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([
          createParameter('obj', createTypeAnnotation('TSTypeReference', 'Readonly')),
        ]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report parameter modified by assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('arr', createTypeAnnotation('TSArrayType'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('arr'), createArrayExpression([])),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report parameter with push mutation', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('arr', createTypeAnnotation('TSArrayType'))]),
      )
      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('arr'), 'push'), [
          createLiteral(1),
        ]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report parameter with pop call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('arr', createTypeAnnotation('TSArrayType'))]),
      )
      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('arr'), 'pop')),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report parameter with shift call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('arr', createTypeAnnotation('TSArrayType'))]),
      )
      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('arr'), 'shift')),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report parameter with unshift call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('arr', createTypeAnnotation('TSArrayType'))]),
      )
      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('arr'), 'unshift'), [
          createLiteral(1),
        ]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report parameter with splice call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('arr', createTypeAnnotation('TSArrayType'))]),
      )
      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('arr'), 'splice'), [
          createLiteral(0),
          createLiteral(1),
        ]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report parameter with sort call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('arr', createTypeAnnotation('TSArrayType'))]),
      )
      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('arr'), 'sort')),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report parameter with reverse call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('arr', createTypeAnnotation('TSArrayType'))]),
      )
      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('arr'), 'reverse')),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report parameter with fill call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('arr', createTypeAnnotation('TSArrayType'))]),
      )
      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('arr'), 'fill'), [
          createLiteral(0),
        ]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report parameter with copyWithin call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('arr', createTypeAnnotation('TSArrayType'))]),
      )
      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('arr'), 'copyWithin'), [
          createLiteral(0),
          createLiteral(1),
        ]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report parameter with delete on property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('obj', createTypeAnnotation('TSTypeLiteral'))]),
      )
      visitor.UnaryExpression(
        createUnaryExpression(createMemberExpression(createIdentifier('obj'), 'prop'), 'delete'),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report parameter with ++ on property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('obj', createTypeAnnotation('TSTypeLiteral'))]),
      )
      visitor.UpdateExpression(
        createUpdateExpression(createMemberExpression(createIdentifier('obj'), 'count')),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report parameter with -- on property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('obj', createTypeAnnotation('TSTypeLiteral'))]),
      )
      visitor.UpdateExpression(
        createUpdateExpression(createMemberExpression(createIdentifier('obj'), 'count'), '--'),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report parameter with property assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('obj', createTypeAnnotation('TSTypeLiteral'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(
          createMemberExpression(createIdentifier('obj'), 'prop'),
          createLiteral(1),
        ),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report parameter with index assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('arr', createTypeAnnotation('TSArrayType'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(
          createMemberExpression(createIdentifier('arr'), '0', true),
          createLiteral(1),
        ),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report rest parameter modified by push', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([
          createRestParameter('args', createTypeAnnotation('TSArrayType')),
        ]),
      )
      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('args'), 'push'), [
          createLiteral(1),
        ]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report destructured parameter when property is reassigned', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([
          createObjectPatternParameter(['a', 'b'], createTypeAnnotation('TSTypeLiteral')),
        ]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('a'), createLiteral(1)),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('b')
    })

    test('should not report when nested property is assigned', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('obj', createTypeAnnotation('TSTypeLiteral'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(
          createMemberExpression(
            createMemberExpression(createIdentifier('obj'), 'nested'),
            'value',
          ),
          createLiteral(1),
        ),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report when nested array is modified', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('obj', createTypeAnnotation('TSTypeLiteral'))]),
      )
      visitor.CallExpression(
        createCallExpression(
          createMemberExpression(createMemberExpression(createIdentifier('obj'), 'nested'), 'push'),
          [createLiteral(1)],
        ),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report parameter without type annotation', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([{ type: 'Identifier', name: 'x' }]))
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report parameter with non-array/object type', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('str', { type: 'TSStringKeyword' })]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report function without parameters', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'noParams' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
      })
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report ReadonlyArray in function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionExpression(
        createFunctionExpression([
          createParameter('arr', createTypeAnnotation('TSTypeReference', 'ReadonlyArray')),
        ]),
      )
      visitor['FunctionExpression:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report ReadonlyMap in arrow function', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.ArrowFunctionExpression(
        createArrowFunctionExpression([
          createParameter('map', createTypeAnnotation('TSTypeReference', 'ReadonlyMap')),
        ]),
      )
      visitor['ArrowFunctionExpression:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report ReadonlySet in function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionExpression(
        createFunctionExpression([
          createParameter('set', createTypeAnnotation('TSTypeReference', 'ReadonlySet')),
        ]),
      )
      visitor['FunctionExpression:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report Readonly type in arrow function', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.ArrowFunctionExpression(
        createArrowFunctionExpression([
          createParameter('obj', createTypeAnnotation('TSTypeReference', 'Readonly')),
        ]),
      )
      visitor['ArrowFunctionExpression:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report when all destructured properties are reassigned', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([
          createObjectPatternParameter(['a', 'b'], createTypeAnnotation('TSTypeLiteral')),
        ]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('a'), createLiteral(1)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('b'), createLiteral(2)),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      expect(() => visitor.FunctionDeclaration(null)).not.toThrow()
      expect(() => visitor.FunctionExpression(null)).not.toThrow()
      expect(() => visitor.ArrowFunctionExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      expect(() => visitor.FunctionDeclaration(undefined)).not.toThrow()
      expect(() => visitor.FunctionExpression(undefined)).not.toThrow()
      expect(() => visitor.ArrowFunctionExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      expect(() => visitor.FunctionDeclaration('string')).not.toThrow()
      expect(() => visitor.FunctionExpression(123)).not.toThrow()
    })

    test('should handle node without params', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'fn' },
        body: { type: 'BlockStatement', body: [] },
      })
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(0)
    })

    test('should handle parameter with non-array/object type', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('str', { type: 'TSStringKeyword' })]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(0)
    })

    test('should handle multiple functions independently', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('arr1', createTypeAnnotation('TSArrayType'))]),
      )
      visitor['FunctionDeclaration:exit']()

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('arr2', createTypeAnnotation('TSArrayType'))]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(2)
    })

    test('should handle AssignmentExpression with null left', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('arr', createTypeAnnotation('TSArrayType'))]),
      )
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        right: createLiteral(1),
      })
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(1)
    })

    test('should handle UpdateExpression with non-MemberExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('arr', createTypeAnnotation('TSArrayType'))]),
      )
      visitor.UpdateExpression(createUpdateExpression(createIdentifier('counter')))
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(1)
    })

    test('should handle CallExpression with non-MemberExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('arr', createTypeAnnotation('TSArrayType'))]),
      )
      visitor.CallExpression(createCallExpression(createIdentifier('someFunction')))
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(1)
    })

    test('should handle UnaryExpression with non-delete operator', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('arr', createTypeAnnotation('TSArrayType'))]),
      )
      visitor.UnaryExpression(createUnaryExpression(createIdentifier('x'), 'typeof'))
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(1)
    })

    test('should handle destructuring without properties', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([
          {
            type: 'ObjectPattern',
            properties: [],
            typeAnnotation: {
              type: 'TSTypeAnnotation',
              typeAnnotation: createTypeAnnotation('TSTypeLiteral'),
            },
          },
        ]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(0)
    })

    test('should handle AssignmentExpression with null node', () => {
      const { context } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      expect(() => visitor.AssignmentExpression(null)).not.toThrow()
    })

    test('should handle UpdateExpression with null node', () => {
      const { context } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      expect(() => visitor.UpdateExpression(null)).not.toThrow()
    })

    test('should handle CallExpression with null node', () => {
      const { context } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle UnaryExpression with null node', () => {
      const { context } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      expect(() => visitor.UnaryExpression(null)).not.toThrow()
    })

    test('should handle boolean node', () => {
      const { context } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      expect(() => visitor.FunctionDeclaration(true)).not.toThrow()
    })

    test('should handle numeric node', () => {
      const { context } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      expect(() => visitor.FunctionDeclaration(42)).not.toThrow()
    })

    test('should handle empty string node', () => {
      const { context } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      expect(() => visitor.FunctionDeclaration('')).not.toThrow()
    })

    test('should handle node with empty params array', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression([]))
      visitor['ArrowFunctionExpression:exit']()

      expect(reports.length).toBe(0)
    })

    test('should handle AssignmentExpression with undefined node', () => {
      const { context } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      expect(() => visitor.AssignmentExpression(undefined)).not.toThrow()
    })

    test('should handle CallExpression with callee missing property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('arr', createTypeAnnotation('TSArrayType'))]),
      )
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: createIdentifier('arr'),
        },
        arguments: [],
      })
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(1)
    })

    test('should handle UnaryExpression with void operator', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('arr', createTypeAnnotation('TSArrayType'))]),
      )
      visitor.UnaryExpression(createUnaryExpression(createIdentifier('x'), 'void'))
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(1)
    })

    test('should handle prefix update expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('obj', createTypeAnnotation('TSTypeLiteral'))]),
      )
      visitor.UpdateExpression({
        type: 'UpdateExpression',
        operator: '++',
        argument: createMemberExpression(createIdentifier('obj'), 'counter'),
        prefix: true,
      })
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(0)
    })

    test('should handle deeply nested member mutation', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('obj', createTypeAnnotation('TSTypeLiteral'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(
          createMemberExpression(
            createMemberExpression(createMemberExpression(createIdentifier('obj'), 'a'), 'b'),
            'c',
          ),
          createLiteral(1),
        ),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(0)
    })

    test('should handle parameter with null typeAnnotation gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([
          {
            type: 'Identifier',
            name: 'x',
            typeAnnotation: null,
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(0)
    })
  })

  describe('location', () => {
    test('should report correct location for parameter on line 10, column 5', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([
          createParameter('arr', createTypeAnnotation('TSArrayType'), 10, 5),
        ]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report location with default values when no loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([
          {
            type: 'Identifier',
            name: 'arr',
            typeAnnotation: {
              type: 'TSTypeAnnotation',
              typeAnnotation: createTypeAnnotation('TSArrayType'),
            },
          },
        ]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location for rest parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([
          createRestParameter('args', createTypeAnnotation('TSArrayType'), 5, 10),
        ]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report location for destructured parameter properties', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([
          createObjectPatternParameter(['a'], createTypeAnnotation('TSTypeLiteral'), 3, 2),
        ]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(2)
    })

    test('should report end location correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([
          createParameter('arr', createTypeAnnotation('TSArrayType'), 1, 0),
        ]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(1)
    })

    test('should report location for function expression parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionExpression(
        createFunctionExpression([
          createParameter('items', createTypeAnnotation('TSArrayType'), 7, 3),
        ]),
      )
      visitor['FunctionExpression:exit']()

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should report location for arrow function parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.ArrowFunctionExpression(
        createArrowFunctionExpression([
          createParameter('list', createTypeAnnotation('TSArrayType'), 15, 8),
        ]),
      )
      visitor['ArrowFunctionExpression:exit']()

      expect(reports[0].loc?.start.line).toBe(15)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should report location at line 1 column 0 by default', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('arr', createTypeAnnotation('TSArrayType'))]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct location for high line numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([
          createParameter('arr', createTypeAnnotation('TSArrayType'), 500, 100),
        ]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports[0].loc?.start.line).toBe(500)
      expect(reports[0].loc?.start.column).toBe(100)
    })

    test('should report multiple locations for multiple parameters', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([
          createParameter('arr1', createTypeAnnotation('TSArrayType'), 1, 0),
          createParameter('arr2', createTypeAnnotation('TSArrayType'), 1, 20),
        ]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[1].loc?.start.column).toBe(20)
    })

    test('should include loc in report descriptor', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([
          createParameter('arr', createTypeAnnotation('TSArrayType'), 2, 4),
        ]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports[0].loc).toBeDefined()
    })

    test('should have start and end in location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('arr', createTypeAnnotation('TSArrayType'))]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should handle column 0 correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([
          createParameter('arr', createTypeAnnotation('TSArrayType'), 1, 0),
        ]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location for array destructuring parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([
          createArrayPatternParameter(['x'], createTypeAnnotation('TSArrayType'), 4, 6),
        ]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports[0].loc?.start.line).toBe(4)
      expect(reports[0].loc?.start.column).toBe(6)
    })

    test('should report location for each destructured binding separately', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([
          createObjectPatternParameter(['p', 'q'], createTypeAnnotation('TSTypeLiteral'), 8, 0),
        ]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.line).toBe(8)
      expect(reports[1].loc?.start.line).toBe(8)
    })
  })

  describe('message quality', () => {
    test('should mention parameter name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([
          createParameter('myArray', createTypeAnnotation('TSArrayType')),
        ]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports[0].message).toContain('myArray')
    })

    test('should mention readonly in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('arr', createTypeAnnotation('TSArrayType'))]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports[0].message).toContain('readonly')
    })

    test('should mention immutability in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('arr', createTypeAnnotation('TSArrayType'))]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports[0].message).toContain('immutability')
    })

    test('should mention array or object type in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('arr', createTypeAnnotation('TSArrayType'))]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports[0].message).toContain('array or object')
    })

    test('should include parameter name in quotes', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('data', createTypeAnnotation('TSArrayType'))]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports[0].message).toContain("'data'")
    })

    test('should mention modified in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('arr', createTypeAnnotation('TSArrayType'))]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports[0].message).toContain('modified')
    })

    test('should have consistent message format', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('arr', createTypeAnnotation('TSArrayType'))]),
      )
      visitor['FunctionDeclaration:exit']()

      const msg = reports[0].message
      expect(msg).toContain('Parameter')
      expect(msg).toContain('arr')
    })

    test('should mention consider using readonly', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('arr', createTypeAnnotation('TSArrayType'))]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports[0].message.toLowerCase()).toContain('consider')
    })

    test('should have correct message for object parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([
          createParameter('config', createTypeAnnotation('TSTypeLiteral')),
        ]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports[0].message).toContain('config')
      expect(reports[0].message).toContain('readonly')
    })

    test('should have correct message for rest parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([
          createRestParameter('rest', createTypeAnnotation('TSArrayType')),
        ]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports[0].message).toContain('rest')
      expect(reports[0].message).toContain('readonly')
    })
  })

  describe('multiple reports', () => {
    test('should report multiple unmodified parameters', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([
          createParameter('arr1', createTypeAnnotation('TSArrayType')),
          createParameter('arr2', createTypeAnnotation('TSArrayType')),
          createParameter('obj', createTypeAnnotation('TSTypeLiteral')),
        ]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(3)
    })

    test('should report only unmodified when some are modified', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([
          createParameter('arr1', createTypeAnnotation('TSArrayType')),
          createParameter('arr2', createTypeAnnotation('TSArrayType')),
        ]),
      )
      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('arr2'), 'push'), [
          createLiteral(1),
        ]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('arr1')
    })

    test('should report all parameters in different function types', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('a', createTypeAnnotation('TSArrayType'))]),
      )
      visitor['FunctionDeclaration:exit']()

      visitor.FunctionExpression(
        createFunctionExpression([createParameter('b', createTypeAnnotation('TSArrayType'))]),
      )
      visitor['FunctionExpression:exit']()

      visitor.ArrowFunctionExpression(
        createArrowFunctionExpression([createParameter('c', createTypeAnnotation('TSArrayType'))]),
      )
      visitor['ArrowFunctionExpression:exit']()

      expect(reports.length).toBe(3)
      expect(reports[0].message).toContain('a')
      expect(reports[1].message).toContain('b')
      expect(reports[2].message).toContain('c')
    })

    test('should not carry over mutations from previous function', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      // First function with mutation
      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('arr', createTypeAnnotation('TSArrayType'))]),
      )
      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('arr'), 'push'), [
          createLiteral(1),
        ]),
      )
      visitor['FunctionDeclaration:exit']()

      // Second function without mutation
      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('arr', createTypeAnnotation('TSArrayType'))]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('arr')
    })

    test('should handle mixed mutable and readonly parameters', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([
          createParameter('arr', createTypeAnnotation('TSArrayType')),
          createParameter('ro', createTypeAnnotation('TSTypeReference', 'ReadonlyArray')),
          createParameter('obj', createTypeAnnotation('TSTypeLiteral')),
        ]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(2)
    })

    test('should report four unmodified parameters', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([
          createParameter('a', createTypeAnnotation('TSArrayType')),
          createParameter('b', createTypeAnnotation('TSTypeLiteral')),
          createParameter('c', createTypeAnnotation('TSTypeReference', 'Map')),
          createParameter('d', createTypeAnnotation('TSTypeReference', 'Set')),
        ]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(4)
    })

    test('should report correctly with nested functions', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      // Outer function
      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('outer', createTypeAnnotation('TSArrayType'))]),
      )
      // Inner arrow function
      visitor.ArrowFunctionExpression(
        createArrowFunctionExpression([
          createParameter('inner', createTypeAnnotation('TSArrayType')),
        ]),
      )
      visitor['ArrowFunctionExpression:exit']()
      visitor['FunctionDeclaration:exit']()

      // Both should be reported since neither is mutated
      expect(reports.length).toBe(2)
    })

    test('should clear params between function exits', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('a1', createTypeAnnotation('TSArrayType'))]),
      )
      visitor['FunctionDeclaration:exit']()
      visitor['FunctionDeclaration:exit']() // second exit should be no-op

      expect(reports.length).toBe(1)
    })

    test('should report all destructured bindings individually', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([
          createObjectPatternParameter(
            ['alpha', 'beta', 'gamma'],
            createTypeAnnotation('TSTypeLiteral'),
          ),
        ]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(3)
      expect(reports[0].message).toContain('alpha')
      expect(reports[1].message).toContain('beta')
      expect(reports[2].message).toContain('gamma')
    })

    test('should correctly handle some destructured bindings mutated', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([
          createArrayPatternParameter(
            ['first', 'second', 'third'],
            createTypeAnnotation('TSArrayType'),
          ),
        ]),
      )
      visitor.UpdateExpression(
        createUpdateExpression(createMemberExpression(createIdentifier('second'), 'val')),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('third'), createLiteral(0)),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('first')
    })
  })

  describe('context handling', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockContext({}, '/custom/deep/path.ts')
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('arr', createTypeAnnotation('TSArrayType'))]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(1)
    })

    test('should work with empty source code', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', '')
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('arr', createTypeAnnotation('TSArrayType'))]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(1)
    })

    test('should work with complex source code', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'function foo(arr: string[]) { return arr.map(x => x); }',
      )
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('arr', createTypeAnnotation('TSArrayType'))]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(1)
    })

    test('should report using context.report', () => {
      const reports: ReportDescriptor[] = []
      const context = {
        report: (d: ReportDescriptor) => reports.push(d),
        getFilePath: () => '/test.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('arr', createTypeAnnotation('TSArrayType'))]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(1)
    })

    test('should not throw with missing config options', () => {
      const context = {
        report: vi.fn(),
        getFilePath: () => '/test.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: {},
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      expect(() => preferReadonlyParameterRule.create(context)).not.toThrow()
    })

    test('should handle multiple sequential exit calls without error', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('arr', createTypeAnnotation('TSArrayType'))]),
      )
      visitor['FunctionDeclaration:exit']()
      visitor['FunctionDeclaration:exit']()
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(1)
    })

    test('should handle arrow function with expression body', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.ArrowFunctionExpression({
        type: 'ArrowFunctionExpression',
        params: [createParameter('arr', createTypeAnnotation('TSArrayType'))],
        body: { type: 'Identifier', name: 'arr' },
        expression: true,
      })
      visitor['ArrowFunctionExpression:exit']()

      expect(reports.length).toBe(1)
    })

    test('should handle function expression with named id', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionExpression({
        type: 'FunctionExpression',
        id: { type: 'Identifier', name: 'namedFn' },
        params: [createParameter('data', createTypeAnnotation('TSArrayType'))],
        body: { type: 'BlockStatement', body: [] },
      })
      visitor['FunctionExpression:exit']()

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('data')
    })

    test('should handle same parameter name in different functions', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('data', createTypeAnnotation('TSArrayType'))]),
      )
      visitor['FunctionDeclaration:exit']()

      visitor.ArrowFunctionExpression(
        createArrowFunctionExpression([
          createParameter('data', createTypeAnnotation('TSArrayType')),
        ]),
      )
      visitor['ArrowFunctionExpression:exit']()

      expect(reports.length).toBe(2)
    })

    test('should not leak mutations across function boundaries', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      // First function - push on 'arr'
      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('arr', createTypeAnnotation('TSArrayType'))]),
      )
      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('arr'), 'push'), [
          createLiteral(1),
        ]),
      )
      visitor['FunctionDeclaration:exit']()

      // Second function - 'arr' is a new scope, should be reported
      visitor.ArrowFunctionExpression(
        createArrowFunctionExpression([
          createParameter('arr', createTypeAnnotation('TSArrayType')),
        ]),
      )
      visitor['ArrowFunctionExpression:exit']()

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('arr')
    })
  })

  describe('mutating array methods via test.each', () => {
    test.each([
      'push',
      'pop',
      'shift',
      'unshift',
      'splice',
      'sort',
      'reverse',
      'fill',
      'copyWithin',
    ] as const)('should not report parameter with %s call', (method) => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('arr', createTypeAnnotation('TSArrayType'))]),
      )
      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('arr'), method), [
          createLiteral(0),
        ]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(0)
    })
  })

  describe('non-mutating array methods via test.each', () => {
    test.each([
      'map',
      'filter',
      'reduce',
      'forEach',
      'find',
      'findIndex',
      'some',
      'every',
      'includes',
      'indexOf',
      'lastIndexOf',
      'join',
      'concat',
      'slice',
      'flat',
      'flatMap',
      'entries',
      'keys',
      'values',
      'toString',
    ] as const)('should report parameter with %s call', (method) => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createParameter('arr', createTypeAnnotation('TSArrayType'))]),
      )
      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('arr'), method)),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(1)
    })
  })

  describe('type references that should be reported via test.each', () => {
    test.each([
      ['Array', 'arr'],
      ['Object', 'obj'],
      ['Map', 'map'],
      ['Set', 'set'],
      ['Record', 'rec'],
    ] as const)('should report %s type parameter', (typeName, paramName) => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([
          createParameter(paramName, createTypeAnnotation('TSTypeReference', typeName)),
        ]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain(paramName)
    })
  })

  describe('readonly types that should NOT be reported via test.each', () => {
    test.each([
      ['ReadonlyArray', 'arr'],
      ['ReadonlyMap', 'map'],
      ['ReadonlySet', 'set'],
      ['Readonly', 'obj'],
    ] as const)('should not report %s type parameter', (typeName, paramName) => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([
          createParameter(paramName, createTypeAnnotation('TSTypeReference', typeName)),
        ]),
      )
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(0)
    })
  })

  describe('primitive types should not be reported via test.each', () => {
    test.each([
      { type: 'TSStringKeyword' },
      { type: 'TSNumberKeyword' },
      { type: 'TSBooleanKeyword' },
      { type: 'TSVoidKeyword' },
      { type: 'TSNullKeyword' },
      { type: 'TSUndefinedKeyword' },
      { type: 'TSNeverKeyword' },
      { type: 'TSAnyKeyword' },
      { type: 'TSUnknownKeyword' },
    ])('should not report $type parameter', ({ type }) => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createParameter('param', { type })]))
      visitor['FunctionDeclaration:exit']()

      expect(reports.length).toBe(0)
    })
  })

  describe('function types should detect via test.each', () => {
    test.each([
      { fnType: 'FunctionDeclaration', createFn: createFunctionDeclaration },
      { fnType: 'FunctionExpression', createFn: createFunctionExpression },
      { fnType: 'ArrowFunctionExpression', createFn: createArrowFunctionExpression },
    ] as const)('should detect unmodified array param in $fnType', ({ createFn }) => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      const fnNode = createFn([createParameter('items', createTypeAnnotation('TSArrayType'))])
      visitor[fnNode.type](fnNode)
      const exitKey = `${fnNode.type}:exit` as keyof typeof visitor
      ;(visitor[exitKey] as () => void)()

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('items')
    })
  })

  describe('mutation detection across function types via test.each', () => {
    test.each([
      {
        fnType: 'FunctionDeclaration',
        createFn: createFunctionDeclaration,
        exitKey: 'FunctionDeclaration:exit',
      },
      {
        fnType: 'FunctionExpression',
        createFn: createFunctionExpression,
        exitKey: 'FunctionExpression:exit',
      },
      {
        fnType: 'ArrowFunctionExpression',
        createFn: createArrowFunctionExpression,
        exitKey: 'ArrowFunctionExpression:exit',
      },
    ] as const)('should not report $fnType param with push mutation', ({ createFn, exitKey }) => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      const fnNode = createFn([createParameter('arr', createTypeAnnotation('TSArrayType'))])
      visitor[fnNode.type](fnNode)
      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('arr'), 'push'), [
          createLiteral(1),
        ]),
      )
      ;(visitor[exitKey] as () => void)()

      expect(reports.length).toBe(0)
    })
  })

  describe('unary operators via test.each', () => {
    test.each(['typeof', 'void', '!', '~', '-'] as const)(
      'should report parameter with %s unary operator (non-delete)',
      (operator) => {
        const { context, reports } = createMockContext()
        const visitor = preferReadonlyParameterRule.create(context)

        visitor.FunctionDeclaration(
          createFunctionDeclaration([createParameter('arr', createTypeAnnotation('TSArrayType'))]),
        )
        visitor.UnaryExpression(createUnaryExpression(createIdentifier('x'), operator))
        visitor['FunctionDeclaration:exit']()

        expect(reports.length).toBe(1)
      },
    )
  })

  describe('update operators via test.each', () => {
    test.each(['++', '--'] as const)(
      'should report array param when %s is on non-member expression',
      (operator) => {
        const { context, reports } = createMockContext()
        const visitor = preferReadonlyParameterRule.create(context)

        visitor.FunctionDeclaration(
          createFunctionDeclaration([createParameter('arr', createTypeAnnotation('TSArrayType'))]),
        )
        visitor.UpdateExpression(createUpdateExpression(createIdentifier('counter'), operator))
        visitor['FunctionDeclaration:exit']()

        expect(reports.length).toBe(1)
      },
    )

    test.each(['++', '--'] as const)(
      'should not report object param when %s is on member expression',
      (operator) => {
        const { context, reports } = createMockContext()
        const visitor = preferReadonlyParameterRule.create(context)

        visitor.FunctionDeclaration(
          createFunctionDeclaration([
            createParameter('obj', createTypeAnnotation('TSTypeLiteral')),
          ]),
        )
        visitor.UpdateExpression(
          createUpdateExpression(
            createMemberExpression(createIdentifier('obj'), 'count'),
            operator,
          ),
        )
        visitor['FunctionDeclaration:exit']()

        expect(reports.length).toBe(0)
      },
    )
  })
})
