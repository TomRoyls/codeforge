import { describe, expect, test, vi } from 'vitest'
import { noAsyncConstructorRule } from '../../../../src/rules/correctness/no-async-constructor.js'
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
    getSource: () => 'class Foo { async constructor() {} }',
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

function makeMethodDefinition(
  kind: string,
  async: boolean,
  line = 1,
  column = 0,
  valueType = 'FunctionExpression',
): unknown {
  return {
    type: 'MethodDefinition',
    kind,
    value: {
      type: valueType,
      async,
      params: [],
      body: { type: 'BlockStatement', body: [] },
    },
    loc: makeLoc(line, column, line, column + 20),
  }
}

describe('no-async-constructor rule', () => {
  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('should have correct type "problem"', () => {
      expect(noAsyncConstructorRule.meta.type).toBe('problem')
    })

    test('should have severity "error"', () => {
      expect(noAsyncConstructorRule.meta.severity).toBe('error')
    })

    test('should have correct category "correctness"', () => {
      expect(noAsyncConstructorRule.meta.docs?.category).toBe('correctness')
    })

    test('should be recommended', () => {
      expect(noAsyncConstructorRule.meta.docs?.recommended).toBe(true)
    })

    test('should have a description', () => {
      expect(noAsyncConstructorRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning async and constructor', () => {
      const desc = noAsyncConstructorRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/async/)
      expect(desc).toMatch(/constructor/)
    })

    test('should have correct docs URL', () => {
      expect(noAsyncConstructorRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-async-constructor',
      )
    })

    test('should have empty schema', () => {
      expect(noAsyncConstructorRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====
  describe('structure', () => {
    test('create() returns visitor with MethodDefinition', () => {
      const { context } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      expect(visitor).toHaveProperty('MethodDefinition')
      expect(typeof visitor.MethodDefinition).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noAsyncConstructorRule).toBeDefined()
      expect(noAsyncConstructorRule.meta).toBeDefined()
      expect(noAsyncConstructorRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES (25) =====
  describe('positive cases — reports async constructors', () => {
    test('reports async constructor', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      visitor.MethodDefinition(makeMethodDefinition('constructor', true))
      expect(reports.length).toBe(1)
    })

    test('report message mentions async constructor', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      visitor.MethodDefinition(makeMethodDefinition('constructor', true))
      expect(reports[0].message).toMatch(/async/i)
      expect(reports[0].message).toMatch(/constructor/i)
    })

    test('report message mentions not valid', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      visitor.MethodDefinition(makeMethodDefinition('constructor', true))
      expect(reports[0].message).toMatch(/not valid/)
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      visitor.MethodDefinition(makeMethodDefinition('constructor', true))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      visitor.MethodDefinition(makeMethodDefinition('constructor', true))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches original node', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      const node = makeMethodDefinition('constructor', true)
      visitor.MethodDefinition(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc has correct start line', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      visitor.MethodDefinition(makeMethodDefinition('constructor', true, 5, 4))
      expect(reports[0].loc?.start.line).toBe(5)
    })

    test('report loc has correct start column', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      visitor.MethodDefinition(makeMethodDefinition('constructor', true, 5, 4))
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('report loc has correct end line', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      visitor.MethodDefinition(makeMethodDefinition('constructor', true, 5, 4))
      expect(reports[0].loc?.end.line).toBe(5)
    })

    test('report loc has correct end column', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      visitor.MethodDefinition(makeMethodDefinition('constructor', true, 5, 4))
      expect(reports[0].loc?.end.column).toBe(24)
    })

    test('reports async constructor at line 1 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      visitor.MethodDefinition(makeMethodDefinition('constructor', true, 1, 0))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('reports async constructor at line 10 column 8', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      visitor.MethodDefinition(makeMethodDefinition('constructor', true, 10, 8))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('reports async constructor with parameters', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          async: true,
          params: [{ type: 'Identifier', name: 'x' }],
          body: { type: 'BlockStatement', body: [] },
        },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('reports async constructor with multiple parameters', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          async: true,
          params: [
            { type: 'Identifier', name: 'x' },
            { type: 'Identifier', name: 'y' },
          ],
          body: { type: 'BlockStatement', body: [] },
        },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('reports async constructor with body statements', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          async: true,
          params: [],
          body: {
            type: 'BlockStatement',
            body: [{ type: 'ExpressionStatement', expression: { type: 'Literal', value: 42 } }],
          },
        },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('reports async constructor with static modifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        static: false,
        value: {
          type: 'FunctionExpression',
          async: true,
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('reports async constructor with computed key false', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        computed: false,
        value: {
          type: 'FunctionExpression',
          async: true,
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('reports multiple async constructors accumulated', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      visitor.MethodDefinition(makeMethodDefinition('constructor', true))
      visitor.MethodDefinition(makeMethodDefinition('constructor', true))
      visitor.MethodDefinition(makeMethodDefinition('constructor', true))
      expect(reports.length).toBe(3)
    })

    test('reports async constructor with generator false', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          async: true,
          generator: false,
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all three properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      visitor.MethodDefinition(makeMethodDefinition('constructor', true))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('message contains JavaScript', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      visitor.MethodDefinition(makeMethodDefinition('constructor', true))
      expect(reports[0].message).toContain('JavaScript')
    })

    test('reports async constructor with accessibility modifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        accessibility: 'public',
        value: {
          type: 'FunctionExpression',
          async: true,
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('reports async constructor with private accessibility', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        accessibility: 'private',
        value: {
          type: 'FunctionExpression',
          async: true,
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('reports async constructor at large line number', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      visitor.MethodDefinition(makeMethodDefinition('constructor', true, 500, 20))
      expect(reports[0].loc?.start.line).toBe(500)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('reports async constructor with extra node properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        extra: true,
        value: {
          type: 'FunctionExpression',
          async: true,
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES (35) =====
  describe('negative cases — does NOT report', () => {
    test('does not report non-async constructor', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      visitor.MethodDefinition(makeMethodDefinition('constructor', false))
      expect(reports.length).toBe(0)
    })

    test('does not report async method (non-constructor)', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      visitor.MethodDefinition(makeMethodDefinition('method', true))
      expect(reports.length).toBe(0)
    })

    test('does not report async get accessor', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      visitor.MethodDefinition(makeMethodDefinition('get', true))
      expect(reports.length).toBe(0)
    })

    test('does not report async set accessor', () => {
      const context = createMockContext()
      const visitor = noAsyncConstructorRule.create(context.context)
      visitor.MethodDefinition(makeMethodDefinition('set', true))
      expect(context.reports.length).toBe(0)
    })

    test('does not report non-async method', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      visitor.MethodDefinition(makeMethodDefinition('method', false))
      expect(reports.length).toBe(0)
    })

    test('handles null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      expect(() => visitor.MethodDefinition(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      expect(() => visitor.MethodDefinition(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      expect(() => visitor.MethodDefinition({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report node with wrong type Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      visitor.MethodDefinition({ type: 'Identifier', name: 'x', loc: makeLoc(1, 0, 1, 1) })
      expect(reports.length).toBe(0)
    })

    test('does not report node with wrong type FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      visitor.MethodDefinition({
        type: 'FunctionDeclaration',
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report constructor with ArrowFunctionExpression value', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'ArrowFunctionExpression',
          async: true,
          params: [],
          body: { type: 'Identifier', name: 'x' },
        },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('does not report constructor with no value', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('does not report constructor with null value', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: null,
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('does not report constructor with undefined value', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: undefined,
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('does not report constructor with async explicitly false', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          async: false,
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('does not report constructor with async undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('reports constructor with truthy string async value', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          async: 'true' as unknown as boolean,
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('reports constructor with truthy numeric async value', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          async: 1 as unknown as boolean,
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('does not report node with wrong type BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      visitor.MethodDefinition({
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Literal', value: 1 },
        right: { type: 'Literal', value: 2 },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report node with wrong type CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      visitor.MethodDefinition({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report node with wrong type MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      visitor.MethodDefinition({
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'Math' },
        property: { type: 'Identifier', name: 'PI' },
        loc: makeLoc(1, 0, 1, 8),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report node with wrong type ClassExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      visitor.MethodDefinition({
        type: 'ClassExpression',
        body: { type: 'ClassBody', body: [] },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report node with wrong type ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      visitor.MethodDefinition({
        type: 'ObjectExpression',
        properties: [],
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report node with wrong type ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      visitor.MethodDefinition({
        type: 'ArrayExpression',
        elements: [],
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report node with wrong type AssignmentExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      visitor.MethodDefinition({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 1 },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report node with wrong type AwaitExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      visitor.MethodDefinition({
        type: 'AwaitExpression',
        argument: { type: 'Identifier', name: 'promise' },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report node with wrong type NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      visitor.MethodDefinition({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Set' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report node with wrong type LogicalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      visitor.MethodDefinition({
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report node with wrong type ConditionalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      visitor.MethodDefinition({
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'x' },
        consequent: { type: 'Literal', value: 1 },
        alternate: { type: 'Literal', value: 2 },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report node with wrong type UnaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      visitor.MethodDefinition({
        type: 'UnaryExpression',
        operator: '-',
        argument: { type: 'Literal', value: 1 },
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report node with wrong type UpdateExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      visitor.MethodDefinition({
        type: 'UpdateExpression',
        operator: '++',
        argument: { type: 'Identifier', name: 'i' },
        prefix: false,
        loc: makeLoc(1, 0, 1, 3),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report node with wrong type YieldExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      visitor.MethodDefinition({
        type: 'YieldExpression',
        argument: { type: 'Identifier', name: 'value' },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report node with wrong type SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      visitor.MethodDefinition({
        type: 'SpreadElement',
        argument: { type: 'Identifier', name: 'items' },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report node with wrong type Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      visitor.MethodDefinition({
        type: 'Literal',
        value: 42,
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report node with wrong type TemplateLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      visitor.MethodDefinition({
        type: 'TemplateLiteral',
        quasis: [],
        expressions: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====
  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noAsyncConstructorRule.create(ctx1)
      const visitor2 = noAsyncConstructorRule.create(ctx2)

      visitor1.MethodDefinition(makeMethodDefinition('constructor', true))
      visitor2.MethodDefinition(makeMethodDefinition('constructor', false))

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noAsyncConstructorRule.create(context)
      const visitor2 = noAsyncConstructorRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('mixed valid and invalid reports count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      visitor.MethodDefinition(makeMethodDefinition('constructor', true))
      visitor.MethodDefinition(makeMethodDefinition('constructor', false))
      visitor.MethodDefinition(makeMethodDefinition('method', true))
      visitor.MethodDefinition(makeMethodDefinition('constructor', true))
      visitor.MethodDefinition(makeMethodDefinition('get', true))
      expect(reports.length).toBe(2)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      visitor.MethodDefinition(makeMethodDefinition('constructor', true))
      visitor.MethodDefinition(makeMethodDefinition('constructor', true))
      visitor.MethodDefinition(makeMethodDefinition('constructor', true))
      expect(reports.length).toBe(3)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          async: true,
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          async: true,
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
      }
      visitor.MethodDefinition(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('constructor with value having no type does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: { async: true },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('constructor with value as empty object does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {},
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('MethodDefinition without kind does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      const node = {
        type: 'MethodDefinition',
        value: {
          type: 'FunctionExpression',
          async: true,
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('MethodDefinition with kind method does not report even if async', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      visitor.MethodDefinition(makeMethodDefinition('method', true))
      expect(reports.length).toBe(0)
    })

    test('handles node that is a primitive string', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      expect(() => visitor.MethodDefinition('not a node' as unknown as never)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles node that is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      expect(() => visitor.MethodDefinition(42 as unknown as never)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles node that is a boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      expect(() => visitor.MethodDefinition(true as unknown as never)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles deeply nested value object with wrong type', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          async: true,
          params: [],
          body: {
            type: 'BlockStatement',
            body: [{
              type: 'ExpressionStatement',
              expression: {
                type: 'AwaitExpression',
                argument: { type: 'Identifier', name: 'promise' },
              },
            }],
          },
        },
        loc: makeLoc(1, 0, 3, 1),
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('does not report when kind is Constructor (capitalized)', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'Constructor',
        value: {
          type: 'FunctionExpression',
          async: true,
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })
  })

  // ===== ADDITIONAL CASES (10) =====
  describe('additional coverage', () => {
    test('rule meta is the same reference across accesses', () => {
      const meta1 = noAsyncConstructorRule.meta
      const meta2 = noAsyncConstructorRule.meta
      expect(meta1).toBe(meta2)
    })

    test('rule name is exported as noAsyncConstructorRule', () => {
      expect(noAsyncConstructorRule).toBeDefined()
      expect(typeof noAsyncConstructorRule.create).toBe('function')
      expect(typeof noAsyncConstructorRule.meta).toBe('object')
    })

    test('message consistency across multiple reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      visitor.MethodDefinition(makeMethodDefinition('constructor', true))
      visitor.MethodDefinition(makeMethodDefinition('constructor', true))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('does not report non-async constructor with complex body', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          async: false,
          params: [{ type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }],
          body: {
            type: 'BlockStatement',
            body: [
              { type: 'ExpressionStatement', expression: { type: 'Literal', value: 1 } },
              { type: 'ReturnStatement', argument: null },
            ],
          },
        },
        loc: makeLoc(1, 0, 5, 1),
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('does not report node with wrong type Property', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      visitor.MethodDefinition({
        type: 'Property',
        key: { type: 'Identifier', name: 'constructor' },
        value: { type: 'FunctionExpression', async: true },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      visitor.MethodDefinition(makeMethodDefinition('constructor', true))
      visitor.MethodDefinition(makeMethodDefinition('constructor', true))
      expect(reports.length).toBe(2)
    })

    test('handles node with extra properties on value', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncConstructorRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          async: true,
          id: null,
          generator: false,
          expression: false,
          params: [],
          body: { type: 'BlockStatement', body: [] },
          extra: { parenthesized: true },
        },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('meta deprecated is not set or is false', () => {
      expect(noAsyncConstructorRule.meta.deprecated).toBeFalsy()
    })

    test('meta does not have fixable property', () => {
      expect(noAsyncConstructorRule.meta.fixable).toBeUndefined()
    })

    test('meta does not have requiresTypeChecking', () => {
      expect(noAsyncConstructorRule.meta.requiresTypeChecking).toBeUndefined()
    })
  })
})
