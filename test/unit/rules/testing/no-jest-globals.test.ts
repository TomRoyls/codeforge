import { describe, test, expect, vi } from 'vitest'
import { noJestGlobalsRule } from '../../../../src/rules/testing/no-jest-globals.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.test.ts',
  source = 'describe("suite", () => {});',
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
const arrayArg = { type: 'ArrayExpression', elements: [] }

describe('no-jest-globals rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noJestGlobalsRule.meta.type).toBe('problem')
    })

    test('should have warn severity', () => {
      expect(noJestGlobalsRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(noJestGlobalsRule.meta.docs?.recommended).toBe(false)
    })

    test('should have testing category', () => {
      expect(noJestGlobalsRule.meta.docs?.category).toBe('testing')
    })

    test('should have correct description mentioning global', () => {
      expect(noJestGlobalsRule.meta.docs?.description).toContain('global')
    })

    test('should have correct description mentioning Jest', () => {
      expect(noJestGlobalsRule.meta.docs?.description).toContain('Jest')
    })

    test('should not have fixable property', () => {
      expect(noJestGlobalsRule.meta.fixable).toBeUndefined()
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noJestGlobalsRule.create(context)
      const visitor2 = noJestGlobalsRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })
  })

  describe('afterAll global detected', () => {
    test('should report afterAll() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('afterAll', [fnArg]))

      expect(reports.length).toBe(1)
    })

    test('should report message containing afterAll', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('afterAll', [fnArg]))

      expect(reports[0].message).toContain('afterAll')
    })

    test('should report message mentioning @jest/globals', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('afterAll', [fnArg]))

      expect(reports[0].message).toContain('@jest/globals')
    })

    test('should report message mentioning vitest', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('afterAll', [fnArg]))

      expect(reports[0].message).toContain('vitest')
    })
  })

  describe('afterEach global detected', () => {
    test('should report afterEach() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('afterEach', [fnArg]))

      expect(reports.length).toBe(1)
    })

    test('should report message containing afterEach', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('afterEach', [fnArg]))

      expect(reports[0].message).toContain('afterEach')
    })

    test('should report message mentioning @jest/globals', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('afterEach', [fnArg]))

      expect(reports[0].message).toContain('@jest/globals')
    })
  })

  describe('beforeAll global detected', () => {
    test('should report beforeAll() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('beforeAll', [fnArg]))

      expect(reports.length).toBe(1)
    })

    test('should report message containing beforeAll', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('beforeAll', [fnArg]))

      expect(reports[0].message).toContain('beforeAll')
    })

    test('should report message mentioning vitest', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('beforeAll', [fnArg]))

      expect(reports[0].message).toContain('vitest')
    })
  })

  describe('beforeEach global detected', () => {
    test('should report beforeEach() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('beforeEach', [fnArg]))

      expect(reports.length).toBe(1)
    })

    test('should report message containing beforeEach', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('beforeEach', [fnArg]))

      expect(reports[0].message).toContain('beforeEach')
    })

    test('should report with various arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('beforeEach', [stringArg, fnArg]))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beforeEach')
    })
  })

  describe('describe global detected', () => {
    test('should report describe() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('describe', [stringArg, fnArg]))

      expect(reports.length).toBe(1)
    })

    test('should report message containing describe', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('describe', [stringArg, fnArg]))

      expect(reports[0].message).toContain('describe')
    })

    test('should report message mentioning @jest/globals', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('describe', [stringArg, fnArg]))

      expect(reports[0].message).toContain('@jest/globals')
    })

    test('should report with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('describe', []))

      expect(reports.length).toBe(1)
    })
  })

  describe('expect global detected', () => {
    test('should report expect() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('expect', [stringArg]))

      expect(reports.length).toBe(1)
    })

    test('should report message containing expect', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('expect', [stringArg]))

      expect(reports[0].message).toContain('expect')
    })

    test('should report message mentioning vitest', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('expect', [stringArg]))

      expect(reports[0].message).toContain('vitest')
    })
  })

  describe('fdescribe global detected', () => {
    test('should report fdescribe() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('fdescribe', [stringArg, fnArg]))

      expect(reports.length).toBe(1)
    })

    test('should report message containing fdescribe', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('fdescribe', [stringArg, fnArg]))

      expect(reports[0].message).toContain('fdescribe')
    })

    test('should report with various arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('fdescribe', [stringArg, fnArg, numberArg]))

      expect(reports.length).toBe(1)
    })
  })

  describe('fit global detected', () => {
    test('should report fit() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('fit', [stringArg, fnArg]))

      expect(reports.length).toBe(1)
    })

    test('should report message containing fit', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('fit', [stringArg, fnArg]))

      expect(reports[0].message).toContain('fit')
    })

    test('should report message mentioning @jest/globals', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('fit', [stringArg, fnArg]))

      expect(reports[0].message).toContain('@jest/globals')
    })
  })

  describe('ftest global detected', () => {
    test('should report ftest() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('ftest', [stringArg, fnArg]))

      expect(reports.length).toBe(1)
    })

    test('should report message containing ftest', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('ftest', [stringArg, fnArg]))

      expect(reports[0].message).toContain('ftest')
    })

    test('should report with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('ftest', []))

      expect(reports.length).toBe(1)
    })
  })

  describe('it global detected', () => {
    test('should report it() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('it', [stringArg, fnArg]))

      expect(reports.length).toBe(1)
    })

    test('should report message containing it', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('it', [stringArg, fnArg]))

      expect(reports[0].message).toContain("'it'")
    })

    test('should report with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('it', []))

      expect(reports.length).toBe(1)
    })
  })

  describe('test global detected', () => {
    test('should report test() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('test', [stringArg, fnArg]))

      expect(reports.length).toBe(1)
    })

    test('should report message containing test', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('test', [stringArg, fnArg]))

      expect(reports[0].message).toContain('test')
    })

    test('should report with multiple arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('test', [stringArg, numberArg, fnArg]))

      expect(reports.length).toBe(1)
    })
  })

  describe('xdescribe global detected', () => {
    test('should report xdescribe() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('xdescribe', [stringArg, fnArg]))

      expect(reports.length).toBe(1)
    })

    test('should report message containing xdescribe', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('xdescribe', [stringArg, fnArg]))

      expect(reports[0].message).toContain('xdescribe')
    })

    test('should report with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('xdescribe', []))

      expect(reports.length).toBe(1)
    })
  })

  describe('xit global detected', () => {
    test('should report xit() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('xit', [stringArg, fnArg]))

      expect(reports.length).toBe(1)
    })

    test('should report message containing xit', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('xit', [stringArg, fnArg]))

      expect(reports[0].message).toContain('xit')
    })

    test('should report message mentioning @jest/globals', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('xit', [stringArg, fnArg]))

      expect(reports[0].message).toContain('@jest/globals')
    })
  })

  describe('xtest global detected', () => {
    test('should report xtest() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('xtest', [stringArg, fnArg]))

      expect(reports.length).toBe(1)
    })

    test('should report message containing xtest', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('xtest', [stringArg, fnArg]))

      expect(reports[0].message).toContain('xtest')
    })

    test('should report message mentioning vitest', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('xtest', [stringArg, fnArg]))

      expect(reports[0].message).toContain('vitest')
    })
  })

  describe('negative tests - member expressions not reported', () => {
    test('should not report jest.describe() member call', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createMemberCall('jest', 'describe', [stringArg, fnArg]))

      expect(reports.length).toBe(0)
    })

    test('should not report something.test() member call', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createMemberCall('something', 'test', [stringArg, fnArg]))

      expect(reports.length).toBe(0)
    })

    test('should not report obj.it() member call', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createMemberCall('obj', 'it', [stringArg, fnArg]))

      expect(reports.length).toBe(0)
    })

    test('should not report myFunc() - unknown identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('myFunc', [stringArg]))

      expect(reports.length).toBe(0)
    })

    test('should not report unknownFunction() - unknown identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('unknownFunction', [numberArg]))

      expect(reports.length).toBe(0)
    })

    test('should not report console.log() member call', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createMemberCall('console', 'log', [stringArg]))

      expect(reports.length).toBe(0)
    })

    test('should not report Array.from() member call', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createMemberCall('Array', 'from', [stringArg]))

      expect(reports.length).toBe(0)
    })

    test('should not report imported.describe() member call', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createMemberCall('imported', 'describe', [stringArg, fnArg]))

      expect(reports.length).toBe(0)
    })

    test('should not report wrapper.expect() member call', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createMemberCall('wrapper', 'expect', [stringArg]))

      expect(reports.length).toBe(0)
    })

    test('should not report runner.beforeEach() member call', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createMemberCall('runner', 'beforeEach', [fnArg]))

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression({ type: 'CallExpression', arguments: [] })

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'describe' },
        arguments: [stringArg],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle callee with null type', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: null, name: 'describe' },
        arguments: [stringArg],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression callee on global name', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'jest' },
          property: { type: 'Identifier', name: 'describe' },
        },
        arguments: [stringArg, fnArg],
      })

      expect(reports.length).toBe(0)
    })

    test('should report multiple calls in sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('describe', [stringArg, fnArg], 1, 0))
      visitor.CallExpression(createGlobalCall('it', [stringArg, fnArg], 2, 0))
      visitor.CallExpression(createGlobalCall('expect', [stringArg], 3, 0))

      expect(reports.length).toBe(3)
    })

    test('should report with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('describe', []))

      expect(reports.length).toBe(1)
    })

    test('should report with many arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('test', [stringArg, numberArg, fnArg, objectArg]))

      expect(reports.length).toBe(1)
    })

    test('should report with complex arguments (objects and arrays)', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('test', [objectArg, arrayArg]))

      expect(reports.length).toBe(1)
    })
  })

  describe('location reporting', () => {
    test('should report correct location for describe at line 5, column 8', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('describe', [stringArg, fnArg], 5, 8))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should report correct location for test at line 10, column 2', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('test', [stringArg, fnArg], 10, 2))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(2)
    })

    test('should report correct location for it at line 3, column 4', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('it', [stringArg, fnArg], 3, 4))

      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should include end location in report', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('expect', [stringArg], 1, 0))

      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(1)
    })
  })

  describe('report message content', () => {
    test('message starts with "Unexpected global"', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('describe', [stringArg, fnArg]))

      expect(reports[0].message).toContain('Unexpected global')
    })

    test('message contains the global name in quotes', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('beforeEach', [fnArg]))

      expect(reports[0].message).toContain("'beforeEach'")
    })

    test('message mentions import explicitly', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('afterAll', [fnArg]))

      expect(reports[0].message).toContain('Import it explicitly')
    })

    test('message does not use ESLint placeholder format', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('test', [stringArg, fnArg]))

      expect(reports[0].message).not.toContain('{{')
      expect(reports[0].message).not.toContain('}}')
    })
  })

  describe('all 14 globals detected', () => {
    const globals = [
      'afterAll', 'afterEach', 'beforeAll', 'beforeEach',
      'describe', 'expect', 'fdescribe', 'fit', 'ftest',
      'it', 'test', 'xdescribe', 'xit', 'xtest',
    ]

    test('should report all 14 Jest globals', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      for (const globalName of globals) {
        visitor.CallExpression(createGlobalCall(globalName, [stringArg]))
      }

      expect(reports.length).toBe(14)
    })

    test('should report each global with correct name in message', () => {
      for (const globalName of globals) {
        const { context, reports } = createMockContext()
        const visitor = noJestGlobalsRule.create(context)

        visitor.CallExpression(createGlobalCall(globalName, [stringArg]))

        expect(reports.length).toBe(1)
        expect(reports[0].message).toContain(globalName)
      }
    })
  })

  describe('mixed valid and invalid calls', () => {
    test('should only report global calls, not member calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('describe', [stringArg, fnArg], 1, 0))
      visitor.CallExpression(createMemberCall('jest', 'describe', [stringArg, fnArg], 2, 0))
      visitor.CallExpression(createGlobalCall('it', [stringArg, fnArg], 3, 0))

      expect(reports.length).toBe(2)
    })

    test('should maintain correct order of reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('describe', [stringArg], 10, 0))
      visitor.CallExpression(createGlobalCall('it', [stringArg], 20, 0))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[1].loc?.start.line).toBe(20)
    })

    test('should not report when callee is a MemberExpression with matching property name', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'someObj' },
            property: { type: 'Identifier', name: 'test' },
          },
          property: { type: 'Identifier', name: 'describe' },
        },
        arguments: [stringArg],
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('state isolation between visitors', () => {
    test('separate visitors have separate state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()

      const visitor1 = noJestGlobalsRule.create(ctx1)
      const visitor2 = noJestGlobalsRule.create(ctx2)

      visitor1.CallExpression(createGlobalCall('describe', [stringArg, fnArg]))
      visitor2.CallExpression(createMemberCall('jest', 'describe', [stringArg, fnArg]))

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noJestGlobalsRule.create(context)

      visitor.CallExpression(createGlobalCall('describe', [stringArg], 1, 0))
      visitor.CallExpression(createGlobalCall('it', [stringArg], 2, 0))
      visitor.CallExpression(createGlobalCall('test', [stringArg], 3, 0))
      visitor.CallExpression(createGlobalCall('expect', [stringArg], 4, 0))

      expect(reports.length).toBe(4)
    })
  })

  describe('default export', () => {
    test('rule should be the default export', () => {
      expect(noJestGlobalsRule).toBeDefined()
      expect(noJestGlobalsRule.meta).toBeDefined()
      expect(noJestGlobalsRule.create).toBeDefined()
    })
  })

  // SECTION: additional coverage
  test('meta schema should be empty array', () => {
    expect(noJestGlobalsRule.meta.schema).toEqual([])
  })

  test('should report afterAll with string description and function callback', () => {
    const { context, reports } = createMockContext()
    const visitor = noJestGlobalsRule.create(context)

    visitor.CallExpression(createGlobalCall('afterAll', [stringArg, fnArg]))

    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('afterAll')
  })

  test('should report xit with no arguments', () => {
    const { context, reports } = createMockContext()
    const visitor = noJestGlobalsRule.create(context)

    visitor.CallExpression(createGlobalCall('xit', []))

    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('xit')
  })

  test('should report ftest message mentioning vitest', () => {
    const { context, reports } = createMockContext()
    const visitor = noJestGlobalsRule.create(context)

    visitor.CallExpression(createGlobalCall('ftest', [stringArg, fnArg]))

    expect(reports[0].message).toContain('vitest')
  })
})
