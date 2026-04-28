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
})
