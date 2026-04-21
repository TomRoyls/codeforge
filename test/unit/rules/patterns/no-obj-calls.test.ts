import { describe, test, expect } from 'vitest'
import { noObjCallsRule } from '../../../../src/rules/patterns/no-obj-calls.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createCallExpression(callee: unknown, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee,
    arguments: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 5 },
    },
  }
}

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

function createMemberExpression(object: unknown, property: string): unknown {
  return {
    type: 'MemberExpression',
    object,
    property: createIdentifier(property),
    computed: false,
  }
}

function createNonCallExpression(): unknown {
  return {
    type: 'ExpressionStatement',
    expression: createIdentifier('x'),
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 1 },
    },
  }
}

describe('no-obj-calls rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noObjCallsRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noObjCallsRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noObjCallsRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noObjCallsRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention global object in description', () => {
      expect(noObjCallsRule.meta.docs?.description.toLowerCase()).toContain('global')
    })
  })

  describe('create', () => {
    test('should return visitor with CallExpression method', () => {
      const { context } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })
  })

  describe('detecting Math calls', () => {
    test('should report Math() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Math')))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Math')
      expect(reports[0].message).toContain('not a function')
    })

    test('should report Math call with correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Math'), 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })
  })

  describe('detecting JSON calls', () => {
    test('should report JSON() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('JSON')))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('JSON')
      expect(reports[0].message).toContain('not a function')
    })

    test('should report JSON call with correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('JSON'), 5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })
  })

  describe('detecting Reflect calls', () => {
    test('should report Reflect() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Reflect')))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Reflect')
      expect(reports[0].message).toContain('not a function')
    })

    test('should report Reflect call with correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Reflect'), 15, 3))

      expect(reports[0].loc?.start.line).toBe(15)
      expect(reports[0].loc?.start.column).toBe(3)
    })
  })

  describe('detecting Atomics calls', () => {
    test('should report Atomics() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Atomics')))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Atomics')
      expect(reports[0].message).toContain('not a function')
    })

    test('should report Atomics call with correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Atomics'), 8, 12))

      expect(reports[0].loc?.start.line).toBe(8)
      expect(reports[0].loc?.start.column).toBe(12)
    })
  })

  describe('detecting Intl calls', () => {
    test('should report Intl() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Intl')))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Intl')
      expect(reports[0].message).toContain('not a function')
    })

    test('should report Intl call with correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Intl'), 3, 8))

      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(8)
    })
  })

  describe('valid calls (should not report)', () => {
    test('should not report Math.random() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('Math'), 'random')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Math.floor() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('Math'), 'floor')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report JSON.stringify() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('JSON'), 'stringify')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report JSON.parse() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('JSON'), 'parse')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Reflect.apply() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('Reflect'), 'apply')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Atomics.add() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('Atomics'), 'add')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Intl.NumberFormat() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('Intl'), 'NumberFormat')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Intl.DateTimeFormat() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('Intl'), 'DateTimeFormat')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report regular function calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('myFunction')))

      expect(reports.length).toBe(0)
    })

    test('should not report Math.min() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('Math'), 'min')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Math.max() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('Math'), 'max')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Reflect.get() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('Reflect'), 'get')),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle non-CallExpression node', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createNonCallExpression())

      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression with non-Identifier callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: createMemberExpression(createIdentifier('obj'), 'method'),
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression without callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: createIdentifier('Math'),
        arguments: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle Identifier without name property', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report multiple Math() calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Math')))
      visitor.CallExpression(createCallExpression(createIdentifier('Math')))
      visitor.CallExpression(createCallExpression(createIdentifier('Math')))

      expect(reports.length).toBe(3)
    })

    test('should report each different non-callable global once', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Math')))
      visitor.CallExpression(createCallExpression(createIdentifier('JSON')))
      visitor.CallExpression(createCallExpression(createIdentifier('Reflect')))
      visitor.CallExpression(createCallExpression(createIdentifier('Atomics')))
      visitor.CallExpression(createCallExpression(createIdentifier('Intl')))

      expect(reports.length).toBe(5)
      expect(reports[0].message).toContain('Math')
      expect(reports[1].message).toContain('JSON')
      expect(reports[2].message).toContain('Reflect')
      expect(reports[3].message).toContain('Atomics')
      expect(reports[4].message).toContain('Intl')
    })

    test('should handle case-sensitive identifier names', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('math')))
      visitor.CallExpression(createCallExpression(createIdentifier('json')))
      visitor.CallExpression(createCallExpression(createIdentifier('MATH')))

      expect(reports.length).toBe(0)
    })
  })

  describe('meta properties - extended', () => {
    test('should have meta property', () => {
      expect(noObjCallsRule).toHaveProperty('meta')
    })

    test('should have create property', () => {
      expect(noObjCallsRule).toHaveProperty('create')
    })

    test('should have meta type as string', () => {
      expect(typeof noObjCallsRule.meta.type).toBe('string')
    })

    test('should have meta severity as string', () => {
      expect(typeof noObjCallsRule.meta.severity).toBe('string')
    })

    test('should have meta docs', () => {
      expect(noObjCallsRule.meta.docs).toBeDefined()
    })

    test('should have meta docs description', () => {
      expect(typeof noObjCallsRule.meta.docs?.description).toBe('string')
    })

    test('should have meta docs category as string', () => {
      expect(typeof noObjCallsRule.meta.docs?.category).toBe('string')
    })

    test('should have schema property', () => {
      expect(noObjCallsRule.meta.schema).toBeDefined()
    })

    test('should have empty schema array', () => {
      expect(noObjCallsRule.meta.schema).toEqual([])
    })

    test('should have fixable as undefined', () => {
      expect(noObjCallsRule.meta.fixable).toBeUndefined()
    })

    test('should have description that is non-empty', () => {
      expect(noObjCallsRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have description containing "function"', () => {
      expect(noObjCallsRule.meta.docs?.description.toLowerCase()).toContain('function')
    })

    test('should have description containing "call"', () => {
      expect(noObjCallsRule.meta.docs?.description.toLowerCase()).toContain('call')
    })
  })

  describe('create visitor - extended', () => {
    test('should return an object from create', () => {
      const { context } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      expect(typeof visitor).toBe('object')
    })

    test('should return CallExpression as a function', () => {
      const { context } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('should create independent visitors per context', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'Math()' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'Math()' })
      const visitor1 = noObjCallsRule.create(ctx1)
      const visitor2 = noObjCallsRule.create(ctx2)

      visitor1.CallExpression(createCallExpression(createIdentifier('Math')))

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(0)
    })
  })

  describe('Math detection - extended', () => {
    test('should report Math() at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Math'), 1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report Math() at high line numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Math'), 999, 42))

      expect(reports[0].loc?.start.line).toBe(999)
      expect(reports[0].loc?.start.column).toBe(42)
    })

    test('should report Math() with arguments array', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: createIdentifier('Math'),
        arguments: [createIdentifier('x')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report Math() with correct end location', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Math'), 5, 3))

      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(8)
    })

    test('should produce message with single quotes around Math', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Math')))

      expect(reports[0].message).toBe("'Math' is not a function.")
    })

    test('should produce message ending with period', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Math')))

      expect(reports[0].message).toContain('.')
    })
  })

  describe('JSON detection - extended', () => {
    test('should report JSON() at column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('JSON'), 1, 0))

      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report JSON() with multiple arguments in call node', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: createIdentifier('JSON'),
        arguments: [createIdentifier('a'), createIdentifier('b')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('JSON')
    })

    test('should produce exact message for JSON', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('JSON')))

      expect(reports[0].message).toBe("'JSON' is not a function.")
    })

    test('should report JSON() at end of file location', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('JSON'), 500, 80))

      expect(reports[0].loc?.start.line).toBe(500)
      expect(reports[0].loc?.start.column).toBe(80)
    })
  })

  describe('Reflect detection - extended', () => {
    test('should produce exact message for Reflect', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Reflect')))

      expect(reports[0].message).toBe("'Reflect' is not a function.")
    })

    test('should report Reflect() at various line/column combinations', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Reflect'), 100, 0))
      visitor.CallExpression(createCallExpression(createIdentifier('Reflect'), 1, 50))

      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[1].loc?.start.column).toBe(50)
    })

    test('should report Reflect() with empty arguments array', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: createIdentifier('Reflect'),
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('Atomics detection - extended', () => {
    test('should produce exact message for Atomics', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Atomics')))

      expect(reports[0].message).toBe("'Atomics' is not a function.")
    })

    test('should report Atomics() at line 0 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Atomics'), 0, 0))

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report Atomics() with nested argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: createIdentifier('Atomics'),
        arguments: [
          {
            type: 'CallExpression',
            callee: createIdentifier('fn'),
            arguments: [],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('Intl detection - extended', () => {
    test('should produce exact message for Intl', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Intl')))

      expect(reports[0].message).toBe("'Intl' is not a function.")
    })

    test('should report Intl() at large column number', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Intl'), 1, 200))

      expect(reports[0].loc?.start.column).toBe(200)
    })
  })

  describe('valid member expression calls - extended', () => {
    test('should not report Math.ceil()', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('Math'), 'ceil')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Math.round()', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('Math'), 'round')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Math.abs()', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('Math'), 'abs')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Math.sqrt()', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('Math'), 'sqrt')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Math.pow()', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('Math'), 'pow')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Math.log()', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('Math'), 'log')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Math.sin()', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('Math'), 'sin')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Math.cos()', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('Math'), 'cos')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Math.tan()', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('Math'), 'tan')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Math.PI (not a call)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })

      const visitor = noObjCallsRule.create(context)
      const node = {
        type: 'MemberExpression',
        object: createIdentifier('Math'),
        property: createIdentifier('PI'),
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Reflect.set()', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('Reflect'), 'set')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Reflect.defineProperty()', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('Reflect'), 'defineProperty')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Reflect.deleteProperty()', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('Reflect'), 'deleteProperty')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Reflect.has()', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('Reflect'), 'has')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Reflect.ownKeys()', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('Reflect'), 'ownKeys')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Atomics.load()', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('Atomics'), 'load')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Atomics.store()', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('Atomics'), 'store')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Atomics.compareExchange()', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(
        createCallExpression(
          createMemberExpression(createIdentifier('Atomics'), 'compareExchange'),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Atomics.exchange()', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('Atomics'), 'exchange')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Atomics.wait()', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('Atomics'), 'wait')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Atomics.notify()', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('Atomics'), 'notify')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Intl.Collator()', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('Intl'), 'Collator')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Intl.PluralRules()', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('Intl'), 'PluralRules')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Intl.RelativeTimeFormat()', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(
        createCallExpression(
          createMemberExpression(createIdentifier('Intl'), 'RelativeTimeFormat'),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Intl.ListFormat()', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('Intl'), 'ListFormat')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report JSON with computed member', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      const computedMember = {
        type: 'MemberExpression',
        object: createIdentifier('JSON'),
        property: createIdentifier('parse'),
        computed: true,
      }

      visitor.CallExpression(createCallExpression(computedMember))

      expect(reports.length).toBe(0)
    })
  })

  describe('non-global identifier calls', () => {
    test('should not report Array() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Array')))

      expect(reports.length).toBe(0)
    })

    test('should not report Object() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Object')))

      expect(reports.length).toBe(0)
    })

    test('should not report String() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('String')))

      expect(reports.length).toBe(0)
    })

    test('should not report Number() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Number')))

      expect(reports.length).toBe(0)
    })

    test('should not report Boolean() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Boolean')))

      expect(reports.length).toBe(0)
    })

    test('should not report Symbol() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Symbol')))

      expect(reports.length).toBe(0)
    })

    test('should not report Promise() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Promise')))

      expect(reports.length).toBe(0)
    })

    test('should not report Map() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Map')))

      expect(reports.length).toBe(0)
    })

    test('should not report Set() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Set')))

      expect(reports.length).toBe(0)
    })

    test('should not report WeakMap() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('WeakMap')))

      expect(reports.length).toBe(0)
    })

    test('should not report WeakSet() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('WeakSet')))

      expect(reports.length).toBe(0)
    })

    test('should not report Date() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Date')))

      expect(reports.length).toBe(0)
    })

    test('should not report RegExp() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('RegExp')))

      expect(reports.length).toBe(0)
    })

    test('should not report Error() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Error')))

      expect(reports.length).toBe(0)
    })

    test('should not report TypeError() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('TypeError')))

      expect(reports.length).toBe(0)
    })

    test('should not report console() call (if someone tried)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('console')))

      expect(reports.length).toBe(0)
    })

    test('should not report document() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('document')))

      expect(reports.length).toBe(0)
    })

    test('should not report window() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('window')))

      expect(reports.length).toBe(0)
    })

    test('should not report fetch() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('fetch')))

      expect(reports.length).toBe(0)
    })

    test('should not report parseInt() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('parseInt')))

      expect(reports.length).toBe(0)
    })
  })

  describe('malformed node handling', () => {
    test('should handle boolean node', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle numeric node', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle string node', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      expect(() => visitor.CallExpression('Math')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression({})

      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type string', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression({
        type: 'Literal',
        value: 42,
      })

      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression with null callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: null,
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression with numeric callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: 42,
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression with string callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: 'Math',
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression with array callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: [createIdentifier('Math')],
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression with empty object callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {},
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle Identifier with numeric name', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 42 },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
    })

    test('should handle Identifier with null name', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: null },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
    })

    test('should handle node with extra properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: createIdentifier('Math'),
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
        extra: true,
        range: [0, 5],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle CallExpression with undefined callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: undefined,
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('case sensitivity', () => {
    test('should not report math (lowercase)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('math')))

      expect(reports.length).toBe(0)
    })

    test('should not report MATH (uppercase)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('MATH')))

      expect(reports.length).toBe(0)
    })

    test('should not report json (lowercase)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('json')))

      expect(reports.length).toBe(0)
    })

    test('should not report JSON (all uppercase - same as correct)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      // JSON is uppercase, and the rule checks for uppercase 'JSON'
      visitor.CallExpression(createCallExpression(createIdentifier('JSON')))

      expect(reports.length).toBe(1)
    })

    test('should not report reflect (lowercase)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('reflect')))

      expect(reports.length).toBe(0)
    })

    test('should not report REFLECT (uppercase)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('REFLECT')))

      expect(reports.length).toBe(0)
    })

    test('should not report atomics (lowercase)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('atomics')))

      expect(reports.length).toBe(0)
    })

    test('should not report ATOMICS (uppercase)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('ATOMICS')))

      expect(reports.length).toBe(0)
    })

    test('should not report intl (lowercase)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('intl')))

      expect(reports.length).toBe(0)
    })

    test('should not report INTL (uppercase)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('INTL')))

      expect(reports.length).toBe(0)
    })

    test('should not report mAtH (mixed case)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('mAtH')))

      expect(reports.length).toBe(0)
    })

    test('should not report JsOn (mixed case)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('JsOn')))

      expect(reports.length).toBe(0)
    })
  })

  describe('interleaved valid and invalid calls', () => {
    test('should report Math() but not Math.floor()', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('Math'), 'floor')),
      )
      visitor.CallExpression(createCallExpression(createIdentifier('Math')))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Math')
    })

    test('should report multiple offenses in sequence', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Math')))
      visitor.CallExpression(createCallExpression(createIdentifier('JSON')))
      visitor.CallExpression(createCallExpression(createIdentifier('myFunc')))
      visitor.CallExpression(createCallExpression(createIdentifier('Reflect')))

      expect(reports.length).toBe(3)
    })

    test('should track locations correctly across calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Math'), 1, 0))
      visitor.CallExpression(createCallExpression(createIdentifier('JSON'), 5, 10))
      visitor.CallExpression(createCallExpression(createIdentifier('Intl'), 20, 4))

      expect(reports.length).toBe(3)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
      expect(reports[2].loc?.start.line).toBe(20)
    })

    test('should handle mix of valid member calls and invalid direct calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('Math'), 'floor')),
      )
      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('JSON'), 'stringify')),
      )
      visitor.CallExpression(createCallExpression(createIdentifier('Atomics')))
      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('Reflect'), 'apply')),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Atomics')
    })

    test('should handle same global reported multiple times', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.CallExpression(createCallExpression(createIdentifier('Math'), i + 1, 0))
      }

      expect(reports.length).toBe(10)
      reports.forEach((report, idx) => {
        expect(report.loc?.start.line).toBe(idx + 1)
      })
    })
  })

  describe('report message format', () => {
    test('should format Math message correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Math')))

      expect(reports[0].message).toBe("'Math' is not a function.")
    })

    test('should format JSON message correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('JSON')))

      expect(reports[0].message).toBe("'JSON' is not a function.")
    })

    test('should format Reflect message correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Reflect')))

      expect(reports[0].message).toBe("'Reflect' is not a function.")
    })

    test('should format Atomics message correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Atomics')))

      expect(reports[0].message).toBe("'Atomics' is not a function.")
    })

    test('should format Intl message correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Intl')))

      expect(reports[0].message).toBe("'Intl' is not a function.")
    })

    test('should include name in single quotes', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Math')))

      expect(reports[0].message).toContain("'Math'")
    })

    test('should include "not a function" phrase', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('JSON')))

      expect(reports[0].message).toContain('not a function')
    })
  })

  describe('location tracking', () => {
    test('should track Math location at origin', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Math'), 0, 0))

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should track location for large files', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('JSON'), 10000, 500))

      expect(reports[0].loc?.start.line).toBe(10000)
      expect(reports[0].loc?.start.column).toBe(500)
    })

    test('should include end location', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Reflect'), 3, 10))

      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should report different locations for different calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Math'), 1, 0))
      visitor.CallExpression(createCallExpression(createIdentifier('Math'), 2, 5))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[1].loc?.start.line).toBe(2)
      expect(reports[1].loc?.start.column).toBe(5)
    })

    test('should handle zero column', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Atomics'), 5, 0))

      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  describe('visitor isolation', () => {
    test('multiple visitors should not share reports', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'Math()' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'Math()' })

      const visitor1 = noObjCallsRule.create(ctx1)
      const visitor2 = noObjCallsRule.create(ctx2)

      visitor1.CallExpression(createCallExpression(createIdentifier('Math')))
      visitor2.CallExpression(createCallExpression(createIdentifier('JSON')))
      visitor1.CallExpression(createCallExpression(createIdentifier('Reflect')))

      expect(r1.length).toBe(2)
      expect(r2.length).toBe(1)
      expect(r1[0].message).toContain('Math')
      expect(r1[1].message).toContain('Reflect')
      expect(r2[0].message).toContain('JSON')
    })

    test('should not cross-contaminate between visitor instances', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'Math()' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'Math()' })

      const visitor1 = noObjCallsRule.create(ctx1)
      const visitor2 = noObjCallsRule.create(ctx2)

      visitor1.CallExpression(createCallExpression(createIdentifier('Math')))

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(0)
    })
  })

  describe('callee type variants', () => {
    test('should not report when callee is FunctionExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'FunctionExpression',
          id: null,
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when callee is ArrowFunctionExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'ArrowFunctionExpression',
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when callee is CallExpression (IIFE)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      const innerCall = createCallExpression(createIdentifier('fn'))
      const node = createCallExpression(innerCall)

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when callee is a ThisExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'ThisExpression' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when callee is a Literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Literal', value: 'template' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when callee is NewExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'NewExpression',
          callee: createIdentifier('Array'),
          arguments: [],
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('consecutive and batched calls', () => {
    test('should handle rapid repeated Math() calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.CallExpression(createCallExpression(createIdentifier('Math')))
      }

      expect(reports.length).toBe(50)
    })

    test('should handle alternating valid and invalid calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      for (let i = 0; i < 25; i++) {
        visitor.CallExpression(createCallExpression(createIdentifier('JSON')))
        visitor.CallExpression(
          createCallExpression(createMemberExpression(createIdentifier('JSON'), 'parse')),
        )
      }

      expect(reports.length).toBe(25)
    })

    test('should handle all five globals called in sequence', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      const globals = ['Math', 'JSON', 'Reflect', 'Atomics', 'Intl']
      globals.forEach((name) => {
        visitor.CallExpression(createCallExpression(createIdentifier(name)))
      })

      expect(reports.length).toBe(5)
      globals.forEach((name, idx) => {
        expect(reports[idx].message).toContain(name)
      })
    })

    test('should handle all five globals called repeatedly', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      const globals = ['Math', 'JSON', 'Reflect', 'Atomics', 'Intl']
      for (let round = 0; round < 5; round++) {
        globals.forEach((name) => {
          visitor.CallExpression(createCallExpression(createIdentifier(name)))
        })
      }

      expect(reports.length).toBe(25)
    })
  })

  describe('deeply nested structures', () => {
    test('should not report Math in a nested member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      const deepMember = createMemberExpression(
        createMemberExpression(createIdentifier('Math'), 'random'),
        'call',
      )

      visitor.CallExpression(createCallExpression(deepMember))

      expect(reports.length).toBe(0)
    })

    test('should not report JSON in a nested member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      const deepMember = createMemberExpression(
        createMemberExpression(createIdentifier('JSON'), 'parse'),
        'bind',
      )

      visitor.CallExpression(createCallExpression(deepMember))

      expect(reports.length).toBe(0)
    })

    test('should report Math as top-level callee in nested call', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      // Direct Math() call, even if the result is in some nested context
      visitor.CallExpression(createCallExpression(createIdentifier('Math')))

      expect(reports.length).toBe(1)
    })
  })

  describe('type checking robustness', () => {
    test('should handle node with type as number', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression({ type: 42 })

      expect(reports.length).toBe(0)
    })

    test('should handle node with type as object', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression({ type: { name: 'CallExpression' } })

      expect(reports.length).toBe(0)
    })

    test('should handle callee with type as number', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 1, name: 'Math' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle callee name as undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: undefined },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
    })

    test('should handle loc with string line/column', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: createIdentifier('Math'),
        arguments: [],
        loc: {
          start: { line: '1', column: '0' },
          end: { line: '1', column: '5' },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node that is an array', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression([createIdentifier('Math')])

      expect(reports.length).toBe(0)
    })
  })

  describe('lookalike identifiers', () => {
    test('should not report MathJS', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('MathJS')))

      expect(reports.length).toBe(0)
    })

    test('should not report jsonify', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('jsonify')))

      expect(reports.length).toBe(0)
    })

    test('should not report Reflector', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Reflector')))

      expect(reports.length).toBe(0)
    })

    test('should not report AtomicsHelper', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('AtomicsHelper')))

      expect(reports.length).toBe(0)
    })

    test('should not report IntlUtils', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('IntlUtils')))

      expect(reports.length).toBe(0)
    })

    test('should not report _Math', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('_Math')))

      expect(reports.length).toBe(0)
    })

    test('should not report JSON2', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('JSON2')))

      expect(reports.length).toBe(0)
    })

    test('should not report myJSON', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('myJSON')))

      expect(reports.length).toBe(0)
    })

    test('should not report Math$1', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Math$1')))

      expect(reports.length).toBe(0)
    })

    test('should not report ReflectProxy', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('ReflectProxy')))

      expect(reports.length).toBe(0)
    })
  })

  describe('context interaction', () => {
    test('should call context.report exactly once for Math()', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Math')))

      expect(reports.length).toBe(1)
    })

    test('should call context.report exactly once for each global', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Math')))
      visitor.CallExpression(createCallExpression(createIdentifier('JSON')))

      expect(reports.length).toBe(2)
    })

    test('should not call context.report for valid calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('console')))
      visitor.CallExpression(createCallExpression(createIdentifier('fetch')))
      visitor.CallExpression(createCallExpression(createIdentifier('myFunc')))

      expect(reports.length).toBe(0)
    })

    test('should pass loc to context.report', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Math'), 7, 3))

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should pass message to context.report', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Math')))

      expect(reports[0].message).toBeDefined()
      expect(typeof reports[0].message).toBe('string')
    })

    test('should not report Proxy() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Proxy')))

      expect(reports.length).toBe(0)
    })

    test('should not report ArrayBuffer() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('ArrayBuffer')))

      expect(reports.length).toBe(0)
    })

    test('should report each global exactly once when called once', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Math')))
      visitor.CallExpression(createCallExpression(createIdentifier('Math')))

      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('should handle Math.trunc() as valid', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math()' })
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('Math'), 'trunc')),
      )

      expect(reports.length).toBe(0)
    })
  })
})
