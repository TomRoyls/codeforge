import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryArraySpliceNoUse } from '../../../../src/rules/patterns/no-unnecessary-array-splice-no-use.js'
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

function makeSpliceNode(
  object: unknown,
  args: unknown[] = [],
  parentType = 'ExpressionStatement',
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
      property: { type: 'Identifier', name: 'splice' },
      computed: false,
    },
    arguments: args,
    parent: { type: parentType },
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeArrayExpr(elements: unknown[]): unknown {
  return { type: 'ArrayExpression', elements }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-array-splice-no-use rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryArraySpliceNoUse.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryArraySpliceNoUse.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryArraySpliceNoUse.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryArraySpliceNoUse.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryArraySpliceNoUse.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning splice', () => {
      const desc = noUnnecessaryArraySpliceNoUse.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/splice/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryArraySpliceNoUse.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-array-splice-no-use.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryArraySpliceNoUse.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryArraySpliceNoUse).toBeDefined()
      expect(noUnnecessaryArraySpliceNoUse.meta).toBeDefined()
      expect(noUnnecessaryArraySpliceNoUse.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (30) =====

  describe('positive cases — reports unnecessary splice', () => {
    test('reports for arr.splice(0, 2) as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression(makeSpliceNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for [1,2,3].splice(1, 1) as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression(makeSpliceNode(
        makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }]),
        [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 1 }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.splice(0, 0) with zero values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression(makeSpliceNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 0 }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.splice(1, 5) with positive values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression(makeSpliceNode(
        { type: 'Identifier', name: 'data' },
        [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 5 }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for splice with identifier arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression(makeSpliceNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Identifier', name: 'start' }, { type: 'Identifier', name: 'count' }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for splice with three arguments splice(0, 2, "x")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression(makeSpliceNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 'x' }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for splice with many arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression(makeSpliceNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 'a' }, { type: 'Literal', value: 'b' }, { type: 'Literal', value: 'c' }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array literal [].splice(0, 1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression(makeSpliceNode(
        makeArrayExpr([]),
        [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 1 }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for member expression object obj.list.splice(0, 2)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression(makeSpliceNode(
        { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'list' } },
        [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for negative first argument arr.splice(-1, 1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression(makeSpliceNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'UnaryExpression', operator: '-', prefix: true, argument: { type: 'Literal', value: 1 } }, { type: 'Literal', value: 1 }],
      ))
      expect(reports.length).toBe(1)
    })

    test('report message mentions splice result is not used', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression(makeSpliceNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }],
      ))
      expect(reports[0].message).toMatch(/splice/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression(makeSpliceNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }],
      ))
      expect(reports[0].message).toBe(
        'Array.prototype.splice() result is not used. splice() returns the removed elements. Capture the result if needed.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression(makeSpliceNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }],
      ))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression(makeSpliceNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }],
      ))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      const node = makeSpliceNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }],
      )
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression(makeSpliceNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }],
        'ExpressionStatement',
        5, 10, 5, 30,
      ))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression(makeSpliceNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }],
      ))
      visitor.CallExpression(makeSpliceNode(
        { type: 'Identifier', name: 'list' },
        [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 3 }],
      ))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression(makeSpliceNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }],
      ))
      visitor.CallExpression(makeSpliceNode(
        { type: 'Identifier', name: 'list' },
        [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 3 }],
      ))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports with call expression as argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression(makeSpliceNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'getStart' }, arguments: [] }, { type: 'Literal', value: 2 }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports with member expression as argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression(makeSpliceNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'idx' } }, { type: 'Literal', value: 1 }],
      ))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression(makeSpliceNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }],
      ))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports with string literal arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression(makeSpliceNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Literal', value: 'start' }, { type: 'Literal', value: 'count' }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports with binary expression arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression(makeSpliceNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'BinaryExpression', operator: '+', left: { type: 'Literal', value: 1 }, right: { type: 'Literal', value: 2 } }, { type: 'Literal', value: 3 }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports with template literal arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression(makeSpliceNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'TemplateLiteral', quasis: [], expressions: [] }, { type: 'Literal', value: 1 }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports with conditional expression arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression(makeSpliceNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 0 }, alternate: { type: 'Literal', value: 1 } }, { type: 'Literal', value: 2 }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports with spread element in arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression(makeSpliceNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }, { type: 'Literal', value: 1 }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports when ExpressionStatement parent has directive property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'splice' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }],
        parent: { type: 'ExpressionStatement', directive: 'use strict' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for call expression object fn().splice(0, 1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression(makeSpliceNode(
        { type: 'CallExpression', callee: { type: 'Identifier', name: 'getArray' }, arguments: [] },
        [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 1 }],
      ))
      expect(reports.length).toBe(1)
    })

    test('report message mentions removed elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression(makeSpliceNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }],
      ))
      expect(reports[0].message).toMatch(/removed elements/)
    })

    test('reports with arrow function expression as third argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression(makeSpliceNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 1 }, { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for array in nested member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression(makeSpliceNode(
        { type: 'MemberExpression', object: { type: 'Identifier', name: 'data' }, property: { type: 'Identifier', name: 'items' } },
        [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 5 }],
      ))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for splice with 0 arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression(makeSpliceNode(
        { type: 'Identifier', name: 'arr' },
        [],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for splice with 1 argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression(makeSpliceNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Literal', value: 0 }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report when result assigned to variable (VariableDeclarator parent)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression(makeSpliceNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }],
        'VariableDeclarator',
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report when result returned (ReturnStatement parent)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression(makeSpliceNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }],
        'ReturnStatement',
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report when result used in call (CallExpression parent)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression(makeSpliceNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }],
        'CallExpression',
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for slice instead of splice', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'slice' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }],
        parent: { type: 'ExpressionStatement' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for method name "pop"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'pop' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }],
        parent: { type: 'ExpressionStatement' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for method name "shift"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'shift' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }],
        parent: { type: 'ExpressionStatement' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is computed', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'splice' },
          computed: true,
        },
        arguments: [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }],
        parent: { type: 'ExpressionStatement' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'splice' },
        arguments: [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }],
        parent: { type: 'ExpressionStatement' },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'splice' },
          computed: true,
        },
        arguments: [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }],
        parent: { type: 'ExpressionStatement' },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "splce" (typo)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'splce' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }],
        parent: { type: 'ExpressionStatement' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Splice" (case-sensitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'Splice' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }],
        parent: { type: 'ExpressionStatement' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when parent is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'splice' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when parent is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'splice' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }],
        parent: null,
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when parent is IfStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression(makeSpliceNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }],
        'IfStatement',
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report when parent is BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression(makeSpliceNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }],
        'BinaryExpression',
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report when parent is LogicalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression(makeSpliceNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }],
        'LogicalExpression',
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report when parent is ConditionalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression(makeSpliceNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }],
        'ConditionalExpression',
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report when parent is MemberExpression (chained)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression(makeSpliceNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }],
        'MemberExpression',
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report when parent is AwaitExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression(makeSpliceNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }],
        'AwaitExpression',
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report when parent is SequenceExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression(makeSpliceNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }],
        'SequenceExpression',
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report when parent is ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression(makeSpliceNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }],
        'ArrayExpression',
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report when parent is ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression(makeSpliceNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }],
        'ObjectExpression',
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report when parent is ParenthesizedExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression(makeSpliceNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }],
        'ParenthesizedExpression',
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report when parent is TemplateLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression(makeSpliceNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }],
        'TemplateLiteral',
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        arguments: [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }],
        parent: { type: 'ExpressionStatement' },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: null,
        arguments: [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }],
        parent: { type: 'ExpressionStatement' },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "spliced"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'spliced' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }],
        parent: { type: 'ExpressionStatement' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }],
        parent: { type: 'ExpressionStatement' },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: null,
          computed: false,
        },
        arguments: [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }],
        parent: { type: 'ExpressionStatement' },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryArraySpliceNoUse.create(ctx1)
      const visitor2 = noUnnecessaryArraySpliceNoUse.create(ctx2)
      visitor1.CallExpression(makeSpliceNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }],
      ))
      visitor2.CallExpression(makeSpliceNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Literal', value: 0 }],
      ))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly with mixed cases', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression(makeSpliceNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }],
      ))
      visitor.CallExpression(makeSpliceNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Literal', value: 0 }],
      ))
      visitor.CallExpression(makeSpliceNode(
        { type: 'Identifier', name: 'list' },
        [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 3 }],
        'ReturnStatement',
      ))
      visitor.CallExpression(makeSpliceNode(
        { type: 'Identifier', name: 'data' },
        [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 5 }],
      ))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'splice' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }],
        parent: { type: 'ExpressionStatement' },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'splice' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }],
        parent: { type: 'ExpressionStatement' },
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression(makeSpliceNode({ type: 'Identifier', name: 'arr' }, [{ type: 'Literal', value: 0 }]))
      visitor.CallExpression(makeSpliceNode({ type: 'Identifier', name: 'arr' }, [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }]))
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'slice' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }],
        parent: { type: 'ExpressionStatement' },
        loc: makeLoc(1, 0, 1, 20),
      })
      visitor.CallExpression(makeSpliceNode({ type: 'Identifier', name: 'arr' }, [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 'x' }]))
      visitor.CallExpression(makeSpliceNode({ type: 'Identifier', name: 'arr' }, [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }], 'VariableDeclarator'))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryArraySpliceNoUse.create(context)
      const visitor2 = noUnnecessaryArraySpliceNoUse.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryArraySpliceNoUse.meta
      const meta2 = noUnnecessaryArraySpliceNoUse.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'splice' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }],
        parent: { type: 'ExpressionStatement' },
        loc: makeLoc(1, 0, 1, 20),
        range: [0, 20],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'splice' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }],
        parent: { type: 'ExpressionStatement' },
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'splice' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }],
        parent: { type: 'ExpressionStatement' },
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      const node = makeSpliceNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }],
      )
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryArraySpliceNoUse).toBeDefined()
      expect(typeof noUnnecessaryArraySpliceNoUse.create).toBe('function')
      expect(typeof noUnnecessaryArraySpliceNoUse.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'splice' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }],
        parent: { type: 'ExpressionStatement' },
        loc: makeLoc(1, 0, 1, 20),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceNoUse.create(context)
      visitor.CallExpression(makeSpliceNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 2 }],
        'ExpressionStatement',
        10, 4, 10, 25,
      ))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })
  })
})
