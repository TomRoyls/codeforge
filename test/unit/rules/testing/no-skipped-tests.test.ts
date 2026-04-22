import { describe, test, expect, vi } from 'vitest'
import { noSkippedTestsRule } from '../../../../src/rules/testing/no-skipped-tests.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.test.ts',
  source = 'it("test", () => {});',
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

function createItSkip(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'it' },
      property: { type: 'Identifier', name: 'skip' },
    },
    arguments: [{ type: 'Literal', value: 'skipped test' }],
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createTestSkip(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'test' },
      property: { type: 'Identifier', name: 'skip' },
    },
    arguments: [{ type: 'Literal', value: 'skipped test' }],
    loc: {
      start: { line, column },
      end: { line, column: column + 22 },
    },
  }
}

function createDescribeSkip(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'describe' },
      property: { type: 'Identifier', name: 'skip' },
    },
    arguments: [{ type: 'Literal', value: 'skipped suite' }],
    loc: {
      start: { line, column },
      end: { line, column: column + 25 },
    },
  }
}

function createItOnly(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'it' },
      property: { type: 'Identifier', name: 'only' },
    },
    arguments: [{ type: 'Literal', value: 'focused test' }],
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createTestOnly(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'test' },
      property: { type: 'Identifier', name: 'only' },
    },
    arguments: [{ type: 'Literal', value: 'focused test' }],
    loc: {
      start: { line, column },
      end: { line, column: column + 22 },
    },
  }
}

function createDescribeOnly(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'describe' },
      property: { type: 'Identifier', name: 'only' },
    },
    arguments: [{ type: 'Literal', value: 'focused suite' }],
    loc: {
      start: { line, column },
      end: { line, column: column + 25 },
    },
  }
}

function createXit(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'xit' },
    arguments: [{ type: 'Literal', value: 'skipped test' }],
    loc: {
      start: { line, column },
      end: { line, column: column + 18 },
    },
  }
}

function createXtest(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'xtest' },
    arguments: [{ type: 'Literal', value: 'skipped test' }],
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createXdescribe(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'xdescribe' },
    arguments: [{ type: 'Literal', value: 'skipped suite' }],
    loc: {
      start: { line, column },
      end: { line, column: column + 23 },
    },
  }
}

function createNormalIt(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'it' },
    arguments: [{ type: 'Literal', value: 'normal test' }],
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createNormalTest(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'test' },
    arguments: [{ type: 'Literal', value: 'normal test' }],
    loc: {
      start: { line, column },
      end: { line, column: column + 17 },
    },
  }
}

function createNormalDescribe(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'describe' },
    arguments: [{ type: 'Literal', value: 'normal suite' }],
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

