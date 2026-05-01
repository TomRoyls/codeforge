import { describe, test, expect, vi } from 'vitest'
import { preferCalledWithRule } from '../../../../src/rules/testing/prefer-called-with.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.test.ts',
  source = 'expect(fn).toHaveBeenCalled();',
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

function createToHaveBeenCalledCall(
  fnName = 'fn',
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
        arguments: [{ type: 'Identifier', name: fnName }],
      },
      property: { type: 'Identifier', name: 'toHaveBeenCalled' },
    },
    arguments: [],
    loc: { start: { line, column }, end: { line, column: column + 28 } },
  }
}

function createNotToHaveBeenCalledCall(
  fnName = 'fn',
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
            arguments: [{ type: 'Identifier', name: fnName }],
          },
          property: { type: 'Identifier', name: 'not' },
        },
        arguments: [],
      },
      property: { type: 'Identifier', name: 'toHaveBeenCalled' },
    },
    arguments: [],
    loc: { start: { line, column }, end: { line, column: column + 32 } },
  }
}

function createToHaveBeenCalledWithCall(
  fnName = 'fn',
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
        arguments: [{ type: 'Identifier', name: fnName }],
      },
      property: { type: 'Identifier', name: 'toHaveBeenCalledWith' },
    },
    arguments: [{ type: 'Literal', value: 'arg' }],
    loc: { start: { line, column }, end: { line, column: column + 40 } },
  }
}

function createToHaveBeenLastCalledWithCall(
  fnName = 'fn',
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
        arguments: [{ type: 'Identifier', name: fnName }],
      },
      property: { type: 'Identifier', name: 'toHaveBeenLastCalledWith' },
    },
    arguments: [{ type: 'Literal', value: 'arg' }],
    loc: { start: { line, column }, end: { line, column: column + 45 } },
  }
}

function createToHaveBeenNthCalledWithCall(
  fnName = 'fn',
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
        arguments: [{ type: 'Identifier', name: fnName }],
      },
      property: { type: 'Identifier', name: 'toHaveBeenNthCalledWith' },
    },
    arguments: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 'arg' }],
    loc: { start: { line, column }, end: { line, column: column + 45 } },
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

function createResolvesToHaveBeenCalledCall(
  fnName = 'promise',
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
            arguments: [{ type: 'Identifier', name: fnName }],
          },
          property: { type: 'Identifier', name: 'resolves' },
        },
        arguments: [],
      },
      property: { type: 'Identifier', name: 'toHaveBeenCalled' },
    },
    arguments: [],
    loc: { start: { line, column }, end: { line, column: column + 40 } },
  }
}

function createRejectsToHaveBeenCalledCall(
  fnName = 'promise',
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
            arguments: [{ type: 'Identifier', name: fnName }],
          },
          property: { type: 'Identifier', name: 'rejects' },
        },
        arguments: [],
      },
      property: { type: 'Identifier', name: 'toHaveBeenCalled' },
    },
    arguments: [],
    loc: { start: { line, column }, end: { line, column: column + 40 } },
  }
}

function createNonExpectToHaveBeenCalledCall(
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
      property: { type: 'Identifier', name: 'toHaveBeenCalled' },
    },
    arguments: [],
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
}

function createResolvesNotToHaveBeenCalledCall(
  fnName = 'promise',
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
            callee: {
              type: 'MemberExpression',
              object: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'expect' },
                arguments: [{ type: 'Identifier', name: fnName }],
              },
              property: { type: 'Identifier', name: 'resolves' },
            },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'not' },
        },
        arguments: [],
      },
      property: { type: 'Identifier', name: 'toHaveBeenCalled' },
    },
    arguments: [],
    loc: { start: { line, column }, end: { line, column: column + 50 } },
  }
}

