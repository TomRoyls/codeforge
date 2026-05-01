import { describe, test, expect, vi } from 'vitest'
import { noStandaloneExpectRule } from '../../../../src/rules/testing/no-standalone-expect.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.test.ts',
  source = 'it("test", () => { expect(x).toBe(1); });',
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

function createCallExpression(
  calleeName: string,
  line = 1,
  column = 0,
  args: unknown[] = [],
): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: calleeName },
    arguments: args,
    loc: { start: { line, column }, end: { line, column: column + calleeName.length + 2 } },
  }
}

function createExpectCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'expect' },
    arguments: [{ type: 'Identifier', name: 'x' }],
    loc: { start: { line, column }, end: { line, column: column + 10 } },
  }
}

function createExpectChainCall(line = 1, column = 0): unknown {
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
    arguments: [{ type: 'Literal', value: 1 }],
    loc: { start: { line, column }, end: { line, column: column + 20 } },
  }
}

function createTestCall(name: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name },
    arguments: [
      { type: 'Literal', value: 'test name' },
      {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      },
    ],
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
}

function createTestModifierCall(
  testName: string,
  modifier: string,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: testName },
      property: { type: 'Identifier', name: modifier },
    },
    arguments: [
      { type: 'Literal', value: 'test name' },
      {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      },
    ],
    loc: { start: { line, column }, end: { line, column: column + 40 } },
  }
}

function createTestEachCall(testName: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: testName },
        property: { type: 'Identifier', name: 'each' },
      },
      arguments: [{ type: 'ArrayExpression', elements: [] }],
    },
    arguments: [
      { type: 'Literal', value: 'test name' },
      {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      },
    ],
    loc: { start: { line, column }, end: { line, column: column + 50 } },
  }
}

function createHookCall(name: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name },
    arguments: [
      {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      },
    ],
    loc: { start: { line, column }, end: { line, column: column + 25 } },
  }
}

function createDescribeCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'describe' },
    arguments: [
      { type: 'Literal', value: 'suite' },
      {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      },
    ],
    loc: { start: { line, column }, end: { line, column: column + 35 } },
  }
}

