import { describe, test, expect, vi } from 'vitest'
import { noDuplicateHooksRule } from '../../../../src/rules/testing/no-duplicate-hooks.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.test.ts',
  source = 'describe("suite", () => { beforeEach(() => {}); beforeEach(() => {}); });',
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

function createHookCall(name: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name },
    arguments: [
      {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      },
    ],
    loc: { start: { line, column }, end: { line, column: column + name.length + 5 } },
  }
}

function createDescribeCall(name = 'describe', line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name },
    arguments: [
      { type: 'Literal', value: 'suite' },
      {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      },
    ],
    loc: { start: { line, column }, end: { line, column: column + 35 } },
  }
}

function createDescribeModifierCall(
  baseName: string,
  modifier: string,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: baseName },
      property: { type: 'Identifier', name: modifier },
    },
    arguments: [
      { type: 'Literal', value: 'suite' },
      {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      },
    ],
    loc: { start: { line, column }, end: { line, column: column + 45 } },
  }
}

function createCallExpression(calleeName: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: calleeName },
    arguments: [],
    loc: { start: { line, column }, end: { line, column: column + calleeName.length + 2 } },
  }
}

describe('no-duplicate-hooks rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noDuplicateHooksRule.meta.type).toBe('suggestion')
    })

    test('should have error severity', () => {
      expect(noDuplicateHooksRule.meta.severity).toBe('error')
    })

    test('should not be recommended', () => {
      expect(noDuplicateHooksRule.meta.docs?.recommended).toBe(false)
    })

    test('should have testing category', () => {
      expect(noDuplicateHooksRule.meta.docs?.category).toBe('testing')
    })

    test('should have description mentioning duplicate hooks', () => {
      const desc = noDuplicateHooksRule.meta.docs?.description.toLowerCase() ?? ''
      expect(desc).toContain('duplicate')
      expect(desc).toContain('hook')
    })

    test('should have schema defined', () => {
      expect(noDuplicateHooksRule.meta.schema).toBeDefined()
      expect(Array.isArray(noDuplicateHooksRule.meta.schema)).toBe(true)
    })

    test('should have docs URL', () => {
      expect(noDuplicateHooksRule.meta.docs?.url).toBeDefined()
      expect(noDuplicateHooksRule.meta.docs?.url).toContain('no-duplicate-hooks')
    })
  })

  describe('create', () => {
    test('should return visitor with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return visitor with CallExpression:exit method', () => {
      const { context } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)
      expect(visitor).toHaveProperty('CallExpression:exit')
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noDuplicateHooksRule.create(context)
      const visitor2 = noDuplicateHooksRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })
  })

  describe('valid: single hooks in describe', () => {
    test('should not report single beforeEach in describe', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createHookCall('beforeEach'))
      visitor['CallExpression:exit'](desc)

      expect(reports.length).toBe(0)
    })

    test('should not report single afterEach in describe', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createHookCall('afterEach'))
      visitor['CallExpression:exit'](desc)

      expect(reports.length).toBe(0)
    })

    test('should not report single beforeAll in describe', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createHookCall('beforeAll'))
      visitor['CallExpression:exit'](desc)

      expect(reports.length).toBe(0)
    })

    test('should not report single afterAll in describe', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createHookCall('afterAll'))
      visitor['CallExpression:exit'](desc)

      expect(reports.length).toBe(0)
    })

    test('should not report multiple different hooks in same describe', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createHookCall('beforeEach'))
      visitor.CallExpression(createHookCall('afterEach'))
      visitor.CallExpression(createHookCall('beforeAll'))
      visitor.CallExpression(createHookCall('afterAll'))
      visitor['CallExpression:exit'](desc)

      expect(reports.length).toBe(0)
    })
  })

  describe('valid: same hook in different scopes', () => {
    test('should not report same hook in separate describe blocks', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const desc1 = createDescribeCall('describe', 1, 0)
      visitor.CallExpression(desc1)
      visitor.CallExpression(createHookCall('beforeEach', 2, 2))
      visitor['CallExpression:exit'](desc1)

      const desc2 = createDescribeCall('describe', 5, 0)
      visitor.CallExpression(desc2)
      visitor.CallExpression(createHookCall('beforeEach', 6, 2))
      visitor['CallExpression:exit'](desc2)

      expect(reports.length).toBe(0)
    })

    test('should not report same hook in nested describe blocks', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const outer = createDescribeCall('describe', 1, 0)
      visitor.CallExpression(outer)
      visitor.CallExpression(createHookCall('beforeEach', 2, 2))

      const inner = createDescribeCall('describe', 4, 4)
      visitor.CallExpression(inner)
      visitor.CallExpression(createHookCall('beforeEach', 5, 6))
      visitor['CallExpression:exit'](inner)

      visitor['CallExpression:exit'](outer)

      expect(reports.length).toBe(0)
    })

    test('should not report same hook in deeply nested describe blocks', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const level1 = createDescribeCall('describe', 1, 0)
      visitor.CallExpression(level1)
      visitor.CallExpression(createHookCall('beforeEach', 2, 2))

      const level2 = createDescribeCall('describe', 4, 2)
      visitor.CallExpression(level2)
      visitor.CallExpression(createHookCall('beforeEach', 5, 4))

      const level3 = createDescribeCall('describe', 7, 4)
      visitor.CallExpression(level3)
      visitor.CallExpression(createHookCall('beforeEach', 8, 6))
      visitor['CallExpression:exit'](level3)

      visitor['CallExpression:exit'](level2)
      visitor['CallExpression:exit'](level1)

      expect(reports.length).toBe(0)
    })
  })

  describe('valid: hooks outside describe', () => {
    test('should not report hooks outside any describe scope', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      visitor.CallExpression(createHookCall('beforeEach'))
      visitor.CallExpression(createHookCall('beforeEach'))

      expect(reports.length).toBe(0)
    })
  })

  describe('valid: describe variants', () => {
    test('should not report single hook in describe.only', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const desc = createDescribeModifierCall('describe', 'only')
      visitor.CallExpression(desc)
      visitor.CallExpression(createHookCall('beforeEach'))
      visitor['CallExpression:exit'](desc)

      expect(reports.length).toBe(0)
    })

    test('should not report single hook in context block', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const desc = createDescribeCall('context')
      visitor.CallExpression(desc)
      visitor.CallExpression(createHookCall('beforeEach'))
      visitor['CallExpression:exit'](desc)

      expect(reports.length).toBe(0)
    })

    test('should not report single hook in suite block', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const desc = createDescribeCall('suite')
      visitor.CallExpression(desc)
      visitor.CallExpression(createHookCall('beforeEach'))
      visitor['CallExpression:exit'](desc)

      expect(reports.length).toBe(0)
    })
  })

  describe('valid: non-hook calls', () => {
    test('should not report regular function calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createCallExpression('someHelper'))
      visitor.CallExpression(createCallExpression('someHelper'))
      visitor['CallExpression:exit'](desc)

      expect(reports.length).toBe(0)
    })
  })

  describe('invalid: duplicate hooks in same describe', () => {
    test('should report duplicate beforeEach in same describe', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createHookCall('beforeEach', 2, 2))
      visitor.CallExpression(createHookCall('beforeEach', 3, 2))
      visitor['CallExpression:exit'](desc)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beforeEach')
      expect(reports[0].message).toContain('duplicate')
    })

    test('should report duplicate afterEach in same describe', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createHookCall('afterEach', 2, 2))
      visitor.CallExpression(createHookCall('afterEach', 3, 2))
      visitor['CallExpression:exit'](desc)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('afterEach')
    })

    test('should report duplicate beforeAll in same describe', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createHookCall('beforeAll', 2, 2))
      visitor.CallExpression(createHookCall('beforeAll', 3, 2))
      visitor['CallExpression:exit'](desc)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beforeAll')
    })

    test('should report duplicate afterAll in same describe', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createHookCall('afterAll', 2, 2))
      visitor.CallExpression(createHookCall('afterAll', 3, 2))
      visitor['CallExpression:exit'](desc)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('afterAll')
    })

    test('should report correct location of duplicate hook', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createHookCall('beforeEach', 5, 4))
      visitor.CallExpression(createHookCall('beforeEach', 10, 8))
      visitor['CallExpression:exit'](desc)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(8)
    })
  })

  describe('invalid: triple duplicates', () => {
    test('should report two violations for three of the same hook', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createHookCall('beforeEach', 2, 2))
      visitor.CallExpression(createHookCall('beforeEach', 3, 2))
      visitor.CallExpression(createHookCall('beforeEach', 4, 2))
      visitor['CallExpression:exit'](desc)

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('beforeEach')
      expect(reports[1].message).toContain('beforeEach')
    })
  })

  describe('invalid: multiple different duplicates', () => {
    test('should report duplicate beforeEach and duplicate afterEach separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createHookCall('beforeEach', 2, 2))
      visitor.CallExpression(createHookCall('beforeEach', 3, 2))
      visitor.CallExpression(createHookCall('afterEach', 4, 2))
      visitor.CallExpression(createHookCall('afterEach', 5, 2))
      visitor['CallExpression:exit'](desc)

      expect(reports.length).toBe(2)
    })
  })

  describe('invalid: duplicates in nested describe', () => {
    test('should report duplicate hook inside inner describe', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const outer = createDescribeCall('describe', 1, 0)
      visitor.CallExpression(outer)
      visitor.CallExpression(createHookCall('beforeEach', 2, 2))

      const inner = createDescribeCall('describe', 4, 2)
      visitor.CallExpression(inner)
      visitor.CallExpression(createHookCall('beforeEach', 5, 4))
      visitor.CallExpression(createHookCall('beforeEach', 6, 4))
      visitor['CallExpression:exit'](inner)

      visitor['CallExpression:exit'](outer)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beforeEach')
    })

    test('should report duplicate in deeply nested describe (3+ levels)', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const level1 = createDescribeCall('describe', 1, 0)
      visitor.CallExpression(level1)

      const level2 = createDescribeCall('describe', 3, 2)
      visitor.CallExpression(level2)

      const level3 = createDescribeCall('describe', 5, 4)
      visitor.CallExpression(level3)
      visitor.CallExpression(createHookCall('afterEach', 6, 6))
      visitor.CallExpression(createHookCall('afterEach', 7, 6))
      visitor['CallExpression:exit'](level3)

      visitor['CallExpression:exit'](level2)
      visitor['CallExpression:exit'](level1)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('afterEach')
    })
  })

  describe('scope stack management', () => {
    test('should reset hook tracking when describe exits', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const desc1 = createDescribeCall('describe', 1, 0)
      visitor.CallExpression(desc1)
      visitor.CallExpression(createHookCall('beforeEach', 2, 2))
      visitor['CallExpression:exit'](desc1)

      const desc2 = createDescribeCall('describe', 5, 0)
      visitor.CallExpression(desc2)
      visitor.CallExpression(createHookCall('beforeEach', 6, 2))
      visitor['CallExpression:exit'](desc2)

      expect(reports.length).toBe(0)
    })

    test('should track hooks independently across sequential describes', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const desc1 = createDescribeCall('describe', 1, 0)
      visitor.CallExpression(desc1)
      visitor.CallExpression(createHookCall('beforeEach', 2, 2))
      visitor.CallExpression(createHookCall('beforeEach', 3, 2))
      visitor['CallExpression:exit'](desc1)

      const desc2 = createDescribeCall('describe', 6, 0)
      visitor.CallExpression(desc2)
      visitor.CallExpression(createHookCall('beforeEach', 7, 2))
      visitor['CallExpression:exit'](desc2)

      expect(reports.length).toBe(1)
    })
  })

  describe('state isolation between visitors', () => {
    test('separate visitors have separate scope stacks', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()

      const visitor1 = noDuplicateHooksRule.create(ctx1)
      const visitor2 = noDuplicateHooksRule.create(ctx2)

      const desc1 = createDescribeCall()
      visitor1.CallExpression(desc1)
      visitor1.CallExpression(createHookCall('beforeEach'))
      visitor1.CallExpression(createHookCall('beforeEach'))
      visitor1['CallExpression:exit'](desc1)

      const desc2 = createDescribeCall()
      visitor2.CallExpression(desc2)
      visitor2.CallExpression(createHookCall('beforeEach'))
      visitor2['CallExpression:exit'](desc2)

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })
  })

  describe('error message format', () => {
    test('message includes hook name', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createHookCall('beforeAll', 2, 2))
      visitor.CallExpression(createHookCall('beforeAll', 3, 2))
      visitor['CallExpression:exit'](desc)

      expect(reports[0].message).toBe(
        'Unexpected duplicate beforeAll hook in describe block',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createHookCall('beforeEach', 7, 3))
      visitor.CallExpression(createHookCall('beforeEach', 12, 5))
      visitor['CallExpression:exit'](desc)

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(12)
      expect(reports[0].loc?.start.column).toBe(5)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression({ type: 'CallExpression', arguments: [] })
      visitor['CallExpression:exit'](desc)

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [],
      })
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [],
      })
      visitor['CallExpression:exit'](desc)

      expect(reports.length).toBe(1)
    })

    test('should handle exit of non-describe node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createHookCall('beforeEach'))

      visitor['CallExpression:exit'](createCallExpression('it'))

      visitor.CallExpression(createHookCall('beforeEach'))
      visitor['CallExpression:exit'](desc)

      expect(reports.length).toBe(1)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('default export', () => {
    test('rule should be the default export', () => {
      expect(noDuplicateHooksRule).toBeDefined()
      expect(noDuplicateHooksRule.meta).toBeDefined()
      expect(noDuplicateHooksRule.create).toBeDefined()
    })
  })

  describe('meta expanded', () => {
    test('should have docs.url containing github', () => {
      expect(noDuplicateHooksRule.meta.docs?.url).toContain('github.com')
    })

    test('should have empty schema array', () => {
      expect(noDuplicateHooksRule.meta.schema).toHaveLength(0)
    })

    test('should have meta as plain object', () => {
      expect(typeof noDuplicateHooksRule.meta).toBe('object')
      expect(Array.isArray(noDuplicateHooksRule.meta)).toBe(false)
    })
  })

  describe('describe.each scope tracking', () => {
    test('should not report same hook in describe and nested describe.each', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const outer = createDescribeCall('describe', 1, 0)
      visitor.CallExpression(outer)
      visitor.CallExpression(createHookCall('beforeEach', 2, 2))

      const describeEach = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'describe' },
          property: { type: 'Identifier', name: 'each' },
        },
        arguments: [{ type: 'ArrayExpression', elements: [] }],
        loc: { start: { line: 4, column: 0 }, end: { line: 4, column: 30 } },
      }
      visitor.CallExpression(describeEach)
      visitor.CallExpression(createHookCall('beforeEach', 5, 4))
      visitor['CallExpression:exit'](describeEach)

      visitor['CallExpression:exit'](outer)

      expect(reports.length).toBe(0)
    })
  })

  describe('context and suite describe variants with duplicates', () => {
    test('should report duplicate in context block', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const desc = createDescribeCall('context')
      visitor.CallExpression(desc)
      visitor.CallExpression(createHookCall('afterEach', 2, 2))
      visitor.CallExpression(createHookCall('afterEach', 3, 2))
      visitor['CallExpression:exit'](desc)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('afterEach')
    })

    test('should report duplicate in suite block', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const desc = createDescribeCall('suite')
      visitor.CallExpression(desc)
      visitor.CallExpression(createHookCall('beforeAll', 2, 2))
      visitor.CallExpression(createHookCall('beforeAll', 3, 2))
      visitor['CallExpression:exit'](desc)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beforeAll')
    })
  })

  describe('report message content', () => {
    test('report includes node reference', () => {
      const { context } = createMockContext()
      let reportedNode: unknown = null
      const ctx = {
        ...context,
        report: (descriptor: { message: string; node?: unknown }) => {
          reportedNode = descriptor.node
        },
      } as unknown as RuleContext
      const visitor = noDuplicateHooksRule.create(ctx)

      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createHookCall('beforeEach'))
      const dupHook = createHookCall('beforeEach', 3, 2)
      visitor.CallExpression(dupHook)
      visitor['CallExpression:exit'](desc)

      expect(reportedNode).toBe(dupHook)
    })
  })

  describe('mixed hook types with duplicates', () => {
    test('should report only duplicate types, not all', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createHookCall('beforeEach', 2, 2))
      visitor.CallExpression(createHookCall('afterEach', 3, 2))
      visitor.CallExpression(createHookCall('beforeEach', 4, 2))
      visitor.CallExpression(createHookCall('beforeAll', 5, 2))
      visitor['CallExpression:exit'](desc)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beforeEach')
    })

    test('should report multiple different hook type duplicates', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createHookCall('beforeEach', 2, 2))
      visitor.CallExpression(createHookCall('beforeEach', 3, 2))
      visitor.CallExpression(createHookCall('afterAll', 4, 2))
      visitor.CallExpression(createHookCall('afterAll', 5, 2))
      visitor['CallExpression:exit'](desc)

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('beforeEach')
      expect(reports[1].message).toContain('afterAll')
    })
  })

  describe('location reporting details', () => {
    test('end location is reported correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createHookCall('afterEach', 8, 4))
      visitor.CallExpression(createHookCall('afterEach', 12, 6))
      visitor['CallExpression:exit'](desc)

      expect(reports[0].loc?.end.line).toBe(12)
      expect(reports[0].loc?.end.column).toBe(6 + 'afterEach'.length + 5)
    })
  })

  describe('meta: additional property checks', () => {
    test('should not have an id property on meta', () => {
      expect(noDuplicateHooksRule.meta).not.toHaveProperty('id')
    })

    test('description should mention all four hook names', () => {
      const desc = noDuplicateHooksRule.meta.docs?.description ?? ''
      expect(desc).toContain('beforeEach')
      expect(desc).toContain('afterEach')
      expect(desc).toContain('beforeAll')
      expect(desc).toContain('afterAll')
    })

    test('severity should be a string type', () => {
      expect(typeof noDuplicateHooksRule.meta.severity).toBe('string')
    })

    test('docs description should be a non-empty string', () => {
      expect(typeof noDuplicateHooksRule.meta.docs?.description).toBe('string')
      expect(noDuplicateHooksRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('docs should not have examples property', () => {
      expect(noDuplicateHooksRule.meta.docs).not.toHaveProperty('examples')
    })
  })

  describe('valid: specific two-hook combinations', () => {
    test('should not report beforeEach + afterEach in same describe', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createHookCall('beforeEach'))
      visitor.CallExpression(createHookCall('afterEach'))
      visitor['CallExpression:exit'](desc)

      expect(reports.length).toBe(0)
    })

    test('should not report beforeAll + afterAll in same describe', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createHookCall('beforeAll'))
      visitor.CallExpression(createHookCall('afterAll'))
      visitor['CallExpression:exit'](desc)

      expect(reports.length).toBe(0)
    })

    test('should not report three different hook types in same describe', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createHookCall('beforeEach'))
      visitor.CallExpression(createHookCall('afterEach'))
      visitor.CallExpression(createHookCall('beforeAll'))
      visitor['CallExpression:exit'](desc)

      expect(reports.length).toBe(0)
    })
  })

  describe('valid: duplicate beforeAll in nested describe — different scope', () => {
    test('should not report beforeAll in outer and inner describe', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const outer = createDescribeCall('describe', 1, 0)
      visitor.CallExpression(outer)
      visitor.CallExpression(createHookCall('beforeAll', 2, 2))

      const inner = createDescribeCall('describe', 4, 4)
      visitor.CallExpression(inner)
      visitor.CallExpression(createHookCall('beforeAll', 5, 6))
      visitor['CallExpression:exit'](inner)

      visitor['CallExpression:exit'](outer)

      expect(reports.length).toBe(0)
    })
  })

  describe('invalid: triple duplicate beforeAll', () => {
    test('should report two violations for three beforeAll in same describe', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createHookCall('beforeAll', 2, 2))
      visitor.CallExpression(createHookCall('beforeAll', 3, 2))
      visitor.CallExpression(createHookCall('beforeAll', 4, 2))
      visitor['CallExpression:exit'](desc)

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('beforeAll')
      expect(reports[1].message).toContain('beforeAll')
    })
  })

  describe('invalid: duplicates in describe modifiers', () => {
    test('should report duplicate hook in describe.only', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const desc = createDescribeModifierCall('describe', 'only')
      visitor.CallExpression(desc)
      visitor.CallExpression(createHookCall('beforeEach', 2, 2))
      visitor.CallExpression(createHookCall('beforeEach', 3, 2))
      visitor['CallExpression:exit'](desc)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beforeEach')
    })

    test('should report duplicate hook in describe.skip', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const desc = createDescribeModifierCall('describe', 'skip')
      visitor.CallExpression(desc)
      visitor.CallExpression(createHookCall('afterEach', 2, 2))
      visitor.CallExpression(createHookCall('afterEach', 3, 2))
      visitor['CallExpression:exit'](desc)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('afterEach')
    })

    test('should report duplicate hook in describe.each', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const desc = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'describe' },
          property: { type: 'Identifier', name: 'each' },
        },
        arguments: [{ type: 'ArrayExpression', elements: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(desc)
      visitor.CallExpression(createHookCall('beforeAll', 2, 2))
      visitor.CallExpression(createHookCall('beforeAll', 3, 2))
      visitor['CallExpression:exit'](desc)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beforeAll')
    })
  })

  describe('valid: hooks inside test/it callbacks', () => {
    test('should not report single hook inside test() callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const desc = createDescribeCall()
      visitor.CallExpression(desc)

      const testCall = createCallExpression('test')
      visitor.CallExpression(testCall)
      visitor.CallExpression(createHookCall('beforeEach'))
      visitor['CallExpression:exit'](testCall)

      visitor['CallExpression:exit'](desc)

      expect(reports.length).toBe(0)
    })

    test('should not report single hook inside it() callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const desc = createDescribeCall()
      visitor.CallExpression(desc)

      const itCall = createCallExpression('it')
      visitor.CallExpression(itCall)
      visitor.CallExpression(createHookCall('afterEach'))
      visitor['CallExpression:exit'](itCall)

      visitor['CallExpression:exit'](desc)

      expect(reports.length).toBe(0)
    })
  })

  describe('valid: multiple sibling describes each with own hooks', () => {
    test('should not report when sibling describes each have their own hooks', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const desc1 = createDescribeCall('describe', 1, 0)
      visitor.CallExpression(desc1)
      visitor.CallExpression(createHookCall('beforeEach', 2, 2))
      visitor.CallExpression(createHookCall('afterEach', 3, 2))
      visitor['CallExpression:exit'](desc1)

      const desc2 = createDescribeCall('describe', 6, 0)
      visitor.CallExpression(desc2)
      visitor.CallExpression(createHookCall('beforeEach', 7, 2))
      visitor.CallExpression(createHookCall('afterEach', 8, 2))
      visitor['CallExpression:exit'](desc2)

      const desc3 = createDescribeCall('describe', 11, 0)
      visitor.CallExpression(desc3)
      visitor.CallExpression(createHookCall('beforeEach', 12, 2))
      visitor.CallExpression(createHookCall('afterEach', 13, 2))
      visitor['CallExpression:exit'](desc3)

      expect(reports.length).toBe(0)
    })
  })

  describe('report message exact text verification', () => {
    test('report message for duplicate beforeEach is exact', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createHookCall('beforeEach', 2, 2))
      visitor.CallExpression(createHookCall('beforeEach', 3, 2))
      visitor['CallExpression:exit'](desc)

      expect(reports[0].message).toBe(
        'Unexpected duplicate beforeEach hook in describe block',
      )
    })

    test('report message for duplicate afterEach is exact', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createHookCall('afterEach', 2, 2))
      visitor.CallExpression(createHookCall('afterEach', 3, 2))
      visitor['CallExpression:exit'](desc)

      expect(reports[0].message).toBe(
        'Unexpected duplicate afterEach hook in describe block',
      )
    })

    test('report message for duplicate afterAll is exact', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createHookCall('afterAll', 2, 2))
      visitor.CallExpression(createHookCall('afterAll', 3, 2))
      visitor['CallExpression:exit'](desc)

      expect(reports[0].message).toBe(
        'Unexpected duplicate afterAll hook in describe block',
      )
    })

    test('does not report duplicate hooks across sibling describe blocks', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const desc1 = createDescribeCall('describe', 1, 0)
      visitor.CallExpression(desc1)
      visitor.CallExpression(createHookCall('beforeEach', 2, 2))
      visitor['CallExpression:exit'](desc1)

      const desc2 = createDescribeCall('describe', 4, 0)
      visitor.CallExpression(desc2)
      visitor.CallExpression(createHookCall('beforeEach', 5, 2))
      visitor['CallExpression:exit'](desc2)

      expect(reports).toHaveLength(0)
    })

    test('reports duplicate hook in second sibling describe', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const desc1 = createDescribeCall('describe', 1, 0)
      visitor.CallExpression(desc1)
      visitor.CallExpression(createHookCall('beforeEach', 2, 2))
      visitor['CallExpression:exit'](desc1)

      const desc2 = createDescribeCall('describe', 4, 0)
      visitor.CallExpression(desc2)
      visitor.CallExpression(createHookCall('beforeEach', 5, 2))
      visitor.CallExpression(createHookCall('beforeEach', 6, 2))
      visitor['CallExpression:exit'](desc2)

      expect(reports).toHaveLength(1)
    })

    test('reports duplicate hook in nested describe (each scope independent)', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const outer = createDescribeCall('describe', 1, 0)
      visitor.CallExpression(outer)
      visitor.CallExpression(createHookCall('beforeEach', 2, 2))

      const inner = createDescribeCall('describe', 3, 4)
      visitor.CallExpression(inner)
      visitor.CallExpression(createHookCall('beforeEach', 4, 6))
      visitor.CallExpression(createHookCall('beforeEach', 5, 6))
      visitor['CallExpression:exit'](inner)
      visitor['CallExpression:exit'](outer)

      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('duplicate beforeEach')
    })

    test('does not report hook outside describe', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      visitor.CallExpression(createHookCall('beforeEach', 1, 0))
      visitor.CallExpression(createHookCall('beforeEach', 2, 0))

      expect(reports).toHaveLength(0)
    })

    test('reports three duplicate hooks of same type', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createHookCall('beforeAll', 2, 2))
      visitor.CallExpression(createHookCall('beforeAll', 3, 2))
      visitor.CallExpression(createHookCall('beforeAll', 4, 2))
      visitor['CallExpression:exit'](desc)

      expect(reports).toHaveLength(2)
    })

    test('reports different hook types duplicated in same scope', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createHookCall('beforeEach', 2, 2))
      visitor.CallExpression(createHookCall('beforeEach', 3, 2))
      visitor.CallExpression(createHookCall('afterEach', 4, 2))
      visitor.CallExpression(createHookCall('afterEach', 5, 2))
      visitor['CallExpression:exit'](desc)

      expect(reports).toHaveLength(2)
    })

    test('does not report when all four hook types are used once each', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createHookCall('beforeAll', 2, 2))
      visitor.CallExpression(createHookCall('beforeEach', 3, 2))
      visitor.CallExpression(createHookCall('afterEach', 4, 2))
      visitor.CallExpression(createHookCall('afterAll', 5, 2))
      visitor['CallExpression:exit'](desc)

      expect(reports).toHaveLength(0)
    })

    test('does not report describe.only with hook in parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const outer = createDescribeCall('describe', 1, 0)
      visitor.CallExpression(outer)
      visitor.CallExpression(createHookCall('beforeEach', 2, 2))

      const inner = createDescribeModifierCall('describe', 'only', 3, 4)
      visitor.CallExpression(inner)
      visitor.CallExpression(createHookCall('beforeEach', 4, 6))
      visitor['CallExpression:exit'](inner)
      visitor['CallExpression:exit'](outer)

      expect(reports).toHaveLength(0)
    })

    test('reports duplicate in describe.skip scope', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const desc = createDescribeModifierCall('describe', 'skip', 1, 0)
      visitor.CallExpression(desc)
      visitor.CallExpression(createHookCall('afterAll', 2, 2))
      visitor.CallExpression(createHookCall('afterAll', 3, 2))
      visitor['CallExpression:exit'](desc)

      expect(reports).toHaveLength(1)
    })

    test('handles deeply nested scopes independently', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const d1 = createDescribeCall('describe', 1, 0)
      const d2 = createDescribeCall('describe', 2, 2)
      const d3 = createDescribeCall('describe', 3, 4)

      visitor.CallExpression(d1)
      visitor.CallExpression(createHookCall('beforeEach', 2, 2))
      visitor.CallExpression(d2)
      visitor.CallExpression(createHookCall('beforeEach', 3, 4))
      visitor.CallExpression(d3)
      visitor.CallExpression(createHookCall('beforeEach', 4, 6))
      visitor.CallExpression(createHookCall('beforeEach', 5, 6))
      visitor['CallExpression:exit'](d3)
      visitor['CallExpression:exit'](d2)
      visitor['CallExpression:exit'](d1)

      expect(reports).toHaveLength(1)
    })
  })

  describe('invalid: duplicate hooks in context modifier variants', () => {
    test('should report duplicate hook in context.only', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const desc = createDescribeModifierCall('context', 'only')
      visitor.CallExpression(desc)
      visitor.CallExpression(createHookCall('beforeEach', 2, 2))
      visitor.CallExpression(createHookCall('beforeEach', 3, 2))
      visitor['CallExpression:exit'](desc)

      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('beforeEach')
    })

    test('should report duplicate hook in context.skip', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const desc = createDescribeModifierCall('context', 'skip')
      visitor.CallExpression(desc)
      visitor.CallExpression(createHookCall('afterAll', 2, 2))
      visitor.CallExpression(createHookCall('afterAll', 3, 2))
      visitor['CallExpression:exit'](desc)

      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('afterAll')
    })

    test('should report duplicate hook in suite.only', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const desc = createDescribeModifierCall('suite', 'only')
      visitor.CallExpression(desc)
      visitor.CallExpression(createHookCall('beforeAll', 2, 2))
      visitor.CallExpression(createHookCall('beforeAll', 3, 2))
      visitor['CallExpression:exit'](desc)

      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('beforeAll')
    })

    test('should report duplicate hook in suite.skip', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const desc = createDescribeModifierCall('suite', 'skip')
      visitor.CallExpression(desc)
      visitor.CallExpression(createHookCall('afterEach', 2, 2))
      visitor.CallExpression(createHookCall('afterEach', 3, 2))
      visitor['CallExpression:exit'](desc)

      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('afterEach')
    })
  })

  describe('invalid: four duplicate hooks', () => {
    test('should report three violations for four beforeEach in same describe', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createHookCall('beforeEach', 2, 2))
      visitor.CallExpression(createHookCall('beforeEach', 3, 2))
      visitor.CallExpression(createHookCall('beforeEach', 4, 2))
      visitor.CallExpression(createHookCall('beforeEach', 5, 2))
      visitor['CallExpression:exit'](desc)

      expect(reports).toHaveLength(3)
      for (const report of reports) {
        expect(report.message).toContain('beforeEach')
      }
    })
  })

  describe('mixed describe type nesting', () => {
    test('should not report same hook in context parent and describe child', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const outer = createDescribeCall('context', 1, 0)
      visitor.CallExpression(outer)
      visitor.CallExpression(createHookCall('beforeEach', 2, 2))

      const inner = createDescribeCall('describe', 4, 4)
      visitor.CallExpression(inner)
      visitor.CallExpression(createHookCall('beforeEach', 5, 6))
      visitor['CallExpression:exit'](inner)

      visitor['CallExpression:exit'](outer)

      expect(reports).toHaveLength(0)
    })

    test('should report duplicate in suite parent with nested context', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const outer = createDescribeCall('suite', 1, 0)
      visitor.CallExpression(outer)
      visitor.CallExpression(createHookCall('beforeAll', 2, 2))

      const inner = createDescribeCall('context', 4, 4)
      visitor.CallExpression(inner)
      visitor.CallExpression(createHookCall('beforeAll', 5, 6))
      visitor.CallExpression(createHookCall('beforeAll', 6, 6))
      visitor['CallExpression:exit'](inner)

      visitor['CallExpression:exit'](outer)

      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('beforeAll')
    })
  })

  describe('CallExpression:exit on empty scope stack', () => {
    test('should not throw when exiting with no open describes', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      expect(() =>
        visitor['CallExpression:exit'](createCallExpression('it')),
      ).not.toThrow()
      expect(reports).toHaveLength(0)
    })
  })

  // SECTION: additional coverage
  describe('additional coverage', () => {
    test('should not track hook with MemberExpression callee as duplicate', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      // beforeEach with member expression callee (e.g., beforeEach.skip) — not tracked
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'beforeEach' },
          property: { type: 'Identifier', name: 'skip' },
        },
        arguments: [],
      })
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'beforeEach' },
          property: { type: 'Identifier', name: 'skip' },
        },
        arguments: [],
      })
      visitor['CallExpression:exit'](desc)

      expect(reports).toHaveLength(0)
    })

    test('should report duplicate afterEach in suite describe', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateHooksRule.create(context)

      const desc = createDescribeCall('suite')
      visitor.CallExpression(desc)
      visitor.CallExpression(createHookCall('afterEach', 2, 2))
      visitor.CallExpression(createHookCall('afterEach', 3, 2))
      visitor['CallExpression:exit'](desc)

      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('afterEach')
    })

    test('meta schema should be empty array', () => {
      expect(noDuplicateHooksRule.meta.schema).toEqual([])
    })
  })
})
