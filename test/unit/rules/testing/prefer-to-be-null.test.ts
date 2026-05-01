import { describe, test, expect, vi } from 'vitest'
import { preferToBeNullRule } from '../../../../src/rules/testing/prefer-to-be-null.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.test.ts',
  source = 'expect(x).toBe(null);',
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

function createExpectCall(
  matcherName: string,
  argument: unknown,
  modifiers: string[] = [],
  line = 1,
  column = 0,
): unknown {
  let innerObject: unknown = {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'expect' },
    arguments: [{ type: 'Identifier', name: 'x' }],
  }

  for (const mod of modifiers) {
    innerObject = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: innerObject,
        property: { type: 'Identifier', name: mod },
      },
      arguments: [],
    }
  }

  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: innerObject,
      property: { type: 'Identifier', name: matcherName },
    },
    arguments: [argument],
    loc: { start: { line, column }, end: { line, column: column + 25 } },
  }
}

const nullArg = { type: 'Literal', value: null }
const undefinedArg = { type: 'Identifier', name: 'undefined' }
const stringArg = { type: 'Literal', value: 'hello' }
const numberArg = { type: 'Literal', value: 42 }
const trueArg = { type: 'Literal', value: true }
const falseArg = { type: 'Literal', value: false }
const variableArg = { type: 'Identifier', name: 'someVar' }
const objectArg = { type: 'ObjectExpression', properties: [] }
const arrayArg = { type: 'ArrayExpression', elements: [] }

