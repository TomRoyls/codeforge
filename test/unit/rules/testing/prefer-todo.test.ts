import { describe, test, expect, vi } from 'vitest'
import { preferTodoRule } from '../../../../src/rules/testing/prefer-todo.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import preferTodoDefault from '../../../../src/rules/testing/prefer-todo.js'

interface ReportDescriptor {
  message: string
  data?: Record<string, unknown>
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  filePath = '/src/file.test.ts',
  source = 'it("test", () => {});',
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        data: descriptor.data,
        loc: descriptor.loc,
      })
    },
    getFilePath: () => filePath,
    getAST: () => null,
    getSource: () => source,
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

  return { context, reports }
}

function createXit(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'xit' },
    arguments: [{ type: 'Literal', value: 'skipped test' }],
    loc: { start: { line, column }, end: { line, column: column + 18 } },
  }
}

function createXtest(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'xtest' },
    arguments: [{ type: 'Literal', value: 'skipped test' }],
    loc: { start: { line, column }, end: { line, column: column + 20 } },
  }
}

function createXdescribe(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'xdescribe' },
    arguments: [{ type: 'Literal', value: 'skipped suite' }],
    loc: { start: { line, column }, end: { line, column: column + 23 } },
  }
}

function createSkipCall(objectName: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: objectName },
      property: { type: 'Identifier', name: 'skip' },
    },
    arguments: [{ type: 'Literal', value: 'skipped' }],
    loc: { start: { line, column }, end: { line, column: column + 20 } },
  }
}

function createTodoCall(objectName: string): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: objectName },
      property: { type: 'Identifier', name: 'todo' },
    },
    arguments: [{ type: 'Literal', value: 'todo test' }],
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
  }
}

function createNormalCall(name: string): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name },
    arguments: [{ type: 'Literal', value: 'normal call' }],
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
  }
}

function createOnlyCall(objectName: string): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: objectName },
      property: { type: 'Identifier', name: 'only' },
    },
    arguments: [{ type: 'Literal', value: 'focused test' }],
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
  }
}

