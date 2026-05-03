import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryReflectConstructSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-reflect-construct-spread.js'
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
    getSource: () => '[]',
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

function makeReflectConstructNode(
  args: unknown[],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 30,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'Reflect' },
      property: { type: 'Identifier', name: 'construct' },
      computed: false,
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeSpreadElement(argument: unknown): unknown {
  return { type: 'SpreadElement', argument }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-reflect-construct-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryReflectConstructSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryReflectConstructSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryReflectConstructSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryReflectConstructSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryReflectConstructSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Reflect', () => {
      const desc = noUnnecessaryReflectConstructSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/reflect/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryReflectConstructSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-reflect-construct-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryReflectConstructSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryReflectConstructSpreadRule).toBeDefined()
      expect(noUnnecessaryReflectConstructSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryReflectConstructSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports Reflect.construct with spread', () => {
    test('reports for Reflect.construct(...items) with spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression(makeReflectConstructNode([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Reflect.construct(...args) with identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression(makeReflectConstructNode([makeSpreadElement({ type: 'Identifier', name: 'args' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Reflect.construct(...arr) with member expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression(makeReflectConstructNode([makeSpreadElement({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'arr' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Reflect.construct(...getArgs()) with call expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression(makeReflectConstructNode([makeSpreadElement({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getArgs' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Reflect.construct(...[1,2,3]) with array expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression(makeReflectConstructNode([makeSpreadElement({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }] })]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions Reflect.construct', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression(makeReflectConstructNode([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toMatch(/Reflect\.construct/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression(makeReflectConstructNode([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toBe(
        'Reflect.construct(...items) with spread is unusual. construct() expects a target and arguments array.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression(makeReflectConstructNode([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression(makeReflectConstructNode([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      const node = makeReflectConstructNode([makeSpreadElement({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression(makeReflectConstructNode([makeSpreadElement({ type: 'Identifier', name: 'items' })], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression(makeReflectConstructNode([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeReflectConstructNode([makeSpreadElement({ type: 'Identifier', name: 'args' })]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression(makeReflectConstructNode([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeReflectConstructNode([makeSpreadElement({ type: 'Identifier', name: 'args' })]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports with SpreadElement containing conditional expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression(makeReflectConstructNode([makeSpreadElement({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'cond' }, consequent: { type: 'ArrayExpression', elements: [] }, alternate: { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] } })]))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement containing binary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression(makeReflectConstructNode([makeSpreadElement({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement containing template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression(makeReflectConstructNode([makeSpreadElement({ type: 'TemplateLiteral', quasis: [], expressions: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement containing arrow function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression(makeReflectConstructNode([makeSpreadElement({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } })]))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement containing object expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression(makeReflectConstructNode([makeSpreadElement({ type: 'ObjectExpression', properties: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement containing logical expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression(makeReflectConstructNode([makeSpreadElement({ type: 'LogicalExpression', operator: '||', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement containing new expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression(makeReflectConstructNode([makeSpreadElement({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Map' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement containing literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression(makeReflectConstructNode([makeSpreadElement({ type: 'Literal', value: 42 })]))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement containing function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression(makeReflectConstructNode([makeSpreadElement({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } })]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression(makeReflectConstructNode([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports with SpreadElement containing unary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression(makeReflectConstructNode([makeSpreadElement({ type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement containing await expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression(makeReflectConstructNode([makeSpreadElement({ type: 'AwaitExpression', argument: { type: 'Identifier', name: 'promise' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement containing yield expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression(makeReflectConstructNode([makeSpreadElement({ type: 'YieldExpression', argument: { type: 'Identifier', name: 'value' } })]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Reflect.construct with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression(makeReflectConstructNode([]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.construct with two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression(makeReflectConstructNode([{ type: 'Identifier', name: 'Target' }, { type: 'ArrayExpression', elements: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.construct with three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression(makeReflectConstructNode([{ type: 'Identifier', name: 'Target' }, { type: 'ArrayExpression', elements: [] }, { type: 'Identifier', name: 'NewTarget' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.construct with single regular identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression(makeReflectConstructNode([{ type: 'Identifier', name: 'items' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.construct with single regular literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression(makeReflectConstructNode([{ type: 'Literal', value: 'target' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.apply(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'apply' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.get(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'get' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.set(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'set' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.defineProperty(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'defineProperty' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.deleteProperty(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'deleteProperty' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.has(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'has' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.ownKeys(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'ownKeys' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.construct(...items) — wrong object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'construct' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 30) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 30) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 30) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is computed', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'construct' },
          computed: true,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'global' }, property: { type: 'Identifier', name: 'Reflect' } },
          property: { type: 'Identifier', name: 'construct' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getReflect' }, arguments: [] },
          property: { type: 'Identifier', name: 'construct' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'Reflect' },
          property: { type: 'Identifier', name: 'construct' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Literal', value: 'construct' },
          computed: true,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when object name is "reflect" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'reflect' },
          property: { type: 'Identifier', name: 'construct' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Construct" (capitalized)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'Construct' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'construct' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'construct' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: null,
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.construct(target, ...args) — 2 args with spread as second', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression(makeReflectConstructNode([{ type: 'Identifier', name: 'Target' }, makeSpreadElement({ type: 'Identifier', name: 'args' })]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryReflectConstructSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryReflectConstructSpreadRule.create(ctx2)
      visitor1.CallExpression(makeReflectConstructNode([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor2.CallExpression(makeReflectConstructNode([{ type: 'Identifier', name: 'Target' }, { type: 'ArrayExpression', elements: [] }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression(makeReflectConstructNode([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeReflectConstructNode([{ type: 'Identifier', name: 'Target' }, { type: 'ArrayExpression', elements: [] }]))
      visitor.CallExpression(makeReflectConstructNode([makeSpreadElement({ type: 'Identifier', name: 'args' })]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'construct' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'construct' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression(makeReflectConstructNode([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeReflectConstructNode([]))
      visitor.CallExpression(makeReflectConstructNode([{ type: 'Identifier', name: 'Target' }]))
      visitor.CallExpression(makeReflectConstructNode([makeSpreadElement({ type: 'Identifier', name: 'args' })]))
      visitor.CallExpression(makeReflectConstructNode([{ type: 'Identifier', name: 'Target' }, { type: 'ArrayExpression', elements: [] }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryReflectConstructSpreadRule.create(context)
      const visitor2 = noUnnecessaryReflectConstructSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryReflectConstructSpreadRule.meta
      const meta2 = noUnnecessaryReflectConstructSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'construct' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
        range: [0, 30],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'construct' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'construct' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      const node = makeReflectConstructNode([makeSpreadElement({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryReflectConstructSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryReflectConstructSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryReflectConstructSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'construct' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression(makeReflectConstructNode([makeSpreadElement({ type: 'Identifier', name: 'items' })], 10, 4, 10, 35))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(35)
    })

    test('handles computed member expression property (non-computed) — reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'construct' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Literal', value: 'construct' },
          computed: true,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression(makeReflectConstructNode([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeReflectConstructNode([makeSpreadElement({ type: 'Identifier', name: 'args' })]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('handles SpreadElement with complex nested expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression(makeReflectConstructNode([makeSpreadElement({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'utils' },
          property: { type: 'Identifier', name: 'flatten' },
        },
        arguments: [{ type: 'Identifier', name: 'deepArray' }],
      })]))
      expect(reports.length).toBe(1)
    })

    test('handles arguments array with null first element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectConstructSpreadRule.create(context)
      visitor.CallExpression(makeReflectConstructNode([null]))
      expect(reports.length).toBe(0)
    })

  })
})
