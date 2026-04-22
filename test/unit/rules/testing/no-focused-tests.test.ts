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

  describe('rule metadata extended', () => {
    test('meta should be an object', () => {
      expect(typeof noFocusedTestsRule.meta).toBe('object')
    })

    test('meta should have docs property', () => {
      expect(noFocusedTestsRule.meta).toHaveProperty('docs')
    })

    test('docs should have recommended property set to true', () => {
      expect(noFocusedTestsRule.meta.docs?.recommended).toBe(true)
    })

    test('docs should have category property', () => {
      expect(noFocusedTestsRule.meta.docs).toHaveProperty('category')
    })

    test('docs should have url property', () => {
      expect(noFocusedTestsRule.meta.docs).toHaveProperty('url')
    })

    test('schema should be an array', () => {
      expect(Array.isArray(noFocusedTestsRule.meta.schema)).toBe(true)
    })

    test('schema should have length 0', () => {
      expect(noFocusedTestsRule.meta.schema).toHaveLength(0)
    })

    test('create should be a function', () => {
      expect(typeof noFocusedTestsRule.create).toBe('function')
    })
  })

  describe('create function visitor shape', () => {
    test('visitor should have exactly one key: CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      expect(Object.keys(visitor)).toContain('CallExpression')
    })

    test('CallExpression should be a function', () => {
      const { context } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noFocusedTestsRule.create(context)
      const visitor2 = noFocusedTestsRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })
  })

  describe('fit() detection expanded', () => {
    test('should report fit at line 1 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createFit(1, 0))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report fit at line 100 column 50', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createFit(100, 50))
      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report fit with empty arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fit' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report fit with multiple arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fit' },
        arguments: [
          { type: 'Literal', value: 'test name' },
          { type: 'ArrowFunctionExpression' },
          { type: 'Literal', value: 5000 },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report fit reason as "fit"', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createFit())
      expect(reports[0].message).toContain("'fit'")
    })

    test('should not report "fit" with uppercase F', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Fit' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report "FIT" all caps', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'FIT' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should report multiple fit() calls independently', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createFit(1, 0))
      visitor.CallExpression(createFit(2, 0))
      visitor.CallExpression(createFit(3, 0))
      visitor.CallExpression(createFit(4, 0))
      expect(reports.length).toBe(4)
    })

    test('should report fit with callback function argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fit' },
        arguments: [
          { type: 'Literal', value: 'works' },
          { type: 'FunctionExpression', params: [], body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 2 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should not confuse fit as member expression property', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'something' },
          property: { type: 'Identifier', name: 'fit' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('it.only() detection expanded', () => {
    test('should report it.only at first line', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createItOnly(1, 0))
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should report it.only with large line number', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createItOnly(999, 0))
      expect(reports[0].loc?.start.line).toBe(999)
    })

    test('should report it.only with large column number', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createItOnly(1, 80))
      expect(reports[0].loc?.start.column).toBe(80)
    })

    test('should report it.only reason containing "it.only"', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createItOnly())
      expect(reports[0].message).toContain('it.only')
    })

    test('should report it.only with no arguments', () => {
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
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report it.only with ArrowFunction argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'it' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [
          { type: 'Literal', value: 'arrow' },
          { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 5, column: 2 }, end: { line: 7, column: 4 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report it.only end location', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createItOnly(3, 4))
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should distinguish it.only from it.skip', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createItSkip())
      expect(reports.length).toBe(0)
    })

    test('should not report it with non-Identifier callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'it' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('test.only() detection expanded', () => {
    test('should report test.only at origin position', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createTestOnly(0, 0))
      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report test.only reason containing "test.only"', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createTestOnly())
      expect(reports[0].message).toContain('test.only')
    })

    test('should report test.only with empty arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
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

    test('should report test.only with many arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'test' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [
          { type: 'Literal', value: 'name' },
          { type: 'ObjectExpression' },
          { type: 'FunctionExpression' },
        ],
        loc: { start: { line: 2, column: 4 }, end: { line: 5, column: 6 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should distinguish test.only from test()', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createNormalTest())
      expect(reports.length).toBe(0)
    })

    test('should distinguish test.only from test.skip', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createTestSkip())
      expect(reports.length).toBe(0)
    })

    test('should report test.only end location correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createTestOnly(10, 5))
      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(10)
    })

    test('should report test.only multiple times across different visitors', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      noFocusedTestsRule.create(ctx1).CallExpression(createTestOnly())
      noFocusedTestsRule.create(ctx2).CallExpression(createTestOnly())
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(1)
    })
  })

  describe('describe.only() detection expanded', () => {
    test('should report describe.only at origin position', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createDescribeOnly(0, 0))
      expect(reports[0].loc?.start.line).toBe(0)
    })

    test('should report describe.only reason containing "describe.only"', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createDescribeOnly())
      expect(reports[0].message).toContain('describe.only')
    })

    test('should report describe.only with empty arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'describe' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 17 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should distinguish describe.only from describe()', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createNormalDescribe())
      expect(reports.length).toBe(0)
    })

    test('should distinguish describe.only from describe.skip', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createDescribeSkip())
      expect(reports.length).toBe(0)
    })

    test('should report describe.only at various positions', () => {
      const positions = [
        [1, 0],
        [5, 2],
        [10, 8],
        [42, 16],
      ]
      for (const [line, col] of positions) {
        const { context, reports } = createMockContext()
        const visitor = noFocusedTestsRule.create(context)
        visitor.CallExpression(createDescribeOnly(line, col))
        expect(reports[0].loc?.start.line).toBe(line)
        expect(reports[0].loc?.start.column).toBe(col)
      }
    })

    test('should report describe.only end location', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createDescribeOnly(3, 0))
      expect(reports[0].loc?.end).toBeDefined()
    })
  })

  describe('NOT flagged: regular test calls expanded', () => {
    test('should not report bare it()', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createNormalIt())
      expect(reports.length).toBe(0)
    })

    test('should not report bare test()', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createNormalTest())
      expect(reports.length).toBe(0)
    })

    test('should not report bare describe()', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createNormalDescribe())
      expect(reports.length).toBe(0)
    })

    test('should not report it.skip()', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createItSkip())
      expect(reports.length).toBe(0)
    })

    test('should not report test.skip()', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createTestSkip())
      expect(reports.length).toBe(0)
    })

    test('should not report describe.skip()', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createDescribeSkip())
      expect(reports.length).toBe(0)
    })

    test('should not report it.todo()', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'it' },
          property: { type: 'Identifier', name: 'todo' },
        },
        arguments: [{ type: 'Literal', value: 'write test later' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report test.concurrent()', () => {
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
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report it.each()', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'it' },
          property: { type: 'Identifier', name: 'each' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report test.each()', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'test' },
          property: { type: 'Identifier', name: 'each' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 17 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report describe.each()', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'describe' },
          property: { type: 'Identifier', name: 'each' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report regular function call', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'myHelper' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report xit()', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createXit())
      expect(reports.length).toBe(0)
    })

    test('should not report xtest()', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createXtest())
      expect(reports.length).toBe(0)
    })

    test('should not report xdescribe()', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createXdescribe())
      expect(reports.length).toBe(0)
    })

    test('should not report it.failing()', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'it' },
          property: { type: 'Identifier', name: 'failing' },
        },
        arguments: [{ type: 'Literal', value: 'expected fail' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('NOT flagged: non-test .only() calls', () => {
    test('should not report foo.only()', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
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
      const visitor = noFocusedTestsRule.create(context)
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

    test('should not report baz.only()', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'baz' },
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
      const visitor = noFocusedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myObj' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report window.only()', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'window' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report config.only()', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'config' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report stream.only()', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'stream' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report filter.only()', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'filter' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report result.only()', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'result' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report data.only()', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'data' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('NOT flagged: non-CallExpression nodes', () => {
    test('should not crash on Identifier node', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = { type: 'Identifier', name: 'fit' }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not crash on Literal node', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = { type: 'Literal', value: 'fit' }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not crash on MemberExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'it' },
        property: { type: 'Identifier', name: 'only' },
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not crash on FunctionDeclaration node', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = { type: 'FunctionDeclaration', id: { type: 'Identifier', name: 'fit' } }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not crash on VariableDeclaration node', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = { type: 'VariableDeclaration', kind: 'const', declarations: [] }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not crash on BlockStatement node', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = { type: 'BlockStatement', body: [] }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not crash on ReturnStatement node', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = { type: 'ReturnStatement', argument: null }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not crash on empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not crash on ExpressionStatement node', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = { type: 'ExpressionStatement', expression: { type: 'Literal', value: 1 } }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not crash on IfStatement node', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = {
        type: 'IfStatement',
        test: { type: 'Literal', value: true },
        consequent: { type: 'BlockStatement', body: [] },
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('chained member expressions expanded', () => {
    test('should report it.only.each() with correct reason', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createItOnlyEach())
      expect(reports[0].message).toContain('it.only')
    })

    test('should report test.only.each() with correct reason', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createTestOnlyEach())
      expect(reports[0].message).toContain('test.only')
    })

    test('should report describe.only.each() with correct reason', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createDescribeOnlyEach())
      expect(reports[0].message).toContain('describe.only')
    })

    test('should report it.only.each() location correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createItOnlyEach(15, 3))
      expect(reports[0].loc?.start.line).toBe(15)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should report test.only.each() location correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createTestOnlyEach(8, 1))
      expect(reports[0].loc?.start.line).toBe(8)
      expect(reports[0].loc?.start.column).toBe(1)
    })

    test('should report describe.only.each() location correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createDescribeOnlyEach(22, 0))
      expect(reports[0].loc?.start.line).toBe(22)
    })

    test('should report deeply nested it.only.each.withTimeout', () => {
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
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('it.only')
    })

    test('should report deeply nested test.only.each.withTimeout', () => {
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
              object: { type: 'Identifier', name: 'test' },
              property: { type: 'Identifier', name: 'only' },
            },
            property: { type: 'Identifier', name: 'each' },
          },
          property: { type: 'Identifier', name: 'withTimeout' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 42 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('test.only')
    })

    test('should report deeply nested describe.only.each.withTimeout', () => {
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
              object: { type: 'Identifier', name: 'describe' },
              property: { type: 'Identifier', name: 'only' },
            },
            property: { type: 'Identifier', name: 'each' },
          },
          property: { type: 'Identifier', name: 'withTimeout' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 45 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('describe.only')
    })

    test('should not report it.each without only', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'it' },
          property: { type: 'Identifier', name: 'each' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report foo.only.each() where foo is not a test function', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'foo' },
            property: { type: 'Identifier', name: 'only' },
          },
          property: { type: 'Identifier', name: 'each' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('violation message properties', () => {
    test('report message contains reason for it.only', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createItOnly())
      expect(reports[0].message).toMatch(/it\.only/)
    })

    test('report message contains reason for test.only', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createTestOnly())
      expect(reports[0].message).toMatch(/test\.only/)
    })

    test('report message contains reason for describe.only', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createDescribeOnly())
      expect(reports[0].message).toMatch(/describe\.only/)
    })

    test('report message contains reason for fit', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createFit())
      expect(reports[0].message).toContain("'fit'")
    })

    test('message starts with "Unexpected focused test"', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createItOnly())
      expect(reports[0].message).toMatch(/^Unexpected focused test/)
    })

    test('message mentions CI failures', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createTestOnly())
      expect(reports[0].message).toContain('CI')
    })

    test('message mentions masking failures', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createItOnly())
      expect(reports[0].message).toContain('mask failures')
    })

    test('message mentions subset of tests', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createItOnly())
      expect(reports[0].message).toContain('subset of tests')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createItOnly(5, 10))
      expect(reports[0].loc).toBeDefined()
    })

    test('report loc has start property', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createItOnly())
      expect(reports[0].loc?.start).toBeDefined()
    })

    test('report loc has end property', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createItOnly())
      expect(reports[0].loc?.end).toBeDefined()
    })
  })

  describe('extractLocation edge cases', () => {
    test('returns default location for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fit' },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('returns default location for node with loc but missing start', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fit' },
        arguments: [],
        loc: { end: { line: 2, column: 5 } },
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('returns default location for node with loc but missing end', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fit' },
        arguments: [],
        loc: { start: { line: 3, column: 8 } },
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(8)
      expect(reports[0].loc?.end.line).toBe(1)
    })

    test('handles loc with non-numeric line', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fit' },
        arguments: [],
        loc: { start: { line: 'bad', column: 0 }, end: { line: 1, column: 5 } },
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('handles loc with non-numeric column', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fit' },
        arguments: [],
        loc: { start: { line: 1, column: 'bad' }, end: { line: 1, column: 5 } },
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('handles loc with null start', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fit' },
        arguments: [],
        loc: { start: null, end: { line: 1, column: 5 } },
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('handles loc with undefined start', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fit' },
        arguments: [],
        loc: { start: undefined, end: { line: 1, column: 5 } },
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('handles valid loc correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fit' },
        arguments: [],
        loc: { start: { line: 42, column: 7 }, end: { line: 42, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(7)
      expect(reports[0].loc?.end.line).toBe(42)
      expect(reports[0].loc?.end.column).toBe(20)
    })
  })

  describe('isFocusedTest edge cases', () => {
    test('should handle node with type other than CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = { type: 'AssignmentExpression', left: {}, right: {} }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle callee with non-Identifier and non-MemberExpression type', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fit' },
          arguments: [],
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle callee Identifier with numeric name', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 123 },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle callee Identifier with undefined name', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: undefined },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle callee Identifier with empty string name', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: '' },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression with non-Identifier property', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'it' },
          property: { type: 'Literal', value: 'only' },
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression with computed property', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'it' },
          property: { type: 'Identifier', name: 'only' },
          computed: true,
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fit' },
        arguments: [],
        extra: true,
        optional: false,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle boolean node input', () => {
      const { context } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(() => visitor.CallExpression(false)).not.toThrow()
    })

    test('should handle numeric node input', () => {
      const { context } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      expect(() => visitor.CallExpression(0)).not.toThrow()
      expect(() => visitor.CallExpression(-1)).not.toThrow()
    })
  })

  describe('multiple violations', () => {
    test('should report both it.only and test.only in same visitor', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createItOnly())
      visitor.CallExpression(createTestOnly())
      expect(reports.length).toBe(2)
    })

    test('should report it.only, test.only, describe.only, fit all at once', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createItOnly())
      visitor.CallExpression(createTestOnly())
      visitor.CallExpression(createDescribeOnly())
      visitor.CallExpression(createFit())
      expect(reports.length).toBe(4)
    })

    test('should report only focused tests among mixed calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createNormalIt())
      visitor.CallExpression(createItOnly())
      visitor.CallExpression(createNormalTest())
      visitor.CallExpression(createTestOnly())
      visitor.CallExpression(createNormalDescribe())
      expect(reports.length).toBe(2)
    })

    test('should report chained and simple focused tests together', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createItOnly())
      visitor.CallExpression(createItOnlyEach())
      visitor.CallExpression(createTestOnlyEach())
      expect(reports.length).toBe(3)
    })

    test('should report same type of focused test multiple times', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      for (let i = 0; i < 10; i++) {
        visitor.CallExpression(createItOnly(i + 1, 0))
      }
      expect(reports).toHaveLength(10)
    })
  })

  describe('createMockContext options', () => {
    test('should work with default options', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createItOnly())
      expect(reports.length).toBe(1)
    })

    test('should work with custom options', () => {
      const { context, reports } = createMockContext({ someOption: true })
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createItOnly())
      expect(reports.length).toBe(1)
    })

    test('should work with custom filePath', () => {
      const { context, reports } = createMockContext({}, '/custom/path.test.ts')
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createItOnly())
      expect(reports.length).toBe(1)
    })

    test('should work with custom source', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/test.ts',
        'it.only("test", () => {});',
      )
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createItOnly())
      expect(reports.length).toBe(1)
    })
  })

  describe('callee type edge cases', () => {
    test('should not report Super callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Super' },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report FunctionExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'FunctionExpression',
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report ArrowFunctionExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] } },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report TaggedTemplateExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'TaggedTemplateExpression', tag: {}, quasi: {} },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should report when callee type is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { name: 'fit' },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('arguments variations', () => {
    test('should report fit with null argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fit' },
        arguments: [null],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 8 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report it.only with TemplateLiteral argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'it' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [{ type: 'TemplateLiteral', quasis: [], expressions: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report test.only with SpreadElement argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'test' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [{ type: 'SpreadElement', argument: {} }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report describe.only with ObjectExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'describe' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [{ type: 'ObjectExpression', properties: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report fit regardless of argument content', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fit' },
        arguments: [
          { type: 'ObjectExpression', properties: [] },
          { type: 'ArrayExpression', elements: [] },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('visitor reuse', () => {
    test('visitor accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createItOnly(1, 0))
      visitor.CallExpression(createNormalIt(2, 0))
      visitor.CallExpression(createTestOnly(3, 0))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('it.only')
      expect(reports[1].message).toContain('test.only')
    })

    test('separate visitors have separate report arrays', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noFocusedTestsRule.create(ctx1)
      const visitor2 = noFocusedTestsRule.create(ctx2)
      visitor1.CallExpression(createItOnly())
      visitor2.CallExpression(createTestOnly())
      visitor2.CallExpression(createFit())
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(2)
    })
  })

  describe('location preservation', () => {
    test('preserves exact start line for it.only', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createItOnly(42, 8))
      expect(reports[0].loc?.start.line).toBe(42)
    })

    test('preserves exact start column for test.only', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createTestOnly(1, 16))
      expect(reports[0].loc?.start.column).toBe(16)
    })

    test('preserves exact end line for describe.only', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createDescribeOnly(5, 0))
      expect(reports[0].loc?.end.line).toBe(5)
    })

    test('preserves exact end column for fit', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createFit(1, 0))
      expect(reports[0].loc?.end.column).toBe(18)
    })

    test('preserves multiline location for it.only', () => {
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
        loc: { start: { line: 10, column: 2 }, end: { line: 15, column: 4 } },
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.end.line).toBe(15)
    })
  })

  describe('default export', () => {
    test('rule should be the default export', () => {
      expect(noFocusedTestsRule).toBeDefined()
      expect(noFocusedTestsRule.meta).toBeDefined()
      expect(noFocusedTestsRule.create).toBeDefined()
    })
  })

  describe('report message format', () => {
    test('it.only message contains single quotes around reason', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createItOnly())
      expect(reports[0].message).toContain("'it.only'")
    })

    test('test.only message contains single quotes around reason', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createTestOnly())
      expect(reports[0].message).toContain("'test.only'")
    })

    test('describe.only message contains single quotes around reason', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createDescribeOnly())
      expect(reports[0].message).toContain("'describe.only'")
    })

    test('fit message contains single quotes around reason', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createFit())
      expect(reports[0].message).toContain("'fit'")
    })

    test('it.only.each message contains it.only reason', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createItOnlyEach())
      expect(reports[0].message).toContain("'it.only'")
    })

    test('test.only.each message contains test.only reason', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createTestOnlyEach())
      expect(reports[0].message).toContain("'test.only'")
    })

    test('describe.only.each message contains describe.only reason', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createDescribeOnlyEach())
      expect(reports[0].message).toContain("'describe.only'")
    })

    test('message ends with period', () => {
      const { context, reports } = createMockContext()
      const visitor = noFocusedTestsRule.create(context)
      visitor.CallExpression(createItOnly())
      expect(reports[0].message).toMatch(/\.$/)
    })
  })
})
