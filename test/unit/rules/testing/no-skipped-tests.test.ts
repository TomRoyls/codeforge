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
})
