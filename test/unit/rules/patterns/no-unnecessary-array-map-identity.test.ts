import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryArrayMapIdentity } from '../../../../src/rules/patterns/no-unnecessary-array-map-identity.js'
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

function makeIdentityArrow(paramName: string): unknown {
  return {
    type: 'ArrowFunctionExpression',
    params: [{ type: 'Identifier', name: paramName }],
    body: { type: 'Identifier', name: paramName },
  }
}

function makeIdentityArrowWithBlock(paramName: string): unknown {
  return {
    type: 'ArrowFunctionExpression',
    params: [{ type: 'Identifier', name: paramName }],
    body: {
      type: 'BlockStatement',
      body: [{ type: 'ReturnStatement', argument: { type: 'Identifier', name: paramName } }],
    },
  }
}

function makeIdentityFunctionExpr(paramName: string): unknown {
  return {
    type: 'FunctionExpression',
    id: null,
    params: [{ type: 'Identifier', name: paramName }],
    body: {
      type: 'BlockStatement',
      body: [{ type: 'ReturnStatement', argument: { type: 'Identifier', name: paramName } }],
    },
  }
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
      computed: false,
      object,
      property: { type: 'Identifier', name: methodName },
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-array-map-identity rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryArrayMapIdentity.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryArrayMapIdentity.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryArrayMapIdentity.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryArrayMapIdentity.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryArrayMapIdentity.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning map', () => {
      const desc = noUnnecessaryArrayMapIdentity.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/map/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryArrayMapIdentity.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-array-map-identity.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryArrayMapIdentity.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryArrayMapIdentity).toBeDefined()
      expect(noUnnecessaryArrayMapIdentity.meta).toBeDefined()
      expect(noUnnecessaryArrayMapIdentity.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (30) =====

  describe('positive cases — reports identity map', () => {
    test('reports arr.map(x => x) — arrow identity', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [makeIdentityArrow('x')]))
      expect(reports.length).toBe(1)
    })

    test('reports arr.map(x => { return x }) — arrow with block identity', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [makeIdentityArrowWithBlock('x')]))
      expect(reports.length).toBe(1)
    })

    test('reports arr.map(function(x) { return x }) — function expression identity', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [makeIdentityFunctionExpr('x')]))
      expect(reports.length).toBe(1)
    })

    test('reports with different parameter name "item"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [makeIdentityArrow('item')]))
      expect(reports.length).toBe(1)
    })

    test('reports with different parameter name "element"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [makeIdentityArrow('element')]))
      expect(reports.length).toBe(1)
    })

    test('reports with parameter name "val"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'data' }, 'map', [makeIdentityArrow('val')]))
      expect(reports.length).toBe(1)
    })

    test('reports function expression identity with different param name "n"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [makeIdentityFunctionExpr('n')]))
      expect(reports.length).toBe(1)
    })

    test('reports arrow with block identity with param name "el"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'list' }, 'map', [makeIdentityArrowWithBlock('el')]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions identity function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [makeIdentityArrow('x')]))
      expect(reports[0].message).toMatch(/identity/)
    })

    test('report message mentions map', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [makeIdentityArrow('x')]))
      expect(reports[0].message).toMatch(/map/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [makeIdentityArrow('x')]))
      expect(reports[0].message).toBe(
        'Array.prototype.map() with an identity function is unnecessary. Remove the .map() call or use the array directly.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [makeIdentityArrow('x')]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [makeIdentityArrow('x')]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [makeIdentityArrow('x')])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [makeIdentityArrow('x')], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [makeIdentityArrow('x')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'list' }, 'map', [makeIdentityArrow('y')]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [makeIdentityArrow('x')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'list' }, 'map', [makeIdentityArrow('y')]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [makeIdentityArrow('x')]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports when callee object is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'items' } },
        'map',
        [makeIdentityArrow('x')],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports when callee object is CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'CallExpression', callee: { type: 'Identifier', name: 'getArr' }, arguments: [] },
        'map',
        [makeIdentityArrow('x')],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports when callee object is ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }] },
        'map',
        [makeIdentityArrow('x')],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports identity arrow with single-char param "_"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [makeIdentityArrow('_')]))
      expect(reports.length).toBe(1)
    })

    test('reports identity arrow with long param name "returnValue"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [makeIdentityArrow('returnValue')]))
      expect(reports.length).toBe(1)
    })

    test('reports function expression identity with named function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      const fnExpr = {
        type: 'FunctionExpression',
        id: { type: 'Identifier', name: 'identity' },
        params: [{ type: 'Identifier', name: 'x' }],
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Identifier', name: 'x' } }],
        },
      }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [fnExpr]))
      expect(reports.length).toBe(1)
    })

    test('reports identity with block body containing only return statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [makeIdentityArrowWithBlock('z')]))
      expect(reports.length).toBe(1)
    })

    test('reports three consecutive identity map calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'map', [makeIdentityArrow('x')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'map', [makeIdentityArrow('y')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'c' }, 'map', [makeIdentityArrow('z')]))
      expect(reports.length).toBe(3)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [makeIdentityArrow('x')], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports identity arrow when callee object is ThisExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ThisExpression' }, 'map', [makeIdentityArrow('x')]))
      expect(reports.length).toBe(1)
    })

    test('reports arrow identity with short param name "a"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [makeIdentityArrow('a')]))
      expect(reports.length).toBe(1)
    })

    test('reports function expression identity with param name "value"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [makeIdentityFunctionExpr('value')]))
      expect(reports.length).toBe(1)
    })

    test('reports arrow identity with param name "row"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [makeIdentityArrow('row')]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for arr.map(x => x * 2) — not identity', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      const arg = {
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'BinaryExpression', operator: '*', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: 2 } },
      }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [arg]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.map(x => y) — different variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      const arg = {
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'Identifier', name: 'y' },
      }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [arg]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.map((x, i) => x) — two parameters', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      const arg = {
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'i' }],
        body: { type: 'Identifier', name: 'x' },
      }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [arg]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.map(x => x, thisArg) — two arguments to map', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [makeIdentityArrow('x'), { type: 'ThisExpression' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.filter(x => x) — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [makeIdentityArrow('x')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.forEach(x => x) — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach', [makeIdentityArrow('x')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.map() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map'))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.reduce(x => x) — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'reduce', [makeIdentityArrow('x')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.map(x => { return y }) — block returns different var', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      const arg = {
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }],
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Identifier', name: 'y' } }],
        },
      }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [arg]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.map(x => { return x; console.log(x) }) — two statements in block', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      const arg = {
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }],
        body: {
          type: 'BlockStatement',
          body: [
            { type: 'ReturnStatement', argument: { type: 'Identifier', name: 'x' } },
            { type: 'ExpressionStatement', expression: { type: 'CallExpression', callee: { type: 'Identifier', name: 'console' }, arguments: [] } },
          ],
        },
      }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [arg]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.map(x => { }) — empty block body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      const arg = {
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [arg]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.map(x => { return }) — return without argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      const arg = {
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }],
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: null }],
        },
      }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [arg]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.map(function(x, y) { return x }) — two params in function expr', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      const arg = {
        type: 'FunctionExpression',
        id: null,
        params: [{ type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }],
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Identifier', name: 'x' } }],
        },
      }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [arg]))
      expect(reports.length).toBe(0)
    })

    test('does not report for non-function argument — object literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [{ type: 'ObjectExpression', properties: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for non-function argument — identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [{ type: 'Identifier', name: 'fn' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is computed member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'map' },
        },
        arguments: [makeIdentityArrow('x')],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing and no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null and no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'map' }, arguments: [makeIdentityArrow('x')], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'map' },
        },
        arguments: [makeIdentityArrow('x')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Map" (capitalized)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'Map', [makeIdentityArrow('x')]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "flatMap"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flatMap', [makeIdentityArrow('x')]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arg has destructured parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      const arg = {
        type: 'ArrowFunctionExpression',
        params: [{ type: 'ObjectPattern', properties: [] }],
        body: { type: 'Identifier', name: 'x' },
      }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [arg]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arg has default parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      const arg = {
        type: 'ArrowFunctionExpression',
        params: [{ type: 'AssignmentPattern', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: 0 } }],
        body: { type: 'Identifier', name: 'x' },
      }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [arg]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arg has rest parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      const arg = {
        type: 'ArrowFunctionExpression',
        params: [{ type: 'RestElement', argument: { type: 'Identifier', name: 'args' } }],
        body: { type: 'Identifier', name: 'args' },
      }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [arg]))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "map" but with 3 arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [makeIdentityArrow('x'), { type: 'ThisExpression' }, { type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when block body has IfStatement instead of ReturnStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      const arg = {
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }],
        body: {
          type: 'BlockStatement',
          body: [{ type: 'IfStatement', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'BlockStatement', body: [] } }],
        },
      }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [arg]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arrow body is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      const arg = {
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
      }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [arg]))
      expect(reports.length).toBe(0)
    })

    test('does not report when three arguments to map', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [makeIdentityArrow('x'), { type: 'Literal', value: 0 }, { type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryArrayMapIdentity.create(ctx1)
      const visitor2 = noUnnecessaryArrayMapIdentity.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [makeIdentityArrow('x')]))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [makeIdentityArrow('x')]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly with mixed calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [makeIdentityArrow('x')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [makeIdentityArrow('x')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [makeIdentityArrow('y')]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'map' },
        },
        arguments: [makeIdentityArrow('x')],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'map' },
        },
        arguments: [makeIdentityArrow('x')],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      // valid - different method
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [makeIdentityArrow('x')]))
      // invalid - identity map
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [makeIdentityArrow('x')]))
      // valid - two args
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [makeIdentityArrow('x'), { type: 'ThisExpression' }]))
      // invalid - function expression identity
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [makeIdentityFunctionExpr('x')]))
      // valid - different method
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'reduce', [makeIdentityArrow('x')]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryArrayMapIdentity.create(context)
      const visitor2 = noUnnecessaryArrayMapIdentity.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryArrayMapIdentity.meta
      const meta2 = noUnnecessaryArrayMapIdentity.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'map' },
        },
        arguments: [makeIdentityArrow('x')],
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
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'map' },
        },
        arguments: [makeIdentityArrow('x')],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'map' },
        },
        arguments: [makeIdentityArrow('x')],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [makeIdentityArrow('x')])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryArrayMapIdentity).toBeDefined()
      expect(typeof noUnnecessaryArrayMapIdentity.create).toBe('function')
      expect(typeof noUnnecessaryArrayMapIdentity.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'map' },
        },
        arguments: [makeIdentityArrow('x')],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayMapIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [makeIdentityArrow('x')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'list' }, 'map', [makeIdentityFunctionExpr('y')]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})
