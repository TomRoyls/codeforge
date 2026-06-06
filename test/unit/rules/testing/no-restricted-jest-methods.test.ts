import { describe, test, expect, vi } from 'vitest'
import { noRestrictedJestMethodsRule } from '../../../../src/rules/testing/no-restricted-jest-methods.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: {
    end: { column: number; line: number }
    start: { column: number; line: number }
  }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.test.ts',
  source = 'jest.mock("./module");',
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

function createJestMethodCall(
  methodName: string,
  args: unknown[] = [],
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'jest' },
      property: { type: 'Identifier', name: methodName },
      computed: false,
    },
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createNonJestCall(
  objectName: string,
  methodName: string,
  args: unknown[] = [],
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: objectName },
      property: { type: 'Identifier', name: methodName },
      computed: false,
    },
    arguments: args,
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 20 },
    },
  }
}

// ---- TESTS ----

describe('no-restricted-jest-methods', () => {
  // === Restricted method detected ===
  test('reports jest.mock() when restricted', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['mock'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('mock', [{ type: 'Literal', value: './module' }]),
    )
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('mock')
  })

  test('reports vi.fn() when restricted', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['fn'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('fn'),
    )
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('fn')
  })

  test('reports jest.spyOn() when restricted', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['spyOn'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('spyOn', [
        { type: 'Identifier', name: 'obj' },
        { type: 'Literal', value: 'method' },
      ]),
    )
    expect(reports.length).toBe(1)
  })

  test('reports jest.useFakeTimers() when restricted', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['useFakeTimers'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('useFakeTimers'),
    )
    expect(reports.length).toBe(1)
  })

  test('reports jest.advanceTimersByTime() when restricted', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['advanceTimersByTime'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('advanceTimersByTime', [
        { type: 'Literal', value: 1000 },
      ]),
    )
    expect(reports.length).toBe(1)
  })

  test('reports jest.clearAllMocks() when restricted', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['clearAllMocks'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('clearAllMocks'),
    )
    expect(reports.length).toBe(1)
  })

  test('reports jest.restoreAllMocks() when restricted', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['restoreAllMocks'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('restoreAllMocks'),
    )
    expect(reports.length).toBe(1)
  })

  test('reports jest.resetAllMocks() when restricted', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['resetAllMocks'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('resetAllMocks'),
    )
    expect(reports.length).toBe(1)
  })

  test('reports jest.setTimeout() when restricted', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['setTimeout'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('setTimeout', [{ type: 'Literal', value: 5000 }]),
    )
    expect(reports.length).toBe(1)
  })

  test('reports jest.setSystemTime() when restricted', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['setSystemTime'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('setSystemTime'),
    )
    expect(reports.length).toBe(1)
  })

  test('reports jest.createMockFromModule() when restricted', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['createMockFromModule'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('createMockFromModule', [
        { type: 'Literal', value: './module' },
      ]),
    )
    expect(reports.length).toBe(1)
  })

  test('reports jest.isolateModules() when restricted', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['isolateModules'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('isolateModules'),
    )
    expect(reports.length).toBe(1)
  })

  test('reports jest.replaceProperty() when restricted', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['replaceProperty'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('replaceProperty'),
    )
    expect(reports.length).toBe(1)
  })

  // === Multiple restricted methods ===
  test('reports first restricted method when multiple configured', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['mock', 'fn', 'spyOn'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('mock', [{ type: 'Literal', value: './a' }]),
    )
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('mock')
  })

  test('reports fn when mock and fn both restricted', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['mock', 'fn'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('fn'),
    )
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('fn')
  })

  test('does not report un-restricted method when other methods are restricted', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['mock', 'fn'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('spyOn'),
    )
    expect(reports.length).toBe(0)
  })

  // === No restricted methods configured ===
  test('does not report when no restricted methods configured', () => {
    const { context, reports } = createMockContext({})
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('mock', [{ type: 'Literal', value: './module' }]),
    )
    expect(reports.length).toBe(0)
  })

  test('does not report when restrictedMethods is empty array', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: [],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('mock'),
    )
    expect(reports.length).toBe(0)
  })

  test('does not report when options is empty object', () => {
    const { context, reports } = createMockContext()
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('fn'),
    )
    expect(reports.length).toBe(0)
  })

  // === Non-jest objects ===
  test('does not report console.log()', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['log'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createNonJestCall('console', 'log'),
    )
    expect(reports.length).toBe(0)
  })

  test('does not report expect.anything()', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['anything'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createNonJestCall('expect', 'anything'),
    )
    expect(reports.length).toBe(0)
  })

  test('does not report Math.random()', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['random'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createNonJestCall('Math', 'random'),
    )
    expect(reports.length).toBe(0)
  })

  test('does not report Array.from()', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['from'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createNonJestCall('Array', 'from'),
    )
    expect(reports.length).toBe(0)
  })

  test('does not report Object.keys()', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['keys'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createNonJestCall('Object', 'keys'),
    )
    expect(reports.length).toBe(0)
  })

  test('does not report Promise.resolve()', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['resolve'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createNonJestCall('Promise', 'resolve'),
    )
    expect(reports.length).toBe(0)
  })

  // === Valid (non-restricted) jest methods ===
  test('does not report jest.mock() when not restricted', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['fn'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('mock', [{ type: 'Literal', value: './a' }]),
    )
    expect(reports.length).toBe(0)
  })

  test('does not report vi.fn() when not restricted', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['mock'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('fn'),
    )
    expect(reports.length).toBe(0)
  })

  test('does not report jest.spyOn() when not restricted', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['mock'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('spyOn'),
    )
    expect(reports.length).toBe(0)
  })

  test('does not report jest.useRealTimers() when not restricted', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['mock'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('useRealTimers'),
    )
    expect(reports.length).toBe(0)
  })

  // === Edge cases ===
  test('does not report null node', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['mock'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(null)
    expect(reports.length).toBe(0)
  })

  test('does not report undefined node', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['mock'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(undefined)
    expect(reports.length).toBe(0)
  })

  test('does not report non-object node', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['mock'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!('string')
    expect(reports.length).toBe(0)
  })

  test('does not report node without type', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['mock'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!({
      value: 42,
    })
    expect(reports.length).toBe(0)
  })

  test('does not report non-CallExpression type', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['mock'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!({
      type: 'Identifier',
      name: 'jest',
    })
    expect(reports.length).toBe(0)
  })

  test('does not report when callee is not MemberExpression', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['mock'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'jest' },
      arguments: [],
    })
    expect(reports.length).toBe(0)
  })

  test('does not report when object is not Identifier', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['mock'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'CallExpression' },
        property: { type: 'Identifier', name: 'mock' },
      },
      arguments: [],
    })
    expect(reports.length).toBe(0)
  })

  test('does not report computed property access jest["mock"]', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['mock'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'jest' },
        property: { type: 'Literal', value: 'mock' },
        computed: true,
      },
      arguments: [],
    })
    expect(reports.length).toBe(0)
  })

  // === Message format ===
  test('message contains method name', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['mock'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('mock', [{ type: 'Literal', value: './a' }]),
    )
    expect(reports[0].message).toBe(
      "Use of restricted jest method 'mock' is not allowed.",
    )
  })

  test('message contains spyOn for jest.spyOn', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['spyOn'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('spyOn'),
    )
    expect(reports[0].message).toBe(
      "Use of restricted jest method 'spyOn' is not allowed.",
    )
  })

  test('message contains useFakeTimers', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['useFakeTimers'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('useFakeTimers'),
    )
    expect(reports[0].message).toBe(
      "Use of restricted jest method 'useFakeTimers' is not allowed.",
    )
  })

  // === Location reporting ===
  test('reports location from AST node', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['mock'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('mock', [], 5, 10),
    )
    expect(reports[0].loc).toEqual({
      start: { line: 5, column: 10 },
      end: { line: 5, column: 30 },
    })
  })

  test('reports location at line 1 column 0 by default', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['mock'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('mock'),
    )
    expect(reports[0].loc).toEqual({
      start: { line: 1, column: 0 },
      end: { line: 1, column: 20 },
    })
  })

  // === Various file paths ===
  test('works in .spec.ts file', () => {
    const { context, reports } = createMockContext(
      { restrictedMethods: ['mock'] },
      '/src/file.spec.ts',
    )
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('mock', [{ type: 'Literal', value: './a' }]),
    )
    expect(reports.length).toBe(1)
  })

  test('works in .test.ts file', () => {
    const { context, reports } = createMockContext(
      { restrictedMethods: ['fn'] },
      '/src/file.test.ts',
    )
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('fn'),
    )
    expect(reports.length).toBe(1)
  })

  test('works in .ts file', () => {
    const { context, reports } = createMockContext(
      { restrictedMethods: ['spyOn'] },
      '/src/file.ts',
    )
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('spyOn'),
    )
    expect(reports.length).toBe(1)
  })

  // === Multiple calls in sequence ===
  test('reports multiple restricted calls independently', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['mock', 'fn'],
    })
    const visitor = noRestrictedJestMethodsRule.create(context)
    visitor.CallExpression!(
      createJestMethodCall('mock', [{ type: 'Literal', value: './a' }]),
    )
    visitor.CallExpression!(createJestMethodCall('fn'))
    expect(reports.length).toBe(2)
  })

  test('reports only restricted calls among mixed calls', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['mock'],
    })
    const visitor = noRestrictedJestMethodsRule.create(context)
    visitor.CallExpression!(
      createJestMethodCall('mock', [{ type: 'Literal', value: './a' }]),
    )
    visitor.CallExpression!(createJestMethodCall('fn'))
    visitor.CallExpression!(
      createJestMethodCall('mock', [{ type: 'Literal', value: './b' }]),
    )
    expect(reports.length).toBe(2)
  })

  // === Rule meta ===
  test('rule has correct meta properties', () => {
    expect(noRestrictedJestMethodsRule.meta.type).toBe('suggestion')
    expect(noRestrictedJestMethodsRule.meta.severity).toBe('warn')
    expect(
      noRestrictedJestMethodsRule.meta.docs.category,
    ).toBe('testing')
    expect(
      noRestrictedJestMethodsRule.meta.docs.description,
    ).toBeTypeOf('string')
    expect(noRestrictedJestMethodsRule.meta.docs.recommended).toBe(false)
  })

  test('rule has schema defined', () => {
    expect(noRestrictedJestMethodsRule.meta.schema).toBeDefined()
    expect(
      noRestrictedJestMethodsRule.meta.schema,
    ).toBeInstanceOf(Array)
  })

  // === Additional restricted method names ===
  test('reports jest.unmock() when restricted', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['unmock'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('unmock', [{ type: 'Literal', value: './a' }]),
    )
    expect(reports.length).toBe(1)
  })

  test('reports jest.deepUnmock() when restricted', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['deepUnmock'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('deepUnmock'),
    )
    expect(reports.length).toBe(1)
  })

  test('reports jest.doMock() when restricted', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['doMock'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('doMock'),
    )
    expect(reports.length).toBe(1)
  })

  test('reports jest.dontMock() when restricted', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['dontMock'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('dontMock'),
    )
    expect(reports.length).toBe(1)
  })

  test('reports jest.setMock() when restricted', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['setMock'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('setMock'),
    )
    expect(reports.length).toBe(1)
  })

  test('reports jest.addMatchers() when restricted', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['addMatchers'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('addMatchers'),
    )
    expect(reports.length).toBe(1)
  })

  test('reports jest.runAllTicks() when restricted', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['runAllTicks'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('runAllTicks'),
    )
    expect(reports.length).toBe(1)
  })

  test('reports jest.runAllTimers() when restricted', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['runAllTimers'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('runAllTimers'),
    )
    expect(reports.length).toBe(1)
  })

  test('reports jest.runOnlyPendingTimers() when restricted', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['runOnlyPendingTimers'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('runOnlyPendingTimers'),
    )
    expect(reports.length).toBe(1)
  })

  test('reports jest.runAllTimersAsync() when restricted', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['runAllTimersAsync'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('runAllTimersAsync'),
    )
    expect(reports.length).toBe(1)
  })

  test('reports jest.now() when restricted', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['now'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('now'),
    )
    expect(reports.length).toBe(1)
  })

  test('reports jest.getRealSystemTime() when restricted', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['getRealSystemTime'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('getRealSystemTime'),
    )
    expect(reports.length).toBe(1)
  })

  test('reports jest.addMatchers() when restricted', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['addMatchers'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('addMatchers'),
    )
    expect(reports.length).toBe(1)
  })

  test('reports jest.replaceProperty() when restricted', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['replaceProperty'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('replaceProperty'),
    )
    expect(reports.length).toBe(1)
  })

  test('reports jest.isolateModules() when restricted', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['isolateModules'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('isolateModules'),
    )
    expect(reports.length).toBe(1)
  })

  test('reports jest.isolateModulesAsync() when restricted', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['isolateModulesAsync'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('isolateModulesAsync'),
    )
    expect(reports.length).toBe(1)
  })

  test('reports jest.retryTimes() when restricted', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['retryTimes'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('retryTimes'),
    )
    expect(reports.length).toBe(1)
  })

  test('reports jest.setTimeout() with custom threshold', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['setTimeout'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('setTimeout', [
        { type: 'Literal', value: 10000 },
      ]),
    )
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('setTimeout')
  })

  test('reports with correct message format for multi-word method', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['useFakeTimers'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('useFakeTimers'),
    )
    expect(reports[0].message).toBe(
      "Use of restricted jest method 'useFakeTimers' is not allowed.",
    )
  })

  test('state isolation between create calls', () => {
    const { context: ctx1, reports: r1 } = createMockContext({
      restrictedMethods: ['mock'],
    })
    const { context: ctx2, reports: r2 } = createMockContext({
      restrictedMethods: ['fn'],
    })

    noRestrictedJestMethodsRule.create(ctx1).CallExpression!(
      createJestMethodCall('mock', [{ type: 'Literal', value: './a' }]),
    )
    noRestrictedJestMethodsRule.create(ctx2).CallExpression!(
      createJestMethodCall('mock', [{ type: 'Literal', value: './a' }]),
    )

    expect(r1.length).toBe(1)
    expect(r2.length).toBe(0)
  })

  test('state isolation - fn restricted only in second context', () => {
    const { context: ctx1, reports: r1 } = createMockContext({
      restrictedMethods: ['mock'],
    })
    const { context: ctx2, reports: r2 } = createMockContext({
      restrictedMethods: ['fn'],
    })

    noRestrictedJestMethodsRule.create(ctx1).CallExpression!(
      createJestMethodCall('fn'),
    )
    noRestrictedJestMethodsRule.create(ctx2).CallExpression!(
      createJestMethodCall('fn'),
    )

    expect(r1.length).toBe(0)
    expect(r2.length).toBe(1)
  })

  test('handles number node', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['mock'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(42)
    expect(reports.length).toBe(0)
  })

  test('handles boolean node', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['mock'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(true)
    expect(reports.length).toBe(0)
  })

  test('handles empty object node', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['mock'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!({})
    expect(reports.length).toBe(0)
  })

  test('does not report jest.unstable_mockModule when only mock restricted', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['mock'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createNonJestCall('jest', 'unstable_mockModule'),
    )
    expect(reports.length).toBe(0)
  })

  test('reports three restricted calls in sequence', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['mock', 'fn', 'spyOn'],
    })
    const visitor = noRestrictedJestMethodsRule.create(context)
    visitor.CallExpression!(
      createJestMethodCall('mock', [{ type: 'Literal', value: './a' }]),
    )
    visitor.CallExpression!(createJestMethodCall('fn'))
    visitor.CallExpression!(createJestMethodCall('spyOn'))
    expect(reports.length).toBe(3)
  })

  test('mixed restricted and unrestricted calls', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['mock'],
    })
    const visitor = noRestrictedJestMethodsRule.create(context)
    visitor.CallExpression!(createJestMethodCall('fn'))
    visitor.CallExpression!(
      createJestMethodCall('mock', [{ type: 'Literal', value: './a' }]),
    )
    visitor.CallExpression!(createJestMethodCall('spyOn'))
    visitor.CallExpression!(
      createJestMethodCall('mock', [{ type: 'Literal', value: './b' }]),
    )
    expect(reports.length).toBe(2)
    expect(reports[0].message).toContain('mock')
    expect(reports[1].message).toContain('mock')
  })

  // === Case sensitivity ===
  test('does not report when object name is Jest (case sensitive)', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['mock'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createNonJestCall('Jest', 'mock'),
    )
    expect(reports.length).toBe(0)
  })

  test('does not report when object name is JEST (all caps)', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['mock'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createNonJestCall('JEST', 'mock'),
    )
    expect(reports.length).toBe(0)
  })

  // === Property edge cases ===
  test('does not report when callee property is missing', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['mock'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'jest' },
        computed: false,
      },
      arguments: [],
    })
    expect(reports.length).toBe(0)
  })

  test('does not report when callee property type is not Identifier', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['mock'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'jest' },
        property: { type: 'CallExpression' },
        computed: false,
      },
      arguments: [],
    })
    expect(reports.length).toBe(0)
  })

  test('does not report when object name is empty string', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['mock'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createNonJestCall('', 'mock'),
    )
    expect(reports.length).toBe(0)
  })

  // === Additional method names ===
  test('reports jest.genMockFromModule() when restricted', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['genMockFromModule'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('genMockFromModule', [
        { type: 'Literal', value: './module' },
      ]),
    )
    expect(reports.length).toBe(1)
  })

  test('reports jest.useRealTimers() when restricted', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['useRealTimers'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('useRealTimers'),
    )
    expect(reports.length).toBe(1)
  })

  test('reports jest.clearAllTimers() when restricted', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['clearAllTimers'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('clearAllTimers'),
    )
    expect(reports.length).toBe(1)
  })

  test('reports jest.advanceTimersByTimeAsync() when restricted', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['advanceTimersByTimeAsync'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('advanceTimersByTimeAsync'),
    )
    expect(reports.length).toBe(1)
  })

  // === Additional message format tests ===
  test('message contains fn for vi.fn()', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['fn'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('fn'),
    )
    expect(reports[0].message).toBe(
      "Use of restricted jest method 'fn' is not allowed.",
    )
  })

  test('message contains advanceTimersByTime for jest.advanceTimersByTime()', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['advanceTimersByTime'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('advanceTimersByTime', [
        { type: 'Literal', value: 1000 },
      ]),
    )
    expect(reports[0].message).toBe(
      "Use of restricted jest method 'advanceTimersByTime' is not allowed.",
    )
  })

  // === Location at custom coordinates ===
  test('reports location at line 10 column 5', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['mock'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('mock', [], 10, 5),
    )
    expect(reports[0].loc).toEqual({
      start: { line: 10, column: 5 },
      end: { line: 10, column: 25 },
    })
  })

  // === Meta completeness ===
  test('meta docs url is a string', () => {
    expect(
      noRestrictedJestMethodsRule.meta.docs.url,
    ).toBeTypeOf('string')
    expect(
      noRestrictedJestMethodsRule.meta.docs.url!.length,
    ).toBeGreaterThan(0)
  })

  test('meta docs description is non-empty', () => {
    const desc = noRestrictedJestMethodsRule.meta.docs.description
    expect(desc).toBeTypeOf('string')
    expect(desc!.length).toBeGreaterThan(0)
  })

  test('should not report when object name is not jest', () => {
    const { context, reports } = createMockContext({ restrictedMethods: ['fn'] })
    const visitor = noRestrictedJestMethodsRule.create(context)

    visitor.CallExpression({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'vitest' },
        property: { type: 'Identifier', name: 'fn' },
      },
      arguments: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
    })

    expect(reports.length).toBe(0)
  })

  test('should not report when callee is not member expression', () => {
    const { context, reports } = createMockContext({ restrictedMethods: ['fn'] })
    const visitor = noRestrictedJestMethodsRule.create(context)

    visitor.CallExpression({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'fn' },
      arguments: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
    })

    expect(reports.length).toBe(0)
  })

  // === Additional unique method coverage ===
  test('reports jest.requireActual() when restricted', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['requireActual'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('requireActual', [
        { type: 'Literal', value: './module' },
      ]),
    )
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('requireActual')
  })

  test('reports jest.requireMock() when restricted', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['requireMock'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('requireMock', [
        { type: 'Literal', value: './module' },
      ]),
    )
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('requireMock')
  })

  test('reports jest.advanceTimersToNextTimer() when restricted', () => {
    const { context, reports } = createMockContext({
      restrictedMethods: ['advanceTimersToNextTimer'],
    })
    noRestrictedJestMethodsRule.create(context).CallExpression!(
      createJestMethodCall('advanceTimersToNextTimer', [
        { type: 'Literal', value: 500 },
      ]),
    )
    expect(reports.length).toBe(1)
    expect(reports[0].message).toBe(
      "Use of restricted jest method 'advanceTimersToNextTimer' is not allowed.",
    )
  })
})
