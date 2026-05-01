import { describe, test, expect, vi } from 'vitest'
import { preferToBeUndefinedRule } from '../../../../src/rules/testing/prefer-to-be-undefined.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.test.ts',
  source = 'expect(x).toBe(undefined);',
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

type ArgumentType =
  | 'undefined'
  | 'null'
  | 'variable'
  | 'string'
  | 'number'
  | 'boolean'
  | 'object'
  | 'array'
  | 'function'

function createArg(type: ArgumentType): unknown {
  switch (type) {
    case 'undefined':
      return { type: 'Identifier', name: 'undefined' }
    case 'null':
      return { type: 'Literal', value: null }
    case 'variable':
      return { type: 'Identifier', name: 'expected' }
    case 'string':
      return { type: 'Literal', value: 'hello' }
    case 'number':
      return { type: 'Literal', value: 42 }
    case 'boolean':
      return { type: 'Literal', value: true }
    case 'object':
      return { type: 'ObjectExpression', properties: [] }
    case 'array':
      return { type: 'ArrayExpression', elements: [] }
    case 'function':
      return {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'getResult' },
        arguments: [],
      }
  }
}

function createMatcherWithArg(
  matcherName: string,
  argType: ArgumentType = 'undefined',
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
        arguments: [{ type: 'Identifier', name: 'x' }],
      },
      property: { type: 'Identifier', name: matcherName },
    },
    arguments: [createArg(argType)],
    loc: { start: { line, column }, end: { line, column: column + 25 } },
  }
}

function createNotMatcherWithArg(
  matcherName: string,
  argType: ArgumentType = 'undefined',
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
            arguments: [{ type: 'Identifier', name: 'x' }],
          },
          property: { type: 'Identifier', name: 'not' },
        },
        arguments: [],
      },
      property: { type: 'Identifier', name: matcherName },
    },
    arguments: [createArg(argType)],
    loc: { start: { line, column }, end: { line, column: column + 35 } },
  }
}

function createResolvesMatcherWithArg(
  matcherName: string,
  argType: ArgumentType = 'undefined',
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
      property: { type: 'Identifier', name: matcherName },
    },
    arguments: [createArg(argType)],
    loc: { start: { line, column }, end: { line, column: column + 40 } },
  }
}

function createRejectsMatcherWithArg(
  matcherName: string,
  argType: ArgumentType = 'undefined',
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
          property: { type: 'Identifier', name: 'rejects' },
        },
        arguments: [],
      },
      property: { type: 'Identifier', name: matcherName },
    },
    arguments: [createArg(argType)],
    loc: { start: { line, column }, end: { line, column: column + 40 } },
  }
}

function createNonExpectMatcherWithArg(
  matcherName: string,
  argType: ArgumentType = 'undefined',
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
        arguments: [{ type: 'Identifier', name: 'x' }],
      },
      property: { type: 'Identifier', name: matcherName },
    },
    arguments: [createArg(argType)],
    loc: { start: { line, column }, end: { line, column: column + 25 } },
  }
}

function createMatcherNoArg(
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
        arguments: [{ type: 'Identifier', name: 'x' }],
      },
      property: { type: 'Identifier', name: matcherName },
    },
    arguments: [],
    loc: { start: { line, column }, end: { line, column: column + 20 } },
  }
}

