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

  describe('describe.skip with async callback', () => {
    test('should report describe.skip with async arrow callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'describe' },
          property: { type: 'Identifier', name: 'skip' },
        },
        arguments: [
          { type: 'Literal', value: 'suite name' },
          { type: 'ArrowFunctionExpression', async: true, body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('async test suite')
    })

    test('should not report describe.skip with sync arrow callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'describe' },
          property: { type: 'Identifier', name: 'skip' },
        },
        arguments: [
          { type: 'Literal', value: 'suite name' },
          { type: 'ArrowFunctionExpression', async: false, body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 35 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('context.only and context.skip with async callback', () => {
    test('should report context.only with async callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'context' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [
          { type: 'Literal', value: 'suite name' },
          { type: 'ArrowFunctionExpression', async: true, body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report context.skip with async callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'context' },
          property: { type: 'Identifier', name: 'skip' },
        },
        arguments: [
          { type: 'Literal', value: 'suite name' },
          { type: 'ArrowFunctionExpression', async: true, body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('suite.only and suite.skip with async callback', () => {
    test('should report suite.only with async callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'suite' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [
          { type: 'Literal', value: 'suite name' },
          { type: 'ArrowFunctionExpression', async: true, body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report suite.skip with async callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'suite' },
          property: { type: 'Identifier', name: 'skip' },
        },
        arguments: [
          { type: 'Literal', value: 'suite name' },
          { type: 'ArrowFunctionExpression', async: true, body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('async function expression with context/suite', () => {
    test('should report context with async function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'context' },
        arguments: [
          { type: 'Literal', value: 'suite name' },
          { type: 'FunctionExpression', async: true, id: null, body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report suite with async function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'suite' },
        arguments: [
          { type: 'Literal', value: 'suite name' },
          { type: 'FunctionExpression', async: true, id: null, body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report context with sync function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'context' },
        arguments: [
          { type: 'Literal', value: 'suite name' },
          { type: 'FunctionExpression', async: false, id: null, body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 35 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('non-describe functions with async callbacks', () => {
    test('should not report async test() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'test' },
        arguments: [
          { type: 'Literal', value: 'test name' },
          { type: 'ArrowFunctionExpression', async: true, body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report async beforeEach() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [
          { type: 'ArrowFunctionExpression', async: true, body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report async afterEach() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'afterEach' },
        arguments: [
          { type: 'ArrowFunctionExpression', async: true, body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('report message content', () => {
    test('message mentions async test suite', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)
      visitor.CallExpression(createDescribeAsyncArrow())

      expect(reports[0].message).toBe('Unexpected async test suite. Use async test cases within the suite instead.')
    })

    test('report includes node reference', () => {
      const { context } = createMockContext()
      let reportedNode: unknown = null
      const ctx = {
        ...context,
        report: (descriptor: { message: string; node?: unknown }) => {
          reportedNode = descriptor.node
        },
      } as unknown as RuleContext
      const visitor = noAsyncSuiteRule.create(ctx)
      const node = createDescribeAsyncArrow()
      visitor.CallExpression(node)

      expect(reportedNode).toBe(node)
    })
  })

  describe('mixed calls in sequence', () => {
    test('should report only async describe, not sync or test', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      visitor.CallExpression(createDescribeSyncArrow())
      visitor.CallExpression(createDescribeAsyncArrow())
      visitor.CallExpression(createNormalIt())

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })
  })

  describe('describe.only/skip with async function expression', () => {
    test('should report describe.only with async function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'describe' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [
          { type: 'Literal', value: 'suite name' },
          { type: 'FunctionExpression', async: true, id: null, body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 45 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('async test suite')
    })

    test('should report describe.skip with async function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'describe' },
          property: { type: 'Identifier', name: 'skip' },
        },
        arguments: [
          { type: 'Literal', value: 'suite name' },
          { type: 'FunctionExpression', async: true, id: null, body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 45 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report describe.only with sync function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'describe' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [
          { type: 'Literal', value: 'suite name' },
          { type: 'FunctionExpression', async: false, id: null, body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report describe.skip with sync function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'describe' },
          property: { type: 'Identifier', name: 'skip' },
        },
        arguments: [
          { type: 'Literal', value: 'suite name' },
          { type: 'FunctionExpression', async: false, id: null, body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('context.only/skip with function expression', () => {
    test('should report context.only with async function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'context' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [
          { type: 'Literal', value: 'suite name' },
          { type: 'FunctionExpression', async: true, id: null, body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 45 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report context.skip with async function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'context' },
          property: { type: 'Identifier', name: 'skip' },
        },
        arguments: [
          { type: 'Literal', value: 'suite name' },
          { type: 'FunctionExpression', async: true, id: null, body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 45 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report context.only with sync arrow callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'context' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [
          { type: 'Literal', value: 'suite name' },
          { type: 'ArrowFunctionExpression', async: false, body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 35 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report context.skip with sync arrow callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'context' },
          property: { type: 'Identifier', name: 'skip' },
        },
        arguments: [
          { type: 'Literal', value: 'suite name' },
          { type: 'ArrowFunctionExpression', async: false, body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 35 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('suite.only/skip with function expression', () => {
    test('should report suite.only with async function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'suite' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [
          { type: 'Literal', value: 'suite name' },
          { type: 'FunctionExpression', async: true, id: null, body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 45 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report suite.skip with async function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'suite' },
          property: { type: 'Identifier', name: 'skip' },
        },
        arguments: [
          { type: 'Literal', value: 'suite name' },
          { type: 'FunctionExpression', async: true, id: null, body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 45 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report suite.only with sync arrow callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'suite' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [
          { type: 'Literal', value: 'suite name' },
          { type: 'ArrowFunctionExpression', async: false, body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 35 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report suite.skip with sync arrow callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'suite' },
          property: { type: 'Identifier', name: 'skip' },
        },
        arguments: [
          { type: 'Literal', value: 'suite name' },
          { type: 'ArrowFunctionExpression', async: false, body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 35 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('three-argument describe calls', () => {
    test('should report when last argument is async arrow (3 args)', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'describe' },
        arguments: [
          { type: 'Literal', value: 'suite name' },
          { type: 'Literal', value: 'extra arg' },
          { type: 'ArrowFunctionExpression', async: true, body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report when last argument is sync in 3-arg call', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'describe' },
        arguments: [
          { type: 'Literal', value: 'suite name' },
          { type: 'Literal', value: 'extra arg' },
          { type: 'ArrowFunctionExpression', async: false, body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 45 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when last argument is not a function', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'describe' },
        arguments: [
          { type: 'Literal', value: 'suite name' },
          { type: 'Literal', value: 'not a function' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('fdescribe and xdescribe are not flagged', () => {
    test('should not report fdescribe with async callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fdescribe' },
        arguments: [
          { type: 'Literal', value: 'suite name' },
          { type: 'ArrowFunctionExpression', async: true, body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report xdescribe with async callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'xdescribe' },
        arguments: [
          { type: 'Literal', value: 'suite name' },
          { type: 'ArrowFunctionExpression', async: true, body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('non-function describe arguments', () => {
    test('should handle describe with single argument (no callback)', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'describe' },
        arguments: [{ type: 'Literal', value: 'suite name' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle describe with numeric last argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'describe' },
        arguments: [
          { type: 'Literal', value: 'suite name' },
          { type: 'Literal', value: 42 },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle describe with object last argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'describe' },
        arguments: [
          { type: 'Literal', value: 'suite name' },
          { type: 'ObjectExpression', properties: [] },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle describe with string last argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'describe' },
        arguments: [
          { type: 'Literal', value: 'suite name' },
          { type: 'Literal', value: 'callback string' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle callee as nested MemberExpression (describe.only.each)', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'describe' },
            property: { type: 'Identifier', name: 'only' },
          },
          property: { type: 'Identifier', name: 'each' },
        },
        arguments: [
          { type: 'Literal', value: 'suite name' },
          { type: 'ArrowFunctionExpression', async: true, body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report async callback in non-describe call', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'someFunction' },
        arguments: [
          { type: 'Literal', value: 'name' },
          { type: 'ArrowFunctionExpression', async: true, body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with callee as non-Identifier non-MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
        arguments: [
          { type: 'Literal', value: 'name' },
          { type: 'ArrowFunctionExpression', async: true, body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle describe.each with sync callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: { type: 'Identifier', name: 'describe' },
              property: { type: 'Identifier', name: 'each' },
            },
            arguments: [[1, 2]],
          },
          property: { type: 'Identifier', name: 'call' },
        },
        arguments: [
          { type: 'Literal', value: 'suite' },
          { type: 'ArrowFunctionExpression', async: false, body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report same message for all describe function aliases', () => {
      const { context: ctx1, reports: r1 } = createMockContext()
      const { context: ctx2, reports: r2 } = createMockContext()
      const { context: ctx3, reports: r3 } = createMockContext()

      noAsyncSuiteRule.create(ctx1).CallExpression(createDescribeAsyncArrow())
      noAsyncSuiteRule.create(ctx2).CallExpression(createContextAsyncArrow())
      noAsyncSuiteRule.create(ctx3).CallExpression(createSuiteAsyncArrow())

      expect(r1[0].message).toBe(r2[0].message)
      expect(r2[0].message).toBe(r3[0].message)
    })

    test('should handle member expression with non-identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'describe' },
          property: { type: 'Identifier', name: 'call' },
        },
        arguments: [
          { type: 'Literal', value: 'suite name' },
          { type: 'ArrowFunctionExpression', async: true, body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle multiple sequential describe calls independently', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      visitor.CallExpression(createDescribeAsyncArrow(1, 0))
      visitor.CallExpression(createDescribeSyncArrow(2, 0))
      visitor.CallExpression(createDescribeAsyncArrow(3, 0))

      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(3)
    })

    test('should not crash with arguments as non-array', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'describe' },
        arguments: 'not-an-array',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('suite() function', () => {
    test('should report async suite() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'suite' },
        arguments: [
          { type: 'Literal', value: 'my suite' },
          {
            type: 'ArrowFunctionExpression',
            async: true,
            body: { type: 'BlockStatement', body: [] },
            params: [],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('suite')
    })

    test('should not report non-async suite() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'suite' },
        arguments: [
          { type: 'Literal', value: 'my suite' },
          {
            type: 'ArrowFunctionExpression',
            async: false,
            body: { type: 'BlockStatement', body: [] },
            params: [],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('additional verification', () => {
    test('should have create function returning visitor', () => {
      const { context } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)
      expect(visitor).toBeDefined()
      expect(typeof visitor).toBe('object')
    })
  })

  describe('describe.each with deeper nesting', () => {
    test('should not report describe.each().only() with async callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: {
                type: 'CallExpression',
                callee: {
                  type: 'MemberExpression',
                  object: { type: 'Identifier', name: 'describe' },
                  property: { type: 'Identifier', name: 'each' },
                },
                arguments: [[1]],
              },
              property: { type: 'Identifier', name: 'only' },
            },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'call' },
        },
        arguments: [
          { type: 'Literal', value: 'suite' },
          { type: 'ArrowFunctionExpression', async: true, body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 60 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('describe with callback as first argument (no title)', () => {
    test('should report async arrow function as first argument to describe', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'describe' },
        arguments: [
          { type: 'ArrowFunctionExpression', async: true, body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('async test suite')
    })

    test('should not report sync arrow function as first argument to describe', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'describe' },
        arguments: [
          { type: 'ArrowFunctionExpression', async: false, body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('mixed describe variants in sequence', () => {
    test('should report context and suite async variants in same visitor', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      visitor.CallExpression(createContextAsyncArrow(1, 0))
      visitor.CallExpression(createSuiteAsyncArrow(3, 0))
      visitor.CallExpression(createDescribeSyncArrow(5, 0))

      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(3)
    })
  })

  describe('non-async FunctionExpression with async omitted', () => {
    test('should not report FunctionExpression without async property', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSuiteRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'describe' },
        arguments: [
          { type: 'Literal', value: 'suite' },
          { type: 'FunctionExpression', id: null, body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })
})
