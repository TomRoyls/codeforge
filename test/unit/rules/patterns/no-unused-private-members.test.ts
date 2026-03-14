import { describe, test, expect, vi } from 'vitest'
import { noUnusedPrivateMembersRule } from '../../../../src/rules/patterns/no-unused-private-members.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'class A { #x = 1; }',
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

function createLocation(line = 1, column = 0, endLine?: number, endColumn?: number) {
  return {
    start: { line, column },
    end: { line: endLine ?? line, column: endColumn ?? column + 5 },
  }
}

function createClassDeclaration(body: unknown[] = []): unknown {
  return {
    type: 'ClassDeclaration',
    id: { type: 'Identifier', name: 'TestClass' },
    body: { type: 'ClassBody', body },
    loc: createLocation(),
  }
}

function createClassExpression(body: unknown[] = []): unknown {
  return {
    type: 'ClassExpression',
    id: null,
    body: { type: 'ClassBody', body },
    loc: createLocation(),
  }
}

function createPrivateProperty(name: string, line = 1, column = 0): unknown {
  return {
    type: 'PropertyDefinition',
    key: {
      type: 'PrivateIdentifier',
      name,
    },
    value: { type: 'Literal', value: 1 },
    loc: createLocation(line, column),
  }
}

function createPrivateMethod(name: string, line = 1, column = 0): unknown {
  return {
    type: 'MethodDefinition',
    kind: 'method',
    key: {
      type: 'PrivateIdentifier',
      name,
    },
    value: {
      type: 'FunctionExpression',
      params: [],
      body: { type: 'BlockStatement', body: [] },
    },
    loc: createLocation(line, column),
  }
}

function createMemberExpressionPrivate(
  propertyName: string,
  object: unknown = { type: 'ThisExpression' },
): unknown {
  return {
    type: 'MemberExpression',
    object,
    property: {
      type: 'PrivateIdentifier',
      name: propertyName,
    },
    computed: false,
    loc: createLocation(),
  }
}

function createCallExpressionPrivate(methodName: string): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'ThisExpression' },
      property: {
        type: 'PrivateIdentifier',
        name: methodName,
      },
      computed: false,
    },
    arguments: [],
    loc: createLocation(),
  }
}

function createBinaryExpressionIn(privateName: string): unknown {
  return {
    type: 'BinaryExpression',
    operator: 'in',
    left: {
      type: 'PrivateIdentifier',
      name: privateName,
    },
    right: { type: 'ThisExpression' },
    loc: createLocation(),
  }
}

