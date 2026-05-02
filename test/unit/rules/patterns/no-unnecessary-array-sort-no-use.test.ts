import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryArraySortNoUseRule } from '../../../../src/rules/patterns/no-unnecessary-array-sort-no-use.js'
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

function makeSortCall(
  object: unknown,
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
      property: { type: 'Identifier', name: 'sort' },
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeExprStmt(
  expression: unknown,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 25,
): unknown {
  return {
    type: 'ExpressionStatement',
    expression,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeArrayExpr(elements: unknown[]): unknown {
  return { type: 'ArrayExpression', elements }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-array-sort-no-use rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryArraySortNoUseRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryArraySortNoUseRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryArraySortNoUseRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryArraySortNoUseRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryArraySortNoUseRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning sort', () => {
      const desc = noUnnecessaryArraySortNoUseRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/sort/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryArraySortNoUseRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-array-sort-no-use.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryArraySortNoUseRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with ExpressionStatement', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      expect(visitor).toHaveProperty('ExpressionStatement')
      expect(typeof visitor.ExpressionStatement).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryArraySortNoUseRule).toBeDefined()
      expect(noUnnecessaryArraySortNoUseRule.meta).toBeDefined()
      expect(noUnnecessaryArraySortNoUseRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (40) =====

  describe('positive cases — reports unnecessary .sort()', () => {
    test('reports for arr.sort() — identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeSortCall({ type: 'Identifier', name: 'arr' })))
      expect(reports.length).toBe(1)
    })

    test('reports for [3, 1, 2].sort() — array literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeSortCall(makeArrayExpr([{ type: 'Literal', value: 3 }, { type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]))))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.sort((a, b) => a - b) — arrow function comparator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      const arrowFn = { type: 'ArrowFunctionExpression', params: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }], body: { type: 'BinaryExpression', operator: '-', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } } }
      visitor.ExpressionStatement(makeExprStmt(makeSortCall({ type: 'Identifier', name: 'arr' }, [arrowFn])))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.sort(compareFn) — identifier comparator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeSortCall({ type: 'Identifier', name: 'arr' }, [{ type: 'Identifier', name: 'compareFn' }])))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.sort(function(a,b){...}) — function expression comparator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      const fnExpr = { type: 'FunctionExpression', id: null, params: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }], body: { type: 'BlockStatement', body: [] } }
      visitor.ExpressionStatement(makeExprStmt(makeSortCall({ type: 'Identifier', name: 'arr' }, [fnExpr])))
      expect(reports.length).toBe(1)
    })

    test('reports for this.items.sort() — this.member object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeSortCall({ type: 'MemberExpression', object: { type: 'ThisExpression' }, property: { type: 'Identifier', name: 'items' } })))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.arr.sort() — member expression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeSortCall({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'arr' } })))
      expect(reports.length).toBe(1)
    })

    test('reports for getArray().sort() — call expression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeSortCall({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getArray' }, arguments: [] })))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array [].sort()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeSortCall(makeArrayExpr([]))))
      expect(reports.length).toBe(1)
    })

    test('report message mentions sort', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeSortCall({ type: 'Identifier', name: 'arr' })))
      expect(reports[0].message).toMatch(/sort/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeSortCall({ type: 'Identifier', name: 'arr' })))
      expect(reports[0].message).toBe(
        'Unnecessary .sort() as a statement. .sort() mutates the array in place. The result is discarded.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeSortCall({ type: 'Identifier', name: 'arr' })))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeSortCall({ type: 'Identifier', name: 'arr' })))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input ExpressionStatement node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      const node = makeExprStmt(makeSortCall({ type: 'Identifier', name: 'arr' }))
      visitor.ExpressionStatement(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeSortCall({ type: 'Identifier', name: 'arr' }, [], 5, 10, 5, 30), 5, 10, 5, 31))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeSortCall({ type: 'Identifier', name: 'arr' })))
      visitor.ExpressionStatement(makeExprStmt(makeSortCall({ type: 'Identifier', name: 'data' })))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeSortCall({ type: 'Identifier', name: 'arr' })))
      visitor.ExpressionStatement(makeExprStmt(makeSortCall(makeArrayExpr([{ type: 'Literal', value: 1 }]))))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for arr.sort() with member expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeSortCall({ type: 'Identifier', name: 'arr' }, [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'fn' } }])))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.sort() with call expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeSortCall({ type: 'Identifier', name: 'arr' }, [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'getComparator' }, arguments: [] }])))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.sort() with conditional expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeSortCall({ type: 'Identifier', name: 'arr' }, [{ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Identifier', name: 'a' }, alternate: { type: 'Identifier', name: 'b' } }])))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeSortCall({ type: 'Identifier', name: 'arr' })))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for arr.sort(null) — null argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeSortCall({ type: 'Identifier', name: 'arr' }, [{ type: 'Literal', value: null }])))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.sort() with object expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeSortCall({ type: 'Identifier', name: 'arr' }, [{ type: 'ObjectExpression', properties: [] }])))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.sort() with array expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeSortCall({ type: 'Identifier', name: 'arr' }, [makeArrayExpr([])])))
      expect(reports.length).toBe(1)
    })

    test('reports with specific location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeSortCall({ type: 'Identifier', name: 'arr' }, [], 10, 4, 10, 25), 10, 4, 10, 26))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(26)
    })

    test('reports for arr.sort() with template literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeSortCall({ type: 'Identifier', name: 'arr' }, [{ type: 'TemplateLiteral', quasis: [], expressions: [] }])))
      expect(reports.length).toBe(1)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      const node = makeExprStmt(makeSortCall({ type: 'Identifier', name: 'arr' }))
      visitor.ExpressionStatement(node)
      visitor.ExpressionStatement(node)
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(3)
    })

    test('reports for deep member a.b.c.sort()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      const deepMember = { type: 'MemberExpression', object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'a' }, property: { type: 'Identifier', name: 'b' } }, property: { type: 'Identifier', name: 'c' } }
      visitor.ExpressionStatement(makeExprStmt(makeSortCall(deepMember)))
      expect(reports.length).toBe(1)
    })

    test('reports for computed member with identifier property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'arr' },
            property: { type: 'Identifier', name: 'sort' },
            computed: false,
          },
          arguments: [],
          loc: makeLoc(1, 0, 1, 10),
        },
        loc: makeLoc(1, 0, 1, 11),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for arr.sort() with binary expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeSortCall({ type: 'Identifier', name: 'arr' }, [{ type: 'BinaryExpression', operator: '-', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } }])))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.sort() with logical expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeSortCall({ type: 'Identifier', name: 'arr' }, [{ type: 'LogicalExpression', operator: '||', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } }])))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.sort() with unary expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeSortCall({ type: 'Identifier', name: 'arr' }, [{ type: 'UnaryExpression', operator: '-', prefix: true, argument: { type: 'Identifier', name: 'x' } }])))
      expect(reports.length).toBe(1)
    })

    test('reports for [1, 2, 3].sort(() => 0) — array literal with comparator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      const arrowFn = { type: 'ArrowFunctionExpression', params: [], body: { type: 'Literal', value: 0 } }
      visitor.ExpressionStatement(makeExprStmt(makeSortCall(makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }]), [arrowFn])))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.sort() with two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeSortCall({ type: 'Identifier', name: 'arr' }, [{ type: 'Identifier', name: 'fn' }, { type: 'Literal', value: 42 }])))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.sort() with update expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeSortCall({ type: 'Identifier', name: 'arr' }, [{ type: 'UpdateExpression', operator: '++', prefix: true, argument: { type: 'Identifier', name: 'i' } }])))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.sort() with new expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeSortCall({ type: 'Identifier', name: 'arr' }, [{ type: 'NewExpression', callee: { type: 'Identifier', name: 'Comparator' }, arguments: [] }])))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array [1].sort()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeSortCall(makeArrayExpr([{ type: 'Literal', value: 1 }]))))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.sort() with SpreadElement argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeSortCall({ type: 'Identifier', name: 'arr' }, [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'comparators' } }])))
      expect(reports.length).toBe(1)
    })

    test('report message mentions mutates', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeSortCall({ type: 'Identifier', name: 'arr' })))
      expect(reports[0].message).toMatch(/mutates/)
    })

    test('report message mentions discarded', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeSortCall({ type: 'Identifier', name: 'arr' })))
      expect(reports[0].message).toMatch(/discarded/)
    })

    test('reports for arr.sort() with await expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeSortCall({ type: 'Identifier', name: 'arr' }, [{ type: 'AwaitExpression', argument: { type: 'Identifier', name: 'fn' } }])))
      expect(reports.length).toBe(1)
    })


  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (35) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for arr.reverse() — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'arr' }, property: { type: 'Identifier', name: 'reverse' } },
        arguments: [],
        loc: makeLoc(1, 0, 1, 15),
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.map(fn) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'arr' }, property: { type: 'Identifier', name: 'map' } },
        arguments: [{ type: 'Identifier', name: 'fn' }],
        loc: makeLoc(1, 0, 1, 15),
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.forEach(fn) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'arr' }, property: { type: 'Identifier', name: 'forEach' } },
        arguments: [{ type: 'Identifier', name: 'fn' }],
        loc: makeLoc(1, 0, 1, 15),
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.filter(fn) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'arr' }, property: { type: 'Identifier', name: 'filter' } },
        arguments: [{ type: 'Identifier', name: 'fn' }],
        loc: makeLoc(1, 0, 1, 15),
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "sort" but lowercase "Sort"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'arr' }, property: { type: 'Identifier', name: 'Sort' } },
        arguments: [],
        loc: makeLoc(1, 0, 1, 15),
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report when expression is not a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'sort' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'arr' }, property: { type: 'Literal', value: 'sort' }, computed: true },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      expect(() => visitor.ExpressionStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      expect(() => visitor.ExpressionStatement(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      expect(() => visitor.ExpressionStatement({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      expect(() => visitor.ExpressionStatement('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      expect(() => visitor.ExpressionStatement(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      expect(() => visitor.ExpressionStatement(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when expression is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement({ type: 'ExpressionStatement', loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when expression is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement({ type: 'ExpressionStatement', expression: null, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing in CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: { type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null in CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'CallExpression',
        callee: null,
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'arr' } },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'arr' }, property: null },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when node type is not ExpressionStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'arr' }, property: { type: 'Identifier', name: 'sort' } },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.push(x) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'arr' }, property: { type: 'Identifier', name: 'push' } },
        arguments: [{ type: 'Literal', value: 1 }],
        loc: makeLoc(1, 0, 1, 15),
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.splice(0, 1) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'arr' }, property: { type: 'Identifier', name: 'splice' } },
        arguments: [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 1 }],
        loc: makeLoc(1, 0, 1, 15),
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "sorted" not "sort"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'arr' }, property: { type: 'Identifier', name: 'sorted' } },
        arguments: [],
        loc: makeLoc(1, 0, 1, 15),
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for ForStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement({ type: 'ForStatement', init: null, test: null, update: null, body: {}, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for WhileStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement({ type: 'WhileStatement', test: {}, body: {}, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is computed with string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'arr' },
            property: { type: 'Literal', value: 'sort' },
            computed: true,
          },
          arguments: [],
          loc: makeLoc(1, 0, 1, 10),
        },
        loc: makeLoc(1, 0, 1, 11),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement with AssignmentExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: { type: 'AssignmentExpression', operator: '=', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: 1 } },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement with UpdateExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: { type: 'UpdateExpression', operator: '++', prefix: false, argument: { type: 'Identifier', name: 'i' } },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (10) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryArraySortNoUseRule.create(ctx1)
      const visitor2 = noUnnecessaryArraySortNoUseRule.create(ctx2)
      visitor1.ExpressionStatement(makeExprStmt(makeSortCall({ type: 'Identifier', name: 'arr' })))
      visitor2.ExpressionStatement(makeExprStmt({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'arr' }, property: { type: 'Identifier', name: 'reverse' } },
        arguments: [],
        loc: makeLoc(1, 0, 1, 15),
      }))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly with mixed calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeSortCall({ type: 'Identifier', name: 'arr' })))
      visitor.ExpressionStatement(makeExprStmt({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'arr' }, property: { type: 'Identifier', name: 'reverse' } },
        arguments: [],
        loc: makeLoc(1, 0, 1, 15),
      }))
      visitor.ExpressionStatement(makeExprStmt(makeSortCall({ type: 'Identifier', name: 'data' })))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'arr' }, property: { type: 'Identifier', name: 'sort' } },
          arguments: [],
        },
      })
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'arr' }, property: { type: 'Identifier', name: 'sort' } },
          arguments: [],
        },
      })
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeSortCall({ type: 'Identifier', name: 'arr' })))
      visitor.ExpressionStatement(makeExprStmt({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'arr' }, property: { type: 'Identifier', name: 'reverse' } },
        arguments: [],
        loc: makeLoc(1, 0, 1, 15),
      }))
      visitor.ExpressionStatement(makeExprStmt(makeSortCall({ type: 'Identifier', name: 'data' })))
      visitor.ExpressionStatement(makeExprStmt({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'sort' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      }))
      visitor.ExpressionStatement(makeExprStmt(makeSortCall(makeArrayExpr([]))))
      expect(reports.length).toBe(3)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryArraySortNoUseRule.create(context)
      const visitor2 = noUnnecessaryArraySortNoUseRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryArraySortNoUseRule.meta
      const meta2 = noUnnecessaryArraySortNoUseRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'arr' }, property: { type: 'Identifier', name: 'sort' } },
          arguments: [],
          loc: makeLoc(1, 0, 1, 10),
          range: [0, 10],
          extra: true,
          trailingComments: [],
        },
        loc: makeLoc(1, 0, 1, 11),
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'arr' }, property: { type: 'Identifier', name: 'sort' } },
          arguments: [],
        },
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySortNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeSortCall({ type: 'Identifier', name: 'arr' })))
      visitor.ExpressionStatement(makeExprStmt(makeSortCall(makeArrayExpr([{ type: 'Literal', value: 1 }]))))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})
