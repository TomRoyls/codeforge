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

  describe('meta expanded', () => {
    test('should have docs.url containing codeforge', () => {
      expect(requireTopLevelDescribeRule.meta.docs?.url).toContain('codeforge.dev')
    })

    test('should have schema with describeFunctionNames option', () => {
      expect(requireTopLevelDescribeRule.meta.schema).toHaveLength(1)
    })

    test('should have meta as plain object', () => {
      expect(typeof requireTopLevelDescribeRule.meta).toBe('object')
      expect(Array.isArray(requireTopLevelDescribeRule.meta)).toBe(false)
    })

    test('should have docs.url containing rule name', () => {
      expect(requireTopLevelDescribeRule.meta.docs?.url).toContain('require-top-level-describe')
    })
  })

  describe('context and suite aliases', () => {
    test('does not report it() inside context block', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      visitor.CallExpression(createDescribeCall('context'))
      visitor.CallExpression(createItCall())
      visitor['CallExpression:exit'](createDescribeCall('context'))
      expect(reports.length).toBe(0)
    })

    test('does not report test() inside suite block', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      visitor.CallExpression(createDescribeCall('suite'))
      visitor.CallExpression(createTestCall())
      visitor['CallExpression:exit'](createDescribeCall('suite'))
      expect(reports.length).toBe(0)
    })

    test('reports it() outside context block', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      visitor.CallExpression(createDescribeCall('context'))
      visitor['CallExpression:exit'](createDescribeCall('context'))
      visitor.CallExpression(createItCall())
      expect(reports.length).toBe(1)
    })
  })

  describe('describe.only and describe.skip', () => {
    test('does not report it() inside describe.only', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      const desc = createMemberCall('describe', 'only')
      visitor.CallExpression(desc)
      visitor.CallExpression(createItCall())
      visitor['CallExpression:exit'](desc)
      expect(reports.length).toBe(0)
    })

    test('does not report test() inside describe.skip', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      const desc = createMemberCall('describe', 'skip')
      visitor.CallExpression(desc)
      visitor.CallExpression(createTestCall())
      visitor['CallExpression:exit'](desc)
      expect(reports.length).toBe(0)
    })
  })

  describe('deeply nested describes', () => {
    test('does not report it() deeply nested in describes', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)

      const d1 = createDescribeCall('describe', 1, 0)
      visitor.CallExpression(d1)
      const d2 = createDescribeCall('describe', 2, 2)
      visitor.CallExpression(d2)
      const d3 = createDescribeCall('describe', 3, 4)
      visitor.CallExpression(d3)
      visitor.CallExpression(createItCall())
      visitor['CallExpression:exit'](d3)
      visitor['CallExpression:exit'](d2)
      visitor['CallExpression:exit'](d1)

      expect(reports.length).toBe(0)
    })

    test('reports it() between sequential describe blocks', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)

      const d1 = createDescribeCall('describe', 1, 0)
      visitor.CallExpression(d1)
      visitor.CallExpression(createItCall())
      visitor['CallExpression:exit'](d1)
      visitor.CallExpression(createItCall())
      const d2 = createDescribeCall('describe', 10, 0)
      visitor.CallExpression(d2)
      visitor.CallExpression(createItCall())
      visitor['CallExpression:exit'](d2)
      visitor.CallExpression(createItCall())

      expect(reports.length).toBe(2)
    })
  })

  describe('meta description content', () => {
    test('meta.description mentions describe', () => {
      const desc = requireTopLevelDescribeRule.meta.docs?.description
      expect(desc?.toLowerCase()).toContain('describe')
    })

    test('meta.description mentions test', () => {
      const desc = requireTopLevelDescribeRule.meta.docs?.description
      expect(desc?.toLowerCase()).toContain('test')
    })

    test('meta.schema first element has type object', () => {
      const schema = requireTopLevelDescribeRule.meta.schema[0] as Record<string, unknown>
      expect(schema.type).toBe('object')
    })

    test('meta.schema has additionalProperties set to false', () => {
      const schema = requireTopLevelDescribeRule.meta.schema[0] as Record<string, unknown>
      expect(schema.additionalProperties).toBe(false)
    })
  })

  describe('describe.each as describe block', () => {
    test('does not report it() inside describe.each()', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      const descEach = createMemberCall('describe', 'each')
      visitor.CallExpression(descEach)
      visitor.CallExpression(createItCall())
      visitor['CallExpression:exit'](descEach)
      expect(reports.length).toBe(0)
    })

    test('does not report test() inside describe.each()', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      const descEach = createMemberCall('describe', 'each')
      visitor.CallExpression(descEach)
      visitor.CallExpression(createTestCall())
      visitor['CallExpression:exit'](descEach)
      expect(reports.length).toBe(0)
    })
  })

  describe('test variants at top level', () => {
    test('reports test.only() at top level', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      visitor.CallExpression(createMemberCall('test', 'only'))
      expect(reports.length).toBe(1)
      expect(reports[0]!.message).toContain('test')
    })

    test('reports test.each() at top level', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      visitor.CallExpression(createMemberCall('test', 'each'))
      expect(reports.length).toBe(1)
      expect(reports[0]!.message).toContain('test')
    })

    test('reports it.skip() at top level', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      visitor.CallExpression(createMemberCall('it', 'skip'))
      expect(reports.length).toBe(1)
      expect(reports[0]!.message).toContain('it')
    })

    test('reports it.each() at top level', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      visitor.CallExpression(createMemberCall('it', 'each'))
      expect(reports.length).toBe(1)
      expect(reports[0]!.message).toContain('it')
    })

    test('reports it.concurrent() at top level', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      visitor.CallExpression(createMemberCall('it', 'concurrent'))
      expect(reports.length).toBe(1)
      expect(reports[0]!.message).toContain('it')
    })
  })

  describe('unrecognized test aliases', () => {
    test('does not report xit() at top level', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      visitor.CallExpression(createOtherCall('xit'))
      expect(reports.length).toBe(0)
    })

    test('does not report fit() at top level', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      visitor.CallExpression(createOtherCall('fit'))
      expect(reports.length).toBe(0)
    })
  })

  describe('exact message verification', () => {
    test('report message for it() matches exact format', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      visitor.CallExpression(createItCall())
      expect(reports[0]!.message).toBe(
        "All tests must be inside a describe block. Move 'it' call into a describe() block.",
      )
    })

    test('report message for test() matches exact format', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      visitor.CallExpression(createTestCall())
      expect(reports[0]!.message).toBe(
        "All tests must be inside a describe block. Move 'test' call into a describe() block.",
      )
    })
  })

  describe('mixed describe and test at top level', () => {
    test('reports only test calls, not describe calls', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      visitor.CallExpression(createTestCall())
      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor['CallExpression:exit'](desc)
      visitor.CallExpression(createItCall())
      expect(reports.length).toBe(2)
      expect(reports[0]!.message).toContain('test')
      expect(reports[1]!.message).toContain('it')
    })
  })

  describe('no violations edge cases', () => {
    test('no violations when no call expressions are processed', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      expect(reports.length).toBe(0)
    })

    test('no violations when only describe calls exist', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      visitor.CallExpression(createDescribeCall())
      visitor['CallExpression:exit'](createDescribeCall())
      visitor.CallExpression(createDescribeCall())
      visitor['CallExpression:exit'](createDescribeCall())
      expect(reports.length).toBe(0)
    })
  })

  describe('context and suite member variants as describe', () => {
    test('does not report it() inside context.only()', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      const ctx = createMemberCall('context', 'only')
      visitor.CallExpression(ctx)
      visitor.CallExpression(createItCall())
      visitor['CallExpression:exit'](ctx)
      expect(reports.length).toBe(0)
    })

    test('does not report it() inside context.skip()', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      const ctx = createMemberCall('context', 'skip')
      visitor.CallExpression(ctx)
      visitor.CallExpression(createItCall())
      visitor['CallExpression:exit'](ctx)
      expect(reports.length).toBe(0)
    })

    test('does not report test() inside suite.only()', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      const s = createMemberCall('suite', 'only')
      visitor.CallExpression(s)
      visitor.CallExpression(createTestCall())
      visitor['CallExpression:exit'](s)
      expect(reports.length).toBe(0)
    })
  })

  describe('deeply nested describes (4+ levels)', () => {
    test('does not report test() inside 4 levels of nested describe', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)

      const d1 = createDescribeCall(1, 0)
      const d2 = createDescribeCall(2, 2)
      const d3 = createDescribeCall(3, 4)
      const d4 = createDescribeCall(4, 6)
      visitor.CallExpression(d1)
      visitor.CallExpression(d2)
      visitor.CallExpression(d3)
      visitor.CallExpression(d4)
      visitor.CallExpression(createTestCall())
      visitor['CallExpression:exit'](d4)
      visitor['CallExpression:exit'](d3)
      visitor['CallExpression:exit'](d2)
      visitor['CallExpression:exit'](d1)

      expect(reports.length).toBe(0)
    })

    test('does not report it() inside 5 levels of nested describe', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)

      const d1 = createDescribeCall(1, 0)
      const d2 = createDescribeCall(2, 2)
      const d3 = createDescribeCall(3, 4)
      const d4 = createDescribeCall(4, 6)
      const d5 = createDescribeCall(5, 8)
      visitor.CallExpression(d1)
      visitor.CallExpression(d2)
      visitor.CallExpression(d3)
      visitor.CallExpression(d4)
      visitor.CallExpression(d5)
      visitor.CallExpression(createItCall())
      visitor['CallExpression:exit'](d5)
      visitor['CallExpression:exit'](d4)
      visitor['CallExpression:exit'](d3)
      visitor['CallExpression:exit'](d2)
      visitor['CallExpression:exit'](d1)

      expect(reports.length).toBe(0)
    })

    test('reports it() after exiting deeply nested describe blocks', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)

      const d1 = createDescribeCall(1, 0)
      const d2 = createDescribeCall(2, 2)
      const d3 = createDescribeCall(3, 4)
      visitor.CallExpression(d1)
      visitor.CallExpression(d2)
      visitor.CallExpression(d3)
      visitor['CallExpression:exit'](d3)
      visitor['CallExpression:exit'](d2)
      visitor['CallExpression:exit'](d1)
      visitor.CallExpression(createItCall())

      expect(reports.length).toBe(1)
    })

    test('reports test() at top level after describe enter/exit', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)

      const d = createDescribeCall(1, 0)
      visitor.CallExpression(d)
      visitor['CallExpression:exit'](d)
      visitor.CallExpression(createTestCall())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('test')
    })

    test('does not report it() inside describe.each()', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)

      const describeEach = createMemberCall('describe', 'each', 1, 0)
      visitor.CallExpression(describeEach)
      visitor.CallExpression(createItCall())
      visitor['CallExpression:exit'](describeEach)

      expect(reports.length).toBe(0)
    })

    test('reports it() between describe blocks', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)

      const d1 = createDescribeCall(1, 0)
      visitor.CallExpression(d1)
      visitor['CallExpression:exit'](d1)

      visitor.CallExpression(createItCall())

      const d2 = createDescribeCall(3, 0)
      visitor.CallExpression(d2)
      visitor['CallExpression:exit'](d2)

      expect(reports.length).toBe(1)
    })

    test('does not report it() in second describe after exiting first', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)

      const d1 = createDescribeCall(1, 0)
      visitor.CallExpression(d1)
      visitor['CallExpression:exit'](d1)

      const d2 = createDescribeCall(3, 0)
      visitor.CallExpression(d2)
      visitor.CallExpression(createItCall())
      visitor['CallExpression:exit'](d2)

      expect(reports.length).toBe(0)
    })

    test('reports it() after partially exiting nested describes', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)

      const d1 = createDescribeCall(1, 0)
      const d2 = createDescribeCall(2, 0)
      const d3 = createDescribeCall(3, 0)

      visitor.CallExpression(d1)
      visitor.CallExpression(d2)
      visitor.CallExpression(d3)
      visitor['CallExpression:exit'](d3)
      visitor['CallExpression:exit'](d2)

      visitor.CallExpression(createItCall())

      expect(reports.length).toBe(0)
    })

    test('handles multiple sequential describe enter/exit correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)

      const d1 = createDescribeCall(1, 0)
      visitor.CallExpression(d1)
      visitor.CallExpression(createItCall())
      visitor['CallExpression:exit'](d1)

      const d2 = createDescribeCall(3, 0)
      visitor.CallExpression(d2)
      visitor.CallExpression(createItCall())
      visitor['CallExpression:exit'](d2)

      const d3 = createDescribeCall(5, 0)
      visitor.CallExpression(d3)
      visitor.CallExpression(createItCall())
      visitor['CallExpression:exit'](d3)

      expect(reports.length).toBe(0)
    })

    test('does not report non-test non-describe calls at top level', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)

      visitor.CallExpression(createOtherCall('someFunction'))
      visitor.CallExpression(createOtherCall('console'))
      visitor.CallExpression(createOtherCall('setup'))

      expect(reports.length).toBe(0)
    })

    test('reports it.only() at top level via member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)

      visitor.CallExpression(createMemberCall('it', 'only'))

      expect(reports.length).toBe(1)
    })

    test('reports test.skip() at top level via member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)

      visitor.CallExpression(createMemberCall('test', 'skip'))

      expect(reports.length).toBe(1)
    })

    test('report message contains describe() suggestion', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)

      visitor.CallExpression(createItCall())

      expect(reports[0].message).toContain('describe()')
    })

    test('does not report it() inside describe.skip()', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)

      const describeSkip = createMemberCall('describe', 'skip', 1, 0)
      visitor.CallExpression(describeSkip)
      visitor.CallExpression(createItCall())
      visitor['CallExpression:exit'](describeSkip)

      expect(reports.length).toBe(0)
    })
  })

  describe('context and suite as top-level describe aliases', () => {
    test('does not report context() at top level as a test', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      visitor.CallExpression(createContextCall())
      expect(reports.length).toBe(0)
    })

    test('does not report suite() at top level as a test', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      visitor.CallExpression(createSuiteCall())
      expect(reports.length).toBe(0)
    })

    test('does not report it() inside context.each()', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      const ctxEach = createMemberCall('context', 'each')
      visitor.CallExpression(ctxEach)
      visitor.CallExpression(createItCall())
      visitor['CallExpression:exit'](ctxEach)
      expect(reports.length).toBe(0)
    })

    test('second custom describe function name is recognized', () => {
      const { context, reports } = createMockContext({
        describeFunctionNames: ['myDescribe', 'myGroup'],
      })
      const visitor = requireTopLevelDescribeRule.create(context)

      const myGroup = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'myGroup' },
        arguments: [
          { type: 'Literal', value: 'suite' },
          { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(myGroup)
      visitor.CallExpression(createItCall())
      visitor['CallExpression:exit'](myGroup)
      expect(reports.length).toBe(0)
    })

    test('handles node with FunctionExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'FunctionExpression' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })
  })

  describe('additional verification', () => {
    test('should have create as a function', () => {
      expect(typeof requireTopLevelDescribeRule.create).toBe('function')
    })
  })

  describe('describe.concurrent as describe block', () => {
    test('does not report it() inside describe.concurrent()', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      const descConcurrent = createMemberCall('describe', 'concurrent')
      visitor.CallExpression(descConcurrent)
      visitor.CallExpression(createItCall())
      visitor['CallExpression:exit'](descConcurrent)
      expect(reports.length).toBe(0)
    })
  })

  describe('custom describe function with member expression', () => {
    test('recognizes myDescribe.only() as a describe block', () => {
      const { context, reports } = createMockContext({
        describeFunctionNames: ['myDescribe'],
      })
      const visitor = requireTopLevelDescribeRule.create(context)
      const myDescOnly = createMemberCall('myDescribe', 'only')
      visitor.CallExpression(myDescOnly)
      visitor.CallExpression(createItCall())
      visitor['CallExpression:exit'](myDescOnly)
      expect(reports.length).toBe(0)
    })
  })

  describe('test.concurrent at top level', () => {
    test('reports test.concurrent() at top level', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      visitor.CallExpression(createMemberCall('test', 'concurrent'))
      expect(reports.length).toBe(1)
      expect(reports[0]!.message).toContain('test')
    })
  })

  describe('non-describe CallExpression exit does not affect depth', () => {
    test('exiting a non-describe call does not decrement describe depth', () => {
      const { context, reports } = createMockContext()
      const visitor = requireTopLevelDescribeRule.create(context)
      visitor.CallExpression(createDescribeCall())
      visitor['CallExpression:exit'](createItCall())
      visitor.CallExpression(createItCall())
      visitor['CallExpression:exit'](createDescribeCall())
      expect(reports.length).toBe(0)
    })
  })

  describe('empty options config uses defaults', () => {
    test('works with empty options object — default describe names still recognized', () => {
      const { context, reports } = createMockContext({})
      const visitor = requireTopLevelDescribeRule.create(context)
      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createItCall())
      visitor['CallExpression:exit'](createDescribeCall())
      visitor.CallExpression(createItCall())
      expect(reports.length).toBe(1)
    })
  })
})