describe('no-unused-private-members rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noUnusedPrivateMembersRule.meta.type).toBe('problem')
    })

    test('should have warn severity', () => {
      expect(noUnusedPrivateMembersRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noUnusedPrivateMembersRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noUnusedPrivateMembersRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUnusedPrivateMembersRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noUnusedPrivateMembersRule.meta.fixable).toBeUndefined()
    })

    test('should mention unused in description', () => {
      expect(noUnusedPrivateMembersRule.meta.docs?.description.toLowerCase()).toContain('unused')
    })

    test('should mention private in description', () => {
      expect(noUnusedPrivateMembersRule.meta.docs?.description.toLowerCase()).toContain('private')
    })

    test('should have empty schema array', () => {
      expect(noUnusedPrivateMembersRule.meta.schema).toEqual([])
    })
  })

  describe('create', () => {
    test('should return visitor object with ClassDeclaration method', () => {
      const { context } = createMockContext()
      const visitor = noUnusedPrivateMembersRule.create(context)

      expect(visitor).toHaveProperty('ClassDeclaration')
    })

    test('should return visitor object with ClassDeclaration:exit method', () => {
      const { context } = createMockContext()
      const visitor = noUnusedPrivateMembersRule.create(context)

      expect(visitor).toHaveProperty('ClassDeclaration:exit')
    })

    test('should return visitor object with ClassExpression method', () => {
      const { context } = createMockContext()
      const visitor = noUnusedPrivateMembersRule.create(context)

      expect(visitor).toHaveProperty('ClassExpression')
    })

    test('should return visitor object with ClassExpression:exit method', () => {
      const { context } = createMockContext()
      const visitor = noUnusedPrivateMembersRule.create(context)

      expect(visitor).toHaveProperty('ClassExpression:exit')
    })

    test('should return visitor object with PropertyDefinition method', () => {
      const { context } = createMockContext()
      const visitor = noUnusedPrivateMembersRule.create(context)

      expect(visitor).toHaveProperty('PropertyDefinition')
    })

    test('should return visitor object with MethodDefinition method', () => {
      const { context } = createMockContext()
      const visitor = noUnusedPrivateMembersRule.create(context)

      expect(visitor).toHaveProperty('MethodDefinition')
    })

    test('should return visitor object with MemberExpression method', () => {
      const { context } = createMockContext()
      const visitor = noUnusedPrivateMembersRule.create(context)

      expect(visitor).toHaveProperty('MemberExpression')
    })

    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = noUnusedPrivateMembersRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return visitor object with BinaryExpression method', () => {
      const { context } = createMockContext()
      const visitor = noUnusedPrivateMembersRule.create(context)

      expect(visitor).toHaveProperty('BinaryExpression')
    })
  })

  describe('detecting unused private properties', () => {
    test('should report when private property is declared but never used', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('x'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('#x')
      expect(reports[0].message).toContain('Private property')
    })

    test('should not report when private property is used via member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('x'))
      visitor.MemberExpression(createMemberExpressionPrivate('x'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should not report when private property is used with "in" operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('x'))
      visitor.BinaryExpression(createBinaryExpressionIn('x'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should report multiple unused private properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('x'))
      visitor.PropertyDefinition(createPrivateProperty('y'))
      visitor.PropertyDefinition(createPrivateProperty('z'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(3)
    })

    test('should report only unused when some are used', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('x'))
      visitor.PropertyDefinition(createPrivateProperty('y'))
      visitor.PropertyDefinition(createPrivateProperty('z'))
      visitor.MemberExpression(createMemberExpressionPrivate('y'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('#x')
      expect(reports[1].message).toContain('#z')
    })
  })

  describe('detecting unused private methods', () => {
    test('should report when private method is declared but never used', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.MethodDefinition(createPrivateMethod('doSomething'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('#doSomething')
      expect(reports[0].message).toContain('Private method')
    })

    test('should not report when private method is called', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.MethodDefinition(createPrivateMethod('doSomething'))
      visitor.CallExpression(createCallExpressionPrivate('doSomething'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should not report when private method is accessed via member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.MethodDefinition(createPrivateMethod('callback'))
      visitor.MemberExpression(createMemberExpressionPrivate('callback'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })
  })

  describe('mixed private members', () => {
    test('should report both unused private properties and methods', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('unusedProp'))
      visitor.MethodDefinition(createPrivateMethod('unusedMethod'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('Private property')
      expect(reports[1].message).toContain('Private method')
    })

    test('should handle class with both used and unused private members', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('used'))
      visitor.PropertyDefinition(createPrivateProperty('unused'))
      visitor.MethodDefinition(createPrivateMethod('usedMethod'))
      visitor.MethodDefinition(createPrivateMethod('unusedMethod'))
      visitor.MemberExpression(createMemberExpressionPrivate('used'))
      visitor.CallExpression(createCallExpressionPrivate('usedMethod'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('#unused')
      expect(reports[1].message).toContain('#unusedMethod')
    })
  })

  describe('ClassExpression', () => {
    test('should detect unused private members in class expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassExpression(createClassExpression())
      visitor.PropertyDefinition(createPrivateProperty('x'))
      visitor['ClassExpression:exit']?.(undefined)

      expect(reports.length).toBe(1)
    })

    test('should not report used private members in class expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassExpression(createClassExpression())
      visitor.PropertyDefinition(createPrivateProperty('x'))
      visitor.MemberExpression(createMemberExpressionPrivate('x'))
      visitor['ClassExpression:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })
  })

  describe('nested classes', () => {
    test('should track private members separately in nested classes', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('outer'))
      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('inner'))
      visitor.MemberExpression(createMemberExpressionPrivate('inner'))
      visitor['ClassDeclaration:exit']?.(undefined)
      visitor.MemberExpression(createMemberExpressionPrivate('outer'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should report unused in correct class scope', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('outer'))
      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('inner'))
      visitor.MemberExpression(createMemberExpressionPrivate('outer'))
      visitor['ClassDeclaration:exit']?.(undefined)
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(2)
    })
  })

  describe('edge cases', () => {
    test('should handle null node in ClassDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedPrivateMembersRule.create(context)

      expect(() => visitor.ClassDeclaration(null)).not.toThrow()
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle undefined node in PropertyDefinition', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      expect(() => visitor.PropertyDefinition(undefined)).not.toThrow()
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle PropertyDefinition without key', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition({ type: 'PropertyDefinition', loc: createLocation() })
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle PropertyDefinition with non-private identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition({
        type: 'PropertyDefinition',
        key: { type: 'Identifier', name: 'publicProp' },
        loc: createLocation(),
      })
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle MethodDefinition without key', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.MethodDefinition({ type: 'MethodDefinition', loc: createLocation() })
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression without property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('x'))
      visitor.MemberExpression({ type: 'MemberExpression' })
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(1)
    })

    test('should handle CallExpression without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.MethodDefinition(createPrivateMethod('m'))
      visitor.CallExpression({ type: 'CallExpression' })
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(1)
    })

    test('should handle BinaryExpression without left', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('x'))
      visitor.BinaryExpression({ type: 'BinaryExpression', operator: 'in' })
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(1)
    })

    test('should handle BinaryExpression with wrong operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('x'))
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'PrivateIdentifier', name: 'x' },
      })
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(1)
    })

    test('should handle class without body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration({ type: 'ClassDeclaration', loc: createLocation() })
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should mention member name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('myProp'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports[0].message).toContain('#myProp')
    })

    test('should mention declared in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('x'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports[0].message).toContain('declared')
    })

    test('should mention never used in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('x'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports[0].message).toContain('never used')
    })

    test('should distinguish property from method in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('prop'))
      visitor.MethodDefinition(createPrivateMethod('method'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports[0].message).toContain('Private property')
      expect(reports[1].message).toContain('Private method')
    })
  })

  describe('location reporting', () => {
    test('should report correct location for unused private property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('x', 5, 10))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report correct location for unused private method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.MethodDefinition(createPrivateMethod('myMethod', 8, 15))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports[0].loc?.start.line).toBe(8)
      expect(reports[0].loc?.start.column).toBe(15)
    })
  })
})