describe('prefer-called-with rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferCalledWithRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferCalledWithRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(preferCalledWithRule.meta.docs?.recommended).toBe(false)
    })

    test('should have testing category', () => {
      expect(preferCalledWithRule.meta.docs?.category).toBe('testing')
    })

    test('should have correct description mentioning toHaveBeenCalledWith', () => {
      expect(preferCalledWithRule.meta.docs?.description).toContain('toHaveBeenCalledWith')
    })

    test('should have correct description mentioning toHaveBeenCalled', () => {
      expect(preferCalledWithRule.meta.docs?.description).toContain('toHaveBeenCalled')
    })

    test('should have correct docs URL', () => {
      expect(preferCalledWithRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/prefer-called-with',
      )
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = preferCalledWithRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = preferCalledWithRule.create(context)
      const visitor2 = preferCalledWithRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })
  })

  describe('detecting toHaveBeenCalled violations', () => {
    test('should report expect(fn).toHaveBeenCalled()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      visitor.CallExpression(createToHaveBeenCalledCall())

      expect(reports.length).toBe(1)
    })

    test('should report with different function name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      visitor.CallExpression(createToHaveBeenCalledCall('mockCallback'))

      expect(reports.length).toBe(1)
    })

    test('should report with arrow function argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{
              type: 'ArrowFunctionExpression',
              params: [],
              body: { type: 'BlockStatement', body: [] },
            }],
          },
          property: { type: 'Identifier', name: 'toHaveBeenCalled' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report with call expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'wrapper' },
              arguments: [],
            }],
          },
          property: { type: 'Identifier', name: 'toHaveBeenCalled' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      visitor.CallExpression(createToHaveBeenCalledCall('fn', 5, 8))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should report with member expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{
              type: 'MemberExpression',
              object: { type: 'Identifier', name: 'obj' },
              property: { type: 'Identifier', name: 'method' },
            }],
          },
          property: { type: 'Identifier', name: 'toHaveBeenCalled' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('.not.toHaveBeenCalled() — no reports', () => {
    test('should not report expect(fn).not.toHaveBeenCalled()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      visitor.CallExpression(createNotToHaveBeenCalledCall())

      expect(reports.length).toBe(0)
    })

    test('should not report expect(fn).not.toHaveBeenCalled() with different fn name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      visitor.CallExpression(createNotToHaveBeenCalledCall('mockCallback'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(promise).resolves.not.toHaveBeenCalled()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      visitor.CallExpression(createResolvesNotToHaveBeenCalledCall())

      expect(reports.length).toBe(0)
    })
  })

  describe('toHaveBeenCalledWith — no reports', () => {
    test('should not report expect(fn).toHaveBeenCalledWith("arg")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      visitor.CallExpression(createToHaveBeenCalledWithCall())

      expect(reports.length).toBe(0)
    })

    test('should not report expect(fn).toHaveBeenCalledWith(arg1, arg2)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'fn' }],
          },
          property: { type: 'Identifier', name: 'toHaveBeenCalledWith' },
        },
        arguments: [
          { type: 'Identifier', name: 'arg1' },
          { type: 'Identifier', name: 'arg2' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report expect(fn).toHaveBeenCalledWith() with no args', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'fn' }],
          },
          property: { type: 'Identifier', name: 'toHaveBeenCalledWith' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('toHaveBeenLastCalledWith — no reports', () => {
    test('should not report expect(fn).toHaveBeenLastCalledWith("arg")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      visitor.CallExpression(createToHaveBeenLastCalledWithCall())

      expect(reports.length).toBe(0)
    })

    test('should not report expect(fn).toHaveBeenLastCalledWith() with no args', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'fn' }],
          },
          property: { type: 'Identifier', name: 'toHaveBeenLastCalledWith' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('toHaveBeenNthCalledWith — no reports', () => {
    test('should not report expect(fn).toHaveBeenNthCalledWith(1, "arg")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      visitor.CallExpression(createToHaveBeenNthCalledWithCall())

      expect(reports.length).toBe(0)
    })

    test('should not report expect(fn).toHaveBeenNthCalledWith(2, arg)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'fn' }],
          },
          property: { type: 'Identifier', name: 'toHaveBeenNthCalledWith' },
        },
        arguments: [
          { type: 'Literal', value: 2 },
          { type: 'Identifier', name: 'expectedArg' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('other matchers — no reports', () => {
    test('should not report expect(x).toBe(true)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      visitor.CallExpression(createMatcherCall('toBe'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toEqual()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      visitor.CallExpression(createMatcherCall('toEqual'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toStrictEqual()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      visitor.CallExpression(createMatcherCall('toStrictEqual'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toBeNull()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      visitor.CallExpression(createMatcherCall('toBeNull'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toBeUndefined()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      visitor.CallExpression(createMatcherCall('toBeUndefined'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toBeDefined()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      visitor.CallExpression(createMatcherCall('toBeDefined'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toBeTruthy()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      visitor.CallExpression(createMatcherCall('toBeTruthy'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toBeFalsy()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      visitor.CallExpression(createMatcherCall('toBeFalsy'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toMatchSnapshot()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      visitor.CallExpression(createMatcherCall('toMatchSnapshot'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toThrow()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      visitor.CallExpression(createMatcherCall('toThrow'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toContain()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      visitor.CallExpression(createMatcherCall('toContain'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toMatch()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      visitor.CallExpression(createMatcherCall('toMatch'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toBeCalled()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      visitor.CallExpression(createMatcherCall('toBeCalled'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toHaveReturned()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      visitor.CallExpression(createMatcherCall('toHaveReturned'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toHaveLength()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      visitor.CallExpression(createMatcherCall('toHaveLength'))

      expect(reports.length).toBe(0)
    })
  })

  describe('.resolves and .rejects chains', () => {
    test('should report expect(promise).resolves.toHaveBeenCalled()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      visitor.CallExpression(createResolvesToHaveBeenCalledCall())

      expect(reports.length).toBe(1)
    })

    test('should report expect(promise).rejects.toHaveBeenCalled()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      visitor.CallExpression(createRejectsToHaveBeenCalledCall())

      expect(reports.length).toBe(1)
    })

    test('should report correct location for resolves chain', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      visitor.CallExpression(createResolvesToHaveBeenCalledCall('promise', 7, 3))

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should report correct location for rejects chain', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      visitor.CallExpression(createRejectsToHaveBeenCalledCall('promise', 9, 2))

      expect(reports[0].loc?.start.line).toBe(9)
      expect(reports[0].loc?.start.column).toBe(2)
    })
  })

  describe('non-expect toHaveBeenCalled — no reports', () => {
    test('should not report something(x).toHaveBeenCalled()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      visitor.CallExpression(createNonExpectToHaveBeenCalledCall())

      expect(reports.length).toBe(0)
    })
  })

  describe('multiple violations', () => {
    test('should report multiple toHaveBeenCalled calls in one file', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      visitor.CallExpression(createToHaveBeenCalledCall('fn1', 1, 0))
      visitor.CallExpression(createToHaveBeenCalledCall('fn2', 2, 0))
      visitor.CallExpression(createToHaveBeenCalledCall('fn3', 3, 0))

      expect(reports.length).toBe(3)
    })

    test('should report mixed violations and pass valid calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      visitor.CallExpression(createToHaveBeenCalledCall('fn', 1, 0))
      visitor.CallExpression(createToHaveBeenCalledWithCall('fn', 2, 0))
      visitor.CallExpression(createToHaveBeenCalledCall('fn2', 3, 0))
      visitor.CallExpression(createNotToHaveBeenCalledCall('fn', 4, 0))

      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(3)
    })
  })

  describe('report message content', () => {
    test('message mentions toHaveBeenCalledWith', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      visitor.CallExpression(createToHaveBeenCalledCall())

      expect(reports[0].message).toContain('toHaveBeenCalledWith')
    })

    test('message mentions toHaveBeenLastCalledWith', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      visitor.CallExpression(createToHaveBeenCalledCall())

      expect(reports[0].message).toContain('toHaveBeenLastCalledWith')
    })

    test('message mentions toHaveBeenNthCalledWith', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      visitor.CallExpression(createToHaveBeenCalledCall())

      expect(reports[0].message).toContain('toHaveBeenNthCalledWith')
    })

    test('message mentions toHaveBeenCalled', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      visitor.CallExpression(createToHaveBeenCalledCall())

      expect(reports[0].message).toContain('toHaveBeenCalled')
    })

    test('message mentions more specific assertions', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      visitor.CallExpression(createToHaveBeenCalledCall())

      expect(reports[0].message).toContain('more specific assertions')
    })

    test('message does not use ESLint placeholder format', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      visitor.CallExpression(createToHaveBeenCalledCall())

      expect(reports[0].message).not.toContain('{{')
      expect(reports[0].message).not.toContain('}}')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      visitor.CallExpression(createToHaveBeenCalledCall('fn', 5, 10))

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      visitor.CallExpression({ type: 'CallExpression', arguments: [] })

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'fn' }],
          },
          property: { type: 'Identifier', name: 'toHaveBeenCalled' },
        },
        arguments: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression with Identifier callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'toHaveBeenCalled' },
        arguments: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should not report when property name is not toHaveBeenCalled', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'x' }],
          },
          property: { type: 'Identifier', name: 'toHaveBeenCalledish' },
        },
        arguments: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node with property but no object on callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'toHaveBeenCalled' },
        },
        arguments: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node where callee.object is not a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'toHaveBeenCalled' },
        },
        arguments: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle deeply nested expect calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      visitor.CallExpression(createToHaveBeenCalledCall('fn', 2, 4))
      visitor.CallExpression(createMatcherCall('toBe', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should handle property that is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'x' }],
          },
          property: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'toHaveBeenCalled' },
            property: { type: 'Identifier', name: 'something' },
          },
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

      const visitor1 = preferCalledWithRule.create(ctx1)
      const visitor2 = preferCalledWithRule.create(ctx2)

      visitor1.CallExpression(createToHaveBeenCalledCall())
      visitor2.CallExpression(createToHaveBeenCalledWithCall())

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      visitor.CallExpression(createToHaveBeenCalledCall('fn1', 1, 0))
      visitor.CallExpression(createToHaveBeenCalledCall('fn2', 2, 0))
      visitor.CallExpression(createToHaveBeenCalledWithCall('fn3', 3, 0))
      visitor.CallExpression(createToHaveBeenCalledCall('fn4', 4, 0))

      expect(reports.length).toBe(3)
    })
  })

  describe('default export', () => {
    test('rule should be the default export', () => {
      expect(preferCalledWithRule).toBeDefined()
      expect(preferCalledWithRule.meta).toBeDefined()
      expect(preferCalledWithRule.create).toBeDefined()
    })
  })

  describe('additional meta verification', () => {
    test('should have testing category', () => {
      expect(preferCalledWithRule.meta.docs?.category).toBe('testing')
    })

    test('should have suggestion type', () => {
      expect(preferCalledWithRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferCalledWithRule.meta.severity).toBe('warn')
    })

    test('should have correct docs URL', () => {
      expect(preferCalledWithRule.meta.docs?.url).toBe('https://codeforge.dev/docs/rules/prefer-called-with')
    })

    test('should have recommended set to false', () => {
      expect(preferCalledWithRule.meta.docs?.recommended).toBe(false)
    })
  })

  describe('template literal and literal arguments in expect', () => {
    test('should report expect with template literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{
              type: 'TemplateLiteral',
              quasis: [{ type: 'TemplateElement', value: { raw: 'test' } }],
              expressions: [],
            }],
          },
          property: { type: 'Identifier', name: 'toHaveBeenCalled' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report expect with numeric literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Literal', value: 42 }],
          },
          property: { type: 'Identifier', name: 'toHaveBeenCalled' },
        },
        arguments: [],
        loc: { start: { line: 3, column: 5 }, end: { line: 3, column: 35 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
    })

    test('should report expect with object expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{
              type: 'ObjectExpression',
              properties: [],
            }],
          },
          property: { type: 'Identifier', name: 'toHaveBeenCalled' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report expect with array expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{
              type: 'ArrayExpression',
              elements: [{ type: 'Literal', value: 1 }],
            }],
          },
          property: { type: 'Identifier', name: 'toHaveBeenCalled' },
        },
        arguments: [],
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 40 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report expect with function expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{
              type: 'FunctionExpression',
              id: null,
              params: [],
              body: { type: 'BlockStatement', body: [] },
            }],
          },
          property: { type: 'Identifier', name: 'toHaveBeenCalled' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report expect with boolean literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Literal', value: true }],
          },
          property: { type: 'Identifier', name: 'toHaveBeenCalled' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('resolves and rejects with different function names', () => {
    test('should report resolves.toHaveBeenCalled() with custom fn name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      visitor.CallExpression(createResolvesToHaveBeenCalledCall('asyncMock'))

      expect(reports.length).toBe(1)
    })

    test('should report rejects.toHaveBeenCalled() with custom fn name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      visitor.CallExpression(createRejectsToHaveBeenCalledCall('failingPromise'))

      expect(reports.length).toBe(1)
    })
  })

  describe('resolves and rejects with specific matchers — no reports', () => {
    test('should not report expect(promise).resolves.toHaveBeenCalledWith()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

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
          property: { type: 'Identifier', name: 'toHaveBeenCalledWith' },
        },
        arguments: [{ type: 'Literal', value: 'data' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report expect(promise).rejects.toHaveBeenCalledWith()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

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
          property: { type: 'Identifier', name: 'toHaveBeenCalledWith' },
        },
        arguments: [{ type: 'Literal', value: 'error' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report expect(promise).resolves.toHaveBeenLastCalledWith()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

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
          property: { type: 'Identifier', name: 'toHaveBeenLastCalledWith' },
        },
        arguments: [{ type: 'Literal', value: 'data' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 55 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('report location extraction details', () => {
    test('should report correct end location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      visitor.CallExpression(createToHaveBeenCalledCall('fn', 3, 2))

      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(3)
    })

    test('should report location for each call in a sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      visitor.CallExpression(createToHaveBeenCalledCall('a', 10, 0))
      visitor.CallExpression(createToHaveBeenCalledCall('b', 20, 4))
      visitor.CallExpression(createToHaveBeenCalledCall('c', 30, 8))

      expect(reports.length).toBe(3)
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[1].loc?.start.line).toBe(20)
      expect(reports[2].loc?.start.line).toBe(30)
    })
  })

  describe('computed property access', () => {
    test('should not report when property is computed expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'fn' }],
          },
          property: { type: 'Literal', value: 'toHaveBeenCalled' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('additional meta checks', () => {
    test('should have valid docs URL containing rule name', () => {
      const url = preferCalledWithRule.meta.docs?.url
      expect(url).toMatch(/^https?:\/\/.+/)
      expect(url).toContain('prefer-called-with')
    })

    test('should have create as a function', () => {
      expect(typeof preferCalledWithRule.create).toBe('function')
    })
  })

  describe('toHaveBeenCalledWith variants', () => {
    test('should not report toHaveBeenCalledWith', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'mockFn' }],
          },
          property: { type: 'Identifier', name: 'toHaveBeenCalledWith' },
        },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report toHaveBeenLastCalledWith', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'mockFn' }],
          },
          property: { type: 'Identifier', name: 'toHaveBeenLastCalledWith' },
        },
        arguments: [{ type: 'Literal', value: 'arg' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('rejects with not chain — no reports', () => {
    test('should not report expect(promise).rejects.not.toHaveBeenCalled()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

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
          property: { type: 'Identifier', name: 'toHaveBeenCalled' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('toHaveBeenCalledTimes — no reports', () => {
    test('should not report expect(fn).toHaveBeenCalledTimes(2)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'mockFn' }],
          },
          property: { type: 'Identifier', name: 'toHaveBeenCalledTimes' },
        },
        arguments: [{ type: 'Literal', value: 2 }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('expect with null literal argument', () => {
    test('should report expect(null).toHaveBeenCalled()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferCalledWithRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Literal', value: null }],
          },
          property: { type: 'Identifier', name: 'toHaveBeenCalled' },
        },
        arguments: [],
        loc: { start: { line: 4, column: 2 }, end: { line: 4, column: 30 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(4)
    })
  })
})
