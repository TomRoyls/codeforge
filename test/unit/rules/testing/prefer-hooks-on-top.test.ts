import { describe, test, expect, vi } from 'vitest'
import { preferHooksOnTopRule } from '../../../../src/rules/testing/prefer-hooks-on-top.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.test.ts',
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []
  const context: RuleContext = {
    report: (descriptor) => { reports.push({ message: descriptor.message, loc: descriptor.loc }) },
    getFilePath: () => filePath,
    getAST: () => null,
    getSource: () => '',
    getTokens: () => [],
    getComments: () => [],
    config: { options: [options] },
    logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
    workspaceRoot: '/src',
  } as unknown as RuleContext
  return { context, reports }
}

function createDescribeCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'describe' },
    arguments: [
      { type: 'Literal', value: 'suite' },
      { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] } },
    ],
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
}

function createHookCall(hookName: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: hookName },
    arguments: [
      { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] } },
    ],
    loc: { start: { line, column }, end: { line, column: column + 20 } },
  }
}

function createTestCase(callName: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: callName },
    arguments: [
      { type: 'Literal', value: 'test name' },
      { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] } },
    ],
    loc: { start: { line, column }, end: { line, column: column + 20 } },
  }
}

function createMemberTestCase(objectName: string, method: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: objectName },
      property: { type: 'Identifier', name: method },
    },
    arguments: [
      { type: 'Literal', value: 'test name' },
      { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] } },
    ],
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
}

function createMemberDescribeCall(objectName: string, method: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: objectName },
      property: { type: 'Identifier', name: method },
    },
    arguments: [
      { type: 'Literal', value: 'suite' },
      { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] } },
    ],
    loc: { start: { line, column }, end: { line, column: column + 35 } },
  }
}

