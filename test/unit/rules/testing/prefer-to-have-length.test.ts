import { describe, test, expect, vi } from 'vitest'
import { preferToHaveLengthRule } from '../../../../src/rules/testing/prefer-to-have-length.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.test.ts',
  source = 'expect(arr.length).toBe(3);',
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

function createLengthWithMatcherCall(
  matcher: 'toBe' | 'toEqual' | 'toStrictEqual',
  lengthValue: number | string = 3,
  objectName = 'arr',
  line = 1,
  column = 0,
): unknown {
  const valueNode =
    typeof lengthValue === 'number'
      ? { type: 'Literal', value: lengthValue }
      : { type: 'Identifier', name: lengthValue }

  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [
          {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: objectName },
            property: { type: 'Identifier', name: 'length' },
          },
        ],
      },
      property: { type: 'Identifier', name: matcher },
    },
    arguments: [valueNode],
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
}

function createNotLengthWithMatcherCall(
  matcher: 'toBe' | 'toEqual' | 'toStrictEqual',
  lengthValue: number = 0,
  objectName = 'arr',
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
              {
                type: 'MemberExpression',
                object: { type: 'Identifier', name: objectName },
                property: { type: 'Identifier', name: 'length' },
              },
            ],
          },
          property: { type: 'Identifier', name: 'not' },
        },
        arguments: [],
      },
      property: { type: 'Identifier', name: matcher },
    },
    arguments: [{ type: 'Literal', value: lengthValue }],
    loc: { start: { line, column }, end: { line, column: column + 40 } },
  }
}

function createToHaveLengthCall(
  lengthValue: number = 3,
  objectName = 'arr',
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
        arguments: [{ type: 'Identifier', name: objectName }],
      },
      property: { type: 'Identifier', name: 'toHaveLength' },
    },
    arguments: [{ type: 'Literal', value: lengthValue }],
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
}

function createLengthWithNonEqualityMatcher(
  matcherName: string,
  objectName = 'arr',
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
          {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: objectName },
            property: { type: 'Identifier', name: 'length' },
          },
        ],
      },
      property: { type: 'Identifier', name: matcherName },
    },
    arguments: [{ type: 'Literal', value: 5 }],
    loc: { start: { line, column }, end: { line, column: column + 35 } },
  }
}

function createNonLengthWithToBeCall(
  objectName = 'arr',
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
        arguments: [{ type: 'Identifier', name: objectName }],
      },
      property: { type: 'Identifier', name: 'toBe' },
    },
    arguments: [{ type: 'Literal', value: 3 }],
    loc: { start: { line, column }, end: { line, column: column + 25 } },
  }
}

function createNonExpectLengthToBeCall(
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
          {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'arr' },
            property: { type: 'Identifier', name: 'length' },
          },
        ],
      },
      property: { type: 'Identifier', name: 'toBe' },
    },
    arguments: [{ type: 'Literal', value: 3 }],
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
}

function createMatcherCall(matcherName: string, line = 1, column = 0): unknown {
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
    loc: { start: { line, column }, end: { line, column: column + 20 } },
  }
}

function createResolvesLengthToBeCall(
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
            arguments: [{ type: 'Identifier', name: 'promise' }],
          },
          property: { type: 'Identifier', name: 'resolves' },
        },
        arguments: [],
      },
      property: { type: 'Identifier', name: 'toBe' },
    },
    arguments: [{ type: 'Literal', value: 5 }],
    loc: { start: { line, column }, end: { line, column: column + 40 } },
  }
}

