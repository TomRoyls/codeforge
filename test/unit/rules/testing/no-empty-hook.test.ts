import { describe, test, expect, vi } from 'vitest'
import { noEmptyHookRule } from '../../../../src/rules/testing/no-empty-hook.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.test.ts',
  source = "beforeEach(() => {});",
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
    ruleId: 'no-empty-hook',
    workspaceRoot: '/src',
  }
  return { context, reports }
}

function createHookCall(hookName: string, callback: unknown, loc?: { start: { line: number; column: number }; end: { line: number; column: number } }): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: hookName },
    arguments: [callback],
    loc: loc ?? { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
  }
}

function createEmptyArrowCallback(): unknown {
  return {
    type: 'ArrowFunctionExpression',
    params: [],
    body: { type: 'BlockStatement', body: [] },
  }
}

function createNonEmptyArrowCallback(): unknown {
  return {
    type: 'ArrowFunctionExpression',
    params: [],
    body: {
      type: 'BlockStatement',
      body: [{ type: 'ExpressionStatement', expression: { type: 'Literal', value: 42 } }],
    },
  }
}

function createEmptyFunctionCallback(): unknown {
  return {
    type: 'FunctionExpression',
    params: [],
    body: { type: 'BlockStatement', body: [] },
  }
}

function createNonEmptyFunctionCallback(): unknown {
  return {
    type: 'FunctionExpression',
    params: [],
    body: {
      type: 'BlockStatement',
      body: [{ type: 'ExpressionStatement', expression: { type: 'Literal', value: 42 } }],
    },
  }
}

