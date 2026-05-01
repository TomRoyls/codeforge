import { describe, expect, test, vi } from 'vitest'

import type { RuleContext } from '../../../../src/plugins/types.js'

import { validExpectRule } from '../../../../src/rules/testing/valid-expect.js'

interface ReportDescriptor {
  loc?: { end: { column: number; line: number }; start: { column: number; line: number } }
  message: string
  node: unknown
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.test.ts',
  source = 'expect(x).toBe(1);',
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    config: { options: [options] },
    getAST: () => null,
    getComments: () => [],
    getFilePath: () => filePath,
    getSource: () => source,
    getTokens: () => [],
    logger: {
      debug: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
    },
    report(descriptor: ReportDescriptor) {
      reports.push({
        loc: descriptor.loc,
        message: descriptor.message,
        node: descriptor.node,
      })
    },
    workspaceRoot: '/src',
  } as unknown as RuleContext

  return { context, reports }
}

// Node factories

function createExpectCall(line = 1, column = 0): unknown {
  return {
    arguments: [{ name: 'x', type: 'Identifier' }],
    callee: { name: 'expect', type: 'Identifier' },
    loc: { end: { column: column + 10, line }, start: { column, line } },
    type: 'CallExpression',
  }
}

function createExpectWithMatcher(line = 1, column = 0): unknown {
  return {
    arguments: [{ type: 'Literal', value: 'expected' }],
    callee: {
      object: {
        arguments: [{ name: 'x', type: 'Identifier' }],
        callee: { name: 'expect', type: 'Identifier' },
        type: 'CallExpression',
      },
      property: { name: 'toBe', type: 'Identifier' },
      type: 'MemberExpression',
    },
    loc: { end: { column: column + 22, line }, start: { column, line } },
    type: 'CallExpression',
  }
}

function createExpectWithNotMatcher(line = 1, column = 0): unknown {
  return {
    arguments: [{ type: 'Literal', value: 'expected' }],
    callee: {
      object: {
        object: {
          arguments: [{ name: 'x', type: 'Identifier' }],
          callee: { name: 'expect', type: 'Identifier' },
          type: 'CallExpression',
        },
        property: { name: 'not', type: 'Identifier' },
        type: 'MemberExpression',
      },
      property: { name: 'toBe', type: 'Identifier' },
      type: 'MemberExpression',
    },
    loc: { end: { column: column + 26, line }, start: { column, line } },
    type: 'CallExpression',
  }
}

function createExpectWithResolvesMatcher(line = 1, column = 0): unknown {
  return {
    arguments: [{ type: 'Literal', value: 'expected' }],
    callee: {
      object: {
        object: {
          arguments: [{ name: 'x', type: 'Identifier' }],
          callee: { name: 'expect', type: 'Identifier' },
          type: 'CallExpression',
        },
        property: { name: 'resolves', type: 'Identifier' },
        type: 'MemberExpression',
      },
      property: { name: 'toBe', type: 'Identifier' },
      type: 'MemberExpression',
    },
    loc: { end: { column: column + 30, line }, start: { column, line } },
    type: 'CallExpression',
  }
}

function createExpectWithRejectsMatcher(line = 1, column = 0): unknown {
  return {
    arguments: [],
    callee: {
      object: {
        object: {
          arguments: [{ name: 'x', type: 'Identifier' }],
          callee: { name: 'expect', type: 'Identifier' },
          type: 'CallExpression',
        },
        property: { name: 'rejects', type: 'Identifier' },
        type: 'MemberExpression',
      },
      property: { name: 'toThrow', type: 'Identifier' },
      type: 'MemberExpression',
    },
    loc: { end: { column: column + 30, line }, start: { column, line } },
    type: 'CallExpression',
  }
}

function createExpectNoArgs(line = 1, column = 0): unknown {
  return {
    arguments: [],
    callee: { name: 'expect', type: 'Identifier' },
    loc: { end: { column: column + 8, line }, start: { column, line } },
    type: 'CallExpression',
  }
}

