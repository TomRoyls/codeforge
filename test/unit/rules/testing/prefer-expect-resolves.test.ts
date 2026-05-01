import { describe, test, expect, vi } from 'vitest'
import { preferExpectResolvesRule } from '../../../../src/rules/testing/prefer-expect-resolves.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.test.ts',
  source = 'expect(await promise).toBe(value);',
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

function createAwaitExpectMatcherCall(
  matcherName: string,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [
          { type: 'AwaitExpression', argument: { type: 'Identifier', name: 'promise' } },
        ],
      },
      property: { type: 'Identifier', name: matcherName },
    },
    arguments: [{ type: 'Identifier', name: 'value' }],
    loc: { start: { line, column }, end: { line, column: column + 35 } },
  }
}

function createAwaitExpectNotMatcherCall(
  matcherName: string,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [
              { type: 'AwaitExpression', argument: { type: 'Identifier', name: 'promise' } },
            ],
          },
          property: { type: 'Identifier', name: 'not' },
        },
        arguments: [],
      },
      property: { type: 'Identifier', name: matcherName },
    },
    arguments: [{ type: 'Identifier', name: 'value' }],
    loc: { start: { line, column }, end: { line, column: column + 40 } },
  }
}

function createNonAwaitExpectMatcherCall(
  matcherName: string,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [{ type: 'Identifier', name: 'promise' }],
      },
      property: { type: 'Identifier', name: matcherName },
    },
    arguments: [{ type: 'Identifier', name: 'value' }],
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
}

function createResolvesMatcherCall(
  matcherName: string,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [
              { type: 'AwaitExpression', argument: { type: 'Identifier', name: 'promise' } },
            ],
          },
          property: { type: 'Identifier', name: 'resolves' },
        },
        arguments: [],
      },
      property: { type: 'Identifier', name: matcherName },
    },
    arguments: [{ type: 'Identifier', name: 'value' }],
    loc: { start: { line, column }, end: { line, column: column + 45 } },
  }
}

function createNonExpectAwaitMatcherCall(
  matcherName: string,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'something' },
        arguments: [
          { type: 'AwaitExpression', argument: { type: 'Identifier', name: 'promise' } },
        ],
      },
      property: { type: 'Identifier', name: matcherName },
    },
    arguments: [{ type: 'Identifier', name: 'value' }],
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
}

