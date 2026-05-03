import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryArrayUnshiftSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-array-unshift-spread.js'
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

function makeCallNode(
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

function makeSpreadArg(argType: string, argProps: Record<string, unknown> = {}): unknown {
  return { type: 'SpreadElement', argument: { type: argType, ...argProps } }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-array-unshift-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryArrayUnshiftSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryArrayUnshiftSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryArrayUnshiftSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryArrayUnshiftSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryArrayUnshiftSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning unshift', () => {
      const desc = noUnnecessaryArrayUnshiftSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/unshift/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryArrayUnshiftSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-array-unshift-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryArrayUnshiftSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryArrayUnshiftSpreadRule).toBeDefined()
      expect(noUnnecessaryArrayUnshiftSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryArrayUnshiftSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports unnecessary unshift spread', () => {
    test('reports for arr.unshift(...items) — basic case', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'unshift', [makeSpreadArg('Identifier', { name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.unshift(...arr) — spread of identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'unshift', [makeSpreadArg('Identifier', { name: 'arr' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.unshift(...[1, 2, 3]) — spread of array literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'unshift', [makeSpreadArg('ArrayExpression', { elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.unshift(...fn()) — spread of call expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'unshift', [makeSpreadArg('CallExpression', { callee: { type: 'Identifier', name: 'fn' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.unshift(...obj.prop) — spread of member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'unshift', [makeSpreadArg('MemberExpression', { object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.arr.unshift(...items) — nested member expression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'arr' } }, 'unshift', [makeSpreadArg('Identifier', { name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for getArr().unshift(...items) — call expression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getArr' }, arguments: [] }, 'unshift', [makeSpreadArg('Identifier', { name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for [1, 2].unshift(...items) — array expression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }] }, 'unshift', [makeSpreadArg('Identifier', { name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions unshift and spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'unshift', [makeSpreadArg('Identifier', { name: 'items' })]))
      expect(reports[0].message).toMatch(/unshift/)
      expect(reports[0].message).toMatch(/spread/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'unshift', [makeSpreadArg('Identifier', { name: 'items' })]))
      expect(reports[0].message).toBe(
        'arr.unshift(...items) with spread is unusual. unshift() expects individual element arguments, not a spread.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'unshift', [makeSpreadArg('Identifier', { name: 'items' })]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'unshift', [makeSpreadArg('Identifier', { name: 'items' })]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'unshift', [makeSpreadArg('Identifier', { name: 'items' })])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'unshift', [makeSpreadArg('Identifier', { name: 'items' })], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'unshift', [makeSpreadArg('Identifier', { name: 'x' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'unshift', [makeSpreadArg('Identifier', { name: 'y' })]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'unshift', [makeSpreadArg('Identifier', { name: 'x' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'unshift', [makeSpreadArg('Identifier', { name: 'y' })]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'unshift', [makeSpreadArg('Identifier', { name: 'items' })]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for arr.unshift(...new Set(iter)) — NewExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'unshift', [makeSpreadArg('NewExpression', { callee: { type: 'Identifier', name: 'Set' }, arguments: [{ type: 'Identifier', name: 'iter' }] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.unshift(...(cond ? a : b)) — ConditionalExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'unshift', [makeSpreadArg('ConditionalExpression', { test: { type: 'Identifier', name: 'cond' }, consequent: { type: 'Identifier', name: 'a' }, alternate: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.unshift(...items.map(fn)) — call expression in spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'unshift', [makeSpreadArg('CallExpression', { callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'items' }, property: { type: 'Identifier', name: 'map' } }, arguments: [{ type: 'Identifier', name: 'fn' }] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for deeply nested member obj.a.b.c.unshift(...x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      const deepObj = { type: 'MemberExpression', object: { type: 'MemberExpression', object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'a' } }, property: { type: 'Identifier', name: 'b' } }, property: { type: 'Identifier', name: 'c' } }
      visitor.CallExpression(makeCallNode(deepObj, 'unshift', [makeSpreadArg('Identifier', { name: 'x' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.unshift(...arguments) — arguments identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'unshift', [makeSpreadArg('Identifier', { name: 'arguments' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.unshift(...template) — template literal in spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'unshift', [makeSpreadArg('TemplateLiteral', { quasis: [], expressions: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.unshift(...items) with non-Identifier object — Literal object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: null }, 'unshift', [makeSpreadArg('Identifier', { name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.unshift(...items) with ObjectExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ObjectExpression', properties: [] }, 'unshift', [makeSpreadArg('Identifier', { name: 'items' })]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (44) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for arr.push(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'push', [makeSpreadArg('Identifier', { name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.pop() — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'pop', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.shift() — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'shift', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.concat(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', [makeSpreadArg('Identifier', { name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.map(fn) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [{ type: 'Identifier', name: 'fn' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.unshift(a, b) — 2 non-spread args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'unshift', [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.unshift(a) — 1 non-spread arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'unshift', [{ type: 'Identifier', name: 'a' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.unshift() — 0 args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'unshift', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.unshift(a, b, c) — 3 args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'unshift', [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }, { type: 'Identifier', name: 'c' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for computed member arr["unshift"](...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'unshift' },
        },
        arguments: [makeSpreadArg('Identifier', { name: 'items' })],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeSpreadArg('Identifier', { name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeSpreadArg('Identifier', { name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [makeSpreadArg('Identifier', { name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'unshift' },
        },
        arguments: [makeSpreadArg('Identifier', { name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "push"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'push', [makeSpreadArg('Identifier', { name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Unshift" (case sensitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'Unshift', [makeSpreadArg('Identifier', { name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee type is FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }, arguments: [makeSpreadArg('Identifier', { name: 'items' })], loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
        },
        arguments: [makeSpreadArg('Identifier', { name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: null,
        },
        arguments: [makeSpreadArg('Identifier', { name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.unshift(x, ...items) — 2 args (first non-spread)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'unshift', [{ type: 'Identifier', name: 'x' }, makeSpreadArg('Identifier', { name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.unshift(...items, x) — 2 args (second non-spread)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'unshift', [makeSpreadArg('Identifier', { name: 'items' }), { type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.unshift(1) — Literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'unshift', [{ type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.unshift(foo) — Identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'unshift', [{ type: 'Identifier', name: 'foo' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for fn(...items) — callee is Identifier not MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [makeSpreadArg('Identifier', { name: 'items' })], loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is an ArrayExpression (not SpreadElement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'unshift', [{ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a CallExpression (not SpreadElement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'unshift', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a MemberExpression (not SpreadElement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'unshift', [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for five non-spread arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'unshift', [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }, { type: 'Literal', value: 4 }, { type: 'Literal', value: 5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.includes(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'includes', [makeSpreadArg('Identifier', { name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.find(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'find', [makeSpreadArg('Identifier', { name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.findIndex(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findIndex', [makeSpreadArg('Identifier', { name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'unshift' },
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

  })

  // ===== EDGE CASES (16) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryArrayUnshiftSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryArrayUnshiftSpreadRule.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'unshift', [makeSpreadArg('Identifier', { name: 'items' })]))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'unshift', [{ type: 'Identifier', name: 'x' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'unshift', [makeSpreadArg('Identifier', { name: 'items' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'unshift', [{ type: 'Identifier', name: 'x' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'unshift', [makeSpreadArg('Identifier', { name: 'more' })]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'unshift' },
        },
        arguments: [makeSpreadArg('Identifier', { name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'unshift' },
        },
        arguments: [makeSpreadArg('Identifier', { name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'unshift', [makeSpreadArg('Identifier', { name: 'items' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'unshift', []))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'push', [makeSpreadArg('Identifier', { name: 'items' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'unshift', [makeSpreadArg('Identifier', { name: 'more' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'unshift', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      const visitor2 = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryArrayUnshiftSpreadRule.meta
      const meta2 = noUnnecessaryArrayUnshiftSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'unshift' },
        },
        arguments: [makeSpreadArg('Identifier', { name: 'items' })],
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
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'unshift' },
        },
        arguments: [makeSpreadArg('Identifier', { name: 'items' })],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'unshift' },
        },
        arguments: [makeSpreadArg('Identifier', { name: 'items' })],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'unshift', [makeSpreadArg('Identifier', { name: 'items' })])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryArrayUnshiftSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryArrayUnshiftSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryArrayUnshiftSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'unshift' },
        },
        arguments: [makeSpreadArg('Identifier', { name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'unshift', [makeSpreadArg('Identifier', { name: 'items' })], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles computed: false explicitly (should still report)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'unshift' },
        },
        arguments: [makeSpreadArg('Identifier', { name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayUnshiftSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'unshift', [makeSpreadArg('Identifier', { name: 'x' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'unshift', [makeSpreadArg('Identifier', { name: 'y' })]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})
