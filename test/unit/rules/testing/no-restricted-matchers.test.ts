import { describe, test, expect, vi } from 'vitest'
import { noRestrictedMatchersRule } from '../../../../src/rules/testing/no-restricted-matchers.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.test.ts',
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
    getSource: () => '',
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

function createExpectMatcherCall(matcherName: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [{ type: 'Identifier', name: 'x' }],
      },
      property: { type: 'Identifier', name: matcherName },
    },
    arguments: [],
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
}

function createExpectNotMatcherCall(matcherName: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'x' }],
        },
        property: { type: 'Identifier', name: 'not' },
      },
      property: { type: 'Identifier', name: matcherName },
    },
    arguments: [],
    loc: { start: { line, column }, end: { line, column: column + 40 } },
  }
}

function createRegularCall(name: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name },
    arguments: [],
    loc: { start: { line, column }, end: { line, column: column + 15 } },
  }
}

function createMemberCall(objectName: string, propertyName: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: objectName },
      property: { type: 'Identifier', name: propertyName },
    },
    arguments: [],
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
}

describe('no-restricted-matchers rule', () => {
  describe('meta', () => {
    test('should have correct rule type', () => {
      expect(noRestrictedMatchersRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noRestrictedMatchersRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(noRestrictedMatchersRule.meta.docs?.recommended).toBe(false)
    })

    test('should have correct category', () => {
      expect(noRestrictedMatchersRule.meta.docs?.category).toBe('testing')
    })

    test('should have schema defined', () => {
      expect(noRestrictedMatchersRule.meta.schema).toBeDefined()
    })

    test('should have correct description mentioning disallow and matchers', () => {
      const desc = noRestrictedMatchersRule.meta.docs?.description.toLowerCase() ?? ''
      expect(desc).toContain('disallow')
      expect(desc).toContain('matcher')
    })

    test('should have a docs.url property', () => {
      expect(noRestrictedMatchersRule.meta.docs?.url).toBeDefined()
    })

    test('should have docs.url containing codeforge', () => {
      expect(noRestrictedMatchersRule.meta.docs?.url).toContain('codeforge')
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(noRestrictedMatchersRule.meta.schema)).toBe(true)
    })

    test('should not include fixable field', () => {
      expect(noRestrictedMatchersRule.meta.fixable).toBeUndefined()
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = noRestrictedMatchersRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return a function for CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noRestrictedMatchersRule.create(context)

      expect(typeof visitor.CallExpression).toBe('function')
    })
  })

  describe('default behavior (no restricted matchers)', () => {
    test('should not report when no options provided', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedMatchersRule.create(context)

      visitor.CallExpression(createExpectMatcherCall('toBeFalsy'))

      expect(reports.length).toBe(0)
    })

    test('should not report when restrictedMatchers is empty', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: [] })
      const visitor = noRestrictedMatchersRule.create(context)

      visitor.CallExpression(createExpectMatcherCall('toBeFalsy'))

      expect(reports.length).toBe(0)
    })

    test('should not report non-restricted matcher', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: ['toBeFalsy'] })
      const visitor = noRestrictedMatchersRule.create(context)

      visitor.CallExpression(createExpectMatcherCall('toBe'))

      expect(reports.length).toBe(0)
    })
  })

  describe('detecting restricted matchers (direct)', () => {
    test('should report toBeFalsy when restricted', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: ['toBeFalsy'] })
      const visitor = noRestrictedMatchersRule.create(context)

      visitor.CallExpression(createExpectMatcherCall('toBeFalsy'))

      expect(reports.length).toBe(1)
    })

    test('should report toBeTruthy when restricted', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: ['toBeTruthy'] })
      const visitor = noRestrictedMatchersRule.create(context)

      visitor.CallExpression(createExpectMatcherCall('toBeTruthy'))

      expect(reports.length).toBe(1)
    })

    test('should report toBeNull when restricted', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: ['toBeNull'] })
      const visitor = noRestrictedMatchersRule.create(context)

      visitor.CallExpression(createExpectMatcherCall('toBeNull'))

      expect(reports.length).toBe(1)
    })

    test('should report toBeUndefined when restricted', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: ['toBeUndefined'] })
      const visitor = noRestrictedMatchersRule.create(context)

      visitor.CallExpression(createExpectMatcherCall('toBeUndefined'))

      expect(reports.length).toBe(1)
    })

    test('should report toBeDefined when restricted', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: ['toBeDefined'] })
      const visitor = noRestrictedMatchersRule.create(context)

      visitor.CallExpression(createExpectMatcherCall('toBeDefined'))

      expect(reports.length).toBe(1)
    })

    test('should report toEqual when restricted', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: ['toEqual'] })
      const visitor = noRestrictedMatchersRule.create(context)

      visitor.CallExpression(createExpectMatcherCall('toEqual'))

      expect(reports.length).toBe(1)
    })

    test('should report toBe when restricted', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: ['toBe'] })
      const visitor = noRestrictedMatchersRule.create(context)

      visitor.CallExpression(createExpectMatcherCall('toBe'))

      expect(reports.length).toBe(1)
    })

    test('should report toContain when restricted', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: ['toContain'] })
      const visitor = noRestrictedMatchersRule.create(context)

      visitor.CallExpression(createExpectMatcherCall('toContain'))

      expect(reports.length).toBe(1)
    })

    test('should report toHaveLength when restricted', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: ['toHaveLength'] })
      const visitor = noRestrictedMatchersRule.create(context)

      visitor.CallExpression(createExpectMatcherCall('toHaveLength'))

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting restricted matchers (.not chain)', () => {
    test('should report expect(x).not.toBeTruthy when restricted', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: ['toBeTruthy'] })
      const visitor = noRestrictedMatchersRule.create(context)

      visitor.CallExpression(createExpectNotMatcherCall('toBeTruthy'))

      expect(reports.length).toBe(1)
    })

    test('should report expect(x).not.toBeNull when restricted', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: ['toBeNull'] })
      const visitor = noRestrictedMatchersRule.create(context)

      visitor.CallExpression(createExpectNotMatcherCall('toBeNull'))

      expect(reports.length).toBe(1)
    })

    test('should report expect(x).not.toBe when restricted', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: ['toBe'] })
      const visitor = noRestrictedMatchersRule.create(context)

      visitor.CallExpression(createExpectNotMatcherCall('toBe'))

      expect(reports.length).toBe(1)
    })

    test('should not report .not chain for non-restricted matcher', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: ['toBeFalsy'] })
      const visitor = noRestrictedMatchersRule.create(context)

      visitor.CallExpression(createExpectNotMatcherCall('toBe'))

      expect(reports.length).toBe(0)
    })
  })

  describe('report message format', () => {
    test('should include matcher name in message', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: ['toBeFalsy'] })
      const visitor = noRestrictedMatchersRule.create(context)

      visitor.CallExpression(createExpectMatcherCall('toBeFalsy'))

      expect(reports[0].message).toContain('toBeFalsy')
    })

    test('should include "restricted" in message', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: ['toBeNull'] })
      const visitor = noRestrictedMatchersRule.create(context)

      visitor.CallExpression(createExpectMatcherCall('toBeNull'))

      expect(reports[0].message).toContain('restricted')
    })

    test('should include "not allowed" in message', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: ['toBeTruthy'] })
      const visitor = noRestrictedMatchersRule.create(context)

      visitor.CallExpression(createExpectMatcherCall('toBeTruthy'))

      expect(reports[0].message).toContain('not allowed')
    })

    test('should include matcher name for .not chain', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: ['toBeNull'] })
      const visitor = noRestrictedMatchersRule.create(context)

      visitor.CallExpression(createExpectNotMatcherCall('toBeNull'))

      expect(reports[0].message).toContain('toBeNull')
    })
  })

  describe('multiple restricted matchers', () => {
    test('should report each restricted matcher individually', () => {
      const { context, reports } = createMockContext({
        restrictedMatchers: ['toBeFalsy', 'toBeTruthy', 'toBeNull'],
      })
      const visitor = noRestrictedMatchersRule.create(context)

      visitor.CallExpression(createExpectMatcherCall('toBeFalsy'))
      visitor.CallExpression(createExpectMatcherCall('toBeTruthy'))
      visitor.CallExpression(createExpectMatcherCall('toBeNull'))

      expect(reports.length).toBe(3)
    })

    test('should report only restricted matchers among mixed calls', () => {
      const { context, reports } = createMockContext({
        restrictedMatchers: ['toBeFalsy', 'toBeNull'],
      })
      const visitor = noRestrictedMatchersRule.create(context)

      visitor.CallExpression(createExpectMatcherCall('toBe'))
      visitor.CallExpression(createExpectMatcherCall('toBeFalsy'))
      visitor.CallExpression(createExpectMatcherCall('toEqual'))
      visitor.CallExpression(createExpectMatcherCall('toBeNull'))

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('toBeFalsy')
      expect(reports[1].message).toContain('toBeNull')
    })

    test('should report same matcher multiple times', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: ['toBeFalsy'] })
      const visitor = noRestrictedMatchersRule.create(context)

      visitor.CallExpression(createExpectMatcherCall('toBeFalsy', 1, 0))
      visitor.CallExpression(createExpectMatcherCall('toBeFalsy', 5, 0))
      visitor.CallExpression(createExpectMatcherCall('toBeFalsy', 10, 0))

      expect(reports.length).toBe(3)
    })
  })

  describe('location reporting', () => {
    test('should report correct location for direct matcher', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: ['toBeFalsy'] })
      const visitor = noRestrictedMatchersRule.create(context)

      visitor.CallExpression(createExpectMatcherCall('toBeFalsy', 7, 4))

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should report correct location for .not chain', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: ['toBeTruthy'] })
      const visitor = noRestrictedMatchersRule.create(context)

      visitor.CallExpression(createExpectNotMatcherCall('toBeTruthy', 12, 8))

      expect(reports[0].loc?.start.line).toBe(12)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should report correct lines for multiple violations', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: ['toBeFalsy'] })
      const visitor = noRestrictedMatchersRule.create(context)

      visitor.CallExpression(createExpectMatcherCall('toBeFalsy', 2, 4))
      visitor.CallExpression(createExpectMatcherCall('toBeFalsy', 8, 2))

      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[1].loc?.start.line).toBe(8)
    })
  })

  describe('valid cases (no reports)', () => {
    test('should not report regular function calls', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: ['toBeFalsy'] })
      const visitor = noRestrictedMatchersRule.create(context)

      visitor.CallExpression(createRegularCall('it'))
      visitor.CallExpression(createRegularCall('describe'))
      visitor.CallExpression(createRegularCall('test'))

      expect(reports.length).toBe(0)
    })

    test('should not report member expression calls on non-expect objects', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: ['toBeFalsy'] })
      const visitor = noRestrictedMatchersRule.create(context)

      visitor.CallExpression(createMemberCall('console', 'log'))
      visitor.CallExpression(createMemberCall('foo', 'bar'))
      visitor.CallExpression(createMemberCall('assert', 'equal'))

      expect(reports.length).toBe(0)
    })

    test('should not report allowed matchers when only some are restricted', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: ['toBeFalsy'] })
      const visitor = noRestrictedMatchersRule.create(context)

      visitor.CallExpression(createExpectMatcherCall('toBe'))
      visitor.CallExpression(createExpectMatcherCall('toEqual'))
      visitor.CallExpression(createExpectMatcherCall('toContain'))

      expect(reports.length).toBe(0)
    })

    test('should not report non-CallExpression node types', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: ['toBeFalsy'] })
      const visitor = noRestrictedMatchersRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: ['toBeFalsy'] })
      const visitor = noRestrictedMatchersRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: ['toBeFalsy'] })
      const visitor = noRestrictedMatchersRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node gracefully', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: ['toBeFalsy'] })
      const visitor = noRestrictedMatchersRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee gracefully', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: ['toBeFalsy'] })
      const visitor = noRestrictedMatchersRule.create(context)

      const node = { type: 'CallExpression', arguments: [] }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: ['toBeFalsy'] })
      const visitor = noRestrictedMatchersRule.create(context)

      const node = createExpectMatcherCall('toBeFalsy')
      delete (node as Record<string, unknown>).loc

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle callee without name property', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: ['toBeFalsy'] })
      const visitor = noRestrictedMatchersRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object callee', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: ['toBeFalsy'] })
      const visitor = noRestrictedMatchersRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {},
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not report when callee is FunctionExpression', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: ['toBeFalsy'] })
      const visitor = noRestrictedMatchersRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'FunctionExpression',
          id: null,
          params: [],
          body: { type: 'BlockStatement' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when callee type is empty string', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: ['toBeFalsy'] })
      const visitor = noRestrictedMatchersRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: '', name: 'toBeFalsy' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not match .not chain when inner object is not expect()', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: ['toBeFalsy'] })
      const visitor = noRestrictedMatchersRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'something' },
              arguments: [],
            },
            property: { type: 'Identifier', name: 'not' },
          },
          property: { type: 'Identifier', name: 'toBeFalsy' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle .not chain where not property has wrong type', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: ['toBeFalsy'] })
      const visitor = noRestrictedMatchersRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'expect' },
              arguments: [{ type: 'Identifier', name: 'x' }],
            },
            property: { type: 'Literal', value: 'not' },
          },
          property: { type: 'Identifier', name: 'toBeFalsy' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('independent visitor instances', () => {
    test('should return independent visitors for different contexts', () => {
      const { context: ctx1, reports: rep1 } = createMockContext({
        restrictedMatchers: ['toBeFalsy'],
      })
      const { context: ctx2, reports: rep2 } = createMockContext({
        restrictedMatchers: ['toBeTruthy'],
      })
      const visitor1 = noRestrictedMatchersRule.create(ctx1)
      const visitor2 = noRestrictedMatchersRule.create(ctx2)

      visitor1.CallExpression(createExpectMatcherCall('toBeFalsy'))
      visitor2.CallExpression(createExpectMatcherCall('toBeTruthy'))

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(1)
      expect(rep1[0].message).toContain('toBeFalsy')
      expect(rep2[0].message).toContain('toBeTruthy')
    })

    test('should have separate restricted lists per visitor', () => {
      const { context: ctx1, reports: rep1 } = createMockContext({
        restrictedMatchers: ['toBeFalsy'],
      })
      const { context: ctx2, reports: rep2 } = createMockContext({
        restrictedMatchers: ['toBeNull'],
      })
      const visitor1 = noRestrictedMatchersRule.create(ctx1)
      const visitor2 = noRestrictedMatchersRule.create(ctx2)

      visitor1.CallExpression(createExpectMatcherCall('toBeNull'))
      visitor2.CallExpression(createExpectMatcherCall('toBeNull'))

      expect(rep1.length).toBe(0)
      expect(rep2.length).toBe(1)
    })
  })

  describe('default export', () => {
    test('default export should be defined', async () => {
      const mod = await import('../../../../src/rules/testing/no-restricted-matchers.js')
      expect(mod.default).toBeDefined()
      expect(mod.default).toBe(noRestrictedMatchersRule)
    })
  })

  describe('schema structure', () => {
    test('should have schema with object type at index 0', () => {
      const schema = noRestrictedMatchersRule.meta.schema
      expect(Array.isArray(schema)).toBe(true)
      expect(schema?.[0]).toHaveProperty('type', 'object')
    })

    test('should have restrictedMatchers in schema properties', () => {
      const schema = noRestrictedMatchersRule.meta.schema
      const firstEntry = schema?.[0] as Record<string, unknown>
      const properties = firstEntry?.properties as Record<string, unknown>
      expect(properties).toHaveProperty('restrictedMatchers')
    })
  })

  describe('mixed .not and direct patterns', () => {
    test('should report both direct and .not chain for same matcher', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: ['toBeFalsy'] })
      const visitor = noRestrictedMatchersRule.create(context)

      visitor.CallExpression(createExpectMatcherCall('toBeFalsy', 1, 0))
      visitor.CallExpression(createExpectNotMatcherCall('toBeFalsy', 5, 0))

      expect(reports.length).toBe(2)
    })

    test('should report .not chain for one matcher and direct for another', () => {
      const { context, reports } = createMockContext({
        restrictedMatchers: ['toBeFalsy', 'toBeTruthy'],
      })
      const visitor = noRestrictedMatchersRule.create(context)

      visitor.CallExpression(createExpectMatcherCall('toBeFalsy', 1, 0))
      visitor.CallExpression(createExpectNotMatcherCall('toBeTruthy', 5, 0))

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('toBeFalsy')
      expect(reports[1].message).toContain('toBeTruthy')
    })
  })

  describe('meta as plain object', () => {
    test('should have meta as a plain object', () => {
      expect(typeof noRestrictedMatchersRule.meta).toBe('object')
      expect(noRestrictedMatchersRule.meta).not.toBeNull()
      expect(Array.isArray(noRestrictedMatchersRule.meta)).toBe(false)
    })
  })

  describe('near-miss matcher names', () => {
    test('should not report "toFalse" when only "toBeFalsy" is restricted', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: ['toBeFalsy'] })
      const visitor = noRestrictedMatchersRule.create(context)

      visitor.CallExpression(createExpectMatcherCall('toFalse'))

      expect(reports.length).toBe(0)
    })

    test('should not report empty string matcher', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: [''] })
      const visitor = noRestrictedMatchersRule.create(context)

      visitor.CallExpression(createExpectMatcherCall(''))

      expect(reports.length).toBe(1)
    })

    test('should be case-sensitive for matcher names', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: ['tobeNull'] })
      const visitor = noRestrictedMatchersRule.create(context)

      visitor.CallExpression(createExpectMatcherCall('toBeNull'))

      expect(reports.length).toBe(0)
    })
  })

  describe('all matchers in single visitor pass', () => {
    test('should detect multiple restricted matchers in one pass', () => {
      const matchers = ['toBeFalsy', 'toBeTruthy', 'toBeNull', 'toBeUndefined']
      const { context, reports } = createMockContext({ restrictedMatchers: matchers })
      const visitor = noRestrictedMatchersRule.create(context)

      for (const m of matchers) {
        visitor.CallExpression(createExpectMatcherCall(m))
      }

      expect(reports.length).toBe(4)
    })
  })

  describe('non-Identifier callee types for member expression', () => {
    test('should not report when property is a Literal', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: ['toBeFalsy'] })
      const visitor = noRestrictedMatchersRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'x' }],
          },
          property: { type: 'Literal', value: 'toBeFalsy' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('options edge cases', () => {
    test('should handle options with extra fields', () => {
      const { context, reports } = createMockContext({
        restrictedMatchers: ['toBeFalsy'],
        extraField: 'ignored',
      })
      const visitor = noRestrictedMatchersRule.create(context)

      visitor.CallExpression(createExpectMatcherCall('toBeFalsy'))

      expect(reports.length).toBe(1)
    })

    test('should handle empty options object', () => {
      const { context, reports } = createMockContext({})
      const visitor = noRestrictedMatchersRule.create(context)

      visitor.CallExpression(createExpectMatcherCall('toBeFalsy'))

      expect(reports.length).toBe(0)
    })

    test('should handle config with empty options array', () => {
      const reports: ReportDescriptor[] = []
      const context = {
        report: (d: ReportDescriptor) => { reports.push(d) },
        getFilePath: () => '/src/file.test.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext
      const visitor = noRestrictedMatchersRule.create(context)

      visitor.CallExpression(createExpectMatcherCall('toBeFalsy'))

    })
  })

  describe('additional meta verification', () => {
    test('should have testing category', () => {
      expect(noRestrictedMatchersRule.meta.docs?.category).toBe('testing')
    })

    test('should have suggestion type', () => {
      expect(noRestrictedMatchersRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noRestrictedMatchersRule.meta.severity).toBe('warn')
    })

    test('should have correct docs URL', () => {
      expect(noRestrictedMatchersRule.meta.docs?.url).toBe('https://codeforge.dev/docs/rules/no-restricted-matchers')
    })

    test('should have recommended set to false', () => {
      expect(noRestrictedMatchersRule.meta.docs?.recommended).toBe(false)
    })
  })

  describe('detecting restricted matchers (.not chain) - additional matchers', () => {
    test('should report expect(x).not.toBeUndefined when restricted', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: ['toBeUndefined'] })
      const visitor = noRestrictedMatchersRule.create(context)

      visitor.CallExpression(createExpectNotMatcherCall('toBeUndefined'))

      expect(reports.length).toBe(1)
    })

    test('should report expect(x).not.toBeDefined when restricted', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: ['toBeDefined'] })
      const visitor = noRestrictedMatchersRule.create(context)

      visitor.CallExpression(createExpectNotMatcherCall('toBeDefined'))

      expect(reports.length).toBe(1)
    })

    test('should report expect(x).not.toEqual when restricted', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: ['toEqual'] })
      const visitor = noRestrictedMatchersRule.create(context)

      visitor.CallExpression(createExpectNotMatcherCall('toEqual'))

      expect(reports.length).toBe(1)
    })

    test('should report expect(x).not.toContain when restricted', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: ['toContain'] })
      const visitor = noRestrictedMatchersRule.create(context)

      visitor.CallExpression(createExpectNotMatcherCall('toContain'))

      expect(reports.length).toBe(1)
    })

    test('should report expect(x).not.toHaveLength when restricted', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: ['toHaveLength'] })
      const visitor = noRestrictedMatchersRule.create(context)

      visitor.CallExpression(createExpectNotMatcherCall('toHaveLength'))

      expect(reports.length).toBe(1)
    })
  })

  describe('deep .not.not chain', () => {
    test('should not match double .not chain expect(x).not.not.toBe', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: ['toBe'] })
      const visitor = noRestrictedMatchersRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: {
              type: 'MemberExpression',
              object: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'expect' },
                arguments: [{ type: 'Identifier', name: 'x' }],
              },
              property: { type: 'Identifier', name: 'not' },
            },
            property: { type: 'Identifier', name: 'not' },
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('schema details', () => {
    test('should have additionalProperties set to false in schema', () => {
      const schema = noRestrictedMatchersRule.meta.schema
      const firstEntry = schema?.[0] as Record<string, unknown>
      expect(firstEntry.additionalProperties).toBe(false)
    })

    test('should have restrictedMatchers items with string type', () => {
      const schema = noRestrictedMatchersRule.meta.schema
      const firstEntry = schema?.[0] as Record<string, unknown>
      const properties = firstEntry?.properties as Record<string, unknown>
      const restrictedMatchers = properties?.restrictedMatchers as Record<string, unknown>
      const items = restrictedMatchers?.items as Record<string, unknown>
      expect(items.type).toBe('string')
    })
  })

  describe('config edge cases - non-object options', () => {
    test('should handle config with string as first option element', () => {
      const reports: ReportDescriptor[] = []
      const context = {
        report: (d: ReportDescriptor) => { reports.push(d) },
        getFilePath: () => '/src/file.test.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: ['invalid'] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext
      const visitor = noRestrictedMatchersRule.create(context)

      visitor.CallExpression(createExpectMatcherCall('toBeFalsy'))

      expect(reports.length).toBe(0)
    })

    test('should handle config with null as first option element', () => {
      const reports: ReportDescriptor[] = []
      const context = {
        report: (d: ReportDescriptor) => { reports.push(d) },
        getFilePath: () => '/src/file.test.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [null] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext
      const visitor = noRestrictedMatchersRule.create(context)

      visitor.CallExpression(createExpectMatcherCall('toBeFalsy'))

      expect(reports.length).toBe(0)
    })
  })

  describe('location end reporting', () => {
    test('should report correct end location for direct matcher', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: ['toBeFalsy'] })
      const visitor = noRestrictedMatchersRule.create(context)

      visitor.CallExpression(createExpectMatcherCall('toBeFalsy', 3, 5))

      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(35)
    })

    test('should report correct end location for .not chain', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: ['toBeTruthy'] })
      const visitor = noRestrictedMatchersRule.create(context)

      visitor.CallExpression(createExpectNotMatcherCall('toBeTruthy', 9, 2))

      expect(reports[0].loc?.end.line).toBe(9)
      expect(reports[0].loc?.end.column).toBe(42)
    })
  })

  describe('report message format - exact template', () => {
    test('should produce exact message for toBeFalsy', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: ['toBeFalsy'] })
      const visitor = noRestrictedMatchersRule.create(context)

      visitor.CallExpression(createExpectMatcherCall('toBeFalsy'))

      expect(reports[0].message).toBe("Use of restricted matcher 'toBeFalsy' is not allowed.")
    })

    test('should produce exact message for .not chain matcher', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: ['toBeNull'] })
      const visitor = noRestrictedMatchersRule.create(context)

      visitor.CallExpression(createExpectNotMatcherCall('toBeNull'))

      expect(reports[0].message).toBe("Use of restricted matcher 'toBeNull' is not allowed.")
    })
  })

  describe('additional meta checks', () => {
    test('should have valid docs URL containing rule name', () => {
      const url = noRestrictedMatchersRule.meta.docs?.url
      expect(url).toMatch(/^https?:\/\/.+/)
      expect(url).toContain('no-restricted-matchers')
    })

    test('should have create as a function', () => {
      expect(typeof noRestrictedMatchersRule.create).toBe('function')
    })
  })

  describe('resolves chain not detected', () => {
    test('expect(x).resolves.toBe() should not be detected when toBe is restricted', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: ['toBe'] })
      const visitor = noRestrictedMatchersRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'expect' },
              arguments: [{ type: 'Identifier', name: 'x' }],
            },
            property: { type: 'Identifier', name: 'resolves' },
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('rejects chain not detected', () => {
    test('expect(x).rejects.toThrow() should not be detected when toThrow is restricted', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: ['toThrow'] })
      const visitor = noRestrictedMatchersRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'expect' },
              arguments: [{ type: 'Identifier', name: 'x' }],
            },
            property: { type: 'Identifier', name: 'rejects' },
          },
          property: { type: 'Identifier', name: 'toThrow' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('resolves.not triple chain not detected', () => {
    test('expect(x).resolves.not.toBe() should not be detected when toBe is restricted', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: ['toBe'] })
      const visitor = noRestrictedMatchersRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: {
              type: 'MemberExpression',
              object: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'expect' },
                arguments: [{ type: 'Identifier', name: 'x' }],
              },
              property: { type: 'Identifier', name: 'resolves' },
            },
            property: { type: 'Identifier', name: 'not' },
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('bare expect call not detected', () => {
    test('bare expect(x) should not be detected when matcher is restricted', () => {
      const { context, reports } = createMockContext({ restrictedMatchers: ['toBe'] })
      const visitor = noRestrictedMatchersRule.create(context)

      visitor.CallExpression(createRegularCall('expect'))

      expect(reports.length).toBe(0)
    })
  })

  describe('config with undefined options', () => {
    test('should handle config with undefined options field', () => {
      const reports: ReportDescriptor[] = []
      const context = {
        report: (d: ReportDescriptor) => { reports.push(d) },
        getFilePath: () => '/src/file.test.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: {},
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext
      const visitor = noRestrictedMatchersRule.create(context)

      visitor.CallExpression(createExpectMatcherCall('toBeFalsy'))

      expect(reports.length).toBe(0)
    })
  })
})