function createExpectMultipleArgs(line = 1, column = 0): unknown {
  return {
    arguments: [
      { name: 'a', type: 'Identifier' },
      { name: 'b', type: 'Identifier' },
    ],
    callee: { name: 'expect', type: 'Identifier' },
    loc: { end: { column: column + 14, line }, start: { column, line } },
    type: 'CallExpression',
  }
}

function createExpectStaticHelper(methodName: string, line = 1, column = 0): unknown {
  return {
    arguments: [],
    callee: {
      object: { name: 'expect', type: 'Identifier' },
      property: { name: methodName, type: 'Identifier' },
      type: 'MemberExpression',
    },
    loc: { end: { column: column + methodName.length + 9, line }, start: { column, line } },
    type: 'CallExpression',
  }
}

function createNormalCall(name: string, line = 1, column = 0): unknown {
  return {
    arguments: [{ name: 'x', type: 'Identifier' }],
    callee: { name, type: 'Identifier' },
    loc: { end: { column: column + name.length + 3, line }, start: { column, line } },
    type: 'CallExpression',
  }
}

function createCustomAssertCall(name: string, line = 1, column = 0): unknown {
  return {
    arguments: [{ name: 'x', type: 'Identifier' }],
    callee: { name, type: 'Identifier' },
    loc: { end: { column: column + name.length + 4, line }, start: { column, line } },
    type: 'CallExpression',
  }
}