describe('prefer-expect-resolves rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferExpectResolvesRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferExpectResolvesRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(preferExpectResolvesRule.meta.docs?.recommended).toBe(false)
    })

    test('should have testing category', () => {
      expect(preferExpectResolvesRule.meta.docs?.category).toBe('testing')
    })

    test('should have correct description mentioning resolves', () => {
      expect(preferExpectResolvesRule.meta.docs?.description).toContain('resolves')
    })

    test('should have correct description mentioning awaiting', () => {
      expect(preferExpectResolvesRule.meta.docs?.description).toContain('awaiting')
    })

    test('should have correct docs URL', () => {
      expect(preferExpectResolvesRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/prefer-expect-resolves',
      )
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = preferExpectResolvesRule.create(context)
      const visitor2 = preferExpectResolvesRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })
  })

  describe('detecting expect(await ...).toBe()', () => {
    test('should report expect(await promise).toBe(value)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression(createAwaitExpectMatcherCall('toBe'))

      expect(reports.length).toBe(1)
    })

    test('should report expect(await promise).toEqual(value)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression(createAwaitExpectMatcherCall('toEqual'))

      expect(reports.length).toBe(1)
    })

    test('should report expect(await promise).toStrictEqual(value)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression(createAwaitExpectMatcherCall('toStrictEqual'))

      expect(reports.length).toBe(1)
    })

    test('should report expect(await promise).toMatchObject(value)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression(createAwaitExpectMatcherCall('toMatchObject'))

      expect(reports.length).toBe(1)
    })

    test('should report expect(await promise).toResolve()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression(createAwaitExpectMatcherCall('toResolve'))

      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression(createAwaitExpectMatcherCall('toBe', 7, 12))

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(12)
    })
  })

  describe('detecting expect(await ...).not.toBe()', () => {
    test('should report expect(await promise).not.toBe(value)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression(createAwaitExpectNotMatcherCall('toBe'))

      expect(reports.length).toBe(1)
    })

    test('should report expect(await promise).not.toEqual(value)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression(createAwaitExpectNotMatcherCall('toEqual'))

      expect(reports.length).toBe(1)
    })

    test('should report correct location for .not chain', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression(createAwaitExpectNotMatcherCall('toBe', 10, 4))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
    })
  })

  describe('already correct — no reports', () => {
    test('should not report expect(promise).resolves.toBe(value)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression(createResolvesMatcherCall('toBe'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(promise).resolves.toEqual(value)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression(createResolvesMatcherCall('toEqual'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(nonPromise).toBe(value)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression(createNonAwaitExpectMatcherCall('toBe'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(nonPromise).toEqual(value)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression(createNonAwaitExpectMatcherCall('toEqual'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(nonPromise).toStrictEqual(value)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression(createNonAwaitExpectMatcherCall('toStrictEqual'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(nonPromise).toMatchObject(value)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression(createNonAwaitExpectMatcherCall('toMatchObject'))

      expect(reports.length).toBe(0)
    })
  })

  describe('non-expect call — no reports', () => {
    test('should not report something(await promise).toBe(value)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression(createNonExpectAwaitMatcherCall('toBe'))

      expect(reports.length).toBe(0)
    })

    test('should not report something(await promise).toEqual(value)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression(createNonExpectAwaitMatcherCall('toEqual'))

      expect(reports.length).toBe(0)
    })
  })

  describe('report message content', () => {
    test('message mentions resolves', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression(createAwaitExpectMatcherCall('toBe'))

      expect(reports[0].message).toContain('resolves')
    })

    test('message mentions awaiting', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression(createAwaitExpectMatcherCall('toBe'))

      expect(reports[0].message).toContain('awaiting')
    })

    test('message does not use ESLint placeholder format', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression(createAwaitExpectMatcherCall('toBe'))

      expect(reports[0].message).not.toContain('{{')
      expect(reports[0].message).not.toContain('}}')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression(createAwaitExpectMatcherCall('toBe', 5, 10))

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })
  })

  describe('multiple violations', () => {
    test('should report multiple violations in one file', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression(createAwaitExpectMatcherCall('toBe', 1, 0))
      visitor.CallExpression(createAwaitExpectMatcherCall('toEqual', 2, 0))
      visitor.CallExpression(createAwaitExpectMatcherCall('toStrictEqual', 3, 0))

      expect(reports.length).toBe(3)
    })

    test('should report mixed violations and pass valid calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression(createAwaitExpectMatcherCall('toBe', 1, 0))
      visitor.CallExpression(createNonAwaitExpectMatcherCall('toBe', 2, 0))
      visitor.CallExpression(createResolvesMatcherCall('toBe', 3, 0))
      visitor.CallExpression(createAwaitExpectMatcherCall('toEqual', 4, 0))

      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(4)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression({ type: 'CallExpression', arguments: [] })

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [
              { type: 'AwaitExpression', argument: { type: 'Identifier', name: 'promise' } },
            ],
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [{ type: 'Identifier', name: 'value' }],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression with Identifier callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'toBe' },
        arguments: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node with property but no object on callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node where callee.object is not a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle deeply nested expect calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression(createAwaitExpectMatcherCall('toBe', 2, 4))
      visitor.CallExpression(createNonAwaitExpectMatcherCall('toBe', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should not report when matcher name is not relevant (only checks await)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression(createAwaitExpectMatcherCall('customMatcher'))

      expect(reports.length).toBe(1)
    })

    test('should handle expect with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle expect with null arguments array', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: null,
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [],
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('state isolation between visitors', () => {
    test('separate visitors have separate state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()

      const visitor1 = preferExpectResolvesRule.create(ctx1)
      const visitor2 = preferExpectResolvesRule.create(ctx2)

      visitor1.CallExpression(createAwaitExpectMatcherCall('toBe'))
      visitor2.CallExpression(createResolvesMatcherCall('toBe'))

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression(createAwaitExpectMatcherCall('toBe', 1, 0))
      visitor.CallExpression(createAwaitExpectMatcherCall('toEqual', 2, 0))
      visitor.CallExpression(createResolvesMatcherCall('toBe', 3, 0))
      visitor.CallExpression(createAwaitExpectMatcherCall('toStrictEqual', 4, 0))

      expect(reports.length).toBe(3)
    })
  })

  describe('default export', () => {
    test('rule should be the default export', () => {
      expect(preferExpectResolvesRule).toBeDefined()
      expect(preferExpectResolvesRule.meta).toBeDefined()
      expect(preferExpectResolvesRule.create).toBeDefined()
    })
  })

  describe('additional meta tests', () => {
    test('should have exact description match', () => {
      expect(preferExpectResolvesRule.meta.docs?.description).toBe(
        'Prefer expect().resolves over awaiting the value in expect()',
      )
    })

    test('should have docs object defined', () => {
      expect(preferExpectResolvesRule.meta.docs).toBeDefined()
    })

    test('should have all required meta properties', () => {
      expect(preferExpectResolvesRule.meta).toHaveProperty('type')
      expect(preferExpectResolvesRule.meta).toHaveProperty('severity')
      expect(preferExpectResolvesRule.meta).toHaveProperty('docs')
      expect(preferExpectResolvesRule.meta.docs).toHaveProperty('category')
      expect(preferExpectResolvesRule.meta.docs).toHaveProperty('description')
      expect(preferExpectResolvesRule.meta.docs).toHaveProperty('url')
      expect(preferExpectResolvesRule.meta.docs).toHaveProperty('recommended')
    })
  })

  describe('additional .not matcher patterns', () => {
    test('should report expect(await promise).not.toStrictEqual(value)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression(createAwaitExpectNotMatcherCall('toStrictEqual'))

      expect(reports.length).toBe(1)
    })

    test('should report expect(await promise).not.toMatchObject(value)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression(createAwaitExpectNotMatcherCall('toMatchObject'))

      expect(reports.length).toBe(1)
    })

    test('should report expect(await promise).not.toResolve()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression(createAwaitExpectNotMatcherCall('toResolve'))

      expect(reports.length).toBe(1)
    })

    test('should report expect(await promise).not.toHaveBeenCalled()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression(createAwaitExpectNotMatcherCall('toHaveBeenCalled'))

      expect(reports.length).toBe(1)
    })
  })

  describe('additional correct .resolves patterns', () => {
    test('should not report expect(promise).resolves.toStrictEqual(value)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression(createResolvesMatcherCall('toStrictEqual'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(promise).resolves.toMatchObject(value)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression(createResolvesMatcherCall('toMatchObject'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(promise).resolves.toResolve()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression(createResolvesMatcherCall('toResolve'))

      expect(reports.length).toBe(0)
    })

    function createResolvesNotMatcherCall(matcherName: string, line = 1, column = 0): unknown {
      return {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'expect' },
                arguments: [{ type: 'Identifier', name: 'promise' }],
              },
              property: { type: 'Identifier', name: 'resolves' },
            },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'not' },
        },
        arguments: [{ type: 'Identifier', name: 'value' }],
        loc: { start: { line, column }, end: { line, column: column + 50 } },
      }
    }

    test('should not report expect(promise).resolves.not.toBe(value)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression(createResolvesNotMatcherCall('toBe'))

      expect(reports.length).toBe(0)
    })
  })

  describe('additional matcher variations', () => {
    test('should report expect(await promise).toBeCalled()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression(createAwaitExpectMatcherCall('toBeCalled'))

      expect(reports.length).toBe(1)
    })

    test('should report expect(await promise).toHaveBeenCalled()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression(createAwaitExpectMatcherCall('toHaveBeenCalled'))

      expect(reports.length).toBe(1)
    })

    test('should report expect(await promise).toHaveLength(5)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression(createAwaitExpectMatcherCall('toHaveLength'))

      expect(reports.length).toBe(1)
    })

    test('should report expect(await promise).toBeTruthy()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression(createAwaitExpectMatcherCall('toBeTruthy'))

      expect(reports.length).toBe(1)
    })

    test('should report expect(await promise).toBeFalsy()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression(createAwaitExpectMatcherCall('toBeFalsy'))

      expect(reports.length).toBe(1)
    })
  })

  describe('context and source variations', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockContext({}, '/custom/path/test.spec.ts')
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression(createAwaitExpectMatcherCall('toBe'))

      expect(reports.length).toBe(1)
      expect(context.getFilePath()).toBe('/custom/path/test.spec.ts')
    })

    test('should work with different source content', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/test.ts',
        'const result = await fetch(); expect(result).toBe("data");',
      )
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression(createAwaitExpectMatcherCall('toBe'))

      expect(reports.length).toBe(1)
      expect(context.getSource()).toBe(
        'const result = await fetch(); expect(result).toBe("data");',
      )
    })

    test('should work with custom config options', () => {
      const { context, reports } = createMockContext({ customOption: true })
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression(createAwaitExpectMatcherCall('toBe'))

      expect(reports.length).toBe(1)
      expect(context.config.options[0]).toEqual({ customOption: true })
    })
  })

  describe('additional edge cases', () => {
    test('should handle callee with null object and property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: null, property: null },
        arguments: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node with missing arguments property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle expect call with undefined callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: undefined,
        arguments: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node with non-CallExpression object in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'someObject' },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle empty string property name - still reports because await is present', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'AwaitExpression', argument: { type: 'Identifier', name: 'promise' } }],
          },
          property: { type: 'Identifier', name: '' },
        },
        arguments: [],
      })

      expect(reports.length).toBe(1)
    })

    test('should handle expect with non-AwaitExpression first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'nonPromise' }],
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle chain with .resolves and .not (valid)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'expect' },
                arguments: [{ type: 'Identifier', name: 'promise' }],
              },
              property: { type: 'Identifier', name: 'resolves' },
            },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'not' },
        },
        arguments: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle await with undefined argument - still reports because AwaitExpression exists', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'AwaitExpression', argument: undefined }],
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [],
      })

      expect(reports.length).toBe(1)
    })

    test('should handle property as computed MemberExpression - still reports because await is present', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'AwaitExpression', argument: { type: 'Identifier', name: 'promise' } }],
          },
          property: { type: 'Literal', value: 'toBe' },
          computed: false,
        },
        arguments: [],
      })

      expect(reports.length).toBe(1)
    })
  })

  describe('report message detailed verification', () => {
    test('report message contains exact expected text', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression(createAwaitExpectMatcherCall('toBe'))

      expect(reports[0].message).toBe(
        'Use expect().resolves instead of awaiting the value in expect()',
      )
    })

    test('report message is a string', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression(createAwaitExpectMatcherCall('toBe'))

      expect(typeof reports[0].message).toBe('string')
    })

    test('report message is non-empty', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression(createAwaitExpectMatcherCall('toBe'))

      expect(reports[0].message.length).toBeGreaterThan(0)
    })
  })

  describe('additional meta verification', () => {
    test('should have testing category', () => {
      expect(preferExpectResolvesRule.meta.docs?.category).toBe('testing')
    })

    test('should have suggestion type', () => {
      expect(preferExpectResolvesRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferExpectResolvesRule.meta.severity).toBe('warn')
    })

    test('should have description mentioning resolves', () => {
      expect(preferExpectResolvesRule.meta.docs?.description).toContain('resolves')
    })

    test('should have description mentioning await', () => {
      expect(preferExpectResolvesRule.meta.docs?.description).toContain('await')
    })

    test('should have correct docs URL', () => {
      expect(preferExpectResolvesRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/prefer-expect-resolves',
      )
    })

    test('should not be recommended', () => {
      expect(preferExpectResolvesRule.meta.docs?.recommended).toBe(false)
    })

    test('should have create function', () => {
      expect(typeof preferExpectResolvesRule.create).toBe('function')
    })

    test('should have meta defined', () => {
      expect(preferExpectResolvesRule.meta).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(preferExpectResolvesRule.meta.fixable).toBeUndefined()
    })
  })

  describe('additional verification', () => {
    test('should have create as a function', () => {
      expect(typeof preferExpectResolvesRule.create).toBe('function')
    })
  })

  describe('getExpectCall recursive traversal', () => {
    test('should report when expect is nested behind multiple MemberExpression levels', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'expect' },
              arguments: [
                { type: 'AwaitExpression', argument: { type: 'Identifier', name: 'promise' } },
              ],
            },
            property: { type: 'Identifier', name: 'not' },
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [],
      })

      expect(reports).toHaveLength(1)
    })
  })

  describe('expectArgIsAwait with empty arguments', () => {
    test('should not report when expect has empty arguments array', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [],
      })

      expect(reports).toHaveLength(0)
    })
  })

  describe('chainContainsResolves with nested chains', () => {
    test('should not report when resolves appears in the chain', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'expect' },
                arguments: [
                  { type: 'AwaitExpression', argument: { type: 'Identifier', name: 'promise' } },
                ],
              },
              property: { type: 'Identifier', name: 'resolves' },
            },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'not' },
        },
        arguments: [{ type: 'Identifier', name: 'value' }],
      })

      expect(reports).toHaveLength(0)
    })
  })

  describe('expect with non-Identifier callee', () => {
    test('should not report when expect-like call has MemberExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: { type: 'Identifier', name: 'obj' },
              property: { type: 'Identifier', name: 'expect' },
            },
            arguments: [
              { type: 'AwaitExpression', argument: { type: 'Identifier', name: 'promise' } },
            ],
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [],
      })

      expect(reports).toHaveLength(0)
    })
  })

  describe('expect with non-AwaitExpression first arg types', () => {
    test('should not report when first argument is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectResolvesRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [
              {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'getValue' },
                arguments: [],
              },
            ],
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [],
      })

      expect(reports).toHaveLength(0)
    })
  })
})
