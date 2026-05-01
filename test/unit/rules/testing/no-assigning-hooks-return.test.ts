import { describe, test, expect, vi } from 'vitest'
import { noAssigningHooksReturnRule } from '../../../../src/rules/testing/no-assigning-hooks-return.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.test.ts',
  source = 'const result = beforeEach(() => {});',
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []
  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => { reports.push({ message: descriptor.message, loc: descriptor.loc }) },
    getFilePath: () => filePath,
    getSource: () => source,
    getAST: () => null,
    getTokens: () => [],
    getComments: () => [],
    config: { options: [options] },
    logger: { debug: vi.fn(), error: vi.fn(), info: vi.fn(), warn: vi.fn() },
    settings: {},
    ruleId: 'no-assigning-hooks-return',
    workspaceRoot: '/src',
  }
  return { context, reports }
}

function createHookCall(hookName: string, callback?: unknown): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: hookName },
    arguments: [callback ?? { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }],
  }
}

function createVariableDeclarator(name: string, init: unknown, loc?: { start: { line: number; column: number }; end: { line: number; column: number } }): unknown {
  return {
    type: 'VariableDeclarator',
    id: { type: 'Identifier', name },
    init,
    loc: loc ?? { start: { line: 1, column: 6 }, end: { line: 1, column: 35 } },
  }
}