describe('valid-expect rule', () => {
  describe('meta', () => {
    test('should have correct rule type', () => {
      expect(validExpectRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(validExpectRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(validExpectRule.meta.docs?.recommended).toBe(true)
    })

    test('should have correct category', () => {
      expect(validExpectRule.meta.docs?.category).toBe('testing')
    })

    test('should have correct description mentioning expect', () => {
      expect(validExpectRule.meta.docs?.description.toLowerCase()).toContain('expect')
    })

    test('should have correct docs URL', () => {
      expect(validExpectRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/testing/valid-expect',
      )
    })

    test('should have schema with properties', () => {
      const schema = validExpectRule.meta.schema as Record<string, unknown>[]
      expect(Array.isArray(schema)).toBe(true)
      expect(schema.length).toBeGreaterThan(0)
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = validExpectRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = validExpectRule.create(context)
      const visitor2 = validExpectRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })
  })

  describe('valid: correct usage', () => {
    test('should not report expect(value).toBe(x)', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(createExpectWithMatcher())
      expect(reports.length).toBe(0)
    })

    test('should not report expect(value).not.toBe(x)', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(createExpectWithNotMatcher())
      expect(reports.length).toBe(0)
    })

    test('should not report expect(value).resolves.toBe(x)', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(createExpectWithResolvesMatcher())
      expect(reports.length).toBe(0)
    })

    test('should not report expect(value).rejects.toThrow()', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(createExpectWithRejectsMatcher())
      expect(reports.length).toBe(0)
    })

    test('should not report multiple expects with matchers in one test', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(createExpectWithMatcher(1, 0))
      visitor.CallExpression(createExpectWithMatcher(2, 0))
      visitor.CallExpression(createExpectWithMatcher(3, 0))
      expect(reports.length).toBe(0)
    })

    test('should not report expect with complex value and matcher', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      const node = {
        arguments: [
          {
            callee: { name: 'getValue', type: 'Identifier' },
            type: 'CallExpression',
          },
        ],
        callee: {
          object: {
            arguments: [{ name: 'x', type: 'Identifier' }],
            callee: { name: 'expect', type: 'Identifier' },
            type: 'CallExpression',
          },
          property: { name: 'toEqual', type: 'Identifier' },
          type: 'MemberExpression',
        },
        type: 'CallExpression',
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report mixed valid expect styles', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(createExpectWithMatcher(1, 0))
      visitor.CallExpression(createExpectWithNotMatcher(2, 0))
      visitor.CallExpression(createExpectWithResolvesMatcher(3, 0))
      expect(reports.length).toBe(0)
    })

    test('should not report expect with chained matchers', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      const node = {
        arguments: [],
        callee: {
          object: {
            object: {
              object: {
                arguments: [{ name: 'x', type: 'Identifier' }],
                callee: { name: 'expect', type: 'Identifier' },
                type: 'CallExpression',
              },
              property: { name: 'not', type: 'Identifier' },
              type: 'MemberExpression',
            },
            property: { name: 'resolves', type: 'Identifier' },
            type: 'MemberExpression',
          },
          property: { name: 'toBe', type: 'Identifier' },
          type: 'MemberExpression',
        },
        type: 'CallExpression',
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('invalid: missing arguments', () => {
    test('should report expect() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(createExpectNoArgs())
      expect(reports.length).toBe(1)
    })

    test('should report correct message for missing arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(createExpectNoArgs())
      expect(reports[0].message).toContain('requires at least 1 argument')
    })

    test('should report correct location for expect() with no args', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(createExpectNoArgs(5, 10))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report both missing args and no matcher for bare expect()', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(createExpectNoArgs())
      // Missing args is reported first, standalone expect not checked
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('requires at least')
    })
  })

  describe('invalid: too many arguments', () => {
    test('should report expect(a, b) with 2 args', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(createExpectMultipleArgs())
      expect(reports.length).toBe(1)
    })

    test('should report correct message for too many arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(createExpectMultipleArgs())
      expect(reports[0].message).toContain('exactly 1 argument')
    })

    test('should report correct location for too many args', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(createExpectMultipleArgs(8, 4))
      expect(reports[0].loc?.start.line).toBe(8)
      expect(reports[0].loc?.start.column).toBe(4)
    })
  })

  describe('invalid: standalone expect', () => {
    test('should report expect(value) without matcher', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(createExpectCall())
      expect(reports.length).toBe(1)
    })

    test('should report correct message for standalone expect', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(createExpectCall())
      expect(reports[0].message).toContain('must be followed by a matcher call')
    })

    test('should report correct location for standalone expect', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(createExpectCall(12, 6))
      expect(reports[0].loc?.start.line).toBe(12)
      expect(reports[0].loc?.start.column).toBe(6)
    })
  })

  describe('static helper methods', () => {
    test('should not report expect.any()', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(createExpectStaticHelper('any'))
      expect(reports.length).toBe(0)
    })

    test('should not report expect.anything()', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(createExpectStaticHelper('anything'))
      expect(reports.length).toBe(0)
    })

    test('should not report expect.arrayContaining()', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(createExpectStaticHelper('arrayContaining'))
      expect(reports.length).toBe(0)
    })

    test('should not report expect.objectContaining()', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(createExpectStaticHelper('objectContaining'))
      expect(reports.length).toBe(0)
    })

    test('should not report expect.stringContaining()', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(createExpectStaticHelper('stringContaining'))
      expect(reports.length).toBe(0)
    })

    test('should not report expect.stringMatching()', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(createExpectStaticHelper('stringMatching'))
      expect(reports.length).toBe(0)
    })

    test('should not report expect.extend()', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(createExpectStaticHelper('extend'))
      expect(reports.length).toBe(0)
    })

    test('should not report expect.closeTo()', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(createExpectStaticHelper('closeTo'))
      expect(reports.length).toBe(0)
    })

    test('should not report static helpers mixed with normal expect', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(createExpectStaticHelper('any'))
      visitor.CallExpression(createExpectWithMatcher())
      visitor.CallExpression(createExpectStaticHelper('extend'))
      expect(reports.length).toBe(0)
    })
  })

  describe('custom assert function names', () => {
    test('should report assert() when "assert" is in assertFunctionNames and standalone', () => {
      const { context, reports } = createMockContext({
        assertFunctionNames: ['expect', 'assert'],
      })
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(createCustomAssertCall('assert'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('assert')
    })

    test('should not report assert() when "assert" is NOT in assertFunctionNames', () => {
      const { context, reports } = createMockContext({
        assertFunctionNames: ['expect'],
      })
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(createCustomAssertCall('assert'))
      expect(reports.length).toBe(0)
    })

    test('should use default assertFunctionNames when no options provided', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(createNormalCall('assert'))
      expect(reports.length).toBe(0)
    })
  })

  describe('custom min/max args', () => {
    test('should allow 0 args when minArgs is 0', () => {
      const { context, reports } = createMockContext({ minArgs: 0 })
      const visitor = validExpectRule.create(context)
      // expect() with 0 args but standalone - still reports standalone
      visitor.CallExpression(createExpectNoArgs())
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('must be followed by a matcher call')
    })

    test('should report when args below custom minArgs', () => {
      const { context, reports } = createMockContext({ minArgs: 2 })
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(createExpectCall())
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('requires at least 2 arguments')
    })

    test('should allow multiple args when maxArgs is higher', () => {
      const { context, reports } = createMockContext({ maxArgs: 3 })
      const visitor = validExpectRule.create(context)
      const node = {
        arguments: [
          { name: 'a', type: 'Identifier' },
          { name: 'b', type: 'Identifier' },
          { name: 'c', type: 'Identifier' },
        ],
        callee: { name: 'expect', type: 'Identifier' },
        type: 'CallExpression',
      }
      visitor.CallExpression(node)
      // Still reports standalone expect (no matcher)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('must be followed by a matcher call')
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = validExpectRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = validExpectRule.create(context)
      expect(() => visitor.CallExpression()).not.toThrow()
    })

    test('should handle non-CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression({ name: 'expect', type: 'Identifier' })
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression({ arguments: [], type: 'CallExpression' })
      expect(reports.length).toBe(0)
    })

    test('should handle non-Identifier callee', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression({
        arguments: [{ name: 'x', type: 'Identifier' }],
        callee: { type: 'Literal', value: 42 },
        type: 'CallExpression',
      })
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context } = createMockContext()
      const visitor = validExpectRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
    })

    test('should handle node without arguments array', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression({
        callee: { name: 'expect', type: 'Identifier' },
        type: 'CallExpression',
      })
      expect(reports.length).toBe(0)
    })

    test('should not report non-expect call', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(createNormalCall('console.log'))
      expect(reports.length).toBe(0)
    })
  })

  describe('location reporting', () => {
    test('should report start location correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(createExpectCall(10, 5))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report end location correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(createExpectCall(10, 5))
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(15)
    })
  })

  describe('report message content', () => {
    test('message includes assert function name for missing args', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(createExpectNoArgs())
      expect(reports[0].message).toContain('expect')
    })

    test('message includes assert function name for standalone expect', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(createExpectCall())
      expect(reports[0].message).toContain('expect')
      expect(reports[0].message).toContain('must be followed by a matcher call')
    })
  })

  describe('rule meta expanded', () => {
    test('should not have fixable field', () => {
      expect(validExpectRule.meta.fixable).toBeUndefined()
    })

    test('should not have deprecated field', () => {
      expect(validExpectRule.meta.deprecated).toBeUndefined()
    })

    test('schema should contain assertFunctionNames', () => {
      const schema = validExpectRule.meta.schema as Record<string, unknown>[]
      const firstSchema = schema[0] as Record<string, unknown>
      const props = firstSchema.properties as Record<string, unknown>
      expect(props).toHaveProperty('assertFunctionNames')
    })
  })

  describe('default export', () => {
    test('rule should be the default export', () => {
      expect(validExpectRule).toBeDefined()
      expect(validExpectRule.meta).toBeDefined()
      expect(validExpectRule.create).toBeDefined()
    })
  })

  describe('multiple violations', () => {
    test('should report each standalone expect separately', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(createExpectCall(1, 0))
      visitor.CallExpression(createExpectCall(2, 0))
      visitor.CallExpression(createExpectCall(3, 0))
      expect(reports.length).toBe(3)
    })

    test('should report both invalid expects among valid ones', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(createExpectWithMatcher(1, 0))
      visitor.CallExpression(createExpectCall(2, 0))
      visitor.CallExpression(createExpectWithNotMatcher(3, 0))
      visitor.CallExpression(createExpectNoArgs(4, 0))
      expect(reports.length).toBe(2)
    })

    test('should preserve order of reports', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(createExpectCall(5, 0))
      visitor.CallExpression(createExpectCall(10, 0))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[1].loc?.start.line).toBe(10)
    })
  })

  describe('state isolation', () => {
    test('separate visitors should have independent state', () => {
      const { context: ctx1, reports: reports1 } = createMockContext()
      const { context: ctx2, reports: reports2 } = createMockContext()
      const visitor1 = validExpectRule.create(ctx1)
      const visitor2 = validExpectRule.create(ctx2)
      visitor1.CallExpression(createExpectCall())
      visitor2.CallExpression(createExpectWithMatcher())
      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(0)
    })
  })

  describe('custom assert function with matcher', () => {
    test('should not report assert(x).toBe(1) when assert is in assertFunctionNames', () => {
      const { context, reports } = createMockContext({
        assertFunctionNames: ['expect', 'assert'],
      })
      const visitor = validExpectRule.create(context)
      const node = {
        arguments: [{ type: 'Literal', value: 'expected' }],
        callee: {
          object: {
            arguments: [{ name: 'x', type: 'Identifier' }],
            callee: { name: 'assert', type: 'Identifier' },
            type: 'CallExpression',
          },
          property: { name: 'toBe', type: 'Identifier' },
          type: 'MemberExpression',
        },
        type: 'CallExpression',
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should report assert(x) without matcher when assert is in assertFunctionNames', () => {
      const { context, reports } = createMockContext({
        assertFunctionNames: ['expect', 'assert'],
      })
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(createCustomAssertCall('assert'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('assert')
      expect(reports[0].message).toContain('must be followed by a matcher call')
    })

    test('should report assert() missing args with correct function name', () => {
      const { context, reports } = createMockContext({
        assertFunctionNames: ['expect', 'assert'],
      })
      const visitor = validExpectRule.create(context)
      const node = {
        arguments: [],
        callee: { name: 'assert', type: 'Identifier' },
        loc: { end: { column: 9, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('assert()')
    })

    test('should report assert(a, b) too many args with correct function name', () => {
      const { context, reports } = createMockContext({
        assertFunctionNames: ['expect', 'assert'],
      })
      const visitor = validExpectRule.create(context)
      const node = {
        arguments: [
          { name: 'a', type: 'Identifier' },
          { name: 'b', type: 'Identifier' },
        ],
        callee: { name: 'assert', type: 'Identifier' },
        loc: { end: { column: 14, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('assert()')
      expect(reports[0].message).toContain('exactly 1 argument')
    })
  })

  describe('schema properties', () => {
    test('schema should contain minArgs', () => {
      const schema = validExpectRule.meta.schema as Record<string, unknown>[]
      const firstSchema = schema[0] as Record<string, unknown>
      const props = firstSchema.properties as Record<string, unknown>
      expect(props).toHaveProperty('minArgs')
    })

    test('schema should contain maxArgs', () => {
      const schema = validExpectRule.meta.schema as Record<string, unknown>[]
      const firstSchema = schema[0] as Record<string, unknown>
      const props = firstSchema.properties as Record<string, unknown>
      expect(props).toHaveProperty('maxArgs')
    })

    test('schema should have additionalProperties set to false', () => {
      const schema = validExpectRule.meta.schema as Record<string, unknown>[]
      const firstSchema = schema[0] as Record<string, unknown>
      expect(firstSchema.additionalProperties).toBe(false)
    })
  })

  describe('non-static helper methods on expect', () => {
    test('should not report expect.assertions() - not a tracked assert pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(createExpectStaticHelper('assertions'))
      expect(reports.length).toBe(0)
    })

    test('should not report expect.hasAssertions() - not a tracked assert pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(createExpectStaticHelper('hasAssertions'))
      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases: malformed nodes', () => {
    test('should handle node with arguments as null', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression({
        arguments: null,
        callee: { name: 'expect', type: 'Identifier' },
        type: 'CallExpression',
      })
      expect(reports.length).toBe(0)
    })

    test('should handle node with arguments as undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression({
        arguments: undefined,
        callee: { name: 'expect', type: 'Identifier' },
        type: 'CallExpression',
      })
      expect(reports.length).toBe(0)
    })

    test('should handle callee as MemberExpression of non-expect object', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression({
        arguments: [{ name: 'x', type: 'Identifier' }],
        callee: {
          object: {
            arguments: [{ name: 'x', type: 'Identifier' }],
            callee: { name: 'sinon', type: 'Identifier' },
            type: 'CallExpression',
          },
          property: { name: 'calledWith', type: 'Identifier' },
          type: 'MemberExpression',
        },
        type: 'CallExpression',
      })
      expect(reports.length).toBe(0)
    })
  })

  describe('custom minArgs/maxArgs combinations', () => {
    test('should not report when args count equals minArgs', () => {
      const { context, reports } = createMockContext({ minArgs: 1, maxArgs: 1 })
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(createExpectWithMatcher())
      expect(reports.length).toBe(0)
    })

    test('should report plural "arguments" when minArgs > 1', () => {
      const { context, reports } = createMockContext({ minArgs: 2 })
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(createExpectCall())
      expect(reports[0].message).toContain('2 arguments')
    })
  })

  describe('additional coverage', () => {
    test('should not report expect.any() static helper', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(createExpectStaticHelper('any'))
      expect(reports.length).toBe(0)
    })

    test('should not report expect.anything() static helper', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(createExpectStaticHelper('anything'))
      expect(reports.length).toBe(0)
    })

    test('should not report expect.arrayContaining() static helper', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(createExpectStaticHelper('arrayContaining'))
      expect(reports.length).toBe(0)
    })

    test('should not report expect.objectContaining() static helper', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(createExpectStaticHelper('objectContaining'))
      expect(reports.length).toBe(0)
    })

    test('should not report expect.stringContaining() static helper', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(createExpectStaticHelper('stringContaining'))
      expect(reports.length).toBe(0)
    })

    test('should not report expect.stringMatching() static helper', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(createExpectStaticHelper('stringMatching'))
      expect(reports.length).toBe(0)
    })

    test('should not report expect.extend() static helper', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(createExpectStaticHelper('extend'))
      expect(reports.length).toBe(0)
    })

    test('should not report expect.closeTo() static helper', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(createExpectStaticHelper('closeTo'))
      expect(reports.length).toBe(0)
    })

    test('should report expect() with no arguments with default minArgs', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(createExpectNoArgs())
      expect(reports.length).toBe(1)
    })

    test('should report expect(a, b) with too many args for default maxArgs=1', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(createExpectMultipleArgs())
      expect(reports.length).toBe(1)
    })

    test('should still report expect(a, b) when maxArgs=2 due to missing matcher', () => {
      const { context, reports } = createMockContext({ maxArgs: 2 })
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(createExpectMultipleArgs())
      // maxArgs=2 allows 2 args, but expect without matcher is still reported
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('matcher')
    })

    test('should handle null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(null)
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(undefined)
      expect(reports.length).toBe(0)
    })

    test('should handle non-CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo' })
      expect(reports.length).toBe(0)
    })

    test('should not report non-expect function call', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(createNormalCall('someFunction'))
      expect(reports.length).toBe(0)
    })

    test('should handle node with missing callee', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [] })
      expect(reports.length).toBe(0)
    })

    test('should handle node with callee missing name property', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier' },
        arguments: [],
      })
      expect(reports.length).toBe(0)
    })

    test('should handle call with empty arguments array', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(createExpectCall([]))
      expect(reports.length).toBe(1)
    })

    test('should handle null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = validExpectRule.create(context)
      visitor.CallExpression(null)
      expect(reports.length).toBe(0)
    })
  })
})
