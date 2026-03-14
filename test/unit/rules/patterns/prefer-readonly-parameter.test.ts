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
  })

  describe('function declarations', () => {
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
  })

  describe('function expressions', () => {
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
  })

  describe('arrow functions', () => {
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
  })

  describe('array type parameters', () => {
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
  })

  describe('object type parameters', () => {
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
  })

  describe('readonly types should not be reported', () => {
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
  })

  describe('rest parameters', () => {
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
  })

  describe('destructured parameters', () => {
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
  })

  describe('mutating operations', () => {
    describe('push', () => {
      test('should not report parameter with push call', () => {
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
    })

    describe('pop', () => {
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
    })

    describe('shift', () => {
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
    })

    describe('unshift', () => {
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
    })

    describe('splice', () => {
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
    })

    describe('sort', () => {
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
    })

    describe('reverse', () => {
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
    })

    describe('fill', () => {
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
    })

    describe('copyWithin', () => {
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
    })

    describe('delete', () => {
      test('should not report parameter with delete on property', () => {
        const { context, reports } = createMockContext()
        const visitor = preferReadonlyParameterRule.create(context)

        visitor.FunctionDeclaration(
          createFunctionDeclaration([
            createParameter('obj', createTypeAnnotation('TSTypeLiteral')),
          ]),
        )
        visitor.UnaryExpression(
          createUnaryExpression(createMemberExpression(createIdentifier('obj'), 'prop'), 'delete'),
        )
        visitor['FunctionDeclaration:exit']()

        expect(reports.length).toBe(0)
      })
    })

    describe('update expressions', () => {
      test('should not report parameter with ++ on property', () => {
        const { context, reports } = createMockContext()
        const visitor = preferReadonlyParameterRule.create(context)

        visitor.FunctionDeclaration(
          createFunctionDeclaration([
            createParameter('obj', createTypeAnnotation('TSTypeLiteral')),
          ]),
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
          createFunctionDeclaration([
            createParameter('obj', createTypeAnnotation('TSTypeLiteral')),
          ]),
        )
        visitor.UpdateExpression(
          createUpdateExpression(createMemberExpression(createIdentifier('obj'), 'count'), '--'),
        )
        visitor['FunctionDeclaration:exit']()

        expect(reports.length).toBe(0)
      })
    })

    describe('property assignment', () => {
      test('should not report parameter with property assignment', () => {
        const { context, reports } = createMockContext()
        const visitor = preferReadonlyParameterRule.create(context)

        visitor.FunctionDeclaration(
          createFunctionDeclaration([
            createParameter('obj', createTypeAnnotation('TSTypeLiteral')),
          ]),
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
    })

    describe('direct assignment', () => {
      test('should not report parameter reassigned directly', () => {
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
    })
  })

  describe('non-mutating operations', () => {
    test('should report parameter with map call', () => {
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

    test('should report parameter with filter call', () => {
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

    test('should report parameter with forEach call', () => {
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
  })

  describe('multiple parameters', () => {
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
  })

  describe('nested member expressions', () => {
    test('should not report parameter when nested property is assigned', () => {
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

    test('should not report parameter when nested array is modified', () => {
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

    test('should handle parameter without type annotation', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyParameterRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([{ type: 'Identifier', name: 'x' }]))
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

    test('should report correct location', () => {
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

    test('should handle function without parameters', () => {
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
  })
})
