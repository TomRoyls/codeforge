import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryArrayFindBoolean } from '../../../../src/rules/patterns/no-unnecessary-array-find-boolean.js'
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

function makeTrueArrow(paramName = 'x'): unknown {
  return {
    type: 'ArrowFunctionExpression',
    params: [{ type: 'Identifier', name: paramName }],
    body: { type: 'BooleanLiteral', value: true },
  }
}

function makeArrowWithBody(paramName: string, bodyType: string, bodyValue?: unknown, extraBody?: Record<string, unknown>): unknown {
  const body: Record<string, unknown> = { type: bodyType }
  if (bodyValue !== undefined) body.value = bodyValue
  if (extraBody) Object.assign(body, extraBody)
  return {
    type: 'ArrowFunctionExpression',
    params: [{ type: 'Identifier', name: paramName }],
    body,
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-array-find-boolean rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryArrayFindBoolean.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryArrayFindBoolean.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryArrayFindBoolean.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryArrayFindBoolean.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryArrayFindBoolean.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning find', () => {
      const desc = noUnnecessaryArrayFindBoolean.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/find/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryArrayFindBoolean.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-array-find-boolean.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryArrayFindBoolean.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryArrayFindBoolean).toBeDefined()
      expect(noUnnecessaryArrayFindBoolean.meta).toBeDefined()
      expect(noUnnecessaryArrayFindBoolean.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (27) =====

  describe('positive cases — reports unnecessary find(() => true)', () => {
    test('reports for arr.find(x => true) with ArrowFunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'find', [makeTrueArrow('x')]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.find(_ => true) with underscore param', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'find', [makeTrueArrow('_')]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.find(item => true) with named param', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'find', [makeTrueArrow('item')]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.find(e => true) with single-letter param', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'find', [makeTrueArrow('e')]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.find(element => true) with full param name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'find', [makeTrueArrow('element')]))
      expect(reports.length).toBe(1)
    })

    test('reports for FunctionExpression with 1 param and BooleanLiteral true body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      const fnExpr = {
        type: 'FunctionExpression',
        id: null,
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'BooleanLiteral', value: true },
      }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'find', [fnExpr]))
      expect(reports.length).toBe(1)
    })

    test('reports with Identifier object: someVar.find(x => true)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'someVar' }, 'find', [makeTrueArrow()]))
      expect(reports.length).toBe(1)
    })

    test('reports with MemberExpression object: obj.arr.find(x => true)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression(
        makeCallNode(
          { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'arr' } },
          'find',
          [makeTrueArrow()],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports with CallExpression object: getArr().find(x => true)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression(
        makeCallNode(
          { type: 'CallExpression', callee: { type: 'Identifier', name: 'getArr' }, arguments: [] },
          'find',
          [makeTrueArrow()],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports with ArrayExpression object: [].find(x => true)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'ArrayExpression', elements: [] }, 'find', [makeTrueArrow()]),
      )
      expect(reports.length).toBe(1)
    })

    test('report message mentions find', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'find', [makeTrueArrow()]))
      expect(reports[0].message).toMatch(/find/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'find', [makeTrueArrow()]))
      expect(reports[0].message).toBe(
        'Array.prototype.find(() => true) always returns the first element. Use arr[0] instead.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'find', [makeTrueArrow()]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'find', [makeTrueArrow()]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'find', [makeTrueArrow()])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'find', [makeTrueArrow()], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'find', [makeTrueArrow()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'find', [makeTrueArrow()]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'find', [makeTrueArrow()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'find', [makeTrueArrow('item')]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'find', [makeTrueArrow()]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports with node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'find' },
        },
        arguments: [makeTrueArrow()],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports with node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'find' },
        },
        arguments: [makeTrueArrow()],
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports with node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'find' },
        },
        arguments: [makeTrueArrow()],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('reports with computed: false member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'find' },
          computed: false,
        },
        arguments: [makeTrueArrow()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'find', [makeTrueArrow()])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'find', [makeTrueArrow()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'find', [makeTrueArrow('el')]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'find', [makeTrueArrow()], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'find', [makeTrueArrow()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [makeTrueArrow()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'find', [makeArrowWithBody('x', 'Identifier', undefined, { name: 'x' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'find', [makeTrueArrow()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'find', [makeArrowWithBody('x', 'BlockStatement', undefined, { body: [] })]))
      expect(reports.length).toBe(2)
    })

    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryArrayFindBoolean.create(ctx1)
      const visitor2 = noUnnecessaryArrayFindBoolean.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'find', [makeTrueArrow()]))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [makeTrueArrow()]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (42) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for method "filter"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [makeTrueArrow()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for method "findIndex"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findIndex', [makeTrueArrow()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for method "map"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [makeTrueArrow()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for method "forEach"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach', [makeTrueArrow()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for method "some"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'some', [makeTrueArrow()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for method "every"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'every', [makeTrueArrow()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for method "reduce"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'reduce', [makeTrueArrow()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for method "includes"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'includes', [makeTrueArrow()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for method "lastIndexOf"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'lastIndexOf', [makeTrueArrow()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'find', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for 2 arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'find', [makeTrueArrow(), { type: 'Identifier', name: 'ctx' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for 3 arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'find', [makeTrueArrow(), { type: 'Identifier', name: 'ctx' }, { type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier arg (not function)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'find', [{ type: 'Identifier', name: 'Boolean' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression arg (not function)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'find', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression arg (not function)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'find', [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'fn' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal arg (not function)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'find', [{ type: 'Literal', value: true }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arrow with 0 params: () => true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      const arrow = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BooleanLiteral', value: true },
      }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'find', [arrow]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arrow with 2 params', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      const arrow = {
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'i' }],
        body: { type: 'BooleanLiteral', value: true },
      }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'find', [arrow]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arrow with 3 params', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      const arrow = {
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'i' }, { type: 'Identifier', name: 'arr' }],
        body: { type: 'BooleanLiteral', value: true },
      }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'find', [arrow]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arrow with BlockStatement body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      const arrow = {
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'BlockStatement', body: [{ type: 'ReturnStatement', argument: { type: 'BooleanLiteral', value: true } }] },
      }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'find', [arrow]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arrow with BooleanLiteral false body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      const arrow = {
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'BooleanLiteral', value: false },
      }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'find', [arrow]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arrow with Identifier body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'find', [makeArrowWithBody('x', 'Identifier', undefined, { name: 'x' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arrow with Literal true body (not BooleanLiteral)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      const arrow = {
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'Literal', value: true },
      }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'find', [arrow]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arrow with CallExpression body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'find', [makeArrowWithBody('x', 'CallExpression', undefined, { callee: {}, arguments: [] })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arrow with BinaryExpression body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'find', [makeArrowWithBody('x', 'BinaryExpression', undefined, { operator: '>', left: {}, right: {} })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arrow with MemberExpression body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'find', [makeArrowWithBody('x', 'MemberExpression', undefined, { object: {}, property: {} })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for computed member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'find' },
          computed: true,
        },
        arguments: [makeTrueArrow()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for property not Identifier (Literal property)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'find' },
        },
        arguments: [makeTrueArrow()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeTrueArrow()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeTrueArrow()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [makeTrueArrow()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'arr' } },
        arguments: [makeTrueArrow()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'arr' }, property: null },
        arguments: [makeTrueArrow()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('visitor accumulates mixed reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'find', [makeTrueArrow()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [makeTrueArrow()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'find', [makeArrowWithBody('x', 'Identifier', undefined, { name: 'x' })]))
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'find' },
        },
        arguments: [makeTrueArrow()],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('node with empty loc object still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'find' },
        },
        arguments: [makeTrueArrow()],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('node with partial loc (missing end) still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'find' },
        },
        arguments: [makeTrueArrow()],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryArrayFindBoolean.meta
      const meta2 = noUnnecessaryArrayFindBoolean.meta
      expect(meta1).toBe(meta2)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryArrayFindBoolean).toBeDefined()
      expect(typeof noUnnecessaryArrayFindBoolean.create).toBe('function')
      expect(typeof noUnnecessaryArrayFindBoolean.meta).toBe('object')
    })

    test('does not report for arrow with ObjectExpression body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'find', [makeArrowWithBody('x', 'ObjectExpression', undefined, { properties: [] })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arrow with TemplateLiteral body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'find', [makeArrowWithBody('x', 'TemplateLiteral', undefined, { quasis: [], expressions: [] })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression with BlockStatement body returning true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      const fnExpr = {
        type: 'FunctionExpression',
        id: null,
        params: [{ type: 'Identifier', name: 'x' }],
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'BooleanLiteral', value: true } }],
        },
      }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'find', [fnExpr]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arrow with UnaryExpression body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'find', [makeArrowWithBody('x', 'UnaryExpression', undefined, { operator: '!', prefix: true, argument: {} })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for method "Find" (PascalCase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'Find', [makeTrueArrow()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for computed bracket notation arr["find"](() => true)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'find' },
          computed: true,
        },
        arguments: [makeTrueArrow()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for method "FIND" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'FIND', [makeTrueArrow()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arrow with ConditionalExpression body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'find', [makeArrowWithBody('x', 'ConditionalExpression', undefined, { test: {}, consequent: {}, alternate: {} })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arrow with LogicalExpression body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'find', [makeArrowWithBody('x', 'LogicalExpression', undefined, { operator: '||', left: {}, right: {} })]))
      expect(reports.length).toBe(0)
    })
  })
})
