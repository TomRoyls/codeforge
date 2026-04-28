import { describe, test, expect, vi } from 'vitest'
import { noAsyncSuiteRule } from '../../../../src/rules/testing/no-async-suite.js'
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

function createDescribeAsyncArrow(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'describe' },
    arguments: [
      { type: 'Literal', value: 'suite name' },
      { type: 'ArrowFunctionExpression', async: true, body: { type: 'BlockStatement' } },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 35 },
    },
  }
}

function createDescribeSyncArrow(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'describe' },
    arguments: [
      { type: 'Literal', value: 'suite name' },
      { type: 'ArrowFunctionExpression', async: false, body: { type: 'BlockStatement' } },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function createDescribeAsyncFunction(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'describe' },
    arguments: [
      { type: 'Literal', value: 'suite name' },
      { type: 'FunctionExpression', async: true, id: null, body: { type: 'BlockStatement' } },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 40 },
    },
  }
}

function createDescribeSyncFunction(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'describe' },
    arguments: [
      { type: 'Literal', value: 'suite name' },
      { type: 'FunctionExpression', async: false, id: null, body: { type: 'BlockStatement' } },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 35 },
    },
  }
}

function createContextAsyncArrow(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'context' },
    arguments: [
      { type: 'Literal', value: 'suite name' },
      { type: 'ArrowFunctionExpression', async: true, body: { type: 'BlockStatement' } },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 33 },
    },
  }
}

function createContextSyncArrow(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'context' },
    arguments: [
      { type: 'Literal', value: 'suite name' },
      { type: 'ArrowFunctionExpression', async: false, body: { type: 'BlockStatement' } },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 28 },
    },
  }
}

function createSuiteAsyncArrow(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'suite' },
    arguments: [
      { type: 'Literal', value: 'suite name' },
      { type: 'ArrowFunctionExpression', async: true, body: { type: 'BlockStatement' } },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function createSuiteSyncArrow(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'suite' },
    arguments: [
      { type: 'Literal', value: 'suite name' },
      { type: 'ArrowFunctionExpression', async: false, body: { type: 'BlockStatement' } },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 25 },
    },
  }
}

function createDescribeOnlyAsyncArrow(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'describe' },
      property: { type: 'Identifier', name: 'only' },
    },
    arguments: [
      { type: 'Literal', value: 'suite name' },
      { type: 'ArrowFunctionExpression', async: true, body: { type: 'BlockStatement' } },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 40 },
    },
  }
}

function createDescribeOnlySyncArrow(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'describe' },
      property: { type: 'Identifier', name: 'only' },
    },
    arguments: [
      { type: 'Literal', value: 'suite name' },
      { type: 'ArrowFunctionExpression', async: false, body: { type: 'BlockStatement' } },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 35 },
    },
  }
}

function createDescribeEachAsyncArrow(): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'describe' },
        property: { type: 'Identifier', name: 'each' },
      },
      arguments: [{ type: 'ArrayExpression', elements: [] }],
    },
    arguments: [
      { type: 'Literal', value: 'suite name' },
      { type: 'ArrowFunctionExpression', async: true, body: { type: 'BlockStatement' } },
    ],
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 50 },
    },
  }
}

function createNormalIt(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'it' },
    arguments: [
      { type: 'Literal', value: 'test name' },
      { type: 'ArrowFunctionExpression', async: true, body: { type: 'BlockStatement' } },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createUnrelatedCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'console' },
    arguments: [{ type: 'Literal', value: 'log' }],
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

