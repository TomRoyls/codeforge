import { describe, test, expect, vi } from 'vitest'
import { requireTopLevelDescribeRule } from '../../../../src/rules/testing/require-top-level-describe.js'
import defaultExport from '../../../../src/rules/testing/require-top-level-describe.js'
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

describe('require-top-level-describe rule', () => {
  describe('meta', () => {
    test('has correct rule metadata', () => {
      expect(requireTopLevelDescribeRule.meta.docs.category).toBe('testing')
      expect(requireTopLevelDescribeRule.meta.type).toBe('suggestion')
      expect(requireTopLevelDescribeRule.meta.severity).toBe('warn')
      expect(requireTopLevelDescribeRule.meta.docs.recommended).toBe(true)
    })

    test('has description', () => {
      expect(requireTopLevelDescribeRule.meta.docs.description).toBeTruthy()
      expect(typeof requireTopLevelDescribeRule.meta.docs.description).toBe('string')
    })

    test('has url', () => {
      expect(requireTopLevelDescribeRule.meta.docs.url).toContain('require-top-level-describe')
    })

    test('has schema', () => {
      expect(requireTopLevelDescribeRule.meta.schema).toHaveLength(1)
    })

    test('schema allows describeFunctionNames', () => {
      const schema = requireTopLevelDescribeRule.meta.schema[0] as Record<string, unknown>
      expect(schema.type).toBe('object')
      const props = schema.properties as Record<string, unknown>
      expect(props).toHaveProperty('describeFunctionNames')
    })
  })

  describe('create', () => {
    test('returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('returns visitor with CallExpression:exit', () => {
      const { context } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      expect(typeof visitor['CallExpression:exit']).toBe('function')
    })
  })

  describe('detecting it() outside describe', () => {
    test('reports it() at top level', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      visitor.CallExpression(createItCall())
      expect(reports.length).toBe(1)
      expect(reports[0]!.message).toContain('it')
    })

    test('reports it at specific line', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      visitor.CallExpression(createItCall(5, 10))
      expect(reports.length).toBe(1)
      expect(reports[0]!.loc?.start.line).toBe(5)
      expect(reports[0]!.loc?.start.column).toBe(10)
    })
  })

  describe('detecting test() outside describe', () => {
    test('reports test() at top level', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      visitor.CallExpression(createTestCall())
      expect(reports.length).toBe(1)
      expect(reports[0]!.message).toContain('test')
    })
  })

  describe('allowing tests inside describe', () => {
    test('does not report it() inside describe()', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createItCall())
      visitor['CallExpression:exit'](createDescribeCall())
      expect(reports.length).toBe(0)
    })

    test('does not report test() inside describe()', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createTestCall())
      visitor['CallExpression:exit'](createDescribeCall())
      expect(reports.length).toBe(0)
    })

    test('does not report it() inside context()', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      visitor.CallExpression(createContextCall())
      visitor.CallExpression(createItCall())
      visitor['CallExpression:exit'](createContextCall())
      expect(reports.length).toBe(0)
    })

    test('does not report it() inside suite()', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      visitor.CallExpression(createSuiteCall())
      visitor.CallExpression(createItCall())
      visitor['CallExpression:exit'](createSuiteCall())
      expect(reports.length).toBe(0)
    })
  })

  describe('reporting after describe exits', () => {
    test('reports it() after describe() exits', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      visitor.CallExpression(createDescribeCall())
      visitor['CallExpression:exit'](createDescribeCall())
      visitor.CallExpression(createItCall())
      expect(reports.length).toBe(1)
    })
  })

  describe('nested describe blocks', () => {
    test('allows it() inside nested describe()', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createItCall())
      visitor['CallExpression:exit'](createDescribeCall())
      visitor['CallExpression:exit'](createDescribeCall())
      expect(reports.length).toBe(0)
    })

    test('reports it() after exiting inner describe but still in outer', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createDescribeCall())
      visitor['CallExpression:exit'](createDescribeCall())
      visitor.CallExpression(createItCall())
      visitor['CallExpression:exit'](createDescribeCall())
      expect(reports.length).toBe(0)
    })

    test('reports it() after all describes exit', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createDescribeCall())
      visitor['CallExpression:exit'](createDescribeCall())
      visitor['CallExpression:exit'](createDescribeCall())
      visitor.CallExpression(createItCall())
      expect(reports.length).toBe(1)
    })
  })

  describe('member expressions', () => {
    test('reports it.only outside describe', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      visitor.CallExpression(createMemberCall('it', 'only'))
      expect(reports.length).toBe(1)
    })

    test('reports test.skip outside describe', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      visitor.CallExpression(createMemberCall('test', 'skip'))
      expect(reports.length).toBe(1)
    })

    test('does not report describe.only as a test', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      visitor.CallExpression(createMemberCall('describe', 'only'))
      expect(reports.length).toBe(0)
    })
  })

  describe('non-test calls', () => {
    test('does not report other function calls', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      visitor.CallExpression(createOtherCall('someFunction'))
      expect(reports.length).toBe(0)
    })

    test('does not report describe() at top level', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      visitor.CallExpression(createDescribeCall())
      expect(reports.length).toBe(0)
    })

    test('does not report expect() at top level', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      visitor.CallExpression(createOtherCall('expect'))
      expect(reports.length).toBe(0)
    })
  })

  describe('custom describeFunctionNames', () => {
    test('uses custom describe function names', () => {
      const { context, reports } = createMockContext({
        describeFunctionNames: ['myDescribe', 'myGroup'],
      })
      const visitor = requireTopLevelDescribeRule.create(context)

      const customDescribe = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'myDescribe' },
        arguments: [
          { type: 'Literal', value: 'suite' },
          { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(customDescribe)
      visitor.CallExpression(createItCall())
      visitor['CallExpression:exit'](customDescribe)
      expect(reports.length).toBe(0)
    })

    test('still reports with custom names when outside', () => {
      const { context, reports } = createMockContext({
        describeFunctionNames: ['myDescribe'],
      })
      const visitor = requireTopLevelDescribeRule.create(context)
      visitor.CallExpression(createItCall())
      expect(reports.length).toBe(1)
    })

    test('default describe is not recognized with custom names only', () => {
      const { context, reports } = createMockContext({
        describeFunctionNames: ['myDescribe'],
      })
      const visitor = requireTopLevelDescribeRule.create(context)
      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createItCall())
      visitor['CallExpression:exit'](createDescribeCall())
      expect(reports.length).toBe(1)
    })
  })

  describe('edge cases', () => {
    test('handles null node', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      visitor.CallExpression(null)
      expect(reports.length).toBe(0)
    })

    test('handles undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      visitor.CallExpression(undefined)
      expect(reports.length).toBe(0)
    })

    test('handles node without type', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      visitor.CallExpression({ name: 'something' })
      expect(reports.length).toBe(0)
    })

    test('handles node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      visitor.CallExpression({ type: 'CallExpression' })
      expect(reports.length).toBe(0)
    })

    test('handles node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      const noLoc = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [{ type: 'Literal', value: 'test' }],
      }
      visitor.CallExpression(noLoc)
      expect(reports.length).toBe(1)
    })
  })

  describe('error message', () => {
    test('includes function name for it()', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      visitor.CallExpression(createItCall())
      expect(reports[0]!.message).toContain('it')
      expect(reports[0]!.message).toContain('describe')
    })

    test('includes function name for test()', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      visitor.CallExpression(createTestCall())
      expect(reports[0]!.message).toContain('test')
      expect(reports[0]!.message).toContain('describe')
    })
  })

  describe('multiple tests', () => {
    test('reports multiple top-level tests', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      visitor.CallExpression(createItCall())
      visitor.CallExpression(createTestCall())
      expect(reports.length).toBe(2)
    })

    test('reports only top-level tests, not nested', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      visitor.CallExpression(createItCall())
      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createItCall())
      visitor['CallExpression:exit'](createDescribeCall())
      visitor.CallExpression(createTestCall())
      expect(reports.length).toBe(2)
    })
  })

  describe('state isolation', () => {
    test('separate visitors do not share state', () => {
      const { context: ctx1, reports: reports1 } = createMockContext()
      const { context: ctx2, reports: reports2 } = createMockContext()

      const visitor1 = requireTopLevelDescribeRule.create(ctx1)
      const visitor2 = requireTopLevelDescribeRule.create(ctx2)

      visitor1.CallExpression(createDescribeCall())
      visitor1.CallExpression(createItCall())

      visitor2.CallExpression(createItCall())

      expect(reports1.length).toBe(0)
      expect(reports2.length).toBe(1)
    })
  })

  describe('default export', () => {
    test('default export equals named export', () => {
      expect(defaultExport).toBe(requireTopLevelDescribeRule)
    })
  })
})
