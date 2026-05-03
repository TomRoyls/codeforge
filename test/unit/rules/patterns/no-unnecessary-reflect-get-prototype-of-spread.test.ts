import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryReflectGetPrototypeOfSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-reflect-get-prototype-of-spread.js'
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

function makeReflectGetPrototypeOfCall(
  arg: unknown,
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
      property: { type: 'Identifier', name: 'getPrototypeOf' },
      computed: false,
    },
    arguments: [arg],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeSpreadElement(argument: unknown): unknown {
  return { type: 'SpreadElement', argument }
}

function makeIdentifier(name: string): unknown {
  return { type: 'Identifier', name }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-reflect-get-prototype-of-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryReflectGetPrototypeOfSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryReflectGetPrototypeOfSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryReflectGetPrototypeOfSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryReflectGetPrototypeOfSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryReflectGetPrototypeOfSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning getPrototypeOf', () => {
      const desc = noUnnecessaryReflectGetPrototypeOfSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/getprototypeof/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryReflectGetPrototypeOfSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-reflect-get-prototype-of-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryReflectGetPrototypeOfSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryReflectGetPrototypeOfSpreadRule).toBeDefined()
      expect(noUnnecessaryReflectGetPrototypeOfSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryReflectGetPrototypeOfSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports Reflect.getPrototypeOf(...spread)', () => {
    test('reports Reflect.getPrototypeOf(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectGetPrototypeOfCall(makeSpreadElement(makeIdentifier('items'))))
      expect(reports.length).toBe(1)
    })

    test('reports Reflect.getPrototypeOf(...arr)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectGetPrototypeOfCall(makeSpreadElement(makeIdentifier('arr'))))
      expect(reports.length).toBe(1)
    })

    test('reports Reflect.getPrototypeOf(...args)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectGetPrototypeOfCall(makeSpreadElement(makeIdentifier('args'))))
      expect(reports.length).toBe(1)
    })

    test('reports Reflect.getPrototypeOf(...[1, 2, 3]) — spread array literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectGetPrototypeOfCall(makeSpreadElement({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }] })))
      expect(reports.length).toBe(1)
    })

    test('reports Reflect.getPrototypeOf(...obj.items) — spread member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectGetPrototypeOfCall(makeSpreadElement({ type: 'MemberExpression', object: makeIdentifier('obj'), property: makeIdentifier('items') })))
      expect(reports.length).toBe(1)
    })

    test('reports Reflect.getPrototypeOf(...getItems()) — spread call expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectGetPrototypeOfCall(makeSpreadElement({ type: 'CallExpression', callee: makeIdentifier('getItems'), arguments: [] })))
      expect(reports.length).toBe(1)
    })

    test('report message mentions spread and getPrototypeOf', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectGetPrototypeOfCall(makeSpreadElement(makeIdentifier('items'))))
      expect(reports[0].message).toMatch(/getPrototypeOf/)
      expect(reports[0].message).toMatch(/spread/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectGetPrototypeOfCall(makeSpreadElement(makeIdentifier('items'))))
      expect(reports[0].message).toBe(
        'Reflect.getPrototypeOf(...items) with spread is unusual. getPrototypeOf() expects a single target.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectGetPrototypeOfCall(makeSpreadElement(makeIdentifier('items'))))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectGetPrototypeOfCall(makeSpreadElement(makeIdentifier('items'))))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      const node = makeReflectGetPrototypeOfCall(makeSpreadElement(makeIdentifier('items')))
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectGetPrototypeOfCall(makeSpreadElement(makeIdentifier('items')), 5, 10, 5, 40))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectGetPrototypeOfCall(makeSpreadElement(makeIdentifier('items'))))
      visitor.CallExpression(makeReflectGetPrototypeOfCall(makeSpreadElement(makeIdentifier('arr'))))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectGetPrototypeOfCall(makeSpreadElement(makeIdentifier('items'))))
      visitor.CallExpression(makeReflectGetPrototypeOfCall(makeSpreadElement(makeIdentifier('arr'))))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports Reflect.getPrototypeOf(...x) with single-letter identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectGetPrototypeOfCall(makeSpreadElement(makeIdentifier('x'))))
      expect(reports.length).toBe(1)
    })

    test('reports Reflect.getPrototypeOf(...list) with another identifier name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectGetPrototypeOfCall(makeSpreadElement(makeIdentifier('list'))))
      expect(reports.length).toBe(1)
    })

    test('reports Reflect.getPrototypeOf(...targets) with plural identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectGetPrototypeOfCall(makeSpreadElement(makeIdentifier('targets'))))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectGetPrototypeOfCall(makeSpreadElement(makeIdentifier('items'))))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports Reflect.getPrototypeOf(...rest) with SpreadElement argument being an identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectGetPrototypeOfCall(makeSpreadElement(makeIdentifier('rest'))))
      expect(reports.length).toBe(1)
    })

    test('reports when SpreadElement argument is a BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectGetPrototypeOfCall(makeSpreadElement({ type: 'BinaryExpression', operator: '+', left: makeIdentifier('a'), right: makeIdentifier('b') })))
      expect(reports.length).toBe(1)
    })

    test('reports when SpreadElement argument is a ConditionalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectGetPrototypeOfCall(makeSpreadElement({ type: 'ConditionalExpression', test: makeIdentifier('x'), consequent: makeIdentifier('a'), alternate: makeIdentifier('b') })))
      expect(reports.length).toBe(1)
    })

    test('reports when SpreadElement argument is a TemplateLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectGetPrototypeOfCall(makeSpreadElement({ type: 'TemplateLiteral', quasis: [], expressions: [] })))
      expect(reports.length).toBe(1)
    })

    test('reports when SpreadElement argument is a logical expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectGetPrototypeOfCall(makeSpreadElement({ type: 'LogicalExpression', operator: '||', left: makeIdentifier('a'), right: makeIdentifier('b') })))
      expect(reports.length).toBe(1)
    })

    test('reports when SpreadElement argument is a NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectGetPrototypeOfCall(makeSpreadElement({ type: 'NewExpression', callee: makeIdentifier('Set'), arguments: [] })))
      expect(reports.length).toBe(1)
    })

    test('reports when SpreadElement argument is an AwaitExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectGetPrototypeOfCall(makeSpreadElement({ type: 'AwaitExpression', argument: makeIdentifier('promise') })))
      expect(reports.length).toBe(1)
    })

    test('reports when SpreadElement argument is a YieldExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectGetPrototypeOfCall(makeSpreadElement({ type: 'YieldExpression', argument: makeIdentifier('value') })))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Reflect.getPrototypeOf(obj) — non-spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectGetPrototypeOfCall(makeIdentifier('obj')))
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.getPrototypeOf(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectGetPrototypeOfCall({ type: 'Literal', value: null }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.getPrototypeOf({}) — ObjectExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectGetPrototypeOfCall({ type: 'ObjectExpression', properties: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.getPrototypeOf(arr) — identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectGetPrototypeOfCall(makeIdentifier('arr')))
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.setPrototypeOf(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'setPrototypeOf' },
          computed: false,
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.apply(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'apply' },
          computed: false,
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.get(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'get' },
          computed: false,
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.ownKeys(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'ownKeys' },
          computed: false,
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.getPrototypeOf(...items) — wrong object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'getPrototypeOf' },
          computed: false,
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for proxy.getPrototypeOf(...items) — non-Reflect object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'proxy' },
          property: { type: 'Identifier', name: 'getPrototypeOf' },
          computed: false,
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeSpreadElement(makeIdentifier('items'))], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [makeSpreadElement(makeIdentifier('items'))], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'CallExpression', callee: makeIdentifier('getReflect'), arguments: [] },
          property: { type: 'Identifier', name: 'getPrototypeOf' },
          computed: false,
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object name is "reflect" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'reflect' },
          property: { type: 'Identifier', name: 'getPrototypeOf' },
          computed: false,
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object name is "REFLECT" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'REFLECT' },
          property: { type: 'Identifier', name: 'getPrototypeOf' },
          computed: false,
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Literal', value: 'getPrototypeOf' },
          computed: true,
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property name is "GetPrototypeOf" (PascalCase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'GetPrototypeOf' },
          computed: false,
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property name is "getprototypeof" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'getprototypeof' },
          computed: false,
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when computed is true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'getPrototypeOf' },
          computed: true,
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when there are 0 arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'getPrototypeOf' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when there are 2 arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'getPrototypeOf' },
          computed: false,
        },
        arguments: [makeSpreadElement(makeIdentifier('items')), makeIdentifier('extra')],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when there are 3 arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'getPrototypeOf' },
          computed: false,
        },
        arguments: [makeSpreadElement(makeIdentifier('a')), makeIdentifier('b'), makeIdentifier('c')],
        loc: makeLoc(1, 0, 1, 50),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'getPrototypeOf' },
          computed: false,
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'getPrototypeOf' },
          computed: false,
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          computed: false,
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: null,
          computed: false,
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is not a SpreadElement (Literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectGetPrototypeOfCall({ type: 'Literal', value: 42 }))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is not a SpreadElement (ArrayExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectGetPrototypeOfCall({ type: 'ArrayExpression', elements: [] }))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(ctx2)
      visitor1.CallExpression(makeReflectGetPrototypeOfCall(makeSpreadElement(makeIdentifier('items'))))
      visitor2.CallExpression(makeReflectGetPrototypeOfCall(makeIdentifier('obj')))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectGetPrototypeOfCall(makeSpreadElement(makeIdentifier('items'))))
      visitor.CallExpression(makeReflectGetPrototypeOfCall(makeIdentifier('obj')))
      visitor.CallExpression(makeReflectGetPrototypeOfCall(makeSpreadElement(makeIdentifier('arr'))))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'getPrototypeOf' },
          computed: false,
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'getPrototypeOf' },
          computed: false,
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectGetPrototypeOfCall(makeIdentifier('obj')))
      visitor.CallExpression(makeReflectGetPrototypeOfCall(makeSpreadElement(makeIdentifier('items'))))
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'getPrototypeOf' },
          computed: false,
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: makeLoc(1, 0, 1, 40),
      })
      visitor.CallExpression(makeReflectGetPrototypeOfCall(makeSpreadElement(makeIdentifier('arr'))))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      const visitor2 = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryReflectGetPrototypeOfSpreadRule.meta
      const meta2 = noUnnecessaryReflectGetPrototypeOfSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'getPrototypeOf' },
          computed: false,
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: makeLoc(1, 0, 1, 40),
        range: [0, 40],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'getPrototypeOf' },
          computed: false,
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'getPrototypeOf' },
          computed: false,
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      const node = makeReflectGetPrototypeOfCall(makeSpreadElement(makeIdentifier('items')))
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryReflectGetPrototypeOfSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryReflectGetPrototypeOfSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryReflectGetPrototypeOfSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'getPrototypeOf' },
          computed: false,
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: makeLoc(1, 0, 1, 40),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectGetPrototypeOfCall(makeSpreadElement(makeIdentifier('items')), 10, 4, 10, 45))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(45)
    })

    test('handles computed member expression with non-computed false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectGetPrototypeOfCall(makeSpreadElement(makeIdentifier('items'))))
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Literal', value: 'getPrototypeOf' },
          computed: true,
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: makeLoc(1, 0, 1, 50),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeReflectGetPrototypeOfCall(makeSpreadElement(makeIdentifier('items'))))
      visitor.CallExpression(makeReflectGetPrototypeOfCall(makeSpreadElement(makeIdentifier('arr'))))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('does not report when arguments array is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'getPrototypeOf' },
          computed: false,
        },
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'getPrototypeOf' },
          computed: false,
        },
        arguments: null,
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })
  })
})
