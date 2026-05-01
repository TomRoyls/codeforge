import { describe, test, expect, vi } from 'vitest'
import { maxExpectsRule } from '../../../../src/rules/testing/max-expects.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  loc?: { end: { column: number; line: number }; start: { column: number; line: number } }
  message: string
  node: unknown
}

function createMockContext(options: Record<string, unknown> = {}): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
        node: descriptor.node,
      })
    },
    getFilePath: () => '/src/file.test.ts',
    getAST: () => null,
    getSource: () => 'it("test", () => { expect(x).toBe(1); });',
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

function createCall(name: string, args: unknown[] = [], line = 1, column = 0): unknown {
  return {
    arguments: args,
    callee: { name, type: 'Identifier' },
    loc: { end: { column: column + 20, line }, start: { column, line } },
    type: 'CallExpression',
  }
}

function createMemberCall(
  name: string,
  method: string,
  args: unknown[] = [],
  line = 1,
  column = 0,
): unknown {
  return {
    arguments: args,
    callee: {
      object: { name, type: 'Identifier' },
      property: { name: method, type: 'Identifier' },
      type: 'MemberExpression',
    },
    loc: { end: { column: column + 25, line }, start: { column, line } },
    type: 'CallExpression',
  }
}

function createExpectCall(value: string, line = 1, column = 0): unknown {
  return createCall('expect', [{ type: 'Literal', value }], line, column)
}

function createTestCall(args: unknown[] = [], line = 1, column = 0): unknown {
  return createCall('it', [{ type: 'Literal', value: 'test' }, ...args], line, column)
}

function createTestMemberCall(method: string, args: unknown[] = [], line = 1, column = 0): unknown {
  return createMemberCall('it', method, [{ type: 'Literal', value: 'test' }, ...args], line, column)
}

function createDescribeCall(args: unknown[] = [], line = 1, column = 0): unknown {
  return createCall('describe', [{ type: 'Literal', value: 'suite' }, ...args], line, column)
}

