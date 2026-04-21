import { describe, test, expect, vi } from 'vitest'
import { noCallerRule } from '../../../../src/rules/patterns/no-caller.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createMemberExpression(
  object: string,
  property: string,
  computed = false,
  lineNumber = 1,
  column = 0,
): unknown {
  return {
    type: 'MemberExpression',
    object: { type: 'Identifier', name: object },
    property: { type: 'Identifier', name: property },
    computed: computed,
    loc: {
      start: { line: lineNumber, column },
      end: { line: lineNumber, column: object.length + property.length + 2 },
    },
  }
}

function createComputedMemberExpression(object: string, lineNumber = 1, column = 0): unknown {
  return {
    type: 'MemberExpression',
    object: { type: 'Identifier', name: object },
    property: { type: 'Literal', value: 'callee' },
    computed: true,
    loc: {
      start: { line: lineNumber, column },
      end: { line: lineNumber, column: object.length + 10 },
    },
  }
}

describe('no-caller rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noCallerRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noCallerRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noCallerRule.meta.docs?.recommended).toBe(true)
    })

    test('should have security category', () => {
      expect(noCallerRule.meta.docs?.category).toBe('security')
    })

    test('should have schema defined', () => {
      expect(noCallerRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noCallerRule.meta.fixable).toBeUndefined()
    })

    test('should mention caller in description', () => {
      const desc = noCallerRule.meta.docs?.description.toLowerCase()
      expect(desc).toContain('caller')
    })

    test('should mention callee in description', () => {
      const desc = noCallerRule.meta.docs?.description.toLowerCase()
      expect(desc).toContain('callee')
    })

    test('should mention arguments in description', () => {
      const desc = noCallerRule.meta.docs?.description.toLowerCase()
      expect(desc).toContain('arguments')
    })

    test('should have empty schema array', () => {
      expect(noCallerRule.meta.schema).toEqual([])
    })

    test('should have a url in docs', () => {
      expect(noCallerRule.meta.docs?.url).toBeDefined()
    })

    test('should have url containing no-caller', () => {
      expect(noCallerRule.meta.docs?.url).toContain('no-caller')
    })

    test('should not be deprecated', () => {
      expect(noCallerRule.meta.deprecated).toBeUndefined()
    })

    test('should not have replacedBy', () => {
      expect(noCallerRule.meta.replacedBy).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(noCallerRule.meta.requiresTypeChecking).toBeUndefined()
    })
  })

  describe('create', () => {
    test('should return visitor object with MemberExpression method', () => {
      const { context } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      expect(visitor).toHaveProperty('MemberExpression')
    })

    test('should return a function for MemberExpression', () => {
      const { context } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      expect(typeof visitor.MemberExpression).toBe('function')
    })

    test('should return visitor that is an object', () => {
      const { context } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      expect(typeof visitor).toBe('object')
    })

    test('should return a new visitor each time create is called', () => {
      const { context } = createMockRuleContext()
      const visitor1 = noCallerRule.create(context)
      const visitor2 = noCallerRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should only have MemberExpression key', () => {
      const { context } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      expect(Object.keys(visitor)).toEqual(['MemberExpression'])
    })
  })

  describe('detecting arguments.caller', () => {
    test('should report arguments.caller', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'caller'))

      expect(reports.length).toBe(1)
    })

    test('should report correct message for arguments.caller', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'caller'))

      expect(reports[0].message).toBe('Avoid arguments.caller and arguments.callee.')
    })

    test('should report multiple arguments.caller usages', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'caller', false, 1, 0))
      visitor.MemberExpression(createMemberExpression('arguments', 'caller', false, 2, 0))
      visitor.MemberExpression(createMemberExpression('arguments', 'caller', false, 3, 0))

      expect(reports.length).toBe(3)
    })

    test('should report arguments.caller at line 1', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'caller', false, 1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should report arguments.caller at column 4', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'caller', false, 1, 4))

      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should report arguments.caller in arrow function context', () => {
      const { context, reports } = createMockRuleContext({
        filePath: '/src/arrow.ts',
        source: 'const f = () => arguments.caller',
      })
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'caller'))

      expect(reports.length).toBe(1)
    })

    test('should report arguments.caller in function expression', () => {
      const { context, reports } = createMockRuleContext({
        filePath: '/src/func.ts',
        source: 'const f = function() { arguments.caller }',
      })
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'caller'))

      expect(reports.length).toBe(1)
    })

    test('should report arguments.caller in IIFE', () => {
      const { context, reports } = createMockRuleContext({
        filePath: '/src/iife.ts',
        source: '(function() { arguments.caller })()',
      })
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'caller'))

      expect(reports.length).toBe(1)
    })

    test('should report arguments.caller with zero line number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'caller', false, 0, 0))

      expect(reports.length).toBe(1)
    })

    test('should report arguments.caller with large line number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'caller', false, 9999, 0))

      expect(reports.length).toBe(1)
    })

    test('should report arguments.caller with large column number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'caller', false, 1, 9999))

      expect(reports.length).toBe(1)
    })

    test('should report arguments.caller twice on same line', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'caller', false, 5, 0))
      visitor.MemberExpression(createMemberExpression('arguments', 'caller', false, 5, 20))

      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[1].loc?.start.line).toBe(5)
    })
  })

  describe('detecting arguments.callee', () => {
    test('should report arguments["callee"]', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createComputedMemberExpression('arguments'))

      expect(reports.length).toBe(1)
    })

    test('should report correct message for arguments.callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createComputedMemberExpression('arguments'))

      expect(reports[0].message).toBe('Avoid arguments.caller and arguments.callee.')
    })

    test('should report multiple arguments.callee usages', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createComputedMemberExpression('arguments', 1, 0))
      visitor.MemberExpression(createComputedMemberExpression('arguments', 2, 0))
      visitor.MemberExpression(createComputedMemberExpression('arguments', 3, 0))

      expect(reports.length).toBe(3)
    })

    test('should report computed arguments["caller"] access', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'arguments' },
        property: { type: 'Literal', value: 'caller' },
        computed: true,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 20 },
        },
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report computed arguments[0] access', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'arguments' },
        property: { type: 'Literal', value: 0 },
        computed: true,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 15 },
        },
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report computed arguments[variable] access with Identifier property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'arguments' },
        property: { type: 'Identifier', name: 'i' },
        computed: true,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 15 },
        },
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report arguments["length"] computed access', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'arguments' },
        property: { type: 'Literal', value: 'length' },
        computed: true,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 20 },
        },
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report computed arguments["anyKey"] access', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'arguments' },
        property: { type: 'Literal', value: 'anyKey' },
        computed: true,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 20 },
        },
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report computed arguments access with template literal property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'arguments' },
        property: { type: 'TemplateLiteral', quasis: [], expressions: [] },
        computed: true,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 15 },
        },
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('not reporting regular property access', () => {
    test('should not report regular property access on arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'length'))

      expect(reports.length).toBe(0)
    })

    test('should not report property access on non-arguments object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('obj', 'caller'))
      visitor.MemberExpression(createMemberExpression('foo', 'callee'))

      expect(reports.length).toBe(0)
    })

    test('should not report non-computed callee property on arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'callee', false))

      expect(reports.length).toBe(0)
    })

    test('should not report computed property access on non-arguments object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Literal', value: 'callee' },
        computed: true,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report computed property access on arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'arguments' },
        property: { type: 'Literal', value: 'length' },
        computed: true,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report obj.caller', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('obj', 'caller'))

      expect(reports.length).toBe(0)
    })

    test('should not report foo.callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('foo', 'callee'))

      expect(reports.length).toBe(0)
    })

    test('should not report bar.caller', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('bar', 'caller'))

      expect(reports.length).toBe(0)
    })

    test('should not report this.caller', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('this', 'caller'))

      expect(reports.length).toBe(0)
    })

    test('should not report self.caller', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('self', 'caller'))

      expect(reports.length).toBe(0)
    })

    test('should not report window.caller', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('window', 'caller'))

      expect(reports.length).toBe(0)
    })

    test('should not report arguments.length', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'length'))

      expect(reports.length).toBe(0)
    })

    test('should not report arguments[0] non-computed', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', '0'))

      expect(reports.length).toBe(0)
    })

    test('should not report arguments.map', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'map'))

      expect(reports.length).toBe(0)
    })

    test('should not report arguments.forEach', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'forEach'))

      expect(reports.length).toBe(0)
    })

    test('should not report arguments.slice', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'slice'))

      expect(reports.length).toBe(0)
    })

    test('should not report config.caller', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('config', 'caller'))

      expect(reports.length).toBe(0)
    })

    test('should not report handler.callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('handler', 'callee'))

      expect(reports.length).toBe(0)
    })

    test('should not report computed access on myObj', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'myObj' },
        property: { type: 'Identifier', name: 'key' },
        computed: true,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report computed access on arr', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'arr' },
        property: { type: 'Literal', value: 0 },
        computed: true,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report mixed safe accesses from multiple objects', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('obj1', 'caller'))
      visitor.MemberExpression(createMemberExpression('obj2', 'callee'))
      visitor.MemberExpression(createMemberExpression('arguments', 'length'))
      visitor.MemberExpression(createMemberExpression('arguments', '0'))

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases - null and undefined', () => {
    test('should handle null node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      expect(() => visitor.MemberExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      expect(() => visitor.MemberExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      expect(() => visitor.MemberExpression('string')).not.toThrow()
      expect(() => visitor.MemberExpression(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      expect(() => visitor.MemberExpression(true)).not.toThrow()
      expect(() => visitor.MemberExpression(false)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle numeric node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      expect(() => visitor.MemberExpression(42)).not.toThrow()
      expect(() => visitor.MemberExpression(0)).not.toThrow()
      expect(() => visitor.MemberExpression(-1)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle string node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      expect(() => visitor.MemberExpression('arguments.caller')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty string node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      expect(() => visitor.MemberExpression('')).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases - malformed nodes', () => {
    test('should handle node without type property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const node = {
        object: { type: 'Identifier', name: 'arguments' },
        property: { type: 'Identifier', name: 'caller' },
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression without object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        property: { type: 'Identifier', name: 'caller' },
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression without property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'arguments' },
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without computed property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'arguments' },
        property: { type: 'Literal', value: 'callee' },
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle non-Identifier object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Literal', value: 'arguments' },
        property: { type: 'Identifier', name: 'caller' },
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle non-Identifier property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'arguments' },
        property: { type: 'Literal', value: 'caller' },
        computed: false,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle object with null type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: null, name: 'arguments' },
        property: { type: 'Identifier', name: 'caller' },
        computed: false,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle property with undefined type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'arguments' },
        property: { type: undefined, name: 'caller' },
        computed: false,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle object with empty name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: '' },
        property: { type: 'Identifier', name: 'caller' },
        computed: false,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle object with wrong name but arguments string value', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Literal', value: 'arguments' },
        property: { type: 'Identifier', name: 'caller' },
        computed: false,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression type node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'CallExpression',
        object: { type: 'Identifier', name: 'arguments' },
        property: { type: 'Identifier', name: 'caller' },
        computed: false,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle wrong type string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'ExpressionStatement',
        object: { type: 'Identifier', name: 'arguments' },
        property: { type: 'Identifier', name: 'caller' },
        computed: false,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with computed false explicitly', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'arguments' },
        property: { type: 'Identifier', name: 'callee' },
        computed: false,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with object as nested MemberExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'foo' },
          property: { type: 'Identifier', name: 'bar' },
        },
        property: { type: 'Identifier', name: 'caller' },
        computed: false,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with extra properties', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'caller'))

      expect(reports.length).toBe(1)
    })

    test('should handle node where object.name is Arguments (uppercase)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'Arguments' },
        property: { type: 'Identifier', name: 'caller' },
        computed: false,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node where property.name is Caller (uppercase)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'arguments' },
        property: { type: 'Identifier', name: 'Caller' },
        computed: false,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      expect(() => visitor.MemberExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with only type property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      expect(() => visitor.MemberExpression({ type: 'MemberExpression' })).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases - config variations', () => {
    test('should handle empty options', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'caller'))

      expect(reports.length).toBe(1)
    })

    test('should handle undefined rule config', () => {
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
        getSource: () => 'arguments.caller',
        getTokens: () => [],
        getComments: () => [],
        config: { rules: {} },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noCallerRule.create(context)
      visitor.MemberExpression(createMemberExpression('arguments', 'caller'))

      expect(reports.length).toBe(1)
    })

    test('should handle null config rules', () => {
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
        getSource: () => 'arguments.caller',
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

      const visitor = noCallerRule.create(context)
      visitor.MemberExpression(createMemberExpression('arguments', 'caller'))

      expect(reports.length).toBe(1)
    })

    test('should handle extra options in config', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'caller'))

      expect(reports.length).toBe(1)
    })

    test('should work with warn severity in config', () => {
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
        getSource: () => 'arguments.caller',
        getTokens: () => [],
        getComments: () => [],
        config: { rules: { 'no-caller': ['warn'] } },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noCallerRule.create(context)
      visitor.MemberExpression(createMemberExpression('arguments', 'caller'))

      expect(reports.length).toBe(1)
    })

    test('should work with off severity in config (still reports)', () => {
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
        getSource: () => 'arguments.caller',
        getTokens: () => [],
        getComments: () => [],
        config: { rules: { 'no-caller': ['off'] } },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noCallerRule.create(context)
      visitor.MemberExpression(createMemberExpression('arguments', 'caller'))

      expect(reports.length).toBe(1)
    })
  })

  describe('location reporting', () => {
    test('should report correct location for arguments.caller', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'caller', false, 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report location with end position for arguments.caller', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'caller', false, 5, 10))

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should report correct location for arguments.callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createComputedMemberExpression('arguments', 15, 8))

      expect(reports[0].loc?.start.line).toBe(15)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should report location at line 1 column 0 by default', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'caller'))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report end location for arguments.caller', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'caller', false, 3, 4))

      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(3)
    })

    test('should report end location for computed access', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createComputedMemberExpression('arguments', 7, 2))

      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(7)
    })

    test('should provide default location when node has no loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'arguments' },
        property: { type: 'Identifier', name: 'caller' },
        computed: false,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
    })

    test('should provide default location with line 1 when no loc on computed node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'arguments' },
        property: { type: 'Literal', value: 'callee' },
        computed: true,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle node with loc containing only start', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'arguments' },
        property: { type: 'Identifier', name: 'caller' },
        computed: false,
        loc: {
          start: { line: 5, column: 3 },
        },
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
    })

    test('should preserve exact start and end positions', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'caller', false, 42, 17))

      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(17)
      expect(reports[0].loc?.end).toBeDefined()
    })
  })

  describe('message quality', () => {
    test('should mention arguments in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'caller'))

      expect(reports[0].message).toContain('arguments')
    })

    test('should mention caller in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'caller'))

      expect(reports[0].message).toContain('caller')
    })

    test('should mention callee in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createComputedMemberExpression('arguments'))

      expect(reports[0].message).toContain('callee')
    })

    test('should have consistent message format for both violations', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'caller'))
      visitor.MemberExpression(createComputedMemberExpression('arguments'))

      expect(reports[0].message).toBe('Avoid arguments.caller and arguments.callee.')
      expect(reports[1].message).toBe('Avoid arguments.caller and arguments.callee.')
    })

    test('should have consistent message for all caller detections', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'caller', false, 1, 0))
      visitor.MemberExpression(createMemberExpression('arguments', 'caller', false, 2, 0))
      visitor.MemberExpression(createMemberExpression('arguments', 'caller', false, 3, 0))

      expect(reports[0].message).toBe(reports[1].message)
      expect(reports[1].message).toBe(reports[2].message)
    })

    test('should have consistent message for all callee detections', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createComputedMemberExpression('arguments', 1, 0))
      visitor.MemberExpression(createComputedMemberExpression('arguments', 2, 0))
      visitor.MemberExpression(createComputedMemberExpression('arguments', 3, 0))

      expect(reports[0].message).toBe(reports[1].message)
      expect(reports[1].message).toBe(reports[2].message)
    })

    test('should use same message for both caller and callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'caller'))
      visitor.MemberExpression(createComputedMemberExpression('arguments'))

      expect(reports[0].message).toBe(reports[1].message)
    })

    test('should have a non-empty message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'caller'))

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should have a message ending with period', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'caller'))

      expect(reports[0].message.endsWith('.')).toBe(true)
    })
  })

  describe('mixed violations and safe accesses', () => {
    test('should report only arguments.caller among mixed accesses', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'length'))
      visitor.MemberExpression(createMemberExpression('arguments', 'caller'))
      visitor.MemberExpression(createMemberExpression('arguments', '0'))

      expect(reports.length).toBe(1)
    })

    test('should report only computed arguments access among mixed accesses', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('obj', 'caller'))
      visitor.MemberExpression(createComputedMemberExpression('arguments'))
      visitor.MemberExpression(createMemberExpression('arguments', 'callee', false))

      expect(reports.length).toBe(1)
    })

    test('should report both caller and callee in sequence', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'caller'))
      visitor.MemberExpression(createComputedMemberExpression('arguments'))

      expect(reports.length).toBe(2)
    })

    test('should correctly count violations among many accesses', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'length'))
      visitor.MemberExpression(createMemberExpression('obj', 'caller'))
      visitor.MemberExpression(createMemberExpression('arguments', 'caller'))
      visitor.MemberExpression(createComputedMemberExpression('arguments'))
      visitor.MemberExpression(createMemberExpression('arguments', '0'))
      visitor.MemberExpression(createMemberExpression('arguments', 'caller'))

      expect(reports.length).toBe(3)
    })

    test('should handle alternating safe and violation nodes', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'caller'))
      visitor.MemberExpression(createMemberExpression('arguments', 'length'))
      visitor.MemberExpression(createComputedMemberExpression('arguments'))
      visitor.MemberExpression(createMemberExpression('foo', 'caller'))
      visitor.MemberExpression(createMemberExpression('arguments', 'caller'))
      visitor.MemberExpression(createMemberExpression('arguments', '0'))
      visitor.MemberExpression(createComputedMemberExpression('arguments'))

      expect(reports.length).toBe(4)
    })

    test('should report 5 consecutive caller violations', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.MemberExpression(createMemberExpression('arguments', 'caller', false, i + 1, 0))
      }

      expect(reports.length).toBe(5)
    })

    test('should report 10 consecutive mixed violations', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.MemberExpression(createMemberExpression('arguments', 'caller', false, i + 1, 0))
        visitor.MemberExpression(createComputedMemberExpression('arguments', i + 1, 10))
      }

      expect(reports.length).toBe(10)
    })
  })

  describe('computed property variations', () => {
    test('should report arguments["caller"] computed access', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'arguments' },
        property: { type: 'Literal', value: 'caller' },
        computed: true,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report arguments[variableName] computed access', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'arguments' },
        property: { type: 'Identifier', name: 'variableName' },
        computed: true,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report arguments[0] computed access', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'arguments' },
        property: { type: 'NumericLiteral', value: 0 },
        computed: true,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report arguments[42] computed access', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'arguments' },
        property: { type: 'NumericLiteral', value: 42 },
        computed: true,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report arguments[expr] with complex property type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'arguments' },
        property: { type: 'BinaryExpression', operator: '+' },
        computed: true,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report arguments.caller when computed is explicitly false', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'caller', false))

      expect(reports.length).toBe(1)
    })

    test('should not report when computed is truthy number 1 (strict equality)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'arguments' },
        property: { type: 'Literal', value: 'x' },
        computed: 1,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when computed is falsy 0', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'arguments' },
        property: { type: 'Literal', value: 'callee' },
        computed: 0,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when computed is empty string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'arguments' },
        property: { type: 'Literal', value: 'callee' },
        computed: '',
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('context variations', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockRuleContext({
        filePath: '/project/src/utils.ts',
        source: 'arguments.caller',
      })
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'caller'))

      expect(reports.length).toBe(1)
    })

    test('should work with .js file extension', () => {
      const { context, reports } = createMockRuleContext({
        filePath: '/project/src/utils.js',
        source: 'arguments.caller',
      })
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'caller'))

      expect(reports.length).toBe(1)
    })

    test('should work with .mjs file extension', () => {
      const { context, reports } = createMockRuleContext({
        filePath: '/project/src/utils.mjs',
        source: 'arguments.caller',
      })
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'caller'))

      expect(reports.length).toBe(1)
    })

    test('should work with .cjs file extension', () => {
      const { context, reports } = createMockRuleContext({
        filePath: '/project/src/utils.cjs',
        source: 'arguments.caller',
      })
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'caller'))

      expect(reports.length).toBe(1)
    })

    test('should work with .jsx file extension', () => {
      const { context, reports } = createMockRuleContext({
        filePath: '/project/src/component.jsx',
        source: 'arguments.caller',
      })
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'caller'))

      expect(reports.length).toBe(1)
    })

    test('should work with .tsx file extension', () => {
      const { context, reports } = createMockRuleContext({
        filePath: '/project/src/component.tsx',
        source: 'arguments.caller',
      })
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'caller'))

      expect(reports.length).toBe(1)
    })

    test('should work with different workspace roots', () => {
      const { context, reports } = createMockRuleContext({
        filePath: '/home/user/project/src/file.ts',
        source: 'arguments.caller',
      })
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'caller'))

      expect(reports.length).toBe(1)
    })

    test('should work with empty source code', () => {
      const { context, reports } = createMockRuleContext({ filePath: '/src/file.ts', source: '' })
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'caller'))

      expect(reports.length).toBe(1)
    })

    test('should work with long source code', () => {
      const longSource = 'const x = 1;\n'.repeat(1000) + 'arguments.caller'
      const { context, reports } = createMockRuleContext({
        filePath: '/src/file.ts',
        source: longSource,
      })
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'caller'))

      expect(reports.length).toBe(1)
    })
  })

  describe('case sensitivity', () => {
    test('should not report Arguments.caller (capitalized)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'Arguments' },
        property: { type: 'Identifier', name: 'caller' },
        computed: false,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report ARGUMENTS.caller (uppercase)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'ARGUMENTS' },
        property: { type: 'Identifier', name: 'caller' },
        computed: false,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report arguments.Caller (capitalized property)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'arguments' },
        property: { type: 'Identifier', name: 'Caller' },
        computed: false,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report arguments.CALLEE (uppercase property)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'arguments' },
        property: { type: 'Identifier', name: 'CALLEE' },
        computed: false,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report computed access on Arguments (capitalized)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'Arguments' },
        property: { type: 'Literal', value: 'callee' },
        computed: true,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report computed access on ARGUMENTS (uppercase)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'ARGUMENTS' },
        property: { type: 'Literal', value: 'callee' },
        computed: true,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('visitor isolation', () => {
    test('should not share reports between visitors', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext()
      const { context: ctx2, reports: reports2 } = createMockRuleContext()

      const visitor1 = noCallerRule.create(ctx1)
      const visitor2 = noCallerRule.create(ctx2)

      visitor1.MemberExpression(createMemberExpression('arguments', 'caller'))

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(0)
    })

    test('should track reports independently for each visitor', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext()
      const { context: ctx2, reports: reports2 } = createMockRuleContext()

      const visitor1 = noCallerRule.create(ctx1)
      const visitor2 = noCallerRule.create(ctx2)

      visitor1.MemberExpression(createMemberExpression('arguments', 'caller'))
      visitor2.MemberExpression(createMemberExpression('arguments', 'caller'))
      visitor2.MemberExpression(createComputedMemberExpression('arguments'))

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(2)
    })

    test('should handle same node visited by two different visitors', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext()
      const { context: ctx2, reports: reports2 } = createMockRuleContext()

      const visitor1 = noCallerRule.create(ctx1)
      const visitor2 = noCallerRule.create(ctx2)

      const node = createMemberExpression('arguments', 'caller')
      visitor1.MemberExpression(node)
      visitor2.MemberExpression(node)

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(1)
    })
  })

  describe('rule structure and exports', () => {
    test('should export a RuleDefinition object', () => {
      expect(noCallerRule).toBeDefined()
      expect(typeof noCallerRule).toBe('object')
    })

    test('should have meta property', () => {
      expect(noCallerRule.meta).toBeDefined()
      expect(typeof noCallerRule.meta).toBe('object')
    })

    test('should have create method', () => {
      expect(noCallerRule.create).toBeDefined()
      expect(typeof noCallerRule.create).toBe('function')
    })

    test('should have docs property in meta', () => {
      expect(noCallerRule.meta.docs).toBeDefined()
    })

    test('should have description in docs', () => {
      expect(noCallerRule.meta.docs?.description).toBeDefined()
      expect(typeof noCallerRule.meta.docs?.description).toBe('string')
    })

    test('should mention deprecated in description', () => {
      const desc = noCallerRule.meta.docs?.description.toLowerCase()
      expect(desc).toContain('deprecated')
    })

    test('should mention security in description', () => {
      const desc = noCallerRule.meta.docs?.description.toLowerCase()
      expect(desc).toContain('security')
    })
  })

  describe('simulated real-world patterns', () => {
    test('should detect arguments.caller in recursive function', () => {
      const { context, reports } = createMockRuleContext({
        filePath: '/src/recursive.ts',
        source: 'function factorial(n) { return arguments.caller }',
      })
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'caller'))

      expect(reports.length).toBe(1)
    })

    test('should detect arguments.callee in anonymous function', () => {
      const { context, reports } = createMockRuleContext({
        filePath: '/src/anon.ts',
        source: '(function() { return arguments["callee"] })()',
      })
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createComputedMemberExpression('arguments'))

      expect(reports.length).toBe(1)
    })

    test('should not report safe arguments usage in callback', () => {
      const { context, reports } = createMockRuleContext({
        filePath: '/src/callback.ts',
        source: 'function test() { console.log(arguments.length) }',
      })
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'length'))

      expect(reports.length).toBe(0)
    })

    test('should detect arguments.caller in nested function', () => {
      const { context, reports } = createMockRuleContext({
        filePath: '/src/nested.ts',
        source: 'function outer() { function inner() { arguments.caller } }',
      })
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'caller'))

      expect(reports.length).toBe(1)
    })

    test('should detect arguments[0] computed access', () => {
      const { context, reports } = createMockRuleContext({
        filePath: '/src/indexed.ts',
        source: 'function test() { return arguments[0] }',
      })
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'arguments' },
        property: { type: 'Literal', value: 0 },
        computed: true,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report object property named caller', () => {
      const { context, reports } = createMockRuleContext({
        filePath: '/src/obj.ts',
        source: 'const obj = { caller: null }; obj.caller',
      })
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('obj', 'caller'))

      expect(reports.length).toBe(0)
    })

    test('should detect in strict mode source', () => {
      const { context, reports } = createMockRuleContext({
        filePath: '/src/strict.ts',
        source: '"use strict"; function test() { arguments.caller }',
      })
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'caller'))

      expect(reports.length).toBe(1)
    })

    test('should detect in TypeScript file', () => {
      const { context, reports } = createMockRuleContext({
        filePath: '/src/types.ts',
        source: 'function test(...args: unknown[]) { arguments.caller }',
      })
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'caller'))

      expect(reports.length).toBe(1)
    })

    test('should detect in class method', () => {
      const { context, reports } = createMockRuleContext({
        filePath: '/src/class.ts',
        source: 'class Foo { method() { arguments.caller } }',
      })
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'caller'))

      expect(reports.length).toBe(1)
    })

    test('should detect in async function', () => {
      const { context, reports } = createMockRuleContext({
        filePath: '/src/async.ts',
        source: 'async function test() { arguments.caller }',
      })
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'caller'))

      expect(reports.length).toBe(1)
    })

    test('should detect in generator function', () => {
      const { context, reports } = createMockRuleContext({
        filePath: '/src/gen.ts',
        source: 'function* test() { arguments.caller }',
      })
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'caller'))

      expect(reports.length).toBe(1)
    })
  })

  describe('arguments-like identifiers that are not arguments', () => {
    test('should not report args.caller', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('args', 'caller'))

      expect(reports.length).toBe(0)
    })

    test('should not report arg.callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arg', 'callee'))

      expect(reports.length).toBe(0)
    })

    test('should not report param.caller', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('param', 'caller'))

      expect(reports.length).toBe(0)
    })

    test('should not report parameters.caller', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('parameters', 'caller'))

      expect(reports.length).toBe(0)
    })

    test('should not report _arguments.caller', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('_arguments', 'caller'))

      expect(reports.length).toBe(0)
    })

    test('should not report arguments2.caller', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments2', 'caller'))

      expect(reports.length).toBe(0)
    })

    test('should not report myArguments.caller', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('myArguments', 'caller'))

      expect(reports.length).toBe(0)
    })

    test('should not report computed access on args', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'args' },
        property: { type: 'Literal', value: 'callee' },
        computed: true,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('node with special object types', () => {
    test('should not report when object is ThisExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'ThisExpression' },
        property: { type: 'Identifier', name: 'caller' },
        computed: false,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when object is FunctionExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'FunctionExpression' },
        property: { type: 'Identifier', name: 'caller' },
        computed: false,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when object is CallExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'CallExpression' },
        property: { type: 'Identifier', name: 'caller' },
        computed: false,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when object is ArrayExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'ArrayExpression' },
        property: { type: 'Identifier', name: 'caller' },
        computed: false,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when object is ObjectExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'ObjectExpression' },
        property: { type: 'Identifier', name: 'caller' },
        computed: false,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when property is CallExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'arguments' },
        property: { type: 'CallExpression' },
        computed: false,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when property is MemberExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'arguments' },
        property: { type: 'MemberExpression' },
        computed: false,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('repeated safe access patterns', () => {
    test('should not report repeated arguments.length accesses', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.MemberExpression(createMemberExpression('arguments', 'length'))
      }

      expect(reports.length).toBe(0)
    })

    test('should not report repeated safe property access on various objects', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const safeObjects = ['obj', 'arr', 'fn', 'config', 'state', 'props', 'data', 'ctx']
      for (const obj of safeObjects) {
        visitor.MemberExpression(createMemberExpression(obj, 'caller'))
        visitor.MemberExpression(createMemberExpression(obj, 'callee'))
      }

      expect(reports.length).toBe(0)
    })
  })

  describe('location edge cases', () => {
    test('should handle node with null loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'arguments' },
        property: { type: 'Identifier', name: 'caller' },
        computed: false,
        loc: null,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle node with undefined loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'arguments' },
        property: { type: 'Identifier', name: 'caller' },
        computed: false,
        loc: undefined,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle node with empty loc object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'arguments' },
        property: { type: 'Identifier', name: 'caller' },
        computed: false,
        loc: {},
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle node with loc containing non-numeric line', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'arguments' },
        property: { type: 'Identifier', name: 'caller' },
        computed: false,
        loc: {
          start: { line: 'five', column: 0 },
          end: { line: 'five', column: 10 },
        },
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle node with loc containing non-numeric column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'arguments' },
        property: { type: 'Identifier', name: 'caller' },
        computed: false,
        loc: {
          start: { line: 5, column: 'zero' },
          end: { line: 5, column: 'ten' },
        },
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  describe('high volume testing', () => {
    test('should correctly report 20 consecutive arguments.caller', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      for (let i = 0; i < 20; i++) {
        visitor.MemberExpression(createMemberExpression('arguments', 'caller', false, i + 1, 0))
      }

      expect(reports.length).toBe(20)
    })

    test('should correctly report 20 consecutive computed arguments accesses', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      for (let i = 0; i < 20; i++) {
        visitor.MemberExpression(createComputedMemberExpression('arguments', i + 1, 0))
      }

      expect(reports.length).toBe(20)
    })

    test('should correctly count in mixed pattern of 30 nodes', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.MemberExpression(createMemberExpression('arguments', 'length'))
        visitor.MemberExpression(createMemberExpression('arguments', 'caller'))
        visitor.MemberExpression(createComputedMemberExpression('arguments'))
      }

      expect(reports.length).toBe(20)
    })

    test('should report 0 violations for 50 safe accesses', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.MemberExpression(createMemberExpression('arguments', 'length'))
        visitor.MemberExpression(createMemberExpression('obj', 'caller'))
      }

      expect(reports.length).toBe(0)
    })
  })

  describe('object name variations that are not "arguments"', () => {
    test('should not report argumentsArray.caller', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('argumentsArray', 'caller'))

      expect(reports.length).toBe(0)
    })

    test('should not report getArguments.caller', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('getArguments', 'caller'))

      expect(reports.length).toBe(0)
    })

    test('should not report theArguments.caller', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('theArguments', 'caller'))

      expect(reports.length).toBe(0)
    })

    test('should not report scope.caller', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('scope', 'caller'))

      expect(reports.length).toBe(0)
    })

    test('should not report context.caller', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('context', 'caller'))

      expect(reports.length).toBe(0)
    })

    test('should not report event.caller', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('event', 'caller'))

      expect(reports.length).toBe(0)
    })

    test('should not report result.caller', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('result', 'caller'))

      expect(reports.length).toBe(0)
    })

    test('should not report item.caller', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('item', 'caller'))

      expect(reports.length).toBe(0)
    })

    test('should not report element.caller', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('element', 'caller'))

      expect(reports.length).toBe(0)
    })
  })
})
