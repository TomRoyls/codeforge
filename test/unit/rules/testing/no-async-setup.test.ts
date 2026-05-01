import { describe, expect, test, vi } from 'vitest'
import { noAsyncSetupRule } from '../../../../src/rules/testing/no-async-setup.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  node?: unknown
}

function createMockContext(): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
        node: descriptor.node,
      })
    },
    getFilePath: () => '/src/file.ts',
    getAST: () => null,
    getSource: () => 'beforeEach(async () => {})',
    getTokens: () => [],
    getComments: () => [],
    config: { options: [{}] },
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

function makeLoc(startLine: number, startCol: number, endLine: number, endCol: number) {
  return {
    start: { line: startLine, column: startCol },
    end: { line: endLine, column: endCol },
  }
}

function makeAsyncHookCall(
  hookName: string,
  callbackType: 'ArrowFunctionExpression' | 'FunctionExpression' = 'ArrowFunctionExpression',
  line = 1,
  column = 0,
): unknown {
  const callback = {
    type: callbackType,
    async: true,
    params: [],
    body: { type: 'BlockStatement', body: [] },
    loc: makeLoc(line, column + hookName.length + 1, line, column + hookName.length + 15),
  }
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: hookName },
    arguments: [callback],
    loc: makeLoc(line, column, line, column + hookName.length + 20),
  }
}

