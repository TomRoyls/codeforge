import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryArrayOfSingleRule } from '../../../../src/rules/patterns/no-unnecessary-array-of-single.js'
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

function makeArrayOfCall(
  args: unknown[],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'Array' },
      property: { type: 'Identifier', name: 'of' },
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeCallWithObject(
  object: unknown,
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
      object,
      property: { type: 'Identifier', name: methodName },
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-array-of-single rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryArrayOfSingleRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryArrayOfSingleRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryArrayOfSingleRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryArrayOfSingleRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryArrayOfSingleRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Array.of', () => {
      const desc = noUnnecessaryArrayOfSingleRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/array\.of/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryArrayOfSingleRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-array-of-single.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryArrayOfSingleRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryArrayOfSingleRule).toBeDefined()
      expect(noUnnecessaryArrayOfSingleRule.meta).toBeDefined()
      expect(noUnnecessaryArrayOfSingleRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (28) =====

  describe('positive cases — reports unnecessary Array.of() with single argument', () => {
    test('reports for Array.of(5) — number literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression(makeArrayOfCall([{ type: 'Literal', value: 5 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.of("hello") — string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression(makeArrayOfCall([{ type: 'Literal', value: 'hello' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.of(x) — identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression(makeArrayOfCall([{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.of(true) — boolean true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression(makeArrayOfCall([{ type: 'Literal', value: true }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.of(false) — boolean false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression(makeArrayOfCall([{ type: 'Literal', value: false }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.of(null) — null literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression(makeArrayOfCall([{ type: 'Literal', value: null }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.of(undefined) — identifier undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression(makeArrayOfCall([{ type: 'Identifier', name: 'undefined' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.of({}) — object expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression(makeArrayOfCall([{ type: 'ObjectExpression', properties: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.of([]) — array expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression(makeArrayOfCall([{ type: 'ArrayExpression', elements: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.of(/regex/) — regex literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression(makeArrayOfCall([{ type: 'Literal', value: /test/ }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.of(() => {}) — arrow function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression(makeArrayOfCall([{ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.of(function(){}) — function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression(makeArrayOfCall([{ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.of(0) — zero', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression(makeArrayOfCall([{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.of("") — empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression(makeArrayOfCall([{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions Array.of', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression(makeArrayOfCall([{ type: 'Literal', value: 5 }]))
      expect(reports[0].message).toMatch(/Array\.of/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression(makeArrayOfCall([{ type: 'Literal', value: 5 }]))
      expect(reports[0].message).toBe(
        'Unnecessary Array.of() with a single argument. Use an array literal [x] instead.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression(makeArrayOfCall([{ type: 'Literal', value: 5 }]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression(makeArrayOfCall([{ type: 'Literal', value: 5 }]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      const node = makeArrayOfCall([{ type: 'Literal', value: 5 }])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression(makeArrayOfCall([{ type: 'Literal', value: 5 }], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression(makeArrayOfCall([{ type: 'Literal', value: 1 }]))
      visitor.CallExpression(makeArrayOfCall([{ type: 'Literal', value: 2 }]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression(makeArrayOfCall([{ type: 'Literal', value: 1 }]))
      visitor.CallExpression(makeArrayOfCall([{ type: 'Literal', value: 'hello' }]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for Array.of with member expression argument obj.key', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression(makeArrayOfCall([{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'key' } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.of with call expression argument fn()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression(makeArrayOfCall([{ type: 'CallExpression', callee: { type: 'Identifier', name: 'getValue' }, arguments: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.of with template literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression(makeArrayOfCall([{ type: 'TemplateLiteral', quasis: [], expressions: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.of with conditional expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression(makeArrayOfCall([{ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 2 } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.of with unary expression argument -x', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression(makeArrayOfCall([{ type: 'UnaryExpression', operator: '-', prefix: true, argument: { type: 'Identifier', name: 'x' } }]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression(makeArrayOfCall([{ type: 'Literal', value: 42 }]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Array.of() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression(makeArrayOfCall([]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.of(1, 2) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression(makeArrayOfCall([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.of(1, 2, 3) — three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression(makeArrayOfCall([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.from([1, 2]) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression(makeCallWithObject({ type: 'Identifier', name: 'Array' }, 'from', [{ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.isArray(x) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression(makeCallWithObject({ type: 'Identifier', name: 'Array' }, 'isArray', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for MyArray.of(5) — not the Array global', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression(makeCallWithObject({ type: 'Identifier', name: 'MyArray' }, 'of', [{ type: 'Literal', value: 5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.of(5) — identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression(makeCallWithObject({ type: 'Identifier', name: 'arr' }, 'of', [{ type: 'Literal', value: 5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for [].of(5) — ArrayExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression(makeCallWithObject({ type: 'ArrayExpression', elements: [] }, 'of', [{ type: 'Literal', value: 5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for obj.Array.of(5) — MemberExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression(makeCallWithObject({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'Array' } }, 'of', [{ type: 'Literal', value: 5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [{ type: 'Literal', value: 5 }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Literal', value: 'of' },
        },
        arguments: [{ type: 'Literal', value: 5 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "from"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression(makeCallWithObject({ type: 'Identifier', name: 'Array' }, 'from', [{ type: 'Literal', value: 5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression(makeCallWithObject({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getArray' }, arguments: [] }, 'of', [{ type: 'Literal', value: 5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'of' },
        },
        arguments: [{ type: 'Literal', value: 5 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'of' },
        },
        arguments: [{ type: 'Literal', value: 5 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Array' },
        },
        arguments: [{ type: 'Literal', value: 5 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Array' },
          property: null,
        },
        arguments: [{ type: 'Literal', value: 5 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'of' },
        },
        arguments: 'not-array',
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'of' },
        },
        arguments: null,
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for five arguments Array.of(1,2,3,4,5)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression(makeArrayOfCall([
        { type: 'Literal', value: 1 },
        { type: 'Literal', value: 2 },
        { type: 'Literal', value: 3 },
        { type: 'Literal', value: 4 },
        { type: 'Literal', value: 5 },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report for ten arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      const args = Array.from({ length: 10 }, (_, i) => ({ type: 'Literal', value: i }))
      visitor.CallExpression(makeArrayOfCall(args))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Of" (capitalized)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression(makeCallWithObject({ type: 'Identifier', name: 'Array' }, 'Of', [{ type: 'Literal', value: 5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when object name is "array" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression(makeCallWithObject({ type: 'Identifier', name: 'array' }, 'of', [{ type: 'Literal', value: 5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when object type is Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression(makeCallWithObject({ type: 'Literal', value: 'hello' }, 'of', [{ type: 'Literal', value: 5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when object type is ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression(makeCallWithObject({ type: 'ObjectExpression', properties: [] }, 'of', [{ type: 'Literal', value: 5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when object type is FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression(makeCallWithObject({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }, 'of', [{ type: 'Literal', value: 5 }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (17) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryArrayOfSingleRule.create(ctx1)
      const visitor2 = noUnnecessaryArrayOfSingleRule.create(ctx2)
      visitor1.CallExpression(makeArrayOfCall([{ type: 'Literal', value: 5 }]))
      visitor2.CallExpression(makeArrayOfCall([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression(makeArrayOfCall([{ type: 'Literal', value: 5 }]))
      visitor.CallExpression(makeArrayOfCall([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]))
      visitor.CallExpression(makeArrayOfCall([{ type: 'Literal', value: 'x' }]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'of' },
        },
        arguments: [{ type: 'Literal', value: 5 }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'of' },
        },
        arguments: [{ type: 'Literal', value: 5 }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression(makeArrayOfCall([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]))
      visitor.CallExpression(makeArrayOfCall([{ type: 'Literal', value: 5 }]))
      visitor.CallExpression(makeCallWithObject({ type: 'Identifier', name: 'MyArray' }, 'of', [{ type: 'Literal', value: 5 }]))
      visitor.CallExpression(makeArrayOfCall([{ type: 'Literal', value: 'x' }]))
      visitor.CallExpression(makeArrayOfCall([]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryArrayOfSingleRule.create(context)
      const visitor2 = noUnnecessaryArrayOfSingleRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryArrayOfSingleRule.meta
      const meta2 = noUnnecessaryArrayOfSingleRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'of' },
        },
        arguments: [{ type: 'Literal', value: 42 }],
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
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'of' },
        },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'of' },
        },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      const node = makeArrayOfCall([{ type: 'Literal', value: 5 }])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryArrayOfSingleRule).toBeDefined()
      expect(typeof noUnnecessaryArrayOfSingleRule.create).toBe('function')
      expect(typeof noUnnecessaryArrayOfSingleRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'of' },
        },
        arguments: [{ type: 'Literal', value: 5 }],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression(makeArrayOfCall([{ type: 'Literal', value: 5 }], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles computed member expression property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'of' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: 5 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Literal', value: 'of' },
          computed: true,
        },
        arguments: [{ type: 'Literal', value: 5 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayOfSingleRule.create(context)
      visitor.CallExpression(makeArrayOfCall([{ type: 'Literal', value: 5 }]))
      visitor.CallExpression(makeArrayOfCall([{ type: 'Literal', value: 'hello' }]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})
