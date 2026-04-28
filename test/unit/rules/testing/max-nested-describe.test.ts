import { describe, test, expect, vi } from 'vitest'
import { maxNestedDescribeRule } from '../../../../src/rules/testing/max-nested-describe.js'
import defaultExport from '../../../../src/rules/testing/max-nested-describe.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.test.ts',
  source = 'describe("suite", () => { it("test", () => {}); });',
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

function createDescribeCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'describe' },
    arguments: [
      { type: 'Literal', value: 'suite' },
      { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] } },
    ],
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
}

function createContextCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'context' },
    arguments: [
      { type: 'Literal', value: 'suite' },
      { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] } },
    ],
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
}

function createSuiteCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'suite' },
    arguments: [
      { type: 'Literal', value: 'suite' },
      { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] } },
    ],
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
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

function createOtherCall(name: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name },
    arguments: [],
    loc: { start: { line, column }, end: { line, column: column + 10 } },
  }
}

describe('max-nested-describe rule', () => {
  describe('meta', () => {
    test('has correct rule metadata', () => {
      expect(maxNestedDescribeRule.meta.docs.category).toBe('testing')
      expect(maxNestedDescribeRule.meta.type).toBe('suggestion')
      expect(maxNestedDescribeRule.meta.severity).toBe('warn')
      expect(maxNestedDescribeRule.meta.docs.recommended).toBe(true)
    })

    test('has description', () => {
      expect(maxNestedDescribeRule.meta.docs.description).toBeTruthy()
      expect(typeof maxNestedDescribeRule.meta.docs.description).toBe('string')
    })

    test('has url', () => {
      expect(maxNestedDescribeRule.meta.docs.url).toContain('max-nested-describe')
    })

    test('has schema', () => {
      expect(maxNestedDescribeRule.meta.schema).toHaveLength(1)
    })

    test('schema allows max option', () => {
      const schema = maxNestedDescribeRule.meta.schema[0] as Record<string, unknown>
      expect(schema.type).toBe('object')
      const props = schema.properties as Record<string, unknown>
      expect(props).toHaveProperty('max')
    })
  })

  describe('create', () => {
    test('returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = maxNestedDescribeRule.create(context)
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('returns visitor with CallExpression:exit', () => {
      const { context } = createMockContext()
      const visitor = maxNestedDescribeRule.create(context)
      expect(typeof visitor['CallExpression:exit']).toBe('function')
    })
  })

  describe('default max (5)', () => {
    test('does not report at depth 5', () => {
      const { context, reports } = createMockContext()
      const visitor = maxNestedDescribeRule.create(context)
      for (let i = 0; i < 5; i++) {
        visitor.CallExpression(createDescribeCall())
      }
      expect(reports.length).toBe(0)
    })

    test('reports at depth 6', () => {
      const { context, reports } = createMockContext()
      const visitor = maxNestedDescribeRule.create(context)
      for (let i = 0; i < 6; i++) {
        visitor.CallExpression(createDescribeCall())
      }
      expect(reports.length).toBe(1)
      expect(reports[0]!.message).toContain('6')
      expect(reports[0]!.message).toContain('5')
    })

    test('reports each level exceeding max', () => {
      const { context, reports } = createMockContext()
      const visitor = maxNestedDescribeRule.create(context)
      for (let i = 0; i < 8; i++) {
        visitor.CallExpression(createDescribeCall())
      }
      expect(reports.length).toBe(3)
    })
  })

  describe('custom max option', () => {
    test('does not report at custom max 3', () => {
      const { context, reports } = createMockContext({ max: 3 })
      const visitor = maxNestedDescribeRule.create(context)
      for (let i = 0; i < 3; i++) {
        visitor.CallExpression(createDescribeCall())
      }
      expect(reports.length).toBe(0)
    })

    test('reports at custom max 3 + 1', () => {
      const { context, reports } = createMockContext({ max: 3 })
      const visitor = maxNestedDescribeRule.create(context)
      for (let i = 0; i < 4; i++) {
        visitor.CallExpression(createDescribeCall())
      }
      expect(reports.length).toBe(1)
      expect(reports[0]!.message).toContain('4')
      expect(reports[0]!.message).toContain('3')
    })

    test('max of 0 reports at depth 1', () => {
      const { context, reports } = createMockContext({ max: 0 })
      const visitor = maxNestedDescribeRule.create(context)
      visitor.CallExpression(createDescribeCall())
      expect(reports.length).toBe(1)
    })

    test('max of 1 allows single describe', () => {
      const { context, reports } = createMockContext({ max: 1 })
      const visitor = maxNestedDescribeRule.create(context)
      visitor.CallExpression(createDescribeCall())
      expect(reports.length).toBe(0)
    })

    test('max of 1 reports nested describe', () => {
      const { context, reports } = createMockContext({ max: 1 })
      const visitor = maxNestedDescribeRule.create(context)
      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createDescribeCall())
      expect(reports.length).toBe(1)
    })
  })

  describe('describe exit decrements depth', () => {
    test('does not report after exit and re-enter', () => {
      const { context, reports } = createMockContext({ max: 2 })
      const visitor = maxNestedDescribeRule.create(context)
      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createDescribeCall())
      visitor['CallExpression:exit'](createDescribeCall())
      visitor.CallExpression(createDescribeCall())
      expect(reports.length).toBe(0)
    })

    test('reports after re-enter exceeds max', () => {
      const { context, reports } = createMockContext({ max: 2 })
      const visitor = maxNestedDescribeRule.create(context)
      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createDescribeCall())
      visitor['CallExpression:exit'](createDescribeCall())
      visitor['CallExpression:exit'](createDescribeCall())
      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createDescribeCall())
      expect(reports.length).toBe(3)
    })
  })

  describe('describe variants', () => {
    test('tracks context() calls as describe', () => {
      const { context, reports } = createMockContext({ max: 2 })
      const visitor = maxNestedDescribeRule.create(context)
      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createContextCall())
      visitor.CallExpression(createContextCall())
      expect(reports.length).toBe(1)
    })

    test('tracks suite() calls as describe', () => {
      const { context, reports } = createMockContext({ max: 2 })
      const visitor = maxNestedDescribeRule.create(context)
      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createSuiteCall())
      visitor.CallExpression(createSuiteCall())
      expect(reports.length).toBe(1)
    })
  })

  describe('non-describe calls', () => {
    test('does not count it() calls', () => {
      const { context, reports } = createMockContext({ max: 2 })
      const visitor = maxNestedDescribeRule.create(context)
      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createItCall())
      visitor.CallExpression(createItCall())
      visitor.CallExpression(createItCall())
      expect(reports.length).toBe(0)
    })

    test('does not count other function calls', () => {
      const { context, reports } = createMockContext({ max: 2 })
      const visitor = maxNestedDescribeRule.create(context)
      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createOtherCall('beforeEach'))
      visitor.CallExpression(createOtherCall('afterEach'))
      expect(reports.length).toBe(0)
    })
  })

  describe('member expressions', () => {
    test('tracks describe.only as describe', () => {
      const { context, reports } = createMockContext({ max: 2 })
      const visitor = maxNestedDescribeRule.create(context)
      visitor.CallExpression(createDescribeCall())
      const describeOnly = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'describe' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [
          { type: 'Literal', value: 'suite' },
          { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(describeOnly)
      visitor.CallExpression(createDescribeCall())
      expect(reports.length).toBe(1)
    })

    test('tracks context.skip as describe', () => {
      const { context, reports } = createMockContext({ max: 1 })
      const visitor = maxNestedDescribeRule.create(context)
      visitor.CallExpression(createContextCall())
      visitor.CallExpression(createContextCall())
      expect(reports.length).toBe(1)
    })
  })

  describe('error message', () => {
    test('includes current depth and max', () => {
      const { context, reports } = createMockContext({ max: 3 })
      const visitor = maxNestedDescribeRule.create(context)
      for (let i = 0; i < 4; i++) {
        visitor.CallExpression(createDescribeCall())
      }
      expect(reports[0]!.message).toContain('4')
      expect(reports[0]!.message).toContain('3')
      expect(reports[0]!.message).toContain('describe')
    })

    test('includes location of the offending describe', () => {
      const { context, reports } = createMockContext({ max: 1 })
      const visitor = maxNestedDescribeRule.create(context)
      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createDescribeCall(7, 12))
      expect(reports[0]!.loc?.start.line).toBe(7)
      expect(reports[0]!.loc?.start.column).toBe(12)
    })
  })

  describe('edge cases', () => {
    test('handles null node', () => {
      const { context, reports } = createMockContext()
      const visitor = maxNestedDescribeRule.create(context)
      visitor.CallExpression(null)
      expect(reports.length).toBe(0)
    })

    test('handles undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = maxNestedDescribeRule.create(context)
      visitor.CallExpression(undefined)
      expect(reports.length).toBe(0)
    })

    test('handles node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = maxNestedDescribeRule.create(context)
      visitor.CallExpression({ type: 'CallExpression' })
      expect(reports.length).toBe(0)
    })

    test('handles node without loc', () => {
      const { context, reports } = createMockContext({ max: 0 })
      const visitor = maxNestedDescribeRule.create(context)
      const noLoc = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'describe' },
        arguments: [{ type: 'Literal', value: 'suite' }],
      }
      visitor.CallExpression(noLoc)
      expect(reports.length).toBe(1)
    })
  })

  describe('state isolation', () => {
    test('separate visitors do not share depth', () => {
      const { context: ctx1, reports: reports1 } = createMockContext({ max: 2 })
      const { context: ctx2, reports: reports2 } = createMockContext({ max: 2 })

      const visitor1 = maxNestedDescribeRule.create(ctx1)
      const visitor2 = maxNestedDescribeRule.create(ctx2)

      visitor1.CallExpression(createDescribeCall())
      visitor1.CallExpression(createDescribeCall())
      visitor1.CallExpression(createDescribeCall())

      visitor2.CallExpression(createDescribeCall())

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(0)
    })
  })

  describe('default export', () => {
    test('default export equals named export', () => {
      expect(defaultExport).toBe(maxNestedDescribeRule)
    })
  })
})
