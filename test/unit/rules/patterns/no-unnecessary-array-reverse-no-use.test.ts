import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryArrayReverseNoUseRule } from '../../../../src/rules/patterns/no-unnecessary-array-reverse-no-use.js'
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

function makeExprStmt(
  expression: unknown,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'ExpressionStatement',
    expression,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeReverseCall(object: unknown): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object,
      property: { type: 'Identifier', name: 'reverse' },
    },
    arguments: [],
    loc: makeLoc(1, 0, 1, 20),
  }
}

function makeArrayExpr(elements: unknown[]): unknown {
  return { type: 'ArrayExpression', elements }
}

function makeIdent(name: string): unknown {
  return { type: 'Identifier', name }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-array-reverse-no-use rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryArrayReverseNoUseRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryArrayReverseNoUseRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryArrayReverseNoUseRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryArrayReverseNoUseRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryArrayReverseNoUseRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning reverse', () => {
      const desc = noUnnecessaryArrayReverseNoUseRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/reverse/)
    })

    test('should have a docs URL', () => {
      expect(noUnnecessaryArrayReverseNoUseRule.meta.docs?.url).toBeTruthy()
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryArrayReverseNoUseRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with ExpressionStatement', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      expect(visitor).toHaveProperty('ExpressionStatement')
      expect(typeof visitor.ExpressionStatement).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryArrayReverseNoUseRule).toBeDefined()
      expect(noUnnecessaryArrayReverseNoUseRule.meta).toBeDefined()
      expect(noUnnecessaryArrayReverseNoUseRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (35) =====

  describe('positive cases — reports unnecessary .reverse() as statement', () => {
    test('reports for arr.reverse() as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeReverseCall(makeIdent('arr'))))
      expect(reports.length).toBe(1)
    })

    test('reports for [1, 2, 3].reverse() as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeReverseCall(makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }]))))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array [].reverse() as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeReverseCall(makeArrayExpr([]))))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array [1].reverse() as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeReverseCall(makeArrayExpr([{ type: 'Literal', value: 1 }]))))
      expect(reports.length).toBe(1)
    })

    test('reports for this.arr.reverse() as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      const thisExpr = { type: 'ThisExpression' }
      visitor.ExpressionStatement(makeExprStmt(makeReverseCall({ type: 'MemberExpression', object: thisExpr, property: makeIdent('arr') })))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.items.reverse() as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeReverseCall({ type: 'MemberExpression', object: makeIdent('obj'), property: makeIdent('items') })))
      expect(reports.length).toBe(1)
    })

    test('reports for nested member expression getItems().reverse() as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeReverseCall({ type: 'CallExpression', callee: makeIdent('getItems'), arguments: [] })))
      expect(reports.length).toBe(1)
    })

    test('report message mentions .reverse()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeReverseCall(makeIdent('arr'))))
      expect(reports[0].message).toMatch(/reverse/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeReverseCall(makeIdent('arr'))))
      expect(reports[0].message).toBe(
        'Unnecessary .reverse() as a statement. .reverse() mutates the array in place. The result is discarded. Assign it or use the return value.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeReverseCall(makeIdent('arr'))))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeReverseCall(makeIdent('arr'))))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input ExpressionStatement node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      const node = makeExprStmt(makeReverseCall(makeIdent('arr')))
      visitor.ExpressionStatement(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeReverseCall(makeIdent('arr')), 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeReverseCall(makeIdent('arr'))))
      visitor.ExpressionStatement(makeExprStmt(makeReverseCall(makeArrayExpr([]))))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeReverseCall(makeIdent('arr'))))
      visitor.ExpressionStatement(makeExprStmt(makeReverseCall(makeArrayExpr([]))))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeReverseCall(makeIdent('arr'))))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for [true, false].reverse() as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeReverseCall(makeArrayExpr([{ type: 'Literal', value: true }, { type: 'Literal', value: false }]))))
      expect(reports.length).toBe(1)
    })

    test('reports for string array ["a", "b"].reverse() as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeReverseCall(makeArrayExpr([{ type: 'Literal', value: 'a' }, { type: 'Literal', value: 'b' }]))))
      expect(reports.length).toBe(1)
    })

    test('reports for [null, undefined].reverse() as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeReverseCall(makeArrayExpr([{ type: 'Literal', value: null }, { type: 'Identifier', name: 'undefined' }]))))
      expect(reports.length).toBe(1)
    })

    test('reports for fn().reverse() as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      const fnCall = { type: 'CallExpression', callee: makeIdent('fn'), arguments: [] }
      visitor.ExpressionStatement(makeExprStmt(makeReverseCall(fnCall)))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.slice().reverse() as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      const sliceCall = { type: 'CallExpression', callee: { type: 'MemberExpression', object: makeIdent('arr'), property: makeIdent('slice') }, arguments: [] }
      visitor.ExpressionStatement(makeExprStmt(makeReverseCall(sliceCall)))
      expect(reports.length).toBe(1)
    })

    test('reports for data[0].reverse() as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      const memberAccess = { type: 'MemberExpression', object: makeIdent('data'), property: { type: 'Literal', value: 0 }, computed: true }
      visitor.ExpressionStatement(makeExprStmt(makeReverseCall(memberAccess)))
      expect(reports.length).toBe(1)
    })

    test('reports with arguments passed to reverse', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      const reverseWithArgs = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdent('arr'),
          property: { type: 'Identifier', name: 'reverse' },
        },
        arguments: [{ type: 'Literal', value: 42 }],
      }
      visitor.ExpressionStatement(makeExprStmt(reverseWithArgs))
      expect(reports.length).toBe(1)
    })

    test('report loc end values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeReverseCall(makeIdent('arr')), 3, 5, 3, 25))
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports for [obj].reverse() as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeReverseCall(makeArrayExpr([{ type: 'ObjectExpression', properties: [] }]))))
      expect(reports.length).toBe(1)
    })

    test('reports for list.reverse() as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeReverseCall(makeIdent('list'))))
      expect(reports.length).toBe(1)
    })

    test('reports for items.reverse() as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeReverseCall(makeIdent('items'))))
      expect(reports.length).toBe(1)
    })

    test('reports for collection.reverse() as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeReverseCall(makeIdent('collection'))))
      expect(reports.length).toBe(1)
    })

    test('reports for deeply nested obj.a.b.c.reverse() as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      const deepAccess = { type: 'MemberExpression', object: { type: 'MemberExpression', object: { type: 'MemberExpression', object: makeIdent('obj'), property: makeIdent('a') }, property: makeIdent('b') }, property: makeIdent('c') }
      visitor.ExpressionStatement(makeExprStmt(makeReverseCall(deepAccess)))
      expect(reports.length).toBe(1)
    })

    test('reports for array spread [...arr].reverse() as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeReverseCall(makeArrayExpr([{ type: 'SpreadElement', argument: makeIdent('arr') }]))))
      expect(reports.length).toBe(1)
    })

    test('reports for globalThis.arr.reverse() as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeReverseCall({ type: 'MemberExpression', object: makeIdent('globalThis'), property: makeIdent('arr') })))
      expect(reports.length).toBe(1)
    })

    test('reports for window.data.reverse() as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeReverseCall({ type: 'MemberExpression', object: makeIdent('window'), property: makeIdent('data') })))
      expect(reports.length).toBe(1)
    })

    test('reports for arr?.reverse() as statement (optional chaining)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      const reverseCall = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdent('arr'),
          property: { type: 'Identifier', name: 'reverse' },
          optional: true,
        },
        arguments: [],
      }
      visitor.ExpressionStatement(makeExprStmt(reverseCall))
      expect(reports.length).toBe(1)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      const node = makeExprStmt(makeReverseCall(makeIdent('arr')))
      visitor.ExpressionStatement(node)
      visitor.ExpressionStatement(node)
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(3)
    })

    test('reports for BigInt array [1n, 2n].reverse() as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeReverseCall(makeArrayExpr([{ type: 'Literal', value: 1n }, { type: 'Literal', value: 2n }]))))
      expect(reports.length).toBe(1)
    })

    test('reports for computed member arr["reverse"]() when identifier name is reverse', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      const callNode = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdent('arr'),
          property: { type: 'Identifier', name: 'reverse' },
          computed: false,
        },
        arguments: [],
      }
      visitor.ExpressionStatement(makeExprStmt(callNode))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for arr.sort() as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      const sortCall = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdent('arr'),
          property: { type: 'Identifier', name: 'sort' },
        },
        arguments: [],
      }
      visitor.ExpressionStatement(makeExprStmt(sortCall))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.map(fn) as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      const mapCall = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdent('arr'),
          property: { type: 'Identifier', name: 'map' },
        },
        arguments: [makeIdent('fn')],
      }
      visitor.ExpressionStatement(makeExprStmt(mapCall))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.forEach(fn) as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      const forEachCall = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdent('arr'),
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [makeIdent('fn')],
      }
      visitor.ExpressionStatement(makeExprStmt(forEachCall))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.push(x) as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      const pushCall = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdent('arr'),
          property: { type: 'Identifier', name: 'push' },
        },
        arguments: [makeIdent('x')],
      }
      visitor.ExpressionStatement(makeExprStmt(pushCall))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.pop() as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      const popCall = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdent('arr'),
          property: { type: 'Identifier', name: 'pop' },
        },
        arguments: [],
      }
      visitor.ExpressionStatement(makeExprStmt(popCall))
      expect(reports.length).toBe(0)
    })

    test('does not report for property name "reversed" (different name)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      const call = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdent('arr'),
          property: { type: 'Identifier', name: 'reversed' },
        },
        arguments: [],
      }
      visitor.ExpressionStatement(makeExprStmt(call))
      expect(reports.length).toBe(0)
    })

    test('does not report for property name "toReversed" (different method)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      const call = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdent('arr'),
          property: { type: 'Identifier', name: 'toReversed' },
        },
        arguments: [],
      }
      visitor.ExpressionStatement(makeExprStmt(call))
      expect(reports.length).toBe(0)
    })

    test('does not report for property name "Reverse" (capitalized)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      const call = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdent('arr'),
          property: { type: 'Identifier', name: 'Reverse' },
        },
        arguments: [],
      }
      visitor.ExpressionStatement(makeExprStmt(call))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      expect(() => visitor.ExpressionStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      expect(() => visitor.ExpressionStatement(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      expect(() => visitor.ExpressionStatement({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      expect(() => visitor.ExpressionStatement('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      expect(() => visitor.ExpressionStatement(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      expect(() => visitor.ExpressionStatement(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for node with wrong type (not ExpressionStatement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      visitor.ExpressionStatement({ type: 'VariableDeclaration', declarations: [], kind: 'const' })
      expect(reports.length).toBe(0)
    })

    test('does not report when expression is not a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeIdent('x')))
      expect(reports.length).toBe(0)
    })

    test('does not report when expression is an AssignmentExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      const assignExpr = {
        type: 'AssignmentExpression',
        operator: '=',
        left: makeIdent('x'),
        right: makeReverseCall(makeIdent('arr')),
      }
      visitor.ExpressionStatement(makeExprStmt(assignExpr))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      const call = {
        type: 'CallExpression',
        callee: makeIdent('reverse'),
        arguments: [],
      }
      visitor.ExpressionStatement(makeExprStmt(call))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      const call = {
        type: 'CallExpression',
        arguments: [],
      }
      visitor.ExpressionStatement(makeExprStmt(call))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      const call = {
        type: 'CallExpression',
        callee: null,
        arguments: [],
      }
      visitor.ExpressionStatement(makeExprStmt(call))
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      const call = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdent('arr'),
          property: { type: 'Literal', value: 'reverse' },
          computed: true,
        },
        arguments: [],
      }
      visitor.ExpressionStatement(makeExprStmt(call))
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      const call = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdent('arr'),
        },
        arguments: [],
      }
      visitor.ExpressionStatement(makeExprStmt(call))
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      const call = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdent('arr'),
          property: null,
        },
        arguments: [],
      }
      visitor.ExpressionStatement(makeExprStmt(call))
      expect(reports.length).toBe(0)
    })

    test('does not report when expression is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      visitor.ExpressionStatement({ type: 'ExpressionStatement', loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when expression is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      visitor.ExpressionStatement({ type: 'ExpressionStatement', expression: null, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      visitor.ExpressionStatement({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      visitor.ExpressionStatement({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      visitor.ExpressionStatement({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      visitor.ExpressionStatement({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UpdateExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      visitor.ExpressionStatement({ type: 'UpdateExpression', operator: '++', prefix: false, argument: makeIdent('i'), loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ThrowStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      visitor.ExpressionStatement({ type: 'ThrowStatement', argument: {}, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for a chain like arr.reverse().map(fn) — outer call is not reverse', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      const reverseCall = makeReverseCall(makeIdent('arr'))
      const mapCall = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: reverseCall,
          property: makeIdent('map'),
        },
        arguments: [makeIdent('fn')],
      }
      visitor.ExpressionStatement(makeExprStmt(mapCall))
      expect(reports.length).toBe(0)
    })

    test('does not report for a chain like arr.reverse().forEach(fn) — outer is forEach', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      const reverseCall = makeReverseCall(makeIdent('arr'))
      const forEachCall = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: reverseCall,
          property: makeIdent('forEach'),
        },
        arguments: [makeIdent('fn')],
      }
      visitor.ExpressionStatement(makeExprStmt(forEachCall))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.filter(fn) as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      const filterCall = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdent('arr'),
          property: { type: 'Identifier', name: 'filter' },
        },
        arguments: [makeIdent('fn')],
      }
      visitor.ExpressionStatement(makeExprStmt(filterCall))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.join(",") as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      const joinCall = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdent('arr'),
          property: { type: 'Identifier', name: 'join' },
        },
        arguments: [{ type: 'Literal', value: ',' }],
      }
      visitor.ExpressionStatement(makeExprStmt(joinCall))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.slice() as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      const sliceCall = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdent('arr'),
          property: { type: 'Identifier', name: 'slice' },
        },
        arguments: [],
      }
      visitor.ExpressionStatement(makeExprStmt(sliceCall))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.splice(0, 1) as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      const spliceCall = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdent('arr'),
          property: { type: 'Identifier', name: 'splice' },
        },
        arguments: [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 1 }],
      }
      visitor.ExpressionStatement(makeExprStmt(spliceCall))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.concat(other) as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      const concatCall = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdent('arr'),
          property: { type: 'Identifier', name: 'concat' },
        },
        arguments: [makeIdent('other')],
      }
      visitor.ExpressionStatement(makeExprStmt(concatCall))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "reverse" but node type is not ExpressionStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      visitor.ExpressionStatement({ type: 'CallExpression', callee: { type: 'MemberExpression', object: makeIdent('arr'), property: { type: 'Identifier', name: 'reverse' } }, arguments: [], loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (10) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryArrayReverseNoUseRule.create(ctx1)
      const visitor2 = noUnnecessaryArrayReverseNoUseRule.create(ctx2)
      visitor1.ExpressionStatement(makeExprStmt(makeReverseCall(makeIdent('arr'))))
      visitor2.ExpressionStatement(makeExprStmt(makeReverseCall(makeIdent('arr'))))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(1)
    })

    test('visitor accumulates reports correctly with mixed calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeReverseCall(makeIdent('arr'))))
      visitor.ExpressionStatement(makeExprStmt({ type: 'CallExpression', callee: makeIdent('fn'), arguments: [] }))
      visitor.ExpressionStatement(makeExprStmt(makeReverseCall(makeArrayExpr([]))))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: makeReverseCall(makeIdent('arr')),
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: makeReverseCall(makeIdent('arr')),
      }
      visitor.ExpressionStatement(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryArrayReverseNoUseRule.create(context)
      const visitor2 = noUnnecessaryArrayReverseNoUseRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryArrayReverseNoUseRule.meta
      const meta2 = noUnnecessaryArrayReverseNoUseRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: makeReverseCall(makeIdent('arr')),
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        trailingComments: [],
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: makeReverseCall(makeIdent('arr')),
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: makeReverseCall(makeIdent('arr')),
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReverseNoUseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeReverseCall(makeIdent('arr')), 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })
  })
})
