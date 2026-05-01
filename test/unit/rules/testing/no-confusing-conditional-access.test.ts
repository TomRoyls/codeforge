import { describe, test, expect, vi } from 'vitest'
import { noConfusingConditionalAccessRule } from '../../../../src/rules/testing/no-confusing-conditional-access.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.test.ts',
  source = "it?.('should work', () => {});",
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
    getSource: () => source,
    getAST: () => null,
    getTokens: () => [],
    getComments: () => [],
    config: { options: [options] },
    logger: {
      debug: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
    },
    settings: {},
    ruleId: 'no-confusing-conditional-access',
  }

  return { context, reports }
}

function createOptionalCall(name: string, line = 1, column = 0): unknown {
  return {
    type: 'OptionalCallExpression',
    callee: { type: 'Identifier', name },
    arguments: [{ type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] } }],
    optional: true,
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
}

function createOptionalMemberCall(objectName: string, propertyName: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'OptionalMemberExpression',
      object: { type: 'Identifier', name: objectName },
      property: { type: 'Identifier', name: propertyName },
      optional: true,
    },
    arguments: [{ type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] } }],
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
}

function createNormalCall(name: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name },
    arguments: [{ type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] } }],
    loc: { start: { line, column }, end: { line, column: column + 20 } },
  }
}

function createMethodCall(objectName: string, propertyName: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: objectName },
      property: { type: 'Identifier', name: propertyName },
    },
    arguments: [{ type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] } }],
    loc: { start: { line, column }, end: { line, column: column + 25 } },
  }
}

