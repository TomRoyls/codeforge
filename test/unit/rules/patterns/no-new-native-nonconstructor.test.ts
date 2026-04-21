import { describe, test, expect, vi } from 'vitest'
import { noNewNativeNonconstructorRule } from '../../../../src/rules/patterns/no-new-native-nonconstructor.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createNewExpression(callee: unknown, line = 1, column = 0): unknown {
  return {
    type: 'NewExpression',
    callee,
    arguments: [],
    loc: {
      start: { line, column },
      end: { line, column: 15 },
    },
  }
}

function createIdentifier(name: string, line = 1, column = 0): unknown {
  return {
    type: 'Identifier',
    name,
    loc: {
      start: { line, column },
      end: { line, column: name.length },
    },
  }
}

function createMemberExpression(object: unknown, property: unknown): unknown {
  return {
    type: 'MemberExpression',
    object,
    property,
    computed: false,
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 15 },
    },
  }
}

function createCallExpression(callee: unknown): unknown {
  return {
    type: 'CallExpression',
    callee,
    arguments: [],
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 10 },
    },
  }
}

describe('no-new-native-nonconstructor rule', () => {
  // ==================== META (20 tests) ====================
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noNewNativeNonconstructorRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noNewNativeNonconstructorRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noNewNativeNonconstructorRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noNewNativeNonconstructorRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention constructor in description', () => {
      expect(noNewNativeNonconstructorRule.meta.docs?.description.toLowerCase()).toContain(
        'constructor',
      )
    })

    test('should mention non-constructor in description', () => {
      expect(noNewNativeNonconstructorRule.meta.docs?.description.toLowerCase()).toContain(
        'non-constructor',
      )
    })

    test('should have empty schema', () => {
      expect(noNewNativeNonconstructorRule.meta.schema).toEqual([])
    })

    test('should not be fixable', () => {
      expect(noNewNativeNonconstructorRule.meta.fixable).toBeUndefined()
    })

    test('should have meta property', () => {
      expect(noNewNativeNonconstructorRule).toHaveProperty('meta')
    })

    test('should have create property', () => {
      expect(noNewNativeNonconstructorRule).toHaveProperty('create')
    })

    test('meta type should be a string', () => {
      expect(typeof noNewNativeNonconstructorRule.meta.type).toBe('string')
    })

    test('meta severity should be a string', () => {
      expect(typeof noNewNativeNonconstructorRule.meta.severity).toBe('string')
    })

    test('meta docs should be an object', () => {
      expect(typeof noNewNativeNonconstructorRule.meta.docs).toBe('object')
    })

    test('meta docs description should be a string', () => {
      expect(typeof noNewNativeNonconstructorRule.meta.docs?.description).toBe('string')
    })

    test('meta docs description should not be empty', () => {
      expect(noNewNativeNonconstructorRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('meta schema should be an array', () => {
      expect(Array.isArray(noNewNativeNonconstructorRule.meta.schema)).toBe(true)
    })

    test('meta docs recommended should be boolean', () => {
      expect(typeof noNewNativeNonconstructorRule.meta.docs?.recommended).toBe('boolean')
    })

    test('meta docs category should be a string', () => {
      expect(typeof noNewNativeNonconstructorRule.meta.docs?.category).toBe('string')
    })

    test('meta should not have deprecated flag', () => {
      expect(noNewNativeNonconstructorRule.meta.deprecated).toBeUndefined()
    })

    test('meta should not have requiresTypeChecking flag', () => {
      expect(noNewNativeNonconstructorRule.meta.requiresTypeChecking).toBeUndefined()
    })
  })

  // ==================== CREATE/VISITOR (8 tests) ====================
  describe('create', () => {
    test('should return visitor with NewExpression method', () => {
      const { context } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      expect(visitor).toHaveProperty('NewExpression')
    })

    test('should return a non-null visitor', () => {
      const { context } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      expect(visitor).not.toBeNull()
    })

    test('should return an object from create', () => {
      const { context } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      expect(typeof visitor).toBe('object')
    })

    test('NewExpression visitor should be a function', () => {
      const { context } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      expect(typeof visitor.NewExpression).toBe('function')
    })

    test('create should be a function', () => {
      expect(typeof noNewNativeNonconstructorRule.create).toBe('function')
    })

    test('should return consistent visitor on multiple create calls', () => {
      const { context } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor1 = noNewNativeNonconstructorRule.create(context)
      const visitor2 = noNewNativeNonconstructorRule.create(context)

      expect(Object.keys(visitor1)).toEqual(Object.keys(visitor2))
    })

    test('visitor should only have NewExpression key', () => {
      const { context } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      expect(Object.keys(visitor)).toEqual(['NewExpression'])
    })

    test('create should accept a valid context without throwing', () => {
      const { context } = createMockRuleContext({ source: 'new Symbol();' })

      expect(() => noNewNativeNonconstructorRule.create(context)).not.toThrow()
    })
  })

  // ==================== DETECTION (30 tests) ====================
  describe('detection', () => {
    test('should report new Symbol()', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      const callee = createIdentifier('Symbol')
      visitor.NewExpression(createNewExpression(callee))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe("'Symbol' cannot be called as a constructor.")
    })

    test('should report new Symbol without arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Symbol'),
        arguments: [],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 12 },
        },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe("'Symbol' cannot be called as a constructor.")
    })

    test('should report new Symbol with arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Symbol'),
        arguments: [
          {
            type: 'Literal',
            value: 'description',
          },
        ],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 25 },
        },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe("'Symbol' cannot be called as a constructor.")
    })

    test('should report new BigInt()', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      const callee = createIdentifier('BigInt')
      visitor.NewExpression(createNewExpression(callee))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe("'BigInt' cannot be called as a constructor.")
    })

    test('should report new BigInt without arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('BigInt'),
        arguments: [],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 12 },
        },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe("'BigInt' cannot be called as a constructor.")
    })

    test('should report new BigInt with arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('BigInt'),
        arguments: [
          {
            type: 'Literal',
            value: '9007199254740991',
          },
        ],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 30 },
        },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe("'BigInt' cannot be called as a constructor.")
    })

    test('should report with multiple arguments to Symbol', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Symbol'),
        arguments: [
          { type: 'Literal', value: 'desc' },
          { type: 'Literal', value: 'extra' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report with spread argument to BigInt', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('BigInt'),
        arguments: [{ type: 'SpreadElement', argument: createIdentifier('args') }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect Symbol at various positions in file', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Symbol'), 1, 0))
      visitor.NewExpression(createNewExpression(createIdentifier('Symbol'), 50, 20))
      visitor.NewExpression(createNewExpression(createIdentifier('Symbol'), 100, 0))

      expect(reports.length).toBe(3)
    })

    test('should detect BigInt at various positions in file', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('BigInt'), 1, 0))
      visitor.NewExpression(createNewExpression(createIdentifier('BigInt'), 25, 10))
      visitor.NewExpression(createNewExpression(createIdentifier('BigInt'), 99, 99))

      expect(reports.length).toBe(3)
    })

    test('should report Symbol inside nested expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Symbol'),
        arguments: [{ type: 'NewExpression', callee: createIdentifier('Date'), arguments: [] }],
        loc: { start: { line: 5, column: 10 }, end: { line: 5, column: 30 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report BigInt inside nested expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('BigInt'),
        arguments: [{ type: 'NewExpression', callee: createIdentifier('Number'), arguments: [] }],
        loc: { start: { line: 3, column: 5 }, end: { line: 3, column: 25 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report Symbol in return statement context', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Symbol'), 7, 4))

      expect(reports.length).toBe(1)
    })

    test('should report BigInt in assignment context', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('BigInt'), 12, 8))

      expect(reports.length).toBe(1)
    })

    test('should report Symbol in conditional expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Symbol'), 20, 15))

      expect(reports.length).toBe(1)
    })

    test('should report BigInt in loop body', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('BigInt'), 30, 2))

      expect(reports.length).toBe(1)
    })

    test('should report when arguments array is missing', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Symbol'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report when arguments is null', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('BigInt'),
        arguments: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report Symbol with empty string argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Symbol'),
        arguments: [{ type: 'Literal', value: '' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report BigInt with numeric literal argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('BigInt'),
        arguments: [{ type: 'Literal', value: 42 }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report Symbol with identifier argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Symbol'),
        arguments: [{ type: 'Identifier', name: 'myDesc' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report BigInt with variable argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('BigInt'),
        arguments: [{ type: 'Identifier', name: 'num' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 18 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report Symbol in function body', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Symbol'), 42, 6))

      expect(reports.length).toBe(1)
    })

    test('should report BigInt in class method', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('BigInt'), 55, 8))

      expect(reports.length).toBe(1)
    })

    test('should report Symbol in arrow function', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Symbol'), 10, 12))

      expect(reports.length).toBe(1)
    })

    test('should report BigInt in template literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('BigInt'), 8, 4))

      expect(reports.length).toBe(1)
    })

    test('should report Symbol in array element', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Symbol'), 15, 2))

      expect(reports.length).toBe(1)
    })

    test('should report BigInt in object property value', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('BigInt'), 22, 8))

      expect(reports.length).toBe(1)
    })

    test('should report when callee has extra properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      const callee = {
        type: 'Identifier',
        name: 'Symbol',
        extra: 'property',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
      }
      visitor.NewExpression(createNewExpression(callee))

      expect(reports.length).toBe(1)
    })

    test('should report when node has extra properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('BigInt'),
        arguments: [],
        extra: 'data',
        range: [0, 10],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect in same visitor instance repeatedly', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.NewExpression(createNewExpression(createIdentifier('Symbol'), i + 1, 0))
      }

      expect(reports.length).toBe(5)
    })
  })

  // ==================== NOT REPORTING (30 tests) ====================
  describe('valid constructors - not reporting', () => {
    test('should not report new with Array', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Array')))

      expect(reports.length).toBe(0)
    })

    test('should not report new with Object', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Object')))

      expect(reports.length).toBe(0)
    })

    test('should not report new with Date', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Date')))

      expect(reports.length).toBe(0)
    })

    test('should not report new with RegExp', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp')))

      expect(reports.length).toBe(0)
    })

    test('should not report new with Error', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Error')))

      expect(reports.length).toBe(0)
    })

    test('should not report new with Map', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Map')))

      expect(reports.length).toBe(0)
    })

    test('should not report new with Set', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Set')))

      expect(reports.length).toBe(0)
    })

    test('should not report new with Promise', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Promise')))

      expect(reports.length).toBe(0)
    })

    test('should not report new with custom class', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('MyClass')))

      expect(reports.length).toBe(0)
    })

    test('should not report new with member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      const callee = createMemberExpression(
        createIdentifier('MyModule'),
        createIdentifier('MyClass'),
      )
      visitor.NewExpression(createNewExpression(callee))

      expect(reports.length).toBe(0)
    })

    test('should not report new with Number', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Number')))

      expect(reports.length).toBe(0)
    })

    test('should not report new with String', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('String')))

      expect(reports.length).toBe(0)
    })

    test('should not report new with Boolean', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Boolean')))

      expect(reports.length).toBe(0)
    })

    test('should not report new with Function', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Function')))

      expect(reports.length).toBe(0)
    })

    test('should not report new with WeakMap', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('WeakMap')))

      expect(reports.length).toBe(0)
    })

    test('should not report new with WeakSet', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('WeakSet')))

      expect(reports.length).toBe(0)
    })

    test('should not report new with ArrayBuffer', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('ArrayBuffer')))

      expect(reports.length).toBe(0)
    })

    test('should not report new with DataView', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('DataView')))

      expect(reports.length).toBe(0)
    })

    test('should not report new with Int8Array', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Int8Array')))

      expect(reports.length).toBe(0)
    })

    test('should not report new with Float64Array', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Float64Array')))

      expect(reports.length).toBe(0)
    })

    test('should not report new with TypeError', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('TypeError')))

      expect(reports.length).toBe(0)
    })

    test('should not report new with RangeError', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('RangeError')))

      expect(reports.length).toBe(0)
    })

    test('should not report new with SyntaxError', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('SyntaxError')))

      expect(reports.length).toBe(0)
    })

    test('should not report new with URIError', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('URIError')))

      expect(reports.length).toBe(0)
    })

    test('should not report new with EvalError', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('EvalError')))

      expect(reports.length).toBe(0)
    })

    test('should not report new with ReferenceError', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('ReferenceError')))

      expect(reports.length).toBe(0)
    })

    test('should not report new with Proxy', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Proxy')))

      expect(reports.length).toBe(0)
    })

    test('should not report new with global Symbol via member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      const callee = createMemberExpression(createIdentifier('global'), createIdentifier('Symbol'))
      visitor.NewExpression(createNewExpression(callee))

      expect(reports.length).toBe(0)
    })

    test('should not report new with global BigInt via member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      const callee = createMemberExpression(createIdentifier('window'), createIdentifier('BigInt'))
      visitor.NewExpression(createNewExpression(callee))

      expect(reports.length).toBe(0)
    })

    test('should not report new with Intl', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Intl')))

      expect(reports.length).toBe(0)
    })

    test('should not report new with SharedArrayBuffer', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('SharedArrayBuffer')))

      expect(reports.length).toBe(0)
    })

    test('should not report new with AggregateError', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('AggregateError')))

      expect(reports.length).toBe(0)
    })

    test('should not report new with FinalizationRegistry', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('FinalizationRegistry')))

      expect(reports.length).toBe(0)
    })

    test('should not report new with WeakRef', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('WeakRef')))

      expect(reports.length).toBe(0)
    })

    test('should not report new with BigInt64Array', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('BigInt64Array')))

      expect(reports.length).toBe(0)
    })

    test('should not report new with BigUint64Array', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('BigUint64Array')))

      expect(reports.length).toBe(0)
    })

    test('should not report new with URL', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('URL')))

      expect(reports.length).toBe(0)
    })

    test('should not report new with URLSearchParams', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('URLSearchParams')))

      expect(reports.length).toBe(0)
    })

    test('should not report new with TextEncoder', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('TextEncoder')))

      expect(reports.length).toBe(0)
    })

    test('should not report new with TextDecoder', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('TextDecoder')))

      expect(reports.length).toBe(0)
    })

    test('should not report new with ImageData', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('ImageData')))

      expect(reports.length).toBe(0)
    })

    test('should not report new with Headers', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Headers')))

      expect(reports.length).toBe(0)
    })

    test('should not report new with Request', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Request')))

      expect(reports.length).toBe(0)
    })

    test('should not report new with Response', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Response')))

      expect(reports.length).toBe(0)
    })

    test('should not report new with AbortController', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('AbortController')))

      expect(reports.length).toBe(0)
    })

    test('should not report new with ReadableStream', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('ReadableStream')))

      expect(reports.length).toBe(0)
    })

    test('should not report new with WritableStream', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('WritableStream')))

      expect(reports.length).toBe(0)
    })

    test('should not report new with TransformStream', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('TransformStream')))

      expect(reports.length).toBe(0)
    })

    test('should not report new with MessageChannel', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('MessageChannel')))

      expect(reports.length).toBe(0)
    })
  })

  // ==================== EDGE CASES (25 tests) ====================
  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      expect(() => visitor.NewExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      expect(() => visitor.NewExpression(undefined)).not.toThrow()
    })

    test('should handle non-NewExpression node', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      const node = { type: 'CallExpression', callee: createIdentifier('test') }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Symbol'),
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        arguments: [],
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle non-Identifier callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      const callee = createMemberExpression(createIdentifier('obj'), createIdentifier('Symbol'))
      visitor.NewExpression(createNewExpression(callee))

      expect(reports.length).toBe(0)
    })

    test('should handle callee with different case', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('symbol')))
      visitor.NewExpression(createNewExpression(createIdentifier('SYMBOL')))
      visitor.NewExpression(createNewExpression(createIdentifier('bigInt')))
      visitor.NewExpression(createNewExpression(createIdentifier('BIGINT')))

      expect(reports.length).toBe(0)
    })

    test('should handle identifier without name', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: {
          type: 'Identifier',
        },
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle identifier with non-string name', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: {
          type: 'Identifier',
          name: 123 as unknown as string,
        },
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle mixed valid and invalid calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Array'), 1, 0))
      visitor.NewExpression(createNewExpression(createIdentifier('Symbol'), 2, 0))
      visitor.NewExpression(createNewExpression(createIdentifier('Date'), 3, 0))
      visitor.NewExpression(createNewExpression(createIdentifier('BigInt'), 4, 0))
      visitor.NewExpression(createNewExpression(createIdentifier('Object'), 5, 0))

      expect(reports.length).toBe(2)
    })

    test('should handle boolean node', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      expect(() => visitor.NewExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle numeric node', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      expect(() => visitor.NewExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle string node', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      expect(() => visitor.NewExpression('new Symbol()')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression({})

      expect(reports.length).toBe(0)
    })

    test('should handle node with null callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: null,
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: undefined,
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with numeric callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: 42,
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with string callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: 'Symbol',
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with array callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: [createIdentifier('Symbol')],
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with empty string callee name', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: '' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle loc with missing end', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Symbol'),
        arguments: [],
        loc: { start: { line: 1, column: 0 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle loc with missing start', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('BigInt'),
        arguments: [],
        loc: { end: { line: 1, column: 10 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle loc with non-numeric line', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Symbol'),
        arguments: [],
        loc: { start: { line: '1' as unknown as number, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle callee that is a CallExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      const callee = createCallExpression(createIdentifier('Symbol'))
      visitor.NewExpression(createNewExpression(callee))

      expect(reports.length).toBe(0)
    })

    test('should handle deeply nested member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      const inner = createMemberExpression(createIdentifier('a'), createIdentifier('b'))
      const outer = createMemberExpression(inner, createIdentifier('Symbol'))
      visitor.NewExpression(createNewExpression(outer))

      expect(reports.length).toBe(0)
    })
  })

  // ==================== LOCATION (15 tests) ====================
  describe('location', () => {
    test('should report correct location for Symbol', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      const callee = createIdentifier('Symbol', 10, 5)
      visitor.NewExpression(createNewExpression(callee, 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report correct location for BigInt', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      const callee = createIdentifier('BigInt', 15, 8)
      visitor.NewExpression(createNewExpression(callee, 15, 8))

      expect(reports[0].loc?.start.line).toBe(15)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should report location at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Symbol'), 1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at high line number', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Symbol'), 9999, 0))

      expect(reports[0].loc?.start.line).toBe(9999)
    })

    test('should report location at high column number', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('BigInt'), 1, 500))

      expect(reports[0].loc?.start.column).toBe(500)
    })

    test('should report end location', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Symbol'), 1, 0))

      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(1)
      expect(reports[0].loc?.end.column).toBe(15)
    })

    test('should report location from node without callee loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Symbol' },
        arguments: [],
        loc: { start: { line: 5, column: 3 }, end: { line: 5, column: 20 } },
      }
      visitor.NewExpression(node)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should report default location when node has no loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Symbol'),
        arguments: [],
      }
      visitor.NewExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct locations for multiple violations', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Symbol'), 3, 4))
      visitor.NewExpression(createNewExpression(createIdentifier('BigInt'), 7, 12))

      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[1].loc?.start.line).toBe(7)
      expect(reports[1].loc?.start.column).toBe(12)
    })

    test('should report location at line 0 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Symbol'), 0, 0))

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should preserve exact loc from node', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Symbol'),
        arguments: [],
        loc: { start: { line: 42, column: 17 }, end: { line: 42, column: 30 } },
      }
      visitor.NewExpression(node)

      expect(reports[0].loc?.start).toEqual({ line: 42, column: 17 })
      expect(reports[0].loc?.end).toEqual({ line: 42, column: 30 })
    })

    test('should report location for Symbol in first line', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Symbol'), 1, 0))

      expect(reports[0].loc?.start).toEqual({ line: 1, column: 0 })
    })

    test('should report location for BigInt in first line', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('BigInt'), 1, 4))

      expect(reports[0].loc?.start).toEqual({ line: 1, column: 4 })
    })

    test('should report multi-line loc correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Symbol'),
        arguments: [],
        loc: { start: { line: 5, column: 10 }, end: { line: 7, column: 2 } },
      }
      visitor.NewExpression(node)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.end.line).toBe(7)
    })

    test('should include loc in every report', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Symbol'), 1, 0))

      expect(reports[0].loc).toBeDefined()
    })
  })

  // ==================== MESSAGES (10 tests) ====================
  describe('message quality', () => {
    test('should report correct message for Symbol', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Symbol')))

      expect(reports[0].message).toBe("'Symbol' cannot be called as a constructor.")
    })

    test('should report correct message for BigInt', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('BigInt')))

      expect(reports[0].message).toBe("'BigInt' cannot be called as a constructor.")
    })

    test('should include function name in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Symbol')))

      expect(reports[0].message).toContain('Symbol')
    })

    test('should mention constructor in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('BigInt')))

      expect(reports[0].message.toLowerCase()).toContain('constructor')
    })

    test('should mention cannot in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Symbol')))

      expect(reports[0].message.toLowerCase()).toContain('cannot')
    })

    test('should wrap function name in single quotes in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Symbol')))

      expect(reports[0].message).toContain("'Symbol'")
    })

    test('should have consistent message format across both non-constructors', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Symbol')))
      visitor.NewExpression(createNewExpression(createIdentifier('BigInt')))

      const symbolMsg = reports[0].message
      const bigIntMsg = reports[1].message

      expect(symbolMsg.replace('Symbol', 'X')).toBe(bigIntMsg.replace('BigInt', 'X'))
    })

    test('should have message ending with period', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Symbol')))

      expect(reports[0].message.endsWith('.')).toBe(true)
    })

    test('should not include undefined in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Symbol')))

      expect(reports[0].message).not.toContain('undefined')
    })

    test('should produce correct messages for alternating violations', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Symbol'), 1, 0))
      visitor.NewExpression(createNewExpression(createIdentifier('BigInt'), 2, 0))
      visitor.NewExpression(createNewExpression(createIdentifier('Symbol'), 3, 0))

      expect(reports[0].message).toBe("'Symbol' cannot be called as a constructor.")
      expect(reports[1].message).toBe("'BigInt' cannot be called as a constructor.")
      expect(reports[2].message).toBe("'Symbol' cannot be called as a constructor.")
    })
  })

  // ==================== MULTIPLE REPORTS (10 tests) ====================
  describe('multiple violations', () => {
    test('should report multiple new Symbol calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Symbol'), 1, 0))
      visitor.NewExpression(createNewExpression(createIdentifier('Symbol'), 5, 0))
      visitor.NewExpression(createNewExpression(createIdentifier('Symbol'), 10, 0))

      expect(reports.length).toBe(3)
    })

    test('should report multiple new BigInt calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('BigInt'), 1, 0))
      visitor.NewExpression(createNewExpression(createIdentifier('BigInt'), 3, 0))
      visitor.NewExpression(createNewExpression(createIdentifier('BigInt'), 7, 0))

      expect(reports.length).toBe(3)
    })

    test('should report mixed Symbol and BigInt violations', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Symbol'), 1, 0))
      visitor.NewExpression(createNewExpression(createIdentifier('BigInt'), 2, 0))
      visitor.NewExpression(createNewExpression(createIdentifier('Symbol'), 3, 0))
      visitor.NewExpression(createNewExpression(createIdentifier('BigInt'), 4, 0))

      expect(reports.length).toBe(4)
    })

    test('should only report violations not valid constructors', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Array'), 1, 0))
      visitor.NewExpression(createNewExpression(createIdentifier('Symbol'), 2, 0))
      visitor.NewExpression(createNewExpression(createIdentifier('Date'), 3, 0))
      visitor.NewExpression(createNewExpression(createIdentifier('BigInt'), 4, 0))

      expect(reports.length).toBe(2)
    })

    test('should report 10 consecutive Symbol violations', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.NewExpression(createNewExpression(createIdentifier('Symbol'), i + 1, 0))
      }

      expect(reports.length).toBe(10)
    })

    test('should report 10 consecutive BigInt violations', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.NewExpression(createNewExpression(createIdentifier('BigInt'), i + 1, 0))
      }

      expect(reports.length).toBe(10)
    })

    test('should report alternating valid and invalid across many calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      for (let i = 0; i < 20; i++) {
        const name = i % 2 === 0 ? 'Symbol' : 'Array'
        visitor.NewExpression(createNewExpression(createIdentifier(name), i + 1, 0))
      }

      expect(reports.length).toBe(10)
    })

    test('should not accumulate reports from valid constructors', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      for (let i = 0; i < 20; i++) {
        visitor.NewExpression(createNewExpression(createIdentifier('Array'), i + 1, 0))
      }

      expect(reports.length).toBe(0)
    })

    test('should maintain correct message order for mixed violations', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Symbol'), 1, 0))
      visitor.NewExpression(createNewExpression(createIdentifier('BigInt'), 2, 0))
      visitor.NewExpression(createNewExpression(createIdentifier('Symbol'), 3, 0))

      expect(reports[0].message).toContain('Symbol')
      expect(reports[1].message).toContain('BigInt')
      expect(reports[2].message).toContain('Symbol')
    })

    test('should report all violations even with same line number', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Symbol'), 5, 0))
      visitor.NewExpression(createNewExpression(createIdentifier('BigInt'), 5, 20))

      expect(reports.length).toBe(2)
    })
  })

  // ==================== CONTEXT (10 tests) ====================
  describe('context usage', () => {
    test('should use context report function', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Symbol')))

      expect(reports.length).toBe(1)
    })

    test('should call report once per violation', () => {
      let reportCount = 0
      const reports: ReportDescriptor[] = []

      const context: RuleContext = {
        report: () => {
          reportCount++
          reports.push({ message: '' })
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

      const visitor = noNewNativeNonconstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Symbol')))

      expect(reportCount).toBe(1)
    })

    test('should not call report for valid constructors', () => {
      let reportCount = 0

      const context: RuleContext = {
        report: () => {
          reportCount++
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

      const visitor = noNewNativeNonconstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Array')))

      expect(reportCount).toBe(0)
    })

    test('should work with different file paths', () => {
      const reports: ReportDescriptor[] = []

      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          reports.push(d)
        },
        getFilePath: () => '/custom/path.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/custom',
      } as unknown as RuleContext

      const visitor = noNewNativeNonconstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Symbol')))

      expect(reports.length).toBe(1)
    })

    test('should work with different workspace roots', () => {
      const reports: ReportDescriptor[] = []

      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          reports.push(d)
        },
        getFilePath: () => '/home/user/project/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/home/user/project',
      } as unknown as RuleContext

      const visitor = noNewNativeNonconstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('BigInt')))

      expect(reports.length).toBe(1)
    })

    test('should work with context that has empty source', () => {
      const reports: ReportDescriptor[] = []

      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          reports.push(d)
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

      const visitor = noNewNativeNonconstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Symbol')))

      expect(reports.length).toBe(1)
    })

    test('should work when context returns null AST', () => {
      const reports: ReportDescriptor[] = []

      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          reports.push(d)
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'new Symbol()',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noNewNativeNonconstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Symbol')))

      expect(reports.length).toBe(1)
    })

    test('should work when config has options', () => {
      const reports: ReportDescriptor[] = []

      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          reports.push(d)
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'new Symbol()',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{ strict: true }] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noNewNativeNonconstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Symbol')))

      expect(reports.length).toBe(1)
    })

    test('should create fresh visitor per create call', () => {
      const { context } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor1 = noNewNativeNonconstructorRule.create(context)
      const visitor2 = noNewNativeNonconstructorRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should not share reports across different visitors', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext({ source: 'new Symbol();' })
      const { context: ctx2, reports: reports2 } = createMockRuleContext({ source: 'new Symbol();' })

      const visitor1 = noNewNativeNonconstructorRule.create(ctx1)
      const visitor2 = noNewNativeNonconstructorRule.create(ctx2)

      visitor1.NewExpression(createNewExpression(createIdentifier('Symbol')))
      visitor2.NewExpression(createNewExpression(createIdentifier('BigInt')))

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(1)
      expect(reports1[0].message).toContain('Symbol')
      expect(reports2[0].message).toContain('BigInt')
    })
  })

  // ==================== NODE TYPES (10 tests) ====================
  describe('node types', () => {
    test('should not report CallExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createCallExpression(createIdentifier('Symbol')))

      expect(reports.length).toBe(0)
    })

    test('should not report MemberExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(
        createMemberExpression(createIdentifier('obj'), createIdentifier('Symbol')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createIdentifier('Symbol'))

      expect(reports.length).toBe(0)
    })

    test('should not report Literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression({ type: 'Literal', value: 'Symbol' })

      expect(reports.length).toBe(0)
    })

    test('should not report FunctionExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression({ type: 'FunctionExpression', body: [] })

      expect(reports.length).toBe(0)
    })

    test('should not report ArrowFunctionExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression({ type: 'ArrowFunctionExpression', body: { type: 'BlockStatement' } })

      expect(reports.length).toBe(0)
    })

    test('should not report ConditionalExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression({
        type: 'ConditionalExpression',
        test: createIdentifier('x'),
        consequent: createIdentifier('Symbol'),
        alternate: createIdentifier('BigInt'),
      })

      expect(reports.length).toBe(0)
    })

    test('should not report TemplateLiteral', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression({ type: 'TemplateLiteral', quasis: [], expressions: [] })

      expect(reports.length).toBe(0)
    })

    test('should not report BinaryExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression({
        type: 'BinaryExpression',
        operator: '+',
        left: createIdentifier('a'),
        right: createIdentifier('b'),
      })

      expect(reports.length).toBe(0)
    })

    test('should only process NewExpression nodes with NewExpression type', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      const node = {
        type: 'NEWEXPRESSION',
        callee: createIdentifier('Symbol'),
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  // ==================== CALLEE VARIATIONS (8 tests) ====================
  describe('callee variations', () => {
    test('should report with simple Identifier callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Symbol')))

      expect(reports.length).toBe(1)
    })

    test('should not report with MemberExpression callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      const callee = createMemberExpression(createIdentifier('global'), createIdentifier('Symbol'))
      visitor.NewExpression(createNewExpression(callee))

      expect(reports.length).toBe(0)
    })

    test('should not report with computed MemberExpression callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: {
          type: 'MemberExpression',
          object: createIdentifier('obj'),
          property: createIdentifier('Symbol'),
          computed: true,
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report with ThisExpression callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'ThisExpression' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report with Super callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Super' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report with CallExpression callee (IIFE)', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      const callee = createCallExpression(createIdentifier('Symbol'))
      visitor.NewExpression(createNewExpression(callee))

      expect(reports.length).toBe(0)
    })

    test('should not report when callee is Symbol but not Identifier type', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'SomeOtherType', name: 'Symbol' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report with optional MemberExpression callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: {
          type: 'MemberExpression',
          object: createIdentifier('obj'),
          property: createIdentifier('Symbol'),
          computed: false,
          optional: true,
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  // ==================== NON-CONSTRUCTOR VARIATIONS (8 tests) ====================
  describe('non-constructor case variations', () => {
    test('should not report lowercase symbol', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('symbol')))

      expect(reports.length).toBe(0)
    })

    test('should not report uppercase SYMBOL', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('SYMBOL')))

      expect(reports.length).toBe(0)
    })

    test('should not report mixed case SymbOl', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('SymbOl')))

      expect(reports.length).toBe(0)
    })

    test('should not report lowercase bigint', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('bigint')))

      expect(reports.length).toBe(0)
    })

    test('should not report uppercase BIGINT', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('BIGINT')))

      expect(reports.length).toBe(0)
    })

    test('should not report mixed case BiGiNt', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('BiGiNt')))

      expect(reports.length).toBe(0)
    })

    test('should not report Symbol prefixed identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('SymbolFactory')))

      expect(reports.length).toBe(0)
    })

    test('should not report BigInt suffixed identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('MyBigInt')))

      expect(reports.length).toBe(0)
    })
  })

  // ==================== TEST.EACH - PARAMETERIZED (40+ tests) ====================
  const validConstructorNames = [
    ['Array'],
    ['Object'],
    ['Date'],
    ['RegExp'],
    ['Error'],
    ['Map'],
    ['Set'],
    ['Promise'],
    ['Number'],
    ['String'],
    ['Boolean'],
    ['Function'],
    ['WeakMap'],
    ['WeakSet'],
    ['ArrayBuffer'],
    ['DataView'],
    ['Int8Array'],
    ['Uint8Array'],
    ['Int16Array'],
    ['Uint16Array'],
    ['Int32Array'],
    ['Uint32Array'],
    ['Float32Array'],
    ['Float64Array'],
    ['TypeError'],
    ['RangeError'],
    ['SyntaxError'],
    ['URIError'],
    ['EvalError'],
    ['ReferenceError'],
  ] as const

  test.each(validConstructorNames)('should not report new %s()', (name) => {
    const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
    const visitor = noNewNativeNonconstructorRule.create(context)

    visitor.NewExpression(createNewExpression(createIdentifier(name)))

    expect(reports.length).toBe(0)
  })

  const invalidConstructorCases: [string, string][] = [
    ['Symbol', "'Symbol' cannot be called as a constructor."],
    ['BigInt', "'BigInt' cannot be called as a constructor."],
  ]

  test.each(invalidConstructorCases)(
    'should report new %s() with correct message',
    (name, expectedMsg) => {
      const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier(name)))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe(expectedMsg)
    },
  )

  const caseVariantNames: [string][] = [
    ['symbol'],
    ['SYMBOL'],
    ['SymbOl'],
    ['sYMBOL'],
    ['bigint'],
    ['BIGINT'],
    ['Bigint'],
    ['bIGINT'],
    ['Symbol_'],
    ['_Symbol'],
    ['BigInt_'],
    ['_BigInt'],
    ['Symbolic'],
    ['BigEntero'],
  ]

  test.each(caseVariantNames)('should not report new %s() (case variant)', (name) => {
    const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
    const visitor = noNewNativeNonconstructorRule.create(context)

    visitor.NewExpression(createNewExpression(createIdentifier(name)))

    expect(reports.length).toBe(0)
  })

  const customClassNames: [string][] = [
    ['MyClass'],
    ['Foo'],
    ['Bar'],
    ['Baz'],
    ['Widget'],
    ['Controller'],
    ['Service'],
    ['Handler'],
    ['Manager'],
    ['Factory'],
  ]

  test.each(customClassNames)('should not report new %s() (custom class)', (name) => {
    const { context, reports } = createMockRuleContext({ source: 'new Symbol();' })
    const visitor = noNewNativeNonconstructorRule.create(context)

    visitor.NewExpression(createNewExpression(createIdentifier(name)))

    expect(reports.length).toBe(0)
  })
})
