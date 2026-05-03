import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryReflectSetPrototypeOfSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-reflect-set-prototype-of-spread.js'
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

function makeReflectSetPrototypeOfCall(args: unknown[] = [], locStartLine = 1, locStartCol = 0, locEndLine = 1, locEndCol = 20): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'Reflect' },
      property: { type: 'Identifier', name: 'setPrototypeOf' },
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeSpreadElement(argument: unknown): unknown {
  return { type: 'SpreadElement', argument }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-reflect-set-prototype-of-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryReflectSetPrototypeOfSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryReflectSetPrototypeOfSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryReflectSetPrototypeOfSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryReflectSetPrototypeOfSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryReflectSetPrototypeOfSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning setPrototypeOf', () => {
      const desc = noUnnecessaryReflectSetPrototypeOfSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/setprototypeof/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryReflectSetPrototypeOfSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-reflect-set-prototype-of-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryReflectSetPrototypeOfSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryReflectSetPrototypeOfSpreadRule).toBeDefined()
      expect(noUnnecessaryReflectSetPrototypeOfSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryReflectSetPrototypeOfSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports unnecessary Reflect.setPrototypeOf spread', () => {
    test('reports for Reflect.setPrototypeOf(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectSetPrototypeOfCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Reflect.setPrototypeOf(...args)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectSetPrototypeOfCall([makeSpreadElement({ type: 'Identifier', name: 'args' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Reflect.setPrototypeOf(...obj.items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectSetPrototypeOfCall([makeSpreadElement({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'items' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Reflect.setPrototypeOf(...getItems())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectSetPrototypeOfCall([makeSpreadElement({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getItems' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Reflect.setPrototypeOf(...[1, 2])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectSetPrototypeOfCall([makeSpreadElement({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Reflect.setPrototypeOf(...arr) with array identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectSetPrototypeOfCall([makeSpreadElement({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions Reflect.setPrototypeOf', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectSetPrototypeOfCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toMatch(/Reflect\.setPrototypeOf/)
    })

    test('report message mentions spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectSetPrototypeOfCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toMatch(/spread/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectSetPrototypeOfCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toBe(
        'Reflect.setPrototypeOf(...items) with spread is unusual. setPrototypeOf() expects a target and prototype.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectSetPrototypeOfCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectSetPrototypeOfCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      const node = makeReflectSetPrototypeOfCall([makeSpreadElement({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectSetPrototypeOfCall([makeSpreadElement({ type: 'Identifier', name: 'items' })], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectSetPrototypeOfCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeReflectSetPrototypeOfCall([makeSpreadElement({ type: 'Identifier', name: 'args' })]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectSetPrototypeOfCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeReflectSetPrototypeOfCall([makeSpreadElement({ type: 'Identifier', name: 'args' })]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for spread of conditional expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectSetPrototypeOfCall([makeSpreadElement({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 2 } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectSetPrototypeOfCall([makeSpreadElement({ type: 'TemplateLiteral', quasis: [], expressions: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of arrow function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectSetPrototypeOfCall([makeSpreadElement({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of binary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectSetPrototypeOfCall([makeSpreadElement({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of logical expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectSetPrototypeOfCall([makeSpreadElement({ type: 'LogicalExpression', operator: '||', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of object expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectSetPrototypeOfCall([makeSpreadElement({ type: 'ObjectExpression', properties: [] })]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectSetPrototypeOfCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for spread of a function call with arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectSetPrototypeOfCall([makeSpreadElement({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of nested member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectSetPrototypeOfCall([makeSpreadElement({ type: 'MemberExpression', object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'a' }, property: { type: 'Identifier', name: 'b' } }, property: { type: 'Identifier', name: 'c' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of typeof expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectSetPrototypeOfCall([makeSpreadElement({ type: 'UnaryExpression', operator: 'typeof', prefix: true, argument: { type: 'Identifier', name: 'x' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of new expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectSetPrototypeOfCall([makeSpreadElement({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Map' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Reflect.setPrototypeOf(obj, proto) — no spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectSetPrototypeOfCall([{ type: 'Identifier', name: 'obj' }, { type: 'Identifier', name: 'proto' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.setPrototypeOf(obj, null) — two args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectSetPrototypeOfCall([{ type: 'Identifier', name: 'obj' }, { type: 'Literal', value: null }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.setPrototypeOf() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectSetPrototypeOfCall([]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.setPrototypeOf(obj) — non-spread single arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectSetPrototypeOfCall([{ type: 'Identifier', name: 'obj' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.setPrototypeOf(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'setPrototypeOf' },
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.apply(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'apply' },
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.get(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'get' },
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.set(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'set' },
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.defineProperty(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'defineProperty' },
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.deleteProperty(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'deleteProperty' },
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.getPrototypeOf(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'getPrototypeOf' },
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is MemberExpression, not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'window' }, property: { type: 'Identifier', name: 'Reflect' } },
          property: { type: 'Identifier', name: 'setPrototypeOf' },
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is computed member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Literal', value: 'setPrototypeOf' },
          computed: true,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectSetPrototypeOfCall([{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }, { type: 'Identifier', name: 'c' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Literal', value: 'setPrototypeOf' },
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'Reflect' },
          property: { type: 'Identifier', name: 'setPrototypeOf' },
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getReflect' }, arguments: [] },
          property: { type: 'Identifier', name: 'setPrototypeOf' },
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "setprototypeof" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'setprototypeof' },
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object name is "reflect" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'reflect' },
          property: { type: 'Identifier', name: 'setPrototypeOf' },
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: null,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'setPrototypeOf' },
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'setPrototypeOf' },
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument type is not SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectSetPrototypeOfCall([{ type: 'Identifier', name: 'obj' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is Literal instead of SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectSetPrototypeOfCall([{ type: 'Literal', value: 42 }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(ctx2)
      visitor1.CallExpression(makeReflectSetPrototypeOfCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor2.CallExpression(makeReflectSetPrototypeOfCall([{ type: 'Identifier', name: 'obj' }, { type: 'Identifier', name: 'proto' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectSetPrototypeOfCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeReflectSetPrototypeOfCall([{ type: 'Identifier', name: 'obj' }, { type: 'Identifier', name: 'proto' }]))
      visitor.CallExpression(makeReflectSetPrototypeOfCall([makeSpreadElement({ type: 'Identifier', name: 'args' })]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'setPrototypeOf' },
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'setPrototypeOf' },
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectSetPrototypeOfCall([{ type: 'Identifier', name: 'obj' }, { type: 'Identifier', name: 'proto' }]))
      visitor.CallExpression(makeReflectSetPrototypeOfCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'setPrototypeOf' },
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      visitor.CallExpression(makeReflectSetPrototypeOfCall([makeSpreadElement({ type: 'Identifier', name: 'args' })]))
      visitor.CallExpression(makeReflectSetPrototypeOfCall([]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      const visitor2 = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryReflectSetPrototypeOfSpreadRule.meta
      const meta2 = noUnnecessaryReflectSetPrototypeOfSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'setPrototypeOf' },
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'setPrototypeOf' },
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'setPrototypeOf' },
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
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      const node = makeReflectSetPrototypeOfCall([makeSpreadElement({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryReflectSetPrototypeOfSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryReflectSetPrototypeOfSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryReflectSetPrototypeOfSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'setPrototypeOf' },
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectSetPrototypeOfCall([makeSpreadElement({ type: 'Identifier', name: 'items' })], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles computed member expression with false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'setPrototypeOf' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectSetPrototypeOfCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeReflectSetPrototypeOfCall([makeSpreadElement({ type: 'Identifier', name: 'args' })]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('does not report for Reflect.setPrototypeOf with SpreadElement plus extra args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectSetPrototypeOfCall([makeSpreadElement({ type: 'Identifier', name: 'items' }), { type: 'Identifier', name: 'extra' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.setPrototypeOf with SpreadElement as second arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectSetPrototypeOfCall([{ type: 'Identifier', name: 'obj' }, makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('handles SpreadElement with missing argument property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectSetPrototypeOfCall([{ type: 'SpreadElement' }]))
      expect(reports.length).toBe(1)
    })

  })
})