describe('no-assigning-hooks-return', () => {
  const rule = noAssigningHooksReturnRule

  test('rule has correct meta', () => {
    expect(rule.meta.docs.category).toBe('testing')
    expect(rule.meta.docs.description).toContain('hook')
    expect(rule.meta.severity).toBe('warn')
    expect(rule.meta.type).toBe('suggestion')
  })

  test('rule has create method', () => {
    expect(typeof rule.create).toBe('function')
  })

  // SECTION: Reports hook assignments
  test('reports const result = beforeEach(() => {})', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('result', createHookCall('beforeEach')))
    expect(reports.length).toBe(1)
  })

  test('reports const r = afterEach(() => {})', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', createHookCall('afterEach')))
    expect(reports.length).toBe(1)
  })

  test('reports const x = beforeAll(() => {})', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('x', createHookCall('beforeAll')))
    expect(reports.length).toBe(1)
  })

  test('reports const y = afterAll(() => {})', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('y', createHookCall('afterAll')))
    expect(reports.length).toBe(1)
  })

  test('report message contains hook name for beforeEach', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', createHookCall('beforeEach')))
    expect(reports[0].message).toContain('beforeEach')
  })

  test('report message contains hook name for afterEach', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', createHookCall('afterEach')))
    expect(reports[0].message).toContain('afterEach')
  })

  test('report message contains hook name for beforeAll', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', createHookCall('beforeAll')))
    expect(reports[0].message).toContain('beforeAll')
  })

  test('report message contains hook name for afterAll', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', createHookCall('afterAll')))
    expect(reports[0].message).toContain('afterAll')
  })

  test('report message mentions not assigning', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', createHookCall('beforeEach')))
    expect(reports[0].message).toContain('Do not assign')
  })

  // SECTION: Does NOT report non-hook assignments
  test('does not report const result = getData()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('result', {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'getData' },
      arguments: [],
    }))
    expect(reports.length).toBe(0)
  })

  test('does not report const result = setup()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('result', {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'setup' },
      arguments: [],
    }))
    expect(reports.length).toBe(0)
  })

  test('does not report const result = test(() => {})', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('result', createHookCall('test')))
    expect(reports.length).toBe(0)
  })

  test('does not report const result = describe(() => {})', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('result', createHookCall('describe')))
    expect(reports.length).toBe(0)
  })

  test('does not report const result = it(() => {})', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('result', createHookCall('it')))
    expect(reports.length).toBe(0)
  })

  test('does not report const result = expect(x)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('result', {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'expect' },
      arguments: [{ type: 'Identifier', name: 'x' }],
    }))
    expect(reports.length).toBe(0)
  })

  test('does not report const result = fn()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('result', {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'fn' },
      arguments: [],
    }))
    expect(reports.length).toBe(0)
  })

  test('does not report const result = cleanup()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('result', {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'cleanup' },
      arguments: [],
    }))
    expect(reports.length).toBe(0)
  })

  test('does not report const result = 42', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('result', { type: 'Literal', value: 42 }))
    expect(reports.length).toBe(0)
  })

  test('does not report const result = "hello"', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('result', { type: 'Literal', value: 'hello' }))
    expect(reports.length).toBe(0)
  })

  // SECTION: Edge cases
  test('handles null node', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    expect(() => visitor.VariableDeclarator!(null)).not.toThrow()
    expect(reports.length).toBe(0)
  })

  test('handles undefined node', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    expect(() => visitor.VariableDeclarator!(undefined)).not.toThrow()
    expect(reports.length).toBe(0)
  })

  test('handles empty object', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!({})
    expect(reports.length).toBe(0)
  })

  test('handles VariableDeclarator without init', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!({
      type: 'VariableDeclarator',
      id: { type: 'Identifier', name: 'result' },
    })
    expect(reports.length).toBe(0)
  })

  test('handles VariableDeclarator with null init', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!({
      type: 'VariableDeclarator',
      id: { type: 'Identifier', name: 'result' },
      init: null,
    })
    expect(reports.length).toBe(0)
  })

  test('handles VariableDeclarator with undefined init', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!({
      type: 'VariableDeclarator',
      id: { type: 'Identifier', name: 'result' },
      init: undefined,
    })
    expect(reports.length).toBe(0)
  })

  test('handles number node', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(42 as unknown)
    expect(reports.length).toBe(0)
  })

  test('handles string node', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!('const x = beforeEach' as unknown)
    expect(reports.length).toBe(0)
  })

  test('does not report when callee is MemberExpression', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'beforeEach' },
      },
      arguments: [],
    }))
    expect(reports.length).toBe(0)
  })

  test('does not report when callee type is not Identifier', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', {
      type: 'CallExpression',
      callee: { type: 'Literal', value: 'beforeEach' },
      arguments: [],
    }))
    expect(reports.length).toBe(0)
  })

  // SECTION: Location reporting
  test('reports correct location', () => {
    const loc = { start: { line: 5, column: 6 }, end: { line: 5, column: 35 } }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('result', createHookCall('beforeEach'), loc))
    expect(reports[0].loc).toEqual(loc)
  })

  test('reports correct location at different line', () => {
    const loc = { start: { line: 20, column: 2 }, end: { line: 20, column: 30 } }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', createHookCall('afterEach'), loc))
    expect(reports[0].loc?.start.line).toBe(20)
    expect(reports[0].loc?.start.column).toBe(2)
  })

  test('reports correct location for beforeAll', () => {
    const loc = { start: { line: 100, column: 0 }, end: { line: 100, column: 35 } }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('x', createHookCall('beforeAll'), loc))
    expect(reports[0].loc?.start.line).toBe(100)
  })

  // SECTION: Multiple calls
  test('reports multiple violations independently', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r1', createHookCall('beforeEach'), { start: { line: 1, column: 6 }, end: { line: 1, column: 35 } }))
    visitor.VariableDeclarator!(createVariableDeclarator('r2', createHookCall('afterAll'), { start: { line: 2, column: 6 }, end: { line: 2, column: 30 } }))
    visitor.VariableDeclarator!(createVariableDeclarator('r3', { type: 'Literal', value: 42 }))
    expect(reports.length).toBe(2)
  })

  test('reports mixed valid and invalid assignments', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('data', { type: 'Literal', value: 42 }))
    visitor.VariableDeclarator!(createVariableDeclarator('hook', createHookCall('beforeEach')))
    visitor.VariableDeclarator!(createVariableDeclarator('value', { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }))
    visitor.VariableDeclarator!(createVariableDeclarator('teardown', createHookCall('afterEach')))
    expect(reports.length).toBe(2)
  })

  test('reports all four hook types together', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r1', createHookCall('beforeEach')))
    visitor.VariableDeclarator!(createVariableDeclarator('r2', createHookCall('afterEach')))
    visitor.VariableDeclarator!(createVariableDeclarator('r3', createHookCall('beforeAll')))
    visitor.VariableDeclarator!(createVariableDeclarator('r4', createHookCall('afterAll')))
    expect(reports.length).toBe(4)
  })

  // SECTION: File path variations
  test('works with .spec.ts files', () => {
    const { context, reports } = createMockContext({}, '/src/file.spec.ts')
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', createHookCall('beforeEach')))
    expect(reports.length).toBe(1)
  })

  test('works with .test.js files', () => {
    const { context, reports } = createMockContext({}, '/src/file.test.js')
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', createHookCall('beforeEach')))
    expect(reports.length).toBe(1)
  })

  test('works with .spec.tsx files', () => {
    const { context, reports } = createMockContext({}, '/src/component.spec.tsx')
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', createHookCall('afterEach')))
    expect(reports.length).toBe(1)
  })

  test('works with nested test file paths', () => {
    const { context, reports } = createMockContext({}, '/src/features/auth/login.test.ts')
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', createHookCall('beforeAll')))
    expect(reports.length).toBe(1)
  })

  // SECTION: Visitor isolation
  test('separate visitors have separate reports', () => {
    const { context: ctx1, reports: rep1 } = createMockContext()
    const { context: ctx2, reports: rep2 } = createMockContext()
    const visitor1 = rule.create(ctx1)
    const visitor2 = rule.create(ctx2)
    visitor1.VariableDeclarator!(createVariableDeclarator('r', createHookCall('beforeEach')))
    visitor2.VariableDeclarator!(createVariableDeclarator('r', { type: 'Literal', value: 5 }))
    expect(rep1.length).toBe(1)
    expect(rep2.length).toBe(0)
  })

  test('create returns new visitor each call', () => {
    const { context } = createMockContext()
    const v1 = rule.create(context)
    const v2 = rule.create(context)
    expect(v1).not.toBe(v2)
  })

  // SECTION: Visitor handler
  test('visitor has VariableDeclarator handler', () => {
    const { context } = createMockContext()
    const visitor = rule.create(context)
    expect(typeof visitor.VariableDeclarator).toBe('function')
  })

  // SECTION: Hook with various callback types
  test('reports const r = beforeEach(function callback() {})', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'beforeEach' },
      arguments: [{
        type: 'FunctionExpression',
        id: { type: 'Identifier', name: 'callback' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }],
    }))
    expect(reports.length).toBe(1)
  })

  test('reports const r = beforeEach(async () => {})', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'beforeEach' },
      arguments: [{
        type: 'ArrowFunctionExpression',
        async: true,
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }],
    }))
    expect(reports.length).toBe(1)
  })

  test('reports const r = afterEach(() => {}, 10000)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'afterEach' },
      arguments: [
        { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } },
        { type: 'Literal', value: 10000 },
      ],
    }))
    expect(reports.length).toBe(1)
  })

  test('reports const r = beforeAll(() => { return Promise.resolve() })', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', createHookCall('beforeAll', {
      type: 'ArrowFunctionExpression',
      params: [],
      body: {
        type: 'BlockStatement',
        body: [{
          type: 'ReturnStatement',
          argument: {
            type: 'CallExpression',
            callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'Promise' }, property: { type: 'Identifier', name: 'resolve' } },
            arguments: [],
          },
        }],
      },
    })))
    expect(reports.length).toBe(1)
  })

  // SECTION: Does not report similar-sounding names
  test('does not report const r = beforeEachHook()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'beforeEachHook' },
      arguments: [],
    }))
    expect(reports.length).toBe(0)
  })

  test('does not report const r = setupBeforeEach()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'setupBeforeEach' },
      arguments: [],
    }))
    expect(reports.length).toBe(0)
  })

  test('does not report const r = myAfterAll()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'myAfterAll' },
      arguments: [],
    }))
    expect(reports.length).toBe(0)
  })

  test('does not report const r = _beforeEach()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: '_beforeEach' },
      arguments: [],
    }))
    expect(reports.length).toBe(0)
  })

  test('does not report const r = BeforeEach()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'BeforeEach' },
      arguments: [],
    }))
    expect(reports.length).toBe(0)
  })

  test('does not report const r = BEFORE_ALL()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'BEFORE_ALL' },
      arguments: [],
    }))
    expect(reports.length).toBe(0)
  })

  // SECTION: Meta and export
  test('meta docs have correct URL format', () => {
    const url = rule.meta.docs.url
    expect(url).toMatch(/^https?:\/\/.+/)
    expect(url).toContain('no-assigning-hooks-return')
  })

  test('meta fixable is undefined', () => {
    expect(rule.meta.fixable).toBeUndefined()
  })

  test('default export exists and has create', () => {
    expect(rule).toBeDefined()
    expect(typeof rule.create).toBe('function')
  })

  // SECTION: Destructuring patterns
  test('reports with ObjectPattern id', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!({
      type: 'VariableDeclarator',
      id: { type: 'ObjectPattern', properties: [] },
      init: createHookCall('beforeEach'),
    })
    expect(reports.length).toBe(1)
  })

  test('reports with ArrayPattern id', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!({
      type: 'VariableDeclarator',
      id: { type: 'ArrayPattern', elements: [] },
      init: createHookCall('afterEach'),
    })
    expect(reports.length).toBe(1)
  })

  // SECTION: Various variable names
  test('reports with variable name matching hook name', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('beforeEach', createHookCall('beforeEach')))
    expect(reports.length).toBe(1)
  })

  test('reports with short variable name', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('x', createHookCall('afterAll')))
    expect(reports.length).toBe(1)
  })

  test('reports with descriptive variable name', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('hookResult', createHookCall('beforeAll')))
    expect(reports.length).toBe(1)
  })

  // SECTION: Does not report for non-CallExpression init
  test('does not report for ObjectExpression init', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', { type: 'ObjectExpression', properties: [] }))
    expect(reports.length).toBe(0)
  })

  test('does not report for ArrayExpression init', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', { type: 'ArrayExpression', elements: [] }))
    expect(reports.length).toBe(0)
  })

  test('does not report for ArrowFunctionExpression init', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', {
      type: 'ArrowFunctionExpression',
      params: [],
      body: { type: 'BlockStatement', body: [] },
    }))
    expect(reports.length).toBe(0)
  })

  test('does not report for BinaryExpression init', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', {
      type: 'BinaryExpression',
      operator: '+',
      left: { type: 'Identifier', name: 'a' },
      right: { type: 'Identifier', name: 'b' },
    }))
    expect(reports.length).toBe(0)
  })

  test('does not report for UnaryExpression init', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', {
      type: 'UnaryExpression',
      operator: '-',
      argument: { type: 'Literal', value: 1 },
    }))
    expect(reports.length).toBe(0)
  })

  test('does not report for ConditionalExpression init', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', {
      type: 'ConditionalExpression',
      test: { type: 'Literal', value: true },
      consequent: { type: 'Literal', value: 1 },
      alternate: { type: 'Literal', value: 2 },
    }))
    expect(reports.length).toBe(0)
  })

  // SECTION: Case sensitivity
  test('does not report for case-variant BeforeEach', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'BeforeEach' },
      arguments: [],
    }))
    expect(reports.length).toBe(0)
  })

  test('does not report for case-variant AFTEREACH', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'AFTEREACH' },
      arguments: [],
    }))
    expect(reports.length).toBe(0)
  })

  // SECTION: Message content verification
  test('report message mentions "return value"', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', createHookCall('beforeEach')))
    expect(reports[0].message).toContain('return value')
  })

  test('report message mentions "useful values"', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', createHookCall('afterAll')))
    expect(reports[0].message).toContain('useful values')
  })

  // SECTION: Additional coverage
  test('does not report for TemplateLiteral init', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', {
      type: 'TemplateLiteral',
      quasis: [],
      expressions: [],
    }))
    expect(reports.length).toBe(0)
  })

  test('does not report for TaggedTemplateExpression init', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', {
      type: 'TaggedTemplateExpression',
      tag: { type: 'Identifier', name: 'tag' },
      quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] },
    }))
    expect(reports.length).toBe(0)
  })

  test('reports with variable name "result"', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('result', createHookCall('beforeEach')))
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('beforeEach')
  })

  test('does not report for NewExpression init', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', {
      type: 'NewExpression',
      callee: { type: 'Identifier', name: 'Map' },
      arguments: [],
    }))
    expect(reports.length).toBe(0)
  })

  test('does not report for AwaitExpression init', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', {
      type: 'AwaitExpression',
      argument: { type: 'Literal', value: 42 },
    }))
    expect(reports.length).toBe(0)
  })

  test('does not report for YieldExpression init', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', {
      type: 'YieldExpression',
      argument: { type: 'Literal', value: 42 },
    }))
    expect(reports.length).toBe(0)
  })

  test('reports beforeEach with no arguments', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'beforeEach' },
      arguments: [],
    }))
    expect(reports.length).toBe(1)
  })

  test('reports afterEach with empty callback', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'afterEach' },
      arguments: [{ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }],
    }))
    expect(reports.length).toBe(1)
  })

  test('reports beforeAll with done parameter', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'beforeAll' },
      arguments: [{
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'done' }],
        body: { type: 'BlockStatement', body: [] },
      }],
    }))
    expect(reports.length).toBe(1)
  })

  test('does not report when init type is Identifier', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', { type: 'Identifier', name: 'beforeEach' }))
    expect(reports.length).toBe(0)
  })

  test('reports afterAll at specific line and column', () => {
    const loc = { start: { line: 15, column: 4 }, end: { line: 15, column: 32 } }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', createHookCall('afterAll'), loc))
    expect(reports[0].loc?.start.line).toBe(15)
    expect(reports[0].loc?.start.column).toBe(4)
  })

  test('reports beforeEach with callback having multiple parameters', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'beforeEach' },
      arguments: [{
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }],
        body: { type: 'BlockStatement', body: [] },
      }],
    }))
    expect(reports.length).toBe(1)
  })

  test('accumulates reports from same visitor correctly', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r1', createHookCall('beforeEach')))
    visitor.VariableDeclarator!(createVariableDeclarator('r2', { type: 'Literal', value: 42 }))
    visitor.VariableDeclarator!(createVariableDeclarator('r3', createHookCall('afterAll')))
    visitor.VariableDeclarator!(createVariableDeclarator('r4', { type: 'Literal', value: 'test' }))
    visitor.VariableDeclarator!(createVariableDeclarator('r5', createHookCall('beforeAll')))
    expect(reports.length).toBe(3)
  })

  test('does not report for MemberExpression init (not CallExpression)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'obj' },
      property: { type: 'Identifier', name: 'prop' },
    }))
    expect(reports.length).toBe(0)
  })

  test('reports with destructured id but still reports', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!({
      type: 'VariableDeclarator',
      id: {
        type: 'ObjectPattern',
        properties: [{ type: 'Property', key: { type: 'Identifier', name: 'a' }, value: { type: 'Identifier', name: 'a' } }],
      },
      init: createHookCall('beforeEach'),
    })
    expect(reports.length).toBe(1)
  })

  test('does not report for SpreadElement init', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', {
      type: 'SpreadElement',
      argument: { type: 'Identifier', name: 'arr' },
    }))
    expect(reports.length).toBe(0)
  })

  test('does not report for SequenceExpression init', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', {
      type: 'SequenceExpression',
      expressions: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }],
    }))
    expect(reports.length).toBe(0)
  })

  test('does not report when callee has numeric name', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!({
      type: 'VariableDeclarator',
      id: { type: 'Identifier', name: 'r' },
      init: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 42 as unknown as string },
        arguments: [],
      },
    })
    expect(reports.length).toBe(0)
  })

  // SECTION: Additional coverage - batch 2
  test('does not report for LogicalExpression init', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', {
      type: 'LogicalExpression',
      operator: '&&',
      left: { type: 'Identifier', name: 'a' },
      right: { type: 'Identifier', name: 'b' },
    }))
    expect(reports.length).toBe(0)
  })

  test('reports beforeEach followed by valid then another beforeEach', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r1', createHookCall('beforeEach')))
    visitor.VariableDeclarator!(createVariableDeclarator('r2', { type: 'Literal', value: 42 }))
    visitor.VariableDeclarator!(createVariableDeclarator('r3', createHookCall('beforeEach')))
    expect(reports.length).toBe(2)
  })

  test('does not report when init is null literal', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', { type: 'Literal', value: null }))
    expect(reports.length).toBe(0)
  })

  test('report message for afterAll includes "afterAll"', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', createHookCall('afterAll')))
    expect(reports[0].message).toContain('afterAll')
    expect(reports[0].message).toContain('Do not assign')
  })

  test('does not report for UpdateExpression init', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', {
      type: 'UpdateExpression',
      operator: '++',
      argument: { type: 'Identifier', name: 'i' },
      prefix: false,
    }))
    expect(reports.length).toBe(0)
  })
})
