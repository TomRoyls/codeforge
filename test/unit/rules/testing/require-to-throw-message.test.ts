import { describe, test, expect, vi } from 'vitest'
import { requireToThrowMessageRule } from '../../../../src/rules/testing/require-to-throw-message.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.test.ts',
  source = 'expect(fn).toThrow();',
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

function createToThrowCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [{ type: 'Identifier', name: 'fn' }],
      },
      property: { type: 'Identifier', name: 'toThrow' },
    },
    arguments: [],
    loc: { start: { line, column }, end: { line, column: column + 20 } },
  }
}

function createToThrowErrorCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [{ type: 'Identifier', name: 'fn' }],
      },
      property: { type: 'Identifier', name: 'toThrowError' },
    },
    arguments: [],
    loc: { start: { line, column }, end: { line, column: column + 25 } },
  }
}

function createToThrowWithStringCall(message: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [{ type: 'Identifier', name: 'fn' }],
      },
      property: { type: 'Identifier', name: 'toThrow' },
    },
    arguments: [{ type: 'Literal', value: message }],
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
}

function createToThrowErrorWithRegexCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [{ type: 'Identifier', name: 'fn' }],
      },
      property: { type: 'Identifier', name: 'toThrowError' },
    },
    arguments: [{ type: 'Literal', regex: { pattern: 'error', flags: '' } }],
    loc: { start: { line, column }, end: { line, column: column + 35 } },
  }
}

function createToThrowErrorWithConstructorCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [{ type: 'Identifier', name: 'fn' }],
      },
      property: { type: 'Identifier', name: 'toThrowError' },
    },
    arguments: [{ type: 'Identifier', name: 'Error' }],
    loc: { start: { line, column }, end: { line, column: column + 35 } },
  }
}

function createNotToThrowCall(line = 1, column = 0): unknown {
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
            arguments: [{ type: 'Identifier', name: 'fn' }],
          },
          property: { type: 'Identifier', name: 'not' },
        },
        arguments: [],
      },
      property: { type: 'Identifier', name: 'toThrow' },
    },
    arguments: [],
    loc: { start: { line, column }, end: { line, column: column + 25 } },
  }
}

function createNotToThrowErrorCall(line = 1, column = 0): unknown {
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
            arguments: [{ type: 'Identifier', name: 'fn' }],
          },
          property: { type: 'Identifier', name: 'not' },
        },
        arguments: [],
      },
      property: { type: 'Identifier', name: 'toThrowError' },
    },
    arguments: [],
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
}

function createResolvesToThrowCall(line = 1, column = 0): unknown {
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
      property: { type: 'Identifier', name: 'toThrow' },
    },
    arguments: [],
    loc: { start: { line, column }, end: { line, column: column + 35 } },
  }
}

function createRejectsToThrowErrorCall(line = 1, column = 0): unknown {
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
      property: { type: 'Identifier', name: 'toThrowError' },
    },
    arguments: [],
    loc: { start: { line, column }, end: { line, column: column + 40 } },
  }
}

function createNonExpectToThrowCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'something' },
        arguments: [{ type: 'Identifier', name: 'fn' }],
      },
      property: { type: 'Identifier', name: 'toThrow' },
    },
    arguments: [],
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

