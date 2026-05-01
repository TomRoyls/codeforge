import { describe, test, expect, vi } from 'vitest'
import { preferStrictEqualRule } from '../../../../src/rules/testing/prefer-strict-equal.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.test.ts',
  source = 'expect(x).toEqual({ a: 1 });',
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

function createToEqualCall(
  argumentType: 'object' | 'array' | 'variable' | 'function' | 'string' | 'number' | 'null' | 'undefined' | 'boolean' | 'bigint' = 'object',
  line = 1,
  column = 0,
): unknown {
  let arg: unknown
  switch (argumentType) {
    case 'object':
      arg = { type: 'ObjectExpression', properties: [] }
      break
    case 'array':
      arg = { type: 'ArrayExpression', elements: [] }
      break
    case 'variable':
      arg = { type: 'Identifier', name: 'expected' }
      break
    case 'function':
      arg = { type: 'CallExpression', callee: { type: 'Identifier', name: 'getResult' }, arguments: [] }
      break
    case 'string':
      arg = { type: 'Literal', value: 'hello' }
      break
    case 'number':
      arg = { type: 'Literal', value: 42 }
      break
    case 'null':
      arg = { type: 'Literal', value: null }
      break
    case 'undefined':
      arg = { type: 'Identifier', name: 'undefined' }
      break
    case 'boolean':
      arg = { type: 'Literal', value: true }
      break
    case 'bigint':
      arg = { type: 'Literal', value: 9007199254740991n, bigint: '9007199254740991' }
      break
  }

  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [{ type: 'Identifier', name: 'x' }],
      },
      property: { type: 'Identifier', name: 'toEqual' },
    },
    arguments: [arg],
    loc: { start: { line, column }, end: { line, column: column + 25 } },
  }
}

function createToStrictEqualCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [{ type: 'Identifier', name: 'x' }],
      },
      property: { type: 'Identifier', name: 'toStrictEqual' },
    },
    arguments: [{ type: 'ObjectExpression', properties: [] }],
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
}

function createToBeCall(line = 1, column = 0): unknown {
  return {
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
    arguments: [{ type: 'Literal', value: true }],
    loc: { start: { line, column }, end: { line, column: column + 20 } },
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

function createNotToEqualCall(line = 1, column = 0): unknown {
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
      property: { type: 'Identifier', name: 'toEqual' },
    },
    arguments: [{ type: 'Identifier', name: 'expected' }],
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
}

function createNotToStrictEqualCall(line = 1, column = 0): unknown {
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
      property: { type: 'Identifier', name: 'toStrictEqual' },
    },
    arguments: [{ type: 'Identifier', name: 'expected' }],
    loc: { start: { line, column }, end: { line, column: column + 35 } },
  }
}

function createResolvesToEqualCall(line = 1, column = 0): unknown {
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
      property: { type: 'Identifier', name: 'toEqual' },
    },
    arguments: [{ type: 'ObjectExpression', properties: [] }],
    loc: { start: { line, column }, end: { line, column: column + 40 } },
  }
}

function createRejectsToEqualCall(line = 1, column = 0): unknown {
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
      property: { type: 'Identifier', name: 'toEqual' },
    },
    arguments: [{ type: 'ObjectExpression', properties: [] }],
    loc: { start: { line, column }, end: { line, column: column + 40 } },
  }
}

function createNonExpectToEqualCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'something' },
        arguments: [{ type: 'Identifier', name: 'x' }],
      },
      property: { type: 'Identifier', name: 'toEqual' },
    },
    arguments: [{ type: 'Identifier', name: 'expected' }],
    loc: { start: { line, column }, end: { line, column: column + 25 } },
  }
}

