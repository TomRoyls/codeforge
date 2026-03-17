import { describe, test, expect, vi } from 'vitest'
import { noObjCallsRule } from '../../../../src/rules/patterns/no-obj-calls.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(): { context: RuleContext; reports: ReportDescriptor[] } {
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
    getSource: () => 'Math()',
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

  return { context, reports }
}

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
      const { context } = createMockContext()
      const visitor = noObjCallsRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })
  })

  describe('detecting Math calls', () => {
    test('should report Math() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Math')))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Math')
      expect(reports[0].message).toContain('not a function')
    })

    test('should report Math call with correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Math'), 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })
  })

  describe('detecting JSON calls', () => {
    test('should report JSON() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('JSON')))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('JSON')
      expect(reports[0].message).toContain('not a function')
    })

    test('should report JSON call with correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('JSON'), 5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })
  })

  describe('detecting Reflect calls', () => {
    test('should report Reflect() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Reflect')))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Reflect')
      expect(reports[0].message).toContain('not a function')
    })

    test('should report Reflect call with correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Reflect'), 15, 3))

      expect(reports[0].loc?.start.line).toBe(15)
      expect(reports[0].loc?.start.column).toBe(3)
    })
  })

  describe('detecting Atomics calls', () => {
    test('should report Atomics() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Atomics')))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Atomics')
      expect(reports[0].message).toContain('not a function')
    })

    test('should report Atomics call with correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Atomics'), 8, 12))

      expect(reports[0].loc?.start.line).toBe(8)
      expect(reports[0].loc?.start.column).toBe(12)
    })
  })

  describe('detecting Intl calls', () => {
    test('should report Intl() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Intl')))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Intl')
      expect(reports[0].message).toContain('not a function')
    })

    test('should report Intl call with correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Intl'), 3, 8))

      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(8)
    })
  })

  describe('valid calls (should not report)', () => {
    test('should not report Math.random() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('Math'), 'random')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Math.floor() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('Math'), 'floor')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report JSON.stringify() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('JSON'), 'stringify')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report JSON.parse() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('JSON'), 'parse')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Reflect.apply() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('Reflect'), 'apply')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Atomics.add() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('Atomics'), 'add')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Intl.NumberFormat() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('Intl'), 'NumberFormat')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Intl.DateTimeFormat() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('Intl'), 'DateTimeFormat')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report regular function calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('myFunction')))

      expect(reports.length).toBe(0)
    })

    test('should not report Math.min() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('Math'), 'min')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Math.max() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('Math'), 'max')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Reflect.get() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('Reflect'), 'get')),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noObjCallsRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noObjCallsRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle non-CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createNonCallExpression())

      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression with non-Identifier callee', () => {
      const { context, reports } = createMockContext()
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
      const { context, reports } = createMockContext()
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
      const { context, reports } = createMockContext()
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
      const { context, reports } = createMockContext()
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
      const { context, reports } = createMockContext()
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('Math')))
      visitor.CallExpression(createCallExpression(createIdentifier('Math')))
      visitor.CallExpression(createCallExpression(createIdentifier('Math')))

      expect(reports.length).toBe(3)
    })

    test('should report each different non-callable global once', () => {
      const { context, reports } = createMockContext()
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
      const { context, reports } = createMockContext()
      const visitor = noObjCallsRule.create(context)

      visitor.CallExpression(createCallExpression(createIdentifier('math')))
      visitor.CallExpression(createCallExpression(createIdentifier('json')))
      visitor.CallExpression(createCallExpression(createIdentifier('MATH')))

      expect(reports.length).toBe(0)
    })
  })
})
