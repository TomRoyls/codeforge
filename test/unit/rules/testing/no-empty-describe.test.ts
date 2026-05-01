import { describe, test, expect, vi } from 'vitest'
import { noEmptyDescribeRule } from '../../../../src/rules/testing/no-empty-describe.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.test.ts',
  source = 'describe("suite", () => {});',
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

function createMemberCallExpression(objectName: string, propertyName: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: objectName },
      property: { type: 'Identifier', name: propertyName },
    },
    arguments: [],
    loc: { start: { line, column }, end: { line, column: column + objectName.length + propertyName.length + 2 } },
  }
}

function createDeepMemberCallExpression(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'someObj' },
        property: { type: 'Identifier', name: 'deep' },
      },
      property: { type: 'Identifier', name: 'method' },
    },
    arguments: [],
    loc: { start: { line, column }, end: { line, column: column + 20 } },
  }
}

describe('no-empty-describe rule', () => {
  // 1. Empty describe() → reports (3 tests)
  describe('empty describe()', () => {
    test('reports empty describe()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const desc = createDescribeCall('describe')
      visitor.CallExpression(desc)
      visitor['CallExpression:exit'](desc)
      expect(reports.length).toBe(1)
    })

    test('reports empty describe() with arrow callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const desc = createDescribeCall('describe', 5, 2)
      visitor.CallExpression(desc)
      visitor['CallExpression:exit'](desc)
      expect(reports.length).toBe(1)
    })

    test('reports empty describe() with function callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const desc = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'describe' },
        arguments: [
          { type: 'Literal', value: 'suite' },
          { type: 'FunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      visitor.CallExpression(desc)
      visitor['CallExpression:exit'](desc)
      expect(reports.length).toBe(1)
    })
  })

  // 2. Empty context() → reports (2 tests)
  describe('empty context()', () => {
    test('reports empty context()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const desc = createDescribeCall('context')
      visitor.CallExpression(desc)
      visitor['CallExpression:exit'](desc)
      expect(reports.length).toBe(1)
    })

    test('reports empty context() at specific location', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const desc = createDescribeCall('context', 10, 4)
      visitor.CallExpression(desc)
      visitor['CallExpression:exit'](desc)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(10)
    })
  })

  // 3. Empty suite() → reports (2 tests)
  describe('empty suite()', () => {
    test('reports empty suite()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const desc = createDescribeCall('suite')
      visitor.CallExpression(desc)
      visitor['CallExpression:exit'](desc)
      expect(reports.length).toBe(1)
    })

    test('reports empty suite() at specific location', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const desc = createDescribeCall('suite', 3, 1)
      visitor.CallExpression(desc)
      visitor['CallExpression:exit'](desc)
      expect(reports.length).toBe(1)
    })
  })

  // 4. Describe with it() inside → no report (3 tests)
  describe('describe with it() inside', () => {
    test('does not report describe with it()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createCallExpression('it'))
      visitor['CallExpression:exit'](desc)
      expect(reports.length).toBe(0)
    })

    test('does not report describe with it() at specific line', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createCallExpression('it', 5, 2))
      visitor['CallExpression:exit'](desc)
      expect(reports.length).toBe(0)
    })

    test('does not report describe with multiple it() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createCallExpression('it', 2))
      visitor.CallExpression(createCallExpression('it', 3))
      visitor['CallExpression:exit'](desc)
      expect(reports.length).toBe(0)
    })
  })

  // 5. Describe with test() inside → no report (2 tests)
  describe('describe with test() inside', () => {
    test('does not report describe with test()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createCallExpression('test'))
      visitor['CallExpression:exit'](desc)
      expect(reports.length).toBe(0)
    })

    test('does not report describe with test() at specific line', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createCallExpression('test', 7, 4))
      visitor['CallExpression:exit'](desc)
      expect(reports.length).toBe(0)
    })
  })

  // 6. Describe with beforeEach() inside → no report (2 tests)
  describe('describe with beforeEach() inside', () => {
    test('does not report describe with beforeEach()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createCallExpression('beforeEach'))
      visitor['CallExpression:exit'](desc)
      expect(reports.length).toBe(0)
    })

    test('does not report describe with beforeEach() and afterEach()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createCallExpression('beforeEach'))
      visitor.CallExpression(createCallExpression('afterEach'))
      visitor['CallExpression:exit'](desc)
      expect(reports.length).toBe(0)
    })
  })

  // 7. Describe with afterEach/afterAll/beforeAll → no report (3 tests)
  describe('describe with other hooks inside', () => {
    test('does not report describe with afterEach()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createCallExpression('afterEach'))
      visitor['CallExpression:exit'](desc)
      expect(reports.length).toBe(0)
    })

    test('does not report describe with afterAll()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createCallExpression('afterAll'))
      visitor['CallExpression:exit'](desc)
      expect(reports.length).toBe(0)
    })

    test('does not report describe with beforeAll()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createCallExpression('beforeAll'))
      visitor['CallExpression:exit'](desc)
      expect(reports.length).toBe(0)
    })
  })

  // 8. describe.only with empty callback → reports (2 tests)
  describe('describe.only with empty callback', () => {
    test('reports empty describe.only()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const desc = createDescribeModifierCall('describe', 'only')
      visitor.CallExpression(desc)
      visitor['CallExpression:exit'](desc)
      expect(reports.length).toBe(1)
    })

    test('reports empty describe.only() with test inside does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const desc = createDescribeModifierCall('describe', 'only')
      visitor.CallExpression(desc)
      visitor.CallExpression(createCallExpression('it'))
      visitor['CallExpression:exit'](desc)
      expect(reports.length).toBe(0)
    })
  })

  // 9. describe.skip with empty callback → reports (2 tests)
  describe('describe.skip with empty callback', () => {
    test('reports empty describe.skip()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const desc = createDescribeModifierCall('describe', 'skip')
      visitor.CallExpression(desc)
      visitor['CallExpression:exit'](desc)
      expect(reports.length).toBe(1)
    })

    test('reports empty describe.skip() at specific line', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const desc = createDescribeModifierCall('describe', 'skip', 8, 2)
      visitor.CallExpression(desc)
      visitor['CallExpression:exit'](desc)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(8)
    })
  })

  // 10. describe.each with empty callback → reports (2 tests)
  describe('describe.each with empty callback', () => {
    test('reports empty describe.each()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const desc = createDescribeModifierCall('describe', 'each')
      visitor.CallExpression(desc)
      visitor['CallExpression:exit'](desc)
      expect(reports.length).toBe(1)
    })

    test('reports empty context.each()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const desc = createDescribeModifierCall('context', 'each')
      visitor.CallExpression(desc)
      visitor['CallExpression:exit'](desc)
      expect(reports.length).toBe(1)
    })
  })

  // 11. Nested describe, inner empty, outer has test → reports only inner (2 tests)
  describe('nested describe: inner empty, outer has test', () => {
    test('reports only inner empty describe', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const outer = createDescribeCall('describe', 1, 0)
      visitor.CallExpression(outer)
      visitor.CallExpression(createCallExpression('it', 2, 2))
      const inner = createDescribeCall('describe', 4, 4)
      visitor.CallExpression(inner)
      visitor['CallExpression:exit'](inner)
      visitor['CallExpression:exit'](outer)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(4)
    })

    test('reports only inner empty context when outer has beforeEach', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const outer = createDescribeCall('describe', 1, 0)
      visitor.CallExpression(outer)
      visitor.CallExpression(createCallExpression('beforeEach', 2, 2))
      const inner = createDescribeCall('context', 4, 4)
      visitor.CallExpression(inner)
      visitor['CallExpression:exit'](inner)
      visitor['CallExpression:exit'](outer)
      expect(reports.length).toBe(1)
    })
  })

  // 12. Nested describe, both empty → reports both (2 tests)
  describe('nested describe: both empty', () => {
    test('reports both empty describes', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const outer = createDescribeCall('describe', 1, 0)
      visitor.CallExpression(outer)
      const inner = createDescribeCall('describe', 2, 2)
      visitor.CallExpression(inner)
      visitor['CallExpression:exit'](inner)
      visitor['CallExpression:exit'](outer)
      expect(reports.length).toBe(2)
    })

    test('reports both empty context blocks', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const outer = createDescribeCall('context', 1, 0)
      visitor.CallExpression(outer)
      const inner = createDescribeCall('context', 3, 4)
      visitor.CallExpression(inner)
      visitor['CallExpression:exit'](inner)
      visitor['CallExpression:exit'](outer)
      expect(reports.length).toBe(2)
    })
  })

  // 13. Nested describe, inner has test → no reports (2 tests)
  describe('nested describe: inner has test', () => {
    test('does not report when inner has test', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const outer = createDescribeCall('describe', 1, 0)
      visitor.CallExpression(outer)
      const inner = createDescribeCall('describe', 2, 2)
      visitor.CallExpression(inner)
      visitor.CallExpression(createCallExpression('it', 3, 4))
      visitor['CallExpression:exit'](inner)
      visitor['CallExpression:exit'](outer)
      expect(reports.length).toBe(0)
    })

    test('does not report when inner has hook', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const outer = createDescribeCall('describe', 1, 0)
      visitor.CallExpression(outer)
      const inner = createDescribeCall('describe', 2, 2)
      visitor.CallExpression(inner)
      visitor.CallExpression(createCallExpression('beforeAll', 3, 4))
      visitor['CallExpression:exit'](inner)
      visitor['CallExpression:exit'](outer)
      expect(reports.length).toBe(0)
    })
  })

  // 14. Non-describe empty call → no report (3 tests)
  describe('non-describe empty calls', () => {
    test('does not report empty foo() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      visitor.CallExpression(createCallExpression('foo'))
      visitor['CallExpression:exit'](createCallExpression('foo'))
      expect(reports.length).toBe(0)
    })

    test('does not report empty myFunc() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      visitor.CallExpression(createCallExpression('myFunc'))
      visitor['CallExpression:exit'](createCallExpression('myFunc'))
      expect(reports.length).toBe(0)
    })

    test('does not report empty someHelper() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      visitor.CallExpression(createCallExpression('someHelper'))
      visitor['CallExpression:exit'](createCallExpression('someHelper'))
      expect(reports.length).toBe(0)
    })
  })

  // 15. Edge cases: null node, undefined → no report (3 tests)
  describe('edge cases: null/undefined nodes', () => {
    test('handles null node gracefully on enter', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles undefined node gracefully on enter', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles empty object node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  // 16. Location reporting (2 tests)
  describe('location reporting', () => {
    test('reports correct start location', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const desc = createDescribeCall('describe', 5, 8)
      visitor.CallExpression(desc)
      visitor['CallExpression:exit'](desc)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('reports correct end location', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const desc = createDescribeCall('describe', 3, 2)
      visitor.CallExpression(desc)
      visitor['CallExpression:exit'](desc)
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(37)
    })
  })

  // 17. Exact message text (2 tests)
  describe('exact message text', () => {
    test('report message is exact', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor['CallExpression:exit'](desc)
      expect(reports[0].message).toBe('Empty describe block. Remove it or add tests.')
    })

    test('report message is same for context()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const desc = createDescribeCall('context')
      visitor.CallExpression(desc)
      visitor['CallExpression:exit'](desc)
      expect(reports[0].message).toBe('Empty describe block. Remove it or add tests.')
    })
  })

  // 18. Meta/default export (2 tests)
  describe('meta and default export', () => {
    test('meta has correct severity warn', () => {
      expect(noEmptyDescribeRule.meta.severity).toBe('warn')
    })

    test('meta has correct type suggestion', () => {
      expect(noEmptyDescribeRule.meta.type).toBe('suggestion')
    })
  })

  // 19. State isolation (2 tests)
  describe('state isolation between visitors', () => {
    test('separate visitors have separate stacks', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noEmptyDescribeRule.create(ctx1)
      const visitor2 = noEmptyDescribeRule.create(ctx2)

      const desc1 = createDescribeCall()
      visitor1.CallExpression(desc1)
      visitor1['CallExpression:exit'](desc1)

      const desc2 = createDescribeCall()
      visitor2.CallExpression(desc2)
      visitor2.CallExpression(createCallExpression('it'))
      visitor2['CallExpression:exit'](desc2)

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noEmptyDescribeRule.create(context)
      const visitor2 = noEmptyDescribeRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })
  })

  // 20. Multiple sequential empty describes → reports all (2 tests)
  describe('multiple sequential empty describes', () => {
    test('reports all sequential empty describes', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)

      const desc1 = createDescribeCall('describe', 1, 0)
      visitor.CallExpression(desc1)
      visitor['CallExpression:exit'](desc1)

      const desc2 = createDescribeCall('describe', 3, 0)
      visitor.CallExpression(desc2)
      visitor['CallExpression:exit'](desc2)

      const desc3 = createDescribeCall('describe', 5, 0)
      visitor.CallExpression(desc3)
      visitor['CallExpression:exit'](desc3)

      expect(reports.length).toBe(3)
    })

    test('reports only empty ones when mixed with non-empty', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)

      const desc1 = createDescribeCall('describe', 1, 0)
      visitor.CallExpression(desc1)
      visitor.CallExpression(createCallExpression('it', 2, 2))
      visitor['CallExpression:exit'](desc1)

      const desc2 = createDescribeCall('describe', 4, 0)
      visitor.CallExpression(desc2)
      visitor['CallExpression:exit'](desc2)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(4)
    })
  })

  // 21. describe with other function calls (not test/hook) → reports (2 tests)
  describe('describe with other function calls', () => {
    test('reports describe with only setupHelper() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createCallExpression('setupHelper'))
      visitor['CallExpression:exit'](desc)
      expect(reports.length).toBe(0)
    })

    test('reports describe with only doSomething() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createCallExpression('doSomething'))
      visitor['CallExpression:exit'](desc)
      expect(reports.length).toBe(0)
    })
  })

  // 22. describe with non-empty body (variable declarations, console.log) → no report (2 tests)
  describe('describe with non-call content', () => {
    test('does not report describe that is not empty (has it call)', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createCallExpression('it'))
      visitor.CallExpression(createCallExpression('console.log'))
      visitor['CallExpression:exit'](desc)
      expect(reports.length).toBe(0)
    })

    test('does not report describe with test and hook', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createCallExpression('beforeEach'))
      visitor.CallExpression(createCallExpression('test'))
      visitor['CallExpression:exit'](desc)
      expect(reports.length).toBe(0)
    })
  })

  // 23. context.only and context.skip with empty callback (3 tests)
  describe('context.only and context.skip with empty callback', () => {
    test('reports empty context.only()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const desc = createDescribeModifierCall('context', 'only')
      visitor.CallExpression(desc)
      visitor['CallExpression:exit'](desc)
      expect(reports.length).toBe(1)
    })

    test('reports empty context.skip()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const desc = createDescribeModifierCall('context', 'skip')
      visitor.CallExpression(desc)
      visitor['CallExpression:exit'](desc)
      expect(reports.length).toBe(1)
    })

    test('does not report context.only() with it() inside', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const desc = createDescribeModifierCall('context', 'only')
      visitor.CallExpression(desc)
      visitor.CallExpression(createCallExpression('it'))
      visitor['CallExpression:exit'](desc)
      expect(reports.length).toBe(0)
    })
  })

  // 24. suite.only, suite.skip, suite.each with empty callback (4 tests)
  describe('suite.only, suite.skip, suite.each with empty callback', () => {
    test('reports empty suite.only()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const desc = createDescribeModifierCall('suite', 'only')
      visitor.CallExpression(desc)
      visitor['CallExpression:exit'](desc)
      expect(reports.length).toBe(1)
    })

    test('reports empty suite.skip()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const desc = createDescribeModifierCall('suite', 'skip')
      visitor.CallExpression(desc)
      visitor['CallExpression:exit'](desc)
      expect(reports.length).toBe(1)
    })

    test('reports empty suite.each()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const desc = createDescribeModifierCall('suite', 'each')
      visitor.CallExpression(desc)
      visitor['CallExpression:exit'](desc)
      expect(reports.length).toBe(1)
    })

    test('does not report suite.skip() with test() inside', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const desc = createDescribeModifierCall('suite', 'skip')
      visitor.CallExpression(desc)
      visitor.CallExpression(createCallExpression('test'))
      visitor['CallExpression:exit'](desc)
      expect(reports.length).toBe(0)
    })
  })

  // 25. Member expression test calls inside describe (3 tests)
  describe('describe with member expression test calls', () => {
    test('does not report describe with it.only()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createMemberCallExpression('it', 'only'))
      visitor['CallExpression:exit'](desc)
      expect(reports.length).toBe(0)
    })

    test('does not report describe with test.skip()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createMemberCallExpression('test', 'skip'))
      visitor['CallExpression:exit'](desc)
      expect(reports.length).toBe(0)
    })

    test('does not report describe with it.each()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createMemberCallExpression('it', 'each'))
      visitor['CallExpression:exit'](desc)
      expect(reports.length).toBe(0)
    })
  })

  // 26. Member expression non-test calls inside describe (3 tests)
  describe('describe with member expression non-test calls', () => {
    test('does not report describe with console.log()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createMemberCallExpression('console', 'log'))
      visitor['CallExpression:exit'](desc)
      expect(reports.length).toBe(0)
    })

    test('does not report describe with myObj.method()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createMemberCallExpression('myObj', 'method'))
      visitor['CallExpression:exit'](desc)
      expect(reports.length).toBe(0)
    })

    test('does not report describe with Math.random()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createMemberCallExpression('Math', 'random'))
      visitor['CallExpression:exit'](desc)
      expect(reports.length).toBe(0)
    })
  })

  // 27. Three-level nesting (3 tests)
  describe('three-level nesting', () => {
    test('all three levels empty → all three report', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const outer = createDescribeCall('describe', 1, 0)
      visitor.CallExpression(outer)
      const middle = createDescribeCall('describe', 2, 2)
      visitor.CallExpression(middle)
      const inner = createDescribeCall('describe', 3, 4)
      visitor.CallExpression(inner)
      visitor['CallExpression:exit'](inner)
      visitor['CallExpression:exit'](middle)
      visitor['CallExpression:exit'](outer)
      expect(reports.length).toBe(3)
    })

    test('outer and middle empty, inner has test → test marks all ancestors as content', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const outer = createDescribeCall('describe', 1, 0)
      visitor.CallExpression(outer)
      const middle = createDescribeCall('context', 2, 2)
      visitor.CallExpression(middle)
      const inner = createDescribeCall('describe', 3, 4)
      visitor.CallExpression(inner)
      visitor.CallExpression(createCallExpression('it', 4, 6))
      visitor['CallExpression:exit'](inner)
      visitor['CallExpression:exit'](middle)
      visitor['CallExpression:exit'](outer)
      expect(reports.length).toBe(0)
    })

    test('outer has test, middle and inner empty → middle and inner report', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const outer = createDescribeCall('describe', 1, 0)
      visitor.CallExpression(outer)
      visitor.CallExpression(createCallExpression('it', 2, 2))
      const middle = createDescribeCall('describe', 3, 2)
      visitor.CallExpression(middle)
      const inner = createDescribeCall('describe', 4, 4)
      visitor.CallExpression(inner)
      visitor['CallExpression:exit'](inner)
      visitor['CallExpression:exit'](middle)
      visitor['CallExpression:exit'](outer)
      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.line).toBe(4)
      expect(reports[1].loc?.start.line).toBe(3)
    })
  })

  // 28. Mixed function type nesting (3 tests)
  describe('mixed function type nesting', () => {
    test('describe > context > suite all empty → all report', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const outer = createDescribeCall('describe', 1, 0)
      visitor.CallExpression(outer)
      const middle = createDescribeCall('context', 2, 2)
      visitor.CallExpression(middle)
      const inner = createDescribeCall('suite', 3, 4)
      visitor.CallExpression(inner)
      visitor['CallExpression:exit'](inner)
      visitor['CallExpression:exit'](middle)
      visitor['CallExpression:exit'](outer)
      expect(reports.length).toBe(3)
    })

    test('describe with test then nested empty context → only context reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const outer = createDescribeCall('describe', 1, 0)
      visitor.CallExpression(outer)
      visitor.CallExpression(createCallExpression('it', 2, 2))
      const inner = createDescribeCall('context', 3, 2)
      visitor.CallExpression(inner)
      visitor['CallExpression:exit'](inner)
      visitor['CallExpression:exit'](outer)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
    })

    test('describe > suite with it inside → no reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const outer = createDescribeCall('describe', 1, 0)
      visitor.CallExpression(outer)
      const inner = createDescribeCall('suite', 2, 2)
      visitor.CallExpression(inner)
      visitor.CallExpression(createCallExpression('it', 3, 4))
      visitor['CallExpression:exit'](inner)
      visitor['CallExpression:exit'](outer)
      expect(reports.length).toBe(0)
    })
  })

  // 29. CallExpression:exit with non-describe nodes (3 tests)
  describe('CallExpression:exit with non-describe nodes', () => {
    test('exit with regular call does not crash', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const call = createCallExpression('foo')
      expect(() => visitor['CallExpression:exit'](call)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('exit with null node does not crash', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      expect(() => visitor['CallExpression:exit'](null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('exit with empty object does not crash', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      expect(() => visitor['CallExpression:exit']({})).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  // 30. Multiple sequential non-empty describes (1 test)
  describe('multiple sequential non-empty describes', () => {
    test('does not report any non-empty sequential describes', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)

      const desc1 = createDescribeCall('describe', 1, 0)
      visitor.CallExpression(desc1)
      visitor.CallExpression(createCallExpression('it', 2, 2))
      visitor['CallExpression:exit'](desc1)

      const desc2 = createDescribeCall('describe', 4, 0)
      visitor.CallExpression(desc2)
      visitor.CallExpression(createCallExpression('test', 5, 2))
      visitor['CallExpression:exit'](desc2)

      const desc3 = createDescribeCall('describe', 7, 0)
      visitor.CallExpression(desc3)
      visitor.CallExpression(createCallExpression('beforeEach', 8, 2))
      visitor['CallExpression:exit'](desc3)

      expect(reports.length).toBe(0)
    })
  })

  // 31. Meta docs properties (5 tests)
  describe('meta docs properties', () => {
    test('meta.docs.category is testing', () => {
      expect(noEmptyDescribeRule.meta.docs.category).toBe('testing')
    })

    test('meta.docs.description is a non-empty string', () => {
      expect(typeof noEmptyDescribeRule.meta.docs.description).toBe('string')
      expect(noEmptyDescribeRule.meta.docs.description.length).toBeGreaterThan(0)
    })

    test('meta.docs.recommended is false', () => {
      expect(noEmptyDescribeRule.meta.docs.recommended).toBe(false)
    })

    test('meta.docs.url is a string containing no-empty-describe', () => {
      expect(typeof noEmptyDescribeRule.meta.docs.url).toBe('string')
      expect(noEmptyDescribeRule.meta.docs.url).toContain('no-empty-describe')
    })

    test('meta.schema is an empty array', () => {
      expect(Array.isArray(noEmptyDescribeRule.meta.schema)).toBe(true)
      expect(noEmptyDescribeRule.meta.schema).toHaveLength(0)
    })
  })

  // 32. Rule definition shape (1 test)
  describe('rule definition shape', () => {
    test('create returns visitor with CallExpression and CallExpression:exit', () => {
      const { context } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      expect(typeof visitor.CallExpression).toBe('function')
      expect(typeof visitor['CallExpression:exit']).toBe('function')
    })
  })

  // 33. Describe modifiers with content → no report (3 tests)
  describe('describe modifiers with content', () => {
    test('does not report describe.skip with it() inside', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const desc = createDescribeModifierCall('describe', 'skip')
      visitor.CallExpression(desc)
      visitor.CallExpression(createCallExpression('it'))
      visitor['CallExpression:exit'](desc)
      expect(reports.length).toBe(0)
    })

    test('does not report describe.each with test() inside', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const desc = createDescribeModifierCall('describe', 'each')
      visitor.CallExpression(desc)
      visitor.CallExpression(createCallExpression('test'))
      visitor['CallExpression:exit'](desc)
      expect(reports.length).toBe(0)
    })

    test('does not report context.skip with it() inside', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const desc = createDescribeModifierCall('context', 'skip')
      visitor.CallExpression(desc)
      visitor.CallExpression(createCallExpression('it'))
      visitor['CallExpression:exit'](desc)
      expect(reports.length).toBe(0)
    })
  })

  // 34. Alternating empty/non-empty sequential describes (1 test)
  describe('alternating empty and non-empty describes', () => {
    test('reports only the empty ones in alternating sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)

      const desc1 = createDescribeCall('describe', 1, 0)
      visitor.CallExpression(desc1)
      visitor.CallExpression(createCallExpression('it', 2, 2))
      visitor['CallExpression:exit'](desc1)

      const desc2 = createDescribeCall('describe', 4, 0)
      visitor.CallExpression(desc2)
      visitor['CallExpression:exit'](desc2)

      const desc3 = createDescribeCall('describe', 6, 0)
      visitor.CallExpression(desc3)
      visitor.CallExpression(createCallExpression('test', 7, 2))
      visitor['CallExpression:exit'](desc3)

      const desc4 = createDescribeCall('describe', 9, 0)
      visitor.CallExpression(desc4)
      visitor['CallExpression:exit'](desc4)

      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.line).toBe(4)
      expect(reports[1].loc?.start.line).toBe(9)
    })
  })

  // 35. Nested describe with test after inner exits (2 tests)
  describe('nested describe with test after inner empty exits', () => {
    test('inner empty exits first then test marks outer → only inner reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const outer = createDescribeCall('describe', 1, 0)
      visitor.CallExpression(outer)
      const inner = createDescribeCall('describe', 2, 2)
      visitor.CallExpression(inner)
      visitor['CallExpression:exit'](inner)
      visitor.CallExpression(createCallExpression('it', 3, 2))
      visitor['CallExpression:exit'](outer)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(2)
    })

    test('two inner describes, first empty second has test → only first reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const outer = createDescribeCall('describe', 1, 0)
      visitor.CallExpression(outer)
      const inner1 = createDescribeCall('describe', 2, 2)
      visitor.CallExpression(inner1)
      visitor['CallExpression:exit'](inner1)
      const inner2 = createDescribeCall('describe', 3, 2)
      visitor.CallExpression(inner2)
      visitor.CallExpression(createCallExpression('it', 4, 4))
      visitor['CallExpression:exit'](inner2)
      visitor['CallExpression:exit'](outer)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(2)
    })
  })

  // 36. Location reporting for modifier calls (2 tests)
  describe('location reporting for modifier calls', () => {
    test('reports correct location for describe.only()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const desc = createDescribeModifierCall('describe', 'only', 7, 4)
      visitor.CallExpression(desc)
      visitor['CallExpression:exit'](desc)
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('reports correct location for context.skip()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const desc = createDescribeModifierCall('context', 'skip', 12, 6)
      visitor.CallExpression(desc)
      visitor['CallExpression:exit'](desc)
      expect(reports[0].loc?.start.line).toBe(12)
      expect(reports[0].loc?.start.column).toBe(6)
    })
  })

  // 37. Suite message text verification (1 test)
  describe('suite message text', () => {
    test('suite() reports same message as describe()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const desc = createDescribeCall('suite')
      visitor.CallExpression(desc)
      visitor['CallExpression:exit'](desc)
      expect(reports[0].message).toBe('Empty describe block. Remove it or add tests.')
    })
  })

  // 38. Four levels of nesting all empty (1 test)
  describe('four levels of nesting all empty', () => {
    test('all four levels report as empty', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const level1 = createDescribeCall('describe', 1, 0)
      visitor.CallExpression(level1)
      const level2 = createDescribeCall('context', 2, 2)
      visitor.CallExpression(level2)
      const level3 = createDescribeCall('describe', 3, 4)
      visitor.CallExpression(level3)
      const level4 = createDescribeCall('suite', 4, 6)
      visitor.CallExpression(level4)
      visitor['CallExpression:exit'](level4)
      visitor['CallExpression:exit'](level3)
      visitor['CallExpression:exit'](level2)
      visitor['CallExpression:exit'](level1)
      expect(reports.length).toBe(4)
    })
  })

  // 39. Deeply nested member expression call where rootName is null (1 test)
  describe('deeply nested member expression call', () => {
    test('describe with deeply chained call (rootName null) → reports as empty', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createDeepMemberCallExpression(2, 2))
      visitor['CallExpression:exit'](desc)
      expect(reports.length).toBe(1)
    })
  })

  // 40. Nested describe inside parent that only has describe calls (1 test)
  describe('nested describe with only child describes and no tests', () => {
    test('parent with only nested empty describes → all report', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const outer = createDescribeCall('describe', 1, 0)
      visitor.CallExpression(outer)
      const inner1 = createDescribeCall('context', 2, 2)
      visitor.CallExpression(inner1)
      visitor['CallExpression:exit'](inner1)
      const inner2 = createDescribeCall('suite', 3, 2)
      visitor.CallExpression(inner2)
      visitor['CallExpression:exit'](inner2)
      visitor['CallExpression:exit'](outer)
      expect(reports.length).toBe(3)
    })
  })

  // SECTION: additional coverage
  describe('additional coverage', () => {
    test('afterAll hook marks describe as having content', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createCallExpression('afterAll', 2, 2))
      visitor['CallExpression:exit'](desc)
      expect(reports).toHaveLength(0)
    })

    test('xit marks describe as having content', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const desc = createDescribeCall()
      visitor.CallExpression(desc)
      visitor.CallExpression(createCallExpression('xit', 2, 2))
      visitor['CallExpression:exit'](desc)
      expect(reports).toHaveLength(0)
    })

    test('context.only with empty body reports as empty', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyDescribeRule.create(context)
      const desc = createDescribeModifierCall('context', 'only')
      visitor.CallExpression(desc)
      visitor['CallExpression:exit'](desc)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('Empty describe')
    })

    test('meta schema should be empty array', () => {
      expect(noEmptyDescribeRule.meta.schema).toEqual([])
    })

    test('meta severity should be warn', () => {
      expect(noEmptyDescribeRule.meta.severity).toBe('warn')
    })
  })
})