describe('no-async-suite rule', () => {
  describe('meta', () => {
    test('should have correct rule type', () => {
      expect(noAsyncSuiteRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noAsyncSuiteRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(noAsyncSuiteRule.meta.docs?.recommended).toBe(false)
    })

    test('should have correct category', () => {
      expect(noAsyncSuiteRule.meta.docs?.category).toBe('testing')
    })

    test('should have schema defined', () => {
      expect(noAsyncSuiteRule.meta.schema).toBeDefined()
    })

    test('should have correct description mentioning async', () => {
      expect(noAsyncSuiteRule.meta.docs?.description.toLowerCase()).toContain('async')
    })

    test('should have correct description mentioning test suites', () => {
      const desc = noAsyncSuiteRule.meta.docs?.description.toLowerCase() ?? ''
      expect(desc.includes('suite') || desc.includes('describe')).toBe(true)
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return a function for CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)
      expect(typeof visitor.CallExpression).toBe('function')
    })
  })

  describe('detecting async describe with arrow function', () => {
    test('should report async describe with arrow callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      visitor.CallExpression(createDescribeAsyncArrow())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('async test suite')
    })

    test('should report correct location for async describe', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      visitor.CallExpression(createDescribeAsyncArrow(5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report correct end location for async describe', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      visitor.CallExpression(createDescribeAsyncArrow(3, 8))

      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(43)
    })
  })

  describe('detecting async describe with function expression', () => {
    test('should report async describe with function expression callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      visitor.CallExpression(createDescribeAsyncFunction())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('async test suite')
    })
  })

  describe('detecting async context with arrow function', () => {
    test('should report async context with arrow callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      visitor.CallExpression(createContextAsyncArrow())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('async test suite')
    })
  })

  describe('detecting async suite with arrow function', () => {
    test('should report async suite with arrow callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      visitor.CallExpression(createSuiteAsyncArrow())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('async test suite')
    })
  })

  describe('NOT flagging non-async suites', () => {
    test('should not report sync describe with arrow callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      visitor.CallExpression(createDescribeSyncArrow())

      expect(reports.length).toBe(0)
    })

    test('should not report sync describe with function expression callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      visitor.CallExpression(createDescribeSyncFunction())

      expect(reports.length).toBe(0)
    })

    test('should not report sync context with arrow callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      visitor.CallExpression(createContextSyncArrow())

      expect(reports.length).toBe(0)
    })

    test('should not report sync suite with arrow callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      visitor.CallExpression(createSuiteSyncArrow())

      expect(reports.length).toBe(0)
    })

    test('should not report async it() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      visitor.CallExpression(createNormalIt())

      expect(reports.length).toBe(0)
    })

    test('should not report unrelated function calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      visitor.CallExpression(createUnrelatedCall())

      expect(reports.length).toBe(0)
    })
  })

  describe('describe.only with async callback', () => {
    test('should report describe.only with async arrow callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      visitor.CallExpression(createDescribeOnlyAsyncArrow())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('async test suite')
    })

    test('should not report describe.only with sync arrow callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      visitor.CallExpression(createDescribeOnlySyncArrow())

      expect(reports.length).toBe(0)
    })
  })

  describe('describe.each should be skipped', () => {
    test('should not report describe.each with async callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      visitor.CallExpression(createDescribeEachAsyncArrow())

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle node without arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'describe' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      const node = { type: 'CallExpression', arguments: [] }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty arguments array', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'describe' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'describe' },
        arguments: [
          { type: 'Literal', value: 'test' },
          { type: 'ArrowFunctionExpression', async: true, body: { type: 'BlockStatement' } },
        ],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle non-CallExpression types', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      expect(() => visitor.CallExpression({ type: 'Literal', value: 42 })).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle member expression with non-Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'CallExpression' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [
          { type: 'Literal', value: 'test' },
          { type: 'ArrowFunctionExpression', async: true, body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle member expression with non-describe object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'foo' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [
          { type: 'Literal', value: 'test' },
          { type: 'ArrowFunctionExpression', async: true, body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-async callback (async undefined)', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'describe' },
        arguments: [
          { type: 'Literal', value: 'test' },
          { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('multiple async suites in one file', () => {
    test('should report each async suite independently', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      visitor.CallExpression(createDescribeAsyncArrow(1, 0))
      visitor.CallExpression(createDescribeAsyncArrow(5, 0))
      visitor.CallExpression(createDescribeAsyncArrow(10, 0))

      expect(reports.length).toBe(3)
    })

    test('should report correct lines for multiple violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      visitor.CallExpression(createDescribeAsyncArrow(1, 0))
      visitor.CallExpression(createDescribeAsyncArrow(5, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
    })
  })

  describe('independent visitor instances', () => {
    test('should return independent visitors for different contexts', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noAsyncSuiteRule.create(ctx1)
      const visitor2 = noAsyncSuiteRule.create(ctx2)

      visitor1.CallExpression(createDescribeAsyncArrow())
      visitor2.CallExpression(createDescribeAsyncArrow())

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(1)
    })
  })

  describe('rule meta expanded', () => {
    test('should have a docs.url property', () => {
      expect(noAsyncSuiteRule.meta.docs?.url).toBeDefined()
    })

    test('should have docs.url containing github', () => {
      expect(noAsyncSuiteRule.meta.docs?.url).toContain('github.com')
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(noAsyncSuiteRule.meta.schema)).toBe(true)
    })

    test('should have empty schema', () => {
      expect(noAsyncSuiteRule.meta.schema).toHaveLength(0)
    })

    test('should have meta as a plain object', () => {
      expect(typeof noAsyncSuiteRule.meta).toBe('object')
      expect(noAsyncSuiteRule.meta).not.toBeNull()
      expect(Array.isArray(noAsyncSuiteRule.meta)).toBe(false)
    })
  })
})
