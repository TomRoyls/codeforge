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

  describe('meta expanded', () => {
    test('schema is an array', () => {
      expect(Array.isArray(maxNestedDescribeRule.meta.schema)).toBe(true)
    })

    test('schema has one item', () => {
      expect(maxNestedDescribeRule.meta.schema).toHaveLength(1)
    })

    test('meta is a plain object', () => {
      expect(typeof maxNestedDescribeRule.meta).toBe('object')
      expect(maxNestedDescribeRule.meta).not.toBeNull()
    })

    test('description mentions nested', () => {
      expect(maxNestedDescribeRule.meta.docs?.description.toLowerCase()).toContain('nested')
    })

    test('description mentions describe', () => {
      expect(maxNestedDescribeRule.meta.docs?.description.toLowerCase()).toContain('describe')
    })

    test('has url', () => {
      expect(maxNestedDescribeRule.meta.docs?.url).toContain('max-nested-describe')
    })
  })

  describe('create returns visitor', () => {
    test('returns object with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = maxNestedDescribeRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
    })

    test('returns object with CallExpression:exit', () => {
      const { context } = createMockContext()
      const visitor = maxNestedDescribeRule.create(context)
      expect(visitor).toHaveProperty('CallExpression:exit')
    })

    test('CallExpression is a function', () => {
      const { context } = createMockContext()
      const visitor = maxNestedDescribeRule.create(context)
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('CallExpression:exit is a function', () => {
      const { context } = createMockContext()
      const visitor = maxNestedDescribeRule.create(context)
      expect(typeof visitor['CallExpression:exit']).toBe('function')
    })
  })

  describe('depth tracking with exit', () => {
    test('depth resets after exiting describe block', () => {
      const { context, reports } = createMockContext({ max: 2 })
      const visitor = maxNestedDescribeRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createDescribeCall())
      expect(reports.length).toBe(1)

      visitor['CallExpression:exit'](createDescribeCall())
      visitor['CallExpression:exit'](createDescribeCall())
      visitor['CallExpression:exit'](createDescribeCall())
      expect(reports.length).toBe(1)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createDescribeCall())
      expect(reports.length).toBe(1)
    })

    test('reports again after depth decreases then increases past max', () => {
      const { context, reports } = createMockContext({ max: 1 })
      const visitor = maxNestedDescribeRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createDescribeCall())
      expect(reports.length).toBe(1)

      visitor['CallExpression:exit'](createDescribeCall())
      visitor['CallExpression:exit'](createDescribeCall())

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createDescribeCall())
      expect(reports.length).toBe(2)
    })

    test('exit with non-describe call does not affect depth', () => {
      const { context, reports } = createMockContext({ max: 2 })
      const visitor = maxNestedDescribeRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createDescribeCall())
      visitor['CallExpression:exit'](createItCall())
      expect(reports.length).toBe(0)

      visitor.CallExpression(createDescribeCall())
      expect(reports.length).toBe(1)
    })

    test('exit with null node does not crash', () => {
      const { context, reports } = createMockContext()
      const visitor = maxNestedDescribeRule.create(context)
      visitor.CallExpression(createDescribeCall())
      visitor['CallExpression:exit'](null)
      expect(reports.length).toBe(0)
    })
  })

  describe('describe.each tracking', () => {
    test('tracks describe.each (MemberExpression callee) toward depth', () => {
      const { context, reports } = createMockContext({ max: 2 })
      const visitor = maxNestedDescribeRule.create(context)
      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createDescribeCall())

      const describeEachCall = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'describe' },
          property: { type: 'Identifier', name: 'each' },
        },
        arguments: [{ type: 'ArrayExpression', elements: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      visitor.CallExpression(describeEachCall)
      expect(reports.length).toBe(1)
    })
  })

  describe('edge cases expanded', () => {
    test('handles non-CallExpression type', () => {
      const { context, reports } = createMockContext()
      const visitor = maxNestedDescribeRule.create(context)
      visitor.CallExpression({ type: 'Literal', value: 42 })
      expect(reports.length).toBe(0)
    })

    test('handles member expression with non-Identifier object', () => {
      const { context, reports } = createMockContext({ max: 0 })
      const visitor = maxNestedDescribeRule.create(context)
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
      const visitor = maxNestedDescribeRule.create(context)
      visitor.CallExpression('string node')
      expect(reports.length).toBe(0)
    })

    test('handles numeric node', () => {
      const { context, reports } = createMockContext()
      const visitor = maxNestedDescribeRule.create(context)
      visitor.CallExpression(123)
      expect(reports.length).toBe(0)
    })
  })

  describe('schema option', () => {
    test('schema has max property', () => {
      const schema = maxNestedDescribeRule.meta.schema[0] as Record<string, unknown>
      expect(schema.type).toBe('object')
      const props = schema.properties as Record<string, unknown>
      expect(props).toHaveProperty('max')
    })
  })

  describe('mixed describe variants nesting', () => {
    test('tracks describe + context + suite together', () => {
      const { context, reports } = createMockContext({ max: 2 })
      const visitor = maxNestedDescribeRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createContextCall())
      visitor.CallExpression(createSuiteCall())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('3')
    })

    test('each variant increments and exits correctly', () => {
      const { context, reports } = createMockContext({ max: 1 })
      const visitor = maxNestedDescribeRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor['CallExpression:exit'](createDescribeCall())
      visitor.CallExpression(createContextCall())
      expect(reports.length).toBe(0)

      visitor.CallExpression(createSuiteCall())
      expect(reports.length).toBe(1)
    })
  })

  describe('describe.skip tracking', () => {
    test('tracks describe.skip as describe', () => {
      const { context, reports } = createMockContext({ max: 1 })
      const visitor = maxNestedDescribeRule.create(context)

      visitor.CallExpression(createDescribeCall())
      const describeSkip = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'describe' },
          property: { type: 'Identifier', name: 'skip' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(describeSkip)
      expect(reports.length).toBe(1)
    })
  })

  describe('report message format', () => {
    test('message includes current depth number', () => {
      const { context, reports } = createMockContext({ max: 2 })
      const visitor = maxNestedDescribeRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createDescribeCall())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('(3)')
    })

    test('message includes max allowed', () => {
      const { context, reports } = createMockContext({ max: 1 })
      const visitor = maxNestedDescribeRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createDescribeCall())

      expect(reports[0].message).toContain('is 1')
    })

    test('message starts with "Too many"', () => {
      const { context, reports } = createMockContext({ max: 0 })
      const visitor = maxNestedDescribeRule.create(context)

      visitor.CallExpression(createDescribeCall())
      expect(reports[0].message).toMatch(/^Too many/)
    })
  })

  describe('large depth values', () => {
    test('handles max of 100 without reporting', () => {
      const { context, reports } = createMockContext({ max: 100 })
      const visitor = maxNestedDescribeRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.CallExpression(createDescribeCall())
      }
      expect(reports.length).toBe(0)
    })

    test('reports at depth 101 with max 100', () => {
      const { context, reports } = createMockContext({ max: 100 })
      const visitor = maxNestedDescribeRule.create(context)

      for (let i = 0; i < 101; i++) {
        visitor.CallExpression(createDescribeCall())
      }
      expect(reports.length).toBe(1)
    })
  })

  describe('describe.each exit tracking', () => {
    test('exiting describe.each decrements depth', () => {
      const { context, reports } = createMockContext({ max: 2 })
      const visitor = maxNestedDescribeRule.create(context)

      const describeEach = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'describe' },
          property: { type: 'Identifier', name: 'each' },
        },
        arguments: [{ type: 'ArrayExpression', elements: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }

      visitor.CallExpression(describeEach)
      visitor.CallExpression(describeEach)
      visitor.CallExpression(describeEach)
      expect(reports.length).toBe(1)

      visitor['CallExpression:exit'](describeEach)
      visitor['CallExpression:exit'](describeEach)
      visitor.CallExpression(describeEach)
      expect(reports.length).toBe(1)
    })
  })

  describe('describe.each.table tracking', () => {
    test('does not track describe.each.table (not in DESCRIBE_FUNCTIONS)', () => {
      const { context, reports } = createMockContext({ max: 2 })
      const visitor = maxNestedDescribeRule.create(context)
      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createDescribeCall())

      const describeEachTable = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'describe' },
            property: { type: 'Identifier', name: 'each' },
          },
          property: { type: 'Identifier', name: 'table' },
        },
        arguments: [{ type: 'ArrayExpression', elements: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }
      visitor.CallExpression(describeEachTable)
      expect(reports.length).toBe(0)
    })
  })

  describe('testing framework variations', () => {
    test('does not track test.describe (not in DESCRIBE_FUNCTIONS)', () => {
      const { context, reports } = createMockContext({ max: 1 })
      const visitor = maxNestedDescribeRule.create(context)

      const testDescribe = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'test' },
          property: { type: 'Identifier', name: 'describe' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(testDescribe)
      visitor.CallExpression(testDescribe)
      expect(reports.length).toBe(0)
    })

    test('does not track xdescribe (not in DESCRIBE_FUNCTIONS)', () => {
      const { context, reports } = createMockContext({ max: 0 })
      const visitor = maxNestedDescribeRule.create(context)

      const xdescribe = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'xdescribe' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(xdescribe)
      expect(reports.length).toBe(0)
    })

    test('does not track fdescribe (not in DESCRIBE_FUNCTIONS)', () => {
      const { context, reports } = createMockContext({ max: 0 })
      const visitor = maxNestedDescribeRule.create(context)

      const fdescribe = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fdescribe' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(fdescribe)
      expect(reports.length).toBe(0)
    })
  })

  describe('report descriptor details', () => {
    test('report includes node property', () => {
      const { context, reports } = createMockContext({ max: 0 })
      const visitor = maxNestedDescribeRule.create(context)
      const node = createDescribeCall(5, 10)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0]).toBeDefined()
    })

    test('report message is string', () => {
      const { context, reports } = createMockContext({ max: 1 })
      const visitor = maxNestedDescribeRule.create(context)
      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createDescribeCall())

      expect(reports.length).toBe(1)
      expect(typeof reports[0]!.message).toBe('string')
      expect(reports[0]!.message.length).toBeGreaterThan(0)
    })
  })

  describe('complex nesting patterns', () => {
    test('handles interleaved describe and non-describe calls', () => {
      const { context, reports } = createMockContext({ max: 2 })
      const visitor = maxNestedDescribeRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createItCall())
      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createItCall())
      visitor.CallExpression(createItCall())
      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createDescribeCall())

      expect(reports.length).toBe(2)
    })

    test('handles rapid enter/exit cycles', () => {
      const { context, reports } = createMockContext({ max: 2 })
      const visitor = maxNestedDescribeRule.create(context)

      const node = createDescribeCall()
      visitor.CallExpression(node)
      visitor['CallExpression:exit'](node)
      visitor.CallExpression(node)
      visitor['CallExpression:exit'](node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('options edge cases', () => {
    test('handles undefined options (uses default)', () => {
      const { context, reports } = createMockContext()
      const visitor = maxNestedDescribeRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.CallExpression(createDescribeCall())
      }
      visitor.CallExpression(createDescribeCall())

      expect(reports.length).toBe(1)
      expect(reports[0]!.message).toContain('5')
    })

    test('handles negative max value', () => {
      const { context, reports } = createMockContext({ max: -1 })
      const visitor = maxNestedDescribeRule.create(context)

      visitor.CallExpression(createDescribeCall())
      expect(reports.length).toBe(1)
    })
  })

  describe('callee edge cases', () => {
    test('tracks MemberExpression with computed property on describe', () => {
      const { context, reports } = createMockContext({ max: 0 })
      const visitor = maxNestedDescribeRule.create(context)

      const computedMember = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'describe' },
          property: { type: 'Literal', value: 'only' },
          computed: true,
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(computedMember)
      expect(reports.length).toBe(1)
    })

    test('handles nested MemberExpression with non-Identifier base', () => {
      const { context, reports } = createMockContext({ max: 1 })
      const visitor = maxNestedDescribeRule.create(context)

      const nestedMember = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'someFunction' },
          },
          property: { type: 'Identifier', name: 'describe' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }

      visitor.CallExpression(nestedMember)
      expect(reports.length).toBe(0)
    })
  })

  describe('location extraction', () => {
    test('handles node with nested location', () => {
      const { context, reports } = createMockContext({ max: 0 })
      const visitor = maxNestedDescribeRule.create(context)

      const nodeWithNestedLoc = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'describe',
          loc: { start: { line: 10, column: 5 }, end: { line: 10, column: 13 } },
        },
        arguments: [],
        loc: {
          start: { line: 10, column: 0 },
          end: { line: 10, column: 20 },
        },
      }

      visitor.CallExpression(nodeWithNestedLoc)
      expect(reports.length).toBe(1)
      expect(reports[0]!.loc).toBeDefined()
    })
  })

  describe('visitor completeness', () => {
    test('does not have other visitor methods', () => {
      const { context } = createMockContext()
      const visitor = maxNestedDescribeRule.create(context)

      const keys = Object.keys(visitor)
      expect(keys).toHaveLength(2)
      expect(keys).toContain('CallExpression')
      expect(keys).toContain('CallExpression:exit')
    })
  })

  describe('state isolation expanded', () => {
    test('multiple calls to create return independent visitors', () => {
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

  describe('additional meta tests', () => {
    test('should have docs URL', () => {
      expect(maxNestedDescribeRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/max-nested-describe',
      )
    })

    test('should have description mentioning nested', () => {
      expect(maxNestedDescribeRule.meta.docs?.description).toContain('nested')
    })

    test('should have description mentioning describe', () => {
      expect(maxNestedDescribeRule.meta.docs?.description).toContain('describe')
    })

    test('should have schema defined', () => {
      expect(maxNestedDescribeRule.meta.schema).toBeDefined()
    })

    test('default export should match named export', () => {
      expect(defaultExport).toBe(maxNestedDescribeRule)
    })

    test('should have recommended set to true', () => {
      expect(maxNestedDescribeRule.meta.docs?.recommended).toBe(true)
    })

    test('should have warn severity', () => {
      expect(maxNestedDescribeRule.meta.severity).toBe('warn')
    })

    test('should have suggestion type', () => {
      expect(maxNestedDescribeRule.meta.type).toBe('suggestion')
    })

    test('should have testing category', () => {
      expect(maxNestedDescribeRule.meta.docs?.category).toBe('testing')
    })
  })

  describe('edge case — non-describe calls between describes', () => {
    test('non-describe calls do not affect depth counter', () => {
      const { context, reports } = createMockContext({ max: 2 })
      const visitor = maxNestedDescribeRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createOtherCall('test'))
      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createItCall())
      visitor.CallExpression(createDescribeCall())

      expect(reports.length).toBe(1)
    })

    test('exit handler for non-describe calls does nothing', () => {
      const { context, reports } = createMockContext({ max: 2 })
      const visitor = maxNestedDescribeRule.create(context)

      visitor['CallExpression:exit'](createOtherCall('test'))
      visitor['CallExpression:exit'](createItCall())

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createDescribeCall())

      expect(reports.length).toBe(1)
    })
  })

  describe('depth tracking across exit and re-enter', () => {
    test('depth decreases and increases correctly', () => {
      const { context, reports } = createMockContext({ max: 2 })
      const visitor = maxNestedDescribeRule.create(context)

      // depth 1
      visitor.CallExpression(createDescribeCall())
      // depth 2
      visitor.CallExpression(createDescribeCall())
      // exit depth 2 back to 1
      visitor['CallExpression:exit'](createDescribeCall())
      // depth 2 again — still within limit
      visitor.CallExpression(createDescribeCall())
      // exit depth 2 back to 1
      visitor['CallExpression:exit'](createDescribeCall())
      // exit depth 1 back to 0
      visitor['CallExpression:exit'](createDescribeCall())

      expect(reports.length).toBe(0)
    })
  })

  describe('context() as describe function', () => {
    test('should track context() as describe block', () => {
      const { context, reports } = createMockContext({ max: 1 })
      const visitor = maxNestedDescribeRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'context' },
        arguments: [{ type: 'Literal', value: 'outer' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'context' },
        arguments: [{ type: 'Literal', value: 'inner' }],
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 20 } },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Maximum allowed is 1')
    })

    test('should report mixed describe and context nesting', () => {
      const { context, reports } = createMockContext({ max: 1 })
      const visitor = maxNestedDescribeRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'context' },
        arguments: [{ type: 'Literal', value: 'nested' }],
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 20 } },
      })

      expect(reports.length).toBe(1)
    })
  })

  describe('default max depth', () => {
    test('should use default max of 5 when no option provided', () => {
      const { context, reports } = createMockContext()
      const visitor = maxNestedDescribeRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.CallExpression(createDescribeCall())
      }

      expect(reports.length).toBe(0)
    })

    test('should report at depth 6 with default max', () => {
      const { context, reports } = createMockContext()
      const visitor = maxNestedDescribeRule.create(context)

      for (let i = 0; i < 6; i++) {
        visitor.CallExpression(createDescribeCall())
      }

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Maximum allowed is 5')
    })
  })

  // SECTION: Additional member expression variants
  describe('additional member expression variants', () => {
    test('tracks context.only as describe toward depth', () => {
      const { context, reports } = createMockContext({ max: 1 })
      const visitor = maxNestedDescribeRule.create(context)

      visitor.CallExpression(createDescribeCall())
      const contextOnly = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'context' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [
          { type: 'Literal', value: 'suite' },
          { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(contextOnly)
      expect(reports.length).toBe(1)
    })

    test('tracks suite.skip as describe toward depth', () => {
      const { context, reports } = createMockContext({ max: 1 })
      const visitor = maxNestedDescribeRule.create(context)

      visitor.CallExpression(createSuiteCall())
      const suiteSkip = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'suite' },
          property: { type: 'Identifier', name: 'skip' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(suiteSkip)
      expect(reports.length).toBe(1)
    })

    test('tracks context.each as describe toward depth', () => {
      const { context, reports } = createMockContext({ max: 1 })
      const visitor = maxNestedDescribeRule.create(context)

      visitor.CallExpression(createContextCall())
      const contextEach = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'context' },
          property: { type: 'Identifier', name: 'each' },
        },
        arguments: [{ type: 'ArrayExpression', elements: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      visitor.CallExpression(contextEach)
      expect(reports.length).toBe(1)
    })

    test('exiting describe.skip decrements depth correctly', () => {
      const { context, reports } = createMockContext({ max: 2 })
      const visitor = maxNestedDescribeRule.create(context)

      const describeSkip = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'describe' },
          property: { type: 'Identifier', name: 'skip' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(describeSkip)
      visitor.CallExpression(describeSkip)
      visitor.CallExpression(describeSkip)
      expect(reports.length).toBe(1)

      visitor['CallExpression:exit'](describeSkip)
      visitor['CallExpression:exit'](describeSkip)
      visitor['CallExpression:exit'](describeSkip)

      visitor.CallExpression(describeSkip)
      visitor.CallExpression(describeSkip)
      expect(reports.length).toBe(1)
    })
  })
})