describe('require-to-throw-message rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(requireToThrowMessageRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(requireToThrowMessageRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(requireToThrowMessageRule.meta.docs?.recommended).toBe(false)
    })

    test('should have testing category', () => {
      expect(requireToThrowMessageRule.meta.docs?.category).toBe('testing')
    })

    test('should have correct description mentioning toThrow', () => {
      expect(requireToThrowMessageRule.meta.docs?.description).toContain('toThrow')
    })

    test('should have correct description mentioning toThrowError', () => {
      expect(requireToThrowMessageRule.meta.docs?.description).toContain('toThrowError')
    })

    test('should have correct docs URL', () => {
      expect(requireToThrowMessageRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/require-to-throw-message',
      )
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = requireToThrowMessageRule.create(context)
      const visitor2 = requireToThrowMessageRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })
  })

  describe('detecting toThrow() without arguments', () => {
    test('should report expect(fn).toThrow()', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      visitor.CallExpression(createToThrowCall())

      expect(reports.length).toBe(1)
    })

    test('should report correct location for toThrow()', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      visitor.CallExpression(createToThrowCall(5, 8))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('message mentions toThrow()', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      visitor.CallExpression(createToThrowCall())

      expect(reports[0].message).toContain('toThrow()')
    })
  })

  describe('detecting toThrowError() without arguments', () => {
    test('should report expect(fn).toThrowError()', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      visitor.CallExpression(createToThrowErrorCall())

      expect(reports.length).toBe(1)
    })

    test('should report correct location for toThrowError()', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      visitor.CallExpression(createToThrowErrorCall(10, 4))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('message mentions toThrowError()', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      visitor.CallExpression(createToThrowErrorCall())

      expect(reports[0].message).toContain('toThrowError()')
    })
  })

  describe('allowing toThrow() with arguments', () => {
    test('should not report expect(fn).toThrow("message")', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      visitor.CallExpression(createToThrowWithStringCall('error occurred'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(fn).toThrowError(/regex/)', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      visitor.CallExpression(createToThrowErrorWithRegexCall())

      expect(reports.length).toBe(0)
    })

    test('should not report expect(fn).toThrowError(Error)', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      visitor.CallExpression(createToThrowErrorWithConstructorCall())

      expect(reports.length).toBe(0)
    })
  })

  describe('.not.toThrow() — no reports', () => {
    test('should not report expect(fn).not.toThrow()', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      visitor.CallExpression(createNotToThrowCall())

      expect(reports.length).toBe(0)
    })

    test('should not report expect(fn).not.toThrowError()', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      visitor.CallExpression(createNotToThrowErrorCall())

      expect(reports.length).toBe(0)
    })
  })

  describe('.resolves and .rejects chains', () => {
    test('should report expect(promise).resolves.toThrow()', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      visitor.CallExpression(createResolvesToThrowCall())

      expect(reports.length).toBe(1)
    })

    test('should report expect(promise).rejects.toThrowError()', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      visitor.CallExpression(createRejectsToThrowErrorCall())

      expect(reports.length).toBe(1)
    })
  })

  describe('non-expect toThrow — no reports', () => {
    test('should not report something(fn).toThrow()', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      visitor.CallExpression(createNonExpectToThrowCall())

      expect(reports.length).toBe(0)
    })
  })

  describe('other matchers — no reports', () => {
    test('should not report expect(x).toBe(true)', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      visitor.CallExpression(createMatcherCall('toBe'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toEqual({})', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      visitor.CallExpression(createMatcherCall('toEqual'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toStrictEqual({})', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      visitor.CallExpression(createMatcherCall('toStrictEqual'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toBeNull()', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      visitor.CallExpression(createMatcherCall('toBeNull'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toHaveBeenCalled()', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      visitor.CallExpression(createMatcherCall('toHaveBeenCalled'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toMatchSnapshot()', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      visitor.CallExpression(createMatcherCall('toMatchSnapshot'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toContain()', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      visitor.CallExpression(createMatcherCall('toContain'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toMatch()', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      visitor.CallExpression(createMatcherCall('toMatch'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toBeUndefined()', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      visitor.CallExpression(createMatcherCall('toBeUndefined'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toBeTruthy()', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      visitor.CallExpression(createMatcherCall('toBeTruthy'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toBeFalsy()', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      visitor.CallExpression(createMatcherCall('toBeFalsy'))

      expect(reports.length).toBe(0)
    })
  })

  describe('multiple violations', () => {
    test('should report multiple toThrow calls in one file', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      visitor.CallExpression(createToThrowCall(1, 0))
      visitor.CallExpression(createToThrowErrorCall(2, 0))
      visitor.CallExpression(createToThrowCall(3, 0))

      expect(reports.length).toBe(3)
    })

    test('should report mixed violations and pass valid calls', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      visitor.CallExpression(createToThrowCall(1, 0))
      visitor.CallExpression(createToThrowWithStringCall('err', 2, 0))
      visitor.CallExpression(createToThrowErrorCall(3, 0))
      visitor.CallExpression(createNotToThrowCall(4, 0))

      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(3)
    })
  })

  describe('report message content', () => {
    test('toThrow report message does not use ESLint placeholder format', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      visitor.CallExpression(createToThrowCall())

      expect(reports[0].message).not.toContain('{{')
      expect(reports[0].message).not.toContain('}}')
    })

    test('toThrowError report message does not use ESLint placeholder format', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      visitor.CallExpression(createToThrowErrorCall())

      expect(reports[0].message).not.toContain('{{')
      expect(reports[0].message).not.toContain('}}')
    })

    test('report has loc property for toThrow', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      visitor.CallExpression(createToThrowCall(5, 10))

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report has loc property for toThrowError', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      visitor.CallExpression(createToThrowErrorCall(7, 3))

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(3)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      visitor.CallExpression({ type: 'CallExpression', arguments: [] })

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'fn' }],
          },
          property: { type: 'Identifier', name: 'toThrow' },
        },
        arguments: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression with Identifier callee (not MemberExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'toThrow' },
        arguments: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should not report when property name is neither toThrow nor toThrowError', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'fn' }],
          },
          property: { type: 'Identifier', name: 'toThrowing' },
        },
        arguments: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node with property but no object on callee', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'toThrow' },
        },
        arguments: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node where callee.object is not a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'toThrow' },
        },
        arguments: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node where callee.object.callee is an Identifier (not MemberExpression) for not check', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'toThrow' },
        },
        arguments: [],
      })

      expect(reports.length).toBe(1)
    })
  })

  describe('state isolation between visitors', () => {
    test('separate visitors have separate state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()

      const visitor1 = requireToThrowMessageRule.create(ctx1)
      const visitor2 = requireToThrowMessageRule.create(ctx2)

      visitor1.CallExpression(createToThrowCall())
      visitor2.CallExpression(createToThrowWithStringCall('err'))

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      visitor.CallExpression(createToThrowCall(1, 0))
      visitor.CallExpression(createToThrowWithStringCall('err', 2, 0))
      visitor.CallExpression(createToThrowErrorCall(3, 0))
      visitor.CallExpression(createNotToThrowCall(4, 0))
      visitor.CallExpression(createToThrowCall(5, 0))

      expect(reports.length).toBe(3)
    })
  })

  describe('default export', () => {
    test('rule should be the default export', () => {
      expect(requireToThrowMessageRule).toBeDefined()
      expect(requireToThrowMessageRule.meta).toBeDefined()
      expect(requireToThrowMessageRule.create).toBeDefined()
    })
  })

  describe('additional meta verification', () => {
    test('should have testing category', () => {
      expect(requireToThrowMessageRule.meta.docs?.category).toBe('testing')
    })

    test('should have suggestion type', () => {
      expect(requireToThrowMessageRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(requireToThrowMessageRule.meta.severity).toBe('warn')
    })

    test('should have description mentioning toThrow', () => {
      expect(requireToThrowMessageRule.meta.docs?.description).toContain('toThrow')
    })

    test('should have correct docs URL', () => {
      expect(requireToThrowMessageRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/require-to-throw-message',
      )
    })

    test('should not be recommended', () => {
      expect(requireToThrowMessageRule.meta.docs?.recommended).toBe(false)
    })

    test('should not be fixable', () => {
      expect(requireToThrowMessageRule.meta.fixable).toBeUndefined()
    })

    test('should have create function', () => {
      expect(typeof requireToThrowMessageRule.create).toBe('function')
    })

    test('create returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
    })

    test('create returns new visitor each call', () => {
      const { context } = createMockContext()
      const v1 = requireToThrowMessageRule.create(context)
      const v2 = requireToThrowMessageRule.create(context)
      expect(v1).not.toBe(v2)
    })

    test('state isolation between visitors', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()

      const v1 = requireToThrowMessageRule.create(ctx1)
      const v2 = requireToThrowMessageRule.create(ctx2)

      v1.CallExpression(createToThrowCall())
      v2.CallExpression(createToThrowWithStringCall('error'))

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('report includes location info', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      visitor.CallExpression(createToThrowCall(5, 10))

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report message does not use ESLint placeholders', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      visitor.CallExpression(createToThrowCall())

      expect(reports[0].message).not.toContain('{{')
      expect(reports[0].message).not.toContain('}}')
    })

    test('should handle multiple toThrow violations in same file', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      visitor.CallExpression(createToThrowCall(1, 0))
      visitor.CallExpression(createToThrowWithStringCall('error'))
      visitor.CallExpression(createToThrowCall(3, 0))

      expect(reports.length).toBe(2)
    })

    test('should handle edge case — empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      visitor.CallExpression({ type: 'CallExpression', arguments: [] })

      expect(reports.length).toBe(0)
    })
  })

  describe('toThrow with specific string arguments — no report', () => {
    test('should not report expect(fn).toThrow("Error message") with exact string', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      visitor.CallExpression(createToThrowWithStringCall('Error message'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(fn).toThrow("Custom error") with short string', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      visitor.CallExpression(createToThrowWithStringCall('Custom error'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(fn).toThrowError("Specific error text")', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'fn' }],
          },
          property: { type: 'Identifier', name: 'toThrowError' },
        },
        arguments: [{ type: 'Literal', value: 'Specific error text' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report expect(fn).toThrow(/^Error/) with regex', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'fn' }],
          },
          property: { type: 'Identifier', name: 'toThrow' },
        },
        arguments: [{ type: 'Literal', regex: { pattern: '^Error', flags: '' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report expect(fn).toThrowError(TypeError) with error constructor', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'fn' }],
          },
          property: { type: 'Identifier', name: 'toThrowError' },
        },
        arguments: [{ type: 'Identifier', name: 'TypeError' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 35 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('deeply chained .resolves and .rejects patterns', () => {
    test('should report expect(fn).resolves.toThrow() without message', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      visitor.CallExpression(createResolvesToThrowCall())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('toThrow()')
    })

    test('should not report expect(fn).resolves.toThrow("msg") with message', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      const node = {
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
          property: { type: 'Identifier', name: 'toThrow' },
        },
        arguments: [{ type: 'Literal', value: 'msg' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report expect(fn).rejects.toThrowError() without message', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      visitor.CallExpression(createRejectsToThrowErrorCall())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('toThrowError()')
    })

    test('should not report expect(fn).rejects.toThrowError(/pattern/) with regex', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      const node = {
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
          property: { type: 'Identifier', name: 'toThrowError' },
        },
        arguments: [{ type: 'Literal', regex: { pattern: 'pattern', flags: '' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 45 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('.not modifier combined with resolves/rejects', () => {
    test('should not report expect(fn).resolves.not.toThrow()', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      const node = {
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
          property: { type: 'Identifier', name: 'toThrow' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report expect(fn).rejects.not.toThrowError()', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      const node = {
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
          property: { type: 'Identifier', name: 'toThrowError' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 45 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('non-expect caller variations — no report', () => {
    test('should not report something(fn).toThrow()', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      visitor.CallExpression(createNonExpectToThrowCall())

      expect(reports.length).toBe(0)
    })

    test('should not report myExpect(fn).toThrow()', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'myExpect' },
            arguments: [{ type: 'Identifier', name: 'fn' }],
          },
          property: { type: 'Identifier', name: 'toThrow' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report verify(fn).toThrow()', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'verify' },
            arguments: [{ type: 'Identifier', name: 'fn' }],
          },
          property: { type: 'Identifier', name: 'toThrow' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('multiple sequential calls in sequence', () => {
    test('should report two toThrow() calls in sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      visitor.CallExpression(createToThrowCall(1, 0))
      visitor.CallExpression(createToThrowCall(2, 0))

      expect(reports.length).toBe(2)
    })

    test('should report both toThrow() and toThrowError() without args', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      visitor.CallExpression(createToThrowCall(1, 0))
      visitor.CallExpression(createToThrowErrorCall(2, 0))

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('toThrow()')
      expect(reports[1].message).toContain('toThrowError()')
    })

    test('should only report toThrow() without args when followed by toThrow("msg")', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      visitor.CallExpression(createToThrowWithStringCall('msg', 1, 0))
      visitor.CallExpression(createToThrowCall(2, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(2)
    })
  })

  describe('docs and meta', () => {
    test('should have valid URL format', () => {
      const url = requireToThrowMessageRule.meta.docs?.url
      expect(url).toMatch(/^https?:\/\/.+/)
      expect(url).toContain('require-to-throw-message')
    })

    test('should have warn severity', () => {
      expect(requireToThrowMessageRule.meta.severity).toBe('warn')
    })
  })

  describe('type safety', () => {
    test('should have meta as a plain object', () => {
      expect(typeof requireToThrowMessageRule.meta).toBe('object')
      expect(requireToThrowMessageRule.meta).not.toBeNull()
      expect(Array.isArray(requireToThrowMessageRule.meta)).toBe(false)
    })
  })

  describe('resolves.toThrowError() without args', () => {
    test('should report expect(promise).resolves.toThrowError()', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      const node = {
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
          property: { type: 'Identifier', name: 'toThrowError' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('toThrowError()')
    })
  })

  describe('rejects.toThrow() without args', () => {
    test('should report expect(promise).rejects.toThrow()', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      const node = {
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
          property: { type: 'Identifier', name: 'toThrow' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 35 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('toThrow()')
    })
  })

  describe('toThrow with multiple arguments', () => {
    test('should not report expect(fn).toThrow(Error, "message")', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'fn' }],
          },
          property: { type: 'Identifier', name: 'toThrow' },
        },
        arguments: [{ type: 'Identifier', name: 'Error' }, { type: 'Literal', value: 'message' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 35 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('resolves.toThrowError with message', () => {
    test('should not report expect(promise).resolves.toThrowError("msg")', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      const node = {
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
          property: { type: 'Identifier', name: 'toThrowError' },
        },
        arguments: [{ type: 'Literal', value: 'msg' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 45 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('rejects.toThrow with message', () => {
    test('should not report expect(promise).rejects.toThrow("msg")', () => {
      const { context, reports } = createMockContext()
      const visitor = requireToThrowMessageRule.create(context)

      const node = {
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
          property: { type: 'Identifier', name: 'toThrow' },
        },
        arguments: [{ type: 'Literal', value: 'msg' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })
})