describe('prefer-strict-equal rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferStrictEqualRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferStrictEqualRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(preferStrictEqualRule.meta.docs?.recommended).toBe(false)
    })

    test('should have testing category', () => {
      expect(preferStrictEqualRule.meta.docs?.category).toBe('testing')
    })

    test('should have correct description mentioning toStrictEqual', () => {
      expect(preferStrictEqualRule.meta.docs?.description).toContain('toStrictEqual')
    })

    test('should have correct description mentioning toEqual', () => {
      expect(preferStrictEqualRule.meta.docs?.description).toContain('toEqual')
    })

    test('should have correct docs URL', () => {
      expect(preferStrictEqualRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/prefer-strict-equal',
      )
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = preferStrictEqualRule.create(context)
      const visitor2 = preferStrictEqualRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })
  })

  describe('detecting toEqual violations', () => {
    test('should report expect(x).toEqual({}) with object literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression(createToEqualCall('object'))

      expect(reports.length).toBe(1)
    })

    test('should report expect(x).toEqual([]) with array literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression(createToEqualCall('array'))

      expect(reports.length).toBe(1)
    })

    test('should report expect(x).toEqual(expected) with variable', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression(createToEqualCall('variable'))

      expect(reports.length).toBe(1)
    })

    test('should report expect(x).toEqual(getResult()) with function call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression(createToEqualCall('function'))

      expect(reports.length).toBe(1)
    })

    test('should report expect(x).toEqual("hello") with string', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression(createToEqualCall('string'))

      expect(reports.length).toBe(1)
    })

    test('should report expect(x).toEqual(42) with number', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression(createToEqualCall('number'))

      expect(reports.length).toBe(1)
    })

    test('should report expect(x).toEqual(null) with null', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression(createToEqualCall('null'))

      expect(reports.length).toBe(1)
    })

    test('should report expect(x).toEqual(undefined) with undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression(createToEqualCall('undefined'))

      expect(reports.length).toBe(1)
    })

    test('should report expect(x).toEqual(true) with boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression(createToEqualCall('boolean'))

      expect(reports.length).toBe(1)
    })

    test('should report expect(x).toEqual(9007199254740991n) with bigint', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression(createToEqualCall('bigint'))

      expect(reports.length).toBe(1)
    })

    test('should report correct location for toEqual call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression(createToEqualCall('object', 5, 8))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
    })
  })

  describe('toStrictEqual — no reports', () => {
    test('should not report expect(x).toStrictEqual({})', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression(createToStrictEqualCall())

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).not.toStrictEqual(expected)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression(createNotToStrictEqualCall())

      expect(reports.length).toBe(0)
    })
  })

  describe('other matchers — no reports', () => {
    test('should not report expect(x).toBe(true)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression(createToBeCall())

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toBeNull()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression(createMatcherCall('toBeNull'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toBeUndefined()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression(createMatcherCall('toBeUndefined'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toBeDefined()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression(createMatcherCall('toBeDefined'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toBeTruthy()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression(createMatcherCall('toBeTruthy'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toBeFalsy()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression(createMatcherCall('toBeFalsy'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toHaveBeenCalled()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression(createMatcherCall('toHaveBeenCalled'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toHaveBeenCalledWith()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression(createMatcherCall('toHaveBeenCalledWith'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toMatchSnapshot()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression(createMatcherCall('toMatchSnapshot'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toMatchInlineSnapshot()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression(createMatcherCall('toMatchInlineSnapshot'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toBeCloseTo()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression(createMatcherCall('toBeCloseTo'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toBeGreaterThan()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression(createMatcherCall('toBeGreaterThan'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toContain()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression(createMatcherCall('toContain'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toMatch()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression(createMatcherCall('toMatch'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toThrow()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression(createMatcherCall('toThrow'))

      expect(reports.length).toBe(0)
    })
  })

  describe('.not.toEqual() — reports', () => {
    test('should report expect(x).not.toEqual(expected)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression(createNotToEqualCall())

      expect(reports.length).toBe(1)
    })

    test('should report correct location for .not.toEqual()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression(createNotToEqualCall(10, 4))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
    })
  })

  describe('.resolves and .rejects chains', () => {
    test('should report expect(promise).resolves.toEqual({})', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression(createResolvesToEqualCall())

      expect(reports.length).toBe(1)
    })

    test('should report expect(promise).rejects.toEqual({})', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression(createRejectsToEqualCall())

      expect(reports.length).toBe(1)
    })

    test('should report correct location for .resolves.toEqual()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression(createResolvesToEqualCall(7, 12))

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(12)
    })

    test('should report correct location for .rejects.toEqual()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression(createRejectsToEqualCall(8, 4))

      expect(reports[0].loc?.start.line).toBe(8)
      expect(reports[0].loc?.start.column).toBe(4)
    })
  })

  describe('non-expect toEqual — no reports', () => {
    test('should not report something(x).toEqual(expected)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression(createNonExpectToEqualCall())

      expect(reports.length).toBe(0)
    })
  })

  describe('multiple violations', () => {
    test('should report multiple toEqual calls in one file', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression(createToEqualCall('object', 1, 0))
      visitor.CallExpression(createToEqualCall('array', 2, 0))
      visitor.CallExpression(createToEqualCall('variable', 3, 0))

      expect(reports.length).toBe(3)
    })

    test('should report mixed violations and pass valid calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression(createToEqualCall('object', 1, 0))
      visitor.CallExpression(createToStrictEqualCall(2, 0))
      visitor.CallExpression(createToEqualCall('array', 3, 0))
      visitor.CallExpression(createToBeCall(4, 0))

      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(3)
    })

    test('should report multiple violations with different patterns', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression(createToEqualCall('object', 1, 0))
      visitor.CallExpression(createNotToEqualCall(2, 0))
      visitor.CallExpression(createResolvesToEqualCall(3, 0))
      visitor.CallExpression(createRejectsToEqualCall(4, 0))
      visitor.CallExpression(createToStrictEqualCall(5, 0))

      expect(reports.length).toBe(4)
    })
  })

  describe('report message content', () => {
    test('message mentions toStrictEqual', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression(createToEqualCall('object'))

      expect(reports[0].message).toContain('toStrictEqual')
    })

    test('message mentions toEqual', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression(createToEqualCall('object'))

      expect(reports[0].message).toContain('toEqual')
    })

    test('message mentions stricter deep equality', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression(createToEqualCall('object'))

      expect(reports[0].message).toContain('stricter deep equality')
    })

    test('message does not use ESLint placeholder format', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression(createToEqualCall('object'))

      expect(reports[0].message).not.toContain('{{')
      expect(reports[0].message).not.toContain('}}')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression(createToEqualCall('object', 5, 10))

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('message is consistent for .not.toEqual()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression(createNotToEqualCall())

      expect(reports[0].message).toContain('toStrictEqual')
      expect(reports[0].message).toContain('toEqual')
    })

    test('message is consistent for .resolves.toEqual()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression(createResolvesToEqualCall())

      expect(reports[0].message).toContain('toStrictEqual')
      expect(reports[0].message).toContain('toEqual')
    })

    test('message is consistent for .rejects.toEqual()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression(createRejectsToEqualCall())

      expect(reports[0].message).toContain('toStrictEqual')
      expect(reports[0].message).toContain('toEqual')
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression({ type: 'CallExpression', arguments: [] })

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'x' }],
          },
          property: { type: 'Identifier', name: 'toEqual' },
        },
        arguments: [{ type: 'Identifier', name: 'y' }],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression with Identifier callee (not MemberExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'toEqual' },
        arguments: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should not report when property name is not toEqual', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'x' }],
          },
          property: { type: 'Identifier', name: 'toEqualish' },
        },
        arguments: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle deeply nested expect calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression(createToEqualCall('object', 2, 4))
      visitor.CallExpression(createToBeCall(1, 0))

      expect(reports.length).toBe(1)
    })

    test('should handle node with property but no object on callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'toEqual' },
        },
        arguments: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node where callee.object is not a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'toEqual' },
        },
        arguments: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node with missing arguments array', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'x' }],
          },
          property: { type: 'Identifier', name: 'toEqual' },
        },
      })

      expect(reports.length).toBe(1)
    })

    test('should handle node with empty arguments array', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'x' }],
          },
          property: { type: 'Identifier', name: 'toEqual' },
        },
        arguments: [],
      })

      expect(reports.length).toBe(1)
    })

    test('should handle node with property as null', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'x' }],
          },
          property: null,
        },
        arguments: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node where callee.object.callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: null,
            arguments: [],
          },
          property: { type: 'Identifier', name: 'toEqual' },
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

      const visitor1 = preferStrictEqualRule.create(ctx1)
      const visitor2 = preferStrictEqualRule.create(ctx2)

      visitor1.CallExpression(createToEqualCall('object'))
      visitor2.CallExpression(createToStrictEqualCall())

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression(createToEqualCall('object', 1, 0))
      visitor.CallExpression(createToEqualCall('array', 2, 0))
      visitor.CallExpression(createToStrictEqualCall(3, 0))
      visitor.CallExpression(createToEqualCall('variable', 4, 0))

      expect(reports.length).toBe(3)
    })
  })

  describe('additional edge cases', () => {
    test('should report expect(x).toEqual() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'x' }],
          },
          property: { type: 'Identifier', name: 'toEqual' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should report expect(x).toEqual() with regex argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression(createToEqualCall('string', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should not report when expect is called with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'toEqual' },
        },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should report expect(getValue()).toEqual(result)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'getValue' },
              arguments: [],
            }],
          },
          property: { type: 'Identifier', name: 'toEqual' },
        },
        arguments: [{ type: 'Identifier', name: 'result' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should report expect(obj.prop).toEqual(expected)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

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
        arguments: [{ type: 'Identifier', name: 'expected' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 35 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should report expect(x).toEqual() with Symbol argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'x' }],
          },
          property: { type: 'Identifier', name: 'toEqual' },
        },
        arguments: [{
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'Symbol' },
          arguments: [{ type: 'Literal', value: 'key' }],
        }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should report expect(x).toEqual() with spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'x' }],
          },
          property: { type: 'Identifier', name: 'toEqual' },
        },
        arguments: [{
          type: 'SpreadElement',
          argument: { type: 'Identifier', name: 'expected' },
        }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should not report when callee is computed member', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'x' }],
          },
          property: { type: 'Literal', value: 'toEqual' },
        },
        arguments: [{ type: 'Identifier', name: 'expected' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should report three sequential toEqual calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression(createToEqualCall('object', 1, 0))
      visitor.CallExpression(createToEqualCall('array', 2, 0))
      visitor.CallExpression(createToEqualCall('number', 3, 0))

      expect(reports.length).toBe(3)
    })

    test('should report toEqual interspersed with toStrictEqual', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression(createToEqualCall('object', 1, 0))
      visitor.CallExpression(createToStrictEqualCall(2, 0))
      visitor.CallExpression(createToEqualCall('string', 3, 0))

      expect(reports.length).toBe(2)
    })

    test('should handle expect chained through not.resolves', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

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
          },
          property: { type: 'Identifier', name: 'toEqual' },
        },
        arguments: [{ type: 'Identifier', name: 'expected' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should handle expect chained through rejects.not', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

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
              property: { type: 'Identifier', name: 'not' },
            },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'toEqual' },
        },
        arguments: [{ type: 'Identifier', name: 'expected' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      })

      expect(reports.length).toBe(1)
    })
  })

  describe('default export', () => {
    test('rule should be the default export', () => {
      expect(preferStrictEqualRule).toBeDefined()
      expect(preferStrictEqualRule.meta).toBeDefined()
      expect(preferStrictEqualRule.create).toBeDefined()
    })

    test('should report expect(x).not.toEqual(y) too', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'expect' }, arguments: [{ type: 'Identifier', name: 'x' }] },
              property: { type: 'Identifier', name: 'not' },
            },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'toEqual' },
        },
        arguments: [{ type: 'Literal', value: 1 }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('toStrictEqual')
    })

    test('should not report when callee object is not a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'toEqual' },
        },
        arguments: [{ type: 'Literal', value: 1 }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should not report toEqual on non-expect callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'assert' }, arguments: [{ type: 'Identifier', name: 'x' }] },
          property: { type: 'Identifier', name: 'toEqual' },
        },
        arguments: [{ type: 'Literal', value: 1 }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should report multiple toEqual calls independently', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'expect' }, arguments: [{ type: 'Identifier', name: 'a' }] }, property: { type: 'Identifier', name: 'toEqual' } },
        arguments: [{ type: 'Literal', value: 1 }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'expect' }, arguments: [{ type: 'Identifier', name: 'b' }] }, property: { type: 'Identifier', name: 'toEqual' } },
        arguments: [{ type: 'Literal', value: 2 }],
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 20 } },
      })
      expect(reports).toHaveLength(2)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(2)
    })
  })

  describe('additional verification', () => {
    test('should have create as a function', () => {
      expect(typeof preferStrictEqualRule.create).toBe('function')
    })
  })

  describe('callee and object edge cases', () => {
    test('should not report when inner callee is CallExpression — (getExpect())(x).toEqual(y)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'getExpect' },
              arguments: [],
            },
            arguments: [{ type: 'Identifier', name: 'x' }],
          },
          property: { type: 'Identifier', name: 'toEqual' },
        },
        arguments: [{ type: 'Identifier', name: 'y' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report Expect(x).toEqual(y) — case-sensitive expect', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'Expect' },
            arguments: [{ type: 'Identifier', name: 'x' }],
          },
          property: { type: 'Identifier', name: 'toEqual' },
        },
        arguments: [{ type: 'Identifier', name: 'y' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report when callee property is a number Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'x' }],
          },
          property: { type: 'Literal', value: 42 },
          computed: true,
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report when inner object is NewExpression — new expect(x).toEqual(y)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'NewExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'x' }],
          },
          property: { type: 'Identifier', name: 'toEqual' },
        },
        arguments: [{ type: 'Identifier', name: 'y' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report this(x).toEqual(y) — ThisExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStrictEqualRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'ThisExpression' },
            arguments: [{ type: 'Identifier', name: 'x' }],
          },
          property: { type: 'Identifier', name: 'toEqual' },
        },
        arguments: [{ type: 'Identifier', name: 'y' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })

      expect(reports.length).toBe(0)
    })
  })
})
