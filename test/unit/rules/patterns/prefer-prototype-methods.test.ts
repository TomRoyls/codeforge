import { describe, test, expect, vi } from 'vitest'
import { preferPrototypeMethodsRule } from '../../../../src/rules/patterns/prefer-prototype-methods.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  fix?: { range: readonly [number, number]; text: string }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'Array.prototype.slice.call(arguments);',
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
        fix: descriptor.fix,
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

function createCallExpression(callee: unknown, args: unknown[], line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee,
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
    range: [column, column + 30],
  }
}

function createMemberExpression(object: unknown, property: string): unknown {
  return {
    type: 'MemberExpression',
    object,
    property: {
      type: 'Identifier',
      name: property,
    },
  }
}

function createIdentifier(name: string, startPos = 0, endPos = 0): unknown {
  return {
    type: 'Identifier',
    name,
    range: [startPos, endPos > startPos ? endPos : startPos + name.length],
  }
}

function createArrayPrototypeSliceCall(
  args: unknown[],
  line = 1,
  column = 0,
  fullRange = [0, 40],
): unknown {
  const arrayPrototype = createMemberExpression(createIdentifier('Array'), 'prototype')
  const sliceMethod = createMemberExpression(arrayPrototype, 'slice')
  const call = createCallExpression(createMemberExpression(sliceMethod, 'call'), args, line, column)
  return {
    type: 'CallExpression',
    callee: (call as Record<string, unknown>).callee,
    arguments: args,
    loc: (call as Record<string, unknown>).loc,
    range: fullRange,
  }
}

function createObjectPrototypeHasOwnPropertyCall(
  args: unknown[],
  line = 1,
  column = 0,
  fullRange = [0, 50],
): unknown {
  const objectPrototype = createMemberExpression(createIdentifier('Object'), 'prototype')
  const hasOwnPropertyMethod = createMemberExpression(objectPrototype, 'hasOwnProperty')
  const call = createCallExpression(
    createMemberExpression(hasOwnPropertyMethod, 'call'),
    args,
    line,
    column,
  )
  return {
    type: 'CallExpression',
    callee: (call as Record<string, unknown>).callee,
    arguments: args,
    loc: (call as Record<string, unknown>).loc,
    range: fullRange,
  }
}

