import { describe, test, expect, vi } from 'vitest'
import { noShadowRestrictedNamesRule } from '../../../../src/rules/patterns/no-shadow-restricted-names.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createVariableDeclarator(idName: string, line = 1, column = 0): unknown {
  return {
    type: 'VariableDeclarator',
    id: {
      type: 'Identifier',
      name: idName,
    },
    init: null,
    loc: {
      start: { line, column },
      end: { line, column: idName.length + 2 },
    },
  }
}

function createFunctionDeclaration(idName: string | null, line = 1, column = 0): unknown {
  return {
    type: 'FunctionDeclaration',
    id: idName
      ? {
          type: 'Identifier',
          name: idName,
        }
      : null,
    params: [],
    body: {
      type: 'BlockStatement',
      body: [],
    },
    loc: {
      start: { line, column },
      end: { line, column: idName ? idName.length + 10 : 10 },
    },
  }
}

describe('no-shadow-restricted-names rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noShadowRestrictedNamesRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noShadowRestrictedNamesRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noShadowRestrictedNamesRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noShadowRestrictedNamesRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention shadowing in description', () => {
      expect(noShadowRestrictedNamesRule.meta.docs?.description.toLowerCase()).toContain(
        'shadowing',
      )
    })

    test('should have a meta property', () => {
      expect(noShadowRestrictedNamesRule).toHaveProperty('meta')
    })

    test('meta should be an object', () => {
      expect(typeof noShadowRestrictedNamesRule.meta).toBe('object')
    })

    test('meta type should be a string', () => {
      expect(typeof noShadowRestrictedNamesRule.meta.type).toBe('string')
    })

    test('meta severity should be a string', () => {
      expect(typeof noShadowRestrictedNamesRule.meta.severity).toBe('string')
    })

    test('meta should have docs property', () => {
      expect(noShadowRestrictedNamesRule.meta).toHaveProperty('docs')
    })

    test('meta docs should have description', () => {
      expect(noShadowRestrictedNamesRule.meta.docs).toHaveProperty('description')
    })

    test('meta docs description should be a non-empty string', () => {
      expect(typeof noShadowRestrictedNamesRule.meta.docs?.description).toBe('string')
      expect(noShadowRestrictedNamesRule.meta.docs!.description.length).toBeGreaterThan(0)
    })

    test('meta docs should have category', () => {
      expect(noShadowRestrictedNamesRule.meta.docs).toHaveProperty('category')
    })

    test('meta docs category should be a string', () => {
      expect(typeof noShadowRestrictedNamesRule.meta.docs?.category).toBe('string')
    })

    test('meta docs recommended should be a boolean', () => {
      expect(typeof noShadowRestrictedNamesRule.meta.docs?.recommended).toBe('boolean')
    })

    test('meta should have schema property', () => {
      expect(noShadowRestrictedNamesRule.meta).toHaveProperty('schema')
    })

    test('meta schema should be an empty array', () => {
      expect(noShadowRestrictedNamesRule.meta.schema).toEqual([])
    })

    test('meta fixable should be undefined', () => {
      expect(noShadowRestrictedNamesRule.meta.fixable).toBeUndefined()
    })

    test('meta should not be deprecated', () => {
      expect(noShadowRestrictedNamesRule.meta.deprecated).toBeFalsy()
    })

    test('rule should export a create function', () => {
      expect(noShadowRestrictedNamesRule).toHaveProperty('create')
    })

    test('meta docs description should mention restricted names', () => {
      const desc = noShadowRestrictedNamesRule.meta.docs?.description.toLowerCase()
      expect(desc).toContain('restricted')
    })

    test('meta docs description should mention identifiers', () => {
      const desc = noShadowRestrictedNamesRule.meta.docs?.description.toLowerCase()
      expect(desc).toContain('identifiers')
    })
  })

  describe('create', () => {
    test('should return visitor with VariableDeclarator method', () => {
      const { context } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      expect(visitor).toHaveProperty('VariableDeclarator')
    })

    test('should return visitor with FunctionDeclaration method', () => {
      const { context } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      expect(visitor).toHaveProperty('FunctionDeclaration')
    })

    test('VariableDeclarator should be a function', () => {
      const { context } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      expect(typeof visitor.VariableDeclarator).toBe('function')
    })

    test('FunctionDeclaration should be a function', () => {
      const { context } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      expect(typeof visitor.FunctionDeclaration).toBe('function')
    })

    test('create should return an object', () => {
      const { context } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      expect(typeof visitor).toBe('object')
    })

    test('create should return a non-null object', () => {
      const { context } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      expect(visitor).not.toBeNull()
    })

    test('visitor should have exactly 2 methods', () => {
      const { context } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      expect(Object.keys(visitor)).toHaveLength(2)
    })

    test('visitor keys should be VariableDeclarator and FunctionDeclaration', () => {
      const { context } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      expect(Object.keys(visitor)).toEqual(['FunctionDeclaration', 'VariableDeclarator'])
    })
  })

  describe('detection - VariableDeclarator', () => {
    test('should report variable declaration with "undefined"', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('undefined'))
      expect(reports.length).toBe(1)
    })

    test('should report variable declaration with "NaN"', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('NaN'))
      expect(reports.length).toBe(1)
    })

    test('should report variable declaration with "Infinity"', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('Infinity'))
      expect(reports.length).toBe(1)
    })

    test('should report variable declaration with "eval"', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('eval'))
      expect(reports.length).toBe(1)
    })

    test('should report variable declaration with "arguments"', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('arguments'))
      expect(reports.length).toBe(1)
    })

    test('should report undefined in VariableDeclarator with exact message', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('undefined'))
      expect(reports[0].message).toBe("Shadowing of global property 'undefined'.")
    })

    test('should report NaN in VariableDeclarator with exact message', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('NaN'))
      expect(reports[0].message).toBe("Shadowing of global property 'NaN'.")
    })

    test('should report Infinity in VariableDeclarator with exact message', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('Infinity'))
      expect(reports[0].message).toBe("Shadowing of global property 'Infinity'.")
    })

    test('should report eval in VariableDeclarator with exact message', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('eval'))
      expect(reports[0].message).toBe("Shadowing of global property 'eval'.")
    })

    test('should report arguments in VariableDeclarator with exact message', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('arguments'))
      expect(reports[0].message).toBe("Shadowing of global property 'arguments'.")
    })
  })

  describe('detection - FunctionDeclaration', () => {
    test('should report function declaration with "undefined"', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('undefined'))
      expect(reports.length).toBe(1)
    })

    test('should report function declaration with "NaN"', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('NaN'))
      expect(reports.length).toBe(1)
    })

    test('should report function declaration with "Infinity"', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('Infinity'))
      expect(reports.length).toBe(1)
    })

    test('should report function declaration with "eval"', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('eval'))
      expect(reports.length).toBe(1)
    })

    test('should report function declaration with "arguments"', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('arguments'))
      expect(reports.length).toBe(1)
    })

    test('should report undefined in FunctionDeclaration with exact message', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('undefined'))
      expect(reports[0].message).toBe("Shadowing of global property 'undefined'.")
    })

    test('should report NaN in FunctionDeclaration with exact message', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('NaN'))
      expect(reports[0].message).toBe("Shadowing of global property 'NaN'.")
    })

    test('should report Infinity in FunctionDeclaration with exact message', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('Infinity'))
      expect(reports[0].message).toBe("Shadowing of global property 'Infinity'.")
    })

    test('should report eval in FunctionDeclaration with exact message', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('eval'))
      expect(reports[0].message).toBe("Shadowing of global property 'eval'.")
    })

    test('should report arguments in FunctionDeclaration with exact message', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('arguments'))
      expect(reports[0].message).toBe("Shadowing of global property 'arguments'.")
    })
  })

  describe('detection - all restricted names via test.each', () => {
    const restrictedNames = ['undefined', 'NaN', 'Infinity', 'eval', 'arguments']

    test.each(restrictedNames)('should detect "%s" in VariableDeclarator', (name) => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator(name))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain(name)
    })

    test.each(restrictedNames)('should detect "%s" in FunctionDeclaration', (name) => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration(name))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain(name)
    })
  })

  describe('valid - VariableDeclarator not reporting', () => {
    test('should not report variable declaration with regular name', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('myVar'))
      expect(reports.length).toBe(0)
    })

    test('should not report variable declaration with camelCase name', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('myVariableName'))
      expect(reports.length).toBe(0)
    })

    test('should not report variable declaration with similar but non-restricted name', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('undefinedVar'))
      expect(reports.length).toBe(0)
    })

    test('should not report variable declaration with lowercase "undefinedvar"', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('undefinedvar'))
      expect(reports.length).toBe(0)
    })

    test('should not report variable declaration with "Undefined"', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('Undefined'))
      expect(reports.length).toBe(0)
    })

    test('should not report variable declaration with similar "NaN" variant "nan"', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('nan'))
      expect(reports.length).toBe(0)
    })

    test('should not report variable declaration with regular underscore name "_undefined"', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('_undefined'))
      expect(reports.length).toBe(0)
    })

    test('should not report variable declaration with "Eval" (capitalized)', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('Eval'))
      expect(reports.length).toBe(0)
    })

    test('should not report variable declaration with "Arguments" (capitalized)', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('Arguments'))
      expect(reports.length).toBe(0)
    })

    test('should not report variable declaration with "infinity" (lowercase)', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('infinity'))
      expect(reports.length).toBe(0)
    })

    test('should not report variable declaration with "EVAL" (uppercase)', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('EVAL'))
      expect(reports.length).toBe(0)
    })

    test('should not report variable declaration with "UNDEFINED" (uppercase)', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('UNDEFINED'))
      expect(reports.length).toBe(0)
    })

    test('should not report variable declaration with "NAN" (uppercase)', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('NAN'))
      expect(reports.length).toBe(0)
    })

    test('should not report variable declaration with empty string name', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator(''))
      expect(reports.length).toBe(0)
    })

    test('should not report variable declaration with single character name', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      expect(reports.length).toBe(0)
    })
  })

  describe('valid - FunctionDeclaration not reporting', () => {
    test('should not report function declaration with regular name', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('myFunc'))
      expect(reports.length).toBe(0)
    })

    test('should not report function declaration with PascalCase name', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('MyFunction'))
      expect(reports.length).toBe(0)
    })

    test('should not report function declaration without id', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration(null))
      expect(reports.length).toBe(0)
    })

    test('should not report function declaration with "Undefined" (capitalized)', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('Undefined'))
      expect(reports.length).toBe(0)
    })

    test('should not report function declaration with "Nan" (mixed case)', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('Nan'))
      expect(reports.length).toBe(0)
    })

    test('should not report function declaration with "infinity" (lowercase)', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('infinity'))
      expect(reports.length).toBe(0)
    })

    test('should not report function declaration with "Eval" (capitalized)', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('Eval'))
      expect(reports.length).toBe(0)
    })

    test('should not report function declaration with "Arguments" (capitalized)', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('Arguments'))
      expect(reports.length).toBe(0)
    })

    test('should not report function declaration with "evalFunction"', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('evalFunction'))
      expect(reports.length).toBe(0)
    })

    test('should not report function declaration with "isUndefined"', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('isUndefined'))
      expect(reports.length).toBe(0)
    })

    test('should not report function declaration with underscore prefix "_eval"', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('_eval'))
      expect(reports.length).toBe(0)
    })

    test('should not report function declaration with "checkArguments"', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('checkArguments'))
      expect(reports.length).toBe(0)
    })

    test('should not report function declaration with "getInfinity"', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('getInfinity'))
      expect(reports.length).toBe(0)
    })

    test('should not report function declaration with empty string name', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration(''))
      expect(reports.length).toBe(0)
    })

    test('should not report function declaration with "NaNValue"', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('NaNValue'))
      expect(reports.length).toBe(0)
    })
  })

  describe('valid - near-miss names via test.each', () => {
    const nearMissNames = [
      { name: 'undefined', miss: 'Undefined' },
      { name: 'undefined', miss: 'undefinedVar' },
      { name: 'undefined', miss: '_undefined' },
      { name: 'undefined', miss: 'UNDEFINED' },
      { name: 'NaN', miss: 'nan' },
      { name: 'NaN', miss: 'Nan' },
      { name: 'NaN', miss: 'NAN' },
      { name: 'NaN', miss: 'NaNValue' },
      { name: 'Infinity', miss: 'infinity' },
      { name: 'Infinity', miss: 'InfinityValue' },
      { name: 'eval', miss: 'Eval' },
      { name: 'eval', miss: 'evalFunction' },
      { name: 'eval', miss: '_eval' },
      { name: 'eval', miss: 'EVAL' },
      { name: 'arguments', miss: 'Arguments' },
      { name: 'arguments', miss: 'checkArguments' },
      { name: 'arguments', miss: 'ARGS' },
      { name: 'arguments', miss: 'args' },
      { name: 'arguments', miss: 'argument' },
      { name: 'eval', miss: 'evaluate' },
    ]

    test.each(nearMissNames)(
      'should not report "$miss" as "$name" in VariableDeclarator',
      ({ miss }) => {
        const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
        const visitor = noShadowRestrictedNamesRule.create(context)
        visitor.VariableDeclarator(createVariableDeclarator(miss))
        expect(reports.length).toBe(0)
      },
    )

    test.each(nearMissNames)(
      'should not report "$miss" as "$name" in FunctionDeclaration',
      ({ miss }) => {
        const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
        const visitor = noShadowRestrictedNamesRule.create(context)
        visitor.FunctionDeclaration(createFunctionDeclaration(miss))
        expect(reports.length).toBe(0)
      },
    )
  })

  describe('edge cases', () => {
    test('should handle null node in VariableDeclarator', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      expect(() => visitor.VariableDeclarator(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node in VariableDeclarator', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      expect(() => visitor.VariableDeclarator(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle null node in FunctionDeclaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      expect(() => visitor.FunctionDeclaration(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node in FunctionDeclaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      expect(() => visitor.FunctionDeclaration(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle variable declarator without id', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      const node = { type: 'VariableDeclarator', init: null }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('should handle variable declarator without identifier id', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Literal', value: 'x' },
        init: null,
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('should handle function declaration without id', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      const node = {
        type: 'FunctionDeclaration',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.FunctionDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('should handle function declaration with non-identifier id', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Literal', value: 'myFunc' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.FunctionDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc for VariableDeclarator', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      const node = createVariableDeclarator('undefined')
      delete (node as Record<string, unknown>).loc
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
    })

    test('should handle node without loc for FunctionDeclaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      const node = createFunctionDeclaration('NaN')
      delete (node as Record<string, unknown>).loc
      visitor.FunctionDeclaration(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
    })

    test('should handle non-VariableDeclarator node type in VariableDeclarator visitor', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      const node = { type: 'Identifier', name: 'x' }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('should handle non-FunctionDeclaration node type in FunctionDeclaration visitor', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      const node = { type: 'Identifier', name: 'x' }
      visitor.FunctionDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node in VariableDeclarator', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      expect(() => visitor.VariableDeclarator(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle number node in VariableDeclarator', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      expect(() => visitor.VariableDeclarator(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle string node in VariableDeclarator', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      expect(() => visitor.VariableDeclarator('undefined')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node in FunctionDeclaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      expect(() => visitor.FunctionDeclaration(false)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle number node in FunctionDeclaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      expect(() => visitor.FunctionDeclaration(0)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle string node in FunctionDeclaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      expect(() => visitor.FunctionDeclaration('eval')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node in VariableDeclarator', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      expect(() => visitor.VariableDeclarator({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node in FunctionDeclaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      expect(() => visitor.FunctionDeclaration({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null id in VariableDeclarator', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      const node = { type: 'VariableDeclarator', id: null, init: null }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined id in VariableDeclarator', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      const node = { type: 'VariableDeclarator', id: undefined, init: null }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('should handle node with numeric id name in VariableDeclarator', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 123 },
        init: null,
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('should handle node with null id name in VariableDeclarator', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: null },
        init: null,
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('should handle node with missing loc.start in VariableDeclarator', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'undefined' },
        init: null,
        loc: {},
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('location', () => {
    test('should report variable declaration with correct location line 5 col 10', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('undefined', 5, 10))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report function declaration with correct location line 3 col 8', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('NaN', 3, 8))
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should report variable with location at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('eval', 1, 0))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report function with location at line 100 column 50', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('eval', 100, 50))
      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should include end location for variable declaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('eval', 5, 10))
      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(5)
    })

    test('should include end location for function declaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('NaN', 7, 3))
      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(7)
    })

    test('should provide default location when node has no loc for VariableDeclarator', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      const node = createVariableDeclarator('undefined')
      delete (node as Record<string, unknown>).loc
      visitor.VariableDeclarator(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should provide default location when node has no loc for FunctionDeclaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      const node = createFunctionDeclaration('Infinity')
      delete (node as Record<string, unknown>).loc
      visitor.FunctionDeclaration(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should preserve exact location for all restricted names in VariableDeclarator', () => {
      const names = ['undefined', 'NaN', 'Infinity', 'eval', 'arguments']
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      names.forEach((name, i) => {
        visitor.VariableDeclarator(createVariableDeclarator(name, i + 1, i * 4))
      })
      expect(reports).toHaveLength(5)
      names.forEach((name, i) => {
        expect(reports[i].loc?.start.line).toBe(i + 1)
        expect(reports[i].loc?.start.column).toBe(i * 4)
      })
    })

    test('should preserve exact location for all restricted names in FunctionDeclaration', () => {
      const names = ['undefined', 'NaN', 'Infinity', 'eval', 'arguments']
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      names.forEach((name, i) => {
        visitor.FunctionDeclaration(createFunctionDeclaration(name, i + 10, i * 2))
      })
      expect(reports).toHaveLength(5)
      names.forEach((name, i) => {
        expect(reports[i].loc?.start.line).toBe(i + 10)
        expect(reports[i].loc?.start.column).toBe(i * 2)
      })
    })

    test('should report location at line 0 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('undefined', 0, 0))
      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report end column greater than start column for VariableDeclarator', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('undefined', 1, 4))
      expect(reports[0].loc!.end.column).toBeGreaterThan(reports[0].loc!.start.column)
    })

    test('should report end column greater than start column for FunctionDeclaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('arguments', 1, 2))
      expect(reports[0].loc!.end.column).toBeGreaterThan(reports[0].loc!.start.column)
    })

    test('should handle large line numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('undefined', 99999, 0))
      expect(reports[0].loc?.start.line).toBe(99999)
    })

    test('should handle large column numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('eval', 1, 99999))
      expect(reports[0].loc?.start.column).toBe(99999)
    })
  })

  describe('message format', () => {
    test('should contain "Shadowing" in message for undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('undefined'))
      expect(reports[0].message).toContain('Shadowing')
    })

    test('should contain "global property" in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('eval'))
      expect(reports[0].message).toContain('global property')
    })

    test('should contain the restricted name in message for NaN', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('NaN'))
      expect(reports[0].message).toContain('NaN')
    })

    test('should contain the restricted name in message for Infinity', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('Infinity'))
      expect(reports[0].message).toContain('Infinity')
    })

    test('should contain the restricted name in message for eval', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('eval'))
      expect(reports[0].message).toContain('eval')
    })

    test('should format message with single quotes around name', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('undefined'))
      expect(reports[0].message).toContain("'undefined'")
    })

    test('should end message with period', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('undefined'))
      expect(reports[0].message.endsWith('.')).toBe(true)
    })

    test('should have consistent message format across all restricted names', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      const names = ['undefined', 'NaN', 'Infinity', 'eval', 'arguments']
      names.forEach((name) => {
        visitor.VariableDeclarator(createVariableDeclarator(name))
      })
      reports.forEach((r) => {
        expect(r.message).toMatch(/^Shadowing of global property '.*'\.$/)
      })
    })

    test('should produce same message for VariableDeclarator and FunctionDeclaration', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext({
        source: 'let undefined = 5',
      })
      const { context: ctx2, reports: reports2 } = createMockRuleContext({
        source: 'let undefined = 5',
      })
      const visitor1 = noShadowRestrictedNamesRule.create(ctx1)
      const visitor2 = noShadowRestrictedNamesRule.create(ctx2)
      visitor1.VariableDeclarator(createVariableDeclarator('undefined'))
      visitor2.FunctionDeclaration(createFunctionDeclaration('undefined'))
      expect(reports1[0].message).toBe(reports2[0].message)
    })

    test('should not include type information in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('arguments'))
      expect(reports[0].message).not.toContain('VariableDeclarator')
      expect(reports[0].message).not.toContain('FunctionDeclaration')
    })
  })

  describe('multiple reports', () => {
    test('should report each occurrence of restricted name', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('undefined'))
      visitor.VariableDeclarator(createVariableDeclarator('NaN'))
      visitor.VariableDeclarator(createVariableDeclarator('Infinity'))
      visitor.FunctionDeclaration(createFunctionDeclaration('eval'))
      visitor.FunctionDeclaration(createFunctionDeclaration('arguments'))
      expect(reports.length).toBe(5)
    })

    test('should report same restricted name multiple times', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('undefined'))
      visitor.VariableDeclarator(createVariableDeclarator('undefined'))
      visitor.VariableDeclarator(createVariableDeclarator('undefined'))
      expect(reports.length).toBe(3)
    })

    test('should report same function name multiple times', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('eval'))
      visitor.FunctionDeclaration(createFunctionDeclaration('eval'))
      expect(reports.length).toBe(2)
    })

    test('should report mixed variable and function declarations', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('undefined'))
      visitor.FunctionDeclaration(createFunctionDeclaration('undefined'))
      expect(reports.length).toBe(2)
    })

    test('should not report valid names interspersed with restricted', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('myVar'))
      visitor.VariableDeclarator(createVariableDeclarator('undefined'))
      visitor.VariableDeclarator(createVariableDeclarator('anotherVar'))
      visitor.FunctionDeclaration(createFunctionDeclaration('eval'))
      visitor.FunctionDeclaration(createFunctionDeclaration('goodFunc'))
      expect(reports.length).toBe(2)
    })

    test('should track correct locations across multiple reports', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('undefined', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('NaN', 5, 10))
      visitor.FunctionDeclaration(createFunctionDeclaration('eval', 10, 2))
      expect(reports).toHaveLength(3)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
      expect(reports[2].loc?.start.line).toBe(10)
    })

    test('should report all 5 restricted names in sequence', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      const names = ['undefined', 'NaN', 'Infinity', 'eval', 'arguments']
      names.forEach((name) => {
        visitor.VariableDeclarator(createVariableDeclarator(name))
      })
      expect(reports).toHaveLength(5)
      names.forEach((name, i) => {
        expect(reports[i].message).toContain(name)
      })
    })

    test('should report all 5 restricted names via FunctionDeclaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      const names = ['undefined', 'NaN', 'Infinity', 'eval', 'arguments']
      names.forEach((name) => {
        visitor.FunctionDeclaration(createFunctionDeclaration(name))
      })
      expect(reports).toHaveLength(5)
    })

    test('should report 10 total when all names used in both visitors', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      const names = ['undefined', 'NaN', 'Infinity', 'eval', 'arguments']
      names.forEach((name) => {
        visitor.VariableDeclarator(createVariableDeclarator(name))
        visitor.FunctionDeclaration(createFunctionDeclaration(name))
      })
      expect(reports).toHaveLength(10)
    })

    test('should maintain independent report count per visitor call', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      for (let i = 0; i < 20; i++) {
        visitor.VariableDeclarator(createVariableDeclarator('eval'))
      }
      expect(reports).toHaveLength(20)
    })
  })

  describe('context handling', () => {
    test('should work with different file paths', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/different/path.ts',
        getAST: () => null,
        getSource: () => 'let undefined = 5',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/project',
      } as unknown as RuleContext

      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('undefined'))
      expect(reports.length).toBe(1)
    })

    test('should not call logger during normal operation', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('undefined'))
      expect(reports.length).toBe(1)
      expect(context.logger.debug).not.toHaveBeenCalled()
      expect(context.logger.info).not.toHaveBeenCalled()
      expect(context.logger.warn).not.toHaveBeenCalled()
      expect(context.logger.error).not.toHaveBeenCalled()
    })

    test('should not call logger for valid names', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('myVar'))
      expect(reports.length).toBe(0)
      expect(context.logger.debug).not.toHaveBeenCalled()
    })

    test('should call context.report exactly once for single restricted name', () => {
      let reportCount = 0
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reportCount++
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('undefined'))
      expect(reportCount).toBe(1)
    })

    test('should pass message property to report', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('NaN'))
      expect(reports[0].message).toBeDefined()
      expect(typeof reports[0].message).toBe('string')
    })

    test('should pass loc property to report', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('Infinity', 4, 8))
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(4)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should work with create called multiple times', () => {
      const { context } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor1 = noShadowRestrictedNamesRule.create(context)
      const visitor2 = noShadowRestrictedNamesRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('should maintain separate reports for separate contexts', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext({
        source: 'let undefined = 5',
      })
      const { context: ctx2, reports: reports2 } = createMockRuleContext({
        source: 'let undefined = 5',
      })
      const visitor1 = noShadowRestrictedNamesRule.create(ctx1)
      const visitor2 = noShadowRestrictedNamesRule.create(ctx2)
      visitor1.VariableDeclarator(createVariableDeclarator('undefined'))
      visitor2.VariableDeclarator(createVariableDeclarator('eval'))
      expect(reports1).toHaveLength(1)
      expect(reports2).toHaveLength(1)
      expect(reports1[0].message).toContain('undefined')
      expect(reports2[0].message).toContain('eval')
    })

    test('should handle context with empty source', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/empty.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('eval'))
      expect(reports.length).toBe(1)
    })

    test('should handle context with null AST', () => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('arguments'))
      expect(reports.length).toBe(1)
      expect(context.getAST()).toBeNull()
    })
  })

  describe('test.each - comprehensive VariableDeclarator', () => {
    const restrictedCases: Array<{ name: string; line: number; column: number }> = [
      { name: 'undefined', line: 1, column: 0 },
      { name: 'undefined', line: 10, column: 5 },
      { name: 'undefined', line: 100, column: 50 },
      { name: 'NaN', line: 1, column: 0 },
      { name: 'NaN', line: 20, column: 8 },
      { name: 'NaN', line: 200, column: 0 },
      { name: 'Infinity', line: 1, column: 0 },
      { name: 'Infinity', line: 15, column: 3 },
      { name: 'Infinity', line: 50, column: 25 },
      { name: 'eval', line: 1, column: 0 },
      { name: 'eval', line: 30, column: 12 },
      { name: 'eval', line: 99, column: 1 },
      { name: 'arguments', line: 1, column: 0 },
      { name: 'arguments', line: 5, column: 7 },
      { name: 'arguments', line: 42, column: 42 },
    ]

    test.each(restrictedCases)(
      'should report VariableDeclarator "$name" at line:$line col:$column',
      ({ name, line, column }) => {
        const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
        const visitor = noShadowRestrictedNamesRule.create(context)
        visitor.VariableDeclarator(createVariableDeclarator(name, line, column))
        expect(reports.length).toBe(1)
        expect(reports[0].loc?.start.line).toBe(line)
        expect(reports[0].loc?.start.column).toBe(column)
      },
    )
  })

  describe('test.each - comprehensive FunctionDeclaration', () => {
    const restrictedCases: Array<{ name: string; line: number; column: number }> = [
      { name: 'undefined', line: 2, column: 1 },
      { name: 'undefined', line: 25, column: 10 },
      { name: 'NaN', line: 3, column: 2 },
      { name: 'NaN', line: 33, column: 15 },
      { name: 'Infinity', line: 4, column: 3 },
      { name: 'Infinity', line: 44, column: 20 },
      { name: 'eval', line: 5, column: 4 },
      { name: 'eval', line: 55, column: 0 },
      { name: 'arguments', line: 6, column: 5 },
      { name: 'arguments', line: 66, column: 11 },
    ]

    test.each(restrictedCases)(
      'should report FunctionDeclaration "$name" at line:$line col:$column',
      ({ name, line, column }) => {
        const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
        const visitor = noShadowRestrictedNamesRule.create(context)
        visitor.FunctionDeclaration(createFunctionDeclaration(name, line, column))
        expect(reports.length).toBe(1)
        expect(reports[0].loc?.start.line).toBe(line)
        expect(reports[0].loc?.start.column).toBe(column)
      },
    )
  })

  describe('test.each - safe names should not be reported', () => {
    const safeNames = [
      'foo',
      'bar',
      'baz',
      'qux',
      'myVariable',
      'MyVariable',
      '_undefined',
      '_NaN',
      '_Infinity',
      '_eval',
      '_arguments',
      'undefinedValue',
      'nanValue',
      'infinityValue',
      'evalFunction',
      'argumentList',
      'result',
      'data',
      'item',
      'element',
    ]

    test.each(safeNames)('should not report VariableDeclarator with safe name "%s"', (name) => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator(name))
      expect(reports.length).toBe(0)
    })

    test.each(safeNames)('should not report FunctionDeclaration with safe name "%s"', (name) => {
      const { context, reports } = createMockRuleContext({ source: 'let undefined = 5' })
      const visitor = noShadowRestrictedNamesRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration(name))
      expect(reports.length).toBe(0)
    })
  })
})