describe('prefer-to-have-length rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferToHaveLengthRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferToHaveLengthRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(preferToHaveLengthRule.meta.docs?.recommended).toBe(false)
    })

    test('should have testing category', () => {
      expect(preferToHaveLengthRule.meta.docs?.category).toBe('testing')
    })

    test('should have correct description mentioning toHaveLength', () => {
      expect(preferToHaveLengthRule.meta.docs?.description).toContain('toHaveLength')
    })

    test('should have correct description mentioning .length', () => {
      expect(preferToHaveLengthRule.meta.docs?.description).toContain('.length')
    })

    test('should have correct docs URL', () => {
      expect(preferToHaveLengthRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/prefer-to-have-length',
      )
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = preferToHaveLengthRule.create(context)
      const visitor2 = preferToHaveLengthRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })
  })

  describe('detecting arr.length.toBe(N) violations', () => {
    test('should report expect(arr.length).toBe(3)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      visitor.CallExpression(createLengthWithMatcherCall('toBe', 3))

      expect(reports.length).toBe(1)
    })

    test('should report expect(arr.length).toBe(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      visitor.CallExpression(createLengthWithMatcherCall('toBe', 0))

      expect(reports.length).toBe(1)
    })

    test('should report expect(arr.length).toBe(10)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      visitor.CallExpression(createLengthWithMatcherCall('toBe', 10))

      expect(reports.length).toBe(1)
    })

    test('should report correct location for toBe call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      visitor.CallExpression(createLengthWithMatcherCall('toBe', 3, 'arr', 5, 8))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should report for string .length with toBe', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      visitor.CallExpression(createLengthWithMatcherCall('toBe', 5, 'str'))

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting arr.length.toEqual(N) violations', () => {
    test('should report expect(arr.length).toEqual(3)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      visitor.CallExpression(createLengthWithMatcherCall('toEqual', 3))

      expect(reports.length).toBe(1)
    })

    test('should report expect(arr.length).toEqual(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      visitor.CallExpression(createLengthWithMatcherCall('toEqual', 0))

      expect(reports.length).toBe(1)
    })

    test('should report expect(str.length).toEqual(5)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      visitor.CallExpression(createLengthWithMatcherCall('toEqual', 5, 'str'))

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting arr.length.toStrictEqual(N) violations', () => {
    test('should report expect(arr.length).toStrictEqual(3)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      visitor.CallExpression(createLengthWithMatcherCall('toStrictEqual', 3))

      expect(reports.length).toBe(1)
    })

    test('should report expect(arr.length).toStrictEqual(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      visitor.CallExpression(createLengthWithMatcherCall('toStrictEqual', 0))

      expect(reports.length).toBe(1)
    })
  })

  describe('.not chain violations', () => {
    test('should report expect(arr.length).not.toBe(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      visitor.CallExpression(createNotLengthWithMatcherCall('toBe', 0))

      expect(reports.length).toBe(1)
    })

    test('should report expect(arr.length).not.toEqual(3)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      visitor.CallExpression(createNotLengthWithMatcherCall('toEqual', 3))

      expect(reports.length).toBe(1)
    })

    test('should report expect(arr.length).not.toStrictEqual(3)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      visitor.CallExpression(createNotLengthWithMatcherCall('toStrictEqual', 3))

      expect(reports.length).toBe(1)
    })

    test('should report correct location for .not chain', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      visitor.CallExpression(createNotLengthWithMatcherCall('toBe', 0, 'arr', 10, 4))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
    })
  })

  describe('no violations — toHaveLength directly', () => {
    test('should not report expect(arr).toHaveLength(3)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      visitor.CallExpression(createToHaveLengthCall(3))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(arr).toHaveLength(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      visitor.CallExpression(createToHaveLengthCall(0))

      expect(reports.length).toBe(0)
    })
  })

  describe('no violations — length with non-equality matchers', () => {
    test('should not report expect(arr.length).toBeGreaterThan(2)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      visitor.CallExpression(createLengthWithNonEqualityMatcher('toBeGreaterThan'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(arr.length).toBeLessThan(10)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      visitor.CallExpression(createLengthWithNonEqualityMatcher('toBeLessThan'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(arr.length).toBeGreaterThanOrEqual(2)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      visitor.CallExpression(createLengthWithNonEqualityMatcher('toBeGreaterThanOrEqual'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(arr.length).toBeLessThanOrEqual(10)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      visitor.CallExpression(createLengthWithNonEqualityMatcher('toBeLessThanOrEqual'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(arr.length).toBeCloseTo(5)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      visitor.CallExpression(createLengthWithNonEqualityMatcher('toBeCloseTo'))

      expect(reports.length).toBe(0)
    })
  })

  describe('no violations — non-.length with equality matchers', () => {
    test('should not report expect(arr).toBe(3)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      visitor.CallExpression(createNonLengthWithToBeCall())

      expect(reports.length).toBe(0)
    })

    test('should not report expect(count).toBe(3)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      visitor.CallExpression(createNonLengthWithToBeCall('count'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toBeNull()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      visitor.CallExpression(createMatcherCall('toBeNull'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toBeUndefined()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      visitor.CallExpression(createMatcherCall('toBeUndefined'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toBeDefined()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      visitor.CallExpression(createMatcherCall('toBeDefined'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toBeTruthy()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      visitor.CallExpression(createMatcherCall('toBeTruthy'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toBeFalsy()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      visitor.CallExpression(createMatcherCall('toBeFalsy'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toMatchSnapshot()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      visitor.CallExpression(createMatcherCall('toMatchSnapshot'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toContain()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      visitor.CallExpression(createMatcherCall('toContain'))

      expect(reports.length).toBe(0)
    })
  })

  describe('no violations — non-expect calls', () => {
    test('should not report something(arr.length).toBe(3)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      visitor.CallExpression(createNonExpectLengthToBeCall())

      expect(reports.length).toBe(0)
    })
  })

  describe('no violations — .resolves chain without .length', () => {
    test('should not report expect(promise).resolves.toBe(5)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      visitor.CallExpression(createResolvesLengthToBeCall())

      expect(reports.length).toBe(0)
    })
  })

  describe('multiple violations', () => {
    test('should report multiple length.toBe calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      visitor.CallExpression(createLengthWithMatcherCall('toBe', 3, 'arr', 1, 0))
      visitor.CallExpression(createLengthWithMatcherCall('toBe', 5, 'str', 2, 0))
      visitor.CallExpression(createLengthWithMatcherCall('toEqual', 0, 'list', 3, 0))

      expect(reports.length).toBe(3)
    })

    test('should report mixed violations and pass valid calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      visitor.CallExpression(createLengthWithMatcherCall('toBe', 3, 'arr', 1, 0))
      visitor.CallExpression(createToHaveLengthCall(3, 'arr', 2, 0))
      visitor.CallExpression(createLengthWithMatcherCall('toEqual', 5, 'str', 3, 0))
      visitor.CallExpression(createNonLengthWithToBeCall('arr', 4, 0))

      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(3)
    })
  })

  describe('report message content', () => {
    test('message mentions toHaveLength with numeric value', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      visitor.CallExpression(createLengthWithMatcherCall('toBe', 3))

      expect(reports[0].message).toContain('toHaveLength(3)')
    })

    test('message mentions toHaveLength with value 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      visitor.CallExpression(createLengthWithMatcherCall('toBe', 0))

      expect(reports[0].message).toContain('toHaveLength(0)')
    })

    test('message mentions .length', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      visitor.CallExpression(createLengthWithMatcherCall('toBe', 3))

      expect(reports[0].message).toContain('.length')
    })

    test('message does not use ESLint placeholder format', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      visitor.CallExpression(createLengthWithMatcherCall('toBe', 3))

      expect(reports[0].message).not.toContain('{{')
      expect(reports[0].message).not.toContain('}}')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      visitor.CallExpression(createLengthWithMatcherCall('toBe', 3, 'arr', 5, 10))

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('message includes identifier name for variable arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      visitor.CallExpression(createLengthWithMatcherCall('toBe', 'expected' as unknown as number))

      expect(reports[0].message).toContain('toHaveLength(expected)')
      expect(reports[0].message).toContain('.length')
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      visitor.CallExpression({ type: 'CallExpression', arguments: [] })

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      const node = createLengthWithMatcherCall('toBe', 3)
      delete (node as Record<string, unknown>).loc

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression with Identifier callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'toBe' },
        arguments: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node with property but no object on callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

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
      const visitor = preferToHaveLengthRule.create(context)

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

    test('should not report when property name is not an equality matcher', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [
              {
                type: 'MemberExpression',
                object: { type: 'Identifier', name: 'arr' },
                property: { type: 'Identifier', name: 'length' },
              },
            ],
          },
          property: { type: 'Identifier', name: 'toBeGreaterThan' },
        },
        arguments: [{ type: 'Literal', value: 5 }],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle expect().length where expect argument is not MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'arr' }],
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [{ type: 'Literal', value: 3 }],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle deeply nested expect calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      visitor.CallExpression(createLengthWithMatcherCall('toBe', 3, 'arr', 2, 4))
      visitor.CallExpression(createMatcherCall('toBeNull', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should handle expect with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

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
        arguments: [{ type: 'Literal', value: 3 }],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle expect with property other than length', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [
              {
                type: 'MemberExpression',
                object: { type: 'Identifier', name: 'arr' },
                property: { type: 'Identifier', name: 'size' },
              },
            ],
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [{ type: 'Literal', value: 3 }],
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('state isolation between visitors', () => {
    test('separate visitors have separate state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()

      const visitor1 = preferToHaveLengthRule.create(ctx1)
      const visitor2 = preferToHaveLengthRule.create(ctx2)

      visitor1.CallExpression(createLengthWithMatcherCall('toBe', 3))
      visitor2.CallExpression(createToHaveLengthCall(3))

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      visitor.CallExpression(createLengthWithMatcherCall('toBe', 3, 'arr', 1, 0))
      visitor.CallExpression(createLengthWithMatcherCall('toEqual', 5, 'str', 2, 0))
      visitor.CallExpression(createToHaveLengthCall(3, 'arr', 3, 0))
      visitor.CallExpression(createLengthWithMatcherCall('toStrictEqual', 0, 'list', 4, 0))

      expect(reports.length).toBe(3)
    })
  })

  describe('default export', () => {
    test('rule should be the default export', () => {
      expect(preferToHaveLengthRule).toBeDefined()
      expect(preferToHaveLengthRule.meta).toBeDefined()
      expect(preferToHaveLengthRule.create).toBeDefined()
    })
  })

  describe('.resolves and .rejects chains with .length', () => {
    test('should report expect(promise).resolves.toEqual(length)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

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
          property: { type: 'Identifier', name: 'toEqual' },
        },
        arguments: [{ type: 'Identifier', name: 'length' }],
      })

      // This should NOT report because it's not checking .length on the expect arg
      expect(reports.length).toBe(0)
    })

    test('should report expect(arr.length).rejects.toBe(3)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

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
                  {
                    type: 'MemberExpression',
                    object: { type: 'Identifier', name: 'arr' },
                    property: { type: 'Identifier', name: 'length' },
                  },
                ],
              },
              property: { type: 'Identifier', name: 'rejects' },
            },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [{ type: 'Literal', value: 3 }],
      })

      expect(reports.length).toBe(1)
    })
  })

  describe('additional meta tests', () => {
    test('should have type property on meta', () => {
      expect(preferToHaveLengthRule.meta).toHaveProperty('type')
    })

    test('should have severity property on meta', () => {
      expect(preferToHaveLengthRule.meta).toHaveProperty('severity')
    })

    test('should have docs property on meta', () => {
      expect(preferToHaveLengthRule.meta).toHaveProperty('docs')
    })

    test('docs object should have required properties', () => {
      expect(preferToHaveLengthRule.meta.docs).toHaveProperty('category')
      expect(preferToHaveLengthRule.meta.docs).toHaveProperty('description')
      expect(preferToHaveLengthRule.meta.docs).toHaveProperty('recommended')
      expect(preferToHaveLengthRule.meta.docs).toHaveProperty('url')
    })
  })

  describe('argument type variations', () => {
    test('should handle negative number literals', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [
              {
                type: 'MemberExpression',
                object: { type: 'Identifier', name: 'arr' },
                property: { type: 'Identifier', name: 'length' },
              },
            ],
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [{ type: 'Literal', value: -1 }],
      })

      expect(reports.length).toBe(1)
    })

    test('should handle very large number literals', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [
              {
                type: 'MemberExpression',
                object: { type: 'Identifier', name: 'arr' },
                property: { type: 'Identifier', name: 'length' },
              },
            ],
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [{ type: 'Literal', value: 999999 }],
      })

      expect(reports.length).toBe(1)
    })

    test('should handle floating point number literals', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [
              {
                type: 'MemberExpression',
                object: { type: 'Identifier', name: 'arr' },
                property: { type: 'Identifier', name: 'length' },
              },
            ],
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [{ type: 'Literal', value: 3.5 }],
      })

      expect(reports.length).toBe(1)
    })
  })

  describe('.not.toHaveLength() negative case', () => {
    test('should not report expect(arr).not.toHaveLength(3)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

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
                arguments: [{ type: 'Identifier', name: 'arr' }],
              },
              property: { type: 'Identifier', name: 'not' },
            },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'toHaveLength' },
        },
        arguments: [{ type: 'Literal', value: 3 }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('additional meta verification', () => {
    test('should have testing category', () => {
      expect(preferToHaveLengthRule.meta.docs?.category).toBe('testing')
    })

    test('should have suggestion type', () => {
      expect(preferToHaveLengthRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferToHaveLengthRule.meta.severity).toBe('warn')
    })

    test('should have description mentioning toHaveLength', () => {
      expect(preferToHaveLengthRule.meta.docs?.description).toContain('toHaveLength')
    })

    test('should have correct docs URL', () => {
      expect(preferToHaveLengthRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/prefer-to-have-length',
      )
    })
  })

  describe('additional coverage', () => {
    test('should report expect(arr.length).toBe with identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)
      visitor.CallExpression(createLengthWithMatcherCall('toBe', 'count'))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('count')
    })

    test('should report expect(arr.length).toEqual with identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)
      visitor.CallExpression(createLengthWithMatcherCall('toEqual', 'size'))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('size')
    })

    test('should report expect(arr.length).toStrictEqual with identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)
      visitor.CallExpression(createLengthWithMatcherCall('toStrictEqual', 'n'))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('n')
    })

    test('should report expect(arr.length).not.toEqual with value', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)
      visitor.CallExpression(createNotLengthWithMatcherCall('toEqual', 5))
      expect(reports).toHaveLength(1)
    })

    test('should report expect(arr.length).not.toStrictEqual with value', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)
      visitor.CallExpression(createNotLengthWithMatcherCall('toStrictEqual', 7))
      expect(reports).toHaveLength(1)
    })

    test('should not report expect(obj.count).toBe(3)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{
              type: 'MemberExpression',
              object: { type: 'Identifier', name: 'obj' },
              property: { type: 'Identifier', name: 'count' },
            }],
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [{ type: 'Literal', value: 3 }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should report with different object names', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)
      visitor.CallExpression(createLengthWithMatcherCall('toBe', 5, 'items'))
      expect(reports).toHaveLength(1)
    })

    test('should handle expect with string argument having .length', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)
      visitor.CallExpression(createLengthWithMatcherCall('toBe', 10, 'str'))
      expect(reports).toHaveLength(1)
    })

    test('should report correct location for multiple violations', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)
      visitor.CallExpression(createLengthWithMatcherCall('toBe', 3, 'arr', 5, 0))
      visitor.CallExpression(createLengthWithMatcherCall('toEqual', 2, 'list', 10, 4))
      expect(reports).toHaveLength(2)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[1].loc?.start.line).toBe(10)
      expect(reports[1].loc?.start.column).toBe(4)
    })

    test('should not report when expect argument is a bare identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'length' }],
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [{ type: 'Literal', value: 3 }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })
      expect(reports).toHaveLength(0)
    })
  })

  // SECTION: generic message when matcher argument is not a number or identifier
  describe('generic message for non-simple matcher arguments', () => {
    test('should report generic message when matcher has no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{
              type: 'MemberExpression',
              object: { type: 'Identifier', name: 'arr' },
              property: { type: 'Identifier', name: 'length' },
            }],
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })

      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('toHaveLength()')
      expect(reports[0].message).not.toContain('toHaveLength(3)')
    })

    test('should report generic message when matcher argument is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{
              type: 'MemberExpression',
              object: { type: 'Identifier', name: 'arr' },
              property: { type: 'Identifier', name: 'length' },
            }],
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [{
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'count' },
        }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })

      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('toHaveLength()')
      expect(reports[0].message).not.toContain('toHaveLength(obj')
    })

    test('should report generic message when matcher argument is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{
              type: 'MemberExpression',
              object: { type: 'Identifier', name: 'arr' },
              property: { type: 'Identifier', name: 'length' },
            }],
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [{
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'getCount' },
          arguments: [],
        }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })

      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('toHaveLength()')
      expect(reports[0].message).not.toContain('toHaveLength(getCount')
    })

    test('should report .not chain with identifier argument in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToHaveLengthRule.create(context)

      visitor.CallExpression(createNotLengthWithMatcherCall('toStrictEqual', 0, 'items', 7, 2))

      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('toHaveLength(0)')
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(2)
    })
  })
})
