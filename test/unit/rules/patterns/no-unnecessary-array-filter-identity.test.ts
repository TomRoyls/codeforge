import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryArrayFilterIdentity } from '../../../../src/rules/patterns/no-unnecessary-array-filter-identity.js'
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

// Helper: arrow identity x => x
function makeArrowIdentity(paramName: string): unknown {
  return {
    type: 'ArrowFunctionExpression',
    params: [{ type: 'Identifier', name: paramName }],
    body: { type: 'Identifier', name: paramName },
  }
}

// Helper: arrow block identity x => { return x }
function makeArrowBlockIdentity(paramName: string): unknown {
  return {
    type: 'ArrowFunctionExpression',
    params: [{ type: 'Identifier', name: paramName }],
    body: {
      type: 'BlockStatement',
      body: [{
        type: 'ReturnStatement',
        argument: { type: 'Identifier', name: paramName },
      }],
    },
  }
}

// Helper: function expression identity function(x) { return x }
function makeFunctionIdentity(paramName: string): unknown {
  return {
    type: 'FunctionExpression',
    params: [{ type: 'Identifier', name: paramName }],
    body: {
      type: 'BlockStatement',
      body: [{
        type: 'ReturnStatement',
        argument: { type: 'Identifier', name: paramName },
      }],
    },
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-array-filter-identity rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryArrayFilterIdentity.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryArrayFilterIdentity.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryArrayFilterIdentity.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryArrayFilterIdentity.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryArrayFilterIdentity.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning filter', () => {
      const desc = noUnnecessaryArrayFilterIdentity.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/filter/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryArrayFilterIdentity.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-array-filter-identity.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryArrayFilterIdentity.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryArrayFilterIdentity).toBeDefined()
      expect(noUnnecessaryArrayFilterIdentity.meta).toBeDefined()
      expect(noUnnecessaryArrayFilterIdentity.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (28) =====

  describe('positive cases — reports identity filter', () => {
    test('reports arr.filter(x => x) — arrow identity', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [makeArrowIdentity('x')]))
      expect(reports.length).toBe(1)
    })

    test('reports arr.filter(item => item) — different param name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [makeArrowIdentity('item')]))
      expect(reports.length).toBe(1)
    })

    test('reports arr.filter(el => el) — another param name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [makeArrowIdentity('el')]))
      expect(reports.length).toBe(1)
    })

    test('reports arr.filter(_ => _) — underscore param', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [makeArrowIdentity('_')]))
      expect(reports.length).toBe(1)
    })

    test('reports arr.filter(x => { return x }) — arrow with block', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [makeArrowBlockIdentity('x')]))
      expect(reports.length).toBe(1)
    })

    test('reports arr.filter(item => { return item }) — arrow block different name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [makeArrowBlockIdentity('item')]))
      expect(reports.length).toBe(1)
    })

    test('reports arr.filter(function(x) { return x }) — function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [makeFunctionIdentity('x')]))
      expect(reports.length).toBe(1)
    })

    test('reports arr.filter(function(val) { return val }) — function expression different name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [makeFunctionIdentity('val')]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions filter', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [makeArrowIdentity('x')]))
      expect(reports[0].message).toMatch(/filter/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [makeArrowIdentity('x')]))
      expect(reports[0].message).toBe(
        'Array.prototype.filter() with an identity function returns the same elements. Use Boolean or a type guard instead.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [makeArrowIdentity('x')]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [makeArrowIdentity('x')]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [makeArrowIdentity('x')])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [makeArrowIdentity('x')], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [makeArrowIdentity('x')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [makeArrowBlockIdentity('y')]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [makeArrowIdentity('x')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [makeFunctionIdentity('y')]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [makeArrowIdentity('x')]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports with CallExpression callee object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      const callObj = { type: 'CallExpression', callee: { type: 'Identifier', name: 'getArr' }, arguments: [] }
      visitor.CallExpression(makeCallNode(callObj, 'filter', [makeArrowIdentity('x')]))
      expect(reports.length).toBe(1)
    })

    test('reports with MemberExpression callee object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      const memberObj = { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'arr' } }
      visitor.CallExpression(makeCallNode(memberObj, 'filter', [makeArrowIdentity('x')]))
      expect(reports.length).toBe(1)
    })

    test('reports arr.filter(value => value) — another param name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [makeArrowIdentity('value')]))
      expect(reports.length).toBe(1)
    })

    test('reports when block has exactly one return statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      const arg = {
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'z' }],
        body: {
          type: 'BlockStatement',
          body: [{
            type: 'ReturnStatement',
            argument: { type: 'Identifier', name: 'z' },
          }],
        },
      }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [arg]))
      expect(reports.length).toBe(1)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'filter' },
        },
        arguments: [makeArrowIdentity('x')],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [makeArrowIdentity('x')])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'filter' },
        },
        arguments: [makeArrowIdentity('x')],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [makeArrowIdentity('x')], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('non-computed member expression reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'filter' },
          computed: false,
        },
        arguments: [makeArrowIdentity('x')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('reports function expression with id property (named function)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      const fnExpr = {
        type: 'FunctionExpression',
        id: { type: 'Identifier', name: 'myFilter' },
        params: [{ type: 'Identifier', name: 'x' }],
        body: {
          type: 'BlockStatement',
          body: [{
            type: 'ReturnStatement',
            argument: { type: 'Identifier', name: 'x' },
          }],
        },
      }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [fnExpr]))
      expect(reports.length).toBe(1)
    })

    test('reports with ArrayExpression callee object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: [] }, 'filter', [makeArrowIdentity('x')]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (42) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for arr.filter(x => x > 0) — BinaryExpression body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      const arg = {
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'BinaryExpression', operator: '>', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: 0 } },
      }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [arg]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.filter(x => y) — different variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      const arg = {
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'Identifier', name: 'y' },
      }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [arg]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.filter((x, i) => x) — 2 params', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      const arg = {
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'i' }],
        body: { type: 'Identifier', name: 'x' },
      }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [arg]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.filter((x, i) => { return x }) — 2 params with block', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      const arg = {
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'i' }],
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Identifier', name: 'x' } }],
        },
      }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [arg]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.filter(x => x, thisArg) — 2 args to filter', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [makeArrowIdentity('x'), { type: 'Identifier', name: 'thisArg' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.map(x => x) — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [makeArrowIdentity('x')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.filter() — no args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter'))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.filter(Boolean) — Identifier not function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [{ type: 'Identifier', name: 'Boolean' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.filter(x => x.prop) — MemberExpression body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      const arg = {
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'MemberExpression', object: { type: 'Identifier', name: 'x' }, property: { type: 'Identifier', name: 'prop' } },
      }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [arg]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.filter(x => !x) — UnaryExpression body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      const arg = {
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } },
      }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [arg]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.filter(x => { return y }) — returns different var', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      const arg = {
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }],
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Identifier', name: 'y' } }],
        },
      }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [arg]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.filter(x => { return x; const y = 1; }) — 2 statements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      const arg = {
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }],
        body: {
          type: 'BlockStatement',
          body: [
            { type: 'ReturnStatement', argument: { type: 'Identifier', name: 'x' } },
            { type: 'VariableDeclaration', kind: 'const', declarations: [] },
          ],
        },
      }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [arg]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.filter(x => {}) — empty block', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      const arg = {
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [arg]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.filter(x => { return }) — return without argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      const arg = {
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }],
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: null }],
        },
      }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [arg]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeArrowIdentity('x')], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeArrowIdentity('x')], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'filter' }, arguments: [makeArrowIdentity('x')], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'filter' },
        },
        arguments: [makeArrowIdentity('x')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is not "filter"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'find', [makeArrowIdentity('x')]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is computed', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'filter' },
          computed: true,
        },
        arguments: [makeArrowIdentity('x')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when function has 0 params', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      const arg = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'Identifier', name: 'x' },
      }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [arg]))
      expect(reports.length).toBe(0)
    })

    test('does not report when function has 3 params', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      const arg = {
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'i' }, { type: 'Identifier', name: 'a' }],
        body: { type: 'Identifier', name: 'x' },
      }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [arg]))
      expect(reports.length).toBe(0)
    })

    test('does not report when param is not Identifier (AssignmentPattern)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      const arg = {
        type: 'ArrowFunctionExpression',
        params: [{ type: 'AssignmentPattern', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: null } }],
        body: { type: 'Identifier', name: 'x' },
      }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [arg]))
      expect(reports.length).toBe(0)
    })

    test('does not report when body is CallExpression (x => foo())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      const arg = {
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'CallExpression', callee: { type: 'Identifier', name: 'foo' }, arguments: [] },
      }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [arg]))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
        },
        arguments: [makeArrowIdentity('x')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: null,
        },
        arguments: [makeArrowIdentity('x')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Filter" (case-sensitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'Filter', [makeArrowIdentity('x')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.filter(function(x, y) { return x }) — 2 params function expr', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      const arg = {
        type: 'FunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }],
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Identifier', name: 'x' } }],
        },
      }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [arg]))
      expect(reports.length).toBe(0)
    })

    test('does not report when body is Literal (x => 42)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      const arg = {
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'Literal', value: 42 },
      }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [arg]))
      expect(reports.length).toBe(0)
    })

    test('does not report when return argument is Literal (function(x) { return 42 })', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      const arg = {
        type: 'FunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }],
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 42 } }],
        },
      }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [arg]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryArrayFilterIdentity.create(ctx1)
      const visitor2 = noUnnecessaryArrayFilterIdentity.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [makeArrowIdentity('x')]))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [makeArrowIdentity('x')]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [makeArrowIdentity('x')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [makeArrowIdentity('x')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [makeArrowBlockIdentity('y')]))
      expect(reports.length).toBe(2)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [makeArrowIdentity('x')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [makeArrowIdentity('x')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [{ type: 'Identifier', name: 'Boolean' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [makeFunctionIdentity('y')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'find', [makeArrowIdentity('x')]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryArrayFilterIdentity.create(context)
      const visitor2 = noUnnecessaryArrayFilterIdentity.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryArrayFilterIdentity.meta
      const meta2 = noUnnecessaryArrayFilterIdentity.meta
      expect(meta1).toBe(meta2)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryArrayFilterIdentity).toBeDefined()
      expect(typeof noUnnecessaryArrayFilterIdentity.create).toBe('function')
      expect(typeof noUnnecessaryArrayFilterIdentity.meta).toBe('object')
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [makeArrowIdentity('x')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [makeFunctionIdentity('y')]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('handles computed member expression property (computed: false)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'filter' },
          computed: false,
        },
        arguments: [makeArrowIdentity('x')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when computed is true with Literal property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'filter' },
          computed: true,
        },
        arguments: [makeArrowIdentity('x')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('handles function expression with id property in edge context', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      const fnExpr = {
        type: 'FunctionExpression',
        id: { type: 'Identifier', name: 'namedFn' },
        params: [{ type: 'Identifier', name: 'x' }],
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Identifier', name: 'x' } }],
        },
      }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [fnExpr]))
      expect(reports.length).toBe(1)
    })

    test('does not report when block has return with MemberExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      const arg = {
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }],
        body: {
          type: 'BlockStatement',
          body: [{
            type: 'ReturnStatement',
            argument: { type: 'MemberExpression', object: { type: 'Identifier', name: 'x' }, property: { type: 'Identifier', name: 'prop' } },
          }],
        },
      }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [arg]))
      expect(reports.length).toBe(0)
    })

    test('reports arrow identity with various parameter names consistently', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      const names = ['a', 'b', 'c', 'd', 'e']
      for (const name of names) {
        visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [makeArrowIdentity(name)]))
      }
      expect(reports.length).toBe(5)
    })

    test('does not report for arr.filter(x => x && y) — LogicalExpression body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      const arg = {
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'LogicalExpression', operator: '&&', left: { type: 'Identifier', name: 'x' }, right: { type: 'Identifier', name: 'y' } },
      }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [arg]))
      expect(reports.length).toBe(0)
    })

    test('does not report when return argument is CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      const arg = {
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }],
        body: {
          type: 'BlockStatement',
          body: [{
            type: 'ReturnStatement',
            argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'x' }, arguments: [] },
          }],
        },
      }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [arg]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.filter(x => typeof x) — UnaryExpression body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFilterIdentity.create(context)
      const arg = {
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'UnaryExpression', operator: 'typeof', prefix: true, argument: { type: 'Identifier', name: 'x' } },
      }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [arg]))
      expect(reports.length).toBe(0)
    })
  })
})
