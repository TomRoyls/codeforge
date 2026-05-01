import { describe, test, expect, vi } from 'vitest'
import { noConsoleInTestsRule } from '../../../../src/rules/testing/no-console-in-tests.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.test.ts',
  source = 'it("test", () => { console.log("msg"); });',
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

function createConsoleCall(
  method: string,
  args: unknown[] = [],
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'console' },
      property: { type: 'Identifier', name: method },
    },
    arguments: args,
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
}

function createNonConsoleCall(
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

function createGlobalCall(
  name: string,
  args: unknown[] = [],
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name,
    },
    arguments: args,
    loc: { start: { line, column }, end: { line, column: column + name.length + 10 } },
  }
}

const stringArg = { type: 'Literal', value: 'hello' }
const fnArg = { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] }, params: [] }
const numberArg = { type: 'Literal', value: 42 }
const objectArg = { type: 'ObjectExpression', properties: [] }
const arrayArg = { type: 'ArrayExpression', elements: [] }

describe('no-console-in-tests rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noConsoleInTestsRule.meta.type).toBe('problem')
    })

    test('should have warn severity', () => {
      expect(noConsoleInTestsRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(noConsoleInTestsRule.meta.docs?.recommended).toBe(false)
    })

    test('should have testing category', () => {
      expect(noConsoleInTestsRule.meta.docs?.category).toBe('testing')
    })

    test('should have correct description mentioning console', () => {
      expect(noConsoleInTestsRule.meta.docs?.description).toContain('console')
    })

    test('should have correct description mentioning test', () => {
      expect(noConsoleInTestsRule.meta.docs?.description).toContain('test')
    })

    test('should not have fixable property', () => {
      expect(noConsoleInTestsRule.meta.fixable).toBeUndefined()
    })

    test('should have empty schema', () => {
      expect(noConsoleInTestsRule.meta.schema).toEqual([])
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noConsoleInTestsRule.create(context)
      const visitor2 = noConsoleInTestsRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })
  })

  describe('console.log detected', () => {
    test('should report console.log() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression(createConsoleCall('log', [stringArg]))

      expect(reports.length).toBe(1)
    })

    test('should report message for console.log', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression(createConsoleCall('log', [stringArg]))

      expect(reports[0].message).toBe('Unexpected console.log call in test')
    })

    test('should report console.log with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression(createConsoleCall('log', []))

      expect(reports.length).toBe(1)
    })

    test('should report console.log with complex arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression(createConsoleCall('log', [objectArg, arrayArg, fnArg]))

      expect(reports.length).toBe(1)
    })
  })

  describe('console.warn detected', () => {
    test('should report console.warn() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression(createConsoleCall('warn', [stringArg]))

      expect(reports.length).toBe(1)
    })

    test('should report message for console.warn', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression(createConsoleCall('warn', [stringArg]))

      expect(reports[0].message).toBe('Unexpected console.warn call in test')
    })

    test('should report console.warn with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression(createConsoleCall('warn', []))

      expect(reports.length).toBe(1)
    })

    test('should report console.warn with number argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression(createConsoleCall('warn', [numberArg]))

      expect(reports.length).toBe(1)
    })
  })

  describe('console.error detected', () => {
    test('should report console.error() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression(createConsoleCall('error', [stringArg]))

      expect(reports.length).toBe(1)
    })

    test('should report message for console.error', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression(createConsoleCall('error', [stringArg]))

      expect(reports[0].message).toBe('Unexpected console.error call in test')
    })

    test('should report console.error with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression(createConsoleCall('error', []))

      expect(reports.length).toBe(1)
    })

    test('should report console.error with multiple arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression(createConsoleCall('error', [stringArg, objectArg]))

      expect(reports.length).toBe(1)
    })
  })

  describe('console.info detected', () => {
    test('should report console.info() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression(createConsoleCall('info', [stringArg]))

      expect(reports.length).toBe(1)
    })

    test('should report message for console.info', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression(createConsoleCall('info', [stringArg]))

      expect(reports[0].message).toBe('Unexpected console.info call in test')
    })

    test('should report console.info with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression(createConsoleCall('info', []))

      expect(reports.length).toBe(1)
    })
  })

  describe('console.debug detected', () => {
    test('should report console.debug() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression(createConsoleCall('debug', [stringArg]))

      expect(reports.length).toBe(1)
    })

    test('should report message for console.debug', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression(createConsoleCall('debug', [stringArg]))

      expect(reports[0].message).toBe('Unexpected console.debug call in test')
    })

    test('should report console.debug with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression(createConsoleCall('debug', []))

      expect(reports.length).toBe(1)
    })
  })

  describe('negative tests - non-reported console methods', () => {
    test('should not report console.trace()', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression(createConsoleCall('trace', [stringArg]))

      expect(reports.length).toBe(0)
    })

    test('should not report console.table()', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression(createConsoleCall('table', [arrayArg]))

      expect(reports.length).toBe(0)
    })

    test('should not report console.time()', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression(createConsoleCall('time', [stringArg]))

      expect(reports.length).toBe(0)
    })

    test('should not report console.timeEnd()', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression(createConsoleCall('timeEnd', [stringArg]))

      expect(reports.length).toBe(0)
    })

    test('should not report console.group()', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression(createConsoleCall('group', [stringArg]))

      expect(reports.length).toBe(0)
    })

    test('should not report console.groupEnd()', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression(createConsoleCall('groupEnd', []))

      expect(reports.length).toBe(0)
    })

    test('should not report console.assert()', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression(createConsoleCall('assert', [stringArg]))

      expect(reports.length).toBe(0)
    })

    test('should not report console.clear()', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression(createConsoleCall('clear', []))

      expect(reports.length).toBe(0)
    })

    test('should not report console.count()', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression(createConsoleCall('count', [stringArg]))

      expect(reports.length).toBe(0)
    })

    test('should not report console.dir()', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression(createConsoleCall('dir', [objectArg]))

      expect(reports.length).toBe(0)
    })
  })

  describe('negative tests - non-console objects', () => {
    test('should not report myObj.log() - different object', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression(createNonConsoleCall('myObj', 'log', [stringArg]))

      expect(reports.length).toBe(0)
    })

    test('should not report Math.log() - different object', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression(createNonConsoleCall('Math', 'log', [numberArg]))

      expect(reports.length).toBe(0)
    })

    test('should not report logger.error() - different object', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression(createNonConsoleCall('logger', 'error', [stringArg]))

      expect(reports.length).toBe(0)
    })

    test('should not report obj.warn() - different object', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression(createNonConsoleCall('obj', 'warn', [stringArg]))

      expect(reports.length).toBe(0)
    })

    test('should not report customLogger.info() - different object', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression(createNonConsoleCall('customLogger', 'info', [stringArg]))

      expect(reports.length).toBe(0)
    })

    test('should not report someOther.debug() - different object', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression(createNonConsoleCall('someOther', 'debug', [stringArg]))

      expect(reports.length).toBe(0)
    })

    test('should not report console() - direct call (not member)', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression(createGlobalCall('console', []))

      expect(reports.length).toBe(0)
    })

    test('should not report unknown identifier call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression(createGlobalCall('myFunc', [stringArg]))

      expect(reports.length).toBe(0)
    })

    test('should not report Array.from() member call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression(createNonConsoleCall('Array', 'from', [stringArg]))

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression({ type: 'CallExpression', arguments: [] })

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [stringArg],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle callee with null type', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: null, name: 'console' },
        arguments: [stringArg],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression callee with non-Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'someObj' },
            property: { type: 'Identifier', name: 'console' },
          },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [stringArg],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression callee with non-Identifier property', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Literal', value: 'log' },
        },
        arguments: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should report multiple console calls in sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression(createConsoleCall('log', [stringArg], 1, 0))
      visitor.CallExpression(createConsoleCall('warn', [stringArg], 2, 0))
      visitor.CallExpression(createConsoleCall('error', [stringArg], 3, 0))

      expect(reports.length).toBe(3)
    })

    test('should report correct messages for each method in sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression(createConsoleCall('log', [stringArg], 1, 0))
      visitor.CallExpression(createConsoleCall('warn', [stringArg], 2, 0))
      visitor.CallExpression(createConsoleCall('error', [stringArg], 3, 0))

      expect(reports[0].message).toBe('Unexpected console.log call in test')
      expect(reports[1].message).toBe('Unexpected console.warn call in test')
      expect(reports[2].message).toBe('Unexpected console.error call in test')
    })

    test('should report with many arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression(createConsoleCall('log', [stringArg, numberArg, objectArg, arrayArg]))

      expect(reports.length).toBe(1)
    })

    test('should report with complex arguments (objects and arrays)', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression(createConsoleCall('error', [objectArg, arrayArg]))

      expect(reports.length).toBe(1)
    })
  })

  describe('location reporting', () => {
    test('should report correct location for console.log at line 5, column 8', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression(createConsoleCall('log', [stringArg], 5, 8))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should report correct location for console.warn at line 10, column 2', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression(createConsoleCall('warn', [stringArg], 10, 2))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(2)
    })

    test('should report correct location for console.error at line 3, column 4', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression(createConsoleCall('error', [stringArg], 3, 4))

      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should include end location in report', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression(createConsoleCall('log', [stringArg], 1, 0))

      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(1)
    })
  })

  describe('report message content', () => {
    test('message starts with "Unexpected console"', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression(createConsoleCall('log', [stringArg]))

      expect(reports[0].message).toContain('Unexpected console')
    })

    test('message contains "call in test"', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression(createConsoleCall('warn', [stringArg]))

      expect(reports[0].message).toContain('call in test')
    })

    test('message contains the method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression(createConsoleCall('error', [stringArg]))

      expect(reports[0].message).toContain('console.error')
    })

    test('message does not use ESLint placeholder format', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression(createConsoleCall('log', [stringArg]))

      expect(reports[0].message).not.toContain('{{')
      expect(reports[0].message).not.toContain('}}')
    })
  })

  describe('all 5 console methods detected', () => {
    const methods = ['log', 'warn', 'error', 'info', 'debug']

    test('should report all 5 console methods', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      for (const method of methods) {
        visitor.CallExpression(createConsoleCall(method, [stringArg]))
      }

      expect(reports.length).toBe(5)
    })

    test('should report each method with correct name in message', () => {
      for (const method of methods) {
        const { context, reports } = createMockContext()
        const visitor = noConsoleInTestsRule.create(context)

        visitor.CallExpression(createConsoleCall(method, [stringArg]))

        expect(reports.length).toBe(1)
        expect(reports[0].message).toBe(`Unexpected console.${method} call in test`)
      }
    })
  })

  describe('mixed valid and invalid calls', () => {
    test('should only report console calls, not other member calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression(createConsoleCall('log', [stringArg], 1, 0))
      visitor.CallExpression(createNonConsoleCall('Math', 'log', [numberArg], 2, 0))
      visitor.CallExpression(createConsoleCall('error', [stringArg], 3, 0))

      expect(reports.length).toBe(2)
    })

    test('should maintain correct order of reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression(createConsoleCall('log', [stringArg], 10, 0))
      visitor.CallExpression(createConsoleCall('warn', [stringArg], 20, 0))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[1].loc?.start.line).toBe(20)
    })

    test('should report console.log but not console.trace', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression(createConsoleCall('log', [stringArg], 1, 0))
      visitor.CallExpression(createConsoleCall('trace', [stringArg], 2, 0))
      visitor.CallExpression(createConsoleCall('table', [arrayArg], 3, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.log')
    })
  })

  describe('state isolation between visitors', () => {
    test('separate visitors have separate state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()

      const visitor1 = noConsoleInTestsRule.create(ctx1)
      const visitor2 = noConsoleInTestsRule.create(ctx2)

      visitor1.CallExpression(createConsoleCall('log', [stringArg]))
      visitor2.CallExpression(createNonConsoleCall('logger', 'log', [stringArg]))

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression(createConsoleCall('log', [stringArg], 1, 0))
      visitor.CallExpression(createConsoleCall('warn', [stringArg], 2, 0))
      visitor.CallExpression(createConsoleCall('error', [stringArg], 3, 0))
      visitor.CallExpression(createConsoleCall('info', [stringArg], 4, 0))
      visitor.CallExpression(createConsoleCall('debug', [stringArg], 5, 0))

      expect(reports.length).toBe(5)
    })
  })

  describe('additional edge cases', () => {
    test('should report console.info with template literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      const templateArg = { type: 'TemplateLiteral', quasis: [], expressions: [] }
      visitor.CallExpression(createConsoleCall('info', [templateArg]))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Unexpected console.info call in test')
    })

    test('should report console.debug with function argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression(createConsoleCall('debug', [fnArg]))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Unexpected console.debug call in test')
    })

    test('should handle node with wrong type gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression({ type: 'Identifier', name: 'console' })

      expect(reports.length).toBe(0)
    })

    test('should not report computed property access console["log"]', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Literal', value: 'log' },
          computed: true,
        },
        arguments: [stringArg],
      })

      expect(reports.length).toBe(0)
    })

    test('should report correctly when mixed with non-console calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression(createGlobalCall('someFunc', [stringArg], 1, 0))
      visitor.CallExpression(createConsoleCall('log', [stringArg], 2, 0))
      visitor.CallExpression(createNonConsoleCall('obj', 'method', [], 3, 0))
      visitor.CallExpression(createConsoleCall('warn', [stringArg], 4, 0))

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('console.log')
      expect(reports[1].message).toContain('console.warn')
    })
  })

  describe('default export', () => {
    test('rule should be the default export', () => {
      expect(noConsoleInTestsRule).toBeDefined()
      expect(noConsoleInTestsRule.meta).toBeDefined()
      expect(noConsoleInTestsRule.create).toBeDefined()
    })
  })

  describe('additional coverage', () => {
    test('should report console.log with arrow function argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'console' }, property: { type: 'Identifier', name: 'log' } },
        arguments: [{ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('console.log')
    })

    test('should not report console with computed access and known method', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Literal', value: 'log' },
          computed: true,
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should not report when callee object is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'console' } },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should report console.error with null argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'console' }, property: { type: 'Identifier', name: 'error' } },
        arguments: [{ type: 'Literal', value: null }],
        loc: { start: { line: 5, column: 3 }, end: { line: 5, column: 25 } },
      })
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('console.error')
    })

    test('should report all 5 methods in sequence with correct messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)
      for (const method of ['log', 'warn', 'error', 'info', 'debug']) {
        visitor.CallExpression({
          type: 'CallExpression',
          callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'console' }, property: { type: 'Identifier', name: method } },
          arguments: [],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
        })
      }
      expect(reports).toHaveLength(5)
      expect(reports[0].message).toContain('console.log')
      expect(reports[1].message).toContain('console.warn')
      expect(reports[2].message).toContain('console.error')
      expect(reports[3].message).toContain('console.info')
      expect(reports[4].message).toContain('console.debug')
    })

    test('should report console.debug with spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'console' }, property: { type: 'Identifier', name: 'debug' } },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports).toHaveLength(1)
    })

    test('should not report when property is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports).toHaveLength(0)
    })
  })

  describe('additional meta checks', () => {
    test('should have testing category', () => {
      expect(noConsoleInTestsRule.meta.docs?.category).toBe('testing')
    })

    test('should have create as a function', () => {
      expect(typeof noConsoleInTestsRule.create).toBe('function')
    })
  })

  describe('callee object with non-Identifier types', () => {
    test('should not report when callee is an ArrowFunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] }, params: [] },
        arguments: [stringArg],
      })

      expect(reports).toHaveLength(0)
    })

    test('should not report when callee object is a FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'FunctionExpression', id: null, body: { type: 'BlockStatement', body: [] }, params: [] },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [stringArg],
      })

      expect(reports).toHaveLength(0)
    })

    test('should not report when callee object name is Console (capitalized)', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Console' },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [stringArg],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports).toHaveLength(0)
    })

    test('should report console.log when callee property is Identifier with name from CONSOLE_METHODS', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      })

      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBe('Unexpected console.log call in test')
    })

    test('should not report when property name is not in CONSOLE_METHODS set', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleInTestsRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'profile' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      })

      expect(reports).toHaveLength(0)
    })
  })
})
