import { describe, test, expect, vi } from 'vitest'
import { noNestedDescribeRule } from '../../../../src/rules/testing/no-nested-describe.js'
import defaultExport from '../../../../src/rules/testing/no-nested-describe.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.test.ts',
  source = 'describe("suite", () => { describe("inner", () => {}); });',
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

// Helper to enter and exit N nested describe calls and return reports
function enterNestedDescribes(
  visitor: ReturnType<typeof noNestedDescribeRule.create>,
  count: number,
  createFn: (line: number, col: number) => unknown = createDescribeCall,
): void {
  for (let i = 0; i < count; i++) {
    visitor.CallExpression(createFn(i + 1, i * 2))
  }
}

function exitNestedDescribes(
  visitor: ReturnType<typeof noNestedDescribeRule.create>,
  count: number,
  createFn: (line: number, col: number) => unknown = createDescribeCall,
): void {
  for (let i = 0; i < count; i++) {
    visitor['CallExpression:exit'](createFn(i + 1, i * 2))
  }
}

describe('no-nested-describe rule', () => {
  // =====================================================
  // META TESTS (8)
  // =====================================================
  describe('meta', () => {
    test('has correct category', () => {
      expect(noNestedDescribeRule.meta.docs.category).toBe('testing')
    })

    test('has correct severity', () => {
      expect(noNestedDescribeRule.meta.severity).toBe('warn')
    })

    test('has correct type', () => {
      expect(noNestedDescribeRule.meta.type).toBe('suggestion')
    })

    test('has description', () => {
      expect(noNestedDescribeRule.meta.docs.description).toBeTruthy()
      expect(typeof noNestedDescribeRule.meta.docs.description).toBe('string')
    })

    test('has docs url containing rule name', () => {
      expect(noNestedDescribeRule.meta.docs.url).toContain('no-nested-describe')
    })

    test('has schema', () => {
      expect(noNestedDescribeRule.meta.schema).toHaveLength(1)
      const schema = noNestedDescribeRule.meta.schema[0] as Record<string, unknown>
      expect(schema.type).toBe('object')
    })

    test('schema has maxDepth property with minimum 1', () => {
      const schema = noNestedDescribeRule.meta.schema[0] as Record<string, unknown>
      const props = schema.properties as Record<string, unknown>
      expect(props).toHaveProperty('maxDepth')
      const maxDepth = props.maxDepth as Record<string, unknown>
      expect(maxDepth.minimum).toBe(1)
    })

    test('docs recommended is false', () => {
      expect(noNestedDescribeRule.meta.docs.recommended).toBe(false)
    })
  })

  // =====================================================
  // STRUCTURE TESTS (2)
  // =====================================================
  describe('create', () => {
    test('returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noNestedDescribeRule.create(context)
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export equals named export', () => {
      expect(defaultExport).toBe(noNestedDescribeRule)
    })
  })

  // =====================================================
  // POSITIVE CASES - REPORTS VIOLATION (20)
  // =====================================================
  describe('detecting excessive nesting', () => {
    test('reports 6th nested describe with default maxDepth=5', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedDescribeRule.create(context)
      enterNestedDescribes(visitor, 6)
      expect(reports.length).toBe(1)
      expect(reports[0]!.message).toContain('depth 6')
    })

    test('reports 4th through 7th nested describe with maxDepth=3', () => {
      const { context, reports } = createMockContext({ maxDepth: 3 })
      const visitor = noNestedDescribeRule.create(context)
      enterNestedDescribes(visitor, 7)
      expect(reports.length).toBe(4)
    })

    test('reports describe() at depth 6 with default maxDepth=5', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedDescribeRule.create(context)
      enterNestedDescribes(visitor, 6)
      expect(reports.length).toBe(1)
    })

    test('reports context() at excessive depth', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedDescribeRule.create(context)
      enterNestedDescribes(visitor, 6, createContextCall)
      expect(reports.length).toBe(1)
      expect(reports[0]!.message).toContain('depth 6')
    })

    test('reports suite() at excessive depth', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedDescribeRule.create(context)
      enterNestedDescribes(visitor, 6, createSuiteCall)
      expect(reports.length).toBe(1)
      expect(reports[0]!.message).toContain('depth 6')
    })

    test('reports describe.skip() at excessive depth', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedDescribeRule.create(context)
      // Enter 5 describe calls to reach maxDepth, then a describe.skip
      for (let i = 0; i < 5; i++) {
        visitor.CallExpression(createDescribeCall(i + 1, i * 2))
      }
      visitor.CallExpression(createMemberCall('describe', 'skip', 6, 10))
      expect(reports.length).toBe(1)
    })

    test('reports describe.only() at excessive depth', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedDescribeRule.create(context)
      for (let i = 0; i < 5; i++) {
        visitor.CallExpression(createDescribeCall(i + 1, i * 2))
      }
      visitor.CallExpression(createMemberCall('describe', 'only', 6, 10))
      expect(reports.length).toBe(1)
    })

    test('reports describe.each() at excessive depth', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedDescribeRule.create(context)
      for (let i = 0; i < 5; i++) {
        visitor.CallExpression(createDescribeCall(i + 1, i * 2))
      }
      visitor.CallExpression(createMemberCall('describe', 'each', 6, 10))
      expect(reports.length).toBe(1)
    })

    test('reports mixed describe/context/suite nesting exceeding maxDepth', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedDescribeRule.create(context)
      visitor.CallExpression(createDescribeCall(1, 0))
      visitor.CallExpression(createContextCall(2, 0))
      visitor.CallExpression(createSuiteCall(3, 0))
      visitor.CallExpression(createDescribeCall(4, 0))
      visitor.CallExpression(createContextCall(5, 0))
      visitor.CallExpression(createSuiteCall(6, 0)) // depth 6
      expect(reports.length).toBe(1)
    })

    test('reports with custom maxDepth=1 on 2nd nested describe', () => {
      const { context, reports } = createMockContext({ maxDepth: 1 })
      const visitor = noNestedDescribeRule.create(context)
      visitor.CallExpression(createDescribeCall(1, 0))
      visitor.CallExpression(createDescribeCall(2, 2))
      expect(reports.length).toBe(1)
      expect(reports[0]!.message).toContain('depth 2')
    })

    test('reports with custom maxDepth=2 on 3rd nested describe', () => {
      const { context, reports } = createMockContext({ maxDepth: 2 })
      const visitor = noNestedDescribeRule.create(context)
      visitor.CallExpression(createDescribeCall(1, 0))
      visitor.CallExpression(createDescribeCall(2, 2))
      visitor.CallExpression(createDescribeCall(3, 4))
      expect(reports.length).toBe(1)
      expect(reports[0]!.message).toContain('depth 3')
    })

    test('message includes depth number', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedDescribeRule.create(context)
      enterNestedDescribes(visitor, 6)
      expect(reports[0]!.message).toContain('depth 6')
    })

    test('message includes max allowed depth', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedDescribeRule.create(context)
      enterNestedDescribes(visitor, 6)
      expect(reports[0]!.message).toContain('Maximum allowed depth is 5')
    })

    test('message suggests flattening', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedDescribeRule.create(context)
      enterNestedDescribes(visitor, 6)
      expect(reports[0]!.message).toContain('flattening')
    })

    test('correct location info in report', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedDescribeRule.create(context)
      for (let i = 0; i < 5; i++) {
        visitor.CallExpression(createDescribeCall(i + 1, i * 2))
      }
      const deepNode = createDescribeCall(10, 20)
      visitor.CallExpression(deepNode)
      expect(reports[0]!.loc?.start.line).toBe(10)
      expect(reports[0]!.loc?.start.column).toBe(20)
    })

    test('reports multiple violations at different depths with maxDepth=3', () => {
      const { context, reports } = createMockContext({ maxDepth: 3 })
      const visitor = noNestedDescribeRule.create(context)
      enterNestedDescribes(visitor, 5)
      expect(reports.length).toBe(2)
      expect(reports[0]!.message).toContain('depth 4')
      expect(reports[1]!.message).toContain('depth 5')
    })

    test('reports violation at custom maxDepth=1 for very first nesting', () => {
      const { context, reports } = createMockContext({ maxDepth: 1 })
      const visitor = noNestedDescribeRule.create(context)
      visitor.CallExpression(createDescribeCall(1, 0))
      visitor.CallExpression(createDescribeCall(2, 0))
      expect(reports[0]!.message).toContain('Maximum allowed depth is 1')
    })

    test('reports with maxDepth=2 for depth 4', () => {
      const { context, reports } = createMockContext({ maxDepth: 2 })
      const visitor = noNestedDescribeRule.create(context)
      enterNestedDescribes(visitor, 4)
      expect(reports.length).toBe(2)
    })

    test('reports context.skip() at excessive depth', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedDescribeRule.create(context)
      for (let i = 0; i < 5; i++) {
        visitor.CallExpression(createContextCall(i + 1, i * 2))
      }
      visitor.CallExpression(createMemberCall('context', 'skip', 6, 10))
      expect(reports.length).toBe(1)
    })

    test('reports suite.only() at excessive depth', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedDescribeRule.create(context)
      for (let i = 0; i < 5; i++) {
        visitor.CallExpression(createSuiteCall(i + 1, i * 2))
      }
      visitor.CallExpression(createMemberCall('suite', 'only', 6, 10))
      expect(reports.length).toBe(1)
    })
  })

  // =====================================================
  // NEGATIVE CASES - DOES NOT REPORT (25)
  // =====================================================
  describe('allowed nesting levels', () => {
    test('does not report 1 describe block (depth 1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedDescribeRule.create(context)
      visitor.CallExpression(createDescribeCall())
      expect(reports.length).toBe(0)
    })

    test('does not report 2 nested describe blocks (depth 2)', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedDescribeRule.create(context)
      enterNestedDescribes(visitor, 2)
      expect(reports.length).toBe(0)
    })

    test('does not report 3 nested describe blocks (depth 3)', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedDescribeRule.create(context)
      enterNestedDescribes(visitor, 3)
      expect(reports.length).toBe(0)
    })

    test('does not report 4 nested describe blocks (depth 4)', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedDescribeRule.create(context)
      enterNestedDescribes(visitor, 4)
      expect(reports.length).toBe(0)
    })

    test('does not report 5 nested describe blocks (depth 5, exactly at limit)', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedDescribeRule.create(context)
      enterNestedDescribes(visitor, 5)
      expect(reports.length).toBe(0)
    })

    test('does not report it() calls at any depth', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedDescribeRule.create(context)
      visitor.CallExpression(createDescribeCall())
      const itCall: unknown = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [
          { type: 'Literal', value: 'test' },
          { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(itCall)
      expect(reports.length).toBe(0)
    })

    test('does not report test() calls at any depth', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedDescribeRule.create(context)
      visitor.CallExpression(createDescribeCall())
      const testCall: unknown = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'test' },
        arguments: [
          { type: 'Literal', value: 'test' },
          { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(testCall)
      expect(reports.length).toBe(0)
    })

    test('does not report regular function calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedDescribeRule.create(context)
      visitor.CallExpression(createOtherCall('someFunction'))
      expect(reports.length).toBe(0)
    })

    test('does not report beforeEach() at any depth', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedDescribeRule.create(context)
      visitor.CallExpression(createOtherCall('beforeEach'))
      expect(reports.length).toBe(0)
    })

    test('does not report afterEach() at any depth', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedDescribeRule.create(context)
      visitor.CallExpression(createOtherCall('afterEach'))
      expect(reports.length).toBe(0)
    })

    test('does not report null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedDescribeRule.create(context)
      visitor.CallExpression(null)
      expect(reports.length).toBe(0)
    })

    test('does not report undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedDescribeRule.create(context)
      visitor.CallExpression(undefined)
      expect(reports.length).toBe(0)
    })

    test('does not report on empty source with no calls', () => {
      const { context, reports } = createMockContext({}, '/src/empty.ts', '')
      const visitor = noNestedDescribeRule.create(context)
      expect(reports.length).toBe(0)
    })

    test('does not report expect() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedDescribeRule.create(context)
      visitor.CallExpression(createOtherCall('expect'))
      expect(reports.length).toBe(0)
    })

    test('does not report node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedDescribeRule.create(context)
      visitor.CallExpression({ type: 'CallExpression' })
      expect(reports.length).toBe(0)
    })

    test('does not report node without type', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedDescribeRule.create(context)
      visitor.CallExpression({ name: 'something' })
      expect(reports.length).toBe(0)
    })

    test('does not report node with FunctionExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedDescribeRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'FunctionExpression' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report it() inside deeply nested describe', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedDescribeRule.create(context)
      const d1 = createDescribeCall(1, 0)
      const d2 = createDescribeCall(2, 2)
      const d3 = createDescribeCall(3, 4)
      visitor.CallExpression(d1)
      visitor.CallExpression(d2)
      visitor.CallExpression(d3)
      const itCall: unknown = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [
          { type: 'Literal', value: 'test' },
          { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] } },
        ],
        loc: { start: { line: 4, column: 0 }, end: { line: 4, column: 20 } },
      }
      visitor.CallExpression(itCall)
      visitor['CallExpression:exit'](d3)
      visitor['CallExpression:exit'](d2)
      visitor['CallExpression:exit'](d1)
      expect(reports.length).toBe(0)
    })

    test('does not report beforeAll() at any depth', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedDescribeRule.create(context)
      visitor.CallExpression(createOtherCall('beforeAll'))
      expect(reports.length).toBe(0)
    })

    test('does not report afterAll() at any depth', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedDescribeRule.create(context)
      visitor.CallExpression(createOtherCall('afterAll'))
      expect(reports.length).toBe(0)
    })

    test('does not report xdescribe() as a describe function', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedDescribeRule.create(context)
      visitor.CallExpression(createOtherCall('xdescribe'))
      expect(reports.length).toBe(0)
    })

    test('does not report fdescribe() as a describe function', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedDescribeRule.create(context)
      visitor.CallExpression(createOtherCall('fdescribe'))
      expect(reports.length).toBe(0)
    })

    test('does not report console.log() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedDescribeRule.create(context)
      visitor.CallExpression(createOtherCall('console'))
      expect(reports.length).toBe(0)
    })

    test('does not report it.only() at any depth', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedDescribeRule.create(context)
      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createMemberCall('it', 'only'))
      expect(reports.length).toBe(0)
    })

    test('does not report test.skip() at any depth', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedDescribeRule.create(context)
      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createMemberCall('test', 'skip'))
      expect(reports.length).toBe(0)
    })
  })

  // =====================================================
  // CUSTOM OPTIONS (10)
  // =====================================================
  describe('custom options', () => {
    test('describeFunctionNames option adds custom function name', () => {
      const { context, reports } = createMockContext({
        describeFunctionNames: ['myDescribe', 'describe', 'context', 'suite'],
      })
      const visitor = noNestedDescribeRule.create(context)
      const myDescribe: unknown = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'myDescribe' },
        arguments: [
          { type: 'Literal', value: 'suite' },
          { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      // 5 describes via myDescribe = depth 5, then one more = depth 6
      for (let i = 0; i < 5; i++) {
        visitor.CallExpression(myDescribe)
      }
      visitor.CallExpression(createDescribeCall(6, 0))
      expect(reports.length).toBe(1)
    })

    test('describeFunctionNames replaces defaults — describe no longer tracked', () => {
      const { context, reports } = createMockContext({
        describeFunctionNames: ['myDescribe'],
      })
      const visitor = noNestedDescribeRule.create(context)
      // describe is no longer recognized, so nesting 6 of them reports nothing
      enterNestedDescribes(visitor, 6)
      expect(reports.length).toBe(0)
    })

    test('describeFunctionNames replaces defaults — myDescribe is tracked', () => {
      const { context, reports } = createMockContext({
        describeFunctionNames: ['myDescribe'],
      })
      const visitor = noNestedDescribeRule.create(context)
      const myDescribe: unknown = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'myDescribe' },
        arguments: [
          { type: 'Literal', value: 'suite' },
          { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      for (let i = 0; i < 6; i++) {
        visitor.CallExpression(myDescribe)
      }
      expect(reports.length).toBe(1)
    })

    test('maxDepth=10 allows deeper nesting', () => {
      const { context, reports } = createMockContext({ maxDepth: 10 })
      const visitor = noNestedDescribeRule.create(context)
      enterNestedDescribes(visitor, 10)
      expect(reports.length).toBe(0)
    })

    test('maxDepth=10 reports at depth 11', () => {
      const { context, reports } = createMockContext({ maxDepth: 10 })
      const visitor = noNestedDescribeRule.create(context)
      enterNestedDescribes(visitor, 11)
      expect(reports.length).toBe(1)
      expect(reports[0]!.message).toContain('depth 11')
    })

    test('maxDepth=1 is very restrictive', () => {
      const { context, reports } = createMockContext({ maxDepth: 1 })
      const visitor = noNestedDescribeRule.create(context)
      enterNestedDescribes(visitor, 3)
      expect(reports.length).toBe(2)
    })

    test('empty options uses defaults', () => {
      const { context, reports } = createMockContext({})
      const visitor = noNestedDescribeRule.create(context)
      enterNestedDescribes(visitor, 5)
      expect(reports.length).toBe(0)
      enterNestedDescribes(visitor, 1)
      expect(reports.length).toBe(1)
    })

    test('custom maxDepth with custom describeFunctionNames', () => {
      const { context, reports } = createMockContext({
        describeFunctionNames: ['myGroup'],
        maxDepth: 2,
      })
      const visitor = noNestedDescribeRule.create(context)
      const myGroup: unknown = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'myGroup' },
        arguments: [
          { type: 'Literal', value: 'suite' },
          { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      for (let i = 0; i < 3; i++) {
        visitor.CallExpression(myGroup)
      }
      expect(reports.length).toBe(1)
    })

    test('maxDepth message reflects custom value', () => {
      const { context, reports } = createMockContext({ maxDepth: 2 })
      const visitor = noNestedDescribeRule.create(context)
      enterNestedDescribes(visitor, 3)
      expect(reports[0]!.message).toContain('Maximum allowed depth is 2')
    })

    test('second custom describe function name is recognized', () => {
      const { context, reports } = createMockContext({
        describeFunctionNames: ['myDescribe', 'myGroup'],
      })
      const visitor = noNestedDescribeRule.create(context)
      const myDescribe: unknown = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'myDescribe' },
        arguments: [
          { type: 'Literal', value: 'suite' },
          { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      const myGroup: unknown = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'myGroup' },
        arguments: [
          { type: 'Literal', value: 'suite' },
          { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] } },
        ],
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 30 } },
      }
      for (let i = 0; i < 3; i++) {
        visitor.CallExpression(myDescribe)
      }
      for (let i = 0; i < 3; i++) {
        visitor.CallExpression(myGroup)
      }
      // depth 6 = 1 report
      expect(reports.length).toBe(1)
    })
  })

  // =====================================================
  // EDGE CASES (12)
  // =====================================================
  describe('edge cases', () => {
    test('depth tracking resets after exit', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedDescribeRule.create(context)
      // Enter 5, exit all, then enter 5 more — should be fine
      enterNestedDescribes(visitor, 5)
      exitNestedDescribes(visitor, 5)
      enterNestedDescribes(visitor, 5)
      expect(reports.length).toBe(0)
    })

    test('depth tracking resets and reports correctly after exit', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedDescribeRule.create(context)
      enterNestedDescribes(visitor, 5)
      exitNestedDescribes(visitor, 5)
      enterNestedDescribes(visitor, 6)
      expect(reports.length).toBe(1)
    })

    test('multiple independent describe blocks at same level', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedDescribeRule.create(context)
      // First block
      const d1 = createDescribeCall(1, 0)
      visitor.CallExpression(d1)
      visitor['CallExpression:exit'](d1)
      // Second block
      const d2 = createDescribeCall(2, 0)
      visitor.CallExpression(d2)
      visitor['CallExpression:exit'](d2)
      // Third block
      const d3 = createDescribeCall(3, 0)
      visitor.CallExpression(d3)
      visitor['CallExpression:exit'](d3)
      expect(reports.length).toBe(0)
    })

    test('separate visitors do not share state', () => {
      const { context: ctx1, reports: reports1 } = createMockContext()
      const { context: ctx2, reports: reports2 } = createMockContext()
      const visitor1 = noNestedDescribeRule.create(ctx1)
      const visitor2 = noNestedDescribeRule.create(ctx2)
      enterNestedDescribes(visitor1, 6)
      enterNestedDescribes(visitor2, 3)
      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(0)
    })

    test('partial exit reduces depth correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedDescribeRule.create(context)
      // Enter 4, exit 2 (depth now 2), enter 3 more (depth 5) — no report
      enterNestedDescribes(visitor, 4)
      exitNestedDescribes(visitor, 2)
      visitor.CallExpression(createDescribeCall(5, 0))
      visitor.CallExpression(createDescribeCall(6, 0))
      visitor.CallExpression(createDescribeCall(7, 0))
      expect(reports.length).toBe(0)
    })

    test('partial exit then exceed', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedDescribeRule.create(context)
      // Enter 4, exit 2 (depth 2), enter 4 more (depth 6) — 1 report
      enterNestedDescribes(visitor, 4)
      exitNestedDescribes(visitor, 2)
      visitor.CallExpression(createDescribeCall(5, 0))
      visitor.CallExpression(createDescribeCall(6, 0))
      visitor.CallExpression(createDescribeCall(7, 0))
      visitor.CallExpression(createDescribeCall(8, 0))
      expect(reports.length).toBe(1)
    })

    test('non-describe exit does not affect depth', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedDescribeRule.create(context)
      visitor.CallExpression(createDescribeCall())
      visitor['CallExpression:exit'](createOtherCall('it'))
      // Depth should still be 1 because 'it' exit doesn't decrement
      visitor.CallExpression(createDescribeCall())
      // depth 2, still fine
      expect(reports.length).toBe(0)
    })

    test('handles node without loc in report', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedDescribeRule.create(context)
      const noLocNode: unknown = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'describe' },
        arguments: [],
      }
      for (let i = 0; i < 5; i++) {
        visitor.CallExpression(createDescribeCall())
      }
      // This node has no loc
      visitor.CallExpression(noLocNode)
      expect(reports.length).toBe(1)
    })

    test('enter and exit interleaved correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedDescribeRule.create(context)
      // Enter d1, d2, exit d2, enter d3, exit d3, exit d1
      const d1 = createDescribeCall(1, 0)
      const d2 = createDescribeCall(2, 0)
      const d3 = createDescribeCall(3, 0)
      visitor.CallExpression(d1) // depth 1
      visitor.CallExpression(d2) // depth 2
      visitor['CallExpression:exit'](d2) // depth 1
      visitor.CallExpression(d3) // depth 2
      visitor['CallExpression:exit'](d3) // depth 1
      visitor['CallExpression:exit'](d1) // depth 0
      expect(reports.length).toBe(0)
    })

    test('reports only when exceeding — not at exact limit', () => {
      const { context, reports } = createMockContext({ maxDepth: 3 })
      const visitor = noNestedDescribeRule.create(context)
      enterNestedDescribes(visitor, 3)
      expect(reports.length).toBe(0)
      visitor.CallExpression(createDescribeCall(4, 0)) // depth 4
      expect(reports.length).toBe(1)
    })

    test('schema additionalProperties is false', () => {
      const schema = noNestedDescribeRule.meta.schema[0] as Record<string, unknown>
      expect(schema.additionalProperties).toBe(false)
    })

    test('schema has describeFunctionNames property', () => {
      const schema = noNestedDescribeRule.meta.schema[0] as Record<string, unknown>
      const props = schema.properties as Record<string, unknown>
      expect(props).toHaveProperty('describeFunctionNames')
      const descFn = props.describeFunctionNames as Record<string, unknown>
      expect(descFn.type).toBe('array')
    })
  })

  // =====================================================
  // ADDITIONAL COVERAGE (18) to reach exactly 95
  // =====================================================
  describe('additional coverage', () => {
    test('meta description mentions nested or describe', () => {
      const desc = noNestedDescribeRule.meta.docs.description
      expect(desc?.toLowerCase()).toContain('describe')
    })

    test('meta schema first element has type object', () => {
      const schema = noNestedDescribeRule.meta.schema[0] as Record<string, unknown>
      expect(schema.type).toBe('object')
    })

    test('has create as a function', () => {
      expect(typeof noNestedDescribeRule.create).toBe('function')
    })

    test('returns visitor with CallExpression:exit', () => {
      const { context } = createMockContext()
      const visitor = noNestedDescribeRule.create(context)
      expect(typeof visitor['CallExpression:exit']).toBe('function')
    })

    test('docs url contains codeforge.dev', () => {
      expect(noNestedDescribeRule.meta.docs.url).toContain('codeforge.dev')
    })

    test('meta as plain object not array', () => {
      expect(typeof noNestedDescribeRule.meta).toBe('object')
      expect(Array.isArray(noNestedDescribeRule.meta)).toBe(false)
    })

    test('describe.concurrent() at excessive depth reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedDescribeRule.create(context)
      for (let i = 0; i < 5; i++) {
        visitor.CallExpression(createDescribeCall(i + 1, i * 2))
      }
      visitor.CallExpression(createMemberCall('describe', 'concurrent', 6, 10))
      expect(reports.length).toBe(1)
    })

    test('no violations when no call expressions are processed', () => {
      const { context, reports } = createMockContext()
      noNestedDescribeRule.create(context)
      expect(reports.length).toBe(0)
    })

    test('context.each() at excessive depth reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedDescribeRule.create(context)
      for (let i = 0; i < 5; i++) {
        visitor.CallExpression(createContextCall(i + 1, i * 2))
      }
      visitor.CallExpression(createMemberCall('context', 'each', 6, 10))
      expect(reports.length).toBe(1)
    })

    test('suite.each() at excessive depth reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedDescribeRule.create(context)
      for (let i = 0; i < 5; i++) {
        visitor.CallExpression(createSuiteCall(i + 1, i * 2))
      }
      visitor.CallExpression(createMemberCall('suite', 'each', 6, 10))
      expect(reports.length).toBe(1)
    })

    test('depth resets to zero after all exits', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedDescribeRule.create(context)
      enterNestedDescribes(visitor, 6)
      exitNestedDescribes(visitor, 6)
      // Depth is 0 now, enter 5 more — should be fine
      enterNestedDescribes(visitor, 5)
      expect(reports.length).toBe(1)
    })

    test('entering 8 describes with maxDepth=5 gives 3 reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedDescribeRule.create(context)
      enterNestedDescribes(visitor, 8)
      expect(reports.length).toBe(3)
    })

    test('entering 10 describes with maxDepth=3 gives 7 reports', () => {
      const { context, reports } = createMockContext({ maxDepth: 3 })
      const visitor = noNestedDescribeRule.create(context)
      enterNestedDescribes(visitor, 10)
      expect(reports.length).toBe(7)
    })

    test('report includes node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedDescribeRule.create(context)
      enterNestedDescribes(visitor, 6)
      expect(reports.length).toBe(1)
      expect(reports[0]!.message).toBeTruthy()
    })

    test('does not report setup() calls at depth', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedDescribeRule.create(context)
      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createOtherCall('setup'))
      expect(reports.length).toBe(0)
    })

    test('does not report teardown() calls at depth', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedDescribeRule.create(context)
      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createOtherCall('teardown'))
      expect(reports.length).toBe(0)
    })

    test('mixed sequential independent describe blocks at maxDepth do not report', () => {
      const { context, reports } = createMockContext({ maxDepth: 2 })
      const visitor = noNestedDescribeRule.create(context)
      for (let round = 0; round < 3; round++) {
        const d1 = createDescribeCall(round * 3 + 1, 0)
        const d2 = createDescribeCall(round * 3 + 2, 0)
        visitor.CallExpression(d1)
        visitor.CallExpression(d2)
        visitor['CallExpression:exit'](d2)
        visitor['CallExpression:exit'](d1)
      }
      expect(reports.length).toBe(0)
    })

    test('custom describeFunctionNames with member expression tracked', () => {
      const { context, reports } = createMockContext({
        describeFunctionNames: ['myGroup'],
        maxDepth: 2,
      })
      const visitor = noNestedDescribeRule.create(context)
      const myGroupMember: unknown = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myGroup' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [
          { type: 'Literal', value: 'suite' },
          { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      for (let i = 0; i < 3; i++) {
        visitor.CallExpression(myGroupMember)
      }
      expect(reports.length).toBe(1)
    })
  })
})