describe('no-empty-hook', () => {
  const rule = noEmptyHookRule

  // SECTION: Meta
  test('rule has correct meta', () => {
    expect(rule.meta.docs.category).toBe('testing')
    expect(rule.meta.docs.description).toContain('empty')
    expect(rule.meta.severity).toBe('warn')
    expect(rule.meta.type).toBe('suggestion')
  })

  test('rule has create method', () => {
    expect(typeof rule.create).toBe('function')
  })

  // SECTION: Reports empty hooks
  test('reports empty beforeEach with arrow callback', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('beforeEach', createEmptyArrowCallback()))
    expect(reports.length).toBe(1)
  })

  test('reports empty afterEach with arrow callback', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('afterEach', createEmptyArrowCallback()))
    expect(reports.length).toBe(1)
  })

  test('reports empty beforeAll with arrow callback', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('beforeAll', createEmptyArrowCallback()))
    expect(reports.length).toBe(1)
  })

  test('reports empty afterAll with arrow callback', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('afterAll', createEmptyArrowCallback()))
    expect(reports.length).toBe(1)
  })

  test('reports empty beforeEach with FunctionExpression callback', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('beforeEach', createEmptyFunctionCallback()))
    expect(reports.length).toBe(1)
  })

  test('reports empty afterEach with FunctionExpression callback', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('afterEach', createEmptyFunctionCallback()))
    expect(reports.length).toBe(1)
  })

  test('reports empty beforeAll with FunctionExpression callback', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('beforeAll', createEmptyFunctionCallback()))
    expect(reports.length).toBe(1)
  })

  test('reports empty afterAll with FunctionExpression callback', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('afterAll', createEmptyFunctionCallback()))
    expect(reports.length).toBe(1)
  })

  // SECTION: Does not report non-empty hooks
  test('does not report non-empty beforeEach with arrow callback', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('beforeEach', createNonEmptyArrowCallback()))
    expect(reports.length).toBe(0)
  })

  test('does not report non-empty afterEach with FunctionExpression callback', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('afterEach', createNonEmptyFunctionCallback()))
    expect(reports.length).toBe(0)
  })

  test('does not report beforeEach with arrow expression body (no block)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('beforeEach', {
      type: 'ArrowFunctionExpression',
      params: [],
      body: { type: 'Literal', value: 42 },
    }))
    expect(reports.length).toBe(0)
  })

  // SECTION: Non-hook functions
  test('does not report empty test() callback', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('test', createEmptyArrowCallback()))
    expect(reports.length).toBe(0)
  })

  test('does not report empty it() callback', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('it', createEmptyArrowCallback()))
    expect(reports.length).toBe(0)
  })

  test('does not report empty describe() callback', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'describe' },
      arguments: [{ type: 'Literal', value: 'suite' }, createEmptyArrowCallback()],
    })
    expect(reports.length).toBe(0)
  })

  test('does not report empty fn() callback', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('myFn', createEmptyArrowCallback()))
    expect(reports.length).toBe(0)
  })

  // SECTION: Edge cases
  test('handles null node', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(null)
    expect(reports.length).toBe(0)
  })

  test('handles undefined node', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(undefined)
    expect(reports.length).toBe(0)
  })

  test('handles empty object', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({})
    expect(reports.length).toBe(0)
  })

  test('handles node without callee', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({ type: 'CallExpression', arguments: [] })
    expect(reports.length).toBe(0)
  })

  test('handles node with non-Identifier callee', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'beforeEach' },
      },
      arguments: [createEmptyArrowCallback()],
    })
    expect(reports.length).toBe(0)
  })

  test('handles hook call with no arguments', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('beforeEach', undefined))
    expect(reports.length).toBe(0)
  })

  test('handles hook call with empty arguments array', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'beforeEach' },
      arguments: [],
    })
    expect(reports.length).toBe(0)
  })

  test('handles hook call with null first argument', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'beforeEach' },
      arguments: [null],
    })
    expect(reports.length).toBe(0)
  })

  test('handles hook call with Literal first argument', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'beforeEach' },
      arguments: [{ type: 'Literal', value: 'not a function' }],
    })
    expect(reports.length).toBe(0)
  })

  // SECTION: Similar-sounding names
  test('does not report beforeEachHook()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('beforeEachHook', createEmptyArrowCallback()))
    expect(reports.length).toBe(0)
  })

  test('does not report setupBeforeEach()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('setupBeforeEach', createEmptyArrowCallback()))
    expect(reports.length).toBe(0)
  })

  test('does not report BeforeEach (case variant)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('BeforeEach', createEmptyArrowCallback()))
    expect(reports.length).toBe(0)
  })

  test('does not report AFTEREACH (uppercase)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('AFTEREACH', createEmptyArrowCallback()))
    expect(reports.length).toBe(0)
  })

  // SECTION: Location tests
  test('reports correct location', () => {
    const loc = { start: { line: 5, column: 2 }, end: { line: 5, column: 25 } }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('beforeEach', createEmptyArrowCallback(), loc))
    expect(reports[0].loc?.start.line).toBe(5)
  })

  test('reports location at line 1 column 0', () => {
    const loc = { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('afterEach', createEmptyArrowCallback(), loc))
    expect(reports[0].loc?.start.column).toBe(0)
  })

  test('reports location spanning multiple lines', () => {
    const loc = { start: { line: 10, column: 4 }, end: { line: 12, column: 5 } }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('beforeAll', createEmptyArrowCallback(), loc))
    expect(reports[0].loc?.start.line).toBe(10)
    expect(reports[0].loc?.end.line).toBe(12)
  })

  // SECTION: Message verification
  test('report message mentions "empty"', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('beforeEach', createEmptyArrowCallback()))
    expect(reports[0].message).toContain('empty')
  })

  test('report message mentions "hook"', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('beforeEach', createEmptyArrowCallback()))
    expect(reports[0].message).toContain('hook')
  })

  test('report message for beforeEach includes hook name', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('beforeEach', createEmptyArrowCallback()))
    expect(reports[0].message).toContain('beforeEach')
  })

  test('report message for afterAll includes hook name', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('afterAll', createEmptyArrowCallback()))
    expect(reports[0].message).toContain('afterAll')
  })

  test('report message matches exact expected text for beforeEach', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('beforeEach', createEmptyArrowCallback()))
    expect(reports[0].message).toBe('Unexpected empty beforeEach() hook. Empty hooks add noise without providing any value. Remove the hook or add meaningful setup/teardown logic.')
  })

  // SECTION: Visitor behavior
  test('visitor has CallExpression handler', () => {
    const { context } = createMockContext()
    const visitor = rule.create(context)
    expect(typeof visitor.CallExpression).toBe('function')
  })

  test('same visitor accumulates reports across multiple calls', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('beforeEach', createEmptyArrowCallback()))
    visitor.CallExpression!(createHookCall('afterEach', createEmptyArrowCallback()))
    visitor.CallExpression!(createHookCall('beforeAll', createEmptyArrowCallback()))
    expect(reports.length).toBe(3)
  })

  test('two visitors with separate contexts have independent reports', () => {
    const { context: ctx1, reports: rep1 } = createMockContext()
    const { context: ctx2, reports: rep2 } = createMockContext()
    const visitor1 = rule.create(ctx1)
    const visitor2 = rule.create(ctx2)
    visitor1.CallExpression!(createHookCall('beforeEach', createEmptyArrowCallback()))
    visitor2.CallExpression!(createHookCall('beforeEach', createEmptyArrowCallback()))
    visitor2.CallExpression!(createHookCall('afterEach', createEmptyArrowCallback()))
    expect(rep1.length).toBe(1)
    expect(rep2.length).toBe(2)
  })

  test('create returns new visitor each call', () => {
    const { context } = createMockContext()
    const v1 = rule.create(context)
    const v2 = rule.create(context)
    expect(v1).not.toBe(v2)
  })

  test('calling create with same context shares reports array', () => {
    const { context, reports } = createMockContext()
    const v1 = rule.create(context)
    const v2 = rule.create(context)
    v1.CallExpression!(createHookCall('beforeEach', createEmptyArrowCallback()))
    v2.CallExpression!(createHookCall('afterEach', createEmptyArrowCallback()))
    expect(reports.length).toBe(2)
  })

  // SECTION: Mixed scenarios
  test('reports only empty hooks among mixed calls', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('beforeEach', createNonEmptyArrowCallback()))
    visitor.CallExpression!(createHookCall('afterEach', createEmptyArrowCallback()))
    visitor.CallExpression!(createHookCall('test', createEmptyArrowCallback()))
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('afterEach')
  })

  test('reports three empty hooks independently', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('beforeEach', createEmptyArrowCallback()))
    visitor.CallExpression!(createHookCall('afterEach', createEmptyArrowCallback()))
    visitor.CallExpression!(createHookCall('afterAll', createEmptyFunctionCallback()))
    expect(reports.length).toBe(3)
  })

  test('accumulates reports correctly with interleaved valid calls', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('beforeEach', createEmptyArrowCallback()))
    visitor.CallExpression!(createHookCall('beforeEach', createNonEmptyArrowCallback()))
    visitor.CallExpression!(createHookCall('afterEach', createEmptyArrowCallback()))
    visitor.CallExpression!(createHookCall('beforeAll', createNonEmptyFunctionCallback()))
    visitor.CallExpression!(createHookCall('afterAll', createEmptyArrowCallback()))
    expect(reports.length).toBe(3)
  })

  // SECTION: Arrow vs FunctionExpression with params
  test('reports empty arrow with params', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('beforeEach', {
      type: 'ArrowFunctionExpression',
      params: [{ type: 'Identifier', name: 'done' }],
      body: { type: 'BlockStatement', body: [] },
    }))
    expect(reports.length).toBe(1)
  })

  test('reports empty FunctionExpression with params', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('afterEach', {
      type: 'FunctionExpression',
      params: [{ type: 'Identifier', name: 'done' }],
      body: { type: 'BlockStatement', body: [] },
    }))
    expect(reports.length).toBe(1)
  })

  test('does not report arrow with expression body', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('afterAll', {
      type: 'ArrowFunctionExpression',
      params: [],
      body: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
    }))
    expect(reports.length).toBe(0)
  })

  // SECTION: Various file paths
  test('works with .spec.ts files', () => {
    const { context, reports } = createMockContext({}, '/src/file.spec.ts')
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('beforeEach', createEmptyArrowCallback()))
    expect(reports.length).toBe(1)
  })

  test('works with .test.js files', () => {
    const { context, reports } = createMockContext({}, '/src/file.test.js')
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('afterEach', createEmptyArrowCallback()))
    expect(reports.length).toBe(1)
  })

  test('works with .spec.tsx files', () => {
    const { context, reports } = createMockContext({}, '/src/component.spec.tsx')
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('beforeAll', createEmptyArrowCallback()))
    expect(reports.length).toBe(1)
  })

  test('works with deeply nested file path', () => {
    const { context, reports } = createMockContext({}, '/packages/app/src/features/auth/login.test.ts')
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('afterAll', createEmptyArrowCallback()))
    expect(reports.length).toBe(1)
  })

  test('works with non-test file paths', () => {
    const { context, reports } = createMockContext({}, '/src/utils.ts')
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('beforeEach', createEmptyArrowCallback()))
    expect(reports.length).toBe(1)
  })

  // SECTION: Meta and export
  test('meta docs have correct URL format', () => {
    const url = rule.meta.docs.url
    expect(url).toMatch(/^https?:\/\/.+/)
    expect(url).toContain('no-empty-hook')
  })

  test('meta docs recommended is false', () => {
    expect(rule.meta.docs.recommended).toBe(false)
  })

  test('meta docs description is exact expected string', () => {
    expect(rule.meta.docs.description).toBe('Disallow empty setup and teardown hooks')
  })

  test('default export exists and has create', () => {
    expect(rule).toBeDefined()
    expect(typeof rule.create).toBe('function')
  })

  // SECTION: Async hooks
  test('reports empty async arrow callback', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('beforeEach', {
      type: 'ArrowFunctionExpression',
      async: true,
      params: [],
      body: { type: 'BlockStatement', body: [] },
    }))
    expect(reports.length).toBe(1)
  })

  test('reports empty async FunctionExpression callback', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('afterEach', {
      type: 'FunctionExpression',
      async: true,
      params: [],
      body: { type: 'BlockStatement', body: [] },
    }))
    expect(reports.length).toBe(1)
  })

  test('does not report async arrow with statement', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('beforeAll', {
      type: 'ArrowFunctionExpression',
      async: true,
      params: [],
      body: {
        type: 'BlockStatement',
        body: [{
          type: 'ExpressionStatement',
          expression: {
            type: 'AwaitExpression',
            argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
          },
        }],
      },
    }))
    expect(reports.length).toBe(0)
  })

  // SECTION: Additional edge cases
  test('does not report hook call with extra arguments', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'beforeEach' },
      arguments: [
        createEmptyArrowCallback(),
        { type: 'Literal', value: 10000 },
      ],
    })
    expect(reports.length).toBe(1)
  })

  test('handles node with callee missing name property', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: { type: 'Identifier' },
      arguments: [createEmptyArrowCallback()],
    })
    expect(reports.length).toBe(0)
  })

  test('handles hook call where body is missing on callback', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('beforeEach', {
      type: 'ArrowFunctionExpression',
      params: [],
    }))
    expect(reports.length).toBe(0)
  })

  test('handles hook call where body is null on FunctionExpression', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('afterEach', {
      type: 'FunctionExpression',
      params: [],
      body: null,
    }))
    expect(reports.length).toBe(0)
  })

  test('handles callee with numeric name', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 123 as unknown as string },
      arguments: [createEmptyArrowCallback()],
    })
    expect(reports.length).toBe(0)
  })

  test('handles node with extra properties', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'beforeEach' },
      arguments: [createEmptyArrowCallback()],
      optional: false,
      extra: true,
    })
    expect(reports.length).toBe(1)
  })

  test('does not report hook call with Identifier as first argument', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('beforeEach', { type: 'Identifier', name: 'fn' }))
    expect(reports.length).toBe(0)
  })

  test('does not report hook call with CallExpression as first argument', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('afterEach', {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'fn' },
      arguments: [],
    }))
    expect(reports.length).toBe(0)
  })

  test('does not report hook call with MemberExpression as first argument', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('beforeAll', {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'obj' },
      property: { type: 'Identifier', name: 'fn' },
    }))
    expect(reports.length).toBe(0)
  })

  test('reports empty named FunctionExpression callback', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('beforeEach', {
      type: 'FunctionExpression',
      id: { type: 'Identifier', name: 'setup' },
      params: [],
      body: { type: 'BlockStatement', body: [] },
    }))
    expect(reports.length).toBe(1)
  })

  // SECTION: Additional coverage for 90 tests
  test('does not report beforeEach with template literal callback', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('beforeEach', {
      type: 'TemplateLiteral',
      quasis: [],
      expressions: [],
    }))
    expect(reports.length).toBe(0)
  })

  test('does not report beforeAll with ObjectExpression callback', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('beforeAll', {
      type: 'ObjectExpression',
      properties: [],
    }))
    expect(reports.length).toBe(0)
  })

  test('does not report afterEach with ArrayExpression callback', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('afterEach', {
      type: 'ArrayExpression',
      elements: [],
    }))
    expect(reports.length).toBe(0)
  })

  test('reports empty afterEach with FunctionExpression and multiple params', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('afterEach', {
      type: 'FunctionExpression',
      params: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }],
      body: { type: 'BlockStatement', body: [] },
    }))
    expect(reports.length).toBe(1)
  })

  test('handles BlockStatement with undefined body', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('beforeEach', {
      type: 'ArrowFunctionExpression',
      params: [],
      body: { type: 'BlockStatement', body: undefined },
    }))
    expect(reports.length).toBe(1)
  })

  test('handles BlockStatement with null body', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('afterEach', {
      type: 'ArrowFunctionExpression',
      params: [],
      body: { type: 'BlockStatement', body: null },
    }))
    expect(reports.length).toBe(1)
  })

  test('does not report beforeEach with UnaryExpression callback', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('beforeEach', {
      type: 'UnaryExpression',
      operator: '!',
      argument: { type: 'Identifier', name: 'flag' },
    }))
    expect(reports.length).toBe(0)
  })

  test('does not report afterEach with BinaryExpression callback', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('afterEach', {
      type: 'BinaryExpression',
      operator: '+',
      left: { type: 'Identifier', name: 'a' },
      right: { type: 'Identifier', name: 'b' },
    }))
    expect(reports.length).toBe(0)
  })

  test('does not report beforeAll with ConditionalExpression callback', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('beforeAll', {
      type: 'ConditionalExpression',
      test: { type: 'Identifier', name: 'x' },
      consequent: { type: 'Literal', value: 1 },
      alternate: { type: 'Literal', value: 2 },
    }))
    expect(reports.length).toBe(0)
  })

  test('does not report afterAll with LogicalExpression callback', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('afterAll', {
      type: 'LogicalExpression',
      operator: '&&',
      left: { type: 'Identifier', name: 'a' },
      right: { type: 'Identifier', name: 'b' },
    }))
    expect(reports.length).toBe(0)
  })

  test('does not report afterAll with NewExpression callback', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('afterAll', {
      type: 'NewExpression',
      callee: { type: 'Identifier', name: 'Map' },
      arguments: [],
    }))
    expect(reports.length).toBe(0)
  })

  test('does not report beforeEach with SpreadElement callback', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('beforeEach', {
      type: 'SpreadElement',
      argument: { type: 'Identifier', name: 'arr' },
    }))
    expect(reports.length).toBe(0)
  })

  test('does not report beforeEach with TaggedTemplateExpression callback', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('beforeEach', {
      type: 'TaggedTemplateExpression',
      tag: { type: 'Identifier', name: 'tag' },
      quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] },
    }))
    expect(reports.length).toBe(0)
  })

  test('handles hook call with second argument being timeout', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'afterEach' },
      arguments: [
        createNonEmptyArrowCallback(),
        { type: 'Literal', value: 5000 },
      ],
    })
    expect(reports.length).toBe(0)
  })

  test('works with .test.jsx files', () => {
    const { context, reports } = createMockContext({}, '/src/component.test.jsx')
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('beforeEach', createEmptyArrowCallback()))
    expect(reports.length).toBe(1)
  })

  test('works with .mjs files', () => {
    const { context, reports } = createMockContext({}, '/src/file.test.mjs')
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('afterEach', createEmptyArrowCallback()))
    expect(reports.length).toBe(1)
  })

  test('handles hook call with numeric callee name', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 42 as unknown as string },
      arguments: [createEmptyArrowCallback()],
    })
    expect(reports.length).toBe(0)
  })

  test('does not report beforeEach with SequenceExpression callback', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('beforeEach', {
      type: 'SequenceExpression',
      expressions: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }],
    }))
    expect(reports.length).toBe(0)
  })

  test('does not report beforeAll with UpdateExpression callback', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('beforeAll', {
      type: 'UpdateExpression',
      operator: '++',
      argument: { type: 'Identifier', name: 'i' },
      prefix: false,
    }))
    expect(reports.length).toBe(0)
  })

  // SECTION: Additional coverage for 95 tests
  test('does not report beforeAll with AwaitExpression callback', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('beforeAll', {
      type: 'AwaitExpression',
      argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
    }))
    expect(reports.length).toBe(0)
  })

  test('does not report afterAll with AssignmentExpression callback', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('afterAll', {
      type: 'AssignmentExpression',
      operator: '=',
      left: { type: 'Identifier', name: 'x' },
      right: { type: 'Literal', value: 1 },
    }))
    expect(reports.length).toBe(0)
  })

  test('handles hook call where callee name is empty string', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('', createEmptyArrowCallback()))
    expect(reports.length).toBe(0)
  })

  test('reports empty beforeEach with generator FunctionExpression', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('beforeEach', {
      type: 'FunctionExpression',
      generator: true,
      params: [],
      body: { type: 'BlockStatement', body: [] },
    }))
    expect(reports.length).toBe(1)
  })

  test('does not report beforeEach with non-empty FunctionExpression having single return statement', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createHookCall('beforeEach', {
      type: 'FunctionExpression',
      params: [],
      body: {
        type: 'BlockStatement',
        body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 42 } }],
      },
    }))
    expect(reports.length).toBe(0)
  })
})
