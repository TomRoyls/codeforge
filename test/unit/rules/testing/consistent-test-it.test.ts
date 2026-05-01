import { describe, test, expect, vi } from 'vitest'
import { consistentTestItRule } from '../../../../src/rules/testing/consistent-test-it.js'
import defaultExport from '../../../../src/rules/testing/consistent-test-it.js'
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

function createItCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'it' },
    arguments: [
      { type: 'Literal', value: 'test' },
      { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] } },
    ],
    loc: { start: { line, column }, end: { line, column: column + 20 } },
  }
}

function createTestCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'test' },
    arguments: [
      { type: 'Literal', value: 'test' },
      { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] } },
    ],
    loc: { start: { line, column }, end: { line, column: column + 20 } },
  }
}

function createMemberCall(name: string, method: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name },
      property: { type: 'Identifier', name: method },
    },
    arguments: [
      { type: 'Literal', value: 'test' },
      { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] } },
    ],
    loc: { start: { line, column }, end: { line, column: column + 25 } },
  }
}

function createOtherCall(name: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name },
    arguments: [],
    loc: { start: { line, column }, end: { line, column: column + 10 } },
  }
}

describe('consistent-test-it rule', () => {
  describe('meta', () => {
    test('has correct rule metadata', () => {
      expect(consistentTestItRule.meta.docs.category).toBe('testing')
      expect(consistentTestItRule.meta.type).toBe('suggestion')
      expect(consistentTestItRule.meta.severity).toBe('warn')
      expect(consistentTestItRule.meta.docs.recommended).toBe(true)
    })

    test('has description', () => {
      expect(consistentTestItRule.meta.docs.description).toBeTruthy()
    })

    test('has url', () => {
      expect(consistentTestItRule.meta.docs.url).toContain('consistent-test-it')
    })

    test('schema has fn option', () => {
      const schema = consistentTestItRule.meta.schema[0] as Record<string, unknown>
      expect(schema.type).toBe('object')
      const props = schema.properties as Record<string, unknown>
      expect(props).toHaveProperty('fn')
    })
  })

  describe('default (fn: it)', () => {
    test('does not report it()', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createItCall())
      expect(reports.length).toBe(0)
    })

    test('reports test()', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createTestCall())
      expect(reports.length).toBe(1)
      expect(reports[0]!.message).toContain('it()')
      expect(reports[0]!.message).toContain('test()')
    })

    test('reports test.only()', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createMemberCall('test', 'only'))
      expect(reports.length).toBe(1)
    })

    test('does not report it.only()', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createMemberCall('it', 'only'))
      expect(reports.length).toBe(0)
    })
  })

  describe('fn: test', () => {
    test('does not report test()', () => {
      const { context, reports } = createMockContext({ fn: 'test' })
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createTestCall())
      expect(reports.length).toBe(0)
    })

    test('reports it()', () => {
      const { context, reports } = createMockContext({ fn: 'test' })
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createItCall())
      expect(reports.length).toBe(1)
      expect(reports[0]!.message).toContain('test()')
      expect(reports[0]!.message).toContain('it()')
    })

    test('reports it.skip()', () => {
      const { context, reports } = createMockContext({ fn: 'test' })
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createMemberCall('it', 'skip'))
      expect(reports.length).toBe(1)
    })

    test('does not report test.skip()', () => {
      const { context, reports } = createMockContext({ fn: 'test' })
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createMemberCall('test', 'skip'))
      expect(reports.length).toBe(0)
    })
  })

  describe('non-test calls', () => {
    test('does not report describe()', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createOtherCall('describe'))
      expect(reports.length).toBe(0)
    })

    test('does not report expect()', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createOtherCall('expect'))
      expect(reports.length).toBe(0)
    })

    test('does not report beforeEach()', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createOtherCall('beforeEach'))
      expect(reports.length).toBe(0)
    })
  })

  describe('location', () => {
    test('reports correct line and column', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createTestCall(10, 5))
      expect(reports[0]!.loc?.start.line).toBe(10)
      expect(reports[0]!.loc?.start.column).toBe(5)
    })
  })

  describe('multiple calls', () => {
    test('reports each disallowed call', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createItCall())
      visitor.CallExpression(createTestCall())
      visitor.CallExpression(createTestCall())
      expect(reports.length).toBe(2)
    })
  })

  describe('edge cases', () => {
    test('handles null node', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(null)
      expect(reports.length).toBe(0)
    })

    test('handles undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(undefined)
      expect(reports.length).toBe(0)
    })

    test('handles node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression({ type: 'CallExpression' })
      expect(reports.length).toBe(0)
    })

    test('handles node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      const noLoc = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'test' },
        arguments: [{ type: 'Literal', value: 'test' }],
      }
      visitor.CallExpression(noLoc)
      expect(reports.length).toBe(1)
    })
  })

  describe('state isolation', () => {
    test('separate visitors work independently', () => {
      const { context: ctx1, reports: reports1 } = createMockContext()
      const { context: ctx2, reports: reports2 } = createMockContext({ fn: 'test' })

      const visitor1 = consistentTestItRule.create(ctx1)
      const visitor2 = consistentTestItRule.create(ctx2)

      visitor1.CallExpression(createItCall())
      visitor2.CallExpression(createItCall())

      expect(reports1.length).toBe(0)
      expect(reports2.length).toBe(1)
    })
  })

  describe('default export', () => {
    test('default export equals named export', () => {
      expect(defaultExport).toBe(consistentTestItRule)
    })
  })

  describe('meta expanded', () => {
    test('schema is an array', () => {
      expect(Array.isArray(consistentTestItRule.meta.schema)).toBe(true)
    })

    test('schema has one item', () => {
      expect(consistentTestItRule.meta.schema).toHaveLength(1)
    })

    test('meta is a plain object', () => {
      expect(typeof consistentTestItRule.meta).toBe('object')
      expect(consistentTestItRule.meta).not.toBeNull()
      expect(Array.isArray(consistentTestItRule.meta)).toBe(false)
    })

    test('description mentions consistency', () => {
      expect(consistentTestItRule.meta.docs?.description.toLowerCase()).toContain('consistent')
    })

    test('description mentions it or test', () => {
      const desc = consistentTestItRule.meta.docs?.description.toLowerCase() ?? ''
      expect(desc.includes('it()') || desc.includes('test()')).toBe(true)
    })
  })

  describe('create returns visitor', () => {
    test('returns object with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
    })

    test('CallExpression is a function', () => {
      const { context } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      expect(typeof visitor.CallExpression).toBe('function')
    })
  })

  describe('it.each and test.each (fn: it default)', () => {
    test('does not report it.each()', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createMemberCall('it', 'each'))
      expect(reports.length).toBe(0)
    })

    test('reports test.each()', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createMemberCall('test', 'each'))
      expect(reports.length).toBe(1)
    })
  })

  describe('it.concurrent and test.concurrent (fn: it default)', () => {
    test('does not report it.concurrent()', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createMemberCall('it', 'concurrent'))
      expect(reports.length).toBe(0)
    })

    test('reports test.concurrent()', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createMemberCall('test', 'concurrent'))
      expect(reports.length).toBe(1)
    })
  })

  describe('it.todo and test.todo (fn: it default)', () => {
    test('does not report it.todo()', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createMemberCall('it', 'todo'))
      expect(reports.length).toBe(0)
    })

    test('reports test.todo()', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createMemberCall('test', 'todo'))
      expect(reports.length).toBe(1)
    })
  })

  describe('fn: test mode with member calls', () => {
    test('does not report test.each()', () => {
      const { context, reports } = createMockContext({ fn: 'test' })
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createMemberCall('test', 'each'))
      expect(reports.length).toBe(0)
    })

    test('reports it.each() when fn: test', () => {
      const { context, reports } = createMockContext({ fn: 'test' })
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createMemberCall('it', 'each'))
      expect(reports.length).toBe(1)
    })

    test('does not report test.concurrent()', () => {
      const { context, reports } = createMockContext({ fn: 'test' })
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createMemberCall('test', 'concurrent'))
      expect(reports.length).toBe(0)
    })

    test('reports it.concurrent() when fn: test', () => {
      const { context, reports } = createMockContext({ fn: 'test' })
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createMemberCall('it', 'concurrent'))
      expect(reports.length).toBe(1)
    })
  })

  describe('mixed calls in one visitor', () => {
    test('reports only disallowed calls in mixed file', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createItCall())
      visitor.CallExpression(createTestCall())
      visitor.CallExpression(createItCall())
      visitor.CallExpression(createTestCall())
      visitor.CallExpression(createOtherCall('describe'))
      visitor.CallExpression(createMemberCall('it', 'only'))
      visitor.CallExpression(createMemberCall('test', 'skip'))
      expect(reports.length).toBe(3)
    })

    test('with fn: test, reports only it calls in mixed file', () => {
      const { context, reports } = createMockContext({ fn: 'test' })
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createItCall())
      visitor.CallExpression(createTestCall())
      visitor.CallExpression(createItCall())
      visitor.CallExpression(createMemberCall('it', 'only'))
      visitor.CallExpression(createMemberCall('test', 'skip'))
      expect(reports.length).toBe(3)
    })
  })

  describe('edge cases expanded', () => {
    test('handles non-CallExpression type', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression({ type: 'Literal', value: 42 })
      expect(reports.length).toBe(0)
    })

    test('handles member expression with non-Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'CallExpression' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('handles string node', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression('string node')
      expect(reports.length).toBe(0)
    })

    test('handles numeric node', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(123)
      expect(reports.length).toBe(0)
    })

    test('handles call with non-String callee name', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })
  })

  describe('report message content', () => {
    test('default mode message mentions both it and test', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createTestCall())
      expect(reports[0]!.message).toContain("it()")
      expect(reports[0]!.message).toContain("test()")
    })

    test('fn: test mode message mentions both test and it', () => {
      const { context, reports } = createMockContext({ fn: 'test' })
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createItCall())
      expect(reports[0]!.message).toContain("test()")
      expect(reports[0]!.message).toContain("it()")
    })

    test('message mentions consistency', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createTestCall())
      expect(reports[0]!.message.toLowerCase()).toContain('consistency')
    })
  })

  describe('report location details', () => {
    test('reports correct end location', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createTestCall(5, 10))
      expect(reports[0]!.loc?.end.line).toBe(5)
      expect(reports[0]!.loc?.end.column).toBe(30)
    })

    test('reports location for member expression calls', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createMemberCall('test', 'only', 8, 3))
      expect(reports[0]!.loc?.start.line).toBe(8)
      expect(reports[0]!.loc?.start.column).toBe(3)
    })
  })

  describe('it.skip and test.skip (fn: it default)', () => {
    test('does not report it.skip()', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createMemberCall('it', 'skip'))
      expect(reports.length).toBe(0)
    })

    test('reports test.skip()', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createMemberCall('test', 'skip'))
      expect(reports.length).toBe(1)
    })
  })

  describe('it.failing and test.failing (fn: it default)', () => {
    test('does not report it.failing()', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createMemberCall('it', 'failing'))
      expect(reports.length).toBe(0)
    })

    test('reports test.failing()', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createMemberCall('test', 'failing'))
      expect(reports.length).toBe(1)
    })
  })

  describe('fn: test mode with additional member calls', () => {
    test('does not report test.todo()', () => {
      const { context, reports } = createMockContext({ fn: 'test' })
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createMemberCall('test', 'todo'))
      expect(reports.length).toBe(0)
    })

    test('reports it.todo() when fn: test', () => {
      const { context, reports } = createMockContext({ fn: 'test' })
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createMemberCall('it', 'todo'))
      expect(reports.length).toBe(1)
    })

    test('does not report test.failing()', () => {
      const { context, reports } = createMockContext({ fn: 'test' })
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createMemberCall('test', 'failing'))
      expect(reports.length).toBe(0)
    })

    test('reports it.failing() when fn: test', () => {
      const { context, reports } = createMockContext({ fn: 'test' })
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createMemberCall('it', 'failing'))
      expect(reports.length).toBe(1)
    })
  })

  describe('member expression edge cases', () => {
    test('handles member expression with non-Identifier property', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'test' },
          property: { type: 'Literal', value: 'computed' },
          computed: true,
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(1)
    })

    test('handles member expression with non-Identifier object name', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 123 as unknown as string },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('handles chained member expression (it.concurrent.skip)', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'it' },
            property: { type: 'Identifier', name: 'concurrent' },
          },
          property: { type: 'Identifier', name: 'skip' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })
  })

  describe('callee edge cases', () => {
    test('handles callee with no type property', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { name: 'test' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('handles CallExpression with undefined callee', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: undefined,
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('handles CallExpression with null callee', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: null,
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })
  })

  describe('options handling', () => {
    test('works with empty options object', () => {
      const { context, reports } = createMockContext({})
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createTestCall())
      expect(reports.length).toBe(1)
    })

    test('ignores unknown option properties', () => {
      const { context, reports } = createMockContext({ fn: 'test', unknownProp: 'value' })
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createItCall())
      expect(reports.length).toBe(1)
    })

    test('defaults to fn: it when fn is undefined', () => {
      const { context, reports } = createMockContext({ fn: undefined })
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createItCall())
      expect(reports.length).toBe(0)
      visitor.CallExpression(createTestCall())
      expect(reports.length).toBe(1)
    })
  })

  describe('primitive node types', () => {
    test('handles boolean true node', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(true)
      expect(reports.length).toBe(0)
    })

    test('handles boolean false node', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(false)
      expect(reports.length).toBe(0)
    })

    test('handles array node', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression([])
      expect(reports.length).toBe(0)
    })
  })

  describe('non-test function names', () => {
    test('does not report arbitrary function calls', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createOtherCall('someFunction'))
      expect(reports.length).toBe(0)
    })

    test('does not report afterEach()', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createOtherCall('afterEach'))
      expect(reports.length).toBe(0)
    })

    test('does not report afterAll()', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createOtherCall('afterAll'))
      expect(reports.length).toBe(0)
    })

    test('does not report beforeAll()', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createOtherCall('beforeAll'))
      expect(reports.length).toBe(0)
    })

    test('does not report vi calls', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createOtherCall('vi'))
      expect(reports.length).toBe(0)
    })
  })

  describe('multiple violations report correct locations', () => {
    test('each report has its own location', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createTestCall(3, 4))
      visitor.CallExpression(createTestCall(7, 1))
      visitor.CallExpression(createTestCall(12, 8))
      expect(reports).toHaveLength(3)
      expect(reports[0]!.loc?.start.line).toBe(3)
      expect(reports[1]!.loc?.start.line).toBe(7)
      expect(reports[2]!.loc?.start.line).toBe(12)
    })
  })

  describe('schema details', () => {
    test('schema fn property has enum with it and test', () => {
      const schema = consistentTestItRule.meta.schema[0] as Record<string, unknown>
      const props = schema.properties as Record<string, unknown>
      const fnProp = props.fn as Record<string, unknown>
      const enumValues = fnProp.enum as string[]
      expect(enumValues).toContain('it')
      expect(enumValues).toContain('test')
    })

    test('schema has additionalProperties false', () => {
      const schema = consistentTestItRule.meta.schema[0] as Record<string, unknown>
      expect(schema.additionalProperties).toBe(false)
    })

    test('schema fn property type is string', () => {
      const schema = consistentTestItRule.meta.schema[0] as Record<string, unknown>
      const props = schema.properties as Record<string, unknown>
      const fnProp = props.fn as Record<string, unknown>
      expect(fnProp.type).toBe('string')
    })
  })

  describe('visitor reuse', () => {
    test('same visitor handles multiple allowed calls', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createItCall())
      visitor.CallExpression(createItCall())
      visitor.CallExpression(createItCall())
      expect(reports.length).toBe(0)
    })

    test('same visitor handles mix of allowed and disallowed', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createItCall())
      visitor.CallExpression(createTestCall(2, 0))
      visitor.CallExpression(createItCall())
      visitor.CallExpression(createTestCall(4, 0))
      expect(reports).toHaveLength(2)
      expect(reports[0]!.loc?.start.line).toBe(2)
      expect(reports[1]!.loc?.start.line).toBe(4)
    })
  })

  describe('fn: test with all modifiers', () => {
    test('reports it.only() when fn: test', () => {
      const { context, reports } = createMockContext({ fn: 'test' })
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createMemberCall('it', 'only'))
      expect(reports.length).toBe(1)
    })

    test('does not report test.only() when fn: test', () => {
      const { context, reports } = createMockContext({ fn: 'test' })
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createMemberCall('test', 'only'))
      expect(reports.length).toBe(0)
    })

    test('reports it.skip() when fn: test', () => {
      const { context, reports } = createMockContext({ fn: 'test' })
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createMemberCall('it', 'skip'))
      expect(reports.length).toBe(1)
    })

    test('does not report test.skip() when fn: test', () => {
      const { context, reports } = createMockContext({ fn: 'test' })
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createMemberCall('test', 'skip'))
      expect(reports.length).toBe(0)
    })
  })

  describe('report message format', () => {
    test('default mode message uses single quotes', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createTestCall())
      expect(reports[0]!.message).toContain("'it()'")
      expect(reports[0]!.message).toContain("'test()'")
    })

    test('fn: test mode message uses single quotes', () => {
      const { context, reports } = createMockContext({ fn: 'test' })
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createItCall())
      expect(reports[0]!.message).toContain("'test()'")
      expect(reports[0]!.message).toContain("'it()'")
    })

    test('message says "instead of" with period', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createTestCall())
      expect(reports[0]!.message).toContain('instead of')
      expect(reports[0]!.message).toMatch(/\.$/)
    })

    test('member call message format is same as direct call', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createMemberCall('test', 'only'))
      expect(reports[0]!.message).toContain("'it()'")
      expect(reports[0]!.message).toContain("'test()'")
    })
  })

  // SECTION: additional coverage
  describe('additional coverage', () => {
    test('should report test.each when preferring it', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createMemberCall('test', 'each'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'it()'")
    })

    test('should report it.skip when preferring test', () => {
      const { context, reports } = createMockContext({ fn: 'test' })
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression(createMemberCall('it', 'skip'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'test()'")
    })

    test('should not report describe call regardless of preference', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTestItRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'describe' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('meta recommended should be true', () => {
      expect(consistentTestItRule.meta.docs?.recommended).toBe(true)
    })
  })
})
