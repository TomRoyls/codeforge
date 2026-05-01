import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryConstructorRule } from '../../../../src/rules/patterns/no-unnecessary-constructor.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { end: { column: number; line: number }; start: { column: number; line: number } }
  node?: unknown
}

function makeLoc(startLine: number, startCol: number, endLine: number, endCol: number) {
  return {
    start: { line: startLine, column: startCol },
    end: { line: endLine, column: endCol },
  }
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
    getSource: () => 'class Foo { constructor() {} }',
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

function makeEmptyConstructorNode(
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 25,
): unknown {
  return {
    type: 'MethodDefinition',
    kind: 'constructor',
    static: false,
    computed: false,
    key: { type: 'Identifier', name: 'constructor' },
    value: {
      type: 'FunctionExpression',
      id: null,
      params: [],
      body: {
        type: 'BlockStatement',
        body: [],
      },
      generator: false,
      async: false,
    },
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeConstructorWithBody(stmts: unknown[]): unknown {
  return {
    type: 'MethodDefinition',
    kind: 'constructor',
    static: false,
    computed: false,
    key: { type: 'Identifier', name: 'constructor' },
    value: {
      type: 'FunctionExpression',
      id: null,
      params: [],
      body: {
        type: 'BlockStatement',
        body: stmts,
      },
      generator: false,
      async: false,
    },
    loc: makeLoc(1, 0, 1, 25),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-constructor rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryConstructorRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryConstructorRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryConstructorRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryConstructorRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryConstructorRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning constructor', () => {
      const desc = noUnnecessaryConstructorRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/constructor/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryConstructorRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-constructor',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryConstructorRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with MethodDefinition', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      expect(visitor).toHaveProperty('MethodDefinition')
      expect(typeof visitor.MethodDefinition).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryConstructorRule).toBeDefined()
      expect(noUnnecessaryConstructorRule.meta).toBeDefined()
      expect(noUnnecessaryConstructorRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS EMPTY CONSTRUCTOR (30) =====

  describe('positive cases — reports empty constructor', () => {
    test('reports for basic empty constructor', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      visitor.MethodDefinition(makeEmptyConstructorNode())
      expect(reports.length).toBe(1)
    })

    test('reports for empty constructor with static: false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      const node = makeEmptyConstructorNode()
      ;(node as Record<string, unknown>).static = false
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('reports for empty constructor with computed: false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      const node = makeEmptyConstructorNode()
      ;(node as Record<string, unknown>).computed = false
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('reports for empty constructor with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      const node = makeEmptyConstructorNode()
      ;(node as Record<string, unknown>)._parent = { type: 'ClassBody' }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('report message mentions "Unnecessary constructor"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      visitor.MethodDefinition(makeEmptyConstructorNode())
      expect(reports[0].message).toContain('Unnecessary constructor')
    })

    test('report message mentions "Empty constructors can be safely removed"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      visitor.MethodDefinition(makeEmptyConstructorNode())
      expect(reports[0].message).toContain('Empty constructors can be safely removed.')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      visitor.MethodDefinition(makeEmptyConstructorNode())
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      visitor.MethodDefinition(makeEmptyConstructorNode())
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input MethodDefinition node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      const node = makeEmptyConstructorNode()
      visitor.MethodDefinition(node)
      expect(reports[0].node).toBe(node)
    })

    test('reports for empty constructor with extra properties on MethodDefinition', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      const node = {
        ...makeEmptyConstructorNode(),
        accessibility: 'public',
        readonly: false,
        decorators: [],
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('reports for empty constructor with key as Identifier named constructor', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      const node = makeEmptyConstructorNode()
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('reports for empty constructor with decorators array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      const node = {
        ...makeEmptyConstructorNode(),
        decorators: [{ type: 'Decorator', expression: { type: 'Identifier', name: 'inject' } }],
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('reports for empty constructor with accessibility undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      const node = makeEmptyConstructorNode()
      delete (node as Record<string, unknown>).accessibility
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('reports for empty constructor with range property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      const node = {
        ...makeEmptyConstructorNode(),
        range: [0, 25] as [number, number],
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('reports for empty constructor with varied location (line 5)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      visitor.MethodDefinition(makeEmptyConstructorNode(5, 4, 5, 29))
      expect(reports.length).toBe(1)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      visitor.MethodDefinition(makeEmptyConstructorNode(5, 10, 5, 35))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('reports for empty constructor with id: null on FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      const node = makeEmptyConstructorNode()
      const value = (node as Record<string, unknown>).value as Record<string, unknown>
      value.id = null
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('reports for empty constructor with params: [] on FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      const node = makeEmptyConstructorNode()
      const value = (node as Record<string, unknown>).value as Record<string, unknown>
      value.params = []
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('reports for empty constructor with generator: false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      const node = makeEmptyConstructorNode()
      const value = (node as Record<string, unknown>).value as Record<string, unknown>
      value.generator = false
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('reports for empty constructor with async: false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      const node = makeEmptyConstructorNode()
      const value = (node as Record<string, unknown>).value as Record<string, unknown>
      value.async = false
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('reports for empty constructor with FunctionExpression extra props', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      const node = makeEmptyConstructorNode()
      const value = (node as Record<string, unknown>).value as Record<string, unknown>
      value.expression = false
      value.defaults = []
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      visitor.MethodDefinition(makeEmptyConstructorNode())
      visitor.MethodDefinition(makeEmptyConstructorNode())
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      visitor.MethodDefinition(makeEmptyConstructorNode())
      visitor.MethodDefinition(makeEmptyConstructorNode())
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      visitor.MethodDefinition(makeEmptyConstructorNode())
      expect(reports[0].message).toBe(
        'Unnecessary constructor. Empty constructors can be safely removed.',
      )
    })

    test('reports for empty constructor at different column', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      visitor.MethodDefinition(makeEmptyConstructorNode(3, 8, 3, 33))
      expect(reports.length).toBe(1)
    })

    test('reports for empty constructor with range on body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      const node = makeEmptyConstructorNode()
      const value = (node as Record<string, unknown>).value as Record<string, unknown>
      const body = value.body as Record<string, unknown>
      body.range = [20, 22] as [number, number]
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      const node = makeEmptyConstructorNode()
      visitor.MethodDefinition(node)
      visitor.MethodDefinition(node)
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(3)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      visitor.MethodDefinition(makeEmptyConstructorNode())
      visitor.MethodDefinition(makeEmptyConstructorNode())
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for empty constructor with empty params array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          id: null,
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('reports for empty constructor with params present', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          id: null,
          params: [{ type: 'Identifier', name: 'arg' }],
          body: { type: 'BlockStatement', body: [] },
        },
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      visitor.MethodDefinition(makeEmptyConstructorNode())
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (35) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for non-constructor kind "method"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      const node = {
        ...makeEmptyConstructorNode(),
        kind: 'method',
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for non-constructor kind "get"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      const node = {
        ...makeEmptyConstructorNode(),
        kind: 'get',
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for non-constructor kind "set"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      const node = {
        ...makeEmptyConstructorNode(),
        kind: 'set',
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      expect(() => visitor.MethodDefinition(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      expect(() => visitor.MethodDefinition(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      expect(() => visitor.MethodDefinition({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for non-MethodDefinition type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      visitor.MethodDefinition({
        type: 'Property',
        kind: 'constructor',
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when value is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      visitor.MethodDefinition({
        type: 'MethodDefinition',
        kind: 'constructor',
        value: null,
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when value is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      visitor.MethodDefinition({
        type: 'MethodDefinition',
        kind: 'constructor',
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when value.type is ArrowFunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      visitor.MethodDefinition({
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'ArrowFunctionExpression',
          body: { type: 'BlockStatement', body: [] },
        },
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when value.type is not FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      visitor.MethodDefinition({
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'CallExpression',
          callee: {},
          arguments: [],
        },
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when body is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      visitor.MethodDefinition({
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          body: null,
        },
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when body is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      visitor.MethodDefinition({
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
        },
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when body.type is not BlockStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      visitor.MethodDefinition({
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          body: { type: 'Expression', value: 'x' },
        },
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when body.body has statements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      visitor.MethodDefinition(
        makeConstructorWithBody([{ type: 'ExpressionStatement', expression: {} }]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when body.body is non-empty array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      visitor.MethodDefinition(
        makeConstructorWithBody([
          { type: 'ExpressionStatement', expression: { type: 'Literal', value: 42 } },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when body.body has one ReturnStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      visitor.MethodDefinition(
        makeConstructorWithBody([{ type: 'ReturnStatement', argument: null }]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      expect(() => visitor.MethodDefinition('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      expect(() => visitor.MethodDefinition(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      expect(() => visitor.MethodDefinition(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      expect(() => visitor.MethodDefinition([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      visitor.MethodDefinition({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      visitor.MethodDefinition({ type: 'Literal', value: 'test', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      visitor.MethodDefinition({
        type: 'CallExpression',
        callee: {},
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression node type (not MethodDefinition)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      visitor.MethodDefinition({
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for constructor with single assignment in body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      visitor.MethodDefinition(
        makeConstructorWithBody([
          {
            type: 'ExpressionStatement',
            expression: {
              type: 'AssignmentExpression',
              operator: '=',
              left: { type: 'MemberExpression', object: { type: 'ThisExpression' }, property: { type: 'Identifier', name: 'x' } },
              right: { type: 'Identifier', name: 'val' },
            },
          },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for constructor with super() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      visitor.MethodDefinition(
        makeConstructorWithBody([
          {
            type: 'ExpressionStatement',
            expression: {
              type: 'CallExpression',
              callee: { type: 'Super' },
              arguments: [],
            },
          },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for constructor with this.prop = value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      visitor.MethodDefinition(
        makeConstructorWithBody([
          {
            type: 'ExpressionStatement',
            expression: {
              type: 'AssignmentExpression',
              operator: '=',
              left: {
                type: 'MemberExpression',
                object: { type: 'ThisExpression' },
                property: { type: 'Identifier', name: 'prop' },
                computed: false,
              },
              right: { type: 'Literal', value: 1 },
            },
          },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when kind is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      visitor.MethodDefinition({
        type: 'MethodDefinition',
        value: {
          type: 'FunctionExpression',
          body: { type: 'BlockStatement', body: [] },
        },
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when body.body is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      visitor.MethodDefinition({
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          body: { type: 'BlockStatement' },
        },
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when body.body is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      visitor.MethodDefinition({
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          body: { type: 'BlockStatement', body: 'not-array' },
        },
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when body.body is a string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      visitor.MethodDefinition({
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          body: { type: 'BlockStatement', body: 'statements' },
        },
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when body.body has multiple statements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      visitor.MethodDefinition(
        makeConstructorWithBody([
          { type: 'ExpressionStatement', expression: {} },
          { type: 'ReturnStatement', argument: null },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for constructor with if statement in body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      visitor.MethodDefinition(
        makeConstructorWithBody([
          { type: 'IfStatement', test: {}, consequent: {} },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for constructor with variable declaration in body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      visitor.MethodDefinition(
        makeConstructorWithBody([
          { type: 'VariableDeclaration', declarations: [], kind: 'const' },
        ]),
      )
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryConstructorRule.create(ctx1)
      const visitor2 = noUnnecessaryConstructorRule.create(ctx2)
      visitor1.MethodDefinition(makeEmptyConstructorNode())
      visitor2.MethodDefinition(
        makeConstructorWithBody([{ type: 'ReturnStatement', argument: null }]),
      )
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      visitor.MethodDefinition(makeEmptyConstructorNode())
      visitor.MethodDefinition({
        type: 'MethodDefinition',
        kind: 'method',
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
        loc: makeLoc(1, 0, 1, 25),
      })
      visitor.MethodDefinition(makeEmptyConstructorNode())
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          body: { type: 'BlockStatement', body: [] },
        },
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          body: { type: 'BlockStatement', body: [] },
        },
      }
      visitor.MethodDefinition(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      visitor.MethodDefinition(makeEmptyConstructorNode())
      visitor.MethodDefinition(
        makeConstructorWithBody([{ type: 'ReturnStatement', argument: null }]),
      )
      visitor.MethodDefinition({ type: 'MethodDefinition', kind: 'method', loc: makeLoc(1, 0, 1, 10) })
      visitor.MethodDefinition(makeEmptyConstructorNode())
      visitor.MethodDefinition(
        makeConstructorWithBody([{ type: 'ExpressionStatement', expression: {} }]),
      )
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryConstructorRule.create(context)
      const visitor2 = noUnnecessaryConstructorRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryConstructorRule.meta
      const meta2 = noUnnecessaryConstructorRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          body: { type: 'BlockStatement', body: [] },
        },
        loc: makeLoc(1, 0, 1, 25),
        range: [0, 25] as [number, number],
        extra: true,
        accessibility: 'public',
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      visitor.MethodDefinition({
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          body: { type: 'BlockStatement', body: [] },
        },
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      visitor.MethodDefinition({
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          body: { type: 'BlockStatement', body: [] },
        },
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      visitor.MethodDefinition({
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          body: { type: 'BlockStatement', body: [] },
        },
        loc: makeLoc(1, 0, 1, 25),
        _parent: { type: 'ClassBody' },
      })
      expect(reports.length).toBe(1)
    })

    test('handles deeply nested constructor node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        static: false,
        computed: false,
        key: {
          type: 'Identifier',
          name: 'constructor',
          _parent: { type: 'ClassBody' },
        },
        value: {
          type: 'FunctionExpression',
          id: null,
          params: [],
          body: {
            type: 'BlockStatement',
            body: [],
            _parent: { type: 'FunctionExpression' },
          },
          _parent: { type: 'MethodDefinition' },
        },
        _parent: { type: 'ClassBody' },
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with range property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      visitor.MethodDefinition({
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          body: { type: 'BlockStatement', body: [] },
        },
        loc: makeLoc(1, 0, 1, 25),
        range: [0, 25] as [number, number],
      })
      expect(reports.length).toBe(1)
    })

    test('handles constructor with only decorators and empty body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        decorators: [{ type: 'Decorator', expression: { type: 'Identifier', name: 'inject' } }],
        value: {
          type: 'FunctionExpression',
          body: { type: 'BlockStatement', body: [] },
        },
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('MethodDefinition with kind "method" and constructor-like value does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      visitor.MethodDefinition({
        type: 'MethodDefinition',
        kind: 'method',
        key: { type: 'Identifier', name: 'constructor' },
        value: {
          type: 'FunctionExpression',
          body: { type: 'BlockStatement', body: [] },
        },
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      visitor.MethodDefinition(makeEmptyConstructorNode(10, 4, 10, 29))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(29)
    })

    test('handles node with accessibility modifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        accessibility: 'public',
        value: {
          type: 'FunctionExpression',
          body: { type: 'BlockStatement', body: [] },
        },
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with loc as undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      visitor.MethodDefinition({
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          body: { type: 'BlockStatement', body: [] },
        },
        loc: undefined,
      })
      expect(reports.length).toBe(1)
    })

    test('handles body.body as null does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConstructorRule.create(context)
      visitor.MethodDefinition({
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          body: { type: 'BlockStatement', body: null },
        },
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })
  })
})
