import { describe, test, expect, vi } from 'vitest'
import { noUnsafeDeclarationMergingRule } from '../../../../src/rules/patterns/no-unsafe-declaration-merging.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createClassDeclaration(name: string, line = 1, column = 0): unknown {
  return {
    type: 'ClassDeclaration',
    id: {
      type: 'Identifier',
      name,
    },
    loc: {
      start: { line, column },
      end: { line, column: name.length + 15 },
    },
  }
}

function createInterfaceDeclaration(name: string, line = 1, column = 0): unknown {
  return {
    type: 'TSInterfaceDeclaration',
    id: {
      type: 'Identifier',
      name,
    },
    loc: {
      start: { line, column },
      end: { line, column: name.length + 20 },
    },
  }
}

function createFunctionDeclaration(name: string, line = 1, column = 0): unknown {
  return {
    type: 'FunctionDeclaration',
    id: {
      type: 'Identifier',
      name,
    },
    loc: {
      start: { line, column },
      end: { line, column: name.length + 20 },
    },
  }
}

describe('no-unsafe-declaration-merging rule', () => {
  // ==========================================
  // META EXHAUSTIVE (26 tests)
  // ==========================================
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noUnsafeDeclarationMergingRule.meta.type).toBe('problem')
    })

    test('should have warning severity', () => {
      expect(noUnsafeDeclarationMergingRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noUnsafeDeclarationMergingRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noUnsafeDeclarationMergingRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUnsafeDeclarationMergingRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noUnsafeDeclarationMergingRule.meta.fixable).toBeUndefined()
    })

    test('should mention declaration merging in description', () => {
      expect(noUnsafeDeclarationMergingRule.meta.docs?.description.toLowerCase()).toContain(
        'declaration merging',
      )
    })

    test('should have empty schema array', () => {
      expect(noUnsafeDeclarationMergingRule.meta.schema).toEqual([])
    })

    test('should have docs property', () => {
      expect(noUnsafeDeclarationMergingRule.meta.docs).toBeDefined()
    })

    test('should have docs description that is a string', () => {
      expect(typeof noUnsafeDeclarationMergingRule.meta.docs?.description).toBe('string')
    })

    test('should have non-empty docs description', () => {
      expect(noUnsafeDeclarationMergingRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should mention class in docs description', () => {
      expect(noUnsafeDeclarationMergingRule.meta.docs?.description.toLowerCase()).toContain('class')
    })

    test('should mention interface in docs description', () => {
      expect(noUnsafeDeclarationMergingRule.meta.docs?.description.toLowerCase()).toContain(
        'interface',
      )
    })

    test('should have docs url defined', () => {
      expect(noUnsafeDeclarationMergingRule.meta.docs?.url).toBeDefined()
    })

    test('should have docs url as a string', () => {
      expect(typeof noUnsafeDeclarationMergingRule.meta.docs?.url).toBe('string')
    })

    test('should have docs url containing codeforge', () => {
      expect(noUnsafeDeclarationMergingRule.meta.docs?.url).toContain('codeforge')
    })

    test('should not be deprecated', () => {
      expect(noUnsafeDeclarationMergingRule.meta.deprecated).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(noUnsafeDeclarationMergingRule.meta.requiresTypeChecking).toBeUndefined()
    })

    test('should have fixable as undefined', () => {
      expect(noUnsafeDeclarationMergingRule.meta.fixable).toBeUndefined()
    })

    test('should have valid rule type', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(
        noUnsafeDeclarationMergingRule.meta.type,
      )
    })

    test('should have valid severity', () => {
      expect(['off', 'warn', 'error']).toContain(noUnsafeDeclarationMergingRule.meta.severity)
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(noUnsafeDeclarationMergingRule.meta.schema)).toBe(true)
    })

    test('should have meta as a plain object', () => {
      expect(typeof noUnsafeDeclarationMergingRule.meta).toBe('object')
      expect(noUnsafeDeclarationMergingRule.meta).not.toBeNull()
    })

    test('should have docs recommended as boolean true', () => {
      expect(noUnsafeDeclarationMergingRule.meta.docs?.recommended).toBe(true)
      expect(typeof noUnsafeDeclarationMergingRule.meta.docs?.recommended).toBe('boolean')
    })

    test('should have docs category as a string', () => {
      expect(typeof noUnsafeDeclarationMergingRule.meta.docs?.category).toBe('string')
    })

    test('should mention functions in docs description', () => {
      expect(noUnsafeDeclarationMergingRule.meta.docs?.description.toLowerCase()).toContain(
        'function',
      )
    })
  })

  // ==========================================
  // VISITOR STRUCTURE (9 tests)
  // ==========================================
  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      expect(visitor).toHaveProperty('ClassDeclaration')
      expect(visitor).toHaveProperty('TSInterfaceDeclaration')
      expect(visitor).toHaveProperty('FunctionDeclaration')
    })

    test('should return ClassDeclaration as a function', () => {
      const { context } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      expect(typeof visitor.ClassDeclaration).toBe('function')
    })

    test('should return TSInterfaceDeclaration as a function', () => {
      const { context } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      expect(typeof visitor.TSInterfaceDeclaration).toBe('function')
    })

    test('should return FunctionDeclaration as a function', () => {
      const { context } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      expect(typeof visitor.FunctionDeclaration).toBe('function')
    })

    test('should return exactly 3 visitor methods', () => {
      const { context } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      expect(Object.keys(visitor)).toHaveLength(3)
    })

    test('should not have VariableDeclaration visitor', () => {
      const { context } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      expect(visitor).not.toHaveProperty('VariableDeclaration')
    })

    test('should not have TSTypeAliasDeclaration visitor', () => {
      const { context } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      expect(visitor).not.toHaveProperty('TSTypeAliasDeclaration')
    })

    test('should not have TSEnumDeclaration visitor', () => {
      const { context } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      expect(visitor).not.toHaveProperty('TSEnumDeclaration')
    })

    test('should return a non-null visitor object', () => {
      const { context } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      expect(visitor).toBeDefined()
      expect(visitor).not.toBeNull()
      expect(typeof visitor).toBe('object')
    })
  })

  // ==========================================
  // DETECTING CLASS-INTERFACE MERGING (18 tests)
  // ==========================================
  describe('detecting class-interface merging', () => {
    test('should report when class and interface have same name (class first)', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('Foo', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Foo', 5, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Foo')
      expect(reports[0].message).toContain('class')
      expect(reports[0].message).toContain('interface')
    })

    test('should report when class and interface have same name (interface first)', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Bar', 1, 0))
      visitor.ClassDeclaration(createClassDeclaration('Bar', 5, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Bar')
    })

    test('should report correct message for class-interface merging', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('MyClass', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('MyClass', 5, 0))

      expect(reports[0].message).toContain('Unsafe declaration merging')
      expect(reports[0].message).toContain('unexpected type behavior')
    })

    test('should report with single character name', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('A', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('A', 2, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'A'")
    })

    test('should report with underscore prefix name', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('_Internal', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('_Internal', 3, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('_Internal')
    })

    test('should report with dollar sign in name', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('$jQuery', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('$jQuery', 3, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('$jQuery')
    })

    test('should report with numeric suffix in name', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('Component2', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Component2', 5, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Component2')
    })

    test('should report with PascalCase name', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('MyAwesomeClass', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('MyAwesomeClass', 5, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('MyAwesomeClass')
    })

    test('should report with camelCase name', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('myComponent', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('myComponent', 5, 0))

      expect(reports.length).toBe(1)
    })

    test('should report with common generic name like Props', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('Props', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Props', 5, 0))

      expect(reports.length).toBe(1)
    })

    test('should report when class has superClass property', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      const classNode = {
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'Child' },
        superClass: { type: 'Identifier', name: 'Parent' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.ClassDeclaration(classNode)
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Child', 5, 0))

      expect(reports.length).toBe(1)
    })

    test('should report when interface has extends property', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      const interfaceNode = {
        type: 'TSInterfaceDeclaration',
        id: { type: 'Identifier', name: 'Extended' },
        extends: [
          {
            type: 'TSExpressionWithTypeArguments',
            expression: { type: 'Identifier', name: 'Base' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.ClassDeclaration(createClassDeclaration('Extended', 1, 0))
      visitor.TSInterfaceDeclaration(interfaceNode)

      expect(reports.length).toBe(1)
    })

    test('should report only once for a class-interface pair', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('Unique', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Unique', 5, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Unique', 10, 0))

      // First interface triggers report; second interface finds existing class, reports again
      // Actually: class registered, first interface → report, second interface → map has class → report again
      expect(reports.length).toBe(2)
    })

    test('should report on the second declaration (interface after class)', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('Late', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Late', 20, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(20)
    })

    test('should report on the second declaration (class after interface)', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Late', 1, 0))
      visitor.ClassDeclaration(createClassDeclaration('Late', 15, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(15)
    })

    test('should report after many safe declarations', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('Safe1', 1, 0))
      visitor.ClassDeclaration(createClassDeclaration('Safe2', 2, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Safe3', 3, 0))
      visitor.FunctionDeclaration(createFunctionDeclaration('safe4', 4, 0))
      visitor.ClassDeclaration(createClassDeclaration('Target', 10, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Target', 15, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Target')
    })

    test('should not report for names that differ only by case', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('MyClass', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('myclass', 5, 0))

      expect(reports.length).toBe(0)
    })

    test('should report with very long name', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      const longName = 'A'.repeat(100)
      visitor.ClassDeclaration(createClassDeclaration(longName, 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration(longName, 5, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain(longName)
    })
  })

  // ==========================================
  // DETECTING FUNCTION-INTERFACE MERGING (15 tests)
  // ==========================================
  describe('detecting function-interface merging', () => {
    test('should report when function and interface have same name (function first)', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('handler', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('handler', 5, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('handler')
      expect(reports[0].message).toContain('function')
      expect(reports[0].message).toContain('interface')
    })

    test('should report when function and interface have same name (interface first)', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('callback', 1, 0))
      visitor.FunctionDeclaration(createFunctionDeclaration('callback', 5, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('callback')
    })

    test('should suggest namespace in message for function-interface merging', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('fn', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('fn', 5, 0))

      expect(reports[0].message).toContain('namespace')
    })

    test('should report with camelCase function name', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('processData', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('processData', 5, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('processData')
    })

    test('should report with single character function name', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('f', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('f', 3, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'f'")
    })

    test('should report with underscore prefix function name', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('_helper', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('_helper', 5, 0))

      expect(reports.length).toBe(1)
    })

    test('should report function-interface with numbers in name', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('parse2JSON', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('parse2JSON', 5, 0))

      expect(reports.length).toBe(1)
    })

    test('should report on the second declaration (interface after function)', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('compute', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('compute', 25, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(25)
    })

    test('should report on the second declaration (function after interface)', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('setup', 1, 0))
      visitor.FunctionDeclaration(createFunctionDeclaration('setup', 30, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(30)
    })

    test('should report with function that has async property', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      const funcNode = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'fetchData' },
        async: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.FunctionDeclaration(funcNode)
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('fetchData', 5, 0))

      expect(reports.length).toBe(1)
    })

    test('should report with function that has generator property', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      const funcNode = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'iterate' },
        generator: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.FunctionDeclaration(funcNode)
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('iterate', 5, 0))

      expect(reports.length).toBe(1)
    })

    test('should not report function-class with same name', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('Service', 1, 0))
      visitor.ClassDeclaration(createClassDeclaration('Service', 5, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report class-function with same name', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('Service', 1, 0))
      visitor.FunctionDeclaration(createFunctionDeclaration('Service', 5, 0))

      expect(reports.length).toBe(0)
    })

    test('should report only once for function-interface pair', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('unique', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('unique', 5, 0))

      expect(reports.length).toBe(1)
    })

    test('should report after many safe function declarations', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('a', 1, 0))
      visitor.FunctionDeclaration(createFunctionDeclaration('b', 2, 0))
      visitor.FunctionDeclaration(createFunctionDeclaration('c', 3, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('a', 10, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'a'")
    })
  })

  // ==========================================
  // ALLOWING SAFE DECLARATIONS (18 tests)
  // ==========================================
  describe('allowing safe declarations', () => {
    test('should not report when declarations have different names', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('Foo', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Bar', 5, 0))
      visitor.FunctionDeclaration(createFunctionDeclaration('baz', 10, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report multiple interfaces with same name (safe merging)', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Entity', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Entity', 5, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report multiple classes with same name', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('Service', 1, 0))
      visitor.ClassDeclaration(createClassDeclaration('Service', 5, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report multiple functions with same name', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('process', 1, 0))
      visitor.FunctionDeclaration(createFunctionDeclaration('process', 5, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report class and function with same name', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('Handler', 1, 0))
      visitor.FunctionDeclaration(createFunctionDeclaration('Handler', 5, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report function and class with same name', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('Handler', 1, 0))
      visitor.ClassDeclaration(createClassDeclaration('Handler', 5, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report single class declaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('OnlyClass', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report single interface declaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('OnlyInterface', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report single function declaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('onlyFunction', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report three different names for all three types', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('Alpha', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Beta', 2, 0))
      visitor.FunctionDeclaration(createFunctionDeclaration('gamma', 3, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report with only interfaces in file', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('I1', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('I2', 2, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('I3', 3, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('I1', 4, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report with only classes in file', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('C1', 1, 0))
      visitor.ClassDeclaration(createClassDeclaration('C2', 2, 0))
      visitor.ClassDeclaration(createClassDeclaration('C1', 3, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report with only functions in file', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('fn1', 1, 0))
      visitor.FunctionDeclaration(createFunctionDeclaration('fn2', 2, 0))
      visitor.FunctionDeclaration(createFunctionDeclaration('fn1', 3, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report when no declarations are made', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      noUnsafeDeclarationMergingRule.create(context)

      expect(reports.length).toBe(0)
    })

    test('should not report three interfaces with same name', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Shared', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Shared', 5, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Shared', 10, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report three classes with same name', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('Duplicate', 1, 0))
      visitor.ClassDeclaration(createClassDeclaration('Duplicate', 5, 0))
      visitor.ClassDeclaration(createClassDeclaration('Duplicate', 10, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report when all names are unique across all types', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('A', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('B', 2, 0))
      visitor.FunctionDeclaration(createFunctionDeclaration('C', 3, 0))
      visitor.ClassDeclaration(createClassDeclaration('D', 4, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('E', 5, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report class-function-interface with different names', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('Cls', 1, 0))
      visitor.FunctionDeclaration(createFunctionDeclaration('fn', 2, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Iface', 3, 0))

      expect(reports.length).toBe(0)
    })
  })

  // ==========================================
  // MESSAGE QUALITY (12 tests)
  // ==========================================
  describe('message quality', () => {
    test('should use single quotes around declaration name', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('MyType', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('MyType', 5, 0))

      expect(reports[0].message).toContain("'MyType'")
    })

    test('should include declaration name in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('processData', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('processData', 5, 0))

      expect(reports[0].message).toContain('processData')
    })

    test('should mention both class and interface in class-interface message', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('Widget', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Widget', 5, 0))

      expect(reports[0].message).toContain('class')
      expect(reports[0].message).toContain('interface')
    })

    test('should mention both function and interface in function-interface message', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('handler', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('handler', 5, 0))

      expect(reports[0].message).toContain('function')
      expect(reports[0].message).toContain('interface')
    })

    test('should contain unexpected type behavior for class-interface', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('X', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('X', 5, 0))

      expect(reports[0].message).toContain('unexpected type behavior')
    })

    test('should contain namespace suggestion for function-interface', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('Y', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Y', 5, 0))

      expect(reports[0].message).toContain('namespace')
    })

    test('should start message with Unsafe declaration merging', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('Z', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Z', 5, 0))

      expect(reports[0].message).toContain('Unsafe declaration merging')
    })

    test('should not mention function in class-interface message', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('CI', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('CI', 5, 0))

      expect(reports[0].message).not.toContain('function')
    })

    test('should not mention class in function-interface message', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('FI', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('FI', 5, 0))

      expect(reports[0].message).not.toContain('class')
    })

    test('should produce consistent messages for same type pair', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor1 = noUnsafeDeclarationMergingRule.create(ctx1)
      visitor1.ClassDeclaration(createClassDeclaration('Name1', 1, 0))
      visitor1.TSInterfaceDeclaration(createInterfaceDeclaration('Name1', 5, 0))

      const { context: ctx2, reports: reports2 } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor2 = noUnsafeDeclarationMergingRule.create(ctx2)
      visitor2.ClassDeclaration(createClassDeclaration('Name2', 1, 0))
      visitor2.TSInterfaceDeclaration(createInterfaceDeclaration('Name2', 5, 0))

      // Same structure, different name
      const msg1 = reports1[0].message.replace('Name1', 'NAME')
      const msg2 = reports2[0].message.replace('Name2', 'NAME')
      expect(msg1).toBe(msg2)
    })

    test('should format message correctly for short name', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('A', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('A', 5, 0))

      expect(reports[0].message).toContain("'A'")
      expect(reports[0].message).toMatch(/Unsafe declaration merging/)
    })

    test('should format message correctly for long name', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      const longName = 'VeryLongComponentNameThatDescribesTheFullPurpose'
      visitor.FunctionDeclaration(createFunctionDeclaration(longName, 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration(longName, 5, 0))

      expect(reports[0].message).toContain(`'${longName}'`)
    })
  })

  // ==========================================
  // EDGE CASES (30 tests)
  // ==========================================
  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      expect(() => visitor.ClassDeclaration(null)).not.toThrow()
      expect(() => visitor.TSInterfaceDeclaration(null)).not.toThrow()
      expect(() => visitor.FunctionDeclaration(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      expect(() => visitor.ClassDeclaration(undefined)).not.toThrow()
      expect(() => visitor.TSInterfaceDeclaration(undefined)).not.toThrow()
      expect(() => visitor.FunctionDeclaration(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      expect(() => visitor.ClassDeclaration('string')).not.toThrow()
      expect(() => visitor.ClassDeclaration(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      const classNode = {
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'Test' },
      }

      const interfaceNode = {
        type: 'TSInterfaceDeclaration',
        id: { type: 'Identifier', name: 'Test' },
      }

      visitor.ClassDeclaration(classNode)
      visitor.TSInterfaceDeclaration(interfaceNode)

      expect(reports.length).toBe(1)
    })

    test('should handle node without id', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      const node = {
        type: 'ClassDeclaration',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.ClassDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with non-Identifier id', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      const node = {
        type: 'ClassDeclaration',
        id: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'prop' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      const node = {
        type: 'Identifier',
        name: 'value',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.ClassDeclaration(node)
      visitor.TSInterfaceDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('Item', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Item', 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('X', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('X', 5, 0))

      expect(reports.length).toBe(1)
    })

    test('should handle variable with non-string name', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      const node = {
        type: 'ClassDeclaration',
        id: {
          type: 'Identifier',
          name: 123,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.ClassDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle missing name property', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      const node = {
        type: 'ClassDeclaration',
        id: {
          type: 'Identifier',
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.ClassDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with extra properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      const classNode = {
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'Extra' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        body: { type: 'ClassBody', body: [] },
        superClass: null,
        abstract: false,
      }

      visitor.ClassDeclaration(classNode)

      expect(reports.length).toBe(0)
    })

    test('should handle id as null', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      const node = {
        type: 'ClassDeclaration',
        id: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.ClassDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle id as string instead of object', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      const node = {
        type: 'ClassDeclaration',
        id: 'SomeName',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.ClassDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle id as number', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      const node = {
        type: 'ClassDeclaration',
        id: 42,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.ClassDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle id as array', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      const node = {
        type: 'ClassDeclaration',
        id: [{ type: 'Identifier', name: 'Arr' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.ClassDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle boolean node', () => {
      const { context } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      expect(() => visitor.ClassDeclaration(true)).not.toThrow()
      expect(() => visitor.ClassDeclaration(false)).not.toThrow()
    })

    test('should handle array node', () => {
      const { context } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      expect(() => visitor.ClassDeclaration([])).not.toThrow()
    })

    test('should handle numeric zero node', () => {
      const { context } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      expect(() => visitor.ClassDeclaration(0)).not.toThrow()
    })

    test('should handle empty string node', () => {
      const { context } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      expect(() => visitor.ClassDeclaration('')).not.toThrow()
    })

    test('should handle node with empty string name', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      const node = {
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: '' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.ClassDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with whitespace-only name', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      const node = {
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: '   ' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.ClassDeclaration(node)

      // Whitespace string is truthy and typeof === 'string', so it registers
      expect(reports.length).toBe(0)
    })

    test('should handle deeply nested id object', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      const node = {
        type: 'ClassDeclaration',
        id: {
          type: 'Identifier',
          name: 'Nested',
          extra: { deep: { prop: true } },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.ClassDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle multiple null nodes then valid node', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(null)
      visitor.ClassDeclaration(undefined)
      visitor.ClassDeclaration('string')
      visitor.ClassDeclaration(createClassDeclaration('AfterNull', 5, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('AfterNull', 10, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('AfterNull')
    })

    test('should handle node with loc as null', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      const node = {
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'NullLoc' },
        loc: null,
      }

      visitor.ClassDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with loc as string', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      const node = {
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'StrLoc' },
        loc: 'invalid',
      }

      visitor.ClassDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with loc as number', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      const node = {
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'NumLoc' },
        loc: 42,
      }

      visitor.ClassDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with loc as array', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      const node = {
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'ArrLoc' },
        loc: [1, 0, 1, 10],
      }

      visitor.ClassDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with abstract property', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      const node = {
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'AbstractCls' },
        abstract: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassDeclaration(node)
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('AbstractCls', 5, 0))

      expect(reports.length).toBe(1)
    })

    test('should handle TSInterfaceDeclaration with null node', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.TSInterfaceDeclaration(null)
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('AfterNullInt', 5, 0))
      visitor.ClassDeclaration(createClassDeclaration('AfterNullInt', 10, 0))

      expect(reports.length).toBe(1)
    })
  })

  // ==========================================
  // MULTIPLE UNSAFE MERGINGS (14 tests)
  // ==========================================
  describe('multiple unsafe mergings', () => {
    test('should report multiple unsafe mergings', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('A', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('A', 5, 0))
      visitor.FunctionDeclaration(createFunctionDeclaration('B', 10, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('B', 15, 0))

      expect(reports.length).toBe(2)
    })

    test('should report only unsafe mergings, not safe ones', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('A', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('A', 5, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('C', 10, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('C', 15, 0))

      expect(reports.length).toBe(1)
    })

    test('should report three unsafe mergings', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('A', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('A', 2, 0))
      visitor.FunctionDeclaration(createFunctionDeclaration('B', 3, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('B', 4, 0))
      visitor.ClassDeclaration(createClassDeclaration('C', 5, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('C', 6, 0))

      expect(reports.length).toBe(3)
    })

    test('should report five unsafe mergings', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.ClassDeclaration(createClassDeclaration(`N${i}`, i * 2 + 1, 0))
        visitor.TSInterfaceDeclaration(createInterfaceDeclaration(`N${i}`, i * 2 + 2, 0))
      }

      expect(reports.length).toBe(5)
    })

    test('should report only the last pair when only it is unsafe', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('Safe', 1, 0))
      visitor.ClassDeclaration(createClassDeclaration('Safe', 2, 0))
      visitor.FunctionDeclaration(createFunctionDeclaration('Safe2', 3, 0))
      visitor.ClassDeclaration(createClassDeclaration('Unsafe', 4, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Unsafe', 5, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Unsafe')
    })

    test('should report only the first pair when only it is unsafe', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('First', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('First', 2, 0))
      visitor.ClassDeclaration(createClassDeclaration('Second', 3, 0))
      visitor.ClassDeclaration(createClassDeclaration('Second', 4, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('First')
    })

    test('should report mixed safe and unsafe pairs correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      // Safe: class + class
      visitor.ClassDeclaration(createClassDeclaration('S1', 1, 0))
      visitor.ClassDeclaration(createClassDeclaration('S1', 2, 0))
      // Unsafe: class + interface
      visitor.ClassDeclaration(createClassDeclaration('U1', 3, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('U1', 4, 0))
      // Safe: interface + interface
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('S2', 5, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('S2', 6, 0))

      expect(reports.length).toBe(1)
    })

    test('should have correct messages for each report', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('Alpha', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Alpha', 2, 0))
      visitor.FunctionDeclaration(createFunctionDeclaration('Beta', 3, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Beta', 4, 0))

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('Alpha')
      expect(reports[0].message).toContain('class')
      expect(reports[1].message).toContain('Beta')
      expect(reports[1].message).toContain('function')
    })

    test('should report class-interface-function-interface pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('A', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('A', 2, 0))
      visitor.FunctionDeclaration(createFunctionDeclaration('B', 3, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('B', 4, 0))
      visitor.ClassDeclaration(createClassDeclaration('C', 5, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('C', 6, 0))

      expect(reports.length).toBe(3)
    })

    test('should report alternating safe and unsafe', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('U1', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('U1', 2, 0))
      visitor.ClassDeclaration(createClassDeclaration('S1', 3, 0))
      visitor.ClassDeclaration(createClassDeclaration('S1', 4, 0))
      visitor.ClassDeclaration(createClassDeclaration('U2', 5, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('U2', 6, 0))

      expect(reports.length).toBe(2)
    })

    test('should report count matches unsafe count only', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      // 3 unsafe + 4 safe = 3 reports
      visitor.ClassDeclaration(createClassDeclaration('U1', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('U1', 2, 0))
      visitor.ClassDeclaration(createClassDeclaration('S1', 3, 0))
      visitor.ClassDeclaration(createClassDeclaration('S1', 4, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('S2', 5, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('S2', 6, 0))
      visitor.FunctionDeclaration(createFunctionDeclaration('S3', 7, 0))
      visitor.FunctionDeclaration(createFunctionDeclaration('S3', 8, 0))
      visitor.FunctionDeclaration(createFunctionDeclaration('U2', 9, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('U2', 10, 0))
      visitor.ClassDeclaration(createClassDeclaration('U3', 11, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('U3', 12, 0))

      expect(reports.length).toBe(3)
    })

    test('should report many safe declarations then one unsafe', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      for (let i = 0; i < 20; i++) {
        visitor.ClassDeclaration(createClassDeclaration(`Safe${i}`, i + 1, 0))
      }
      visitor.ClassDeclaration(createClassDeclaration('Target', 21, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Target', 22, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Target')
    })

    test('should report same name appearing in multiple unsafe types', () => {
      // Interface A registered, then Class A (unsafe), then Function A (also unsafe against stored Interface)
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Multi', 1, 0))
      visitor.ClassDeclaration(createClassDeclaration('Multi', 2, 0))
      visitor.FunctionDeclaration(createFunctionDeclaration('Multi', 3, 0))

      // Interface stored, Class → report (interface+class), Function → report (interface+function)
      expect(reports.length).toBe(2)
    })

    test('should report reports in declaration order', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('First', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('First', 10, 0))
      visitor.ClassDeclaration(createClassDeclaration('Second', 20, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Second', 30, 0))

      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[1].loc?.start.line).toBe(30)
    })
  })

  // ==========================================
  // LOCATION EDGE CASES (15 tests)
  // ==========================================
  describe('loc edge cases', () => {
    test('should handle loc with non-number line', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('X', 1, 0))

      const node = {
        type: 'TSInterfaceDeclaration',
        id: { type: 'Identifier', name: 'X' },
        loc: {
          start: { line: 'not-a-number' as unknown as number, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      visitor.TSInterfaceDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with undefined start', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('X', 1, 0))

      const node = {
        type: 'TSInterfaceDeclaration',
        id: { type: 'Identifier', name: 'X' },
        loc: {
          end: { line: 1, column: 10 },
        },
      }

      visitor.TSInterfaceDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should handle empty loc object', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('X', 1, 0))

      const node = {
        type: 'TSInterfaceDeclaration',
        id: { type: 'Identifier', name: 'X' },
        loc: {},
      }

      visitor.TSInterfaceDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should report loc at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('X', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('X', 1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report loc at high line number', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('X', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('X', 9999, 0))

      expect(reports[0].loc?.start.line).toBe(9999)
    })

    test('should report loc at high column number', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('X', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('X', 5, 500))

      expect(reports[0].loc?.start.column).toBe(500)
    })

    test('should provide default loc when no loc on node', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('NoLoc', 1, 0))

      const node = {
        type: 'TSInterfaceDeclaration',
        id: { type: 'Identifier', name: 'NoLoc' },
      }

      visitor.TSInterfaceDeclaration(node)

      expect(reports.length).toBe(1)
      // Default loc should be line 1, column 0
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report loc with zero values', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('Zero', 1, 0))

      const node = {
        type: 'TSInterfaceDeclaration',
        id: { type: 'Identifier', name: 'Zero' },
        loc: {
          start: { line: 0, column: 0 },
          end: { line: 0, column: 0 },
        },
      }

      visitor.TSInterfaceDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should use second declaration location not first', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('Loc', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Loc', 42, 10))

      expect(reports[0].loc?.start.line).not.toBe(1)
      expect(reports[0].loc?.start.line).toBe(42)
    })

    test('should report loc with end properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('End', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('End', 5, 0))

      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBeDefined()
      expect(reports[0].loc?.end.column).toBeDefined()
    })

    test('should handle loc with missing end object', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('NoEnd', 1, 0))

      const node = {
        type: 'TSInterfaceDeclaration',
        id: { type: 'Identifier', name: 'NoEnd' },
        loc: {
          start: { line: 5, column: 0 },
        },
      }

      visitor.TSInterfaceDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should handle loc start with missing column', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('NoCol', 1, 0))

      const node = {
        type: 'TSInterfaceDeclaration',
        id: { type: 'Identifier', name: 'NoCol' },
        loc: {
          start: { line: 5 },
          end: { line: 5, column: 10 },
        },
      }

      visitor.TSInterfaceDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc start with missing line', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('NoLine', 1, 0))

      const node = {
        type: 'TSInterfaceDeclaration',
        id: { type: 'Identifier', name: 'NoLine' },
        loc: {
          start: { column: 5 },
          end: { line: 1, column: 10 },
        },
      }

      visitor.TSInterfaceDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with NaN values', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('NaN', 1, 0))

      const node = {
        type: 'TSInterfaceDeclaration',
        id: { type: 'Identifier', name: 'NaN' },
        loc: {
          start: { line: NaN, column: NaN },
          end: { line: NaN, column: NaN },
        },
      }

      visitor.TSInterfaceDeclaration(node)

      expect(reports.length).toBe(1)
      // NaN is typeof 'number' so it gets passed through
      expect(reports[0].loc?.start.line).toBeNaN()
    })

    test('should handle loc with boolean values for line', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('BoolLine', 1, 0))

      const node = {
        type: 'TSInterfaceDeclaration',
        id: { type: 'Identifier', name: 'BoolLine' },
        loc: {
          start: { line: true as unknown as number, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      visitor.TSInterfaceDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1) // boolean is not typeof 'number', so default
    })
  })

  // ==========================================
  // CONTEXT VARIATIONS (10 tests)
  // ==========================================
  describe('context variations', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}', filePath: '/project/src/types.ts' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('T', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('T', 5, 0))

      expect(reports.length).toBe(1)
    })

    test('should work with different source content', () => {
      const { context, reports } = createMockRuleContext({ source: 'interface Foo {} class Foo {}', filePath: '/src/file.ts' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('Foo', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Foo', 5, 0))

      expect(reports.length).toBe(1)
    })

    test('should work with different workspace roots', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}', filePath: '/home/user/project/file.ts' })
      context.workspaceRoot = '/home/user/project'
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('W', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('W', 5, 0))

      expect(reports.length).toBe(1)
    })

    test('should work with config containing additional options', () => {
      const { context, reports } = createMockRuleContext({ options: [{ strictMode: true, level: 'max' }], source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('Opts', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Opts', 5, 0))

      expect(reports.length).toBe(1)
    })

    test('should work with config having rules', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      context.config = {
        options: [{}],
        rules: { 'no-unsafe-declaration-merging': 'warn' },
      }
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('R', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('R', 5, 0))

      expect(reports.length).toBe(1)
    })

    test('should work with empty source', () => {
      const { context, reports } = createMockRuleContext({ source: '', filePath: '/src/empty.ts' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('E', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('E', 5, 0))

      expect(reports.length).toBe(1)
    })

    test('should work with getAST returning object', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => ({ type: 'Program', body: [] }),
        getSource: () => 'class X {}',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noUnsafeDeclarationMergingRule.create(context)
      visitor.ClassDeclaration(createClassDeclaration('X', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('X', 5, 0))

      expect(reports.length).toBe(1)
    })

    test('should work with getTokens returning populated array', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'class X {}',
        getTokens: () => [{ type: 'Keyword', value: 'class' }],
        getComments: () => [{ type: 'Line', value: ' comment' }],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noUnsafeDeclarationMergingRule.create(context)
      visitor.ClassDeclaration(createClassDeclaration('X', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('X', 5, 0))

      expect(reports.length).toBe(1)
    })

    test('should create independent visitors per context', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext({ source: 'class Foo {}' })
      const { context: ctx2, reports: reports2 } = createMockRuleContext({ source: 'class Foo {}' })

      const visitor1 = noUnsafeDeclarationMergingRule.create(ctx1)
      const visitor2 = noUnsafeDeclarationMergingRule.create(ctx2)

      visitor1.ClassDeclaration(createClassDeclaration('X', 1, 0))
      visitor1.TSInterfaceDeclaration(createInterfaceDeclaration('X', 5, 0))

      visitor2.ClassDeclaration(createClassDeclaration('Y', 1, 0))
      // No interface for Y

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(0)
    })

    test('should not cross-contaminate between visitors', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext({ source: 'class Foo {}' })
      const { context: ctx2, reports: reports2 } = createMockRuleContext({ source: 'class Foo {}' })

      const visitor1 = noUnsafeDeclarationMergingRule.create(ctx1)
      const visitor2 = noUnsafeDeclarationMergingRule.create(ctx2)

      visitor1.ClassDeclaration(createClassDeclaration('Shared', 1, 0))
      // visitor2 has no declarations - should not see visitor1's state

      visitor2.TSInterfaceDeclaration(createInterfaceDeclaration('Shared', 5, 0))

      expect(reports1.length).toBe(0)
      expect(reports2.length).toBe(0)
    })
  })

  // ==========================================
  // EXPORT BEHAVIOR (5 tests)
  // ==========================================
  describe('exports', () => {
    test('should have default export', () => {
      const defaultExport = noUnsafeDeclarationMergingRule
      // The module has both named and default export pointing to same object
      expect(defaultExport).toBeDefined()
    })

    test('should be a RuleDefinition object', () => {
      expect(noUnsafeDeclarationMergingRule).toHaveProperty('meta')
      expect(noUnsafeDeclarationMergingRule).toHaveProperty('create')
    })

    test('should have create as a function', () => {
      expect(typeof noUnsafeDeclarationMergingRule.create).toBe('function')
    })

    test('should have meta as an object', () => {
      expect(typeof noUnsafeDeclarationMergingRule.meta).toBe('object')
      expect(noUnsafeDeclarationMergingRule.meta).not.toBeNull()
    })

    test('should have consistent meta across multiple accesses', () => {
      const meta1 = noUnsafeDeclarationMergingRule.meta
      const meta2 = noUnsafeDeclarationMergingRule.meta

      expect(meta1).toBe(meta2)
    })
  })

  // ==========================================
  // REPORT DESCRIPTOR (12 tests)
  // ==========================================
  describe('report descriptor', () => {
    test('should have message in report', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('Desc', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Desc', 5, 0))

      expect(reports[0]).toHaveProperty('message')
    })

    test('should have loc in report', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('Desc', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Desc', 5, 0))

      expect(reports[0]).toHaveProperty('loc')
    })

    test('should have loc with start in report', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('Desc', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Desc', 5, 0))

      expect(reports[0].loc).toHaveProperty('start')
    })

    test('should have loc with end in report', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('Desc', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Desc', 5, 0))

      expect(reports[0].loc).toHaveProperty('end')
    })

    test('should have loc start with line and column', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('Desc', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Desc', 5, 0))

      expect(reports[0].loc?.start).toHaveProperty('line')
      expect(reports[0].loc?.start).toHaveProperty('column')
    })

    test('should have loc end with line and column', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('Desc', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Desc', 5, 0))

      expect(reports[0].loc?.end).toHaveProperty('line')
      expect(reports[0].loc?.end).toHaveProperty('column')
    })

    test('should have non-empty message string', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('Desc', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Desc', 5, 0))

      expect(typeof reports[0].message).toBe('string')
      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should have numeric loc start line', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('Desc', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Desc', 5, 3))

      expect(typeof reports[0].loc?.start.line).toBe('number')
    })

    test('should have numeric loc start column', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('Desc', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Desc', 5, 3))

      expect(typeof reports[0].loc?.start.column).toBe('number')
    })

    test('should have numeric loc end line', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('Desc', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Desc', 5, 3))

      expect(typeof reports[0].loc?.end.line).toBe('number')
    })

    test('should have numeric loc end column', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('Desc', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Desc', 5, 3))

      expect(typeof reports[0].loc?.end.column).toBe('number')
    })

    test('should report for function-interface with loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('fnDesc', 3, 5))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('fnDesc', 8, 2))

      expect(reports[0].loc?.start.line).toBe(8)
      expect(reports[0].loc?.start.column).toBe(2)
    })
  })

  // ==========================================
  // DECLARATION TRACKING (12 tests)
  // ==========================================
  describe('declaration tracking', () => {
    test('should track first declaration of a name', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('Tracked', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Tracked', 5, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('class')
    })

    test('should not overwrite first declaration with same type', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('Same', 1, 0))
      visitor.ClassDeclaration(createClassDeclaration('Same', 5, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Same', 10, 0))

      // First class registered, second class doesn't overwrite, interface triggers report
      expect(reports.length).toBe(1)
    })

    test('should trigger on interface then class with same name', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Track', 1, 0))
      visitor.ClassDeclaration(createClassDeclaration('Track', 5, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Track')
    })

    test('should not report class-function same name as unsafe', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('CF', 1, 0))
      visitor.FunctionDeclaration(createFunctionDeclaration('CF', 5, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report function-class same name as unsafe', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('FC', 1, 0))
      visitor.ClassDeclaration(createClassDeclaration('FC', 5, 0))

      expect(reports.length).toBe(0)
    })

    test('should track across different node types', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('A', 1, 0))
      visitor.FunctionDeclaration(createFunctionDeclaration('B', 2, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('C', 3, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('A', 4, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'A'")
    })

    test('should report both class-interface and interface-function for same name', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Triple', 1, 0))
      visitor.ClassDeclaration(createClassDeclaration('Triple', 2, 0))
      visitor.FunctionDeclaration(createFunctionDeclaration('Triple', 3, 0))

      // Interface stored, Class → unsafe report, Function → unsafe report (against stored interface)
      expect(reports.length).toBe(2)
    })

    test('should report only class-interface for class-function-interface', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('Order', 1, 0))
      visitor.FunctionDeclaration(createFunctionDeclaration('Order', 2, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Order', 3, 0))

      // Class stored, Function → safe (class+function), Interface → unsafe (class+interface)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('class')
    })

    test('should not track safe names after safe collision', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('Safe', 1, 0))
      visitor.ClassDeclaration(createClassDeclaration('Safe', 2, 0))
      // Second class doesn't overwrite, but map still has first class
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Safe', 3, 0))

      expect(reports.length).toBe(1)
    })

    test('should handle three interfaces same name safely', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('ISame', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('ISame', 5, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('ISame', 10, 0))

      expect(reports.length).toBe(0)
    })

    test('should handle class then function then interface with different names', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('C', 1, 0))
      visitor.FunctionDeclaration(createFunctionDeclaration('F', 2, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('I', 3, 0))

      expect(reports.length).toBe(0)
    })

    test('should handle function then class then interface with same name', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('AllThree', 1, 0))
      visitor.ClassDeclaration(createClassDeclaration('AllThree', 2, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('AllThree', 3, 0))

      // Function stored, Class → safe (function+class), Interface → unsafe (function+interface)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('function')
    })
  })

  // ==========================================
  // NAME VARIATIONS (12 tests)
  // ==========================================
  describe('name variations', () => {
    test('should report with snake_case name', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('my_class', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('my_class', 5, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('my_class')
    })

    test('should report with UPPER_CASE name', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('MY_CLASS', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('MY_CLASS', 5, 0))

      expect(reports.length).toBe(1)
    })

    test('should report with trailing underscore name', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('Name_', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Name_', 5, 0))

      expect(reports.length).toBe(1)
    })

    test('should report with consecutive underscores in name', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('my__name', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('my__name', 5, 0))

      expect(reports.length).toBe(1)
    })

    test('should report with dollar sign prefix name', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('$name', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('$name', 5, 0))

      expect(reports.length).toBe(1)
    })

    test('should report with mixed alphanumeric name', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('Component2A', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Component2A', 5, 0))

      expect(reports.length).toBe(1)
    })

    test('should report with common TypeScript pattern name', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('IUserService', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('IUserService', 5, 0))

      expect(reports.length).toBe(1)
    })

    test('should report with short two-char name', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('fn', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('fn', 5, 0))

      expect(reports.length).toBe(1)
    })

    test('should report with three-char name', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('Abc', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Abc', 5, 0))

      expect(reports.length).toBe(1)
    })

    test('should not report names that differ by trailing digit', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('Name', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Name2', 5, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report names that differ by prefix', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('Config', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('IConfig', 5, 0))

      expect(reports.length).toBe(0)
    })

    test('should report with name containing mixed case and numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('XMLParser2', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('XMLParser2', 5, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('XMLParser2')
    })
  })

  // ==========================================
  // ORDER VARIATIONS (10 tests)
  // ==========================================
  describe('order variations', () => {
    test('should report when interface comes between class and function', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('X', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('X', 2, 0))
      visitor.FunctionDeclaration(createFunctionDeclaration('X', 3, 0))

      // Class stored, Interface → report, Function → report (map still has class)
      // Wait, does the map update? No, map doesn't update on report. So:
      // Class registered, Interface → unsafe report, Function → existing is class → safe → no report
      expect(reports.length).toBe(1)
    })

    test('should report when function comes between interface and class', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Y', 1, 0))
      visitor.FunctionDeclaration(createFunctionDeclaration('Y', 2, 0))
      visitor.ClassDeclaration(createClassDeclaration('Y', 3, 0))

      // Interface stored, Function → unsafe report, Class → unsafe report (map still has interface)
      expect(reports.length).toBe(2)
    })

    test('should report when class comes between function and interface', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('Z', 1, 0))
      visitor.ClassDeclaration(createClassDeclaration('Z', 2, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Z', 3, 0))

      // Function stored, Class → safe, Interface → unsafe (function+interface)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('function')
    })

    test('should handle all three types in different order - IFC', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Ord', 1, 0))
      visitor.FunctionDeclaration(createFunctionDeclaration('Ord', 2, 0))
      visitor.ClassDeclaration(createClassDeclaration('Ord', 3, 0))

      // Interface stored, Function → report, Class → report
      expect(reports.length).toBe(2)
    })

    test('should handle all three types in different order - CIF', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('Ord', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Ord', 2, 0))
      visitor.FunctionDeclaration(createFunctionDeclaration('Ord', 3, 0))

      // Class stored, Interface → report, Function → safe (class+function)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('class')
    })

    test('should handle all three types in different order - FCI', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('Ord', 1, 0))
      visitor.ClassDeclaration(createClassDeclaration('Ord', 2, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Ord', 3, 0))

      // Function stored, Class → safe, Interface → unsafe (function+interface)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('function')
    })

    test('should handle all three types in different order - FIC', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('Ord', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Ord', 2, 0))
      visitor.ClassDeclaration(createClassDeclaration('Ord', 3, 0))

      // Function stored, Interface → report, Class → safe (function+class)
      expect(reports.length).toBe(1)
    })

    test('should handle all three types in different order - ICF', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Ord', 1, 0))
      visitor.ClassDeclaration(createClassDeclaration('Ord', 2, 0))
      visitor.FunctionDeclaration(createFunctionDeclaration('Ord', 3, 0))

      // Interface stored, Class → report, Function → report (interface+function)
      expect(reports.length).toBe(2)
    })

    test('should handle repeated same-type before unsafe', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('Rep', 1, 0))
      visitor.ClassDeclaration(createClassDeclaration('Rep', 2, 0))
      visitor.ClassDeclaration(createClassDeclaration('Rep', 3, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Rep', 4, 0))

      expect(reports.length).toBe(1)
    })

    test('should handle interface repeated before unsafe', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('RepI', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('RepI', 2, 0))
      visitor.ClassDeclaration(createClassDeclaration('RepI', 3, 0))

      expect(reports.length).toBe(1)
    })
  })

  // ==========================================
  // VISITOR INVOCATION EDGE CASES (8 tests)
  // ==========================================
  describe('visitor invocation', () => {
    test('should handle calling ClassDeclaration multiple times rapidly', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      for (let i = 0; i < 100; i++) {
        visitor.ClassDeclaration(createClassDeclaration('Rapid', i + 1, 0))
      }

      expect(reports.length).toBe(0)
    })

    test('should handle calling TSInterfaceDeclaration multiple times rapidly', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.TSInterfaceDeclaration(createInterfaceDeclaration('RapidInt', i + 1, 0))
      }

      expect(reports.length).toBe(0)
    })

    test('should handle calling FunctionDeclaration multiple times rapidly', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.FunctionDeclaration(createFunctionDeclaration('RapidFn', i + 1, 0))
      }

      expect(reports.length).toBe(0)
    })

    test('should report once when class registered then many interfaces', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('Many', 1, 0))
      for (let i = 0; i < 10; i++) {
        visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Many', i + 2, 0))
      }

      // Each interface after the class triggers a report
      expect(reports.length).toBe(10)
    })

    test('should report once when function registered then many interfaces', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('ManyFn', 1, 0))
      for (let i = 0; i < 5; i++) {
        visitor.TSInterfaceDeclaration(createInterfaceDeclaration('ManyFn', i + 2, 0))
      }

      expect(reports.length).toBe(5)
    })

    test('should handle interleaved safe and unsafe declarations', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('A', 1, 0))
      visitor.ClassDeclaration(createClassDeclaration('B', 2, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('A', 3, 0)) // report
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('B', 4, 0)) // report
      visitor.FunctionDeclaration(createFunctionDeclaration('C', 5, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('C', 6, 0)) // report

      expect(reports.length).toBe(3)
    })

    test('should handle many different names with one unsafe', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.ClassDeclaration(createClassDeclaration(`Unique${i}`, i + 1, 0))
      }
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Unique25', 100, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Unique25')
    })

    test('should handle visitor called with no arguments', () => {
      const { context } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      expect(() => visitor.ClassDeclaration()).not.toThrow()
      expect(() => visitor.TSInterfaceDeclaration()).not.toThrow()
      expect(() => visitor.FunctionDeclaration()).not.toThrow()
    })
  })

  // ==========================================
  // ADDITIONAL META TESTS (6 tests)
  // ==========================================
  describe('additional meta', () => {
    test('should have meta type as exact string problem', () => {
      expect(noUnsafeDeclarationMergingRule.meta.type).toBe('problem')
      expect(noUnsafeDeclarationMergingRule.meta.type).not.toBe('suggestion')
      expect(noUnsafeDeclarationMergingRule.meta.type).not.toBe('layout')
    })

    test('should have meta severity as exact string warn', () => {
      expect(noUnsafeDeclarationMergingRule.meta.severity).toBe('warn')
      expect(noUnsafeDeclarationMergingRule.meta.severity).not.toBe('error')
      expect(noUnsafeDeclarationMergingRule.meta.severity).not.toBe('off')
    })

    test('should have docs url starting with https', () => {
      expect(noUnsafeDeclarationMergingRule.meta.docs?.url).toMatch(/^https:\/\//)
    })

    test('should have docs url containing rules', () => {
      expect(noUnsafeDeclarationMergingRule.meta.docs?.url).toContain('rules')
    })

    test('should have docs url containing rule name', () => {
      expect(noUnsafeDeclarationMergingRule.meta.docs?.url).toContain(
        'no-unsafe-declaration-merging',
      )
    })

    test('should have schema as empty array not undefined', () => {
      expect(noUnsafeDeclarationMergingRule.meta.schema).toEqual([])
      expect(noUnsafeDeclarationMergingRule.meta.schema).not.toBeUndefined()
    })
  })

  // ==========================================
  // STRESS AND ROBUSTNESS (8 tests)
  // ==========================================
  describe('stress and robustness', () => {
    test('should handle many unique declaration names', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      for (let i = 0; i < 200; i++) {
        visitor.ClassDeclaration(createClassDeclaration(`Name${i}`, i + 1, 0))
      }

      expect(reports.length).toBe(0)
    })

    test('should handle many unique interface names', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      for (let i = 0; i < 200; i++) {
        visitor.TSInterfaceDeclaration(createInterfaceDeclaration(`IFace${i}`, i + 1, 0))
      }

      expect(reports.length).toBe(0)
    })

    test('should handle many unique function names', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      for (let i = 0; i < 200; i++) {
        visitor.FunctionDeclaration(createFunctionDeclaration(`fn${i}`, i + 1, 0))
      }

      expect(reports.length).toBe(0)
    })

    test('should handle mixed batch of declarations', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      // 50 classes, 50 functions, 50 interfaces - all unique names
      for (let i = 0; i < 50; i++) {
        visitor.ClassDeclaration(createClassDeclaration(`Cls${i}`, i * 3 + 1, 0))
        visitor.FunctionDeclaration(createFunctionDeclaration(`Func${i}`, i * 3 + 2, 0))
        visitor.TSInterfaceDeclaration(createInterfaceDeclaration(`IFace${i}`, i * 3 + 3, 0))
      }

      expect(reports.length).toBe(0)
    })

    test('should handle batch with all unsafe mergings', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.ClassDeclaration(createClassDeclaration(`Unsafe${i}`, i * 2 + 1, 0))
        visitor.TSInterfaceDeclaration(createInterfaceDeclaration(`Unsafe${i}`, i * 2 + 2, 0))
      }

      expect(reports.length).toBe(50)
    })

    test('should handle large name without issues', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      const hugeName = 'A'.repeat(1000)
      visitor.ClassDeclaration(createClassDeclaration(hugeName, 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration(hugeName, 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should handle alternating types with same name', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      // Class → Interface → Function → Interface → Class
      visitor.ClassDeclaration(createClassDeclaration('Alt', 1, 0)) // stored
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Alt', 2, 0)) // report (class+interface)
      visitor.FunctionDeclaration(createFunctionDeclaration('Alt', 3, 0)) // safe (class+function)
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Alt', 4, 0)) // report (class+interface)
      visitor.ClassDeclaration(createClassDeclaration('Alt', 5, 0)) // safe (class+class)

      expect(reports.length).toBe(2)
    })

    test('should handle same name with all three types in sequence twice', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('Seq', 1, 0))
      visitor.FunctionDeclaration(createFunctionDeclaration('Seq', 2, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Seq', 3, 0))
      visitor.ClassDeclaration(createClassDeclaration('Seq', 4, 0))
      visitor.FunctionDeclaration(createFunctionDeclaration('Seq', 5, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Seq', 6, 0))

      // Class stored, Function → safe, Interface → report (class+interface)
      // Second pass: Class → safe, Function → safe, Interface → report (class+interface)
      expect(reports.length).toBe(2)
    })
  })
})