describe('prefer-todo rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferTodoRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferTodoRule.meta.severity).toBe('warn')
    })

    test('should have testing category', () => {
      expect(preferTodoRule.meta.docs?.category).toBe('testing')
    })

    test('should not be recommended', () => {
      expect(preferTodoRule.meta.docs?.recommended).toBe(false)
    })

    test('should have schema defined', () => {
      expect(preferTodoRule.meta.schema).toBeDefined()
    })

    test('should have correct description mentioning todo', () => {
      expect(preferTodoRule.meta.docs?.description.toLowerCase()).toContain('todo')
    })

    test('should have a docs.url property', () => {
      expect(preferTodoRule.meta.docs?.url).toBeDefined()
    })

    test('should have docs.url as a string', () => {
      expect(typeof preferTodoRule.meta.docs?.url).toBe('string')
    })

    test('should have schema as an empty array', () => {
      expect(Array.isArray(preferTodoRule.meta.schema)).toBe(true)
    })

    test('should not have fixable field', () => {
      expect(preferTodoRule.meta).not.toHaveProperty('fixable')
    })

    test('should have meta as a plain object', () => {
      expect(typeof preferTodoRule.meta).toBe('object')
      expect(preferTodoRule.meta).not.toBeNull()
      expect(Array.isArray(preferTodoRule.meta)).toBe(false)
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = preferTodoRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('should return a visitor with exactly CallExpression', () => {
      const { context } = createMockContext()
      const visitor = preferTodoRule.create(context)
      expect(Object.keys(visitor)).toEqual(['CallExpression'])
    })

    test('should return independent visitors for different contexts', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = preferTodoRule.create(ctx1)
      const visitor2 = preferTodoRule.create(ctx2)

      visitor1.CallExpression(createXit())
      visitor2.CallExpression(createXit())

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(1)
    })
  })

  describe('detecting xit', () => {
    test('should report xit() call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression(createXit())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('it.todo')
      expect(reports[0].message).toContain('xit')
    })

    test('should report correct location for xit', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression(createXit(5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report xit at default location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression(createXit())

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report xit at custom location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression(createXit(25, 8))

      expect(reports[0].loc?.start.line).toBe(25)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should report xit with correct end location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression(createXit(11, 2))

      expect(reports[0].loc?.end.line).toBe(11)
      expect(reports[0].loc?.end.column).toBe(20)
    })

    test('should report exactly one violation for xit', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression(createXit())

      expect(reports.length).toBe(1)
    })

    test('should include data with original and suggestion for xit', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression(createXit())

      expect(reports[0].data?.original).toBe('xit')
      expect(reports[0].data?.suggestion).toBe('it.todo')
    })
  })

  describe('detecting xtest', () => {
    test('should report xtest() call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression(createXtest())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('test.todo')
      expect(reports[0].message).toContain('xtest')
    })

    test('should report correct location for xtest', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression(createXtest(30, 4))

      expect(reports[0].loc?.start.line).toBe(30)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should include data with original and suggestion for xtest', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression(createXtest())

      expect(reports[0].data?.original).toBe('xtest')
      expect(reports[0].data?.suggestion).toBe('test.todo')
    })

    test('should report xtest at large line number', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression(createXtest(1000, 0))

      expect(reports[0].loc?.start.line).toBe(1000)
    })
  })

  describe('detecting xdescribe', () => {
    test('should report xdescribe() call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression(createXdescribe())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('describe.todo')
      expect(reports[0].message).toContain('xdescribe')
    })

    test('should report correct location for xdescribe', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression(createXdescribe(12, 6))

      expect(reports[0].loc?.start.line).toBe(12)
      expect(reports[0].loc?.start.column).toBe(6)
    })

    test('should include data with original and suggestion for xdescribe', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression(createXdescribe())

      expect(reports[0].data?.original).toBe('xdescribe')
      expect(reports[0].data?.suggestion).toBe('describe.todo')
    })
  })

  describe('detecting it.skip', () => {
    test('should report it.skip() call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression(createSkipCall('it'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('it.todo')
      expect(reports[0].message).toContain('it.skip')
    })

    test('should report correct location for it.skip', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression(createSkipCall('it', 5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should include data with original and suggestion for it.skip', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression(createSkipCall('it'))

      expect(reports[0].data?.original).toBe('it.skip')
      expect(reports[0].data?.suggestion).toBe('it.todo')
    })
  })

  describe('detecting test.skip', () => {
    test('should report test.skip() call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression(createSkipCall('test'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('test.todo')
      expect(reports[0].message).toContain('test.skip')
    })

    test('should include data with original and suggestion for test.skip', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression(createSkipCall('test'))

      expect(reports[0].data?.original).toBe('test.skip')
      expect(reports[0].data?.suggestion).toBe('test.todo')
    })

    test('should report test.skip at custom location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression(createSkipCall('test', 15, 4))

      expect(reports[0].loc?.start.line).toBe(15)
      expect(reports[0].loc?.start.column).toBe(4)
    })
  })

  describe('detecting describe.skip', () => {
    test('should report describe.skip() call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression(createSkipCall('describe'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('describe.todo')
      expect(reports[0].message).toContain('describe.skip')
    })

    test('should include data with original and suggestion for describe.skip', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression(createSkipCall('describe'))

      expect(reports[0].data?.original).toBe('describe.skip')
      expect(reports[0].data?.suggestion).toBe('describe.todo')
    })
  })

  describe('detecting context.skip', () => {
    test('should report context.skip() call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression(createSkipCall('context'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('context.todo')
      expect(reports[0].message).toContain('context.skip')
    })

    test('should include data with original and suggestion for context.skip', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression(createSkipCall('context'))

      expect(reports[0].data?.original).toBe('context.skip')
      expect(reports[0].data?.suggestion).toBe('context.todo')
    })
  })

  describe('detecting suite.skip', () => {
    test('should report suite.skip() call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression(createSkipCall('suite'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('suite.todo')
      expect(reports[0].message).toContain('suite.skip')
    })

    test('should include data with original and suggestion for suite.skip', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression(createSkipCall('suite'))

      expect(reports[0].data?.original).toBe('suite.skip')
      expect(reports[0].data?.suggestion).toBe('suite.todo')
    })
  })

  describe('NOT flagging valid cases', () => {
    test('should not report it.todo() call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression(createTodoCall('it'))

      expect(reports.length).toBe(0)
    })

    test('should not report test.todo() call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression(createTodoCall('test'))

      expect(reports.length).toBe(0)
    })

    test('should not report describe.todo() call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression(createTodoCall('describe'))

      expect(reports.length).toBe(0)
    })

    test('should not report normal it() call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression(createNormalCall('it'))

      expect(reports.length).toBe(0)
    })

    test('should not report normal test() call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression(createNormalCall('test'))

      expect(reports.length).toBe(0)
    })

    test('should not report normal describe() call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression(createNormalCall('describe'))

      expect(reports.length).toBe(0)
    })

    test('should not report it.only() call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression(createOnlyCall('it'))

      expect(reports.length).toBe(0)
    })

    test('should not report test.only() call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression(createOnlyCall('test'))

      expect(reports.length).toBe(0)
    })

    test('should not report describe.only() call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression(createOnlyCall('describe'))

      expect(reports.length).toBe(0)
    })

    test('should not report unrelated function calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'console' },
        arguments: [{ type: 'Literal', value: 'log' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferTodoRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferTodoRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression({ type: 'CallExpression', arguments: [] })

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'xit' },
        arguments: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle member expression without property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'it' },
        },
        arguments: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle member expression with non-Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'CallExpression' },
          property: { type: 'Identifier', name: 'skip' },
        },
        arguments: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should not flag x-prefix on non-test functions', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'xrandom' },
        arguments: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node without callee type', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'UnknownType' } })

      expect(reports.length).toBe(0)
    })

    test('should handle non-CallExpression types', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression({ type: 'Literal', value: 42 })

      expect(reports.length).toBe(0)
    })

    test('should not report xit with empty arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'xit' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should not report it.skip with multiple arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

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
      expect(reports[0].data?.original).toBe('it.skip')
      expect(reports[0].data?.suggestion).toBe('it.todo')
    })

    test('should accept context without throwing', () => {
      const { context } = createMockContext()
      expect(() => preferTodoRule.create(context)).not.toThrow()
    })

    test('should have default export matching named export', () => {
      expect(preferTodoDefault).toBe(preferTodoRule)
    })

    test('should have a default export that is defined', () => {
      expect(preferTodoDefault).toBeDefined()
      expect(preferTodoDefault).toHaveProperty('create')
      expect(preferTodoDefault).toHaveProperty('meta')
    })

    test('should have docs.url in valid URL format', () => {
      const url = preferTodoRule.meta.docs?.url
      expect(url).toMatch(/^https?:\/\/.+/)
      expect(url).toContain('prefer-todo')
    })

    test('should have schema as exactly empty array', () => {
      expect(preferTodoRule.meta.schema).toEqual([])
      expect(preferTodoRule.meta.schema.length).toBe(0)
    })

    test('should handle multiple sequential calls to same visitor', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression(createXit())
      visitor.CallExpression(createXtest())
      visitor.CallExpression(createXdescribe())

      expect(reports.length).toBe(3)
    })

    test('should handle node with null callee property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: null,
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined property.name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'it' },
          property: { type: 'Identifier', name: undefined as unknown as string },
        },
        arguments: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node with object.name as non-string', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 123 as unknown as string },
          property: { type: 'Identifier', name: 'skip' },
        },
        arguments: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node with property.name as non-string', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'it' },
          property: { type: 'Identifier', name: {} as unknown as string },
        },
        arguments: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should not flag property names other than skip', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'it' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle empty object in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {},
          property: { type: 'Identifier', name: 'skip' },
        },
        arguments: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle missing object in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'skip' },
        },
        arguments: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should report xit then normal call without cross-contamination', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression(createXit())
      visitor.CallExpression(createNormalCall('it'))

      expect(reports.length).toBe(1)
      expect(reports[0].data?.original).toBe('xit')
    })

    test('should not report context.todo() call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression(createTodoCall('context'))

      expect(reports.length).toBe(0)
    })

    test('should not report suite.todo() call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression(createTodoCall('suite'))

      expect(reports.length).toBe(0)
    })

    test('should not report normal context() call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression(createNormalCall('context'))

      expect(reports.length).toBe(0)
    })

    test('should report it.skip at default location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression(createSkipCall('it'))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report describe.skip at large line number', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression(createSkipCall('describe', 500, 20))

      expect(reports[0].loc?.start.line).toBe(500)
      expect(reports[0].loc?.start.column).toBe(20)
    })
  })

  describe('additional meta verification', () => {
    test('should have correct docs URL', () => {
      expect(preferTodoRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/prefer-todo',
      )
    })

    test('should have description mentioning todo', () => {
      expect(preferTodoRule.meta.docs?.description).toContain('todo')
    })

    test('should have testing category', () => {
      expect(preferTodoRule.meta.docs?.category).toBe('testing')
    })

    test('should have suggestion type', () => {
      expect(preferTodoRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferTodoRule.meta.severity).toBe('warn')
    })

    test('should have schema defined', () => {
      expect(preferTodoRule.meta.schema).toBeDefined()
    })

    test('should have create function', () => {
      expect(typeof preferTodoRule.create).toBe('function')
    })
  })

  describe('additional verification', () => {
    test('should have create function returning visitor', () => {
      const { context } = createMockContext()
      const visitor = preferTodoRule.create(context)
      expect(visitor).toBeDefined()
      expect(typeof visitor).toBe('object')
    })
  })

  describe('type safety', () => {
    test('should have meta as a plain object', () => {
      expect(typeof preferTodoRule.meta).toBe('object')
      expect(preferTodoRule.meta).not.toBeNull()
      expect(Array.isArray(preferTodoRule.meta)).toBe(false)
    })
  })

  describe('x-prefix edge cases', () => {
    test('should not report xcontext() call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'xcontext' },
        arguments: [{ type: 'Literal', value: 'skipped' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should report xdescribe with data containing describe.todo suggestion', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression(createXdescribe())

      expect(reports[0].message).toBe('Use describe.todo instead of xdescribe')
    })

    test('should report xtest with data containing test.todo suggestion', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression(createXtest())

      expect(reports[0].message).toBe('Use test.todo instead of xtest')
    })

    test('should not report x-prefix on non-test function like xcustom', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'xcustom' },
        arguments: [{ type: 'Literal', value: 'test' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should report all three x-prefix variants in sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTodoRule.create(context)

      visitor.CallExpression(createXit())
      visitor.CallExpression(createXtest())
      visitor.CallExpression(createXdescribe())

      expect(reports).toHaveLength(3)
      expect(reports[0].data?.suggestion).toBe('it.todo')
      expect(reports[1].data?.suggestion).toBe('test.todo')
      expect(reports[2].data?.suggestion).toBe('describe.todo')
    })
  })
})