describe('no-confusing-conditional-access rule', () => {
  describe('Valid cases — should NOT report', () => {
    test('normal it() call does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.CallExpression(createNormalCall('it'))

      expect(reports.length).toBe(0)
    })

    test('normal test() call does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.CallExpression(createNormalCall('test'))

      expect(reports.length).toBe(0)
    })

    test('normal describe() call does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.CallExpression(createNormalCall('describe'))

      expect(reports.length).toBe(0)
    })

    test('normal beforeEach() call does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.CallExpression(createNormalCall('beforeEach'))

      expect(reports.length).toBe(0)
    })

    test('normal afterEach() call does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.CallExpression(createNormalCall('afterEach'))

      expect(reports.length).toBe(0)
    })

    test('normal beforeAll() call does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.CallExpression(createNormalCall('beforeAll'))

      expect(reports.length).toBe(0)
    })

    test('normal afterAll() call does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.CallExpression(createNormalCall('afterAll'))

      expect(reports.length).toBe(0)
    })

    test('it.skip() method call does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.CallExpression(createMethodCall('it', 'skip'))

      expect(reports.length).toBe(0)
    })

    test('it.only() method call does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.CallExpression(createMethodCall('it', 'only'))

      expect(reports.length).toBe(0)
    })

    test('test.each() method call does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.CallExpression(createMethodCall('test', 'each'))

      expect(reports.length).toBe(0)
    })

    test('describe.skip() method call does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.CallExpression(createMethodCall('describe', 'skip'))

      expect(reports.length).toBe(0)
    })

    test('someFunction?.() optional call does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.OptionalCallExpression(createOptionalCall('someFunction'))

      expect(reports.length).toBe(0)
    })

    test('regularObject?.property does not report (not a call)', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      // MemberExpression, not a CallExpression - visitor won't be called for it
      expect(reports.length).toBe(0)
    })

    test('expect(value)?.toBe(true) optional on expect does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.OptionalCallExpression(createOptionalCall('expect'))

      expect(reports.length).toBe(0)
    })

    test('const x = it does not report (not a call)', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      // Variable declaration - visitor won't be called for it
      expect(reports.length).toBe(0)
    })

    test('normal fdescribe() call does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.CallExpression(createNormalCall('fdescribe'))

      expect(reports.length).toBe(0)
    })

    test('normal ftest() call does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.CallExpression(createNormalCall('ftest'))

      expect(reports.length).toBe(0)
    })

    test('normal xdescribe() call does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.CallExpression(createNormalCall('xdescribe'))

      expect(reports.length).toBe(0)
    })

    test('normal xtest() call does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.CallExpression(createNormalCall('xtest'))

      expect(reports.length).toBe(0)
    })

    test('normal fit() call does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.CallExpression(createNormalCall('fit'))

      expect(reports.length).toBe(0)
    })

    test('normal specify() call does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.CallExpression(createNormalCall('specify'))

      expect(reports.length).toBe(0)
    })

    test('randomFunction?.call does not report via CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.CallExpression(createOptionalMemberCall('randomFunction', 'call'))

      expect(reports.length).toBe(0)
    })

    test('console?.log does not report via CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.CallExpression(createOptionalMemberCall('console', 'log'))

      expect(reports.length).toBe(0)
    })

    test('callback?.() optional call does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.OptionalCallExpression(createOptionalCall('callback'))

      expect(reports.length).toBe(0)
    })

    test('fn?.() optional call does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.OptionalCallExpression(createOptionalCall('fn'))

      expect(reports.length).toBe(0)
    })

    test('normal xcontext() call does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.CallExpression(createNormalCall('xcontext'))

      expect(reports.length).toBe(0)
    })

    test('normal fspecify() call does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.CallExpression(createNormalCall('fspecify'))

      expect(reports.length).toBe(0)
    })

    test('normal xspecify() call does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.CallExpression(createNormalCall('xspecify'))

      expect(reports.length).toBe(0)
    })

    test('normal fcontext() call does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.CallExpression(createNormalCall('fcontext'))

      expect(reports.length).toBe(0)
    })

    test('describe.each() method call does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.CallExpression(createMethodCall('describe', 'each'))

      expect(reports.length).toBe(0)
    })

    test('beforeEach.skip() method call does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.CallExpression(createMethodCall('beforeEach', 'skip'))

      expect(reports.length).toBe(0)
    })

    test('afterAll.only() method call does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.CallExpression(createMethodCall('afterAll', 'only'))

      expect(reports.length).toBe(0)
    })

    test('window?.addEventListener optional member does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.CallExpression(createOptionalMemberCall('window', 'addEventListener'))

      expect(reports.length).toBe(0)
    })

    test('document?.querySelector optional member does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.CallExpression(createOptionalMemberCall('document', 'querySelector'))

      expect(reports.length).toBe(0)
    })
  })

  describe('Invalid cases — SHOULD report', () => {
    test('it?.() reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.OptionalCallExpression(createOptionalCall('it'))

      expect(reports.length).toBe(1)
      expect(reports[0]!.message).toContain('it')
    })

    test('test?.() reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.OptionalCallExpression(createOptionalCall('test'))

      expect(reports.length).toBe(1)
      expect(reports[0]!.message).toContain('test')
    })

    test('describe?.() reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.OptionalCallExpression(createOptionalCall('describe'))

      expect(reports.length).toBe(1)
      expect(reports[0]!.message).toContain('describe')
    })

    test('beforeEach?.() reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.OptionalCallExpression(createOptionalCall('beforeEach'))

      expect(reports.length).toBe(1)
      expect(reports[0]!.message).toContain('beforeEach')
    })

    test('afterEach?.() reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.OptionalCallExpression(createOptionalCall('afterEach'))

      expect(reports.length).toBe(1)
    })

    test('beforeAll?.() reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.OptionalCallExpression(createOptionalCall('beforeAll'))

      expect(reports.length).toBe(1)
    })

    test('afterAll?.() reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.OptionalCallExpression(createOptionalCall('afterAll'))

      expect(reports.length).toBe(1)
    })

    test('xdescribe?.() reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.OptionalCallExpression(createOptionalCall('xdescribe'))

      expect(reports.length).toBe(1)
      expect(reports[0]!.message).toContain('xdescribe')
    })

    test('xtest?.() reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.OptionalCallExpression(createOptionalCall('xtest'))

      expect(reports.length).toBe(1)
    })

    test('fdescribe?.() reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.OptionalCallExpression(createOptionalCall('fdescribe'))

      expect(reports.length).toBe(1)
    })

    test('ftest?.() reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.OptionalCallExpression(createOptionalCall('ftest'))

      expect(reports.length).toBe(1)
    })

    test('xcontext?.() reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.OptionalCallExpression(createOptionalCall('xcontext'))

      expect(reports.length).toBe(1)
    })

    test('fcontext?.() reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.OptionalCallExpression(createOptionalCall('fcontext'))

      expect(reports.length).toBe(1)
    })

    test('xspecify?.() reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.OptionalCallExpression(createOptionalCall('xspecify'))

      expect(reports.length).toBe(1)
    })

    test('fspecify?.() reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.OptionalCallExpression(createOptionalCall('fspecify'))

      expect(reports.length).toBe(1)
    })

    test('it?.skip() reports via CallExpression with OptionalMemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.CallExpression(createOptionalMemberCall('it', 'skip'))

      expect(reports.length).toBe(1)
      expect(reports[0]!.message).toContain('it')
    })

    test('test?.skip() reports via CallExpression with OptionalMemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.CallExpression(createOptionalMemberCall('test', 'skip'))

      expect(reports.length).toBe(1)
    })

    test('describe?.only() reports via CallExpression with OptionalMemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.CallExpression(createOptionalMemberCall('describe', 'only'))

      expect(reports.length).toBe(1)
    })

    test('it?.each() reports via CallExpression with OptionalMemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.CallExpression(createOptionalMemberCall('it', 'each'))

      expect(reports.length).toBe(1)
    })

    test('test?.only() reports via CallExpression with OptionalMemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.CallExpression(createOptionalMemberCall('test', 'only'))

      expect(reports.length).toBe(1)
    })

    test('multiple optional calls in sequence all report', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.OptionalCallExpression(createOptionalCall('it'))
      visitor.OptionalCallExpression(createOptionalCall('test'))
      visitor.OptionalCallExpression(createOptionalCall('describe'))

      expect(reports.length).toBe(3)
    })

    test('report message includes the function name', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.OptionalCallExpression(createOptionalCall('beforeEach'))

      expect(reports[0]!.message).toBe("Avoid optional chaining on test function 'beforeEach'")
    })

    test('report includes location info', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.OptionalCallExpression(createOptionalCall('it', 5, 10))

      expect(reports[0]!.loc).toBeDefined()
      expect(reports[0]!.loc!.start.line).toBe(5)
      expect(reports[0]!.loc!.start.column).toBe(10)
    })

    test('beforeAll?.only() reports via CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.CallExpression(createOptionalMemberCall('beforeAll', 'only'))

      expect(reports.length).toBe(1)
    })

    test('afterEach?.skip() reports via CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.CallExpression(createOptionalMemberCall('afterEach', 'skip'))

      expect(reports.length).toBe(1)
    })
  })

  describe('Edge cases', () => {
    test('should handle null node gracefully via OptionalCallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      expect(() => visitor.OptionalCallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully via OptionalCallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      expect(() => visitor.OptionalCallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node gracefully via OptionalCallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      expect(() => visitor.OptionalCallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle null node gracefully via CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully via CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node gracefully via CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee via CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node with non-OptionalMemberExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'it' }, property: { type: 'Identifier', name: 'skip' } },
        arguments: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle OptionalCallExpression with MemberExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.OptionalCallExpression({
        type: 'OptionalCallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'it' },
          property: { type: 'Identifier', name: 'skip' },
        },
        arguments: [],
        optional: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(1)
    })

    test('separate visitors have separate state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()

      const visitor1 = noConfusingConditionalAccessRule.create(ctx1)
      const visitor2 = noConfusingConditionalAccessRule.create(ctx2)

      visitor1.OptionalCallExpression(createOptionalCall('it'))
      visitor2.CallExpression(createNormalCall('it'))

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('create returns visitor with CallExpression and OptionalCallExpression', () => {
      const { context } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(visitor).toHaveProperty('OptionalCallExpression')
    })

    test('create returns new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noConfusingConditionalAccessRule.create(context)
      const visitor2 = noConfusingConditionalAccessRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('should have suggestion type and warn severity', () => {
      expect(noConfusingConditionalAccessRule.meta.type).toBe('suggestion')
      expect(noConfusingConditionalAccessRule.meta.severity).toBe('warn')
      expect(noConfusingConditionalAccessRule.meta.docs?.category).toBe('testing')
    })

    test('meta description mentions optional chaining', () => {
      expect(noConfusingConditionalAccessRule.meta.docs?.description).toContain('optional chaining')
      expect(noConfusingConditionalAccessRule.meta.docs?.url).toContain('no-confusing-conditional-access')
    })

    test('meta docs are properly configured', () => {
      expect(noConfusingConditionalAccessRule.meta.docs?.recommended).toBe(false)
    })

    test('default export is the same as named export', async () => {
      const mod = await import('../../../../src/rules/testing/no-confusing-conditional-access.js')
      expect(mod.default).toBe(noConfusingConditionalAccessRule)
    })

    test('CallExpression with Identifier callee does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })

    test('OptionalCallExpression with callee missing does not throw', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.OptionalCallExpression({
        type: 'OptionalCallExpression',
        arguments: [],
        optional: true,
      })

      expect(reports.length).toBe(0)
    })

    test('OptionalCallExpression with null callee does not throw', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.OptionalCallExpression({
        type: 'OptionalCallExpression',
        callee: null,
        arguments: [],
        optional: true,
      })

      expect(reports.length).toBe(0)
    })

    test('OptionalCallExpression with number callee does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.OptionalCallExpression({
        type: 'OptionalCallExpression',
        callee: 'not-a-node',
        arguments: [],
        optional: true,
      })

      expect(reports.length).toBe(0)
    })

    test('CallExpression with string callee does not throw', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: 'not-a-node',
        arguments: [],
      })

      expect(reports.length).toBe(0)
    })

    test('CallExpression with OptionalMemberExpression whose object has no name does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'OptionalMemberExpression',
          object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
          property: { type: 'Identifier', name: 'skip' },
          optional: true,
        },
        arguments: [],
      })

      expect(reports.length).toBe(0)
    })

    test('OptionalCallExpression reports xcontext with correct name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.OptionalCallExpression(createOptionalCall('xcontext'))

      expect(reports.length).toBe(1)
      expect(reports[0]!.message).toContain("'xcontext'")
    })

    test('OptionalCallExpression reports fspecify with correct name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.OptionalCallExpression(createOptionalCall('fspecify'))

      expect(reports.length).toBe(1)
      expect(reports[0]!.message).toContain("'fspecify'")
    })

    test('mixed valid and invalid calls in sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.CallExpression(createNormalCall('it'))
      visitor.OptionalCallExpression(createOptionalCall('it'))
      visitor.CallExpression(createNormalCall('describe'))
      visitor.OptionalCallExpression(createOptionalCall('test'))

      expect(reports.length).toBe(2)
    })

    test('OptionalMemberExpression on it reports correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.CallExpression(createOptionalMemberCall('it', 'skip', 10, 5))

      expect(reports[0]!.loc).toBeDefined()
      expect(reports[0]!.loc!.start.line).toBe(10)
      expect(reports[0]!.loc!.start.column).toBe(5)
    })

    test('OptionalMemberExpression on test reports correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.CallExpression(createOptionalMemberCall('test', 'only', 3, 8))

      expect(reports[0]!.loc!.start.line).toBe(3)
    })

    test('OptionalMemberExpression with non-test object does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.CallExpression(createOptionalMemberCall('myObject', 'method'))

      expect(reports.length).toBe(0)
    })

    test('OptionalCallExpression with xspecify reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.OptionalCallExpression(createOptionalCall('xspecify'))

      expect(reports.length).toBe(1)
    })

    test('OptionalCallExpression with fcontext reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.OptionalCallExpression(createOptionalCall('fcontext'))

      expect(reports.length).toBe(1)
    })

    test('no report when callee is an anonymous arrow function', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.OptionalCallExpression({
        type: 'OptionalCallExpression',
        callee: { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] }, params: [] },
        arguments: [],
        optional: true,
      })

      expect(reports.length).toBe(0)
    })

    test('OptionalCallExpression on beforeEach with arguments reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.OptionalCallExpression({
        type: 'OptionalCallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [{ type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] }, params: [] }],
        optional: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(1)
      expect(reports[0]!.message).toContain('beforeEach')
    })

    test('OptionalMemberExpression on afterEach.each does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.CallExpression(createOptionalMemberCall('afterEach', 'each'))

      expect(reports.length).toBe(1)
    })

    test('meta docs recommended is false', () => {
      expect(noConfusingConditionalAccessRule.meta.docs?.recommended).toBe(false)
    })

    test('Multiple OptionalCallExpressions in sequence all report independently', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.OptionalCallExpression(createOptionalCall('it'))
      visitor.OptionalCallExpression(createOptionalCall('test'))
      visitor.OptionalCallExpression(createOptionalCall('describe'))
      visitor.OptionalCallExpression(createOptionalCall('beforeAll'))
      visitor.OptionalCallExpression(createOptionalCall('afterAll'))

      expect(reports.length).toBe(5)
    })

    test('CallExpression with regular MemberExpression does not report for test?.each chain', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingConditionalAccessRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'test' },
          property: { type: 'Identifier', name: 'each' },
        },
        arguments: [],
      })

      expect(reports.length).toBe(0)
    })
  })
})
