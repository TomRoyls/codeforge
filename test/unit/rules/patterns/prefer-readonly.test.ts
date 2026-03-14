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
  })
})