describe('prefer-hooks-on-top rule', () => {
  describe('meta', () => {
    test('should have correct rule type', () => {
      expect(preferHooksOnTopRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferHooksOnTopRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(preferHooksOnTopRule.meta.docs?.recommended).toBe(false)
    })

    test('should have correct category', () => {
      expect(preferHooksOnTopRule.meta.docs?.category).toBe('testing')
    })

    test('should have schema defined', () => {
      expect(preferHooksOnTopRule.meta.schema).toBeDefined()
    })

    test('should have correct description mentioning hooks', () => {
      const desc = preferHooksOnTopRule.meta.docs?.description.toLowerCase() ?? ''
      expect(desc).toContain('hook')
    })

    test('should have a docs.url property containing github', () => {
      expect(preferHooksOnTopRule.meta.docs?.url).toBeDefined()
      expect(preferHooksOnTopRule.meta.docs?.url).toContain('github.com')
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return visitor object with CallExpression:exit method', () => {
      const { context } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      expect(visitor).toHaveProperty('CallExpression:exit')
      expect(typeof visitor['CallExpression:exit']).toBe('function')
    })
  })

  describe('valid: hooks before tests', () => {
    test('should not report beforeEach before it', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createHookCall('beforeEach'))
      visitor.CallExpression(createTestCase('it'))

      expect(reports.length).toBe(0)
    })

    test('should not report afterEach before test', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createHookCall('afterEach'))
      visitor.CallExpression(createTestCase('test'))

      expect(reports.length).toBe(0)
    })

    test('should not report beforeAll before it', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createHookCall('beforeAll'))
      visitor.CallExpression(createTestCase('it'))

      expect(reports.length).toBe(0)
    })

    test('should not report afterAll before test', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createHookCall('afterAll'))
      visitor.CallExpression(createTestCase('test'))

      expect(reports.length).toBe(0)
    })

    test('should not report multiple hooks before tests', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createHookCall('beforeAll'))
      visitor.CallExpression(createHookCall('beforeEach'))
      visitor.CallExpression(createHookCall('afterEach'))
      visitor.CallExpression(createHookCall('afterAll'))
      visitor.CallExpression(createTestCase('it'))

      expect(reports.length).toBe(0)
    })

    test('should not report hooks when no test cases exist', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createHookCall('beforeEach'))
      visitor.CallExpression(createHookCall('afterEach'))

      expect(reports.length).toBe(0)
    })
  })

  describe('invalid: hooks after test cases', () => {
    test('should report beforeEach after it', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createTestCase('it'))
      visitor.CallExpression(createHookCall('beforeEach'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beforeEach')
    })

    test('should report afterEach after test', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createTestCase('test'))
      visitor.CallExpression(createHookCall('afterEach'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('afterEach')
    })

    test('should report beforeAll after it', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createTestCase('it'))
      visitor.CallExpression(createHookCall('beforeAll'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beforeAll')
    })

    test('should report afterAll after test', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createTestCase('test'))
      visitor.CallExpression(createHookCall('afterAll'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('afterAll')
    })

    test('should report hook with correct message format', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createTestCase('it'))
      visitor.CallExpression(createHookCall('beforeEach'))

      expect(reports[0].message).toBe(
        "Unexpected 'beforeEach' hook after test cases. Hooks should be placed before all test cases in a describe block.",
      )
    })
  })

  describe('multiple test cases then hook', () => {
    test('should report hook after multiple test cases', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createTestCase('it', 2))
      visitor.CallExpression(createTestCase('it', 3))
      visitor.CallExpression(createTestCase('test', 4))
      visitor.CallExpression(createHookCall('beforeEach', 5))

      expect(reports.length).toBe(1)
    })

    test('should report multiple hooks after test cases', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createTestCase('it'))
      visitor.CallExpression(createHookCall('beforeEach', 3))
      visitor.CallExpression(createHookCall('afterEach', 4))

      expect(reports.length).toBe(2)
    })
  })

  describe('hooks between test cases', () => {
    test('should report hook placed between test cases', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createTestCase('it', 2))
      visitor.CallExpression(createHookCall('beforeEach', 3))
      visitor.CallExpression(createTestCase('it', 4))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beforeEach')
    })

    test('should report multiple hooks between test cases', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createTestCase('it', 2))
      visitor.CallExpression(createHookCall('beforeEach', 3))
      visitor.CallExpression(createHookCall('afterEach', 4))
      visitor.CallExpression(createTestCase('test', 5))

      expect(reports.length).toBe(2)
    })
  })

  describe('nested describe scopes', () => {
    test('should track inner scope independently - hook before test in inner scope is valid', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createTestCase('it', 2))
      visitor.CallExpression(createDescribeCall(3))
      visitor.CallExpression(createHookCall('beforeEach', 4))

      expect(reports.length).toBe(0)
    })

    test('should flag hook after test in inner scope', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createDescribeCall(2))
      visitor.CallExpression(createTestCase('it', 3))
      visitor.CallExpression(createHookCall('afterEach', 4))

      expect(reports.length).toBe(1)
    })

    test('should pop scope on describe exit', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall(1)) // outer
      visitor.CallExpression(createDescribeCall(2)) // inner
      visitor.CallExpression(createTestCase('it', 3)) // inner test
      visitor['CallExpression:exit'](createDescribeCall(2)) // exit inner
      // Back in outer scope - outer has not seen any test case yet (inner tests don't count)
      visitor.CallExpression(createHookCall('beforeEach', 5)) // hook in outer scope before tests

      expect(reports.length).toBe(0)
    })
  })

  describe('describe.only/skip', () => {
    test('should treat describe.only as a describe scope', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createMemberDescribeCall('describe', 'only'))
      visitor.CallExpression(createTestCase('it', 2))
      visitor.CallExpression(createHookCall('beforeEach', 3))

      expect(reports.length).toBe(1)
    })

    test('should treat describe.skip as a describe scope', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createMemberDescribeCall('describe', 'skip'))
      visitor.CallExpression(createTestCase('test', 2))
      visitor.CallExpression(createHookCall('afterAll', 3))

      expect(reports.length).toBe(1)
    })
  })

  describe('context and suite aliases', () => {
    test('should treat context as a describe scope', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      const contextCall = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'context' },
        arguments: [
          { type: 'Literal', value: 'suite' },
          { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 28 } },
      }

      visitor.CallExpression(contextCall)
      visitor.CallExpression(createTestCase('it', 2))
      visitor.CallExpression(createHookCall('beforeEach', 3))

      expect(reports.length).toBe(1)
    })

    test('should treat suite as a describe scope', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      const suiteCall = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'suite' },
        arguments: [
          { type: 'Literal', value: 'suite' },
          { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }

      visitor.CallExpression(suiteCall)
      visitor.CallExpression(createTestCase('test', 2))
      visitor.CallExpression(createHookCall('beforeAll', 3))

      expect(reports.length).toBe(1)
    })
  })

  describe('it.only and test.skip as test cases', () => {
    test('should treat it.only as a test case', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createMemberTestCase('it', 'only', 2))
      visitor.CallExpression(createHookCall('beforeEach', 3))

      expect(reports.length).toBe(1)
    })

    test('should treat test.skip as a test case', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createMemberTestCase('test', 'skip', 2))
      visitor.CallExpression(createHookCall('afterEach', 3))

      expect(reports.length).toBe(1)
    })
  })

  describe('no describe scope', () => {
    test('should not report hooks outside any describe scope', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createTestCase('it'))
      visitor.CallExpression(createHookCall('beforeEach'))

      expect(reports.length).toBe(0)
    })

    test('should not report tests outside any describe scope', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createHookCall('beforeEach'))
      visitor.CallExpression(createTestCase('it'))

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle non-CallExpression types without reporting', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression({ type: 'Literal', value: 42 })

      expect(reports.length).toBe(0)
    })

    test('should handle unrelated function calls without reporting', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'console' },
        arguments: [{ type: 'Literal', value: 'log' }],
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 15 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle non-Identifier callee (MemberExpression with non-Identifier object)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'CallExpression' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [
          { type: 'Literal', value: 'test name' },
          { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] } },
        ],
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 30 } },
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('location reporting', () => {
    test('should report correct location for hook after test case', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createTestCase('it', 2, 0))
      visitor.CallExpression(createHookCall('beforeEach', 5, 4))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should report correct end location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createTestCase('it', 2))
      visitor.CallExpression(createHookCall('afterEach', 3, 10))

      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(30)
    })
  })

  describe('independent visitors', () => {
    test('should return independent visitors for different contexts', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = preferHooksOnTopRule.create(ctx1)
      const visitor2 = preferHooksOnTopRule.create(ctx2)

      visitor1.CallExpression(createDescribeCall())
      visitor1.CallExpression(createTestCase('it'))
      visitor1.CallExpression(createHookCall('beforeEach'))

      visitor2.CallExpression(createDescribeCall())
      visitor2.CallExpression(createHookCall('beforeEach'))
      visitor2.CallExpression(createTestCase('it'))

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })
  })

  describe('scope exit handling', () => {
    test('should properly exit describe.only scope', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createMemberDescribeCall('describe', 'only'))
      visitor.CallExpression(createTestCase('it', 2))
      visitor['CallExpression:exit'](createMemberDescribeCall('describe', 'only'))
      visitor.CallExpression(createHookCall('beforeEach'))

      expect(reports.length).toBe(0)
    })

    test('should properly handle multiple nested scope exits', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall(1))
      visitor.CallExpression(createDescribeCall(2))
      visitor.CallExpression(createDescribeCall(3))
      visitor['CallExpression:exit'](createDescribeCall(3))
      visitor['CallExpression:exit'](createDescribeCall(2))
      visitor.CallExpression(createHookCall('beforeEach'))

      expect(reports.length).toBe(0)
    })
  })

  describe('mixed hook and test ordering', () => {
    test('should report correctly when hooks are both before and after tests', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createHookCall('beforeAll', 2))
      visitor.CallExpression(createTestCase('it', 3))
      visitor.CallExpression(createHookCall('beforeEach', 4))
      visitor.CallExpression(createHookCall('afterEach', 5))
      visitor.CallExpression(createHookCall('afterAll', 6))

      expect(reports.length).toBe(3)
      expect(reports[0].message).toContain('beforeEach')
      expect(reports[1].message).toContain('afterEach')
      expect(reports[2].message).toContain('afterAll')
    })
  })

  describe('report message content', () => {
    test('should include hook name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createTestCase('it'))
      visitor.CallExpression(createHookCall('afterAll'))

      expect(reports[0].message).toContain("'afterAll'")
    })

    test('should include descriptive guidance in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createTestCase('it'))
      visitor.CallExpression(createHookCall('beforeEach'))

      expect(reports[0].message).toContain('Hooks should be placed before all test cases')
    })
  })

  describe('meta expanded', () => {
    test('should not have fixable field', () => {
      expect(preferHooksOnTopRule.meta.fixable).toBeUndefined()
    })

    test('should not have schema with properties', () => {
      const schema = preferHooksOnTopRule.meta.schema
      expect(schema).toBeDefined()
    })
  })

  describe('all four hook types after test', () => {
    test('should report all hook types when placed after test', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createTestCase('it'))
      visitor.CallExpression(createHookCall('beforeEach'))
      visitor.CallExpression(createHookCall('afterEach'))
      visitor.CallExpression(createHookCall('beforeAll'))
      visitor.CallExpression(createHookCall('afterAll'))

      expect(reports.length).toBe(4)
      expect(reports[0].message).toContain('beforeEach')
      expect(reports[1].message).toContain('afterEach')
      expect(reports[2].message).toContain('beforeAll')
      expect(reports[3].message).toContain('afterAll')
    })
  })

  describe('sequential describe blocks', () => {
    test('should track each describe independently', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createHookCall('beforeEach'))
      visitor.CallExpression(createTestCase('it'))
      visitor['CallExpression:exit'](createDescribeCall())

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createTestCase('it'))
      visitor.CallExpression(createHookCall('afterEach'))
      visitor['CallExpression:exit'](createDescribeCall())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('afterEach')
    })

    test('should not leak scope between sequential describes', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createTestCase('it'))
      visitor['CallExpression:exit'](createDescribeCall())

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createHookCall('beforeEach'))
      visitor.CallExpression(createTestCase('it'))
      visitor['CallExpression:exit'](createDescribeCall())

      expect(reports.length).toBe(0)
    })
  })

  describe('test.each as test case', () => {
    test('should treat test.each as a test case', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      const testEachCall = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'test' },
          property: { type: 'Identifier', name: 'each' },
        },
        arguments: [{ type: 'ArrayExpression', elements: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(testEachCall)
      visitor.CallExpression(createHookCall('beforeEach'))

      expect(reports.length).toBe(1)
    })
  })

  describe('deeply nested describes', () => {
    test('should report hook after test in innermost nested scope', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createHookCall('beforeEach'))
      visitor.CallExpression(createTestCase('it'))
      visitor.CallExpression(createHookCall('afterEach'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('afterEach')
    })
  })

  describe('meta: docs examples', () => {
    test('should have docs.recommended as false', () => {
      expect(preferHooksOnTopRule.meta.docs?.recommended).toBe(false)
    })

    test('should have docs.url pointing to rule documentation', () => {
      const url = preferHooksOnTopRule.meta.docs?.url ?? ''
      expect(url).toContain('prefer-hooks-on-top')
    })
  })

  describe('beforeAll after test — reports', () => {
    test('should report beforeAll after test()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createTestCase('test'))
      visitor.CallExpression(createHookCall('beforeAll'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beforeAll')
    })
  })

  describe('beforeAll after it() — reports', () => {
    test('should report beforeAll after it()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createTestCase('it'))
      visitor.CallExpression(createHookCall('beforeAll'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beforeAll')
    })
  })

  describe('afterAll before test — no violation', () => {
    test('should not report afterAll when placed before test', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createHookCall('afterAll'))
      visitor.CallExpression(createTestCase('test'))

      expect(reports.length).toBe(0)
    })
  })

  describe('multiple hooks after first test — reports each', () => {
    test('should report all hooks placed after the first test', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createTestCase('it', 2))
      visitor.CallExpression(createHookCall('beforeEach', 3))
      visitor.CallExpression(createHookCall('afterEach', 4))
      visitor.CallExpression(createHookCall('beforeAll', 5))

      expect(reports.length).toBe(3)
      expect(reports[0].message).toContain('beforeEach')
      expect(reports[1].message).toContain('afterEach')
      expect(reports[2].message).toContain('beforeAll')
    })
  })

  describe('hook inside nested describe after test in outer', () => {
    test('should not report hook in nested describe after test in outer scope', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall(1))
      visitor.CallExpression(createTestCase('it', 2))
      visitor.CallExpression(createDescribeCall(3))
      visitor.CallExpression(createHookCall('beforeEach', 4))

      expect(reports.length).toBe(0)
    })
  })

  describe('hook before all tests in nested describe — no violation', () => {
    test('should not report hook placed before tests in nested describe', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall(1))
      visitor.CallExpression(createDescribeCall(2))
      visitor.CallExpression(createHookCall('beforeEach', 3))
      visitor.CallExpression(createTestCase('it', 4))

      expect(reports.length).toBe(0)
    })
  })

  describe('test.each() followed by beforeEach — reports', () => {
    test('should report beforeEach after test.each()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      const testEachCall = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'test' },
          property: { type: 'Identifier', name: 'each' },
        },
        arguments: [{ type: 'ArrayExpression', elements: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(testEachCall)
      visitor.CallExpression(createHookCall('beforeEach'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beforeEach')
    })
  })

  describe('it.each() followed by beforeAll — reports', () => {
    test('should report beforeAll after it.each()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      const itEachCall = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'it' },
          property: { type: 'Identifier', name: 'each' },
        },
        arguments: [{ type: 'ArrayExpression', elements: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(itEachCall)
      visitor.CallExpression(createHookCall('beforeAll'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beforeAll')
    })
  })

  describe('hook after test.skip() — reports', () => {
    test('should report beforeEach after test.skip()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createMemberTestCase('test', 'skip', 2))
      visitor.CallExpression(createHookCall('beforeEach', 3))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beforeEach')
    })
  })

  describe('hook after test.only() — reports', () => {
    test('should report afterEach after test.only()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createMemberTestCase('test', 'only', 2))
      visitor.CallExpression(createHookCall('afterEach', 3))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('afterEach')
    })
  })

  describe('multiple describe blocks with hooks after tests — reports in each', () => {
    test('should report violations in each sequential describe independently', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall(1))
      visitor.CallExpression(createTestCase('it', 2))
      visitor.CallExpression(createHookCall('beforeEach', 3))
      visitor['CallExpression:exit'](createDescribeCall(1))

      visitor.CallExpression(createDescribeCall(5))
      visitor.CallExpression(createTestCase('test', 6))
      visitor.CallExpression(createHookCall('afterAll', 7))
      visitor['CallExpression:exit'](createDescribeCall(5))

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('beforeEach')
      expect(reports[1].message).toContain('afterAll')
    })
  })

  describe('report message exact text', () => {
    test('should produce exact message for afterEach', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createTestCase('test'))
      visitor.CallExpression(createHookCall('afterEach'))

      expect(reports[0].message).toBe(
        "Unexpected 'afterEach' hook after test cases. Hooks should be placed before all test cases in a describe block.",
      )
    })

    test('should produce exact message for beforeAll', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createTestCase('it'))
      visitor.CallExpression(createHookCall('beforeAll'))

      expect(reports[0].message).toBe(
        "Unexpected 'beforeAll' hook after test cases. Hooks should be placed before all test cases in a describe block.",
      )
    })
  })

  describe('edge case: only hooks, no tests — no violation', () => {
    test('should not report when describe has only hooks and no tests', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createHookCall('beforeAll'))
      visitor.CallExpression(createHookCall('beforeEach'))
      visitor.CallExpression(createHookCall('afterEach'))
      visitor.CallExpression(createHookCall('afterAll'))

      expect(reports.length).toBe(0)
    })
  })

  describe('edge case: empty describe — no violation', () => {
    test('should not report for an empty describe block', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor['CallExpression:exit'](createDescribeCall())

      expect(reports.length).toBe(0)
    })
  })

  describe('hook after it.skip — reports', () => {
    test('should report afterAll after it.skip()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createMemberTestCase('it', 'skip', 2))
      visitor.CallExpression(createHookCall('afterAll', 3))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('afterAll')
    })
  })

  describe('only tests, no hooks — no violation', () => {
    test('should not report when describe has only tests and no hooks', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createTestCase('it', 2))
      visitor.CallExpression(createTestCase('test', 3))
      visitor.CallExpression(createTestCase('it', 4))

      expect(reports.length).toBe(0)
    })
  })

  describe('hook after a single test — reports', () => {
    test('should report beforeEach after exactly one test', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createTestCase('it', 2))
      visitor.CallExpression(createHookCall('beforeEach', 3))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beforeEach')
    })
  })

  describe('hook between two tests — reports', () => {
    test('should report hook placed between first and second test', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createTestCase('it', 2))
      visitor.CallExpression(createHookCall('beforeEach', 3))
      visitor.CallExpression(createTestCase('it', 4))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beforeEach')
    })
  })

  describe('beforeEach after tests — specific type check', () => {
    test('should report beforeEach specifically after it', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createTestCase('it', 2))
      visitor.CallExpression(createHookCall('beforeEach', 3))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe(
        "Unexpected 'beforeEach' hook after test cases. Hooks should be placed before all test cases in a describe block.",
      )
    })
  })

  describe('afterEach after tests — specific type check', () => {
    test('should report afterEach specifically after test', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createTestCase('test', 2))
      visitor.CallExpression(createHookCall('afterEach', 3))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe(
        "Unexpected 'afterEach' hook after test cases. Hooks should be placed before all test cases in a describe block.",
      )
    })
  })

  describe('afterAll after tests — specific type check', () => {
    test('should report afterAll specifically after it', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createTestCase('it', 2))
      visitor.CallExpression(createHookCall('afterAll', 3))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe(
        "Unexpected 'afterAll' hook after test cases. Hooks should be placed before all test cases in a describe block.",
      )
    })
  })

  describe('multiple violations in one scope', () => {
    test('should report each hook after tests in a single scope', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createTestCase('it', 2))
      visitor.CallExpression(createHookCall('beforeEach', 3))
      visitor.CallExpression(createHookCall('beforeAll', 4))
      visitor.CallExpression(createHookCall('afterEach', 5))
      visitor.CallExpression(createHookCall('afterAll', 6))

      expect(reports.length).toBe(4)
    })
  })

  describe('hook in nested describe after test in same inner scope', () => {
    test('should report hook after test within the same nested describe', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall(1))
      visitor.CallExpression(createDescribeCall(2))
      visitor.CallExpression(createTestCase('it', 3))
      visitor.CallExpression(createHookCall('beforeEach', 4))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beforeEach')
    })
  })

  describe('outer scope hook after inner describe exits — no violation', () => {
    test('should not report hook in outer scope after inner describe completes', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall(1))
      visitor.CallExpression(createDescribeCall(2))
      visitor.CallExpression(createTestCase('it', 3))
      visitor['CallExpression:exit'](createDescribeCall(2))
      visitor.CallExpression(createHookCall('beforeEach', 5))

      expect(reports.length).toBe(0)
    })
  })

  describe('hook after test in outer scope stays flagged', () => {
    test('should report hook after test when inner describe has exited', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall(1))
      visitor.CallExpression(createTestCase('it', 2))
      visitor.CallExpression(createDescribeCall(3))
      visitor['CallExpression:exit'](createDescribeCall(3))
      visitor.CallExpression(createHookCall('afterEach', 5))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('afterEach')
    })
  })

  describe('all four hooks before tests — correct order', () => {
    test('should not report when all hooks are in correct order before tests', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createHookCall('beforeAll', 2))
      visitor.CallExpression(createHookCall('beforeEach', 3))
      visitor.CallExpression(createHookCall('afterEach', 4))
      visitor.CallExpression(createHookCall('afterAll', 5))
      visitor.CallExpression(createTestCase('it', 6))
      visitor.CallExpression(createTestCase('test', 7))

      expect(reports.length).toBe(0)
    })
  })

  describe('it.only followed by hook — reports', () => {
    test('should report beforeEach after it.only', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createMemberTestCase('it', 'only', 2))
      visitor.CallExpression(createHookCall('beforeEach', 3))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beforeEach')
    })
  })

  describe('hook after unrelated calls — still reports', () => {
    test('should report hook after test even with unrelated calls in between', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createTestCase('it', 2))
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'someHelper' },
        arguments: [],
        loc: { start: { line: 3, column: 0 }, end: { line: 3, column: 10 } },
      })
      visitor.CallExpression(createHookCall('beforeEach', 4))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beforeEach')
    })
  })

  describe('nested context alias as describe', () => {
    test('should treat context.only as a describe scope', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      const contextOnlyCall = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'context' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [
          { type: 'Literal', value: 'suite' },
          { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 35 } },
      }

      visitor.CallExpression(contextOnlyCall)
      visitor.CallExpression(createTestCase('it', 2))
      visitor.CallExpression(createHookCall('beforeEach', 3))

      expect(reports.length).toBe(1)
    })
  })

  describe('multiple sequential scopes with mixed violations', () => {
    test('should correctly track three sequential describe blocks', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall(1))
      visitor.CallExpression(createHookCall('beforeEach', 2))
      visitor.CallExpression(createTestCase('it', 3))
      visitor['CallExpression:exit'](createDescribeCall(1))

      visitor.CallExpression(createDescribeCall(5))
      visitor.CallExpression(createTestCase('test', 6))
      visitor.CallExpression(createHookCall('afterAll', 7))
      visitor['CallExpression:exit'](createDescribeCall(5))

      visitor.CallExpression(createDescribeCall(9))
      visitor.CallExpression(createHookCall('beforeAll', 10))
      visitor.CallExpression(createTestCase('it', 11))
      visitor['CallExpression:exit'](createDescribeCall(9))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('afterAll')
    })
  })

  describe('additional meta checks', () => {
    test('should have valid docs URL containing rule name', () => {
      const url = preferHooksOnTopRule.meta.docs?.url
      expect(url).toMatch(/^https?:\/\/.+/)
      expect(url).toContain('prefer-hooks-on-top')
    })

    test('should have create as a function', () => {
      expect(typeof preferHooksOnTopRule.create).toBe('function')
    })
  })

  describe('hook via MemberExpression callee after test', () => {
    test('should report beforeEach.only() after it via MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createTestCase('it', 2))
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'beforeEach' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [
          { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] } },
        ],
        loc: { start: { line: 3, column: 0 }, end: { line: 3, column: 25 } },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beforeEach')
    })
  })

  describe('fit not recognized as test case', () => {
    test('should not treat fit as test case — hook after fit should not report', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fit' },
        arguments: [
          { type: 'Literal', value: 'focused test' },
          { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] } },
        ],
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 25 } },
      })
      visitor.CallExpression(createHookCall('beforeEach', 3))

      expect(reports.length).toBe(0)
    })
  })

  describe('non-describe CallExpression exit does not pop scope', () => {
    test('should not pop scope when exiting a non-describe CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createTestCase('it', 2))
      visitor['CallExpression:exit'](createHookCall('beforeEach'))
      visitor.CallExpression(createHookCall('afterEach', 3))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('afterEach')
    })
  })

  describe('hook after multiple test types in same scope', () => {
    test('should report hook after it, test, and it.only in same describe', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createTestCase('it', 2))
      visitor.CallExpression(createTestCase('test', 3))
      visitor.CallExpression(createMemberTestCase('it', 'only', 4))
      visitor.CallExpression(createHookCall('beforeAll', 5))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beforeAll')
    })
  })

  describe('CallExpression with FunctionExpression callee', () => {
    test('should handle CallExpression with FunctionExpression callee without error', () => {
      const { context, reports } = createMockContext()
      const visitor = preferHooksOnTopRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'FunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } },
        arguments: [],
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })
  })
})
