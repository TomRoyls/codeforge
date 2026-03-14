import { describe, test, expect, vi } from 'vitest'
import { preferDateNowRule } from '../../../../src/rules/patterns/prefer-date-now.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  fix?: { range: readonly [number, number]; text: string }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'new Date().getTime()',
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

function createNewExpression(callee: unknown, args: unknown[] = []): unknown {
  return {
    type: 'NewExpression',
    callee,
    arguments: args,
  }
}

function createCallExpression(callee: unknown, args: unknown[], line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee,
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: 20 },
    },
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

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

describe('prefer-date-now rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferDateNowRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferDateNowRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(preferDateNowRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(preferDateNowRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(preferDateNowRule.meta.schema).toBeDefined()
    })

    test('should be fixable', () => {
      expect(preferDateNowRule.meta.fixable).toBe('code')
    })

    test('should mention Date.now in description', () => {
      const description = preferDateNowRule.meta.docs?.description.toLowerCase()
      expect(description).toContain('date.now')
      expect(description).toContain('new date().gettime()')
    })

    test('should have documentation URL', () => {
      expect(preferDateNowRule.meta.docs?.url).toBeDefined()
      expect(preferDateNowRule.meta.docs?.url).toContain('prefer-date-now')
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })
  })

  describe('detecting new Date().getTime()', () => {
    test('should report new Date().getTime()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'))
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Use Date.now() instead of new Date().getTime().')
    })

    test('should report with correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'))
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [], 5, 10)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })
  })

  describe('fix generation', () => {
    test('should generate fix with correct replacement', () => {
      const source = 'new Date().getTime()'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'))
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [], 1, 0)
      ;(node as Record<string, unknown>).range = [0, source.length]

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('Date.now()')
    })

    test('should not generate fix when range is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'))
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })
  })

  describe('valid alternative patterns', () => {
    test('should not report Date.now()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const memberExpr = createMemberExpression(createIdentifier('Date'), 'now')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Date(value).getTime()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'), [createIdentifier('timestamp')])
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Date(123).getTime()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'), [
        { type: 'Literal', value: 123 },
      ])
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Date("string").getTime()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'), [
        { type: 'Literal', value: '2024-01-01' },
      ])
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Date().valueOf()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'))
      const memberExpr = createMemberExpression(newExpr, 'valueOf')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Date().toString()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'))
      const memberExpr = createMemberExpression(newExpr, 'toString')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Date.prototype.getTime.call()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const memberExpr1 = createMemberExpression(createIdentifier('Date'), 'prototype')
      const memberExpr2 = createMemberExpression(memberExpr1, 'getTime')
      const memberExpr3 = createMemberExpression(memberExpr2, 'call')
      const node = createCallExpression(memberExpr3, [
        createNewExpression(createIdentifier('Date')),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report other method calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const node = createCallExpression(createIdentifier('someFunction'), [
        createIdentifier('arg1'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Date() without getTime call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const node = createNewExpression(createIdentifier('Date'))

      expect(() => visitor.CallExpression(node)).not.toThrow()
    })

    test('should not report member access on non-NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const memberExpr = createMemberExpression(createIdentifier('someObject'), 'getTime')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report getTime on non-Date NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('OtherClass'))
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'))
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = {
        type: 'CallExpression',
        callee: memberExpr,
        arguments: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle CallExpression without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression without property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'))
      const memberExpr = {
        type: 'MemberExpression',
        object: newExpr,
      }
      const node = createCallExpression(memberExpr, [])

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression without object', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const memberExpr = {
        type: 'MemberExpression',
        property: {
          type: 'Identifier',
          name: 'getTime',
        },
      }
      const node = createCallExpression(memberExpr, [])

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle NewExpression without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = {
        type: 'NewExpression',
      }
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [])

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-Identifier callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression({ type: 'Literal', value: 'Date' })
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [])

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle property that is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'))
      const memberExpr = {
        type: 'MemberExpression',
        object: newExpr,
        property: {
          type: 'Literal',
          value: 'getTime',
        },
      }
      const node = createCallExpression(memberExpr, [])

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle property name that is not getTime', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'))
      const memberExpr = createMemberExpression(newExpr, 'otherMethod')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('real-world usage patterns', () => {
    test('should detect in assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'))
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [], 1, 10)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should detect in function call argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'))
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [], 5, 20)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
    })

    test('should detect in return statement context', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'))
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [], 10, 8)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(10)
    })
  })
})