describe('prefer-to-be-undefined rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferToBeUndefinedRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferToBeUndefinedRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(preferToBeUndefinedRule.meta.docs?.recommended).toBe(false)
    })

    test('should have testing category', () => {
      expect(preferToBeUndefinedRule.meta.docs?.category).toBe('testing')
    })

    test('should have correct description mentioning toBeUndefined', () => {
      expect(preferToBeUndefinedRule.meta.docs?.description).toContain(
        'toBeUndefined',
      )
    })

    test('should have correct description mentioning toBe(undefined)', () => {
      expect(preferToBeUndefinedRule.meta.docs?.description).toContain(
        'toBe(undefined)',
      )
    })

    test('should have correct docs URL', () => {
      expect(preferToBeUndefinedRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/prefer-to-be-undefined',
      )
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = preferToBeUndefinedRule.create(context)
      const visitor2 = preferToBeUndefinedRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })
  })

  describe('detecting expect(x).toBe(undefined)', () => {
    test('should report expect(x).toBe(undefined)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(createMatcherWithArg('toBe', 'undefined'))

      expect(reports.length).toBe(1)
    })

    test('should not report expect(x).toBe(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(createMatcherWithArg('toBe', 'null'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toBe(variable)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(createMatcherWithArg('toBe', 'variable'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toBe("hello")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(createMatcherWithArg('toBe', 'string'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toBe(42)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(createMatcherWithArg('toBe', 'number'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toBe(true)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(createMatcherWithArg('toBe', 'boolean'))

      expect(reports.length).toBe(0)
    })

    test('should report correct location for toBe(undefined)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(
        createMatcherWithArg('toBe', 'undefined', 5, 8),
      )

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should not report expect(x).toBe(object)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(createMatcherWithArg('toBe', 'object'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toBe(array)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(createMatcherWithArg('toBe', 'array'))

      expect(reports.length).toBe(0)
    })
  })

  describe('detecting expect(x).toEqual(undefined)', () => {
    test('should report expect(x).toEqual(undefined)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(createMatcherWithArg('toEqual', 'undefined'))

      expect(reports.length).toBe(1)
    })

    test('should not report expect(x).toEqual(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(createMatcherWithArg('toEqual', 'null'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toEqual(variable)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(createMatcherWithArg('toEqual', 'variable'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toEqual("hello")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(createMatcherWithArg('toEqual', 'string'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toEqual(42)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(createMatcherWithArg('toEqual', 'number'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toEqual({})', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(createMatcherWithArg('toEqual', 'object'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toEqual([])', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(createMatcherWithArg('toEqual', 'array'))

      expect(reports.length).toBe(0)
    })

    test('should report correct location for toEqual(undefined)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(
        createMatcherWithArg('toEqual', 'undefined', 3, 4),
      )

      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should not report expect(x).toEqual(fn())', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(createMatcherWithArg('toEqual', 'function'))

      expect(reports.length).toBe(0)
    })
  })

  describe('detecting expect(x).toStrictEqual(undefined)', () => {
    test('should report expect(x).toStrictEqual(undefined)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(
        createMatcherWithArg('toStrictEqual', 'undefined'),
      )

      expect(reports.length).toBe(1)
    })

    test('should not report expect(x).toStrictEqual(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(createMatcherWithArg('toStrictEqual', 'null'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toStrictEqual(variable)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(createMatcherWithArg('toStrictEqual', 'variable'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toStrictEqual("hello")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(createMatcherWithArg('toStrictEqual', 'string'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toStrictEqual(42)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(createMatcherWithArg('toStrictEqual', 'number'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toStrictEqual({})', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(createMatcherWithArg('toStrictEqual', 'object'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toStrictEqual([])', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(createMatcherWithArg('toStrictEqual', 'array'))

      expect(reports.length).toBe(0)
    })

    test('should report correct location for toStrictEqual(undefined)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(
        createMatcherWithArg('toStrictEqual', 'undefined', 7, 2),
      )

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(2)
    })

    test('should not report expect(x).toStrictEqual(fn())', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(createMatcherWithArg('toStrictEqual', 'function'))

      expect(reports.length).toBe(0)
    })
  })

  describe('.not chains — reports', () => {
    test('should report expect(x).not.toBe(undefined)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(createNotMatcherWithArg('toBe', 'undefined'))

      expect(reports.length).toBe(1)
    })

    test('should report expect(x).not.toEqual(undefined)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(createNotMatcherWithArg('toEqual', 'undefined'))

      expect(reports.length).toBe(1)
    })

    test('should report expect(x).not.toStrictEqual(undefined)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(
        createNotMatcherWithArg('toStrictEqual', 'undefined'),
      )

      expect(reports.length).toBe(1)
    })

    test('should not report expect(x).not.toBe(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(createNotMatcherWithArg('toBe', 'null'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).not.toEqual(variable)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(createNotMatcherWithArg('toEqual', 'variable'))

      expect(reports.length).toBe(0)
    })

    test('should report correct location for .not.toBe(undefined)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(
        createNotMatcherWithArg('toBe', 'undefined', 10, 4),
      )

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
    })
  })

  describe('.resolves chains — reports', () => {
    test('should report expect(promise).resolves.toBe(undefined)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(createResolvesMatcherWithArg('toBe', 'undefined'))

      expect(reports.length).toBe(1)
    })

    test('should report expect(promise).resolves.toEqual(undefined)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(
        createResolvesMatcherWithArg('toEqual', 'undefined'),
      )

      expect(reports.length).toBe(1)
    })

    test('should report expect(promise).resolves.toStrictEqual(undefined)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(
        createResolvesMatcherWithArg('toStrictEqual', 'undefined'),
      )

      expect(reports.length).toBe(1)
    })

    test('should not report expect(promise).resolves.toBe(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(createResolvesMatcherWithArg('toBe', 'null'))

      expect(reports.length).toBe(0)
    })

    test('should report correct location for .resolves.toBe(undefined)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(
        createResolvesMatcherWithArg('toBe', 'undefined', 15, 6),
      )

      expect(reports[0].loc?.start.line).toBe(15)
      expect(reports[0].loc?.start.column).toBe(6)
    })
  })

  describe('.rejects chains — reports', () => {
    test('should report expect(promise).rejects.toBe(undefined)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(createRejectsMatcherWithArg('toBe', 'undefined'))

      expect(reports.length).toBe(1)
    })

    test('should report expect(promise).rejects.toEqual(undefined)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(
        createRejectsMatcherWithArg('toEqual', 'undefined'),
      )

      expect(reports.length).toBe(1)
    })

    test('should report expect(promise).rejects.toStrictEqual(undefined)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(
        createRejectsMatcherWithArg('toStrictEqual', 'undefined'),
      )

      expect(reports.length).toBe(1)
    })

    test('should not report expect(promise).rejects.toBe(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(createRejectsMatcherWithArg('toBe', 'null'))

      expect(reports.length).toBe(0)
    })

    test('should report correct location for .rejects.toEqual(undefined)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(
        createRejectsMatcherWithArg('toEqual', 'undefined', 20, 3),
      )

      expect(reports[0].loc?.start.line).toBe(20)
      expect(reports[0].loc?.start.column).toBe(3)
    })
  })

  describe('valid matchers — no reports', () => {
    test('should not report expect(x).toBeUndefined()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(createMatcherNoArg('toBeUndefined'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toBeDefined()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(createMatcherNoArg('toBeDefined'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toBeNull()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(createMatcherNoArg('toBeNull'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toBeTruthy()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(createMatcherNoArg('toBeTruthy'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toBeFalsy()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(createMatcherNoArg('toBeFalsy'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toHaveBeenCalled()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(createMatcherNoArg('toHaveBeenCalled'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toHaveBeenCalledWith()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(createMatcherNoArg('toHaveBeenCalledWith'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toMatchSnapshot()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(createMatcherNoArg('toMatchSnapshot'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toMatch()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(createMatcherNoArg('toMatch'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toThrow()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(createMatcherNoArg('toThrow'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toContain()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(createMatcherNoArg('toContain'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toBeGreaterThan()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(createMatcherNoArg('toBeGreaterThan'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toBeCloseTo()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(createMatcherNoArg('toBeCloseTo'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toMatchInlineSnapshot()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(createMatcherNoArg('toMatchInlineSnapshot'))

      expect(reports.length).toBe(0)
    })
  })

  describe('non-expect calls — no reports', () => {
    test('should not report something(x).toBe(undefined)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(createNonExpectMatcherWithArg('toBe', 'undefined'))

      expect(reports.length).toBe(0)
    })

    test('should not report something(x).toEqual(undefined)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(
        createNonExpectMatcherWithArg('toEqual', 'undefined'),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report something(x).toStrictEqual(undefined)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(
        createNonExpectMatcherWithArg('toStrictEqual', 'undefined'),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('multiple violations', () => {
    test('should report multiple toBe(undefined) calls in one file', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(
        createMatcherWithArg('toBe', 'undefined', 1, 0),
      )
      visitor.CallExpression(
        createMatcherWithArg('toBe', 'undefined', 2, 0),
      )
      visitor.CallExpression(
        createMatcherWithArg('toBe', 'undefined', 3, 0),
      )

      expect(reports.length).toBe(3)
    })

    test('should report mixed violations across matchers', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(
        createMatcherWithArg('toBe', 'undefined', 1, 0),
      )
      visitor.CallExpression(
        createMatcherWithArg('toEqual', 'undefined', 2, 0),
      )
      visitor.CallExpression(
        createMatcherWithArg('toStrictEqual', 'undefined', 3, 0),
      )

      expect(reports.length).toBe(3)
    })

    test('should report violations and pass valid calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(
        createMatcherWithArg('toBe', 'undefined', 1, 0),
      )
      visitor.CallExpression(createMatcherNoArg('toBeUndefined', 2, 0))
      visitor.CallExpression(
        createMatcherWithArg('toEqual', 'null', 3, 0),
      )
      visitor.CallExpression(
        createMatcherWithArg('toEqual', 'undefined', 4, 0),
      )

      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(4)
    })

    test('should report violations across chain types', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(
        createMatcherWithArg('toBe', 'undefined', 1, 0),
      )
      visitor.CallExpression(
        createNotMatcherWithArg('toEqual', 'undefined', 2, 0),
      )
      visitor.CallExpression(
        createResolvesMatcherWithArg('toBe', 'undefined', 3, 0),
      )
      visitor.CallExpression(
        createRejectsMatcherWithArg('toStrictEqual', 'undefined', 4, 0),
      )

      expect(reports.length).toBe(4)
    })
  })

  describe('report message content', () => {
    test('message mentions toBeUndefined for toBe(undefined)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(createMatcherWithArg('toBe', 'undefined'))

      expect(reports[0].message).toContain('toBeUndefined')
    })

    test('message mentions toBe(undefined) for toBe matcher', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(createMatcherWithArg('toBe', 'undefined'))

      expect(reports[0].message).toContain('toBe(undefined)')
    })

    test('message mentions toEqual(undefined) for toEqual matcher', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(createMatcherWithArg('toEqual', 'undefined'))

      expect(reports[0].message).toContain('toEqual(undefined)')
    })

    test('message mentions toStrictEqual(undefined) for toStrictEqual matcher', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(
        createMatcherWithArg('toStrictEqual', 'undefined'),
      )

      expect(reports[0].message).toContain('toStrictEqual(undefined)')
    })

    test('message does not use ESLint placeholder format', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(createMatcherWithArg('toBe', 'undefined'))

      expect(reports[0].message).not.toContain('{{')
      expect(reports[0].message).not.toContain('}}')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(
        createMatcherWithArg('toBe', 'undefined', 5, 10),
      )

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression({ type: 'CallExpression', arguments: [] })

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'x' }],
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [{ type: 'Identifier', name: 'undefined' }],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression with Identifier callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'toBe' },
        arguments: [{ type: 'Identifier', name: 'undefined' }],
      })

      expect(reports.length).toBe(0)
    })

    test('should not report when property name is not a target matcher', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'x' }],
          },
          property: { type: 'Identifier', name: 'toBeCloseTo' },
        },
        arguments: [{ type: 'Identifier', name: 'undefined' }],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node with property but null object on callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [{ type: 'Identifier', name: 'undefined' }],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node where callee.object is not a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [{ type: 'Identifier', name: 'undefined' }],
      })

      expect(reports.length).toBe(0)
    })

    test('should not report when arguments array is empty', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'x' }],
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should not report when expect argument is a variable named undefined-ish', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'x' }],
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [{ type: 'Identifier', name: 'undefinedish' }],
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('state isolation between visitors', () => {
    test('separate visitors have separate state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()

      const visitor1 = preferToBeUndefinedRule.create(ctx1)
      const visitor2 = preferToBeUndefinedRule.create(ctx2)

      visitor1.CallExpression(createMatcherWithArg('toBe', 'undefined'))
      visitor2.CallExpression(createMatcherNoArg('toBeUndefined'))

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeUndefinedRule.create(context)

      visitor.CallExpression(
        createMatcherWithArg('toBe', 'undefined', 1, 0),
      )
      visitor.CallExpression(
        createMatcherWithArg('toEqual', 'undefined', 2, 0),
      )
      visitor.CallExpression(createMatcherNoArg('toBeUndefined', 3, 0))
      visitor.CallExpression(
        createMatcherWithArg('toStrictEqual', 'undefined', 4, 0),
      )

      expect(reports.length).toBe(3)
    })
  })

  describe('default export', () => {
    test('rule should be the default export', () => {
      expect(preferToBeUndefinedRule).toBeDefined()
      expect(preferToBeUndefinedRule.meta).toBeDefined()
      expect(preferToBeUndefinedRule.create).toBeDefined()
    })
  })

  // SECTION: additional coverage
  describe('additional coverage', () => {
    test('meta severity should be warn', () => {
      expect(preferToBeUndefinedRule.meta.severity).toBe('warn')
    })
  })
})