describe('max-expects rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(maxExpectsRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(maxExpectsRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(maxExpectsRule.meta.docs?.recommended).toBe(true)
    })

    test('should have testing category', () => {
      expect(maxExpectsRule.meta.docs?.category).toBe('testing')
    })

    test('should have schema defined', () => {
      const schema = maxExpectsRule.meta.schema as Record<string, unknown>[]
      expect(Array.isArray(schema)).toBe(true)
      expect(schema.length).toBeGreaterThan(0)
    })

    test('should have correct description', () => {
      expect(maxExpectsRule.meta.docs?.description).toBe(
        'Enforce a maximum number of assertion calls per test case',
      )
    })

    test('should have correct docs URL', () => {
      expect(maxExpectsRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/testing/max-expects',
      )
    })
  })

  describe('create', () => {
    test('should return visitor with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = maxExpectsRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return visitor with CallExpression:exit method', () => {
      const { context } = createMockContext()
      const visitor = maxExpectsRule.create(context)
      expect(visitor).toHaveProperty('CallExpression:exit')
    })
  })

  describe('valid: within limit', () => {
    test('should not report test with 0 expects', () => {
      const { context, reports } = createMockContext()
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createTestCall())
      visitor['CallExpression:exit'](createTestCall())

      expect(reports.length).toBe(0)
    })

    test('should not report test with 1 expect', () => {
      const { context, reports } = createMockContext()
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createTestCall())
      visitor.CallExpression(createExpectCall('a'))
      visitor['CallExpression:exit'](createTestCall())

      expect(reports.length).toBe(0)
    })

    test('should not report test with exactly 5 expects (default max)', () => {
      const { context, reports } = createMockContext()
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createTestCall())
      for (let i = 0; i < 5; i++) {
        visitor.CallExpression(createExpectCall(`val${i}`))
      }
      visitor['CallExpression:exit'](createTestCall())

      expect(reports.length).toBe(0)
    })

    test('should not report 3 expects with max=10 option', () => {
      const { context, reports } = createMockContext({ max: 10 })
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createTestCall())
      for (let i = 0; i < 3; i++) {
        visitor.CallExpression(createExpectCall(`val${i}`))
      }
      visitor['CallExpression:exit'](createTestCall())

      expect(reports.length).toBe(0)
    })

    test('should not report 1 expect in it.only', () => {
      const { context, reports } = createMockContext()
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createTestMemberCall('only'))
      visitor.CallExpression(createExpectCall('a'))
      visitor['CallExpression:exit'](createTestMemberCall('only'))

      expect(reports.length).toBe(0)
    })
  })

  describe('invalid: exceeds limit', () => {
    test('should report 6th expect with default max=5', () => {
      const { context, reports } = createMockContext()
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createTestCall())
      for (let i = 0; i < 6; i++) {
        visitor.CallExpression(createExpectCall(`val${i}`))
      }
      visitor['CallExpression:exit'](createTestCall())

      expect(reports.length).toBe(1)
    })

    test('should report 3rd expect with max=2 option', () => {
      const { context, reports } = createMockContext({ max: 2 })
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createTestCall())
      for (let i = 0; i < 3; i++) {
        visitor.CallExpression(createExpectCall(`val${i}`))
      }
      visitor['CallExpression:exit'](createTestCall())

      expect(reports.length).toBe(1)
    })

    test('should report all expects exceeding max=5 when there are 10', () => {
      const { context, reports } = createMockContext()
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createTestCall())
      for (let i = 0; i < 10; i++) {
        visitor.CallExpression(createExpectCall(`val${i}`))
      }
      visitor['CallExpression:exit'](createTestCall())

      // 6th through 10th = 5 reports
      expect(reports.length).toBe(5)
    })

    test('should report expect in test() function', () => {
      const { context, reports } = createMockContext({ max: 1 })
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createCall('test', [{ type: 'Literal', value: 'my test' }]))
      visitor.CallExpression(createExpectCall('a'))
      visitor.CallExpression(createExpectCall('b'))
      visitor['CallExpression:exit'](createCall('test', [{ type: 'Literal', value: 'my test' }]))

      expect(reports.length).toBe(1)
    })

    test('should report expect in it.skip', () => {
      const { context, reports } = createMockContext({ max: 1 })
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createTestMemberCall('skip'))
      visitor.CallExpression(createExpectCall('a'))
      visitor.CallExpression(createExpectCall('b'))
      visitor['CallExpression:exit'](createTestMemberCall('skip'))

      expect(reports.length).toBe(1)
    })
  })

  describe('static helpers not counted', () => {
    test('expect.any() should not increment count', () => {
      const { context, reports } = createMockContext({ max: 1 })
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createTestCall())
      visitor.CallExpression(createMemberCall('expect', 'any'))
      visitor.CallExpression(createExpectCall('a'))
      visitor['CallExpression:exit'](createTestCall())

      expect(reports.length).toBe(0)
    })

    test('expect.anything() should not increment count', () => {
      const { context, reports } = createMockContext({ max: 1 })
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createTestCall())
      visitor.CallExpression(createMemberCall('expect', 'anything'))
      visitor.CallExpression(createExpectCall('a'))
      visitor['CallExpression:exit'](createTestCall())

      expect(reports.length).toBe(0)
    })

    test('expect.arrayContaining() should not increment count', () => {
      const { context, reports } = createMockContext({ max: 1 })
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createTestCall())
      visitor.CallExpression(createMemberCall('expect', 'arrayContaining'))
      visitor.CallExpression(createExpectCall('a'))
      visitor['CallExpression:exit'](createTestCall())

      expect(reports.length).toBe(0)
    })

    test('expect.objectContaining() should not increment count', () => {
      const { context, reports } = createMockContext({ max: 1 })
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createTestCall())
      visitor.CallExpression(createMemberCall('expect', 'objectContaining'))
      visitor.CallExpression(createExpectCall('a'))
      visitor['CallExpression:exit'](createTestCall())

      expect(reports.length).toBe(0)
    })

    test('expect.stringContaining() should not increment count', () => {
      const { context, reports } = createMockContext({ max: 1 })
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createTestCall())
      visitor.CallExpression(createMemberCall('expect', 'stringContaining'))
      visitor.CallExpression(createExpectCall('a'))
      visitor['CallExpression:exit'](createTestCall())

      expect(reports.length).toBe(0)
    })

    test('expect.extend() should not increment count', () => {
      const { context, reports } = createMockContext({ max: 1 })
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createTestCall())
      visitor.CallExpression(createMemberCall('expect', 'extend'))
      visitor.CallExpression(createExpectCall('a'))
      visitor['CallExpression:exit'](createTestCall())

      expect(reports.length).toBe(0)
    })
  })

  describe('custom assert function names', () => {
    test('should count custom assert function when configured', () => {
      const { context, reports } = createMockContext({
        assertFunctionNames: ['expect', 'assert'],
        max: 1,
      })
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createTestCall())
      visitor.CallExpression(createExpectCall('a'))
      visitor.CallExpression(createCall('assert', [{ type: 'Identifier', name: 'x' }]))
      visitor['CallExpression:exit'](createTestCall())

      expect(reports.length).toBe(1)
    })

    test('should only count configured assert function names', () => {
      const { context, reports } = createMockContext({
        assertFunctionNames: ['assert'],
        max: 1,
      })
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createTestCall())
      visitor.CallExpression(createExpectCall('a'))
      visitor.CallExpression(createExpectCall('b'))
      visitor['CallExpression:exit'](createTestCall())

      expect(reports.length).toBe(0)
    })

    test('should use default assert function names when not configured', () => {
      const { context, reports } = createMockContext({ max: 1 })
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createTestCall())
      visitor.CallExpression(createCall('assert', [{ type: 'Identifier', name: 'x' }]))
      visitor.CallExpression(createExpectCall('a'))
      visitor.CallExpression(createExpectCall('b'))
      visitor['CallExpression:exit'](createTestCall())

      // Only 'expect' calls are counted, 'assert' is not in defaults
      expect(reports.length).toBe(1)
    })
  })

  describe('custom max option', () => {
    test('max=1 should report on 2nd expect', () => {
      const { context, reports } = createMockContext({ max: 1 })
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createTestCall())
      visitor.CallExpression(createExpectCall('a'))
      visitor.CallExpression(createExpectCall('b'))
      visitor['CallExpression:exit'](createTestCall())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('2')
      expect(reports[0].message).toContain('1')
    })

    test('max=10 should allow 10 expects', () => {
      const { context, reports } = createMockContext({ max: 10 })
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createTestCall())
      for (let i = 0; i < 10; i++) {
        visitor.CallExpression(createExpectCall(`val${i}`))
      }
      visitor['CallExpression:exit'](createTestCall())

      expect(reports.length).toBe(0)
    })

    test('max=0 should report every expect', () => {
      const { context, reports } = createMockContext({ max: 0 })
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createTestCall())
      visitor.CallExpression(createExpectCall('a'))
      visitor.CallExpression(createExpectCall('b'))
      visitor.CallExpression(createExpectCall('c'))
      visitor['CallExpression:exit'](createTestCall())

      expect(reports.length).toBe(3)
    })
  })

  describe('multiple test cases', () => {
    test('each test should be tracked independently', () => {
      const { context, reports } = createMockContext({ max: 1 })
      const visitor = maxExpectsRule.create(context)

      // First test: 2 expects -> 1 report
      visitor.CallExpression(createTestCall([], 1, 0))
      visitor.CallExpression(createExpectCall('a', 2, 0))
      visitor.CallExpression(createExpectCall('b', 3, 0))
      visitor['CallExpression:exit'](createTestCall([], 1, 0))

      // Second test: 1 expect -> 0 reports
      visitor.CallExpression(createTestCall([], 5, 0))
      visitor.CallExpression(createExpectCall('c', 6, 0))
      visitor['CallExpression:exit'](createTestCall([], 5, 0))

      expect(reports.length).toBe(1)
    })

    test('expect counts should not leak between tests', () => {
      const { context, reports } = createMockContext({ max: 3 })
      const visitor = maxExpectsRule.create(context)

      // First test: 3 expects (at limit) -> 0 reports
      visitor.CallExpression(createTestCall([], 1, 0))
      visitor.CallExpression(createExpectCall('a', 2, 0))
      visitor.CallExpression(createExpectCall('b', 3, 0))
      visitor.CallExpression(createExpectCall('c', 4, 0))
      visitor['CallExpression:exit'](createTestCall([], 1, 0))

      // Second test: 3 expects (at limit) -> 0 reports
      visitor.CallExpression(createTestCall([], 10, 0))
      visitor.CallExpression(createExpectCall('d', 11, 0))
      visitor.CallExpression(createExpectCall('e', 12, 0))
      visitor.CallExpression(createExpectCall('f', 13, 0))
      visitor['CallExpression:exit'](createTestCall([], 10, 0))

      expect(reports.length).toBe(0)
    })

    test('second test exceeding limit reports correctly', () => {
      const { context, reports } = createMockContext({ max: 2 })
      const visitor = maxExpectsRule.create(context)

      // First test: 1 expect -> 0 reports
      visitor.CallExpression(createTestCall([], 1, 0))
      visitor.CallExpression(createExpectCall('a', 2, 0))
      visitor['CallExpression:exit'](createTestCall([], 1, 0))

      // Second test: 3 expects -> 1 report
      visitor.CallExpression(createTestCall([], 5, 0))
      visitor.CallExpression(createExpectCall('b', 6, 0))
      visitor.CallExpression(createExpectCall('c', 7, 0))
      visitor.CallExpression(createExpectCall('d', 8, 0))
      visitor['CallExpression:exit'](createTestCall([], 5, 0))

      expect(reports.length).toBe(1)
    })
  })

  describe('nested describes', () => {
    test('expects in describe outside test should not be counted', () => {
      const { context, reports } = createMockContext()
      const visitor = maxExpectsRule.create(context)

      // describe block
      visitor.CallExpression(createDescribeCall())
      // expect inside describe but outside test
      visitor.CallExpression(createExpectCall('a'))
      visitor.CallExpression(createExpectCall('b'))
      visitor.CallExpression(createExpectCall('c'))
      visitor.CallExpression(createExpectCall('d'))
      visitor.CallExpression(createExpectCall('e'))
      visitor.CallExpression(createExpectCall('f'))
      visitor['CallExpression:exit'](createDescribeCall())

      expect(reports.length).toBe(0)
    })

    test('expects in test inside describe should be counted', () => {
      const { context, reports } = createMockContext({ max: 1 })
      const visitor = maxExpectsRule.create(context)

      // describe block
      visitor.CallExpression(createDescribeCall())
      // expect outside test - not counted
      visitor.CallExpression(createExpectCall('a'))
      // test inside describe
      visitor.CallExpression(createTestCall())
      visitor.CallExpression(createExpectCall('b'))
      visitor.CallExpression(createExpectCall('c'))
      visitor['CallExpression:exit'](createTestCall())
      visitor['CallExpression:exit'](createDescribeCall())

      expect(reports.length).toBe(1)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = maxExpectsRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = maxExpectsRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle empty arguments array', () => {
      const { context, reports } = createMockContext()
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createTestCall())
      visitor.CallExpression({
        arguments: [],
        callee: { name: 'expect', type: 'Identifier' },
        type: 'CallExpression',
      })
      visitor['CallExpression:exit'](createTestCall())

      // expect() with no args is still counted
      expect(reports.length).toBe(0)
    })

    test('should handle expect not in test', () => {
      const { context, reports } = createMockContext()
      const visitor = maxExpectsRule.create(context)

      // expect outside any test
      visitor.CallExpression(createExpectCall('a'))
      visitor.CallExpression(createExpectCall('b'))

      expect(reports.length).toBe(0)
    })

    test('should handle non-Identifier callee', () => {
      const { context, reports } = createMockContext()
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createTestCall())
      visitor.CallExpression({
        arguments: [{ type: 'Literal', value: 42 }],
        callee: { type: 'FunctionExpression' },
        type: 'CallExpression',
      })
      visitor['CallExpression:exit'](createTestCall())

      expect(reports.length).toBe(0)
    })

    test('should handle non-CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = maxExpectsRule.create(context)

      expect(() =>
        visitor.CallExpression({
          type: 'Literal',
          value: 42,
        }),
      ).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('location reporting', () => {
    test('should report correct start location', () => {
      const { context, reports } = createMockContext({ max: 0 })
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createTestCall())
      visitor.CallExpression(createExpectCall('a', 5, 10))
      visitor['CallExpression:exit'](createTestCall())

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report correct end location', () => {
      const { context, reports } = createMockContext({ max: 0 })
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createTestCall())
      visitor.CallExpression(createExpectCall('a', 3, 4))
      visitor['CallExpression:exit'](createTestCall())

      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(24) // column + 20
    })
  })

  describe('report message content', () => {
    test('message includes the count of expects', () => {
      const { context, reports } = createMockContext({ max: 1 })
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createTestCall())
      visitor.CallExpression(createExpectCall('a'))
      visitor.CallExpression(createExpectCall('b'))
      visitor['CallExpression:exit'](createTestCall())

      expect(reports[0].message).toContain('2')
    })

    test('message includes the max value', () => {
      const { context, reports } = createMockContext({ max: 3 })
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createTestCall())
      for (let i = 0; i < 4; i++) {
        visitor.CallExpression(createExpectCall(`val${i}`))
      }
      visitor['CallExpression:exit'](createTestCall())

      expect(reports[0].message).toContain('3')
    })
  })

  describe('independent visitors', () => {
    test('multiple creates should work independently', () => {
      const { context: ctx1, reports: rep1 } = createMockContext({ max: 1 })
      const { context: ctx2, reports: rep2 } = createMockContext({ max: 10 })

      const visitor1 = maxExpectsRule.create(ctx1)
      const visitor2 = maxExpectsRule.create(ctx2)

      visitor1.CallExpression(createTestCall())
      visitor1.CallExpression(createExpectCall('a'))
      visitor1.CallExpression(createExpectCall('b'))
      visitor1['CallExpression:exit'](createTestCall())

      visitor2.CallExpression(createTestCall())
      visitor2.CallExpression(createExpectCall('a'))
      visitor2.CallExpression(createExpectCall('b'))
      visitor2['CallExpression:exit'](createTestCall())

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })
  })

  describe('multiple violations', () => {
    test('should report each exceeding expect call', () => {
      const { context, reports } = createMockContext({ max: 2 })
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createTestCall())
      visitor.CallExpression(createExpectCall('a'))
      visitor.CallExpression(createExpectCall('b'))
      visitor.CallExpression(createExpectCall('c')) // 3rd: report
      visitor.CallExpression(createExpectCall('d')) // 4th: report
      visitor['CallExpression:exit'](createTestCall())

      expect(reports.length).toBe(2)
    })

    test('should report correct count in each message', () => {
      const { context, reports } = createMockContext({ max: 2 })
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createTestCall())
      visitor.CallExpression(createExpectCall('a'))
      visitor.CallExpression(createExpectCall('b'))
      visitor.CallExpression(createExpectCall('c'))
      visitor.CallExpression(createExpectCall('d'))
      visitor['CallExpression:exit'](createTestCall())

      expect(reports[0].message).toContain('3')
      expect(reports[1].message).toContain('4')
    })
  })

  describe('test member expressions', () => {
    test('should track expects in test.each', () => {
      const { context, reports } = createMockContext({ max: 1 })
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createMemberCall('test', 'each'))
      visitor.CallExpression(createExpectCall('a'))
      visitor.CallExpression(createExpectCall('b'))
      visitor['CallExpression:exit'](createMemberCall('test', 'each'))

      expect(reports.length).toBe(1)
    })

    test('should track expects in it.only', () => {
      const { context, reports } = createMockContext({ max: 1 })
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createTestMemberCall('only'))
      visitor.CallExpression(createExpectCall('a'))
      visitor.CallExpression(createExpectCall('b'))
      visitor['CallExpression:exit'](createTestMemberCall('only'))

      expect(reports.length).toBe(1)
    })
  })

  describe('test() function detection', () => {
    test('should detect test() as a test case', () => {
      const { context, reports } = createMockContext({ max: 0 })
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createCall('test', [{ type: 'Literal', value: 'my test' }]))
      visitor.CallExpression(createExpectCall('a'))
      visitor['CallExpression:exit'](createCall('test', [{ type: 'Literal', value: 'my test' }]))

      expect(reports.length).toBe(1)
    })

    test('should detect it() as a test case', () => {
      const { context, reports } = createMockContext({ max: 0 })
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createTestCall())
      visitor.CallExpression(createExpectCall('a'))
      visitor['CallExpression:exit'](createTestCall())

      expect(reports.length).toBe(1)
    })

    test('should not detect other functions as test cases', () => {
      const { context, reports } = createMockContext({ max: 0 })
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createCall('someFunction'))
      visitor.CallExpression(createExpectCall('a'))
      visitor['CallExpression:exit'](createCall('someFunction'))

      expect(reports.length).toBe(0)
    })
  })

  describe('schema properties', () => {
    test('schema should have max property', () => {
      const schema = maxExpectsRule.meta.schema as Record<string, unknown>[]
      const firstSchema = schema[0] as Record<string, unknown>
      const properties = firstSchema.properties as Record<string, unknown>
      expect(properties).toHaveProperty('max')
    })

    test('schema should have assertFunctionNames property', () => {
      const schema = maxExpectsRule.meta.schema as Record<string, unknown>[]
      const firstSchema = schema[0] as Record<string, unknown>
      const properties = firstSchema.properties as Record<string, unknown>
      expect(properties).toHaveProperty('assertFunctionNames')
    })
  })

  describe('default export', () => {
    test('rule should be the default export', () => {
      expect(maxExpectsRule).toBeDefined()
      expect(maxExpectsRule.meta).toBeDefined()
      expect(maxExpectsRule.create).toBeDefined()
    })
  })

  describe('node passed to report', () => {
    test('report should include the expect node', () => {
      const { context, reports } = createMockContext({ max: 0 })
      const visitor = maxExpectsRule.create(context)

      const expectNode = createExpectCall('a', 3, 5)
      visitor.CallExpression(createTestCall())
      visitor.CallExpression(expectNode)
      visitor['CallExpression:exit'](createTestCall())

      expect(reports[0].node).toBe(expectNode)
    })
  })

  describe('more static helpers not counted', () => {
    test('expect.assertions() should not increment count', () => {
      const { context, reports } = createMockContext({ max: 1 })
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createTestCall())
      visitor.CallExpression(createMemberCall('expect', 'assertions'))
      visitor.CallExpression(createExpectCall('a'))
      visitor['CallExpression:exit'](createTestCall())

      expect(reports.length).toBe(0)
    })

    test('expect.hasAssertions() should not increment count', () => {
      const { context, reports } = createMockContext({ max: 1 })
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createTestCall())
      visitor.CallExpression(createMemberCall('expect', 'hasAssertions'))
      visitor.CallExpression(createExpectCall('a'))
      visitor['CallExpression:exit'](createTestCall())

      expect(reports.length).toBe(0)
    })

    test('expect.addEqualityTesters() should not increment count', () => {
      const { context, reports } = createMockContext({ max: 1 })
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createTestCall())
      visitor.CallExpression(createMemberCall('expect', 'addEqualityTesters'))
      visitor.CallExpression(createExpectCall('a'))
      visitor['CallExpression:exit'](createTestCall())

      expect(reports.length).toBe(0)
    })

    test('expect.close() should not increment count', () => {
      const { context, reports } = createMockContext({ max: 1 })
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createTestCall())
      visitor.CallExpression(createMemberCall('expect', 'close'))
      visitor.CallExpression(createExpectCall('a'))
      visitor['CallExpression:exit'](createTestCall())

      expect(reports.length).toBe(0)
    })
  })

  describe('test member expression variants', () => {
    test('should track expects in test.skip', () => {
      const { context, reports } = createMockContext({ max: 1 })
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createMemberCall('test', 'skip'))
      visitor.CallExpression(createExpectCall('a'))
      visitor.CallExpression(createExpectCall('b'))
      visitor['CallExpression:exit'](createMemberCall('test', 'skip'))

      expect(reports.length).toBe(1)
    })

    test('should track expects in test.only', () => {
      const { context, reports } = createMockContext({ max: 1 })
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createMemberCall('test', 'only'))
      visitor.CallExpression(createExpectCall('a'))
      visitor.CallExpression(createExpectCall('b'))
      visitor['CallExpression:exit'](createMemberCall('test', 'only'))

      expect(reports.length).toBe(1)
    })

    test('should track expects in it.each', () => {
      const { context, reports } = createMockContext({ max: 1 })
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createTestMemberCall('each'))
      visitor.CallExpression(createExpectCall('a'))
      visitor.CallExpression(createExpectCall('b'))
      visitor['CallExpression:exit'](createTestMemberCall('each'))

      expect(reports.length).toBe(1)
    })

    test('should track expects in test.concurrent', () => {
      const { context, reports } = createMockContext({ max: 1 })
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createMemberCall('test', 'concurrent'))
      visitor.CallExpression(createExpectCall('a'))
      visitor.CallExpression(createExpectCall('b'))
      visitor['CallExpression:exit'](createMemberCall('test', 'concurrent'))

      expect(reports.length).toBe(1)
    })

    test('should not treat describe.only as test case', () => {
      const { context, reports } = createMockContext({ max: 0 })
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createMemberCall('describe', 'only'))
      visitor.CallExpression(createExpectCall('a'))
      visitor['CallExpression:exit'](createMemberCall('describe', 'only'))

      expect(reports.length).toBe(0)
    })

    test('should not treat describe.skip as test case', () => {
      const { context, reports } = createMockContext({ max: 0 })
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createMemberCall('describe', 'skip'))
      visitor.CallExpression(createExpectCall('a'))
      visitor['CallExpression:exit'](createMemberCall('describe', 'skip'))

      expect(reports.length).toBe(0)
    })

    test('should not treat describe.each as test case', () => {
      const { context, reports } = createMockContext({ max: 0 })
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createMemberCall('describe', 'each'))
      visitor.CallExpression(createExpectCall('a'))
      visitor['CallExpression:exit'](createMemberCall('describe', 'each'))

      expect(reports.length).toBe(0)
    })
  })

  describe('nested test scenarios', () => {
    test('nested describe with test should count correctly', () => {
      const { context, reports } = createMockContext({ max: 1 })
      const visitor = maxExpectsRule.create(context)

      // Outer describe
      visitor.CallExpression(createDescribeCall())
      // Inner describe
      visitor.CallExpression(createDescribeCall())
      // Test inside nested describe
      visitor.CallExpression(createTestCall())
      visitor.CallExpression(createExpectCall('a'))
      visitor.CallExpression(createExpectCall('b')) // over limit
      visitor['CallExpression:exit'](createTestCall())
      // Close inner describe
      visitor['CallExpression:exit'](createDescribeCall())
      // Close outer describe
      visitor['CallExpression:exit'](createDescribeCall())

      expect(reports.length).toBe(1)
    })

    test('multiple tests in nested describe each tracked independently', () => {
      const { context, reports } = createMockContext({ max: 2 })
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createDescribeCall())

      // First test: 2 expects (at limit)
      visitor.CallExpression(createTestCall())
      visitor.CallExpression(createExpectCall('a'))
      visitor.CallExpression(createExpectCall('b'))
      visitor['CallExpression:exit'](createTestCall())

      // Second test: 3 expects (over limit)
      visitor.CallExpression(createTestCall())
      visitor.CallExpression(createExpectCall('c'))
      visitor.CallExpression(createExpectCall('d'))
      visitor.CallExpression(createExpectCall('e'))
      visitor['CallExpression:exit'](createTestCall())

      visitor['CallExpression:exit'](createDescribeCall())

      expect(reports.length).toBe(1)
    })

    test('expect in describe between two tests not counted toward either', () => {
      const { context, reports } = createMockContext({ max: 1 })
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createDescribeCall())

      // First test
      visitor.CallExpression(createTestCall())
      visitor.CallExpression(createExpectCall('a'))
      visitor['CallExpression:exit'](createTestCall())

      // Expect between tests - not inside any test
      visitor.CallExpression(createExpectCall('between'))

      // Second test
      visitor.CallExpression(createTestCall())
      visitor.CallExpression(createExpectCall('b'))
      visitor['CallExpression:exit'](createTestCall())

      visitor['CallExpression:exit'](createDescribeCall())

      expect(reports.length).toBe(0)
    })
  })

  describe('custom assert function names advanced', () => {
    test('should count multiple custom assert function names', () => {
      const { context, reports } = createMockContext({
        assertFunctionNames: ['expect', 'assert', 'should'],
        max: 2,
      })
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createTestCall())
      visitor.CallExpression(createExpectCall('a'))
      visitor.CallExpression(createCall('assert', [{ type: 'Identifier', name: 'x' }]))
      visitor.CallExpression(createCall('should', [{ type: 'Identifier', name: 'y' }]))
      visitor['CallExpression:exit'](createTestCall())

      expect(reports.length).toBe(1)
    })

    test('should not count non-configured functions even inside test', () => {
      const { context, reports } = createMockContext({
        assertFunctionNames: ['assert'],
        max: 0,
      })
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createTestCall())
      visitor.CallExpression(createCall('someOtherFunction', [{ type: 'Literal', value: 1 }]))
      visitor['CallExpression:exit'](createTestCall())

      expect(reports.length).toBe(0)
    })

    test('empty assertFunctionNames array should count nothing', () => {
      const { context, reports } = createMockContext({
        assertFunctionNames: [],
        max: 0,
      })
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createTestCall())
      visitor.CallExpression(createExpectCall('a'))
      visitor.CallExpression(createExpectCall('b'))
      visitor['CallExpression:exit'](createTestCall())

      expect(reports.length).toBe(0)
    })
  })

  describe('boundary values', () => {
    test('exactly at max=1 should not report', () => {
      const { context, reports } = createMockContext({ max: 1 })
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createTestCall())
      visitor.CallExpression(createExpectCall('a'))
      visitor['CallExpression:exit'](createTestCall())

      expect(reports.length).toBe(0)
    })

    test('one over max=1 should report', () => {
      const { context, reports } = createMockContext({ max: 1 })
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createTestCall())
      visitor.CallExpression(createExpectCall('a'))
      visitor.CallExpression(createExpectCall('b'))
      visitor['CallExpression:exit'](createTestCall())

      expect(reports.length).toBe(1)
    })

    test('exactly at default max=5 with explicit config should not report', () => {
      const { context, reports } = createMockContext({ max: 5 })
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createTestCall())
      for (let i = 0; i < 5; i++) {
        visitor.CallExpression(createExpectCall(`val${i}`))
      }
      visitor['CallExpression:exit'](createTestCall())

      expect(reports.length).toBe(0)
    })

    test('one under max=3 should not report', () => {
      const { context, reports } = createMockContext({ max: 3 })
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createTestCall())
      visitor.CallExpression(createExpectCall('a'))
      visitor.CallExpression(createExpectCall('b'))
      visitor['CallExpression:exit'](createTestCall())

      expect(reports.length).toBe(0)
    })

    test('large max value should allow many expects', () => {
      const { context, reports } = createMockContext({ max: 100 })
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createTestCall())
      for (let i = 0; i < 100; i++) {
        visitor.CallExpression(createExpectCall(`val${i}`))
      }
      visitor['CallExpression:exit'](createTestCall())

      expect(reports.length).toBe(0)
    })

    test('large max value exceeded should report', () => {
      const { context, reports } = createMockContext({ max: 100 })
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createTestCall())
      for (let i = 0; i < 101; i++) {
        visitor.CallExpression(createExpectCall(`val${i}`))
      }
      visitor['CallExpression:exit'](createTestCall())

      expect(reports.length).toBe(1)
    })
  })

  describe('report message format', () => {
    test('message should contain "Too many assertion calls"', () => {
      const { context, reports } = createMockContext({ max: 0 })
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createTestCall())
      visitor.CallExpression(createExpectCall('a'))
      visitor['CallExpression:exit'](createTestCall())

      expect(reports[0].message).toContain('Too many assertion calls')
    })

    test('message should contain "Maximum allowed is"', () => {
      const { context, reports } = createMockContext({ max: 0 })
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createTestCall())
      visitor.CallExpression(createExpectCall('a'))
      visitor['CallExpression:exit'](createTestCall())

      expect(reports[0].message).toContain('Maximum allowed is 0')
    })

    test('message should contain the exact expect count', () => {
      const { context, reports } = createMockContext({ max: 2 })
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createTestCall())
      for (let i = 0; i < 5; i++) {
        visitor.CallExpression(createExpectCall(`val${i}`))
      }
      visitor['CallExpression:exit'](createTestCall())

      // 3rd, 4th, 5th expect should report with counts 3, 4, 5
      expect(reports[0].message).toContain('(3)')
      expect(reports[1].message).toContain('(4)')
      expect(reports[2].message).toContain('(5)')
    })
  })

  describe('node without callee property', () => {
    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createTestCall())
      visitor.CallExpression({
        arguments: [],
        type: 'CallExpression',
      })
      visitor['CallExpression:exit'](createTestCall())

      expect(reports.length).toBe(0)
    })
  })

  describe('schema structure', () => {
    test('schema should have type object', () => {
      const schema = maxExpectsRule.meta.schema as Record<string, unknown>[]
      const firstSchema = schema[0] as Record<string, unknown>
      expect(firstSchema.type).toBe('object')
    })

    test('schema should have additionalProperties false', () => {
      const schema = maxExpectsRule.meta.schema as Record<string, unknown>[]
      const firstSchema = schema[0] as Record<string, unknown>
      expect(firstSchema.additionalProperties).toBe(false)
    })

    test('max in schema should have type number', () => {
      const schema = maxExpectsRule.meta.schema as Record<string, unknown>[]
      const firstSchema = schema[0] as Record<string, unknown>
      const properties = firstSchema.properties as Record<string, unknown>
      const maxProp = properties.max as Record<string, unknown>
      expect(maxProp.type).toBe('number')
    })

    test('assertFunctionNames in schema should have type array', () => {
      const schema = maxExpectsRule.meta.schema as Record<string, unknown>[]
      const firstSchema = schema[0] as Record<string, unknown>
      const properties = firstSchema.properties as Record<string, unknown>
      const assertProp = properties.assertFunctionNames as Record<string, unknown>
      expect(assertProp.type).toBe('array')
    })
  })

  describe('additional verification', () => {
    test('should have create as a function', () => {
      expect(typeof maxExpectsRule.create).toBe('function')
    })
  })

  describe('negative max value', () => {
    test('max=-1 should report every expect since any count exceeds -1', () => {
      const { context, reports } = createMockContext({ max: -1 })
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createTestCall())
      visitor.CallExpression(createExpectCall('a'))
      visitor.CallExpression(createExpectCall('b'))
      visitor.CallExpression(createExpectCall('c'))
      visitor['CallExpression:exit'](createTestCall())

      expect(reports.length).toBe(3)
    })
  })

  describe('nested test cases', () => {
    test('expect count continues from inner test after inner exits', () => {
      const { context, reports } = createMockContext({ max: 1 })
      const visitor = maxExpectsRule.create(context)

      // Outer test
      visitor.CallExpression(createTestCall())
      visitor.CallExpression(createExpectCall('a'))
      // Inner test (resets count)
      visitor.CallExpression(createTestCall())
      visitor.CallExpression(createExpectCall('b'))
      visitor['CallExpression:exit'](createTestCall())
      // Back in outer test — count continues from inner's last value
      visitor.CallExpression(createExpectCall('c'))
      visitor['CallExpression:exit'](createTestCall())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('2')
    })
  })

  describe('test.failing member expression', () => {
    test('should track expects in test.failing', () => {
      const { context, reports } = createMockContext({ max: 1 })
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createMemberCall('test', 'failing'))
      visitor.CallExpression(createExpectCall('a'))
      visitor.CallExpression(createExpectCall('b'))
      visitor['CallExpression:exit'](createMemberCall('test', 'failing'))

      expect(reports.length).toBe(1)
    })
  })

  describe('it.todo member expression', () => {
    test('should track expects in it.todo', () => {
      const { context, reports } = createMockContext({ max: 1 })
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createTestMemberCall('todo'))
      visitor.CallExpression(createExpectCall('a'))
      visitor.CallExpression(createExpectCall('b'))
      visitor['CallExpression:exit'](createTestMemberCall('todo'))

      expect(reports.length).toBe(1)
    })
  })

  describe('floating point max', () => {
    test('max=0.5 should report first expect since 1 > 0.5', () => {
      const { context, reports } = createMockContext({ max: 0.5 })
      const visitor = maxExpectsRule.create(context)

      visitor.CallExpression(createTestCall())
      visitor.CallExpression(createExpectCall('a'))
      visitor['CallExpression:exit'](createTestCall())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('1')
      expect(reports[0].message).toContain('0.5')
    })
  })
})
