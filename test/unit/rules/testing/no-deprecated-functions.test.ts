import { describe, test, expect, vi } from 'vitest'
import { noDeprecatedFunctionsRule } from '../../../../src/rules/testing/no-deprecated-functions.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.test.ts',
  source = 'jest.runTimersToTime(1000);',
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

function createJestCall(
  methodName: string,
  args: unknown[] = [],
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'jest' },
      property: { type: 'Identifier', name: methodName },
    },
    arguments: args,
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
}

function createExpectCall(
  methodName: string,
  args: unknown[] = [],
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'expect' },
      property: { type: 'Identifier', name: methodName },
    },
    arguments: args,
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
}

function createObjectMethodCall(
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

const numberArg = { type: 'Literal', value: 1000 }
const stringArg = { type: 'Literal', value: './module' }
const identifierArg = { type: 'Identifier', name: 'serializer' }

describe('no-deprecated-functions rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noDeprecatedFunctionsRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noDeprecatedFunctionsRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(noDeprecatedFunctionsRule.meta.docs?.recommended).toBe(false)
    })

    test('should have testing category', () => {
      expect(noDeprecatedFunctionsRule.meta.docs?.category).toBe('testing')
    })

    test('should have correct description mentioning deprecated', () => {
      expect(noDeprecatedFunctionsRule.meta.docs?.description).toContain('deprecated')
    })

    test('should have correct docs URL', () => {
      expect(noDeprecatedFunctionsRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-deprecated-functions',
      )
    })

    test('should not have fixable property', () => {
      expect(noDeprecatedFunctionsRule.meta.fixable).toBeUndefined()
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noDeprecatedFunctionsRule.create(context)
      const visitor2 = noDeprecatedFunctionsRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })
  })

  describe('deprecated jest functions detected', () => {
    test('should report jest.runTimersToTime()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createJestCall('runTimersToTime', [numberArg]))

      expect(reports.length).toBe(1)
    })

    test('should report message mentioning jest.runTimersToTime()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createJestCall('runTimersToTime', [numberArg]))

      expect(reports[0].message).toContain('jest.runTimersToTime()')
    })

    test('should report message suggesting jest.advanceTimersByTime()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createJestCall('runTimersToTime', [numberArg]))

      expect(reports[0].message).toContain('jest.advanceTimersByTime()')
    })

    test('should report jest.runTimersToTimeAsync()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createJestCall('runTimersToTimeAsync', [numberArg]))

      expect(reports.length).toBe(1)
    })

    test('should report message mentioning jest.runTimersToTimeAsync()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createJestCall('runTimersToTimeAsync', [numberArg]))

      expect(reports[0].message).toContain('jest.runTimersToTimeAsync()')
    })

    test('should report message suggesting jest.advanceTimersByTimeAsync()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createJestCall('runTimersToTimeAsync', [numberArg]))

      expect(reports[0].message).toContain('jest.advanceTimersByTimeAsync()')
    })

    test('should report jest.genMockFromModule()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createJestCall('genMockFromModule', [stringArg]))

      expect(reports.length).toBe(1)
    })

    test('should report message mentioning jest.genMockFromModule()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createJestCall('genMockFromModule', [stringArg]))

      expect(reports[0].message).toContain('jest.genMockFromModule()')
    })

    test('should report message suggesting jest.createMockFromModule()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createJestCall('genMockFromModule', [stringArg]))

      expect(reports[0].message).toContain('jest.createMockFromModule()')
    })

    test('should report jest.resetModuleRegistry()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createJestCall('resetModuleRegistry'))

      expect(reports.length).toBe(1)
    })

    test('should report message mentioning jest.resetModuleRegistry()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createJestCall('resetModuleRegistry'))

      expect(reports[0].message).toContain('jest.resetModuleRegistry()')
    })

    test('should report message suggesting jest.resetModules()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createJestCall('resetModuleRegistry'))

      expect(reports[0].message).toContain('jest.resetModules()')
    })

    test('should report jest.runTimersToTime with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createJestCall('runTimersToTime', []))

      expect(reports.length).toBe(1)
    })

    test('should report jest.runTimersToTime with multiple arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createJestCall('runTimersToTime', [numberArg, numberArg]))

      expect(reports.length).toBe(1)
    })

    test('should report jest.genMockFromModule with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createJestCall('genMockFromModule', []))

      expect(reports.length).toBe(1)
    })

    test('should detect deprecated function in chained call context', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      const chainedCall = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: { type: 'Identifier', name: 'jest' },
              property: { type: 'Identifier', name: 'runTimersToTime' },
            },
            arguments: [numberArg],
          },
          property: { type: 'Identifier', name: 'then' },
        },
        arguments: [],
      }

      visitor.CallExpression(chainedCall)

      expect(reports.length).toBe(0)
    })

    test('should report deprecated function when it is the inner callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createJestCall('runTimersToTime', [numberArg]))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('jest.runTimersToTime()')
    })

    test('should report all four deprecated jest functions', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createJestCall('runTimersToTime', [numberArg]))
      visitor.CallExpression(createJestCall('runTimersToTimeAsync', [numberArg]))
      visitor.CallExpression(createJestCall('genMockFromModule', [stringArg]))
      visitor.CallExpression(createJestCall('resetModuleRegistry'))

      expect(reports.length).toBe(4)
    })
  })

  describe('valid modern functions NOT flagged', () => {
    test('should not report jest.advanceTimersByTime()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createJestCall('advanceTimersByTime', [numberArg]))

      expect(reports.length).toBe(0)
    })

    test('should not report jest.advanceTimersByTimeAsync()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createJestCall('advanceTimersByTimeAsync', [numberArg]))

      expect(reports.length).toBe(0)
    })

    test('should not report jest.createMockFromModule()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createJestCall('createMockFromModule', [stringArg]))

      expect(reports.length).toBe(0)
    })

    test('should not report jest.resetModules()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createJestCall('resetModules'))

      expect(reports.length).toBe(0)
    })

    test('should not report jest.fn()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createJestCall('fn'))

      expect(reports.length).toBe(0)
    })

    test('should not report jest.mock()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createJestCall('mock', [stringArg]))

      expect(reports.length).toBe(0)
    })

    test('should not report jest.spyOn()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createJestCall('spyOn', [identifierArg, identifierArg]))

      expect(reports.length).toBe(0)
    })

    test('should not report jest.useFakeTimers()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createJestCall('useFakeTimers'))

      expect(reports.length).toBe(0)
    })

    test('should not report jest.useRealTimers()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createJestCall('useRealTimers'))

      expect(reports.length).toBe(0)
    })

    test('should not report jest.clearAllTimers()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createJestCall('clearAllTimers'))

      expect(reports.length).toBe(0)
    })

    test('should not report jest.runAllTimers()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createJestCall('runAllTimers'))

      expect(reports.length).toBe(0)
    })

    test('should not report jest.runOnlyPendingTimers()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createJestCall('runOnlyPendingTimers'))

      expect(reports.length).toBe(0)
    })

    test('should not report jest.clearAllMocks()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createJestCall('clearAllMocks'))

      expect(reports.length).toBe(0)
    })

    test('should not report jest.restoreAllMocks()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createJestCall('restoreAllMocks'))

      expect(reports.length).toBe(0)
    })

    test('should not report jest.unmock()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createJestCall('unmock', [stringArg]))

      expect(reports.length).toBe(0)
    })
  })

  describe('expect deprecated functions', () => {
    test('should report expect.addSnapshotSerializer()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createExpectCall('addSnapshotSerializer', [identifierArg]))

      expect(reports.length).toBe(1)
    })

    test('should report message mentioning expect.addSnapshotSerializer()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createExpectCall('addSnapshotSerializer', [identifierArg]))

      expect(reports[0].message).toContain('expect.addSnapshotSerializer()')
    })

    test('should report message mentioning snapshotSerializers config', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createExpectCall('addSnapshotSerializer', [identifierArg]))

      expect(reports[0].message).toContain('snapshotSerializers')
    })

    test('should report expect.addSnapshotSerializer with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createExpectCall('addSnapshotSerializer', []))

      expect(reports.length).toBe(1)
    })

    test('should report expect.addSnapshotSerializer with multiple arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createExpectCall('addSnapshotSerializer', [identifierArg, stringArg]))

      expect(reports.length).toBe(1)
    })
  })

  describe('non-matching patterns', () => {
    test('should not report regular function call', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'runTimersToTime' },
        arguments: [numberArg],
      })

      expect(reports.length).toBe(0)
    })

    test('should not report method call on vitest object', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createObjectMethodCall('vitest', 'runTimersToTime', [numberArg]))

      expect(reports.length).toBe(0)
    })

    test('should not report method call on other object', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createObjectMethodCall('myObj', 'runTimersToTime', [numberArg]))

      expect(reports.length).toBe(0)
    })

    test('should not report property access without call', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression({
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'jest' },
        property: { type: 'Identifier', name: 'runTimersToTime' },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report console.log()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createObjectMethodCall('console', 'log', [stringArg]))

      expect(reports.length).toBe(0)
    })

    test('should not report myModule.genMockFromModule()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createObjectMethodCall('myModule', 'genMockFromModule', [stringArg]))

      expect(reports.length).toBe(0)
    })

    test('should not report when object is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'someObj' },
            property: { type: 'Identifier', name: 'jest' },
          },
          property: { type: 'Identifier', name: 'runTimersToTime' },
        },
        arguments: [numberArg],
      })

      expect(reports.length).toBe(0)
    })

    test('should not report jest.advanceTimersByTime() (replacement function)', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createJestCall('advanceTimersByTime', [numberArg]))

      expect(reports.length).toBe(0)
    })

    test('should not report expect.extend()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createExpectCall('extend', [identifierArg]))

      expect(reports.length).toBe(0)
    })

    test('should not report expect.anything()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createExpectCall('anything'))

      expect(reports.length).toBe(0)
    })

    test('should not report Array.from()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createObjectMethodCall('Array', 'from', [identifierArg]))

      expect(reports.length).toBe(0)
    })

    test('should not report Object.keys()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createObjectMethodCall('Object', 'keys', [identifierArg]))

      expect(reports.length).toBe(0)
    })

    test('should not report test() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'test' },
        arguments: [stringArg],
      })

      expect(reports.length).toBe(0)
    })

    test('should not report describe() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'describe' },
        arguments: [stringArg],
      })

      expect(reports.length).toBe(0)
    })

    test('should not report it() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [stringArg],
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression({ type: 'CallExpression', arguments: [] })

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'jest' },
          property: { type: 'Identifier', name: 'runTimersToTime' },
        },
        arguments: [numberArg],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression with Identifier callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'jest' },
        arguments: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression callee with null object', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'runTimersToTime' },
        },
        arguments: [numberArg],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle computed property access', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'jest' },
          property: { type: 'Literal', value: 'runTimersToTime' },
        },
        arguments: [numberArg],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle deeply nested calls gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      const deeplyNested = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'jest' },
                arguments: [],
              },
              property: { type: 'Identifier', name: 'fn' },
            },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'mockReturnValue' },
        },
        arguments: [numberArg],
      }

      visitor.CallExpression(deeplyNested)

      expect(reports.length).toBe(0)
    })
  })

  describe('location reporting', () => {
    test('should report correct location for jest.runTimersToTime at line 5, column 8', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createJestCall('runTimersToTime', [numberArg], 5, 8))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should report correct location for jest.genMockFromModule at line 10, column 2', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createJestCall('genMockFromModule', [stringArg], 10, 2))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(2)
    })

    test('should report correct location for expect.addSnapshotSerializer at line 3, column 4', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createExpectCall('addSnapshotSerializer', [identifierArg], 3, 4))

      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should report correct location for jest.resetModuleRegistry at line 1, column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createJestCall('resetModuleRegistry', [], 1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should include end location in report', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createJestCall('runTimersToTime', [numberArg], 1, 0))

      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(1)
    })
  })

  describe('various file paths', () => {
    test('should report in .test.ts files', () => {
      const { context, reports } = createMockContext({}, '/src/app.test.ts')
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createJestCall('runTimersToTime', [numberArg]))

      expect(reports.length).toBe(1)
    })

    test('should report in .spec.ts files', () => {
      const { context, reports } = createMockContext({}, '/src/app.spec.ts')
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createJestCall('runTimersToTime', [numberArg]))

      expect(reports.length).toBe(1)
    })

    test('should report in .ts files', () => {
      const { context, reports } = createMockContext({}, '/src/utils.ts')
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createJestCall('runTimersToTime', [numberArg]))

      expect(reports.length).toBe(1)
    })

    test('should report in nested directory files', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/components/__tests__/Button.test.ts',
      )
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createJestCall('runTimersToTime', [numberArg]))

      expect(reports.length).toBe(1)
    })

    test('should report in .test.js files', () => {
      const { context, reports } = createMockContext({}, '/src/app.test.js')
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createJestCall('runTimersToTime', [numberArg]))

      expect(reports.length).toBe(1)
    })
  })

  describe('multiple deprecated calls', () => {
    test('should report multiple jest.runTimersToTime calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createJestCall('runTimersToTime', [numberArg], 1, 0))
      visitor.CallExpression(createJestCall('runTimersToTime', [numberArg], 2, 0))
      visitor.CallExpression(createJestCall('runTimersToTime', [numberArg], 3, 0))

      expect(reports.length).toBe(3)
    })

    test('should report mixed deprecated and valid calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createJestCall('runTimersToTime', [numberArg], 1, 0))
      visitor.CallExpression(createJestCall('advanceTimersByTime', [numberArg], 2, 0))
      visitor.CallExpression(createJestCall('genMockFromModule', [stringArg], 3, 0))

      expect(reports.length).toBe(2)
    })

    test('should report mixed jest and expect deprecated calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createJestCall('runTimersToTime', [numberArg], 1, 0))
      visitor.CallExpression(createExpectCall('addSnapshotSerializer', [identifierArg], 2, 0))

      expect(reports.length).toBe(2)
    })

    test('should report all deprecated functions in sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createJestCall('runTimersToTime', [numberArg], 1, 0))
      visitor.CallExpression(createJestCall('runTimersToTimeAsync', [numberArg], 2, 0))
      visitor.CallExpression(createJestCall('genMockFromModule', [stringArg], 3, 0))
      visitor.CallExpression(createJestCall('resetModuleRegistry', [], 4, 0))
      visitor.CallExpression(createExpectCall('addSnapshotSerializer', [identifierArg], 5, 0))

      expect(reports.length).toBe(5)
    })

    test('should maintain correct order of reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createJestCall('runTimersToTime', [numberArg], 10, 0))
      visitor.CallExpression(createJestCall('genMockFromModule', [stringArg], 20, 0))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[1].loc?.start.line).toBe(20)
    })
  })

  describe('report message content', () => {
    test('message uses backticks for deprecated function name', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createJestCall('runTimersToTime', [numberArg]))

      expect(reports[0].message).toContain('`jest.runTimersToTime()`')
    })

    test('message starts with "Deprecated function"', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createJestCall('runTimersToTime', [numberArg]))

      expect(reports[0].message).toContain('Deprecated function')
    })

    test('message does not use ESLint placeholder format', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createJestCall('runTimersToTime', [numberArg]))

      expect(reports[0].message).not.toContain('{{')
      expect(reports[0].message).not.toContain('}}')
    })

    test('message for expect.addSnapshotSerializer mentions configuration', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createExpectCall('addSnapshotSerializer', [identifierArg]))

      expect(reports[0].message).toContain('configuration')
      expect(reports[0].message).toContain('snapshotSerializers')
    })

    test('message for jest.runTimersToTimeAsync suggests advanceTimersByTimeAsync', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createJestCall('runTimersToTimeAsync', [numberArg]))

      expect(reports[0].message).toContain('jest.advanceTimersByTimeAsync()')
    })
  })

  describe('state isolation between visitors', () => {
    test('separate visitors have separate state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()

      const visitor1 = noDeprecatedFunctionsRule.create(ctx1)
      const visitor2 = noDeprecatedFunctionsRule.create(ctx2)

      visitor1.CallExpression(createJestCall('runTimersToTime', [numberArg]))
      visitor2.CallExpression(createJestCall('advanceTimersByTime', [numberArg]))

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedFunctionsRule.create(context)

      visitor.CallExpression(createJestCall('runTimersToTime', [numberArg], 1, 0))
      visitor.CallExpression(createJestCall('advanceTimersByTime', [numberArg], 2, 0))
      visitor.CallExpression(createJestCall('genMockFromModule', [stringArg], 3, 0))
      visitor.CallExpression(createJestCall('resetModuleRegistry', [], 4, 0))

      expect(reports.length).toBe(3)
    })
  })

  describe('default export', () => {
    test('rule should be the default export', () => {
      expect(noDeprecatedFunctionsRule).toBeDefined()
      expect(noDeprecatedFunctionsRule.meta).toBeDefined()
      expect(noDeprecatedFunctionsRule.create).toBeDefined()
    })
  })
})
