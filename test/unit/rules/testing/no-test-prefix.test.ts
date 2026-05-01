import { describe, test, expect, vi } from 'vitest'
import { noTestPrefixRule } from '../../../../src/rules/testing/no-test-prefix.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.test.ts',
  source = 'it("works", () => {});',
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

function createItCall(
  args: unknown[] = [],
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'it',
    },
    arguments: args,
    loc: { start: { line, column }, end: { line, column: column + 12 } },
  }
}

function createTestCall(
  args: unknown[] = [],
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'test',
    },
    arguments: args,
    loc: { start: { line, column }, end: { line, column: column + 14 } },
  }
}

function createMemberCall(
  objectName: string,
  methodName: string,
  args: unknown[] = [],
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: objectName },
      property: { type: 'Identifier', name: methodName },
    },
    arguments: args,
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
}

const stringArg = { type: 'Literal', value: 'test name' }
const fnArg = { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] }, params: [] }
const numberArg = { type: 'Literal', value: 1000 }
const objectArg = { type: 'ObjectExpression', properties: [] }

describe('no-test-prefix rule', () => {
  // ============================================================
  // 1. Meta tests (8)
  // ============================================================
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noTestPrefixRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noTestPrefixRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(noTestPrefixRule.meta.docs?.recommended).toBe(false)
    })

    test('should have testing category', () => {
      expect(noTestPrefixRule.meta.docs?.category).toBe('testing')
    })

    test('should have correct description mentioning test function naming', () => {
      expect(noTestPrefixRule.meta.docs?.description).toContain('test function naming')
    })

    test('should have correct description mentioning it vs test', () => {
      expect(noTestPrefixRule.meta.docs?.description).toContain('it vs test')
    })

    test('should not have fixable property', () => {
      expect(noTestPrefixRule.meta.fixable).toBeUndefined()
    })

    test('should have schema defined', () => {
      expect(noTestPrefixRule.meta.schema).toBeDefined()
      expect(Array.isArray(noTestPrefixRule.meta.schema)).toBe(true)
    })
  })

  // ============================================================
  // 2. Create tests (2)
  // ============================================================
  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = noTestPrefixRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noTestPrefixRule.create(context)
      const visitor2 = noTestPrefixRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })
  })

  // ============================================================
  // 3. Default behavior (reports test, allows it) — 16 tests
  // ============================================================
  describe('default behavior — reports test(), allows it()', () => {
    test('should report test() call by default', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createTestCall([stringArg, fnArg]))

      expect(reports.length).toBe(1)
    })

    test('should allow it() call by default', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createItCall([stringArg, fnArg]))

      expect(reports.length).toBe(0)
    })

    test('should report test() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createTestCall([]))

      expect(reports.length).toBe(1)
    })

    test('should report test() with string argument only', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createTestCall([stringArg]))

      expect(reports.length).toBe(1)
    })

    test('should report test() with function argument only', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createTestCall([fnArg]))

      expect(reports.length).toBe(1)
    })

    test('should report test() with multiple arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createTestCall([stringArg, numberArg, fnArg]))

      expect(reports.length).toBe(1)
    })

    test('should report test() with object arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createTestCall([objectArg]))

      expect(reports.length).toBe(1)
    })

    test('should allow it() with no arguments by default', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createItCall([]))

      expect(reports.length).toBe(0)
    })

    test('should allow it() with multiple arguments by default', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createItCall([stringArg, fnArg, numberArg]))

      expect(reports.length).toBe(0)
    })

    test('should report with empty options object', () => {
      const { context, reports } = createMockContext({})
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createTestCall([stringArg, fnArg]))

      expect(reports.length).toBe(1)
    })

    test('should report with undefined options', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createTestCall([stringArg, fnArg]))

      expect(reports.length).toBe(1)
    })

    test('should report with testFunction: undefined', () => {
      const { context, reports } = createMockContext({ testFunction: undefined })
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createTestCall([stringArg, fnArg]))

      expect(reports.length).toBe(1)
    })

    test('should report test() at different line numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createTestCall([stringArg], 10, 4))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should report test() at line 1, column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createTestCall([stringArg], 1, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should allow it() at different locations', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createItCall([stringArg], 5, 10))

      expect(reports.length).toBe(0)
    })

    test('should report test() with testFunction set to invalid value', () => {
      const { context, reports } = createMockContext({ testFunction: 'invalid' })
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createTestCall([stringArg, fnArg]))

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // 4. Option testFunction='test' (reports it, allows test) — 11 tests
  // ============================================================
  describe('option testFunction="test" — reports it(), allows test()', () => {
    test('should report it() when testFunction is "test"', () => {
      const { context, reports } = createMockContext({ testFunction: 'test' })
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createItCall([stringArg, fnArg]))

      expect(reports.length).toBe(1)
    })

    test('should allow test() when testFunction is "test"', () => {
      const { context, reports } = createMockContext({ testFunction: 'test' })
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createTestCall([stringArg, fnArg]))

      expect(reports.length).toBe(0)
    })

    test('should report it() with no arguments when testFunction is "test"', () => {
      const { context, reports } = createMockContext({ testFunction: 'test' })
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createItCall([]))

      expect(reports.length).toBe(1)
    })

    test('should report it() with function argument only when testFunction is "test"', () => {
      const { context, reports } = createMockContext({ testFunction: 'test' })
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createItCall([fnArg]))

      expect(reports.length).toBe(1)
    })

    test('should report it() with multiple arguments when testFunction is "test"', () => {
      const { context, reports } = createMockContext({ testFunction: 'test' })
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createItCall([stringArg, fnArg, numberArg]))

      expect(reports.length).toBe(1)
    })

    test('should allow test() with no arguments when testFunction is "test"', () => {
      const { context, reports } = createMockContext({ testFunction: 'test' })
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createTestCall([]))

      expect(reports.length).toBe(0)
    })

    test('should allow test() with multiple arguments when testFunction is "test"', () => {
      const { context, reports } = createMockContext({ testFunction: 'test' })
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createTestCall([stringArg, fnArg, numberArg]))

      expect(reports.length).toBe(0)
    })

    test('should report it() at different line numbers when testFunction is "test"', () => {
      const { context, reports } = createMockContext({ testFunction: 'test' })
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createItCall([stringArg], 7, 2))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(2)
    })

    test('should report it() with object arguments when testFunction is "test"', () => {
      const { context, reports } = createMockContext({ testFunction: 'test' })
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createItCall([objectArg]))

      expect(reports.length).toBe(1)
    })

    test('should allow test() at different locations when testFunction is "test"', () => {
      const { context, reports } = createMockContext({ testFunction: 'test' })
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createTestCall([stringArg], 3, 8))

      expect(reports.length).toBe(0)
    })

    test('message should reference "test" as preferred when testFunction is "test"', () => {
      const { context, reports } = createMockContext({ testFunction: 'test' })
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createItCall([stringArg, fnArg]))

      expect(reports[0].message).toContain("'test()'")
      expect(reports[0].message).toContain("'it()'")
    })
  })

  // ============================================================
  // 5. Negative cases (member expressions, other functions) — 11 tests
  // ============================================================
  describe('negative cases — member expressions and other functions', () => {
    test('should not report test.skip() member call', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createMemberCall('test', 'skip', [stringArg, fnArg]))

      expect(reports.length).toBe(0)
    })

    test('should not report test.only() member call', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createMemberCall('test', 'only', [stringArg, fnArg]))

      expect(reports.length).toBe(0)
    })

    test('should not report it.skip() member call', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createMemberCall('it', 'skip', [stringArg, fnArg]))

      expect(reports.length).toBe(0)
    })

    test('should not report it.only() member call', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createMemberCall('it', 'only', [stringArg, fnArg]))

      expect(reports.length).toBe(0)
    })

    test('should not report describe() — unknown identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'describe' },
        arguments: [stringArg, fnArg],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report expect() — unknown identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [stringArg],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report myFunc() — unknown identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'myFunc' },
        arguments: [stringArg],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report console.log() member call', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createMemberCall('console', 'log', [stringArg]))

      expect(reports.length).toBe(0)
    })

    test('should not report something.it() member call', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createMemberCall('something', 'it', [stringArg, fnArg]))

      expect(reports.length).toBe(0)
    })

    test('should not report obj.test() member call', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createMemberCall('obj', 'test', [stringArg, fnArg]))

      expect(reports.length).toBe(0)
    })

    test('should not report runner.it() member call with testFunction="test"', () => {
      const { context, reports } = createMockContext({ testFunction: 'test' })
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createMemberCall('runner', 'it', [stringArg, fnArg]))

      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // 6. Edge cases (multiple calls, null node, etc.) — 12 tests
  // ============================================================
  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestPrefixRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestPrefixRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestPrefixRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression({ type: 'CallExpression', arguments: [] })

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestPrefixRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'test' },
        arguments: [stringArg],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestPrefixRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle callee with null type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: null, name: 'test' },
        arguments: [stringArg],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression callee on test', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'someObj' },
          property: { type: 'Identifier', name: 'test' },
        },
        arguments: [stringArg, fnArg],
      })

      expect(reports.length).toBe(0)
    })

    test('should report multiple test() calls in sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createTestCall([stringArg], 1, 0))
      visitor.CallExpression(createTestCall([stringArg], 2, 0))
      visitor.CallExpression(createTestCall([stringArg], 3, 0))

      expect(reports.length).toBe(3)
    })

    test('should only report test() calls, not it() in a mixed sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createItCall([stringArg], 1, 0))
      visitor.CallExpression(createTestCall([stringArg], 2, 0))
      visitor.CallExpression(createItCall([stringArg], 3, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(2)
    })

    test('should only report it() when testFunction="test" in a mixed sequence', () => {
      const { context, reports } = createMockContext({ testFunction: 'test' })
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createTestCall([stringArg], 1, 0))
      visitor.CallExpression(createItCall([stringArg], 2, 0))
      visitor.CallExpression(createTestCall([stringArg], 3, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(2)
    })

    test('should handle node with wrong type string', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression({
        type: 'ExpressionStatement',
        callee: { type: 'Identifier', name: 'test' },
        arguments: [stringArg],
      })

      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // 7. Message content verification — 7 tests
  // ============================================================
  describe('message content verification', () => {
    test('default message mentions it as preferred and test as disallowed', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createTestCall([stringArg, fnArg]))

      expect(reports[0].message).toBe("Use 'it()' instead of 'test()' for consistency")
    })

    test('testFunction="test" message mentions test as preferred and it as disallowed', () => {
      const { context, reports } = createMockContext({ testFunction: 'test' })
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createItCall([stringArg, fnArg]))

      expect(reports[0].message).toBe("Use 'test()' instead of 'it()' for consistency")
    })

    test('message does not use ESLint placeholder format', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createTestCall([stringArg, fnArg]))

      expect(reports[0].message).not.toContain('{{')
      expect(reports[0].message).not.toContain('}}')
    })

    test('message contains the word "consistency"', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createTestCall([stringArg, fnArg]))

      expect(reports[0].message).toContain('consistency')
    })

    test('message contains "Use" prefix', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createTestCall([stringArg, fnArg]))

      expect(reports[0].message).toContain('Use')
    })

    test('message contains "instead of" phrase', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createTestCall([stringArg, fnArg]))

      expect(reports[0].message).toContain('instead of')
    })

    test('message uses single quotes around function names', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createTestCall([stringArg, fnArg]))

      expect(reports[0].message).toContain("'it()'")
      expect(reports[0].message).toContain("'test()'")
    })
  })

  // ============================================================
  // 8. Location reporting — 6 tests
  // ============================================================
  describe('location reporting', () => {
    test('should report correct location for test() at line 5, column 8', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createTestCall([stringArg, fnArg], 5, 8))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should report correct location for it() at line 3, column 4 when testFunction="test"', () => {
      const { context, reports } = createMockContext({ testFunction: 'test' })
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createItCall([stringArg, fnArg], 3, 4))

      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should include end location in report', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createTestCall([stringArg], 1, 0))

      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(1)
    })

    test('should report correct locations for multiple test() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createTestCall([stringArg], 10, 0))
      visitor.CallExpression(createTestCall([stringArg], 20, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[1].loc?.start.line).toBe(20)
      expect(reports[1].loc?.start.column).toBe(5)
    })

    test('should report correct location for test() at line 1, column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createTestCall([stringArg, fnArg], 1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct location for it() at line 42 when testFunction="test"', () => {
      const { context, reports } = createMockContext({ testFunction: 'test' })
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createItCall([stringArg, fnArg], 42, 6))

      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(6)
    })
  })

  // ============================================================
  // 9. State isolation between visitors — 3 tests
  // ============================================================
  describe('state isolation between visitors', () => {
    test('separate visitors have separate state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()

      const visitor1 = noTestPrefixRule.create(ctx1)
      const visitor2 = noTestPrefixRule.create(ctx2)

      visitor1.CallExpression(createTestCall([stringArg, fnArg]))
      visitor2.CallExpression(createItCall([stringArg, fnArg]))

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createTestCall([stringArg], 1, 0))
      visitor.CallExpression(createTestCall([stringArg], 2, 0))
      visitor.CallExpression(createTestCall([stringArg], 3, 0))
      visitor.CallExpression(createTestCall([stringArg], 4, 0))

      expect(reports.length).toBe(4)
    })

    test('visitors with different options work independently', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext({ testFunction: 'test' })

      const visitor1 = noTestPrefixRule.create(ctx1)
      const visitor2 = noTestPrefixRule.create(ctx2)

      visitor1.CallExpression(createItCall([stringArg]))
      visitor1.CallExpression(createTestCall([stringArg]))

      visitor2.CallExpression(createItCall([stringArg]))
      visitor2.CallExpression(createTestCall([stringArg]))

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(1)
    })
  })

  // ============================================================
  // 10. Option testFunction='it' — 5 tests
  // ============================================================
  describe('option testFunction="it" — same as default', () => {
    test('should report test() when testFunction is "it"', () => {
      const { context, reports } = createMockContext({ testFunction: 'it' })
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createTestCall([stringArg, fnArg]))

      expect(reports.length).toBe(1)
    })

    test('should allow it() when testFunction is "it"', () => {
      const { context, reports } = createMockContext({ testFunction: 'it' })
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createItCall([stringArg, fnArg]))

      expect(reports.length).toBe(0)
    })

    test('message mentions "it" as preferred when testFunction is "it"', () => {
      const { context, reports } = createMockContext({ testFunction: 'it' })
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createTestCall([stringArg, fnArg]))

      expect(reports[0].message).toContain("'it()'")
      expect(reports[0].message).toContain("'test()'")
    })

    test('should not report describe() when testFunction is "it"', () => {
      const { context, reports } = createMockContext({ testFunction: 'it' })
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'describe' },
        arguments: [stringArg, fnArg],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should accumulate reports for multiple test() calls when testFunction is "it"', () => {
      const { context, reports } = createMockContext({ testFunction: 'it' })
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createTestCall([stringArg], 1, 0))
      visitor.CallExpression(createTestCall([stringArg], 2, 0))

      expect(reports.length).toBe(2)
    })
  })

  // ============================================================
  // 11. Default export — 1 test
  // ============================================================
  describe('default export', () => {
    test('rule should be the default export', () => {
      expect(noTestPrefixRule).toBeDefined()
      expect(noTestPrefixRule.meta).toBeDefined()
      expect(noTestPrefixRule.create).toBeDefined()
    })
  })

  describe('member expression callees', () => {
    test('should not report it.skip() when default config', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'it' },
          property: { type: 'Identifier', name: 'skip' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report test.only() when default config', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'test' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report test.skip() when testFunction is "it"', () => {
      const { context, reports } = createMockContext({ testFunction: 'it' })
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'test' },
          property: { type: 'Identifier', name: 'skip' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('schema validation', () => {
    test('should have enum for testFunction property', () => {
      const schema = noTestPrefixRule.meta.schema as Array<Record<string, unknown>>
      const properties = schema[0]?.properties as Record<string, unknown>
      const testFn = properties?.testFunction as Record<string, unknown>

      expect(testFn?.type).toBe('string')
      expect(testFn?.enum).toEqual(['it', 'test'])
    })

    test('should have additionalProperties set to false', () => {
      const schema = noTestPrefixRule.meta.schema as Array<Record<string, unknown>>
      expect(schema[0]?.additionalProperties).toBe(false)
    })
  })

  describe('docs URL', () => {
    test('should have valid URL format with rule name', () => {
      const url = noTestPrefixRule.meta.docs?.url
      expect(url).toMatch(/^https?:\/\/.+/)
      expect(url).toContain('no-test-prefix')
    })
  })

  describe('additional verification', () => {
    test('should have create function returning visitor', () => {
      const { context } = createMockContext()
      const visitor = noTestPrefixRule.create(context)
      expect(visitor).toBeDefined()
      expect(typeof visitor).toBe('object')
    })
  })

  describe('type safety', () => {
    test('should have meta as a plain object', () => {
      expect(typeof noTestPrefixRule.meta).toBe('object')
      expect(noTestPrefixRule.meta).not.toBeNull()
      expect(Array.isArray(noTestPrefixRule.meta)).toBe(false)
    })
  })

  describe('testFunction as null', () => {
    test('should default to it preferred when testFunction is null', () => {
      const { context, reports } = createMockContext({ testFunction: null })
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createTestCall([stringArg, fnArg]))

      expect(reports.length).toBe(1)
    })
  })

  describe('testFunction as boolean', () => {
    test('should default to it preferred when testFunction is true', () => {
      const { context, reports } = createMockContext({ testFunction: true })
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createTestCall([stringArg, fnArg]))

      expect(reports.length).toBe(1)
    })
  })

  describe('callee with numeric name', () => {
    test('should not report when callee name is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 42 },
        arguments: [stringArg],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('testFunction case sensitivity', () => {
    test('should default to it preferred when testFunction is TEST (uppercase)', () => {
      const { context, reports } = createMockContext({ testFunction: 'TEST' })
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createTestCall([stringArg, fnArg]))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'it()'")
    })
  })

  describe('it.concurrent not reported with testFunction test', () => {
    test('should not report it.concurrent() member call when testFunction is test', () => {
      const { context, reports } = createMockContext({ testFunction: 'test' })
      const visitor = noTestPrefixRule.create(context)

      visitor.CallExpression(createMemberCall('it', 'concurrent', [stringArg, fnArg]))

      expect(reports.length).toBe(0)
    })
  })
})
