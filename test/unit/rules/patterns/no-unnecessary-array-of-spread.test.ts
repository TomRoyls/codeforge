import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryArrayOfSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-array-of-spread.js'
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

function makeSpreadArg(argumentName: string): unknown {
  return { type: 'SpreadElement', argument: { type: 'Identifier', name: argumentName } }
}

function makeArrayOfSpreadNode(
  objectName: string,
  methodName: string,
  args: unknown[] = [],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
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
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeIdentNode(name: string): unknown {
  return { type: 'Identifier', name }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-array-of-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryArrayOfSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryArrayOfSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryArrayOfSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryArrayOfSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryArrayOfSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Array.of', () => {
      const desc = noUnnecessaryArrayOfSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/array\.of/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryArrayOfSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-array-of-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryArrayOfSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryArrayOfSpreadRule).toBeDefined()
      expect(noUnnecessaryArrayOfSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryArrayOfSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (28) =====

  describe('positive cases — reports unnecessary Array.of(...spread)', () => {
    test('reports for Array.of(...arr)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression(makeArrayOfSpreadNode('Array', 'of', [makeSpreadArg('arr')]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.of(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression(makeArrayOfSpreadNode('Array', 'of', [makeSpreadArg('items')]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.of(...data)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression(makeArrayOfSpreadNode('Array', 'of', [makeSpreadArg('data')]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.of(...result)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression(makeArrayOfSpreadNode('Array', 'of', [makeSpreadArg('result')]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.of(...list)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression(makeArrayOfSpreadNode('Array', 'of', [makeSpreadArg('list')]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.of(...args) where spread argument is short name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression(makeArrayOfSpreadNode('Array', 'of', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'x' } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.of(...values) where spread argument is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression(makeArrayOfSpreadNode('Array', 'of', [{ type: 'SpreadElement', argument: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'vals' } } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.of(...foo) where spread argument is CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression(makeArrayOfSpreadNode('Array', 'of', [{ type: 'SpreadElement', argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getItems' }, arguments: [] } }]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions Array.of and spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression(makeArrayOfSpreadNode('Array', 'of', [makeSpreadArg('arr')]))
      expect(reports[0].message).toMatch(/Array\.of/)
      expect(reports[0].message).toMatch(/spread/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression(makeArrayOfSpreadNode('Array', 'of', [makeSpreadArg('arr')]))
      expect(reports[0].message).toBe(
        'Array.of(...items) with spread can be simplified to [...items].',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression(makeArrayOfSpreadNode('Array', 'of', [makeSpreadArg('arr')]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression(makeArrayOfSpreadNode('Array', 'of', [makeSpreadArg('arr')]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      const node = makeArrayOfSpreadNode('Array', 'of', [makeSpreadArg('arr')])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression(makeArrayOfSpreadNode('Array', 'of', [makeSpreadArg('arr')], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression(makeArrayOfSpreadNode('Array', 'of', [makeSpreadArg('arr1')]))
      visitor.CallExpression(makeArrayOfSpreadNode('Array', 'of', [makeSpreadArg('arr2')]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression(makeArrayOfSpreadNode('Array', 'of', [makeSpreadArg('arr1')]))
      visitor.CallExpression(makeArrayOfSpreadNode('Array', 'of', [makeSpreadArg('arr2')]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression(makeArrayOfSpreadNode('Array', 'of', [makeSpreadArg('arr')]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for Array.of(...nested) with nested spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression(makeArrayOfSpreadNode('Array', 'of', [{
        type: 'SpreadElement',
        argument: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'method' },
          },
          arguments: [],
        },
      }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.of(...arr) with spread of ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression(makeArrayOfSpreadNode('Array', 'of', [{
        type: 'SpreadElement',
        argument: { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }] },
      }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.of(...mySet) with spread argument name mySet', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression(makeArrayOfSpreadNode('Array', 'of', [makeSpreadArg('mySet')]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.of(...gen) with spread argument of yield expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression(makeArrayOfSpreadNode('Array', 'of', [{
        type: 'SpreadElement',
        argument: { type: 'YieldExpression', argument: null },
      }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.of(...mapped) where spread argument is a MapExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression(makeArrayOfSpreadNode('Array', 'of', [{
        type: 'SpreadElement',
        argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'Array' }, arguments: [] },
      }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.of(...input) where spread argument name is input', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression(makeArrayOfSpreadNode('Array', 'of', [makeSpreadArg('input')]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.of(...output) where spread argument name is output', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression(makeArrayOfSpreadNode('Array', 'of', [makeSpreadArg('output')]))
      expect(reports.length).toBe(1)
    })

    test('report loc end values are preserved', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression(makeArrayOfSpreadNode('Array', 'of', [makeSpreadArg('arr')], 3, 5, 3, 25))
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports for Array.of(...sequence)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression(makeArrayOfSpreadNode('Array', 'of', [makeSpreadArg('sequence')]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.of(...elements) with SpreadElement having TemplateLiteral argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression(makeArrayOfSpreadNode('Array', 'of', [{
        type: 'SpreadElement',
        argument: { type: 'TemplateLiteral', quasis: [], expressions: [] },
      }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.of(...conditional) with SpreadElement having ConditionalExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression(makeArrayOfSpreadNode('Array', 'of', [{
        type: 'SpreadElement',
        argument: {
          type: 'ConditionalExpression',
          test: { type: 'Identifier', name: 'flag' },
          consequent: { type: 'Identifier', name: 'a' },
          alternate: { type: 'Identifier', name: 'b' },
        },
      }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.of(...iterable) with spread of Identifier named iterable', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression(makeArrayOfSpreadNode('Array', 'of', [makeSpreadArg('iterable')]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Array.of(1, 2, 3) — multiple non-spread args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression(makeArrayOfSpreadNode('Array', 'of', [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.of(1) — single non-spread arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression(makeArrayOfSpreadNode('Array', 'of', [{ type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.of() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression(makeArrayOfSpreadNode('Array', 'of', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.from(...arr) — different method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression(makeArrayOfSpreadNode('Array', 'from', [makeSpreadArg('arr')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for MyArray.of(...arr) — not Array identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression(makeArrayOfSpreadNode('MyArray', 'of', [makeSpreadArg('arr')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for myObj.of(...arr) — non-Array object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression(makeArrayOfSpreadNode('myObj', 'of', [makeSpreadArg('arr')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.of(...items) — variable callee object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression(makeArrayOfSpreadNode('arr', 'of', [makeSpreadArg('items')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.isArray(...arr) — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression(makeArrayOfSpreadNode('Array', 'isArray', [makeSpreadArg('arr')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.of(...arr, extra) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression(makeArrayOfSpreadNode('Array', 'of', [makeSpreadArg('arr'), { type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.of(...arr1, ...arr2) — two spread arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression(makeArrayOfSpreadNode('Array', 'of', [makeSpreadArg('arr1'), makeSpreadArg('arr2')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeSpreadArg('arr')], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeSpreadArg('arr')], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [makeSpreadArg('arr')], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentNode('Array'),
          property: { type: 'Literal', value: 'of' },
          computed: false,
        },
        arguments: [makeSpreadArg('arr')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "from"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression(makeArrayOfSpreadNode('Array', 'from', [makeSpreadArg('arr')]))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'window' }, property: { type: 'Identifier', name: 'Array' } },
          property: { type: 'Identifier', name: 'of' },
          computed: false,
        },
        arguments: [makeSpreadArg('arr')],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression(makeArrayOfSpreadNode(
        'getArray',
        'of',
        [makeSpreadArg('arr')],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report when object type is Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'Array' },
          property: { type: 'Identifier', name: 'of' },
          computed: false,
        },
        arguments: [makeSpreadArg('arr')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object name is "array" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression(makeArrayOfSpreadNode('array', 'of', [makeSpreadArg('arr')]))
      expect(reports.length).toBe(0)
    })

    test('does not report when object name is "ARRAY" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression(makeArrayOfSpreadNode('ARRAY', 'of', [makeSpreadArg('arr')]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Of" (capitalized)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression(makeArrayOfSpreadNode('Array', 'Of', [makeSpreadArg('arr')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentNode('Array'),
          computed: false,
        },
        arguments: [makeSpreadArg('arr')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentNode('Array'),
          property: null,
          computed: false,
        },
        arguments: [makeSpreadArg('arr')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'of' },
          computed: false,
        },
        arguments: [makeSpreadArg('arr')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'of' },
          computed: false,
        },
        arguments: [makeSpreadArg('arr')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.of("hello") — single string literal arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression(makeArrayOfSpreadNode('Array', 'of', [{ type: 'Literal', value: 'hello' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.of(x) — single Identifier arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression(makeArrayOfSpreadNode('Array', 'of', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee has computed property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentNode('Array'),
          property: { type: 'Identifier', name: 'of' },
          computed: true,
        },
        arguments: [makeSpreadArg('arr')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.of(...arr) where arguments is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentNode('Array'),
          property: { type: 'Identifier', name: 'of' },
          computed: false,
        },
        arguments: 'not-array',
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (17) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryArrayOfSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryArrayOfSpreadRule.create(ctx2)
      visitor1.CallExpression(makeArrayOfSpreadNode('Array', 'of', [makeSpreadArg('arr')]))
      visitor2.CallExpression(makeArrayOfSpreadNode('Array', 'of', [{ type: 'Literal', value: 1 }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression(makeArrayOfSpreadNode('Array', 'of', [makeSpreadArg('arr')]))
      visitor.CallExpression(makeArrayOfSpreadNode('Array', 'of', [{ type: 'Literal', value: 1 }]))
      visitor.CallExpression(makeArrayOfSpreadNode('Array', 'of', [makeSpreadArg('items')]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentNode('Array'),
          property: { type: 'Identifier', name: 'of' },
          computed: false,
        },
        arguments: [makeSpreadArg('arr')],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentNode('Array'),
          property: { type: 'Identifier', name: 'of' },
          computed: false,
        },
        arguments: [makeSpreadArg('arr')],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression(makeArrayOfSpreadNode('Array', 'of', [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]))
      visitor.CallExpression(makeArrayOfSpreadNode('Array', 'of', [makeSpreadArg('arr')]))
      visitor.CallExpression(makeArrayOfSpreadNode('MyArray', 'of', [makeSpreadArg('arr')]))
      visitor.CallExpression(makeArrayOfSpreadNode('Array', 'from', [makeSpreadArg('arr')]))
      visitor.CallExpression(makeArrayOfSpreadNode('Array', 'of', [makeSpreadArg('items')]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryArrayOfSpreadRule.create(context)
      const visitor2 = noUnnecessaryArrayOfSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryArrayOfSpreadRule.meta
      const meta2 = noUnnecessaryArrayOfSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentNode('Array'),
          property: { type: 'Identifier', name: 'of' },
          computed: false,
        },
        arguments: [makeSpreadArg('arr')],
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
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentNode('Array'),
          property: { type: 'Identifier', name: 'of' },
          computed: false,
        },
        arguments: [makeSpreadArg('arr')],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentNode('Array'),
          property: { type: 'Identifier', name: 'of' },
          computed: false,
        },
        arguments: [makeSpreadArg('arr')],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      const node = makeArrayOfSpreadNode('Array', 'of', [makeSpreadArg('arr')])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryArrayOfSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryArrayOfSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryArrayOfSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentNode('Array'),
          property: { type: 'Identifier', name: 'of' },
          computed: false,
        },
        arguments: [makeSpreadArg('arr')],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression(makeArrayOfSpreadNode('Array', 'of', [makeSpreadArg('arr')], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles non-computed member expression (reports)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression(makeArrayOfSpreadNode('Array', 'of', [makeSpreadArg('arr')]))
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with bracket notation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentNode('Array'),
          property: { type: 'Literal', value: 'of' },
          computed: true,
        },
        arguments: [makeSpreadArg('arr')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSpreadRule.create(context)
      visitor.CallExpression(makeArrayOfSpreadNode('Array', 'of', [makeSpreadArg('arr1')]))
      visitor.CallExpression(makeArrayOfSpreadNode('Array', 'of', [makeSpreadArg('arr2')]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})
