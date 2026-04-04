import { describe, test, expect, vi } from 'vitest'
import { noFocusedTestsRule } from '../../../../src/rules/testing/no-focused-tests.js'
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

function createFit(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'fit' },
    arguments: [{ type: 'Literal', value: 'focused test' }],
    loc: {
      start: { line, column },
      end: { line, column: column + 18 },
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

function createItOnlyEach(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'it' },
        property: { type: 'Identifier', name: 'only' },
      },
      property: { type: 'Identifier', name: 'each' },
    },
    arguments: [{ type: 'Literal', value: 'focused test' }],
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function createTestOnlyEach(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'test' },
        property: { type: 'Identifier', name: 'only' },
      },
      property: { type: 'Identifier', name: 'each' },
    },
    arguments: [{ type: 'Literal', value: 'focused test' }],
    loc: {
      start: { line, column },
      end: { line, column: column + 32 },
    },
  }
}

function createDescribeOnlyEach(line = 1, column = 0): unknown {
  return {
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
    arguments: [{ type: 'Literal', value: 'focused suite' }],
    loc: {
      start: { line, column },
      end: { line, column: column + 35 },
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

describe('no-focused-tests rule', () => {
  describe('meta', () => {
    test('should have correct rule type', () => {
      expect(noFocusedTestsRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noFocusedTestsRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noFocusedTestsRule.meta.docs?.recommended).toBe(true)
    })

    test('should have correct category', () => {
      expect(noFocusedTestsRule.meta.docs?.category).toBe('testing')
    })

    test('should have empty schema (no options)', () => {
      expect(noFocusedTestsRule.meta.schema).toEqual([])
    })

    test('should have correct description mentioning focused tests', () => {
      expect(noFocusedTestsRule.meta.docs?.description.toLowerCase()).toContain('focused')
    })

    test('should have correct description mentioning .only()', () => {
      expect(noFocusedTestsRule.meta.docs?.description.toLowerCase()).toContain('.only')
    })

    test('should have correct docs URL', () => {
      expect(noFocusedTestsRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-focused-tests',
      )
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })
  })

  describe('detecting it.only', () => {
    test('should report it.only() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)

      visitor.CallExpression(createItOnly())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('it.only')
    })

    test('should report correct location for it.only', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)

      visitor.CallExpression(createItOnly(5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report multiple it.only() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)

      visitor.CallExpression(createItOnly(1, 0))
      visitor.CallExpression(createItOnly(5, 0))
      visitor.CallExpression(createItOnly(10, 0))

      expect(reports.length).toBe(3)
    })
  })

  describe('detecting test.only', () => {
    test('should report test.only() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)

      visitor.CallExpression(createTestOnly())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('test.only')
    })

    test('should report correct location for test.only', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)

      visitor.CallExpression(createTestOnly(3, 5))

      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })
  })

  describe('detecting describe.only', () => {
    test('should report describe.only() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)

      visitor.CallExpression(createDescribeOnly())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('describe.only')
    })

    test('should report correct location for describe.only', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)

      visitor.CallExpression(createDescribeOnly(7, 2))

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(2)
    })
  })

  describe('detecting fit', () => {
    test('should report fit() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)

      visitor.CallExpression(createFit())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('fit')
    })

    test('should report correct location for fit', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)

      visitor.CallExpression(createFit(12, 4))

      expect(reports[0].loc?.start.line).toBe(12)
      expect(reports[0].loc?.start.column).toBe(4)
    })
  })

  describe('detecting chained calls like it.only.each()', () => {
    test('should report it.only.each() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)

      visitor.CallExpression(createItOnlyEach())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('it.only')
    })

    test('should report test.only.each() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)

      visitor.CallExpression(createTestOnlyEach())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('test.only')
    })

    test('should report describe.only.each() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)

      visitor.CallExpression(createDescribeOnlyEach())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('describe.only')
    })
  })

  describe('NOT flagging normal tests', () => {
    test('should not report normal it() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)

      visitor.CallExpression(createNormalIt())

      expect(reports.length).toBe(0)
    })

    test('should not report normal test() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)

      visitor.CallExpression(createNormalTest())

      expect(reports.length).toBe(0)
    })

    test('should not report normal describe() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)

      visitor.CallExpression(createNormalDescribe())

      expect(reports.length).toBe(0)
    })

    test('should not report unrelated function calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)

      visitor.CallExpression(createUnrelatedCall())

      expect(reports.length).toBe(0)
    })
  })

  describe('NOT flagging skipped tests (covered by no-skipped-tests)', () => {
    test('should not report it.skip() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)

      visitor.CallExpression(createItSkip())

      expect(reports.length).toBe(0)
    })

    test('should not report test.skip() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)

      visitor.CallExpression(createTestSkip())

      expect(reports.length).toBe(0)
    })

    test('should not report describe.skip() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)

      visitor.CallExpression(createDescribeSkip())

      expect(reports.length).toBe(0)
    })

    test('should not report xit() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)

      visitor.CallExpression(createXit())

      expect(reports.length).toBe(0)
    })

    test('should not report xtest() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)

      visitor.CallExpression(createXtest())

      expect(reports.length).toBe(0)
    })

    test('should not report xdescribe() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)

      visitor.CallExpression(createXdescribe())

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'it' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)

      const node = { type: 'CallExpression', arguments: [] }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle member expression without property', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)

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
      const visitor = noFocusedTestsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'CallExpression' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not flag other member expression methods', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)

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

    test('should not flag other member expression methods like concurrent', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'test' },
          property: { type: 'Identifier', name: 'concurrent' },
        },
        arguments: [],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not flag non-test functions with only property', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not flag fit-like names that are not exactly fit', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fitter' },
        arguments: [],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle deeply nested member expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: {
              type: 'MemberExpression',
              object: { type: 'Identifier', name: 'it' },
              property: { type: 'Identifier', name: 'only' },
            },
            property: { type: 'Identifier', name: 'each' },
          },
          property: { type: 'Identifier', name: 'withTimeout' },
        },
        arguments: [],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 40 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('it.only')
    })

    test('should report error with helpful message', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)

      visitor.CallExpression(createItOnly())

      expect(reports[0].message).toContain('Unexpected focused test')
      expect(reports[0].message).toContain('CI')
    })
  })

  describe('error severity', () => {
    test('should use error severity (more serious than skipped tests)', () => {
      expect(noFocusedTestsRule.meta.severity).toBe('error')
    })

    test('should be a problem type rule', () => {
      expect(noFocusedTestsRule.meta.type).toBe('problem')
    })
  })
})