describe('prefer-to-be-null rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferToBeNullRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferToBeNullRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(preferToBeNullRule.meta.docs?.recommended).toBe(false)
    })

    test('should have testing category', () => {
      expect(preferToBeNullRule.meta.docs?.category).toBe('testing')
    })

    test('should have correct description mentioning toBeNull', () => {
      expect(preferToBeNullRule.meta.docs?.description).toContain('toBeNull')
    })

    test('should have correct description mentioning toBe(null)', () => {
      expect(preferToBeNullRule.meta.docs?.description).toContain('toBe(null)')
    })

    test('should have correct docs URL', () => {
      expect(preferToBeNullRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/prefer-to-be-null',
      )
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = preferToBeNullRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = preferToBeNullRule.create(context)
      const visitor2 = preferToBeNullRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })
  })

  describe('detecting toBe(null) violations', () => {
    test('should report expect(x).toBe(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toBe', nullArg))

      expect(reports.length).toBe(1)
    })

    test('should report correct location for toBe(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toBe', nullArg, [], 5, 8))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should report message mentioning toBeNull() for toBe', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toBe', nullArg))

      expect(reports[0].message).toContain('toBeNull()')
    })

    test('should report message mentioning toBe(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toBe', nullArg))

      expect(reports[0].message).toContain('toBe(null)')
    })
  })

  describe('detecting toEqual(null) violations', () => {
    test('should report expect(x).toEqual(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toEqual', nullArg))

      expect(reports.length).toBe(1)
    })

    test('should report correct location for toEqual(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toEqual', nullArg, [], 7, 3))

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should report message mentioning toBeNull() for toEqual', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toEqual', nullArg))

      expect(reports[0].message).toContain('toBeNull()')
    })

    test('should report message mentioning toEqual(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toEqual', nullArg))

      expect(reports[0].message).toContain('toEqual(null)')
    })
  })

  describe('detecting toStrictEqual(null) violations', () => {
    test('should report expect(x).toStrictEqual(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toStrictEqual', nullArg))

      expect(reports.length).toBe(1)
    })

    test('should report correct location for toStrictEqual(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toStrictEqual', nullArg, [], 12, 6))

      expect(reports[0].loc?.start.line).toBe(12)
      expect(reports[0].loc?.start.column).toBe(6)
    })

    test('should report message mentioning toBeNull() for toStrictEqual', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toStrictEqual', nullArg))

      expect(reports[0].message).toContain('toBeNull()')
    })

    test('should report message mentioning toStrictEqual(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toStrictEqual', nullArg))

      expect(reports[0].message).toContain('toStrictEqual(null)')
    })
  })

  describe('.not.toBe(null)', () => {
    test('should report expect(x).not.toBe(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toBe', nullArg, ['not']))

      expect(reports.length).toBe(1)
    })

    test('should report correct location for .not.toBe(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toBe', nullArg, ['not'], 3, 2))

      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(2)
    })

    test('should report message mentioning toBeNull() for .not.toBe(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toBe', nullArg, ['not']))

      expect(reports[0].message).toContain('toBeNull()')
    })
  })

  describe('.not.toEqual(null)', () => {
    test('should report expect(x).not.toEqual(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toEqual', nullArg, ['not']))

      expect(reports.length).toBe(1)
    })

    test('should report correct location for .not.toEqual(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toEqual', nullArg, ['not'], 4, 1))

      expect(reports[0].loc?.start.line).toBe(4)
      expect(reports[0].loc?.start.column).toBe(1)
    })

    test('should report message mentioning toEqual(null) for .not chain', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toEqual', nullArg, ['not']))

      expect(reports[0].message).toContain('toEqual(null)')
    })
  })

  describe('.not.toStrictEqual(null)', () => {
    test('should report expect(x).not.toStrictEqual(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toStrictEqual', nullArg, ['not']))

      expect(reports.length).toBe(1)
    })

    test('should report correct location for .not.toStrictEqual(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toStrictEqual', nullArg, ['not'], 8, 5))

      expect(reports[0].loc?.start.line).toBe(8)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report message mentioning toStrictEqual(null) for .not chain', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toStrictEqual', nullArg, ['not']))

      expect(reports[0].message).toContain('toStrictEqual(null)')
    })
  })

  describe('.resolves.toBe(null)', () => {
    test('should report expect(x).resolves.toBe(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toBe', nullArg, ['resolves']))

      expect(reports.length).toBe(1)
    })

    test('should report correct location for .resolves.toBe(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toBe', nullArg, ['resolves'], 6, 4))

      expect(reports[0].loc?.start.line).toBe(6)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should report message mentioning toBeNull() for .resolves.toBe(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toBe', nullArg, ['resolves']))

      expect(reports[0].message).toContain('toBeNull()')
    })
  })

  describe('.resolves.toEqual(null)', () => {
    test('should report expect(x).resolves.toEqual(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toEqual', nullArg, ['resolves']))

      expect(reports.length).toBe(1)
    })

    test('should report correct location for .resolves.toEqual(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toEqual', nullArg, ['resolves'], 11, 2))

      expect(reports[0].loc?.start.line).toBe(11)
      expect(reports[0].loc?.start.column).toBe(2)
    })
  })

  describe('.resolves.toStrictEqual(null)', () => {
    test('should report expect(x).resolves.toStrictEqual(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toStrictEqual', nullArg, ['resolves']))

      expect(reports.length).toBe(1)
    })

    test('should report correct location for .resolves.toStrictEqual(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toStrictEqual', nullArg, ['resolves'], 9, 0))

      expect(reports[0].loc?.start.line).toBe(9)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  describe('.rejects.toBe(null)', () => {
    test('should report expect(x).rejects.toBe(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toBe', nullArg, ['rejects']))

      expect(reports.length).toBe(1)
    })

    test('should report correct location for .rejects.toBe(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toBe', nullArg, ['rejects'], 2, 7))

      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[0].loc?.start.column).toBe(7)
    })

    test('should report message mentioning toBeNull() for .rejects.toBe(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toBe', nullArg, ['rejects']))

      expect(reports[0].message).toContain('toBeNull()')
    })
  })

  describe('.rejects.toEqual(null)', () => {
    test('should report expect(x).rejects.toEqual(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toEqual', nullArg, ['rejects']))

      expect(reports.length).toBe(1)
    })

    test('should report correct location for .rejects.toEqual(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toEqual', nullArg, ['rejects'], 15, 3))

      expect(reports[0].loc?.start.line).toBe(15)
      expect(reports[0].loc?.start.column).toBe(3)
    })
  })

  describe('.rejects.toStrictEqual(null)', () => {
    test('should report expect(x).rejects.toStrictEqual(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toStrictEqual', nullArg, ['rejects']))

      expect(reports.length).toBe(1)
    })

    test('should report correct location for .rejects.toStrictEqual(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toStrictEqual', nullArg, ['rejects'], 20, 0))

      expect(reports[0].loc?.start.line).toBe(20)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  describe('valid cases — toBeNull()', () => {
    test('should not report expect(x).toBeNull()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toBeNull', nullArg))

      expect(reports.length).toBe(0)
    })
  })

  describe('valid cases — toBe with non-null values', () => {
    test('should not report expect(x).toBe(undefined)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toBe', undefinedArg))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toBe(someVar)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toBe', variableArg))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toBe("hello")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toBe', stringArg))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toBe(42)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toBe', numberArg))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toBe(false)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toBe', falseArg))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toBe(true)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toBe', trueArg))

      expect(reports.length).toBe(0)
    })
  })

  describe('valid cases — toEqual with non-null values', () => {
    test('should not report expect(x).toEqual(someVar)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toEqual', variableArg))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toEqual({})', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toEqual', objectArg))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toEqual("hello")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toEqual', stringArg))

      expect(reports.length).toBe(0)
    })
  })

  describe('valid cases — toStrictEqual with non-null values', () => {
    test('should not report expect(x).toStrictEqual(someVar)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toStrictEqual', variableArg))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toStrictEqual({})', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toStrictEqual', objectArg))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toStrictEqual([])', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toStrictEqual', arrayArg))

      expect(reports.length).toBe(0)
    })
  })

  describe('valid cases — other matchers', () => {
    test('should not report expect(x).toBeDefined()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toBeDefined', nullArg))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toBeTruthy()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toBeTruthy', nullArg))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toBeFalsy()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toBeFalsy', nullArg))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toBeUndefined()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toBeUndefined', nullArg))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toHaveBeenCalled()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toHaveBeenCalled', nullArg))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toContain()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toContain', nullArg))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toMatchSnapshot()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toMatchSnapshot', nullArg))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toThrow()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toThrow', nullArg))

      expect(reports.length).toBe(0)
    })
  })

  describe('non-expect calls — no reports', () => {
    test('should not report something(x).toBe(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'something' },
            arguments: [{ type: 'Identifier', name: 'x' }],
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [nullArg],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report foo(x).toEqual(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'foo' },
            arguments: [{ type: 'Identifier', name: 'x' }],
          },
          property: { type: 'Identifier', name: 'toEqual' },
        },
        arguments: [nullArg],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('multiple violations', () => {
    test('should report multiple toBe(null) calls in one file', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toBe', nullArg, [], 1, 0))
      visitor.CallExpression(createExpectCall('toBe', nullArg, [], 2, 0))
      visitor.CallExpression(createExpectCall('toBe', nullArg, [], 3, 0))

      expect(reports.length).toBe(3)
    })

    test('should report mixed violations (toBe, toEqual, toStrictEqual)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toBe', nullArg, [], 1, 0))
      visitor.CallExpression(createExpectCall('toEqual', nullArg, [], 2, 0))
      visitor.CallExpression(createExpectCall('toStrictEqual', nullArg, [], 3, 0))

      expect(reports.length).toBe(3)
      expect(reports[0].message).toContain('toBe(null)')
      expect(reports[1].message).toContain('toEqual(null)')
      expect(reports[2].message).toContain('toStrictEqual(null)')
    })

    test('should report mixed valid and invalid calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toBe', nullArg, [], 1, 0))
      visitor.CallExpression(createExpectCall('toBe', variableArg, [], 2, 0))
      visitor.CallExpression(createExpectCall('toEqual', nullArg, [], 3, 0))
      visitor.CallExpression(createExpectCall('toBeNull', nullArg, [], 4, 0))

      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(3)
    })
  })

  describe('report message content', () => {
    test('message mentions toBeNull() for toBe', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toBe', nullArg))

      expect(reports[0].message).toContain('toBeNull()')
    })

    test('message mentions original matcher name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toEqual', nullArg))

      expect(reports[0].message).toContain('toEqual(null)')
    })

    test('message does not use ESLint placeholder format', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toBe', nullArg))

      expect(reports[0].message).not.toContain('{{')
      expect(reports[0].message).not.toContain('}}')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toBe', nullArg, [], 5, 10))

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('message uses backticks for code references', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toBe', nullArg))

      expect(reports[0].message).toContain('`toBeNull()`')
      expect(reports[0].message).toContain('`toBe(null)`')
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression({ type: 'CallExpression', arguments: [nullArg] })

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

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
        arguments: [nullArg],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression with Identifier callee (not MemberExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'toBe' },
        arguments: [nullArg],
      })

      expect(reports.length).toBe(0)
    })

    test('should not report when property name is not a target matcher', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'x' }],
          },
          property: { type: 'Identifier', name: 'toBeNullish' },
        },
        arguments: [nullArg],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node with property but no object on callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [nullArg],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node where callee.object is not a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [nullArg],
      })

      expect(reports.length).toBe(0)
    })

    test('should not report when no arguments provided', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

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

    test('should handle deeply nested expect calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toBe', nullArg, [], 2, 4))
      visitor.CallExpression(createExpectCall('toBeNull', nullArg, [], 1, 0))

      expect(reports.length).toBe(1)
    })
  })

  describe('state isolation between visitors', () => {
    test('separate visitors have separate state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()

      const visitor1 = preferToBeNullRule.create(ctx1)
      const visitor2 = preferToBeNullRule.create(ctx2)

      visitor1.CallExpression(createExpectCall('toBe', nullArg))
      visitor2.CallExpression(createExpectCall('toBeNull', nullArg))

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toBe', nullArg, [], 1, 0))
      visitor.CallExpression(createExpectCall('toEqual', nullArg, [], 2, 0))
      visitor.CallExpression(createExpectCall('toBeNull', nullArg, [], 3, 0))
      visitor.CallExpression(createExpectCall('toStrictEqual', nullArg, [], 4, 0))

      expect(reports.length).toBe(3)
    })
  })

  describe('default export', () => {
    test('rule should be the default export', () => {
      expect(preferToBeNullRule).toBeDefined()
      expect(preferToBeNullRule.meta).toBeDefined()
      expect(preferToBeNullRule.create).toBeDefined()
    })
  })

  describe('expect argument variations', () => {
    test('should report expect(fn()).toBe(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'fn' },
              arguments: [],
            }],
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [nullArg],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('toBeNull()')
    })

    test('should report expect(obj.prop).toEqual(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

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
              property: { type: 'Identifier', name: 'prop' },
            }],
          },
          property: { type: 'Identifier', name: 'toEqual' },
        },
        arguments: [nullArg],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('toBeNull()')
    })

    test('should report expect(x).toBe(null) with extra matcher arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

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
        arguments: [nullArg, { type: 'Literal', value: 'custom message' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('toBeNull()')
    })

    test('should not report expect(x).toBe(NaN)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toBe', { type: 'Identifier', name: 'NaN' }))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toBe(void 0)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeNullRule.create(context)

      visitor.CallExpression(createExpectCall('toBe', {
        type: 'UnaryExpression',
        operator: 'void',
        argument: { type: 'Literal', value: 0 },
      }))

      expect(reports.length).toBe(0)
    })
  })
})