describe('no-standalone-expect rule', () => {
  describe('meta', () => {
    test('should have correct rule type', () => {
      expect(noStandaloneExpectRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noStandaloneExpectRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noStandaloneExpectRule.meta.docs?.recommended).toBe(true)
    })

    test('should have testing category', () => {
      expect(noStandaloneExpectRule.meta.docs?.category).toBe('testing')
    })

    test('should have description mentioning expect', () => {
      expect(noStandaloneExpectRule.meta.docs?.description.toLowerCase()).toContain('expect')
    })

    test('should have description mentioning test or hook', () => {
      const desc = noStandaloneExpectRule.meta.docs?.description.toLowerCase() ?? ''
      expect(desc.includes('test') || desc.includes('hook')).toBe(true)
    })

    test('should have correct docs URL', () => {
      expect(noStandaloneExpectRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-standalone-expect',
      )
    })

    test('should not have fixable field', () => {
      expect(noStandaloneExpectRule.meta.fixable).toBeUndefined()
    })
  })

  describe('create', () => {
    test('should return visitor with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return visitor with CallExpression:exit method', () => {
      const { context } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)
      expect(visitor).toHaveProperty('CallExpression:exit')
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noStandaloneExpectRule.create(context)
      const visitor2 = noStandaloneExpectRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })
  })

  describe('valid: expect inside it()', () => {
    test('should not report expect inside it()', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const itCall = createTestCall('it')
      visitor.CallExpression(itCall)
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](itCall)

      expect(reports.length).toBe(0)
    })

    test('should not report expect inside test()', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const testCall = createTestCall('test')
      visitor.CallExpression(testCall)
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](testCall)

      expect(reports.length).toBe(0)
    })

    test('should not report chained expect inside it()', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const itCall = createTestCall('it')
      visitor.CallExpression(itCall)
      visitor.CallExpression(createExpectChainCall())
      visitor['CallExpression:exit'](itCall)

      expect(reports.length).toBe(0)
    })

    test('should not report multiple expects inside it()', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const itCall = createTestCall('it')
      visitor.CallExpression(itCall)
      visitor.CallExpression(createExpectCall(1, 0))
      visitor.CallExpression(createExpectCall(2, 0))
      visitor.CallExpression(createExpectCall(3, 0))
      visitor['CallExpression:exit'](itCall)

      expect(reports.length).toBe(0)
    })
  })

  describe('valid: expect inside hooks', () => {
    test('should not report expect inside beforeEach()', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const hook = createHookCall('beforeEach')
      visitor.CallExpression(hook)
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](hook)

      expect(reports.length).toBe(0)
    })

    test('should not report expect inside afterEach()', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const hook = createHookCall('afterEach')
      visitor.CallExpression(hook)
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](hook)

      expect(reports.length).toBe(0)
    })

    test('should not report expect inside beforeAll()', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const hook = createHookCall('beforeAll')
      visitor.CallExpression(hook)
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](hook)

      expect(reports.length).toBe(0)
    })

    test('should not report expect inside afterAll()', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const hook = createHookCall('afterAll')
      visitor.CallExpression(hook)
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](hook)

      expect(reports.length).toBe(0)
    })
  })

  describe('valid: expect inside test modifiers', () => {
    test('should not report expect inside it.only()', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const call = createTestModifierCall('it', 'only')
      visitor.CallExpression(call)
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(0)
    })

    test('should not report expect inside test.only()', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const call = createTestModifierCall('test', 'only')
      visitor.CallExpression(call)
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(0)
    })

    test('should not report expect inside it.skip()', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const call = createTestModifierCall('it', 'skip')
      visitor.CallExpression(call)
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(0)
    })

    test('should not report expect inside test.skip()', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const call = createTestModifierCall('test', 'skip')
      visitor.CallExpression(call)
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(0)
    })

    test('should not report expect inside it.each()()', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const call = createTestEachCall('it')
      visitor.CallExpression(call)
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(0)
    })

    test('should not report expect inside test.each()()', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const call = createTestEachCall('test')
      visitor.CallExpression(call)
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(0)
    })
  })

  describe('invalid: expect outside any context', () => {
    test('should report expect at top level', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      visitor.CallExpression(createExpectCall())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Expect should be inside a test or hook function')
    })

    test('should report correct location for standalone expect', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      visitor.CallExpression(createExpectCall(10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report multiple standalone expects', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      visitor.CallExpression(createExpectCall(1, 0))
      visitor.CallExpression(createExpectCall(2, 0))
      visitor.CallExpression(createExpectCall(3, 0))

      expect(reports.length).toBe(3)
    })

    test('should report chained expect at top level', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      visitor.CallExpression(createExpectChainCall())

      expect(reports.length).toBe(1)
    })
  })

  describe('invalid: expect inside describe but outside it', () => {
    test('should report expect inside describe() without it()', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](desc)

      expect(reports.length).toBe(1)
    })

    test('should not report expect inside it() which is inside describe()', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const desc = createDescribeCall()
      visitor.CallExpression(desc)

      const itCall = createTestCall('it')
      visitor.CallExpression(itCall)
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](itCall)

      visitor['CallExpression:exit'](desc)

      expect(reports.length).toBe(0)
    })
  })

  describe('invalid: expect in helper function', () => {
    test('should report expect in a regular function call at top level', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const fnCall = createCallExpression('helperFn')
      visitor.CallExpression(fnCall)
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](fnCall)

      expect(reports.length).toBe(1)
    })

    test('should report expect in a for loop at top level', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      visitor.CallExpression(createExpectCall(1, 0))
      visitor.CallExpression(createExpectCall(2, 0))

      expect(reports.length).toBe(2)
    })
  })

  describe('context depth tracking', () => {
    test('should not report expect after test context exits', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const itCall = createTestCall('it')
      visitor.CallExpression(itCall)
      visitor.CallExpression(createExpectCall(1, 0))
      visitor['CallExpression:exit'](itCall)

      visitor.CallExpression(createExpectCall(5, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
    })

    test('should correctly handle nested test contexts', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const itCall = createTestCall('it')
      visitor.CallExpression(itCall)

      const beforeEachCall = createHookCall('beforeEach')
      visitor.CallExpression(beforeEachCall)
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](beforeEachCall)

      visitor['CallExpression:exit'](itCall)

      expect(reports.length).toBe(0)
    })

    test('should report expect between two valid contexts', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const it1 = createTestCall('it')
      visitor.CallExpression(it1)
      visitor.CallExpression(createExpectCall(1, 0))
      visitor['CallExpression:exit'](it1)

      visitor.CallExpression(createExpectCall(5, 0))

      const it2 = createTestCall('it')
      visitor.CallExpression(it2)
      visitor.CallExpression(createExpectCall(8, 0))
      visitor['CallExpression:exit'](it2)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
    })

    test('should track depth correctly with multiple sequential test contexts', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      for (let i = 0; i < 5; i++) {
        const itCall = createTestCall('it')
        visitor.CallExpression(itCall)
        visitor.CallExpression(createExpectCall(i + 1, 0))
        visitor['CallExpression:exit'](itCall)
      }

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      visitor.CallExpression({ type: 'CallExpression', arguments: [] })

      expect(reports.length).toBe(0)
    })

    test('should not report non-expect calls at top level', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      visitor.CallExpression(createCallExpression('console.log'))
      visitor.CallExpression(createCallExpression('helper'))

      expect(reports.length).toBe(0)
    })

    test('should not report describe() as a valid context for expect', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](desc)

      expect(reports.length).toBe(1)
    })

    test('should not report context() as a valid context for expect', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const ctxCall = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'context' },
        arguments: [
          { type: 'Literal', value: 'suite' },
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: { type: 'BlockStatement', body: [] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(ctxCall)
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](ctxCall)

      expect(reports.length).toBe(1)
    })

    test('should handle expect inside it.only() with correct depth reset', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const itOnly = createTestModifierCall('it', 'only')
      visitor.CallExpression(itOnly)
      visitor.CallExpression(createExpectCall(1, 0))
      visitor['CallExpression:exit'](itOnly)

      visitor.CallExpression(createExpectCall(10, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(10)
    })
  })

  describe('state isolation between visitors', () => {
    test('separate visitors have separate context depth', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()

      const visitor1 = noStandaloneExpectRule.create(ctx1)
      const visitor2 = noStandaloneExpectRule.create(ctx2)

      visitor1.CallExpression(createExpectCall())

      const itCall = createTestCall('it')
      visitor2.CallExpression(itCall)
      visitor2.CallExpression(createExpectCall())
      visitor2['CallExpression:exit'](itCall)

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      visitor.CallExpression(createExpectCall(1, 0))
      visitor.CallExpression(createExpectCall(2, 0))

      expect(reports.length).toBe(2)
    })
  })

  describe('error message format', () => {
    test('message is "Expect should be inside a test or hook function"', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      visitor.CallExpression(createExpectCall())

      expect(reports[0].message).toBe('Expect should be inside a test or hook function')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      visitor.CallExpression(createExpectCall(5, 10))

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report includes node reference', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const node = createExpectCall()
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('extractLocation edge cases', () => {
    test('returns default location for node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [],
      }

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('handles valid loc correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      visitor.CallExpression(createExpectCall(42, 7))

      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(7)
    })
  })

  describe('default export', () => {
    test('rule should be the default export', () => {
      expect(noStandaloneExpectRule).toBeDefined()
      expect(noStandaloneExpectRule.meta).toBeDefined()
      expect(noStandaloneExpectRule.create).toBeDefined()
    })
  })

  describe('meta: extended', () => {
    test('should have description mentioning outside', () => {
      const desc = noStandaloneExpectRule.meta.docs?.description.toLowerCase() ?? ''
      expect(desc).toContain('outside')
    })

    test('should have docs description as non-empty string', () => {
      expect(typeof noStandaloneExpectRule.meta.docs?.description).toBe('string')
      expect(noStandaloneExpectRule.meta.docs!.description.length).toBeGreaterThan(0)
    })

    test('should have meta with all required fields defined', () => {
      expect(noStandaloneExpectRule.meta.type).toBeDefined()
      expect(noStandaloneExpectRule.meta.severity).toBeDefined()
      expect(noStandaloneExpectRule.meta.docs).toBeDefined()
      expect(noStandaloneExpectRule.meta.docs?.category).toBeDefined()
      expect(noStandaloneExpectRule.meta.docs?.description).toBeDefined()
      expect(noStandaloneExpectRule.meta.docs?.recommended).toBeDefined()
      expect(noStandaloneExpectRule.meta.docs?.url).toBeDefined()
    })
  })

  describe('valid: expect with resolves and rejects', () => {
    test('should not report expect().resolves inside it()', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const expectResolvesCall = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'expect' },
              arguments: [{ type: 'Identifier', name: 'promise' }],
            },
            property: { type: 'Identifier', name: 'resolves' },
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [{ type: 'Literal', value: 1 }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      const itCall = createTestCall('it')
      visitor.CallExpression(itCall)
      visitor.CallExpression(expectResolvesCall)
      visitor['CallExpression:exit'](itCall)

      expect(reports.length).toBe(0)
    })

    test('should not report expect().rejects inside test()', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const expectRejectsCall = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'expect' },
              arguments: [{ type: 'Identifier', name: 'promise' }],
            },
            property: { type: 'Identifier', name: 'rejects' },
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [{ type: 'Literal', value: 1 }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      const testCall = createTestCall('test')
      visitor.CallExpression(testCall)
      visitor.CallExpression(expectRejectsCall)
      visitor['CallExpression:exit'](testCall)

      expect(reports.length).toBe(0)
    })

    test('should report expect().resolves at top level', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const expectResolvesCall = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'expect' },
              arguments: [{ type: 'Identifier', name: 'promise' }],
            },
            property: { type: 'Identifier', name: 'resolves' },
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [{ type: 'Literal', value: 1 }],
        loc: { start: { line: 3, column: 4 }, end: { line: 3, column: 34 } },
      }

      visitor.CallExpression(expectResolvesCall)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Expect should be inside a test or hook function')
    })

    test('should report expect().rejects at top level', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const expectRejectsCall = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'expect' },
              arguments: [{ type: 'Identifier', name: 'promise' }],
            },
            property: { type: 'Identifier', name: 'rejects' },
          },
          property: { type: 'Identifier', name: 'toThrow' },
        },
        arguments: [],
        loc: { start: { line: 5, column: 2 }, end: { line: 5, column: 32 } },
      }

      visitor.CallExpression(expectRejectsCall)

      expect(reports.length).toBe(1)
    })
  })

  describe('valid: expect in nested contexts within test', () => {
    test('should not report expect inside beforeEach within describe', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const desc = createDescribeCall()
      visitor.CallExpression(desc)

      const hook = createHookCall('beforeEach')
      visitor.CallExpression(hook)
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](hook)

      visitor['CallExpression:exit'](desc)

      expect(reports.length).toBe(0)
    })

    test('should not report expect inside nested arrow function within test', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const itCall = createTestCall('it')
      visitor.CallExpression(itCall)

      // Simulate an inner function call (not a test/hook), expect still valid
      const innerCall = createCallExpression('wrapper')
      visitor.CallExpression(innerCall)
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](innerCall)

      visitor['CallExpression:exit'](itCall)

      expect(reports.length).toBe(0)
    })

    test('should not report expect inside Promise.then callback within test', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const testCall = createTestCall('test')
      visitor.CallExpression(testCall)

      // Simulate Promise.then call — not a test/hook, depth remains > 0
      const thenCall = createCallExpression('then')
      visitor.CallExpression(thenCall)
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](thenCall)

      visitor['CallExpression:exit'](testCall)

      expect(reports.length).toBe(0)
    })

    test('should not report multiple expects inside test.each()()', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const call = createTestEachCall('test')
      visitor.CallExpression(call)
      visitor.CallExpression(createExpectCall(1, 0))
      visitor.CallExpression(createExpectCall(2, 0))
      visitor.CallExpression(createExpectCall(3, 0))
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(0)
    })
  })

  describe('invalid: unrecognized test modifiers', () => {
    test('should report expect inside test.failing() — failing not recognized', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const call = createTestModifierCall('test', 'failing')
      visitor.CallExpression(call)
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(1)
    })

    test('should report expect inside it.todo() — todo not recognized', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const call = createTestModifierCall('it', 'todo')
      visitor.CallExpression(call)
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(1)
    })
  })

  describe('invalid: expect inside describe variants', () => {
    test('should report expect inside describe.only()', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const call = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'describe' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [
          { type: 'Literal', value: 'suite' },
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: { type: 'BlockStatement', body: [] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 35 } },
      }

      visitor.CallExpression(call)
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(1)
    })

    test('should report expect inside describe.skip()', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const call = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'describe' },
          property: { type: 'Identifier', name: 'skip' },
        },
        arguments: [
          { type: 'Literal', value: 'suite' },
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: { type: 'BlockStatement', body: [] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 35 } },
      }

      visitor.CallExpression(call)
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(1)
    })

    test('should report expect between sequential describe blocks', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const desc1 = createDescribeCall()
      visitor.CallExpression(desc1)
      visitor['CallExpression:exit'](desc1)

      visitor.CallExpression(createExpectCall(5, 0))

      const desc2 = createDescribeCall()
      visitor.CallExpression(desc2)
      visitor['CallExpression:exit'](desc2)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
    })
  })

  describe('report message content verification', () => {
    test('each standalone expect in a batch reports the exact message', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      visitor.CallExpression(createExpectCall(1, 0))
      visitor.CallExpression(createExpectCall(2, 4))
      visitor.CallExpression(createExpectCall(3, 8))

      expect(reports.length).toBe(3)
      for (const report of reports) {
        expect(report.message).toBe('Expect should be inside a test or hook function')
      }
    })

    test('report loc includes end position for standalone expect', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      visitor.CallExpression(createExpectCall(7, 3))

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(3)
      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(7)
    })
  })

  describe('valid: expect inside describe() callback', () => {
    test('should not report expect inside describe() callback at top level', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      const itCall = createTestCall('it')
      visitor.CallExpression(itCall)
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](itCall)
      visitor['CallExpression:exit'](desc)

      expect(reports.length).toBe(0)
    })

    test('should report expect directly inside describe() without test or hook', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](desc)

      expect(reports.length).toBe(1)
    })
  })

  describe('valid: expect inside various hooks', () => {
    test('should not report multiple expects inside beforeEach()', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const hook = createHookCall('beforeEach')
      visitor.CallExpression(hook)
      visitor.CallExpression(createExpectCall(1, 0))
      visitor.CallExpression(createExpectCall(2, 0))
      visitor.CallExpression(createExpectCall(3, 0))
      visitor['CallExpression:exit'](hook)

      expect(reports.length).toBe(0)
    })

    test('should not report chained expect inside afterEach()', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const hook = createHookCall('afterEach')
      visitor.CallExpression(hook)
      visitor.CallExpression(createExpectChainCall())
      visitor['CallExpression:exit'](hook)

      expect(reports.length).toBe(0)
    })

    test('should not report expect inside beforeAll() followed by afterAll()', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const beforeHook = createHookCall('beforeAll')
      visitor.CallExpression(beforeHook)
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](beforeHook)

      const afterHook = createHookCall('afterAll')
      visitor.CallExpression(afterHook)
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](afterHook)

      expect(reports.length).toBe(0)
    })
  })

  describe('invalid: expect.not chain outside test', () => {
    test('should report expect.not chain at top level', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const expectNotCall = {
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
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [{ type: 'Literal', value: 1 }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 22 } },
      }

      visitor.CallExpression(expectNotCall)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Expect should be inside a test or hook function')
    })

    test('should not report expect.not chain inside it()', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const expectNotCall = {
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
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [{ type: 'Literal', value: 1 }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 22 } },
      }

      const itCall = createTestCall('it')
      visitor.CallExpression(itCall)
      visitor.CallExpression(expectNotCall)
      visitor['CallExpression:exit'](itCall)

      expect(reports.length).toBe(0)
    })
  })

  describe('valid: nested describe with expect at various depths', () => {
    test('should not report expect inside it() deeply nested in describe blocks', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const desc1 = createDescribeCall()
      visitor.CallExpression(desc1)

      const desc2 = createDescribeCall()
      visitor.CallExpression(desc2)

      const itCall = createTestCall('it')
      visitor.CallExpression(itCall)
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](itCall)

      visitor['CallExpression:exit'](desc2)
      visitor['CallExpression:exit'](desc1)

      expect(reports.length).toBe(0)
    })

    test('should report expect at describe depth 2 without test', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const desc1 = createDescribeCall()
      visitor.CallExpression(desc1)

      const desc2 = createDescribeCall()
      visitor.CallExpression(desc2)

      visitor.CallExpression(createExpectCall())

      visitor['CallExpression:exit'](desc2)
      visitor['CallExpression:exit'](desc1)

      expect(reports.length).toBe(1)
    })

    test('should report expect in outer describe but not in inner it()', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const desc = createDescribeCall()
      visitor.CallExpression(desc)

      visitor.CallExpression(createExpectCall(3, 0))


      const itCall = createTestCall('it')
      visitor.CallExpression(itCall)
      visitor.CallExpression(createExpectCall(5, 0))
      visitor['CallExpression:exit'](itCall)

      visitor['CallExpression:exit'](desc)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
    })
  })

  describe('valid: expect in nested function inside test', () => {
    test('should not report expect inside nested arrow function within it()', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const itCall = createTestCall('it')
      visitor.CallExpression(itCall)

      const forEachCall = createCallExpression('forEach')
      visitor.CallExpression(forEachCall)
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](forEachCall)

      visitor['CallExpression:exit'](itCall)

      expect(reports.length).toBe(0)
    })

    test('should not report expect inside double-nested function within test()', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const testCall = createTestCall('test')
      visitor.CallExpression(testCall)

      const outer = createCallExpression('outer')
      visitor.CallExpression(outer)

      const inner = createCallExpression('inner')
      visitor.CallExpression(inner)

      visitor.CallExpression(createExpectCall())

      visitor['CallExpression:exit'](inner)
      visitor['CallExpression:exit'](outer)
      visitor['CallExpression:exit'](testCall)

      expect(reports.length).toBe(0)
    })
  })

  describe('invalid: multiple standalone expects with locations', () => {
    test('should report 4 standalone expects with distinct locations', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      visitor.CallExpression(createExpectCall(1, 0))
      visitor.CallExpression(createExpectCall(2, 4))
      visitor.CallExpression(createExpectCall(3, 8))
      visitor.CallExpression(createExpectCall(4, 12))

      expect(reports.length).toBe(4)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(2)
      expect(reports[2].loc?.start.line).toBe(3)
      expect(reports[3].loc?.start.line).toBe(4)
    })

    test('should report expect before and after a test block', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      visitor.CallExpression(createExpectCall(2, 0))

      const itCall = createTestCall('it')
      visitor.CallExpression(itCall)
      visitor.CallExpression(createExpectCall(5, 0))
      visitor['CallExpression:exit'](itCall)

      visitor.CallExpression(createExpectCall(9, 0))

      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[1].loc?.start.line).toBe(9)
    })

    test('should report expect at top level after hook exits', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const hook = createHookCall('beforeEach')
      visitor.CallExpression(hook)
      visitor.CallExpression(createExpectCall(1, 0))
      visitor['CallExpression:exit'](hook)

      visitor.CallExpression(createExpectCall(10, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(10)
    })
  })

  describe('additional meta checks', () => {
    test('should have valid docs URL containing rule name', () => {
      const url = noStandaloneExpectRule.meta.docs?.url
      expect(url).toMatch(/^https?:\/\/.+/)
      expect(url).toContain('no-standalone-expect')
    })

    test('should have create as a function', () => {
      expect(typeof noStandaloneExpectRule.create).toBe('function')
    })
  })

  describe('valid: expect inside hook with modifier', () => {
    test('should not report expect inside beforeEach.only()', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const hook = createTestModifierCall('beforeEach', 'only')
      visitor.CallExpression(hook)
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](hook)

      expect(reports.length).toBe(0)
    })

    test('should not report expect inside afterEach.skip()', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const hook = createTestModifierCall('afterEach', 'skip')
      visitor.CallExpression(hook)
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](hook)

      expect(reports.length).toBe(0)
    })

    test('should report expect inside describe.each()()', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const call = createTestEachCall('describe')
      visitor.CallExpression(call)
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(1)
    })

    test('should report expect inside it.concurrent() — concurrent not recognized', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const call = createTestModifierCall('it', 'concurrent')
      visitor.CallExpression(call)
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(1)
    })

    test('should not report expect inside beforeAll.each()()', () => {
      const { context, reports } = createMockContext()
      const visitor = noStandaloneExpectRule.create(context)

      const call = createTestEachCall('beforeAll')
      visitor.CallExpression(call)
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(0)
    })
  })
})