describe('no-skipped-tests rule', () => {
  describe('meta', () => {
    test('should have correct rule type', () => {
      expect(noSkippedTestsRule.meta.type).toBe('problem')
    })

    test('should have warn severity', () => {
      expect(noSkippedTestsRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noSkippedTestsRule.meta.docs?.recommended).toBe(true)
    })

    test('should have correct category', () => {
      expect(noSkippedTestsRule.meta.docs?.category).toBe('testing')
    })

    test('should have schema defined', () => {
      expect(noSkippedTestsRule.meta.schema).toBeDefined()
    })

    test('should have correct description mentioning skipped tests', () => {
      expect(noSkippedTestsRule.meta.docs?.description.toLowerCase()).toContain('skipped')
    })

    test('should have correct description mentioning focused tests', () => {
      expect(noSkippedTestsRule.meta.docs?.description.toLowerCase()).toContain('focused')
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })
  })

  describe('detecting it.skip', () => {
    test('should report it.skip() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)

      visitor.CallExpression(createItSkip())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('it.skip')
    })

    test('should report correct location for it.skip', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)

      visitor.CallExpression(createItSkip(5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })
  })

  describe('detecting test.skip', () => {
    test('should report test.skip() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)

      visitor.CallExpression(createTestSkip())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('test.skip')
    })
  })

  describe('detecting describe.skip', () => {
    test('should report describe.skip() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)

      visitor.CallExpression(createDescribeSkip())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('describe.skip')
    })
  })

  describe('detecting it.only', () => {
    test('should report it.only() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)

      visitor.CallExpression(createItOnly())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('it.only')
    })
  })

  describe('detecting test.only', () => {
    test('should report test.only() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)

      visitor.CallExpression(createTestOnly())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('test.only')
    })
  })

  describe('detecting describe.only', () => {
    test('should report describe.only() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)

      visitor.CallExpression(createDescribeOnly())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('describe.only')
    })
  })

  describe('detecting xit', () => {
    test('should report xit() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)

      visitor.CallExpression(createXit())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('xit')
    })
  })

  describe('detecting xtest', () => {
    test('should report xtest() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)

      visitor.CallExpression(createXtest())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('xtest')
    })
  })

  describe('detecting xdescribe', () => {
    test('should report xdescribe() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)

      visitor.CallExpression(createXdescribe())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('xdescribe')
    })
  })

  describe('NOT flagging normal tests', () => {
    test('should not report normal it() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)

      visitor.CallExpression(createNormalIt())

      expect(reports.length).toBe(0)
    })

    test('should not report normal test() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)

      visitor.CallExpression(createNormalTest())

      expect(reports.length).toBe(0)
    })

    test('should not report normal describe() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)

      visitor.CallExpression(createNormalDescribe())

      expect(reports.length).toBe(0)
    })

    test('should not report unrelated function calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)

      visitor.CallExpression(createUnrelatedCall())

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'it' },
          property: { type: 'Identifier', name: 'skip' },
        },
        arguments: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)

      const node = { type: 'CallExpression', arguments: [] }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle member expression without property', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'it' },
        },
        arguments: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle member expression with non-Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'CallExpression' },
          property: { type: 'Identifier', name: 'skip' },
        },
        arguments: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not flag other member expression methods', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'it' },
          property: { type: 'Identifier', name: 'todo' },
        },
        arguments: [],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not flag x-prefix on non-test functions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'xrandom' },
        arguments: [],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('options: allowSkipOnly', () => {
    test('should not report it.skip when allowSkipOnly is true', () => {
      const { context, reports } = createMockContext({ allowSkipOnly: true })
      const visitor = noSkippedTestsRule.create(context)

      visitor.CallExpression(createItSkip())

      expect(reports.length).toBe(0)
    })

    test('should not report test.skip when allowSkipOnly is true', () => {
      const { context, reports } = createMockContext({ allowSkipOnly: true })
      const visitor = noSkippedTestsRule.create(context)

      visitor.CallExpression(createTestSkip())

      expect(reports.length).toBe(0)
    })

    test('should not report describe.skip when allowSkipOnly is true', () => {
      const { context, reports } = createMockContext({ allowSkipOnly: true })
      const visitor = noSkippedTestsRule.create(context)

      visitor.CallExpression(createDescribeSkip())

      expect(reports.length).toBe(0)
    })

    test('should not report it.only when allowSkipOnly is true', () => {
      const { context, reports } = createMockContext({ allowSkipOnly: true })
      const visitor = noSkippedTestsRule.create(context)

      visitor.CallExpression(createItOnly())

      expect(reports.length).toBe(0)
    })

    test('should not report test.only when allowSkipOnly is true', () => {
      const { context, reports } = createMockContext({ allowSkipOnly: true })
      const visitor = noSkippedTestsRule.create(context)

      visitor.CallExpression(createTestOnly())

      expect(reports.length).toBe(0)
    })

    test('should not report describe.only when allowSkipOnly is true', () => {
      const { context, reports } = createMockContext({ allowSkipOnly: true })
      const visitor = noSkippedTestsRule.create(context)

      visitor.CallExpression(createDescribeOnly())

      expect(reports.length).toBe(0)
    })

    test('should still report xit when allowSkipOnly is true', () => {
      const { context, reports } = createMockContext({ allowSkipOnly: true })
      const visitor = noSkippedTestsRule.create(context)

      visitor.CallExpression(createXit())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('xit')
    })

    test('should still report xtest when allowSkipOnly is true', () => {
      const { context, reports } = createMockContext({ allowSkipOnly: true })
      const visitor = noSkippedTestsRule.create(context)

      visitor.CallExpression(createXtest())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('xtest')
    })

    test('should still report xdescribe when allowSkipOnly is true', () => {
      const { context, reports } = createMockContext({ allowSkipOnly: true })
      const visitor = noSkippedTestsRule.create(context)

      visitor.CallExpression(createXdescribe())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('xdescribe')
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noSkippedTestsRule.create(context)

      visitor.CallExpression(createItSkip())

      expect(reports.length).toBe(1)
    })

    test('should handle undefined options', () => {
      const context: RuleContext = {
        report: vi.fn(),
        getFilePath: () => '/src/file.test.ts',
        getAST: () => null,
        getSource: () => 'it("test", () => {});',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noSkippedTestsRule.create(context)

      expect(() => visitor.CallExpression(createItSkip())).not.toThrow()
    })
  })

  describe('rule meta expanded', () => {
    test('should have a docs.url property', () => {
      expect(noSkippedTestsRule.meta.docs?.url).toBeDefined()
    })

    test('should have docs.url as a string', () => {
      expect(typeof noSkippedTestsRule.meta.docs?.url).toBe('string')
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(noSkippedTestsRule.meta.schema)).toBe(true)
    })

    test('should have schema with one entry', () => {
      expect(noSkippedTestsRule.meta.schema).toHaveLength(1)
    })

    test('should have schema entry with type object', () => {
      const schema = noSkippedTestsRule.meta.schema[0] as Record<string, unknown>
      expect(schema.type).toBe('object')
    })

    test('should have schema with allowSkipOnly property', () => {
      const schema = noSkippedTestsRule.meta.schema[0] as Record<string, unknown>
      const properties = schema.properties as Record<string, unknown>
      expect(properties).toHaveProperty('allowSkipOnly')
    })

    test('should have allowSkipOnly default of false', () => {
      const schema = noSkippedTestsRule.meta.schema[0] as Record<string, unknown>
      const properties = schema.properties as Record<string, Record<string, unknown>>
      expect(properties.allowSkipOnly.default).toBe(false)
    })

    test('should have allowSkipOnly type boolean', () => {
      const schema = noSkippedTestsRule.meta.schema[0] as Record<string, unknown>
      const properties = schema.properties as Record<string, Record<string, unknown>>
      expect(properties.allowSkipOnly.type).toBe('boolean')
    })

    test('should have additionalProperties set to false in schema', () => {
      const schema = noSkippedTestsRule.meta.schema[0] as Record<string, unknown>
      expect(schema.additionalProperties).toBe(false)
    })

    test('should have meta as a plain object', () => {
      expect(typeof noSkippedTestsRule.meta).toBe('object')
      expect(noSkippedTestsRule.meta).not.toBeNull()
      expect(Array.isArray(noSkippedTestsRule.meta)).toBe(false)
    })
  })

  describe('create function', () => {
    test('should return a visitor with exactly CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      expect(Object.keys(visitor)).toEqual(['CallExpression'])
    })

    test('should return a function for CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('should return independent visitors for different contexts', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noSkippedTestsRule.create(ctx1)
      const visitor2 = noSkippedTestsRule.create(ctx2)

      visitor1.CallExpression(createItSkip())
      visitor2.CallExpression(createItSkip())

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(1)
    })

    test('should accept context without throwing', () => {
      const { context } = createMockContext()
      expect(() => noSkippedTestsRule.create(context)).not.toThrow()
    })

    test('should create visitor that handles CallExpression without callee type', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = { type: 'CallExpression', callee: { type: 'UnknownType' } }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should create visitor that handles non-CallExpression types', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      expect(() => visitor.CallExpression({ type: 'Literal', value: 42 })).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('detecting it.skip expanded', () => {
    test('should report it.skip at default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createItSkip())
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report it.skip at custom location line 10 column 5', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createItSkip(10, 5))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report it.skip at large line number', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createItSkip(500, 0))
      expect(reports[0].loc?.start.line).toBe(500)
    })

    test('should report it.skip with correct end location', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createItSkip(3, 8))
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(28)
    })

    test('should report exactly one violation for it.skip', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createItSkip())
      expect(reports.length).toBe(1)
    })

    test('should include "Unexpected use" in it.skip message', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createItSkip())
      expect(reports[0].message).toContain('Unexpected use')
    })

    test('should include full message template for it.skip', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createItSkip())
      expect(reports[0].message).toBe(
        "Unexpected use of 'it.skip'. Skipped or focused tests can hide issues and cause inconsistent test runs.",
      )
    })

    test('should report it.skip with arguments present', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'it' },
          property: { type: 'Identifier', name: 'skip' },
        },
        arguments: [
          { type: 'Literal', value: 'skipped' },
          { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should detect it.skip at column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createItSkip(1, 0))
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should detect it.skip at non-zero column', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createItSkip(2, 15))
      expect(reports[0].loc?.start.column).toBe(15)
    })

    test('should report it.skip with location object', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createItSkip())
      expect(reports[0].loc).toBeDefined()
      expect(typeof reports[0].loc?.start.line).toBe('number')
      expect(typeof reports[0].loc?.start.column).toBe('number')
    })

    test('should report it.skip message containing it.skip reason', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createItSkip())
      expect(reports[0].message).toContain('it.skip')
    })
  })

  describe('detecting test.skip expanded', () => {
    test('should report test.skip at default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createTestSkip())
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report test.skip at custom location', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createTestSkip(15, 4))
      expect(reports[0].loc?.start.line).toBe(15)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should report test.skip with correct end location', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createTestSkip(7, 2))
      expect(reports[0].loc?.end.line).toBe(7)
      expect(reports[0].loc?.end.column).toBe(24)
    })

    test('should report exactly one violation for test.skip', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createTestSkip())
      expect(reports.length).toBe(1)
    })

    test('should include "Unexpected use" in test.skip message', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createTestSkip())
      expect(reports[0].message).toContain('Unexpected use')
    })

    test('should include full message template for test.skip', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createTestSkip())
      expect(reports[0].message).toBe(
        "Unexpected use of 'test.skip'. Skipped or focused tests can hide issues and cause inconsistent test runs.",
      )
    })

    test('should report test.skip with multiple arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'test' },
          property: { type: 'Identifier', name: 'skip' },
        },
        arguments: [
          { type: 'Literal', value: 'skipped' },
          { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 3, column: 1 }, end: { line: 3, column: 25 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('test.skip')
    })

    test('should detect test.skip at column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createTestSkip(1, 0))
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should detect test.skip at non-zero column', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createTestSkip(20, 8))
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should report test.skip with location object present', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createTestSkip())
      expect(reports[0].loc).toBeDefined()
    })
  })

  describe('detecting describe.skip expanded', () => {
    test('should report describe.skip at default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createDescribeSkip())
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report describe.skip at custom location', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createDescribeSkip(12, 6))
      expect(reports[0].loc?.start.line).toBe(12)
      expect(reports[0].loc?.start.column).toBe(6)
    })

    test('should report describe.skip with correct end location', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createDescribeSkip(5, 3))
      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(28)
    })

    test('should report exactly one violation for describe.skip', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createDescribeSkip())
      expect(reports.length).toBe(1)
    })

    test('should include full message template for describe.skip', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createDescribeSkip())
      expect(reports[0].message).toBe(
        "Unexpected use of 'describe.skip'. Skipped or focused tests can hide issues and cause inconsistent test runs.",
      )
    })

    test('should report describe.skip with location object present', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createDescribeSkip())
      expect(reports[0].loc).toBeDefined()
    })

    test('should report describe.skip at large line number', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createDescribeSkip(999, 0))
      expect(reports[0].loc?.start.line).toBe(999)
    })

    test('should include describe.skip in message reason', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createDescribeSkip())
      expect(reports[0].message).toContain('describe.skip')
    })

    test('should detect describe.skip at non-zero column', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createDescribeSkip(3, 20))
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should detect describe.skip with various arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'describe' },
          property: { type: 'Identifier', name: 'skip' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('detecting it.only expanded', () => {
    test('should report it.only at default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createItOnly())
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report it.only at custom location', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createItOnly(8, 3))
      expect(reports[0].loc?.start.line).toBe(8)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should report it.only with correct end location', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createItOnly(4, 0))
      expect(reports[0].loc?.end.line).toBe(4)
      expect(reports[0].loc?.end.column).toBe(20)
    })

    test('should report exactly one violation for it.only', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createItOnly())
      expect(reports.length).toBe(1)
    })

    test('should include full message template for it.only', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createItOnly())
      expect(reports[0].message).toBe(
        "Unexpected use of 'it.only'. Skipped or focused tests can hide issues and cause inconsistent test runs.",
      )
    })

    test('should report it.only at column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createItOnly(1, 0))
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report it.only at non-zero column', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createItOnly(6, 12))
      expect(reports[0].loc?.start.column).toBe(12)
    })

    test('should report it.only with location object', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createItOnly())
      expect(reports[0].loc).toBeDefined()
    })

    test('should include it.only in message reason', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createItOnly())
      expect(reports[0].message).toContain('it.only')
    })

    test('should report it.only with empty arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'it' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('detecting test.only expanded', () => {
    test('should report test.only at default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createTestOnly())
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report test.only at custom location', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createTestOnly(20, 10))
      expect(reports[0].loc?.start.line).toBe(20)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report test.only with correct end location', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createTestOnly(3, 4))
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(26)
    })

    test('should report exactly one violation for test.only', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createTestOnly())
      expect(reports.length).toBe(1)
    })

    test('should include full message template for test.only', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createTestOnly())
      expect(reports[0].message).toBe(
        "Unexpected use of 'test.only'. Skipped or focused tests can hide issues and cause inconsistent test runs.",
      )
    })

    test('should report test.only with location object', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createTestOnly())
      expect(reports[0].loc).toBeDefined()
    })

    test('should include test.only in message reason', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createTestOnly())
      expect(reports[0].message).toContain('test.only')
    })

    test('should report test.only at large line number', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createTestOnly(1000, 0))
      expect(reports[0].loc?.start.line).toBe(1000)
    })

    test('should report test.only with empty arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'test' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report test.only at non-zero column', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createTestOnly(5, 25))
      expect(reports[0].loc?.start.column).toBe(25)
    })
  })

  describe('detecting describe.only expanded', () => {
    test('should report describe.only at default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createDescribeOnly())
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report describe.only at custom location', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createDescribeOnly(14, 7))
      expect(reports[0].loc?.start.line).toBe(14)
      expect(reports[0].loc?.start.column).toBe(7)
    })

    test('should report describe.only with correct end location', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createDescribeOnly(9, 1))
      expect(reports[0].loc?.end.line).toBe(9)
      expect(reports[0].loc?.end.column).toBe(26)
    })

    test('should report exactly one violation for describe.only', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createDescribeOnly())
      expect(reports.length).toBe(1)
    })

    test('should include full message template for describe.only', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createDescribeOnly())
      expect(reports[0].message).toBe(
        "Unexpected use of 'describe.only'. Skipped or focused tests can hide issues and cause inconsistent test runs.",
      )
    })

    test('should report describe.only with location object', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createDescribeOnly())
      expect(reports[0].loc).toBeDefined()
    })

    test('should include describe.only in message reason', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createDescribeOnly())
      expect(reports[0].message).toContain('describe.only')
    })

    test('should report describe.only at non-zero column', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createDescribeOnly(4, 30))
      expect(reports[0].loc?.start.column).toBe(30)
    })

    test('should report describe.only with empty arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'describe' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report describe.only at large line number', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createDescribeOnly(750, 0))
      expect(reports[0].loc?.start.line).toBe(750)
    })
  })

  describe('detecting xit expanded', () => {
    test('should report xit at default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createXit())
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report xit at custom location', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createXit(25, 8))
      expect(reports[0].loc?.start.line).toBe(25)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should report xit with correct end location', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createXit(11, 2))
      expect(reports[0].loc?.end.line).toBe(11)
      expect(reports[0].loc?.end.column).toBe(20)
    })

    test('should report exactly one violation for xit', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createXit())
      expect(reports.length).toBe(1)
    })

    test('should include full message template for xit', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createXit())
      expect(reports[0].message).toBe(
        "Unexpected use of 'xit'. Skipped or focused tests can hide issues and cause inconsistent test runs.",
      )
    })

    test('should report xit even when allowSkipOnly is true', () => {
      const { context, reports } = createMockContext({ allowSkipOnly: true })
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createXit())
      expect(reports.length).toBe(1)
    })

    test('should report xit at column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createXit(1, 0))
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report xit at non-zero column', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createXit(3, 16))
      expect(reports[0].loc?.start.column).toBe(16)
    })

    test('should report xit with location object', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createXit())
      expect(reports[0].loc).toBeDefined()
    })

    test('should report xit with empty arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'xit' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('detecting xtest expanded', () => {
    test('should report xtest at default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createXtest())
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report xtest at custom location', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createXtest(30, 4))
      expect(reports[0].loc?.start.line).toBe(30)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should report xtest with correct end location', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createXtest(6, 1))
      expect(reports[0].loc?.end.line).toBe(6)
      expect(reports[0].loc?.end.column).toBe(21)
    })

    test('should report exactly one violation for xtest', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createXtest())
      expect(reports.length).toBe(1)
    })

    test('should include full message template for xtest', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createXtest())
      expect(reports[0].message).toBe(
        "Unexpected use of 'xtest'. Skipped or focused tests can hide issues and cause inconsistent test runs.",
      )
    })

    test('should report xtest even when allowSkipOnly is true', () => {
      const { context, reports } = createMockContext({ allowSkipOnly: true })
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createXtest())
      expect(reports.length).toBe(1)
    })

    test('should report xtest with location object', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createXtest())
      expect(reports[0].loc).toBeDefined()
    })

    test('should report xtest with empty arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'xtest' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 8 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report xtest at non-zero column', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createXtest(7, 14))
      expect(reports[0].loc?.start.column).toBe(14)
    })

    test('should include xtest in message reason', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createXtest())
      expect(reports[0].message).toContain('xtest')
    })
  })

  describe('detecting xdescribe expanded', () => {
    test('should report xdescribe at default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createXdescribe())
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report xdescribe at custom location', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createXdescribe(40, 5))
      expect(reports[0].loc?.start.line).toBe(40)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report xdescribe with correct end location', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createXdescribe(8, 3))
      expect(reports[0].loc?.end.line).toBe(8)
      expect(reports[0].loc?.end.column).toBe(26)
    })

    test('should report exactly one violation for xdescribe', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createXdescribe())
      expect(reports.length).toBe(1)
    })

    test('should include full message template for xdescribe', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createXdescribe())
      expect(reports[0].message).toBe(
        "Unexpected use of 'xdescribe'. Skipped or focused tests can hide issues and cause inconsistent test runs.",
      )
    })

    test('should report xdescribe even when allowSkipOnly is true', () => {
      const { context, reports } = createMockContext({ allowSkipOnly: true })
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createXdescribe())
      expect(reports.length).toBe(1)
    })

    test('should report xdescribe with location object', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createXdescribe())
      expect(reports[0].loc).toBeDefined()
    })

    test('should report xdescribe with empty arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'xdescribe' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 11 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should include xdescribe in message reason', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createXdescribe())
      expect(reports[0].message).toContain('xdescribe')
    })

    test('should report xdescribe at large line number', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createXdescribe(2000, 0))
      expect(reports[0].loc?.start.line).toBe(2000)
    })
  })

  describe('NOT flagging regular test calls expanded', () => {
    test('should not report it() with multiple arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [
          { type: 'Literal', value: 'test name' },
          { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report test() with multiple arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'test' },
        arguments: [
          { type: 'Literal', value: 'test name' },
          { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report describe() with multiple arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'describe' },
        arguments: [
          { type: 'Literal', value: 'suite name' },
          { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report it() with empty arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report test() with empty arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'test' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report describe() with empty arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'describe' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report it.each() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'it' },
          property: { type: 'Identifier', name: 'each' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report test.concurrent() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'test' },
          property: { type: 'Identifier', name: 'concurrent' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 18 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report describe.each() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'describe' },
          property: { type: 'Identifier', name: 'each' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report it.todo() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'it' },
          property: { type: 'Identifier', name: 'todo' },
        },
        arguments: [{ type: 'Literal', value: 'implement later' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report test.failing() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'test' },
          property: { type: 'Identifier', name: 'failing' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report random function call', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'myFunction' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report assert() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'assert' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 8 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report expect() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 8 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report beforeAll() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeAll' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report afterEach() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'afterEach' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 13 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('NOT flagging non-test .skip() calls', () => {
    test('should not report foo.skip()', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'foo' },
          property: { type: 'Identifier', name: 'skip' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report bar.skip()', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'bar' },
          property: { type: 'Identifier', name: 'skip' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report myObj.skip()', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myObj' },
          property: { type: 'Identifier', name: 'skip' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 13 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report something.skip()', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'something' },
          property: { type: 'Identifier', name: 'skip' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 17 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report callback.skip()', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'callback' },
          property: { type: 'Identifier', name: 'skip' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report array.skip()', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'array' },
          property: { type: 'Identifier', name: 'skip' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report data.skip()', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'data' },
          property: { type: 'Identifier', name: 'skip' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 11 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report value.skip()', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'value' },
          property: { type: 'Identifier', name: 'skip' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report result.skip()', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'result' },
          property: { type: 'Identifier', name: 'skip' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 13 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report item.skip()', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'item' },
          property: { type: 'Identifier', name: 'skip' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 11 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report runner.skip()', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'runner' },
          property: { type: 'Identifier', name: 'skip' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 13 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report config.skip()', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'config' },
          property: { type: 'Identifier', name: 'skip' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 13 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('NOT flagging non-test .only() calls', () => {
    test('should not report foo.only()', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'foo' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report bar.only()', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'bar' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report myObj.only()', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myObj' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 13 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report something.only()', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'something' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 17 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report callback.only()', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'callback' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report router.only()', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'router' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 13 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report store.only()', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'store' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report handler.only()', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'handler' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report module.only()', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'module' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 13 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report page.only()', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'page' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 11 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('allowSkipOnly option expanded', () => {
    test('allowSkipOnly true should not report it.skip', () => {
      const { context, reports } = createMockContext({ allowSkipOnly: true })
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createItSkip())
      expect(reports.length).toBe(0)
    })

    test('allowSkipOnly true should not report test.skip', () => {
      const { context, reports } = createMockContext({ allowSkipOnly: true })
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createTestSkip())
      expect(reports.length).toBe(0)
    })

    test('allowSkipOnly true should not report describe.skip', () => {
      const { context, reports } = createMockContext({ allowSkipOnly: true })
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createDescribeSkip())
      expect(reports.length).toBe(0)
    })

    test('allowSkipOnly true should not report it.only', () => {
      const { context, reports } = createMockContext({ allowSkipOnly: true })
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createItOnly())
      expect(reports.length).toBe(0)
    })

    test('allowSkipOnly true should not report test.only', () => {
      const { context, reports } = createMockContext({ allowSkipOnly: true })
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createTestOnly())
      expect(reports.length).toBe(0)
    })

    test('allowSkipOnly true should not report describe.only', () => {
      const { context, reports } = createMockContext({ allowSkipOnly: true })
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createDescribeOnly())
      expect(reports.length).toBe(0)
    })

    test('allowSkipOnly false should report it.skip', () => {
      const { context, reports } = createMockContext({ allowSkipOnly: false })
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createItSkip())
      expect(reports.length).toBe(1)
    })

    test('allowSkipOnly false should report test.skip', () => {
      const { context, reports } = createMockContext({ allowSkipOnly: false })
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createTestSkip())
      expect(reports.length).toBe(1)
    })

    test('allowSkipOnly false should report describe.skip', () => {
      const { context, reports } = createMockContext({ allowSkipOnly: false })
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createDescribeSkip())
      expect(reports.length).toBe(1)
    })

    test('allowSkipOnly false should report it.only', () => {
      const { context, reports } = createMockContext({ allowSkipOnly: false })
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createItOnly())
      expect(reports.length).toBe(1)
    })

    test('allowSkipOnly false should report test.only', () => {
      const { context, reports } = createMockContext({ allowSkipOnly: false })
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createTestOnly())
      expect(reports.length).toBe(1)
    })

    test('allowSkipOnly false should report describe.only', () => {
      const { context, reports } = createMockContext({ allowSkipOnly: false })
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createDescribeOnly())
      expect(reports.length).toBe(1)
    })

    test('allowSkipOnly false should report xit', () => {
      const { context, reports } = createMockContext({ allowSkipOnly: false })
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createXit())
      expect(reports.length).toBe(1)
    })

    test('allowSkipOnly false should report xtest', () => {
      const { context, reports } = createMockContext({ allowSkipOnly: false })
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createXtest())
      expect(reports.length).toBe(1)
    })

    test('allowSkipOnly false should report xdescribe', () => {
      const { context, reports } = createMockContext({ allowSkipOnly: false })
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createXdescribe())
      expect(reports.length).toBe(1)
    })
  })

  describe('violation message properties', () => {
    test('message for it.skip starts with Unexpected use', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createItSkip())
      expect(reports[0].message).toMatch(/^Unexpected use of/)
    })

    test('message for it.skip ends with full stop', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createItSkip())
      expect(reports[0].message).toMatch(/\.$/)
    })

    test('message contains "hide issues" phrase', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createItSkip())
      expect(reports[0].message).toContain('hide issues')
    })

    test('message contains "inconsistent test runs" phrase', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createItSkip())
      expect(reports[0].message).toContain('inconsistent test runs')
    })

    test('message for xit uses single quotes around reason', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createXit())
      expect(reports[0].message).toContain("'xit'")
    })

    test('message for xtest uses single quotes around reason', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createXtest())
      expect(reports[0].message).toContain("'xtest'")
    })

    test('message for xdescribe uses single quotes around reason', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createXdescribe())
      expect(reports[0].message).toContain("'xdescribe'")
    })

    test('message for it.skip uses single quotes around reason', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createItSkip())
      expect(reports[0].message).toContain("'it.skip'")
    })

    test('message for test.only uses single quotes around reason', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createTestOnly())
      expect(reports[0].message).toContain("'test.only'")
    })

    test('message for describe.skip uses single quotes around reason', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createDescribeSkip())
      expect(reports[0].message).toContain("'describe.skip'")
    })

    test('message has correct format with reason in quotes', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      visitor.CallExpression(createItOnly())
      const msg = reports[0].message
      expect(msg).toMatch(/^Unexpected use of 'it\.only'\./)
      expect(msg).toMatch(/Skipped or focused tests can hide issues/)
    })
  })

  describe('extractLocation edge cases', () => {
    test('should return default location for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'xit' },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should return default location for node with null loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'xit' },
        arguments: [],
        loc: null,
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should return default location for node with undefined loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'xit' },
        arguments: [],
        loc: undefined,
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle node with loc missing start', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'xit' },
        arguments: [],
        loc: { end: { line: 2, column: 5 } },
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle node with loc missing end', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'xit' },
        arguments: [],
        loc: { start: { line: 3, column: 7 } },
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(7)
      expect(reports[0].loc?.end.line).toBe(1)
      expect(reports[0].loc?.end.column).toBe(0)
    })

    test('should handle node with non-numeric line', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'xit' },
        arguments: [],
        loc: { start: { line: 'abc', column: 0 }, end: { line: 1, column: 1 } },
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle node with non-numeric column', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'xit' },
        arguments: [],
        loc: { start: { line: 1, column: 'bad' }, end: { line: 1, column: 1 } },
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'xit' },
        arguments: [],
        loc: {},
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[0].loc?.end.line).toBe(1)
      expect(reports[0].loc?.end.column).toBe(0)
    })

    test('should handle node with valid loc correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'xit' },
        arguments: [],
        loc: { start: { line: 42, column: 8 }, end: { line: 42, column: 15 } },
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(8)
      expect(reports[0].loc?.end.line).toBe(42)
      expect(reports[0].loc?.end.column).toBe(15)
    })

    test('should handle node with zero line and column', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'xit' },
        arguments: [],
        loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  describe('multiple violations', () => {
    test('should accumulate reports for multiple skipped tests', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)

      visitor.CallExpression(createItSkip())
      visitor.CallExpression(createTestSkip())
      visitor.CallExpression(createDescribeSkip())

      expect(reports.length).toBe(3)
    })

    test('should accumulate reports for mix of skip and x-prefix', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)

      visitor.CallExpression(createItSkip())
      visitor.CallExpression(createXit())
      visitor.CallExpression(createXtest())

      expect(reports.length).toBe(3)
    })

    test('should accumulate reports for all violation types', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)

      visitor.CallExpression(createItSkip())
      visitor.CallExpression(createTestSkip())
      visitor.CallExpression(createDescribeSkip())
      visitor.CallExpression(createItOnly())
      visitor.CallExpression(createTestOnly())
      visitor.CallExpression(createDescribeOnly())
      visitor.CallExpression(createXit())
      visitor.CallExpression(createXtest())
      visitor.CallExpression(createXdescribe())

      expect(reports.length).toBe(9)
    })

    test('should only report violations, not normal calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)

      visitor.CallExpression(createItSkip())
      visitor.CallExpression(createNormalIt())
      visitor.CallExpression(createNormalTest())
      visitor.CallExpression(createXit())

      expect(reports.length).toBe(2)
    })

    test('should report correct messages for each violation', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)

      visitor.CallExpression(createItSkip())
      visitor.CallExpression(createXtest())

      expect(reports[0].message).toContain('it.skip')
      expect(reports[1].message).toContain('xtest')
    })

    test('should report correct locations for each violation', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)

      visitor.CallExpression(createItSkip(1, 0))
      visitor.CallExpression(createXit(5, 10))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
      expect(reports[1].loc?.start.column).toBe(10)
    })

    test('should handle interleaved normal and skipped calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)

      visitor.CallExpression(createNormalIt())
      visitor.CallExpression(createItSkip())
      visitor.CallExpression(createNormalTest())
      visitor.CallExpression(createXdescribe())
      visitor.CallExpression(createNormalDescribe())

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('it.skip')
      expect(reports[1].message).toContain('xdescribe')
    })

    test('should accumulate reports for repeated same-type violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)

      visitor.CallExpression(createItSkip(1, 0))
      visitor.CallExpression(createItSkip(2, 0))
      visitor.CallExpression(createItSkip(3, 0))

      expect(reports.length).toBe(3)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(2)
      expect(reports[2].loc?.start.line).toBe(3)
    })
  })

  describe('edge cases expanded', () => {
    test('should handle node with numeric callee type', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: 42,
        arguments: [],
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with string callee type', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: 'function',
        arguments: [],
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with boolean node', () => {
      const { context } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
    })

    test('should handle MemberExpression with computed property', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'it' },
          property: { type: 'Literal', value: 'skip' },
          computed: true,
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle deeply nested member expression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'cy' },
            property: { type: 'Identifier', name: 'get' },
          },
          property: { type: 'Identifier', name: 'skip' },
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not flag functions with names starting with x', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'xavier' },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not flag functions with names starting with xdescribe but longer', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'xdescribes' },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression with null object', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'skip' },
        },
        arguments: [],
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression with null property', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'it' },
          property: null,
        },
        arguments: [],
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle Identifier callee with numeric name', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 123 },
        arguments: [],
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle Identifier callee with empty string name', () => {
      const { context, reports } = createMockContext()
      const visitor = noSkippedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: '' },
        arguments: [],
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })
})
