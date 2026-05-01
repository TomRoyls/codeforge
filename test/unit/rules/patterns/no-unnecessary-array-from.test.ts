import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryArrayFromRule } from '../../../../src/rules/patterns/no-unnecessary-array-from.js'
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
    getSource: () => 'Array.from([1])',
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

function makeArrayFromCall(
  elements: unknown[],
  loc = makeLoc(1, 0, 1, 10),
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'Array' },
      property: { type: 'Identifier', name: 'from' },
    },
    arguments: [{ type: 'ArrayExpression', elements }],
    loc,
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-array-from rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryArrayFromRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryArrayFromRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryArrayFromRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryArrayFromRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryArrayFromRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Array.from', () => {
      const desc = noUnnecessaryArrayFromRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/array\.from/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryArrayFromRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-array-from',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryArrayFromRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryArrayFromRule).toBeDefined()
      expect(noUnnecessaryArrayFromRule.meta).toBeDefined()
      expect(noUnnecessaryArrayFromRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS UNNECESSARY ARRAY.FROM (25) =====

  describe('positive cases — reports unnecessary Array.from', () => {
    test('reports for Array.from([1])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression(makeArrayFromCall([{ type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from([])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression(makeArrayFromCall([]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from([1, 2, 3])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression(makeArrayFromCall([
        { type: 'Literal', value: 1 },
        { type: 'Literal', value: 2 },
        { type: 'Literal', value: 3 },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from(["a"])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression(makeArrayFromCall([{ type: 'Literal', value: 'a' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from([true, false])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression(makeArrayFromCall([
        { type: 'Literal', value: true },
        { type: 'Literal', value: false },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from([null])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression(makeArrayFromCall([{ type: 'Literal', value: null }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from([{ type: "ObjectExpression", properties: [] }])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression(makeArrayFromCall([{ type: 'ObjectExpression', properties: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from([{ type: "Identifier", name: "x" }])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression(makeArrayFromCall([{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from with spread element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression(makeArrayFromCall([{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from with many elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      const elements = Array.from({ length: 50 }, (_, i) => ({ type: 'Literal', value: i }))
      visitor.CallExpression(makeArrayFromCall(elements))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from with nested array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression(makeArrayFromCall([{ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from with function expression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression(makeArrayFromCall([{ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from with arrow function element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression(makeArrayFromCall([{ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] }, expression: false }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from with call expression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression(makeArrayFromCall([{ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from with member expression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression(makeArrayFromCall([{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from with binary expression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression(makeArrayFromCall([{ type: 'BinaryExpression', operator: '+', left: { type: 'Literal', value: 1 }, right: { type: 'Literal', value: 2 } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from with conditional expression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression(makeArrayFromCall([{ type: 'ConditionalExpression', test: { type: 'Literal', value: true }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 2 } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from with template literal element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression(makeArrayFromCall([{ type: 'TemplateLiteral', quasis: [], expressions: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from with unary expression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression(makeArrayFromCall([{ type: 'UnaryExpression', operator: '-', prefix: true, argument: { type: 'Literal', value: 1 } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from with mixed literal types', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression(makeArrayFromCall([
        { type: 'Literal', value: 1 },
        { type: 'Literal', value: 'hello' },
        { type: 'Literal', value: true },
        { type: 'Literal', value: null },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from with single string element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression(makeArrayFromCall([{ type: 'Literal', value: 'test' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from with regex literal element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression(makeArrayFromCall([{ type: 'Literal', value: {}, regex: { pattern: 'abc', flags: '' } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from with undefined element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression(makeArrayFromCall([{ type: 'Identifier', name: 'undefined' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from with new expression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression(makeArrayFromCall([{ type: 'NewExpression', callee: { type: 'Identifier', name: 'Map' }, arguments: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from with logical expression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression(makeArrayFromCall([{ type: 'LogicalExpression', operator: '&&', left: { type: 'Literal', value: true }, right: { type: 'Literal', value: false } }]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report message mentions "Unnecessary"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression(makeArrayFromCall([{ type: 'Literal', value: 1 }]))
      expect(reports[0].message).toContain('Unnecessary')
    })

    test('report message mentions "Array.from()"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression(makeArrayFromCall([{ type: 'Literal', value: 1 }]))
      expect(reports[0].message).toContain('Array.from()')
    })

    test('report message mentions "array literal"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression(makeArrayFromCall([{ type: 'Literal', value: 1 }]))
      expect(reports[0].message.toLowerCase()).toContain('array literal')
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression(makeArrayFromCall([{ type: 'Literal', value: 1 }]))
      expect(reports[0].message).toBe(
        'Unnecessary Array.from() on an array literal.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression(makeArrayFromCall([{ type: 'Literal', value: 1 }]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression(makeArrayFromCall([{ type: 'Literal', value: 1 }]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      const node = makeArrayFromCall([{ type: 'Literal', value: 1 }])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      const node = makeArrayFromCall([{ type: 'Literal', value: 1 }], makeLoc(5, 10, 5, 30))
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report loc end values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      const node = makeArrayFromCall([{ type: 'Literal', value: 1 }], makeLoc(3, 0, 7, 15))
      visitor.CallExpression(node)
      expect(reports[0].loc?.end.line).toBe(7)
      expect(reports[0].loc?.end.column).toBe(15)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression(makeArrayFromCall([{ type: 'Literal', value: 1 }]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression(makeArrayFromCall([{ type: 'Literal', value: 1 }]))
      visitor.CallExpression(makeArrayFromCall([{ type: 'Literal', value: 2 }]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression(makeArrayFromCall([{ type: 'Literal', value: 1 }]))
      visitor.CallExpression(makeArrayFromCall([]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports only once per call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression(makeArrayFromCall([{ type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(1)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      const node = makeArrayFromCall([{ type: 'Literal', value: 1 }])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression(makeArrayFromCall([{ type: 'Literal', value: 1 }]))
      visitor.CallExpression(makeArrayFromCall([{ type: 'Literal', value: 'a' }]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Array.from("string")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [{ type: 'Literal', value: 'hello' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.from(setInstance)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [{ type: 'Identifier', name: 'mySet' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.from(mapInstance)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [{ type: 'Identifier', name: 'myMap' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.from(arguments)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [{ type: 'Identifier', name: 'arguments' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.from(nodeList)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [{ type: 'Identifier', name: 'nodeList' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for MyArray.from([1])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'MyArray' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [{ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.of([1])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'of' },
        },
        arguments: [{ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.isArray([1])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'isArray' },
        },
        arguments: [{ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for direct Array() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Array' },
        arguments: [{ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.from with two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [
          { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] },
          { type: 'Identifier', name: 'fn' },
        ],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.from with three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [
          { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] },
          { type: 'Identifier', name: 'fn' },
          { type: 'Identifier', name: 'thisArg' },
        ],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.from with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-CallExpression type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression({
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'Array' },
        property: { type: 'Identifier', name: 'from' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrayExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression({
        type: 'ArrayExpression',
        elements: [{ type: 'Literal', value: 1 }],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression({
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Literal', value: 1 },
        right: { type: 'Literal', value: 2 },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.from with ObjectExpression arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [{ type: 'ObjectExpression', properties: [] }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.from with CallExpression arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [{
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'getItems' },
          arguments: [],
        }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for computed property access Array["from"]([1])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Literal', value: 'from' },
        },
        arguments: [{ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.from([1]) where arr is not Array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [{ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryArrayFromRule.create(ctx1)
      const visitor2 = noUnnecessaryArrayFromRule.create(ctx2)
      visitor1.CallExpression(makeArrayFromCall([{ type: 'Literal', value: 1 }]))
      visitor2.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Array' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression(makeArrayFromCall([{ type: 'Literal', value: 1 }]))
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'foo' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      visitor.CallExpression(makeArrayFromCall([{ type: 'Literal', value: 2 }]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [{ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [{ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression(makeArrayFromCall([{ type: 'Literal', value: 1 }]))
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [{ type: 'Identifier', name: 'set' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      visitor.CallExpression(makeArrayFromCall([{ type: 'Literal', value: 2 }]))
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [
          { type: 'ArrayExpression', elements: [] },
          { type: 'Identifier', name: 'fn' },
        ],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryArrayFromRule.create(context)
      const visitor2 = noUnnecessaryArrayFromRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryArrayFromRule.meta
      const meta2 = noUnnecessaryArrayFromRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [{ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] }],
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 16],
        extra: true,
        _parent: {},
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [{ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [{ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] }],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryArrayFromRule).toBeDefined()
      expect(typeof noUnnecessaryArrayFromRule.create).toBe('function')
      expect(typeof noUnnecessaryArrayFromRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [{ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] }],
        loc: makeLoc(1, 0, 1, 10),
        _parent: { type: 'ExpressionStatement' },
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression(makeArrayFromCall([{ type: 'Literal', value: 1 }], makeLoc(10, 4, 10, 20)))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(20)
    })

    test('handles callee as null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: null,
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('handles callee as undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('handles callee object as null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [{ type: 'ArrayExpression', elements: [] }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('handles callee property as null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Array' },
          property: null,
        },
        arguments: [{ type: 'ArrayExpression', elements: [] }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('handles arguments as non-array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: { type: 'ArrayExpression', elements: [] },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('handles first argument as null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [null],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('handles first argument as non-object string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: ['not an object'],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })
})
