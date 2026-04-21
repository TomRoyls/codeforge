import { describe, test, expect, vi } from 'vitest'
import { preferReadonlyRule } from '../../../../src/rules/patterns/prefer-readonly.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'let arr = [1, 2, 3];',
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

function createVariableDeclarator(
  name: string,
  init: unknown,
  kind = 'let',
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'VariableDeclarator',
    id: {
      type: 'Identifier',
      name,
    },
    init,
    parent: {
      kind,
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createArrayExpression(): unknown {
  return {
    type: 'ArrayExpression',
    elements: [],
  }
}

function createObjectExpression(): unknown {
  return {
    type: 'ObjectExpression',
    properties: [],
  }
}

function createNewArrayExpression(): unknown {
  return {
    type: 'NewExpression',
    callee: {
      type: 'Identifier',
      name: 'Array',
    },
    arguments: [],
  }
}

function createNewObjectExpression(): unknown {
  return {
    type: 'NewExpression',
    callee: {
      type: 'Identifier',
      name: 'Object',
    },
    arguments: [],
  }
}

function createNewMapExpression(): unknown {
  return {
    type: 'NewExpression',
    callee: {
      type: 'Identifier',
      name: 'Map',
    },
    arguments: [],
  }
}

function createNewSetExpression(): unknown {
  return {
    type: 'NewExpression',
    callee: {
      type: 'Identifier',
      name: 'Set',
    },
    arguments: [],
  }
}

function createNewExpression(name: string): unknown {
  return {
    type: 'NewExpression',
    callee: {
      type: 'Identifier',
      name,
    },
    arguments: [],
  }
}

function createLiteral(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
  }
}

function createAssignmentExpression(left: unknown, right: unknown): unknown {
  return {
    type: 'AssignmentExpression',
    left,
    right,
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

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

function createCallExpression(callee: unknown, args?: unknown[]): unknown {
  return {
    type: 'CallExpression',
    callee,
    arguments: args ?? [],
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

function createProperty(name: string, value: unknown, line = 1, column = 0): unknown {
  return {
    type: 'Property',
    key: {
      type: 'Identifier',
      name,
    },
    value,
    kind: 'init',
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createTSAsExpression(expression: unknown): unknown {
  return {
    type: 'TSAsExpression',
    expression,
    typeAnnotation: { type: 'TSArrayType' },
  }
}

function createTSTypeAssertion(expression: unknown): unknown {
  return {
    type: 'TSTypeAssertion',
    expression,
    typeAnnotation: { type: 'TSArrayType' },
  }
}

function createFunctionExpression(): unknown {
  return {
    type: 'FunctionExpression',
    params: [],
    body: { type: 'BlockStatement', body: [] },
  }
}

function createArrowFunctionExpression(): unknown {
  return {
    type: 'ArrowFunctionExpression',
    params: [],
    body: { type: 'BlockStatement', body: [] },
    expression: false,
  }
}

function createBinaryExpression(): unknown {
  return {
    type: 'BinaryExpression',
    operator: '+',
    left: createLiteral(1),
    right: createLiteral(2),
  }
}

function createClassDeclaration(name: string): unknown {
  return {
    type: 'ClassDeclaration',
    id: { type: 'Identifier', name },
  }
}

function createPropertyDefinition(
  name: string,
  value: unknown,
  options: { readonly?: boolean; line?: number; column?: number; keyType?: string } = {},
): unknown {
  const keyType = options.keyType ?? 'Identifier'
  return {
    type: 'PropertyDefinition',
    key:
      keyType === 'PrivateIdentifier'
        ? { type: 'PrivateIdentifier', name }
        : { type: 'Identifier', name },
    value,
    readonly: options.readonly ?? false,
    loc: {
      start: { line: options.line ?? 1, column: options.column ?? 0 },
      end: { line: options.line ?? 1, column: (options.column ?? 0) + 20 },
    },
  }
}

function createMethodDefinition(kind = 'method'): unknown {
  return {
    type: 'MethodDefinition',
    kind,
  }
}

describe('prefer-readonly rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferReadonlyRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferReadonlyRule.meta.severity).toBe('warn')
    })

    test('should not be recommended by default', () => {
      expect(preferReadonlyRule.meta.docs?.recommended).toBe(false)
    })

    test('should have patterns category', () => {
      expect(preferReadonlyRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(preferReadonlyRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(preferReadonlyRule.meta.fixable).toBeUndefined()
    })

    test('should mention readonly in description', () => {
      expect(preferReadonlyRule.meta.docs?.description.toLowerCase()).toContain('readonly')
    })

    test('should mention immutability in description', () => {
      expect(preferReadonlyRule.meta.docs?.description.toLowerCase()).toContain('immutability')
    })

    test('should have meta as a plain object', () => {
      expect(typeof preferReadonlyRule.meta).toBe('object')
      expect(preferReadonlyRule.meta).not.toBeNull()
    })

    test('should have create as a function', () => {
      expect(typeof preferReadonlyRule.create).toBe('function')
    })

    test('should have docs property defined', () => {
      expect(preferReadonlyRule.meta.docs).toBeDefined()
    })

    test('should have non-empty description string', () => {
      expect(typeof preferReadonlyRule.meta.docs?.description).toBe('string')
      expect(preferReadonlyRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have url in docs', () => {
      expect(preferReadonlyRule.meta.docs?.url).toBeDefined()
    })

    test('should have url as string', () => {
      expect(typeof preferReadonlyRule.meta.docs?.url).toBe('string')
    })

    test('should not be deprecated', () => {
      expect(preferReadonlyRule.meta.deprecated).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(preferReadonlyRule.meta.requiresTypeChecking).toBeUndefined()
    })

    test('should not have replacedBy', () => {
      expect(preferReadonlyRule.meta.replacedBy).toBeUndefined()
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(preferReadonlyRule.meta.schema)).toBe(true)
    })

    test('should have schema with object properties for options', () => {
      const schema = preferReadonlyRule.meta.schema as Record<string, unknown>[]
      expect(schema[0]).toBeDefined()
      expect(schema[0].type).toBe('object')
    })

    test('should be a valid RuleDefinition with meta and create', () => {
      expect(preferReadonlyRule).toHaveProperty('meta')
      expect(preferReadonlyRule).toHaveProperty('create')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      expect(visitor).toHaveProperty('VariableDeclarator')
      expect(visitor).toHaveProperty('Property')
      expect(visitor).toHaveProperty('AssignmentExpression')
      expect(visitor).toHaveProperty('CallExpression')
      expect(visitor).toHaveProperty('UpdateExpression')
      expect(visitor).toHaveProperty('UnaryExpression')
      expect(visitor).toHaveProperty('Program:exit')
    })

    test('should return non-null visitor from create', () => {
      const { context } = createMockContext()
      const visitor = preferReadonlyRule.create(context)
      expect(visitor).not.toBeNull()
      expect(typeof visitor).toBe('object')
    })

    test('should have ClassDeclaration visitor', () => {
      const { context } = createMockContext()
      const visitor = preferReadonlyRule.create(context)
      expect(typeof visitor['ClassDeclaration']).toBe('function')
    })

    test('should have ClassDeclaration:exit visitor', () => {
      const { context } = createMockContext()
      const visitor = preferReadonlyRule.create(context)
      expect(typeof visitor['ClassDeclaration:exit']).toBe('function')
    })

    test('should have ClassExpression visitor', () => {
      const { context } = createMockContext()
      const visitor = preferReadonlyRule.create(context)
      expect(typeof visitor['ClassExpression']).toBe('function')
    })

    test('should have ClassExpression:exit visitor', () => {
      const { context } = createMockContext()
      const visitor = preferReadonlyRule.create(context)
      expect(typeof visitor['ClassExpression:exit']).toBe('function')
    })

    test('should have MethodDefinition visitor', () => {
      const { context } = createMockContext()
      const visitor = preferReadonlyRule.create(context)
      expect(typeof visitor['MethodDefinition']).toBe('function')
    })

    test('should have MethodDefinition:exit visitor', () => {
      const { context } = createMockContext()
      const visitor = preferReadonlyRule.create(context)
      expect(typeof visitor['MethodDefinition:exit']).toBe('function')
    })
  })

  describe('detecting mutable arrays', () => {
    test('should report unmodified let array variable', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('arr', createArrayExpression()))
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('arr')
      expect(reports[0].message).toContain('readonly')
    })

    test('should not report const array variable', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('arr', createArrayExpression(), 'const'))
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report array modified by push', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('arr', createArrayExpression()))
      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('arr'), 'push'), [
          createLiteral(1),
        ]),
      )
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report array modified by pop', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('arr', createArrayExpression()))
      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('arr'), 'pop')),
      )
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report array modified by shift', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('arr', createArrayExpression()))
      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('arr'), 'shift')),
      )
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report array modified by unshift', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('arr', createArrayExpression()))
      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('arr'), 'unshift'), [
          createLiteral(1),
        ]),
      )
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report array modified by splice', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('arr', createArrayExpression()))
      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('arr'), 'splice'), [
          createLiteral(0),
          createLiteral(1),
        ]),
      )
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report array modified by sort', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('arr', createArrayExpression()))
      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('arr'), 'sort')),
      )
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report array modified by reverse', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('arr', createArrayExpression()))
      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('arr'), 'reverse')),
      )
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report array modified by fill', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('arr', createArrayExpression()))
      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('arr'), 'fill'), [
          createLiteral(0),
        ]),
      )
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report array modified by copyWithin', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('arr', createArrayExpression()))
      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('arr'), 'copyWithin'), [
          createLiteral(0),
          createLiteral(1),
        ]),
      )
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report non-mutating array methods', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('arr', createArrayExpression()))
      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('arr'), 'map')),
      )
      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('arr'), 'filter')),
      )
      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('arr'), 'forEach')),
      )
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should report array modified by direct assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('arr', createArrayExpression()))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('arr'), createArrayExpression()),
      )
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report array with index assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('arr', createArrayExpression()))
      visitor.AssignmentExpression(
        createAssignmentExpression(
          createMemberExpression(createIdentifier('arr'), '0', true),
          createLiteral(1),
        ),
      )
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should report var-declared array variable', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('arr', createArrayExpression(), 'var'))
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('arr')
    })

    test('should report array with TSAsExpression wrapper', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator('arr', createTSAsExpression(createArrayExpression())),
      )
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should report array with TSTypeAssertion wrapper', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator('arr', createTSTypeAssertion(createArrayExpression())),
      )
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting mutable objects', () => {
    test('should report unmodified let object variable', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('obj', createObjectExpression()))
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('obj')
    })

    test('should not report object modified by property assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('obj', createObjectExpression()))
      visitor.AssignmentExpression(
        createAssignmentExpression(
          createMemberExpression(createIdentifier('obj'), 'prop'),
          createLiteral(1),
        ),
      )
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report object with delete operation', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('obj', createObjectExpression()))
      visitor.UnaryExpression(
        createUnaryExpression(createMemberExpression(createIdentifier('obj'), 'prop'), 'delete'),
      )
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report object with update expression on property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('obj', createObjectExpression()))
      visitor.UpdateExpression(
        createUpdateExpression(createMemberExpression(createIdentifier('obj'), 'count')),
      )
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should report var-declared object variable', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('obj', createObjectExpression(), 'var'))
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should not report object with computed property assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('obj', createObjectExpression()))
      visitor.AssignmentExpression(
        createAssignmentExpression(
          createMemberExpression(createIdentifier('obj'), 'key', true),
          createLiteral('value'),
        ),
      )
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should report object with TSAsExpression wrapper', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator('obj', createTSAsExpression(createObjectExpression())),
      )
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should report object with TSTypeAssertion wrapper', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator('obj', createTSTypeAssertion(createObjectExpression())),
      )
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting NewExpression arrays and objects', () => {
    test('should report unmodified new Array()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('arr', createNewArrayExpression()))
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should report unmodified new Object()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('obj', createNewObjectExpression()))
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should report unmodified new Map()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('map', createNewMapExpression()))
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should report unmodified new Set()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('set', createNewSetExpression()))
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should not report new Map() modified by set method', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('map', createNewMapExpression()))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('map'), createNewMapExpression()),
      )
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report new Set() modified by reassignment', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('set', createNewSetExpression()))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('set'), createNewSetExpression()),
      )
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report new Array() with const', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator('arr', createNewArrayExpression(), 'const'),
      )
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report new Object() with const', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator('obj', createNewObjectExpression(), 'const'),
      )
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })
  })

  describe('options - ignoreLocalVariables', () => {
    test('should ignore local variables when option is true', () => {
      const { context, reports } = createMockContext({ ignoreLocalVariables: true })
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('arr', createArrayExpression()))
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should report local variables when option is false', () => {
      const { context, reports } = createMockContext({ ignoreLocalVariables: false })
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('arr', createArrayExpression()))
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should report local variables by default', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('arr', createArrayExpression()))
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should still report class properties when ignoreLocalVariables is true', () => {
      const { context, reports } = createMockContext({ ignoreLocalVariables: true })
      const visitor = preferReadonlyRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('MyClass'))
      visitor.PropertyDefinition(createPropertyDefinition('items', createArrayExpression()))
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should ignore local objects when ignoreLocalVariables is true', () => {
      const { context, reports } = createMockContext({ ignoreLocalVariables: true })
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('obj', createObjectExpression()))
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should ignore local new Map when ignoreLocalVariables is true', () => {
      const { context, reports } = createMockContext({ ignoreLocalVariables: true })
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('map', createNewMapExpression()))
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })
  })

  describe('options - ignorePrivateMembers', () => {
    test('should ignore private members starting with _', () => {
      const { context, reports } = createMockContext({ ignorePrivateMembers: true })
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('_privateArr', createArrayExpression()))
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should ignore private members starting with #', () => {
      const { context, reports } = createMockContext({ ignorePrivateMembers: true })
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('#privateArr', createArrayExpression()))
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should report private members when option is false', () => {
      const { context, reports } = createMockContext({ ignorePrivateMembers: false })
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('_privateArr', createArrayExpression()))
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should report public members even with ignorePrivateMembers true', () => {
      const { context, reports } = createMockContext({ ignorePrivateMembers: true })
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('publicArr', createArrayExpression()))
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should ignore private objects when ignorePrivateMembers is true', () => {
      const { context, reports } = createMockContext({ ignorePrivateMembers: true })
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('_privateObj', createObjectExpression()))
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should report private members by default without option', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('_privateArr', createArrayExpression()))
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })
  })

  describe('class properties', () => {
    test('should report unmodified class property with array', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.Property(createProperty('items', createArrayExpression()))
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('items')
    })

    test('should report unmodified class property with object', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.Property(createProperty('config', createObjectExpression()))
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should not report modified class property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.Property(createProperty('items', createArrayExpression()))
      visitor.AssignmentExpression(
        createAssignmentExpression(
          createMemberExpression(createIdentifier('items'), '0', true),
          createLiteral(1),
        ),
      )
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should report Property with new Array value', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.Property(createProperty('data', createNewArrayExpression()))
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should report Property with new Map value', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.Property(createProperty('cache', createNewMapExpression()))
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should report Property with new Set value', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.Property(createProperty('unique', createNewSetExpression()))
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })
  })

  describe('message quality', () => {
    test('should mention variable name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('myArray', createArrayExpression()))
      visitor['Program:exit']()

      expect(reports[0].message).toContain('myArray')
    })

    test('should mention readonly in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('arr', createArrayExpression()))
      visitor['Program:exit']()

      expect(reports[0].message).toContain('readonly')
    })

    test('should mention immutability in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('arr', createArrayExpression()))
      visitor['Program:exit']()

      expect(reports[0].message).toContain('immutability')
    })

    test('should mention variable name for object', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('myObj', createObjectExpression()))
      visitor['Program:exit']()

      expect(reports[0].message).toContain('myObj')
    })

    test('should mention const in variable message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('arr', createArrayExpression()))
      visitor['Program:exit']()

      expect(reports[0].message).toContain('const')
    })

    test('should mention as const in variable message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('arr', createArrayExpression()))
      visitor['Program:exit']()

      expect(reports[0].message).toContain('as const')
    })

    test('should mention property name in class property message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('MyClass'))
      visitor.PropertyDefinition(createPropertyDefinition('items', createArrayExpression()))
      visitor['Program:exit']()

      expect(reports[0].message).toContain('items')
    })

    test('should mention readonly modifier in class property message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('MyClass'))
      visitor.PropertyDefinition(createPropertyDefinition('config', createObjectExpression()))
      visitor['Program:exit']()

      expect(reports[0].message).toContain('readonly')
    })

    test('should mention constructor in class property message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('MyClass'))
      visitor.PropertyDefinition(createPropertyDefinition('items', createArrayExpression()))
      visitor['Program:exit']()

      expect(reports[0].message).toContain('constructor')
    })

    test('should produce string message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('arr', createArrayExpression()))
      visitor['Program:exit']()

      expect(typeof reports[0].message).toBe('string')
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      expect(() => visitor.VariableDeclarator(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      expect(() => visitor.VariableDeclarator(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      expect(() => visitor.VariableDeclarator('string')).not.toThrow()
      expect(() => visitor.VariableDeclarator(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'arr',
        },
        init: {
          type: 'ArrayExpression',
          elements: [],
        },
        parent: {
          kind: 'let',
        },
      }

      expect(() => visitor.VariableDeclarator(node)).not.toThrow()
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
    })

    test('should handle node without id', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        init: {
          type: 'ArrayExpression',
          elements: [],
        },
        parent: {
          kind: 'let',
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.VariableDeclarator(node)).not.toThrow()
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-Identifier id', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'ObjectPattern',
          properties: [],
        },
        init: {
          type: 'ArrayExpression',
          elements: [],
        },
        parent: {
          kind: 'let',
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.VariableDeclarator(node)).not.toThrow()
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })

    test('should handle node without init', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'arr',
        },
        parent: {
          kind: 'let',
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.VariableDeclarator(node)).not.toThrow()
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })

    test('should handle non-array/object init', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('str', createLiteral('hello')))
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should handle call expression with non-MemberExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('arr', createArrayExpression()))
      visitor.CallExpression(createCallExpression(createIdentifier('someFunction')))
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should handle call expression with computed property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('arr', createArrayExpression()))
      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('arr'), 'push')),
      )
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('arr', createArrayExpression()))
      visitor['Program:exit']()

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
        getSource: () => 'let arr = [];',
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

      const visitor = preferReadonlyRule.create(context)

      expect(() => {
        visitor.VariableDeclarator(createVariableDeclarator('arr', createArrayExpression()))
        visitor['Program:exit']()
      }).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle nested member expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('obj', createObjectExpression()))
      visitor.AssignmentExpression(
        createAssignmentExpression(
          createMemberExpression(
            createMemberExpression(createIdentifier('obj'), 'nested'),
            'value',
          ),
          createLiteral(1),
        ),
      )
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should handle AssignmentExpression with null left', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('arr', createArrayExpression()))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        right: createLiteral(1),
      })
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should handle UpdateExpression with non-MemberExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('arr', createArrayExpression()))
      visitor.UpdateExpression(createUpdateExpression(createIdentifier('counter')))
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should handle UnaryExpression with non-delete operator', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('arr', createArrayExpression()))
      visitor.UnaryExpression(createUnaryExpression(createIdentifier('x'), 'typeof'))
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should handle Property with non-Identifier key', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      const node = {
        type: 'Property',
        key: {
          type: 'Literal',
          value: 'computed',
        },
        value: createArrayExpression(),
        kind: 'init',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.Property(node)).not.toThrow()
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })

    test('should handle AssignmentExpression with null node', () => {
      const { context } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      expect(() => visitor.AssignmentExpression(null)).not.toThrow()
    })

    test('should handle CallExpression with null node', () => {
      const { context } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle UpdateExpression with null node', () => {
      const { context } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      expect(() => visitor.UpdateExpression(null)).not.toThrow()
    })

    test('should handle UnaryExpression with null node', () => {
      const { context } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      expect(() => visitor.UnaryExpression(null)).not.toThrow()
    })

    test('should handle Property with null node', () => {
      const { context } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      expect(() => visitor.Property(null)).not.toThrow()
    })

    test('should handle CallExpression with null callee property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('arr', createArrayExpression()))
      visitor.CallExpression({ type: 'CallExpression' })
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should handle CallExpression with non-Identifier property on callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('arr', createArrayExpression()))
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: createIdentifier('arr'),
          property: { type: 'Literal', value: 'push' },
        },
      })
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should handle ClassDeclaration with null node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      expect(() => visitor['ClassDeclaration'](null)).not.toThrow()
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })

    test('should handle ClassExpression with null node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      expect(() => visitor['ClassExpression'](null)).not.toThrow()
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })

    test('should handle MethodDefinition with null node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      expect(() => visitor['MethodDefinition'](null)).not.toThrow()
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })

    test('should handle PropertyDefinition with null node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      expect(() => visitor['PropertyDefinition'](null)).not.toThrow()
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })

    test('should handle PropertyDefinition with null value', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('MyClass'))
      visitor.PropertyDefinition({
        type: 'PropertyDefinition',
        key: { type: 'Identifier', name: 'items' },
        value: null,
        readonly: false,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should handle PropertyDefinition with undefined value', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('MyClass'))
      visitor.PropertyDefinition({
        type: 'PropertyDefinition',
        key: { type: 'Identifier', name: 'items' },
        value: undefined,
        readonly: false,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should handle UnaryExpression with void operator', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('arr', createArrayExpression()))
      visitor.UnaryExpression(createUnaryExpression(createIdentifier('x'), 'void'))
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should handle UpdateExpression with prefix increment', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('obj', createObjectExpression()))
      visitor.UpdateExpression({
        type: 'UpdateExpression',
        operator: '++',
        argument: createMemberExpression(createIdentifier('obj'), 'count'),
        prefix: true,
      })
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should handle UpdateExpression with decrement', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('obj', createObjectExpression()))
      visitor.UpdateExpression(
        createUpdateExpression(createMemberExpression(createIdentifier('obj'), 'count'), '--'),
      )
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should handle UpdateExpression with null argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('arr', createArrayExpression()))
      visitor.UpdateExpression({
        type: 'UpdateExpression',
        operator: '++',
        argument: null,
        prefix: false,
      })
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })
  })

  describe('location reporting', () => {
    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator('arr', createArrayExpression(), 'let', 10, 5),
      )
      visitor['Program:exit']()

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report correct end location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator('arr', createArrayExpression(), 'let', 3, 8),
      )
      visitor['Program:exit']()

      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(28)
    })

    test('should report default location when no loc present', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'arr' },
        init: createArrayExpression(),
        parent: { kind: 'let' },
      }
      visitor.VariableDeclarator(node)
      visitor['Program:exit']()

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at line 1 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator('arr', createArrayExpression(), 'let', 1, 0),
      )
      visitor['Program:exit']()

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at high line numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator('arr', createArrayExpression(), 'let', 500, 20),
      )
      visitor['Program:exit']()

      expect(reports[0].loc?.start.line).toBe(500)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should report Property location correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.Property(createProperty('items', createArrayExpression(), 7, 12))
      visitor['Program:exit']()

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(12)
    })

    test('should report PropertyDefinition location correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('MyClass'))
      visitor.PropertyDefinition(
        createPropertyDefinition('data', createArrayExpression(), { line: 15, column: 4 }),
      )
      visitor['Program:exit']()

      expect(reports[0].loc?.start.line).toBe(15)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should report location for object variable', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator('obj', createObjectExpression(), 'let', 20, 10),
      )
      visitor['Program:exit']()

      expect(reports[0].loc?.start.line).toBe(20)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report location for new Array expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator('arr', createNewArrayExpression(), 'let', 5, 2),
      )
      visitor['Program:exit']()

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(2)
    })

    test('should report different locations for multiple variables', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator('arr1', createArrayExpression(), 'let', 1, 0),
      )
      visitor.VariableDeclarator(
        createVariableDeclarator('arr2', createArrayExpression(), 'let', 5, 10),
      )
      visitor['Program:exit']()

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
    })

    test('should report location with column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator('arr', createArrayExpression(), 'let', 42, 0),
      )
      visitor['Program:exit']()

      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle location with partial loc - missing end', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'arr' },
        init: createArrayExpression(),
        parent: { kind: 'let' },
        loc: {
          start: { line: 3, column: 5 },
        },
      }
      visitor.VariableDeclarator(node)
      visitor['Program:exit']()

      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle location with non-numeric start line', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'arr' },
        init: createArrayExpression(),
        parent: { kind: 'let' },
        loc: {
          start: { line: 'bad', column: 0 },
          end: { line: 'bad', column: 10 },
        },
      }
      visitor.VariableDeclarator(node)
      visitor['Program:exit']()

      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should report correct location for var declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator('items', createArrayExpression(), 'var', 8, 4),
      )
      visitor['Program:exit']()

      expect(reports[0].loc?.start.line).toBe(8)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should report location for new Map expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator('map', createNewMapExpression(), 'let', 12, 6),
      )
      visitor['Program:exit']()

      expect(reports[0].loc?.start.line).toBe(12)
      expect(reports[0].loc?.start.column).toBe(6)
    })
  })

  describe('multiple reports', () => {
    test('should handle multiple variables', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('arr1', createArrayExpression()))
      visitor.VariableDeclarator(createVariableDeclarator('arr2', createArrayExpression()))
      visitor.VariableDeclarator(createVariableDeclarator('obj', createObjectExpression()))
      visitor['Program:exit']()

      expect(reports.length).toBe(3)
    })

    test('should handle mixed modified and unmodified variables', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('arr1', createArrayExpression()))
      visitor.VariableDeclarator(createVariableDeclarator('arr2', createArrayExpression()))
      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('arr2'), 'push'), [
          createLiteral(1),
        ]),
      )
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('arr1')
    })

    test('should report two unmodified arrays', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('a', createArrayExpression()))
      visitor.VariableDeclarator(createVariableDeclarator('b', createArrayExpression()))
      visitor['Program:exit']()

      expect(reports.length).toBe(2)
    })

    test('should report two unmodified objects', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('o1', createObjectExpression()))
      visitor.VariableDeclarator(createVariableDeclarator('o2', createObjectExpression()))
      visitor['Program:exit']()

      expect(reports.length).toBe(2)
    })

    test('should report mix of arrays objects maps and sets', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('arr', createArrayExpression()))
      visitor.VariableDeclarator(createVariableDeclarator('obj', createObjectExpression()))
      visitor.VariableDeclarator(createVariableDeclarator('map', createNewMapExpression()))
      visitor.VariableDeclarator(createVariableDeclarator('set', createNewSetExpression()))
      visitor['Program:exit']()

      expect(reports.length).toBe(4)
    })

    test('should report multiple class properties', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('MyClass'))
      visitor.PropertyDefinition(createPropertyDefinition('items', createArrayExpression()))
      visitor.PropertyDefinition(createPropertyDefinition('config', createObjectExpression()))
      visitor['Program:exit']()

      expect(reports.length).toBe(2)
    })

    test('should report variables and class properties combined', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('arr', createArrayExpression()))
      visitor.ClassDeclaration(createClassDeclaration('MyClass'))
      visitor.PropertyDefinition(createPropertyDefinition('items', createArrayExpression()))
      visitor['Program:exit']()

      expect(reports.length).toBe(2)
    })

    test('should report across multiple class declarations', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('ClassA'))
      visitor.PropertyDefinition(createPropertyDefinition('dataA', createArrayExpression()))
      visitor['ClassDeclaration:exit']()

      visitor.ClassDeclaration(createClassDeclaration('ClassB'))
      visitor.PropertyDefinition(createPropertyDefinition('dataB', createObjectExpression()))
      visitor['ClassDeclaration:exit']()

      visitor['Program:exit']()

      expect(reports.length).toBe(2)
    })

    test('should report exactly one per unmodified variable', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', createArrayExpression()))
      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('x'), 'map')),
      )
      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('x'), 'filter')),
      )
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should report zero when all variables are modified', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('a', createArrayExpression()))
      visitor.VariableDeclarator(createVariableDeclarator('b', createObjectExpression()))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('a'), createArrayExpression()),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('b'), createObjectExpression()),
      )
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should report for each Property with array/object value', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.Property(createProperty('a', createArrayExpression()))
      visitor.Property(createProperty('b', createObjectExpression()))
      visitor.Property(createProperty('c', createNewMapExpression()))
      visitor['Program:exit']()

      expect(reports.length).toBe(3)
    })

    test('should report mixed Property and VariableDeclarator', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.Property(createProperty('prop1', createArrayExpression()))
      visitor.VariableDeclarator(createVariableDeclarator('var1', createObjectExpression()))
      visitor['Program:exit']()

      expect(reports.length).toBe(2)
    })
  })

  describe('context handling', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockContext({}, '/custom/path/file.ts')
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('arr', createArrayExpression()))
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should work with different source code strings', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'const x = {};')
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('obj', createObjectExpression()))
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should work with different workspace roots', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/project/src/file.ts',
        getAST: () => null,
        getSource: () => 'let arr = [];',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/project',
      } as unknown as RuleContext

      const visitor = preferReadonlyRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('arr', createArrayExpression()))
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should work with null AST from getAST', () => {
      const { context, reports } = createMockContext()
      expect(context.getAST()).toBeNull()

      const visitor = preferReadonlyRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('arr', createArrayExpression()))
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should work with empty tokens from getTokens', () => {
      const { context, reports } = createMockContext()
      expect(context.getTokens()).toEqual([])

      const visitor = preferReadonlyRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('arr', createArrayExpression()))
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should work with empty comments from getComments', () => {
      const { context, reports } = createMockContext()
      expect(context.getComments()).toEqual([])

      const visitor = preferReadonlyRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('arr', createArrayExpression()))
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should handle multiple create calls independently', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()

      const visitor1 = preferReadonlyRule.create(ctx1)
      const visitor2 = preferReadonlyRule.create(ctx2)

      visitor1.VariableDeclarator(createVariableDeclarator('arr', createArrayExpression()))
      visitor2.VariableDeclarator(createVariableDeclarator('obj', createObjectExpression()))

      visitor1['Program:exit']()
      visitor2['Program:exit']()

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(1)
      expect(rep1[0].message).toContain('arr')
      expect(rep2[0].message).toContain('obj')
    })

    test('should handle empty program with no declarations', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should handle config with no options property', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'let arr = [];',
        getTokens: () => [],
        getComments: () => [],
        config: {},
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = preferReadonlyRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('arr', createArrayExpression()))
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should handle both ignoreLocalVariables and ignorePrivateMembers true', () => {
      const { context, reports } = createMockContext({
        ignoreLocalVariables: true,
        ignorePrivateMembers: true,
      })
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('arr', createArrayExpression()))
      visitor.VariableDeclarator(createVariableDeclarator('_priv', createArrayExpression()))
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })
  })

  describe('class properties and declarations', () => {
    test('should report unmodified class PropertyDefinition with array', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.ClassDeclaration({
        type: 'ClassDeclaration',
        id: {
          type: 'Identifier',
          name: 'MyClass',
        },
      })

      visitor.PropertyDefinition({
        type: 'PropertyDefinition',
        key: {
          type: 'Identifier',
          name: 'items',
        },
        value: createArrayExpression(),
        readonly: false,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      visitor['Program:exit']()

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('items')
      expect(reports[0].message).toContain('readonly')
    })

    test('should report unmodified class PropertyDefinition with object', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.ClassDeclaration({
        type: 'ClassDeclaration',
        id: {
          type: 'Identifier',
          name: 'MyClass',
        },
      })

      visitor.PropertyDefinition({
        type: 'PropertyDefinition',
        key: {
          type: 'Identifier',
          name: 'config',
        },
        value: createObjectExpression(),
        readonly: false,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      visitor['Program:exit']()

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('config')
    })

    test('should not report class PropertyDefinition with readonly modifier', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.ClassDeclaration({
        type: 'ClassDeclaration',
        id: {
          type: 'Identifier',
          name: 'MyClass',
        },
      })

      visitor.PropertyDefinition({
        type: 'PropertyDefinition',
        key: {
          type: 'Identifier',
          name: 'items',
        },
        value: createArrayExpression(),
        readonly: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report class PropertyDefinition assigned outside constructor', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.ClassDeclaration({
        type: 'ClassDeclaration',
        id: {
          type: 'Identifier',
          name: 'MyClass',
        },
      })

      visitor.PropertyDefinition({
        type: 'PropertyDefinition',
        key: {
          type: 'Identifier',
          name: 'items',
        },
        value: createArrayExpression(),
        readonly: false,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        left: {
          type: 'MemberExpression',
          object: {
            type: 'ThisExpression',
          },
          property: {
            type: 'Identifier',
            name: 'items',
          },
        },
        right: createArrayExpression(),
      })

      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report class PropertyDefinition assigned in constructor', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.ClassDeclaration({
        type: 'ClassDeclaration',
        id: {
          type: 'Identifier',
          name: 'MyClass',
        },
      })

      visitor.MethodDefinition({
        type: 'MethodDefinition',
        kind: 'constructor',
      })

      visitor.PropertyDefinition({
        type: 'PropertyDefinition',
        key: {
          type: 'Identifier',
          name: 'items',
        },
        value: createArrayExpression(),
        readonly: false,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        left: {
          type: 'MemberExpression',
          object: {
            type: 'ThisExpression',
          },
          property: {
            type: 'Identifier',
            name: 'items',
          },
        },
        right: createArrayExpression(),
      })

      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should ignore private class property with _ prefix when ignorePrivateMembers is true', () => {
      const { context, reports } = createMockContext({ ignorePrivateMembers: true })
      const visitor = preferReadonlyRule.create(context)

      visitor.ClassDeclaration({
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'MyClass' },
      })

      visitor.PropertyDefinition({
        type: 'PropertyDefinition',
        key: { type: 'Identifier', name: '_privateItems' },
        value: createArrayExpression(),
        readonly: false,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should report private class property when ignorePrivateMembers is false', () => {
      const { context, reports } = createMockContext({ ignorePrivateMembers: false })
      const visitor = preferReadonlyRule.create(context)

      visitor.ClassDeclaration({
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'MyClass' },
      })

      visitor.PropertyDefinition({
        type: 'PropertyDefinition',
        key: { type: 'Identifier', name: '_privateItems' },
        value: createArrayExpression(),
        readonly: false,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should handle ClassExpression with property definition', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor['ClassExpression']({
        type: 'ClassExpression',
        id: { type: 'Identifier', name: 'MyClass' },
      })

      visitor.PropertyDefinition({
        type: 'PropertyDefinition',
        key: { type: 'Identifier', name: 'data' },
        value: createArrayExpression(),
        readonly: false,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should handle PropertyDefinition with PrivateIdentifier key', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('MyClass'))
      visitor.PropertyDefinition(
        createPropertyDefinition('#secret', createArrayExpression(), {
          keyType: 'PrivateIdentifier',
        }),
      )
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should ignore PrivateIdentifier property when ignorePrivateMembers is true', () => {
      const { context, reports } = createMockContext({ ignorePrivateMembers: true })
      const visitor = preferReadonlyRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('MyClass'))
      visitor.PropertyDefinition(
        createPropertyDefinition('#secret', createArrayExpression(), {
          keyType: 'PrivateIdentifier',
        }),
      )
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should handle PropertyDefinition with non-Identifier non-PrivateIdentifier key', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('MyClass'))
      visitor.PropertyDefinition({
        type: 'PropertyDefinition',
        key: { type: 'Literal', value: 'computed' },
        value: createArrayExpression(),
        readonly: false,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should handle ClassDeclaration without id', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor['ClassDeclaration']({ type: 'ClassDeclaration' })
      visitor.PropertyDefinition({
        type: 'PropertyDefinition',
        key: { type: 'Identifier', name: 'items' },
        value: createArrayExpression(),
        readonly: false,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should handle ClassExpression without id', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor['ClassExpression']({ type: 'ClassExpression' })
      visitor.PropertyDefinition({
        type: 'PropertyDefinition',
        key: { type: 'Identifier', name: 'data' },
        value: createObjectExpression(),
        readonly: false,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })
  })

  describe('not reporting for non-matching init types', () => {
    test('should not report for string literal init', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('str', createLiteral('hello')))
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report for number literal init', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('num', createLiteral(42)))
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report for boolean literal init', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('bool', createLiteral(true)))
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report for null literal init', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('val', createLiteral(null)))
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report for function expression init', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('fn', createFunctionExpression()))
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report for arrow function init', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('fn', createArrowFunctionExpression()))
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report for binary expression init', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('sum', createBinaryExpression()))
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report for NewExpression with non-tracked constructor', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('date', createNewExpression('Date')))
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report for identifier init', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('ref', createIdentifier('other')))
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report for call expression init', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator('result', createCallExpression(createIdentifier('factory'))),
      )
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })
  })

  describe('additional detection scenarios', () => {
    test('should report variable with single-character name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('a', createArrayExpression()))
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('a')
    })

    test('should report variable with long descriptive name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator('userAuthenticationTokens', createArrayExpression()),
      )
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('userAuthenticationTokens')
    })

    test('should not report when variable is reassigned via simple identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('arr', createArrayExpression()))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('arr'), createLiteral(5)),
      )
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should report when only delete on unrelated variable happens', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('arr', createArrayExpression()))
      visitor.UnaryExpression(
        createUnaryExpression(
          createMemberExpression(createIdentifier('otherObj'), 'prop'),
          'delete',
        ),
      )
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should report when update on unrelated variable happens', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('arr', createArrayExpression()))
      visitor.UpdateExpression(
        createUpdateExpression(createMemberExpression(createIdentifier('counter'), 'val')),
      )
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should report object even when push called on different array', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('obj', createObjectExpression()))
      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('otherArr'), 'push')),
      )
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should handle array with elements', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator('arr', {
          type: 'ArrayExpression',
          elements: [createLiteral(1), createLiteral(2), createLiteral(3)],
        }),
      )
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should handle object with properties', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator('obj', {
          type: 'ObjectExpression',
          properties: [createProperty('key', createLiteral('value'))],
        }),
      )
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should not double-report same variable name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('arr', createArrayExpression()))
      visitor.VariableDeclarator(createVariableDeclarator('arr', createArrayExpression()))
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should handle new Array with arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator('arr', {
          type: 'NewExpression',
          callee: { type: 'Identifier', name: 'Array' },
          arguments: [createLiteral(10)],
        }),
      )
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should handle new Map with arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator('map', {
          type: 'NewExpression',
          callee: { type: 'Identifier', name: 'Map' },
          arguments: [createArrayExpression()],
        }),
      )
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should handle new Set with arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator('set', {
          type: 'NewExpression',
          callee: { type: 'Identifier', name: 'Set' },
          arguments: [createArrayExpression()],
        }),
      )
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should handle deeply nested member expression mutation', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('obj', createObjectExpression()))
      visitor.AssignmentExpression(
        createAssignmentExpression(
          createMemberExpression(
            createMemberExpression(
              createMemberExpression(createIdentifier('obj'), 'level1'),
              'level2',
            ),
            'level3',
          ),
          createLiteral(1),
        ),
      )
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report when assignment targets member of different object', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('arr', createArrayExpression()))
      visitor.AssignmentExpression(
        createAssignmentExpression(
          createMemberExpression(createIdentifier('otherObj'), 'prop'),
          createLiteral(1),
        ),
      )
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should report for new Object with arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator('obj', {
          type: 'NewExpression',
          callee: { type: 'Identifier', name: 'Object' },
          arguments: [createIdentifier('source')],
        }),
      )
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should handle TSAsExpression wrapping new Map', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator('map', createTSAsExpression(createNewMapExpression())),
      )
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should handle TSTypeAssertion wrapping new Set', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator('set', createTSTypeAssertion(createNewSetExpression())),
      )
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should handle TSAsExpression wrapping non-tracked type', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator('str', createTSAsExpression(createLiteral('hello'))),
      )
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should handle TSTypeAssertion wrapping non-tracked type', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator('num', createTSTypeAssertion(createLiteral(42))),
      )
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should handle NewExpression with MemberExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator('obj', {
          type: 'NewExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'ns' },
            property: { type: 'Identifier', name: 'CustomType' },
          },
          arguments: [],
        }),
      )
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should handle class property with new Array value in class expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor['ClassExpression']({
        type: 'ClassExpression',
        id: { type: 'Identifier', name: 'Expr' },
      })
      visitor.PropertyDefinition(createPropertyDefinition('buffer', createNewArrayExpression()))
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })
  })

  describe('test.each - non-mutating methods still report', () => {
    test.each([
      'map',
      'filter',
      'forEach',
      'reduce',
      'find',
      'findIndex',
      'some',
      'every',
      'includes',
      'indexOf',
      'join',
      'concat',
    ] as const)('should report array when only %s is called (non-mutating)', (method) => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('arr', createArrayExpression()))
      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('arr'), method), [
          createIdentifier('fn'),
        ]),
      )
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })
  })

  describe('test.each - init types that trigger tracking', () => {
    test.each([
      { name: 'ArrayExpression', create: createArrayExpression },
      { name: 'ObjectExpression', create: createObjectExpression },
      { name: 'new Array()', create: createNewArrayExpression },
      { name: 'new Object()', create: createNewObjectExpression },
      { name: 'new Map()', create: createNewMapExpression },
      { name: 'new Set()', create: createNewSetExpression },
    ] as const)('should report unmodified let variable with $name init', ({ create }) => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('data', create()))
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })
  })

  describe('test.each - init types that do NOT trigger tracking', () => {
    test.each([
      { name: 'string literal', value: createLiteral('hello') },
      { name: 'number literal', value: createLiteral(42) },
      { name: 'boolean literal', value: createLiteral(true) },
      { name: 'null literal', value: createLiteral(null) },
      { name: 'identifier', value: createIdentifier('ref') },
      { name: 'function expression', value: createFunctionExpression() },
      { name: 'arrow function', value: createArrowFunctionExpression() },
      { name: 'new Date()', value: createNewExpression('Date') },
    ] as const)('should NOT report for $name init', ({ value }) => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('val', value))
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })
  })

  describe('test.each - private member patterns', () => {
    test.each(['_private', '#private', '__dunder', '$dollar'] as const)(
      'should report variable named %s by default (no ignorePrivateMembers)',
      (name) => {
        const { context, reports } = createMockContext()
        const visitor = preferReadonlyRule.create(context)

        visitor.VariableDeclarator(createVariableDeclarator(name, createArrayExpression()))
        visitor['Program:exit']()

        expect(reports.length).toBe(1)
      },
    )
  })

  describe('test.each - variable declaration kinds', () => {
    test.each([
      { kind: 'let', expected: 1 },
      { kind: 'var', expected: 1 },
      { kind: 'const', expected: 0 },
    ] as const)('should report $kind array as $expected reports', ({ kind, expected }) => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('arr', createArrayExpression(), kind))
      visitor['Program:exit']()

      expect(reports.length).toBe(expected)
    })
  })

  describe('test.each - mutating methods prevent reports', () => {
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
    ] as const)('should not report array when %s is called', (method) => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('arr', createArrayExpression()))
      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('arr'), method)),
      )
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })
  })

  describe('test.each - update operators on member', () => {
    test.each([
      { operator: '++', prefix: false },
      { operator: '++', prefix: true },
      { operator: '--', prefix: false },
      { operator: '--', prefix: true },
    ] as const)('should not report object when %s%s is used on member', ({ operator, prefix }) => {
      const { context, reports } = createMockContext()
      const visitor = preferReadonlyRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('obj', createObjectExpression()))
      visitor.UpdateExpression({
        type: 'UpdateExpression',
        operator,
        argument: createMemberExpression(createIdentifier('obj'), 'count'),
        prefix,
      })
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })
  })
})