describe('prefer-prototype-methods rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferPrototypeMethodsRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferPrototypeMethodsRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(preferPrototypeMethodsRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(preferPrototypeMethodsRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(preferPrototypeMethodsRule.meta.schema).toEqual([])
    })

    test('should be fixable', () => {
      expect(preferPrototypeMethodsRule.meta.fixable).toBe('code')
    })

    test('should have description mentioning spread and Object.hasOwn', () => {
      const desc = preferPrototypeMethodsRule.meta.docs?.description.toLowerCase()
      expect(desc).toContain('spread syntax')
      expect(desc).toContain('array.prototype.slice')
      expect(desc).toContain('object.hasown')
    })

    test('should have url defined', () => {
      expect(preferPrototypeMethodsRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/prefer-prototype-methods',
      )
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })
  })

  describe('detecting Array.prototype.slice.call()', () => {
    test('should report Array.prototype.slice.call(arr)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall([createIdentifier('arr')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('spread syntax')
      expect(reports[0].message).toContain('Array.prototype.slice.call()')
    })

    test('should report Array.prototype.slice.call(arguments)', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'Array.prototype.slice.call(arguments);',
      )
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall([createIdentifier('arguments')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('[...arr]')
    })

    test('should report Array.prototype.slice.call(arr, 1)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall([
        createIdentifier('arr'),
        createIdentifier('start'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('spread syntax')
    })

    test('should report Array.prototype.slice.call(arr, 0, 5)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall([
        createIdentifier('arr'),
        createIdentifier('start'),
        createIdentifier('end'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('spread syntax')
    })

    test('should provide fix for Array.prototype.slice.call(arr)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall([createIdentifier('arr')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('spread syntax')
    })

    test('should provide fix for Array.prototype.slice.call(arr, start)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall([
        createIdentifier('arr'),
        createIdentifier('start'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('spread syntax')
    })

    test('should provide fix for Array.prototype.slice.call(arr, start, end)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall([
        createIdentifier('arr'),
        createIdentifier('start'),
        createIdentifier('end'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('spread syntax')
    })

    test('should not provide fix when no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall([])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })
  })

  describe('detecting Object.prototype.hasOwnProperty.call()', () => {
    test('should report Object.prototype.hasOwnProperty.call(obj, prop)', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'Object.prototype.hasOwnProperty.call(obj, prop);',
      )
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createObjectPrototypeHasOwnPropertyCall([
        createIdentifier('obj'),
        createIdentifier('prop'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Object.hasOwn()')
      expect(reports[0].message).toContain('Object.prototype.hasOwnProperty.call()')
    })

    test('should report Object.prototype.hasOwnProperty.call(config, key)', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'Object.prototype.hasOwnProperty.call(config, key);',
      )
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createObjectPrototypeHasOwnPropertyCall([
        createIdentifier('config'),
        createIdentifier('key'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Object.hasOwn(obj, prop)')
    })

    test('should provide fix for Object.prototype.hasOwnProperty.call(obj, prop)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createObjectPrototypeHasOwnPropertyCall([
        createIdentifier('obj'),
        createIdentifier('prop'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Object.hasOwn')
    })

    test('should provide fix for Object.prototype.hasOwnProperty.call(config, "key")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createObjectPrototypeHasOwnPropertyCall([
        createIdentifier('config'),
        { type: 'Literal', value: 'key', range: [48, 53] },
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Object.hasOwn')
    })

    test('should not provide fix when arguments missing', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createObjectPrototypeHasOwnPropertyCall([createIdentifier('obj')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })

    test('should not provide fix when no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createObjectPrototypeHasOwnPropertyCall([])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })
  })

  describe('not reporting valid code', () => {
    test('should not report Array.from()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const callee = createMemberExpression(createIdentifier('Array'), 'from')
      const node = createCallExpression(callee, [createIdentifier('arguments')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Object.hasOwn()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const callee = createMemberExpression(createIdentifier('Object'), 'hasOwn')
      const node = createCallExpression(callee, [createIdentifier('obj'), createIdentifier('prop')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report arr.slice()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'slice')
      const node = createCallExpression(callee, [createIdentifier('0'), createIdentifier('5')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not spread operator [...arr]', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createCallExpression(createIdentifier('spread'), [createIdentifier('arr')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Array.prototype.splice.call()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const arrayPrototype = createMemberExpression(createIdentifier('Array'), 'prototype')
      const spliceMethod = createMemberExpression(arrayPrototype, 'splice')
      const node = createCallExpression(createMemberExpression(spliceMethod, 'call'), [
        createIdentifier('arr'),
        createIdentifier('0'),
        createIdentifier('1'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Object.prototype.keys.call()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const objectPrototype = createMemberExpression(createIdentifier('Object'), 'prototype')
      const keysMethod = createMemberExpression(objectPrototype, 'keys')
      const node = createCallExpression(createMemberExpression(keysMethod, 'call'), [
        createIdentifier('obj'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Function.prototype.call()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const functionPrototype = createMemberExpression(createIdentifier('Function'), 'prototype')
      const callMethod = createMemberExpression(functionPrototype, 'call')
      const node = createCallExpression(callMethod, [createIdentifier('obj')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report regular function calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createCallExpression(createIdentifier('myFunction'), [
        createIdentifier('arg1'),
        createIdentifier('arg2'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: createMemberExpression(
          createMemberExpression(createIdentifier('Array'), 'prototype'),
          'slice',
        ),
        arguments: [createIdentifier('arr')],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without range', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: createMemberExpression(
          createMemberExpression(
            createMemberExpression(createIdentifier('Array'), 'prototype'),
            'slice',
          ),
          'call',
        ),
        arguments: [createIdentifier('arr')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall([createIdentifier('arr')], 10, 5)

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = preferPrototypeMethodsRule.create(context)

      visitor.CallExpression(createArrayPrototypeSliceCall([createIdentifier('arr')]))

      expect(reports.length).toBe(1)
    })

    test('should handle missing range in arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall([
        { type: 'Identifier', name: 'arr' }, // No range
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })
  })

  describe('message quality', () => {
    test('should mention spread syntax in Array.slice message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      visitor.CallExpression(createArrayPrototypeSliceCall([createIdentifier('arr')]))

      expect(reports[0].message.toLowerCase()).toContain('spread syntax')
      expect(reports[0].message).toContain('[...arr]')
    })

    test('should mention Object.hasOwn in hasOwnProperty message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      visitor.CallExpression(
        createObjectPrototypeHasOwnPropertyCall([
          createIdentifier('obj'),
          createIdentifier('prop'),
        ]),
      )

      expect(reports[0].message).toContain('Object.hasOwn')
      expect(reports[0].message).toContain('Object.hasOwn(obj, prop)')
    })
  })

  describe('isPrototypeMethodCall edge cases', () => {
    test('should not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: null,
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when callee is not MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createCallExpression(createIdentifier('func'), [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when property type is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const callee = {
        type: 'MemberExpression',
        object: createMemberExpression(
          createMemberExpression(createIdentifier('Array'), 'prototype'),
          'slice',
        ),
        property: { type: 'Literal', value: 'call' },
      }
      const node = createCallExpression(callee, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when property name is not call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const arrayPrototype = createMemberExpression(createIdentifier('Array'), 'prototype')
      const sliceMethod = createMemberExpression(arrayPrototype, 'slice')
      const callee = createMemberExpression(sliceMethod, 'bind')
      const node = createCallExpression(callee, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when method callee object is not MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const callee = createMemberExpression(createIdentifier('slice'), 'call')
      const node = createCallExpression(callee, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when method property is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const callee = {
        type: 'MemberExpression',
        object: createMemberExpression(createIdentifier('Array'), 'prototype'),
        property: { type: 'Literal', value: 'slice' },
      }
      const node = createCallExpression(createMemberExpression(callee, 'call'), [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when method name is wrong', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const arrayPrototype = createMemberExpression(createIdentifier('Array'), 'prototype')
      const spliceMethod = createMemberExpression(arrayPrototype, 'splice')
      const node = createCallExpression(createMemberExpression(spliceMethod, 'call'), [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when prototype callee is not MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const callee = {
        type: 'MemberExpression',
        object: createIdentifier('Array'),
        property: { type: 'Identifier', name: 'slice' },
      }
      const node = createCallExpression(createMemberExpression(callee, 'call'), [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when prototype property is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const callee = {
        type: 'MemberExpression',
        object: {
          type: 'MemberExpression',
          object: createIdentifier('Array'),
          property: { type: 'Literal', value: 'prototype' },
        },
        property: { type: 'Identifier', name: 'slice' },
      }
      const node = createCallExpression(createMemberExpression(callee, 'call'), [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when prototype property name is not prototype', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const arrayProto = createMemberExpression(createIdentifier('Array'), 'proto')
      const sliceMethod = createMemberExpression(arrayProto, 'slice')
      const node = createCallExpression(createMemberExpression(sliceMethod, 'call'), [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when object identifier is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const callee = {
        type: 'MemberExpression',
        object: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'Array' },
          property: { type: 'Identifier', name: 'prototype' },
        },
        property: { type: 'Identifier', name: 'slice' },
      }
      const node = createCallExpression(createMemberExpression(callee, 'call'), [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when object identifier name is wrong', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const myArrayPrototype = createMemberExpression(createIdentifier('MyArray'), 'prototype')
      const sliceMethod = createMemberExpression(myArrayPrototype, 'slice')
      const node = createCallExpression(createMemberExpression(sliceMethod, 'call'), [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('different object types', () => {
    test('should only report Array.prototype.slice.call()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      // String.prototype.slice.call() should not be reported
      const stringPrototype = createMemberExpression(createIdentifier('String'), 'prototype')
      const sliceMethod = createMemberExpression(stringPrototype, 'slice')
      const node = createCallExpression(createMemberExpression(sliceMethod, 'call'), [
        createIdentifier('str'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should only report Object.prototype.hasOwnProperty.call()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      // Object.prototype.toString.call() should not be reported
      const objectPrototype = createMemberExpression(createIdentifier('Object'), 'prototype')
      const toStringMethod = createMemberExpression(objectPrototype, 'toString')
      const node = createCallExpression(createMemberExpression(toStringMethod, 'call'), [
        createIdentifier('obj'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })
})
