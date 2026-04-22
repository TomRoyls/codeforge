import { noUnusedPrivateMembersRule } from '../../../../src/rules/patterns/no-unused-private-members.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

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

    test('should have docs property', () => {
      expect(noUnusedPrivateMembersRule.meta.docs).toBeDefined()
    })

    test('should have docs.url as string', () => {
      expect(typeof noUnusedPrivateMembersRule.meta.docs?.url).toBe('string')
    })

    test('should have non-empty description', () => {
      expect(noUnusedPrivateMembersRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have valid rule type', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(noUnusedPrivateMembersRule.meta.type)
    })

    test('should have valid severity', () => {
      expect(['off', 'warn', 'error']).toContain(noUnusedPrivateMembersRule.meta.severity)
    })

    test('should have create function', () => {
      expect(typeof noUnusedPrivateMembersRule.create).toBe('function')
    })

    test('should not be deprecated', () => {
      expect(noUnusedPrivateMembersRule.meta.deprecated).toBeUndefined()
    })

    test('should not have replacedBy', () => {
      expect(noUnusedPrivateMembersRule.meta.replacedBy).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(noUnusedPrivateMembersRule.meta.requiresTypeChecking).toBeUndefined()
    })

    test('should mention class in description', () => {
      expect(noUnusedPrivateMembersRule.meta.docs?.description.toLowerCase()).toContain('class')
    })

    test('should mention member or members in description', () => {
      const desc = noUnusedPrivateMembersRule.meta.docs?.description.toLowerCase() ?? ''
      expect(desc).toMatch(/member/)
    })
  })

  describe('create', () => {
    test('should return visitor object with ClassDeclaration method', () => {
      const { context } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      expect(visitor).toHaveProperty('ClassDeclaration')
    })

    test('should return visitor object with ClassDeclaration:exit method', () => {
      const { context } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      expect(visitor).toHaveProperty('ClassDeclaration:exit')
    })

    test('should return visitor object with ClassExpression method', () => {
      const { context } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      expect(visitor).toHaveProperty('ClassExpression')
    })

    test('should return visitor object with ClassExpression:exit method', () => {
      const { context } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      expect(visitor).toHaveProperty('ClassExpression:exit')
    })

    test('should return visitor object with PropertyDefinition method', () => {
      const { context } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      expect(visitor).toHaveProperty('PropertyDefinition')
    })

    test('should return visitor object with MethodDefinition method', () => {
      const { context } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      expect(visitor).toHaveProperty('MethodDefinition')
    })

    test('should return visitor object with MemberExpression method', () => {
      const { context } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      expect(visitor).toHaveProperty('MemberExpression')
    })

    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return visitor object with BinaryExpression method', () => {
      const { context } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      expect(visitor).toHaveProperty('BinaryExpression')
    })

    test('should return visitor with all handlers as functions', () => {
      const { context } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      expect(typeof visitor.ClassDeclaration).toBe('function')
      expect(typeof visitor['ClassDeclaration:exit']).toBe('function')
      expect(typeof visitor.ClassExpression).toBe('function')
      expect(typeof visitor['ClassExpression:exit']).toBe('function')
      expect(typeof visitor.PropertyDefinition).toBe('function')
      expect(typeof visitor.MethodDefinition).toBe('function')
      expect(typeof visitor.MemberExpression).toBe('function')
      expect(typeof visitor.CallExpression).toBe('function')
      expect(typeof visitor.BinaryExpression).toBe('function')
    })

    test('should return a new visitor for each create call', () => {
      const { context } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor1 = noUnusedPrivateMembersRule.create(context)
      const visitor2 = noUnusedPrivateMembersRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should return visitor with exactly 9 keys', () => {
      const { context } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      expect(Object.keys(visitor)).toHaveLength(9)
    })
  })

  describe('detecting unused private properties', () => {
    test('should report when private property is declared but never used', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('x'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('#x')
      expect(reports[0].message).toContain('Private property')
    })

    test('should not report when private property is used via member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('x'))
      visitor.MemberExpression(createMemberExpressionPrivate('x'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should not report when private property is used with "in" operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('x'))
      visitor.BinaryExpression(createBinaryExpressionIn('x'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should report multiple unused private properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('x'))
      visitor.PropertyDefinition(createPrivateProperty('y'))
      visitor.PropertyDefinition(createPrivateProperty('z'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(3)
    })

    test('should report only unused when some are used', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
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

    test('should detect single unused private property with underscore prefix name', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('_internal'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('#_internal')
    })

    test('should detect unused private property with numeric-like name', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('value2'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('#value2')
    })

    test('should detect unused private property with single character name', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('a'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('#a')
    })

    test('should detect unused private property with long descriptive name', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('veryLongDescriptivePropertyName'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('#veryLongDescriptivePropertyName')
    })

    test('should detect unused private property with dollar sign name', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('$element'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('#$element')
    })

    test('should detect 5 unused private properties at once', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('a'))
      visitor.PropertyDefinition(createPrivateProperty('b'))
      visitor.PropertyDefinition(createPrivateProperty('c'))
      visitor.PropertyDefinition(createPrivateProperty('d'))
      visitor.PropertyDefinition(createPrivateProperty('e'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(5)
    })

    test('should report unused property when only method is used', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('data'))
      visitor.MethodDefinition(createPrivateMethod('process'))
      visitor.CallExpression(createCallExpressionPrivate('process'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('#data')
    })

    test('should not report when property and method share the same name and method is called', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('value'))
      visitor.MethodDefinition(createPrivateMethod('value'))
      visitor.CallExpression(createCallExpressionPrivate('value'))
      visitor['ClassDeclaration:exit']?.(undefined)

      // Same-named members overwrite in the map; method call marks 'value' as used
      expect(reports.length).toBe(0)
    })
  })

  describe('detecting unused private methods', () => {
    test('should report when private method is declared but never used', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.MethodDefinition(createPrivateMethod('doSomething'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('#doSomething')
      expect(reports[0].message).toContain('Private method')
    })

    test('should not report when private method is called', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.MethodDefinition(createPrivateMethod('doSomething'))
      visitor.CallExpression(createCallExpressionPrivate('doSomething'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should not report when private method is accessed via member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.MethodDefinition(createPrivateMethod('callback'))
      visitor.MemberExpression(createMemberExpressionPrivate('callback'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should report unused private method with underscore prefix', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.MethodDefinition(createPrivateMethod('_helper'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('#_helper')
    })

    test('should report multiple unused private methods', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.MethodDefinition(createPrivateMethod('a'))
      visitor.MethodDefinition(createPrivateMethod('b'))
      visitor.MethodDefinition(createPrivateMethod('c'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(3)
    })

    test('should report only unused methods when some are used', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.MethodDefinition(createPrivateMethod('used'))
      visitor.MethodDefinition(createPrivateMethod('unused'))
      visitor.CallExpression(createCallExpressionPrivate('used'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('#unused')
    })

    test('should not report private method used via "in" operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.MethodDefinition(createPrivateMethod('handler'))
      visitor.BinaryExpression(createBinaryExpressionIn('handler'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should detect unused private getter-style method', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.MethodDefinition(createPrivateMethod('getValue'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('#getValue')
    })

    test('should not report when method and property share same name and property is accessed', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.MethodDefinition(createPrivateMethod('data'))
      visitor.PropertyDefinition(createPrivateProperty('data'))
      visitor.MemberExpression(createMemberExpressionPrivate('data'))
      visitor['ClassDeclaration:exit']?.(undefined)

      // Property overwrites method in the map; member access marks 'data' as used
      expect(reports.length).toBe(0)
    })
  })

  describe('mixed private members', () => {
    test('should report both unused private properties and methods', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
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
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
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

    test('should report correctly when property is used but method is not', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('name'))
      visitor.MethodDefinition(createPrivateMethod('compute'))
      visitor.MemberExpression(createMemberExpressionPrivate('name'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Private method')
      expect(reports[0].message).toContain('#compute')
    })

    test('should report correctly when method is used but property is not', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('cache'))
      visitor.MethodDefinition(createPrivateMethod('run'))
      visitor.CallExpression(createCallExpressionPrivate('run'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Private property')
      expect(reports[0].message).toContain('#cache')
    })

    test('should not report any when all properties and methods are used', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('x'))
      visitor.MethodDefinition(createPrivateMethod('init'))
      visitor.MemberExpression(createMemberExpressionPrivate('x'))
      visitor.CallExpression(createCallExpressionPrivate('init'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })
  })

  describe('ClassExpression', () => {
    test('should detect unused private members in class expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassExpression(createClassExpression())
      visitor.PropertyDefinition(createPrivateProperty('x'))
      visitor['ClassExpression:exit']?.(undefined)

      expect(reports.length).toBe(1)
    })

    test('should not report used private members in class expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassExpression(createClassExpression())
      visitor.PropertyDefinition(createPrivateProperty('x'))
      visitor.MemberExpression(createMemberExpressionPrivate('x'))
      visitor['ClassExpression:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should detect unused private methods in class expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassExpression(createClassExpression())
      visitor.MethodDefinition(createPrivateMethod('calc'))
      visitor['ClassExpression:exit']?.(undefined)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('#calc')
    })

    test('should not report used private methods in class expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassExpression(createClassExpression())
      visitor.MethodDefinition(createPrivateMethod('calc'))
      visitor.CallExpression(createCallExpressionPrivate('calc'))
      visitor['ClassExpression:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should detect unused private property via "in" in class expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassExpression(createClassExpression())
      visitor.PropertyDefinition(createPrivateProperty('flag'))
      visitor.BinaryExpression(createBinaryExpressionIn('flag'))
      visitor['ClassExpression:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should report both unused property and method in class expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassExpression(createClassExpression())
      visitor.PropertyDefinition(createPrivateProperty('val'))
      visitor.MethodDefinition(createPrivateMethod('fn'))
      visitor['ClassExpression:exit']?.(undefined)

      expect(reports.length).toBe(2)
    })
  })

  describe('nested classes', () => {
    test('should track private members separately in nested classes', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
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
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
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

    test('should handle three levels of nesting', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('a'))
      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('b'))
      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('c'))
      visitor['ClassDeclaration:exit']?.(undefined)
      visitor['ClassDeclaration:exit']?.(undefined)
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(3)
    })

    test('should not confuse member usage between nested classes', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('x'))
      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('x'))
      visitor.MemberExpression(createMemberExpressionPrivate('x'))
      visitor['ClassDeclaration:exit']?.(undefined)
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(1)
    })

    test('should handle ClassExpression nested inside ClassDeclaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('outer'))
      visitor.ClassExpression(createClassExpression())
      visitor.PropertyDefinition(createPrivateProperty('inner'))
      visitor['ClassExpression:exit']?.(undefined)
      visitor.MemberExpression(createMemberExpressionPrivate('outer'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('#inner')
    })

    test('should handle sibling classes at same nesting level', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('a'))
      visitor.MemberExpression(createMemberExpressionPrivate('a'))
      visitor['ClassDeclaration:exit']?.(undefined)
      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('b'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('#b')
    })
  })

  describe('edge cases', () => {
    test('should handle null node in ClassDeclaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      expect(() => visitor.ClassDeclaration(null)).not.toThrow()
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle undefined node in PropertyDefinition', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      expect(() => visitor.PropertyDefinition(undefined)).not.toThrow()
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle PropertyDefinition without key', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition({ type: 'PropertyDefinition', loc: createLocation() })
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle PropertyDefinition with non-private identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
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
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.MethodDefinition({ type: 'MethodDefinition', loc: createLocation() })
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression without property', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('x'))
      visitor.MemberExpression({ type: 'MemberExpression' })
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(1)
    })

    test('should handle CallExpression without callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.MethodDefinition(createPrivateMethod('m'))
      visitor.CallExpression({ type: 'CallExpression' })
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(1)
    })

    test('should handle BinaryExpression without left', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('x'))
      visitor.BinaryExpression({ type: 'BinaryExpression', operator: 'in' })
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(1)
    })

    test('should handle BinaryExpression with wrong operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
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
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration({ type: 'ClassDeclaration', loc: createLocation() })
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle MethodDefinition with non-private key', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.MethodDefinition({
        type: 'MethodDefinition',
        kind: 'method',
        key: { type: 'Identifier', name: 'publicMethod' },
        loc: createLocation(),
      })
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression with non-private property', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('x'))
      visitor.MemberExpression({
        type: 'MemberExpression',
        object: { type: 'ThisExpression' },
        property: { type: 'Identifier', name: 'x' },
      })
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(1)
    })

    test('should handle CallExpression with non-member callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.MethodDefinition(createPrivateMethod('fn'))
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [],
      })
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(1)
    })

    test('should handle CallExpression with member callee but non-private property', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.MethodDefinition(createPrivateMethod('fn'))
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ThisExpression' },
          property: { type: 'Identifier', name: 'fn' },
        },
        arguments: [],
      })
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(1)
    })

    test('should handle undefined node in MethodDefinition', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      expect(() => visitor.MethodDefinition(undefined)).not.toThrow()
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle null node in MemberExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      expect(() => visitor.MemberExpression(null)).not.toThrow()
    })

    test('should handle null node in CallExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle null node in BinaryExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      expect(() => visitor.BinaryExpression(null)).not.toThrow()
    })

    test('should handle class with only public members', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(
        createClassDeclaration([
          { type: 'PropertyDefinition', key: { type: 'Identifier', name: 'pub' } },
        ]),
      )
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle empty class body', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration([]))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle PropertyDefinition with null key', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition({
        type: 'PropertyDefinition',
        key: null,
        loc: createLocation(),
      })
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle MethodDefinition with null key', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.MethodDefinition({
        type: 'MethodDefinition',
        kind: 'method',
        key: null,
        loc: createLocation(),
      })
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should not report when private property defined outside class', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.PropertyDefinition(createPrivateProperty('orphan'))
      expect(reports.length).toBe(0)
    })

    test('should not report when private method defined outside class', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.MethodDefinition(createPrivateMethod('orphan'))
      expect(reports.length).toBe(0)
    })

    test('should handle BinaryExpression with in operator but Identifier left', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('x'))
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: 'in',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'ThisExpression' },
      })
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(1)
    })

    test('should handle popClass when stack is empty', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle MethodDefinition with constructor kind', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.MethodDefinition({
        type: 'MethodDefinition',
        kind: 'constructor',
        key: { type: 'PrivateIdentifier', name: 'ctor' },
        loc: createLocation(),
      })
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(1)
    })

    test('should handle PropertyDefinition without value', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition({
        type: 'PropertyDefinition',
        key: { type: 'PrivateIdentifier', name: 'noValue' },
        loc: createLocation(),
      })
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('#noValue')
    })
  })

  describe('message quality', () => {
    test('should mention member name in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('myProp'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports[0].message).toContain('#myProp')
    })

    test('should mention declared in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('x'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports[0].message).toContain('declared')
    })

    test('should mention never used in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('x'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports[0].message).toContain('never used')
    })

    test('should distinguish property from method in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('prop'))
      visitor.MethodDefinition(createPrivateMethod('method'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports[0].message).toContain('Private property')
      expect(reports[1].message).toContain('Private method')
    })

    test('should include hash prefix in property message', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('name'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports[0].message).toContain('#name')
    })

    test('should include hash prefix in method message', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.MethodDefinition(createPrivateMethod('execute'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports[0].message).toContain('#execute')
    })

    test('should have period at end of message', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('x'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports[0].message).toContain('never used.')
    })

    test('should format property message correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('data'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports[0].message).toBe("Private property '#data' is declared but never used.")
    })

    test('should format method message correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.MethodDefinition(createPrivateMethod('process'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports[0].message).toBe("Private method '#process' is declared but never used.")
    })

    test('should have distinct messages for each unused member', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('alpha'))
      visitor.PropertyDefinition(createPrivateProperty('beta'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports[0].message).not.toBe(reports[1].message)
    })
  })

  describe('location reporting', () => {
    test('should report correct location for unused private property', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('x', 5, 10))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report correct location for unused private method', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.MethodDefinition(createPrivateMethod('myMethod', 8, 15))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports[0].loc?.start.line).toBe(8)
      expect(reports[0].loc?.start.column).toBe(15)
    })

    test('should report correct end location for unused property', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('x', 3, 4))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(9)
    })

    test('should report correct location at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('x', 1, 0))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location for multiple unused members at different positions', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('a', 2, 0))
      visitor.PropertyDefinition(createPrivateProperty('b', 4, 8))
      visitor.PropertyDefinition(createPrivateProperty('c', 6, 16))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[1].loc?.start.line).toBe(4)
      expect(reports[2].loc?.start.line).toBe(6)
      expect(reports[1].loc?.start.column).toBe(8)
      expect(reports[2].loc?.start.column).toBe(16)
    })

    test('should report location for unused private method at high line number', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.MethodDefinition(createPrivateMethod('deep', 100, 50))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report location for mixed property and method', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('p', 3, 2))
      visitor.MethodDefinition(createPrivateMethod('m', 7, 4))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[1].loc?.start.line).toBe(7)
    })

    test('should report location for unused member in class expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassExpression(createClassExpression())
      visitor.PropertyDefinition(createPrivateProperty('expr', 10, 20))
      visitor['ClassExpression:exit']?.(undefined)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should report location with multi-line span', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition({
        type: 'PropertyDefinition',
        key: { type: 'PrivateIdentifier', name: 'multi' },
        loc: createLocation(5, 2, 8, 15),
      })
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.end.line).toBe(8)
      expect(reports[0].loc?.start.column).toBe(2)
      expect(reports[0].loc?.end.column).toBe(15)
    })

    test('should preserve exact column numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('x', 1, 42))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports[0].loc?.start.column).toBe(42)
    })

    test('should preserve line number 0 when passed', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition({
        type: 'PropertyDefinition',
        key: { type: 'PrivateIdentifier', name: 'zero' },
        loc: createLocation(0, 0, 0, 5),
      })
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report end location for method', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.MethodDefinition(createPrivateMethod('m', 3, 0))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(5)
    })

    test('should report distinct locations for each unused member', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('a', 1, 0))
      visitor.PropertyDefinition(createPrivateProperty('b', 2, 0))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports[0].loc?.start.line).not.toBe(reports[1].loc?.start.line)
    })

    test('should report location for nested class unused member', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('nested', 15, 8))
      visitor['ClassDeclaration:exit']?.(undefined)
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports[0].loc?.start.line).toBe(15)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should report location for unused method at column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.MethodDefinition(createPrivateMethod('start', 1, 0))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  describe('multiple reports', () => {
    test('should report 4 unused private properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('w'))
      visitor.PropertyDefinition(createPrivateProperty('x'))
      visitor.PropertyDefinition(createPrivateProperty('y'))
      visitor.PropertyDefinition(createPrivateProperty('z'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(4)
    })

    test('should report 4 unused private methods', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.MethodDefinition(createPrivateMethod('a'))
      visitor.MethodDefinition(createPrivateMethod('b'))
      visitor.MethodDefinition(createPrivateMethod('c'))
      visitor.MethodDefinition(createPrivateMethod('d'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(4)
    })

    test('should report mix of unused properties and methods', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('p1'))
      visitor.MethodDefinition(createPrivateMethod('m1'))
      visitor.PropertyDefinition(createPrivateProperty('p2'))
      visitor.MethodDefinition(createPrivateMethod('m2'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(4)
    })

    test('should report for sequential separate classes', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('a'))
      visitor['ClassDeclaration:exit']?.(undefined)
      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('b'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(2)
    })

    test('should report for class expression followed by class declaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassExpression(createClassExpression())
      visitor.PropertyDefinition(createPrivateProperty('expr'))
      visitor['ClassExpression:exit']?.(undefined)
      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('decl'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(2)
    })

    test('should report only first member unused among many', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('first'))
      visitor.PropertyDefinition(createPrivateProperty('second'))
      visitor.PropertyDefinition(createPrivateProperty('third'))
      visitor.MemberExpression(createMemberExpressionPrivate('second'))
      visitor.MemberExpression(createMemberExpressionPrivate('third'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('#first')
    })

    test('should report only last member unused among many', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('first'))
      visitor.PropertyDefinition(createPrivateProperty('second'))
      visitor.PropertyDefinition(createPrivateProperty('third'))
      visitor.MemberExpression(createMemberExpressionPrivate('first'))
      visitor.MemberExpression(createMemberExpressionPrivate('second'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('#third')
    })

    test('should report all when nothing is used', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('a'))
      visitor.MethodDefinition(createPrivateMethod('b'))
      visitor.PropertyDefinition(createPrivateProperty('c'))
      visitor.MethodDefinition(createPrivateMethod('d'))
      visitor.PropertyDefinition(createPrivateProperty('e'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(5)
    })

    test('should not report when everything is used via different mechanisms', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('viaMember'))
      visitor.PropertyDefinition(createPrivateProperty('viaIn'))
      visitor.MethodDefinition(createPrivateMethod('viaCall'))
      visitor.MemberExpression(createMemberExpressionPrivate('viaMember'))
      visitor.BinaryExpression(createBinaryExpressionIn('viaIn'))
      visitor.CallExpression(createCallExpressionPrivate('viaCall'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })
  })

  describe('context handling', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }', filePath: '/project/src/app.ts' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('x'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(1)
    })

    test('should work with different source content', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1', filePath: '/src/file.ts' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('y'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(1)
    })

    test('should work with empty options', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('x'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(1)
    })

    test('should work with options containing ignored patterns', () => {
      const { context, reports } = createMockRuleContext({ options: [{ ignore: ['#x'] }], source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('x'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(1)
    })

    test('should work with multiple sequential create calls', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'class A { #x = 1; }' })

      const v1 = noUnusedPrivateMembersRule.create(ctx1)
      const v2 = noUnusedPrivateMembersRule.create(ctx2)

      v1.ClassDeclaration(createClassDeclaration())
      v1.PropertyDefinition(createPrivateProperty('a'))
      v1['ClassDeclaration:exit']?.(undefined)

      v2.ClassDeclaration(createClassDeclaration())
      v2.PropertyDefinition(createPrivateProperty('b'))
      v2.MemberExpression(createMemberExpressionPrivate('b'))
      v2['ClassDeclaration:exit']?.(undefined)

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(0)
    })

    test('should not share state between different visitor instances', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'class A { #x = 1; }' })

      const v1 = noUnusedPrivateMembersRule.create(ctx1)
      const v2 = noUnusedPrivateMembersRule.create(ctx2)

      v1.ClassDeclaration(createClassDeclaration())
      v1.PropertyDefinition(createPrivateProperty('only'))

      v2.ClassDeclaration(createClassDeclaration())
      v2.PropertyDefinition(createPrivateProperty('only'))
      v2.MemberExpression(createMemberExpressionPrivate('only'))

      v1['ClassDeclaration:exit']?.(undefined)
      v2['ClassDeclaration:exit']?.(undefined)

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(0)
    })

    test('should work with deeply nested file path', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }', filePath: '/very/deeply/nested/project/src/features/auth/user.ts' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('token'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(1)
    })

    test('should work with long source content', () => {
      const longSource = 'class A { #x = 1; }\n'.repeat(100)
      const { context, reports } = createMockRuleContext({ source: longSource, filePath: '/src/file.ts' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('x'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(1)
    })

    test('should not call report when all members used', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('x'))
      visitor.MemberExpression(createMemberExpressionPrivate('x'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle class with only used members gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('a'))
      visitor.PropertyDefinition(createPrivateProperty('b'))
      visitor.MethodDefinition(createPrivateMethod('c'))
      visitor.MemberExpression(createMemberExpressionPrivate('a'))
      visitor.MemberExpression(createMemberExpressionPrivate('b'))
      visitor.CallExpression(createCallExpressionPrivate('c'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })
  })

  describe('not reporting - used private members', () => {
    test('should not report private property used via member expression with this', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('name'))
      visitor.MemberExpression(createMemberExpressionPrivate('name'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should not report private property used via "in" operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('has'))
      visitor.BinaryExpression(createBinaryExpressionIn('has'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should not report private method used via call expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.MethodDefinition(createPrivateMethod('compute'))
      visitor.CallExpression(createCallExpressionPrivate('compute'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should not report private method used via member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.MethodDefinition(createPrivateMethod('cb'))
      visitor.MemberExpression(createMemberExpressionPrivate('cb'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should not report when private property used multiple times', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('multi'))
      visitor.MemberExpression(createMemberExpressionPrivate('multi'))
      visitor.MemberExpression(createMemberExpressionPrivate('multi'))
      visitor.MemberExpression(createMemberExpressionPrivate('multi'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should not report public property with same name as unused private', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition({
        type: 'PropertyDefinition',
        key: { type: 'Identifier', name: 'publicX' },
        loc: createLocation(),
      })
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should not report public method with same name as unused private', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.MethodDefinition({
        type: 'MethodDefinition',
        kind: 'method',
        key: { type: 'Identifier', name: 'publicMethod' },
        loc: createLocation(),
      })
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should not report private property used after method definition', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.MethodDefinition(createPrivateMethod('m'))
      visitor.PropertyDefinition(createPrivateProperty('p'))
      visitor.MemberExpression(createMemberExpressionPrivate('p'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('#m')
    })

    test('should not report private member used in class expression with member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassExpression(createClassExpression())
      visitor.PropertyDefinition(createPrivateProperty('value'))
      visitor.MemberExpression(createMemberExpressionPrivate('value'))
      visitor['ClassExpression:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should not report when used via in operator for method', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.MethodDefinition(createPrivateMethod('validate'))
      visitor.BinaryExpression(createBinaryExpressionIn('validate'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should report member when used before being registered in visitor order', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.MemberExpression(createMemberExpressionPrivate('forward'))
      visitor.PropertyDefinition(createPrivateProperty('forward'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(1)
    })

    test('should not report when all three usage mechanisms apply to same member', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('triple'))
      visitor.MemberExpression(createMemberExpressionPrivate('triple'))
      visitor.BinaryExpression(createBinaryExpressionIn('triple'))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should not report used private method in class expression with call', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassExpression(createClassExpression())
      visitor.MethodDefinition(createPrivateMethod('render'))
      visitor.CallExpression(createCallExpressionPrivate('render'))
      visitor['ClassExpression:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should not report member accessed with non-this object', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('data'))
      visitor.MemberExpression(
        createMemberExpressionPrivate('data', { type: 'Identifier', name: 'obj' }),
      )
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })
  })

  describe('test.each - data-driven property name tests', () => {
    test.each([
      ['simple', '#simple'],
      ['_underscore', '#_underscore'],
      ['dollar$', '#dollar$'],
      ['num123', '#num123'],
      ['camelCase', '#camelCase'],
      ['PascalCase', '#PascalCase'],
      ['UPPER_CASE', '#UPPER_CASE'],
      ['a', '#a'],
      ['_', '#_'],
      ['$', '#$'],
    ])('should report unused private property named %s', (name: string, expected: string) => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty(name))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain(expected)
    })

    test.each([
      ['doWork', '#doWork'],
      ['_init', '#_init'],
      ['$apply', '#$apply'],
      ['handleClick', '#handleClick'],
      ['UPPER_METHOD', '#UPPER_METHOD'],
      ['x', '#x'],
    ])('should report unused private method named %s', (name: string, expected: string) => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.MethodDefinition(createPrivateMethod(name))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain(expected)
    })

    test.each([
      'alpha',
      'beta',
      'gamma',
      'delta',
      'epsilon',
      'zeta',
      'eta',
      'theta',
      'iota',
      'kappa',
    ])('should report unused property with greek-like name %s', (name: string) => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty(name))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain(`#${name}`)
    })

    test.each([
      [1, 0],
      [2, 5],
      [3, 10],
      [5, 20],
      [10, 0],
      [15, 3],
      [20, 7],
      [50, 0],
      [100, 0],
      [1, 99],
    ])('should report location at line %d column %d', (line: number, column: number) => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('pos', line, column))
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports[0].loc?.start.line).toBe(line)
      expect(reports[0].loc?.start.column).toBe(column)
    })

    test.each([
      ['member expression', 'MemberExpression'],
      ['call expression', 'CallExpression'],
      ['in operator', 'BinaryExpression'],
    ])('should not report when private member used via %s', (_desc: string, mechanism: string) => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('x'))

      if (mechanism === 'MemberExpression') {
        visitor.MemberExpression(createMemberExpressionPrivate('x'))
      } else if (mechanism === 'CallExpression') {
        visitor.MethodDefinition(createPrivateMethod('x'))
        visitor.CallExpression(createCallExpressionPrivate('x'))
      } else {
        visitor.BinaryExpression(createBinaryExpressionIn('x'))
      }

      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test.each([
      ['PropertyDefinition', 'PropertyDefinition'],
      ['MethodDefinition', 'MethodDefinition'],
    ])('should register private members from %s', (_desc: string, nodeType: string) => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())

      if (nodeType === 'PropertyDefinition') {
        visitor.PropertyDefinition(createPrivateProperty('x'))
      } else {
        visitor.MethodDefinition(createPrivateMethod('x'))
      }

      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(1)
    })

    test.each([
      ['Identifier', { type: 'Identifier', name: 'pub' }],
      ['null', null],
      ['undefined', undefined],
    ])('should not report for non-private key type: %s', (_desc: string, key: unknown) => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition({
        type: 'PropertyDefinition',
        key,
        loc: createLocation(),
      })
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test.each([
      [
        '+',
        { type: 'BinaryExpression', operator: '+', left: { type: 'PrivateIdentifier', name: 'x' } },
      ],
      [
        '-',
        { type: 'BinaryExpression', operator: '-', left: { type: 'PrivateIdentifier', name: 'x' } },
      ],
      [
        '*',
        { type: 'BinaryExpression', operator: '*', left: { type: 'PrivateIdentifier', name: 'x' } },
      ],
      [
        '==',
        {
          type: 'BinaryExpression',
          operator: '==',
          left: { type: 'PrivateIdentifier', name: 'x' },
        },
      ],
      [
        '<',
        { type: 'BinaryExpression', operator: '<', left: { type: 'PrivateIdentifier', name: 'x' } },
      ],
    ])('should not mark as used with %s operator', (_op: string, node: unknown) => {
      const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
      const visitor = noUnusedPrivateMembersRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration())
      visitor.PropertyDefinition(createPrivateProperty('x'))
      visitor.BinaryExpression(node)
      visitor['ClassDeclaration:exit']?.(undefined)

      expect(reports.length).toBe(1)
    })

    test.each([['problem'], ['suggestion'], ['layout']])(
      'should have a recognized meta type: %s',
      (type: string) => {
        expect(['problem', 'suggestion', 'layout']).toContain(type)
        expect(noUnusedPrivateMembersRule.meta.type).toBe('problem')
      },
    )

    test.each([['warn'], ['error'], ['off']])(
      'should have a recognized severity: %s',
      (sev: string) => {
        expect(['off', 'warn', 'error']).toContain(sev)
        expect(noUnusedPrivateMembersRule.meta.severity).toBe('warn')
      },
    )
  })

  describe('test.each - usage pattern combinations', () => {
    test.each([
      { props: 1, used: 0, expected: 1 },
      { props: 1, used: 1, expected: 0 },
      { props: 2, used: 0, expected: 2 },
      { props: 2, used: 1, expected: 1 },
      { props: 2, used: 2, expected: 0 },
      { props: 3, used: 0, expected: 3 },
      { props: 3, used: 1, expected: 2 },
      { props: 3, used: 2, expected: 1 },
      { props: 3, used: 3, expected: 0 },
      { props: 5, used: 3, expected: 2 },
    ])(
      'should report $expected unused when $props declared and $used used',
      ({ props, used, expected }: { props: number; used: number; expected: number }) => {
        const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
        const visitor = noUnusedPrivateMembersRule.create(context)

        visitor.ClassDeclaration(createClassDeclaration())

        const names = ['a', 'b', 'c', 'd', 'e']
        for (let i = 0; i < props; i++) {
          visitor.PropertyDefinition(createPrivateProperty(names[i]))
        }
        for (let i = 0; i < used; i++) {
          visitor.MemberExpression(createMemberExpressionPrivate(names[i]))
        }

        visitor['ClassDeclaration:exit']?.(undefined)

        expect(reports.length).toBe(expected)
      },
    )

    test.each([
      { methods: 1, called: 0, expected: 1 },
      { methods: 1, called: 1, expected: 0 },
      { methods: 2, called: 0, expected: 2 },
      { methods: 2, called: 1, expected: 1 },
      { methods: 2, called: 2, expected: 0 },
      { methods: 3, called: 0, expected: 3 },
      { methods: 3, called: 2, expected: 1 },
      { methods: 4, called: 1, expected: 3 },
    ])(
      'should report $expected unused methods when $methods declared and $called called',
      ({ methods, called, expected }: { methods: number; called: number; expected: number }) => {
        const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
        const visitor = noUnusedPrivateMembersRule.create(context)

        visitor.ClassDeclaration(createClassDeclaration())

        const names = ['mA', 'mB', 'mC', 'mD']
        for (let i = 0; i < methods; i++) {
          visitor.MethodDefinition(createPrivateMethod(names[i]))
        }
        for (let i = 0; i < called; i++) {
          visitor.CallExpression(createCallExpressionPrivate(names[i]))
        }

        visitor['ClassDeclaration:exit']?.(undefined)

        expect(reports.length).toBe(expected)
      },
    )

    test.each([{ count: 1 }, { count: 2 }, { count: 5 }, { count: 10 }])(
      'should report exactly $count unused private properties',
      ({ count }: { count: number }) => {
        const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
        const visitor = noUnusedPrivateMembersRule.create(context)

        visitor.ClassDeclaration(createClassDeclaration())

        for (let i = 0; i < count; i++) {
          visitor.PropertyDefinition(createPrivateProperty(`prop${i}`))
        }

        visitor['ClassDeclaration:exit']?.(undefined)

        expect(reports.length).toBe(count)
      },
    )

    test.each([{ count: 1 }, { count: 2 }, { count: 5 }, { count: 10 }])(
      'should report exactly $count unused private methods',
      ({ count }: { count: number }) => {
        const { context, reports } = createMockRuleContext({ source: 'class A { #x = 1; }' })
        const visitor = noUnusedPrivateMembersRule.create(context)

        visitor.ClassDeclaration(createClassDeclaration())

        for (let i = 0; i < count; i++) {
          visitor.MethodDefinition(createPrivateMethod(`method${i}`))
        }

        visitor['ClassDeclaration:exit']?.(undefined)

        expect(reports.length).toBe(count)
      },
    )
  })
})