describe('no-async-setup rule', () => {
  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noAsyncSetupRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noAsyncSetupRule.meta.severity).toBe('warn')
    })

    test('should have correct category "testing"', () => {
      expect(noAsyncSetupRule.meta.docs?.category).toBe('testing')
    })

    test('should not be recommended', () => {
      expect(noAsyncSetupRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noAsyncSetupRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning async and hooks', () => {
      const desc = noAsyncSetupRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/async/)
      expect(desc).toMatch(/hook/)
    })

    test('should have correct docs URL', () => {
      expect(noAsyncSetupRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-async-setup',
      )
    })

    test('should have empty schema', () => {
      expect(noAsyncSetupRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====
  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noAsyncSetupRule).toBeDefined()
      expect(noAsyncSetupRule.meta).toBeDefined()
      expect(noAsyncSetupRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES (20) =====
  describe('positive cases — reports async hooks', () => {
    test('reports async beforeEach with arrow function', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      visitor.CallExpression(makeAsyncHookCall('beforeEach'))
      expect(reports.length).toBe(1)
    })

    test('reports async beforeAll with arrow function', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      visitor.CallExpression(makeAsyncHookCall('beforeAll'))
      expect(reports.length).toBe(1)
    })

    test('reports async afterEach with arrow function', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      visitor.CallExpression(makeAsyncHookCall('afterEach'))
      expect(reports.length).toBe(1)
    })

    test('reports async afterAll with arrow function', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      visitor.CallExpression(makeAsyncHookCall('afterAll'))
      expect(reports.length).toBe(1)
    })

    test('reports async beforeEach with regular function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      visitor.CallExpression(makeAsyncHookCall('beforeEach', 'FunctionExpression'))
      expect(reports.length).toBe(1)
    })

    test('reports async beforeAll with regular function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      visitor.CallExpression(makeAsyncHookCall('beforeAll', 'FunctionExpression'))
      expect(reports.length).toBe(1)
    })

    test('message mentions hook name "beforeEach"', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      visitor.CallExpression(makeAsyncHookCall('beforeEach'))
      expect(reports[0].message).toContain('beforeEach')
    })

    test('message mentions hook name "afterAll"', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      visitor.CallExpression(makeAsyncHookCall('afterAll'))
      expect(reports[0].message).toContain('afterAll')
    })

    test('message mentions timing issues', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      visitor.CallExpression(makeAsyncHookCall('beforeEach'))
      expect(reports[0].message.toLowerCase()).toContain('timing')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      visitor.CallExpression(makeAsyncHookCall('beforeEach'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      visitor.CallExpression(makeAsyncHookCall('beforeEach'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the callback argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      const node = makeAsyncHookCall('beforeEach')
      visitor.CallExpression(node)
      const callNode = node as { arguments: unknown[] }
      expect(reports[0].node).toBe(callNode.arguments[0])
    })

    test('reports with correct location line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      visitor.CallExpression(makeAsyncHookCall('beforeEach', 'ArrowFunctionExpression', 7, 4))
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(15)
    })

    test('reports multiple async hook violations in same source', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      visitor.CallExpression(makeAsyncHookCall('beforeEach'))
      visitor.CallExpression(makeAsyncHookCall('afterEach'))
      visitor.CallExpression(makeAsyncHookCall('beforeAll'))
      expect(reports.length).toBe(3)
    })

    test('reports async afterEach with function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      visitor.CallExpression(makeAsyncHookCall('afterEach', 'FunctionExpression'))
      expect(reports.length).toBe(1)
    })

    test('reports async afterAll with function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      visitor.CallExpression(makeAsyncHookCall('afterAll', 'FunctionExpression'))
      expect(reports.length).toBe(1)
    })

    test('reports each violation once per call', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      visitor.CallExpression(makeAsyncHookCall('beforeEach'))
      expect(reports.length).toBe(1)
    })

    test('message mentions "async"', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      visitor.CallExpression(makeAsyncHookCall('beforeEach'))
      expect(reports[0].message.toLowerCase()).toContain('async')
    })

    test('message mentions "flakiness"', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      visitor.CallExpression(makeAsyncHookCall('beforeEach'))
      expect(reports[0].message.toLowerCase()).toContain('flakiness')
    })

    test('report loc has start and end properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      visitor.CallExpression(makeAsyncHookCall('beforeEach'))
      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('visitor accumulates reports across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      visitor.CallExpression(makeAsyncHookCall('beforeEach'))
      visitor.CallExpression(makeAsyncHookCall('beforeAll'))
      visitor.CallExpression(makeAsyncHookCall('afterEach'))
      visitor.CallExpression(makeAsyncHookCall('afterAll'))
      expect(reports.length).toBe(4)
    })
  })

  // ===== NEGATIVE CASES (35) =====
  describe('negative cases — does NOT report', () => {
    test('does not report sync beforeEach with arrow function', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            async: false,
            params: [],
            body: { type: 'BlockStatement', body: [] },
            loc: makeLoc(1, 12, 1, 25),
          },
        ],
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report sync beforeAll with arrow function', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeAll' },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            async: false,
            params: [],
            body: { type: 'BlockStatement', body: [] },
            loc: makeLoc(1, 11, 1, 24),
          },
        ],
        loc: makeLoc(1, 0, 1, 24),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report sync afterEach with function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'afterEach' },
        arguments: [
          {
            type: 'FunctionExpression',
            async: false,
            params: [],
            body: { type: 'BlockStatement', body: [] },
            loc: makeLoc(1, 12, 1, 30),
          },
        ],
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report sync afterAll with function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'afterAll' },
        arguments: [
          {
            type: 'FunctionExpression',
            async: false,
            params: [],
            body: { type: 'BlockStatement', body: [] },
            loc: makeLoc(1, 11, 1, 29),
          },
        ],
        loc: makeLoc(1, 0, 1, 29),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report async test() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'test' },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            async: true,
            params: [],
            body: { type: 'BlockStatement', body: [] },
            loc: makeLoc(1, 6, 1, 20),
          },
        ],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report async describe() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'describe' },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            async: true,
            params: [],
            body: { type: 'BlockStatement', body: [] },
            loc: makeLoc(1, 10, 1, 25),
          },
        ],
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report async it() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            async: true,
            params: [],
            body: { type: 'BlockStatement', body: [] },
            loc: makeLoc(1, 4, 1, 18),
          },
        ],
        loc: makeLoc(1, 0, 1, 18),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report non-hook call like someFunction(async () => {})', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'someFunction' },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            async: true,
            params: [],
            body: { type: 'BlockStatement', body: [] },
            loc: makeLoc(1, 15, 1, 30),
          },
        ],
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report hook with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 12),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report hook with empty arguments array', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 12),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles non-CallExpression type', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      const node = { type: 'Literal', value: 42 }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report computed member expression callee — obj.beforeEach', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'beforeEach' },
          computed: false,
        },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            async: true,
            params: [],
            body: { type: 'BlockStatement', body: [] },
            loc: makeLoc(1, 17, 1, 32),
          },
        ],
        loc: makeLoc(1, 0, 1, 32),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not an Identifier — FunctionExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'FunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            async: true,
            params: [],
            body: { type: 'BlockStatement', body: [] },
            loc: makeLoc(1, 10, 1, 25),
          },
        ],
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report regular function callback without async keyword', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [
          {
            type: 'FunctionExpression',
            async: false,
            params: [],
            body: { type: 'BlockStatement', body: [] },
            loc: makeLoc(1, 12, 1, 30),
          },
        ],
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when first argument is not a function — string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [
          { type: 'Literal', value: 'not a function' },
        ],
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when first argument is an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [
          { type: 'Identifier', name: 'mySetup' },
        ],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when first argument is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [
          { type: 'CallExpression', callee: { type: 'Identifier', name: 'setup' }, arguments: [] },
        ],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        loc: makeLoc(1, 0, 1, 12),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: null,
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            async: true,
            params: [],
            body: { type: 'BlockStatement', body: [] },
            loc: makeLoc(1, 5, 1, 20),
          },
        ],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when first argument is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [null],
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when first argument is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [undefined],
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles string primitive node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles number primitive node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when callee name is a non-hook like "setup"', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setup' },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            async: true,
            params: [],
            body: { type: 'BlockStatement', body: [] },
            loc: makeLoc(1, 7, 1, 22),
          },
        ],
        loc: makeLoc(1, 0, 1, 22),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'ctx' },
          property: { type: 'Identifier', name: 'beforeEach' },
          computed: false,
        },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            async: true,
            params: [],
            body: { type: 'BlockStatement', body: [] },
            loc: makeLoc(1, 17, 1, 32),
          },
        ],
        loc: makeLoc(1, 0, 1, 32),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report async function expression without async flag', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeAll' },
        arguments: [
          {
            type: 'FunctionExpression',
            async: false,
            params: [],
            body: { type: 'BlockStatement', body: [] },
            loc: makeLoc(1, 11, 1, 29),
          },
        ],
        loc: makeLoc(1, 0, 1, 29),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when callback is ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [{ type: 'ObjectExpression', properties: [] }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when callback is ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [{ type: 'ArrayExpression', elements: [] }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is a NewExpression-like structure', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            async: true,
            params: [],
            body: { type: 'BlockStatement', body: [] },
            loc: makeLoc(1, 12, 1, 27),
          },
        ],
        loc: makeLoc(1, 0, 1, 27),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report async arrow callback for "fit" call', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fit' },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            async: true,
            params: [],
            body: { type: 'BlockStatement', body: [] },
            loc: makeLoc(1, 5, 1, 20),
          },
        ],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report async arrow callback for "xdescribe" call', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'xdescribe' },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            async: true,
            params: [],
            body: { type: 'BlockStatement', body: [] },
            loc: makeLoc(1, 11, 1, 26),
          },
        ],
        loc: makeLoc(1, 0, 1, 26),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====
  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noAsyncSetupRule.create(ctx1)
      const visitor2 = noAsyncSetupRule.create(ctx2)

      visitor1.CallExpression(makeAsyncHookCall('beforeEach'))
      visitor2.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            async: false,
            params: [],
            body: { type: 'BlockStatement', body: [] },
            loc: makeLoc(1, 12, 1, 25),
          },
        ],
        loc: makeLoc(1, 0, 1, 25),
      })

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      visitor.CallExpression(makeAsyncHookCall('beforeEach'))
      visitor.CallExpression(makeAsyncHookCall('afterEach'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      const callback = {
        type: 'ArrowFunctionExpression',
        async: true,
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [callback],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('mixed violations and non-violations count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      // reports — async hook
      visitor.CallExpression(makeAsyncHookCall('beforeEach'))
      // does NOT report — sync hook
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'afterEach' },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            async: false,
            params: [],
            body: { type: 'BlockStatement', body: [] },
            loc: makeLoc(2, 0, 2, 15),
          },
        ],
        loc: makeLoc(2, 0, 2, 15),
      })
      // reports — async hook
      visitor.CallExpression(makeAsyncHookCall('beforeAll'))
      // does NOT report — non-hook
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'someFn' },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            async: true,
            params: [],
            body: { type: 'BlockStatement', body: [] },
            loc: makeLoc(3, 0, 3, 15),
          },
        ],
        loc: makeLoc(3, 0, 3, 15),
      })
      // reports — async hook
      visitor.CallExpression(makeAsyncHookCall('afterAll'))
      expect(reports.length).toBe(3)
    })

    test('multiple hook types in sequence report independently', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      visitor.CallExpression(makeAsyncHookCall('beforeEach'))
      visitor.CallExpression(makeAsyncHookCall('beforeAll'))
      visitor.CallExpression(makeAsyncHookCall('afterEach'))
      visitor.CallExpression(makeAsyncHookCall('afterAll'))
      expect(reports.length).toBe(4)
      expect(reports[0].message).toContain('beforeEach')
      expect(reports[1].message).toContain('beforeAll')
      expect(reports[2].message).toContain('afterEach')
      expect(reports[3].message).toContain('afterAll')
    })

    test('default location when callback has no loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      const callback = {
        type: 'ArrowFunctionExpression',
        async: true,
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [callback],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('create returns a new visitor each call (not same reference)', () => {
      const { context } = createMockContext()
      const visitor1 = noAsyncSetupRule.create(context)
      const visitor2 = noAsyncSetupRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('location with specific line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      const callback = {
        type: 'ArrowFunctionExpression',
        async: true,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(10, 4, 10, 20),
      }
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [callback],
        loc: makeLoc(10, 0, 10, 25),
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      visitor.CallExpression(makeAsyncHookCall('beforeEach'))
      visitor.CallExpression(makeAsyncHookCall('beforeEach'))
      visitor.CallExpression(makeAsyncHookCall('beforeEach'))
      expect(reports.length).toBe(3)
    })

    test('handles node with missing arguments property', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        loc: makeLoc(1, 0, 1, 12),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles async arrow with params', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      const callback = {
        type: 'ArrowFunctionExpression',
        async: true,
        params: [{ type: 'Identifier', name: 'done' }],
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 12, 1, 30),
      }
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [callback],
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles async function expression with identifier id', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      const callback = {
        type: 'FunctionExpression',
        id: { type: 'Identifier', name: 'setupFn' },
        async: true,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 12, 1, 40),
      }
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeAll' },
        arguments: [callback],
        loc: makeLoc(1, 0, 1, 40),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles callback with missing async property (falsy)', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      const callback = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 12, 1, 25),
      }
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [callback],
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles async arrow with empty body block', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      const callback = {
        type: 'ArrowFunctionExpression',
        async: true,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(3, 12, 3, 25),
      }
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'afterEach' },
        arguments: [callback],
        loc: makeLoc(3, 0, 3, 25),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for all 4 hook names in a single visitor', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      visitor.CallExpression(makeAsyncHookCall('beforeEach'))
      visitor.CallExpression(makeAsyncHookCall('beforeAll'))
      visitor.CallExpression(makeAsyncHookCall('afterEach'))
      visitor.CallExpression(makeAsyncHookCall('afterAll'))
      const messages = reports.map(r => r.message)
      expect(messages[0]).toContain('beforeEach')
      expect(messages[1]).toContain('beforeAll')
      expect(messages[2]).toContain('afterEach')
      expect(messages[3]).toContain('afterAll')
    })
  })

  // ===== ADDITIONAL CASES (15) =====
  describe('additional coverage', () => {
    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      visitor.CallExpression(makeAsyncHookCall('beforeEach'))
      visitor.CallExpression(makeAsyncHookCall('afterAll'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('beforeEach')
      expect(reports[1].message).toContain('afterAll')
    })

    test('all violation messages are consistent format', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      visitor.CallExpression(makeAsyncHookCall('beforeEach'))
      visitor.CallExpression(makeAsyncHookCall('beforeAll'))
      const msg0 = reports[0].message.replace('beforeEach', 'HOOK')
      const msg1 = reports[1].message.replace('beforeAll', 'HOOK')
      expect(msg0).toBe(msg1)
    })

    test('rule meta is deeply equal across multiple accesses', () => {
      const meta1 = noAsyncSetupRule.meta
      const meta2 = noAsyncSetupRule.meta
      expect(meta1).toBe(meta2)
    })

    test('rule name is exported as noAsyncSetupRule', () => {
      expect(noAsyncSetupRule).toBeDefined()
      expect(typeof noAsyncSetupRule.create).toBe('function')
      expect(typeof noAsyncSetupRule.meta).toBe('object')
    })

    test('message mentions "synchronous setup" suggestion', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      visitor.CallExpression(makeAsyncHookCall('beforeEach'))
      expect(reports[0].message.toLowerCase()).toContain('synchronous')
    })

    test('reports async beforeEach with arrow function at different location', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      visitor.CallExpression(makeAsyncHookCall('beforeEach', 'ArrowFunctionExpression', 42, 8))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(42)
    })

    test('does not report when callback type is "Literal"', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when callback type is "BinaryExpression"', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [
          {
            type: 'BinaryExpression',
            operator: '+',
            left: { type: 'Identifier', name: 'a' },
            right: { type: 'Identifier', name: 'b' },
          },
        ],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('nested CallExpression — hook inside another call is still detected', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      const innerCallback = {
        type: 'ArrowFunctionExpression',
        async: true,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 25, 1, 40),
      }
      const innerCall = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [innerCallback],
        loc: makeLoc(1, 13, 1, 40),
      }
      const outerCall = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'describe' },
        arguments: [
          { type: 'Literal', value: 'test' },
          { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } },
        ],
        loc: makeLoc(1, 0, 1, 50),
      }
      // Only visit the inner call directly — the rule doesn't traverse
      visitor.CallExpression(innerCall)
      expect(reports.length).toBe(1)
    })

    test('hook with multiple args — still reports async first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      const callback = {
        type: 'ArrowFunctionExpression',
        async: true,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 12, 1, 27),
      }
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [
          callback,
          { type: 'Literal', value: 'extra arg' },
          { type: 'Identifier', name: 'timeout' },
        ],
        loc: makeLoc(1, 0, 1, 45),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('message mentions "refactoring" suggestion', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      visitor.CallExpression(makeAsyncHookCall('beforeEach'))
      expect(reports[0].message.toLowerCase()).toContain('refactor')
    })

    test('does not report when callback async is explicitly false', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      const callback = {
        type: 'FunctionExpression',
        async: false,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 12, 1, 30),
      }
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'afterEach' },
        arguments: [callback],
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when callee Identifier has no name', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier' },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            async: true,
            params: [],
            body: { type: 'BlockStatement', body: [] },
            loc: makeLoc(1, 5, 1, 20),
          },
        ],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('message format is consistent for "beforeAll"', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      visitor.CallExpression(makeAsyncHookCall('beforeAll'))
      expect(reports[0].message).toMatch(/Unexpected async `beforeAll` hook/)
    })

    test('message format is consistent for "afterEach"', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSetupRule.create(context)
      visitor.CallExpression(makeAsyncHookCall('afterEach'))
      expect(reports[0].message).toMatch(/Unexpected async `afterEach` hook/)
    })
  })
})
