import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryArrayFillSameRule } from '../../../../src/rules/patterns/no-unnecessary-array-fill-same.js'
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

function makeFillCallNode(
  objectName: string,
  argName: string,
  extraArgs: unknown[] = [],
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
      property: { type: 'Identifier', name: 'fill' },
    },
    arguments: [{ type: 'Identifier', name: argName }, ...extraArgs],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
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
      object,
      property: { type: 'Identifier', name: methodName },
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

describe('no-unnecessary-array-fill-same rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryArrayFillSameRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryArrayFillSameRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryArrayFillSameRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryArrayFillSameRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryArrayFillSameRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning fill', () => {
      const desc = noUnnecessaryArrayFillSameRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/fill/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryArrayFillSameRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-array-fill-same.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryArrayFillSameRule.meta.schema).toEqual([])
    })
  })

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryArrayFillSameRule).toBeDefined()
      expect(noUnnecessaryArrayFillSameRule.meta).toBeDefined()
      expect(noUnnecessaryArrayFillSameRule.create).toBeDefined()
    })
  })

  describe('positive cases — reports arr.fill(arr)', () => {
    test('reports for arr.fill(arr)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression(makeFillCallNode('arr', 'arr'))
      expect(reports.length).toBe(1)
    })

    test('reports for data.fill(data)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression(makeFillCallNode('data', 'data'))
      expect(reports.length).toBe(1)
    })

    test('reports for list.fill(list)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression(makeFillCallNode('list', 'list'))
      expect(reports.length).toBe(1)
    })

    test('reports for x.fill(x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression(makeFillCallNode('x', 'x'))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.fill(arr, 0, 5) with extra arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression(makeFillCallNode('arr', 'arr', [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 5 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for items.fill(items, 1) with start argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression(makeFillCallNode('items', 'items', [{ type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions fill', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression(makeFillCallNode('arr', 'arr'))
      expect(reports[0].message).toMatch(/fill/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression(makeFillCallNode('arr', 'arr'))
      expect(reports[0].message).toBe(
        'arr.fill(arr) fills the array with itself. This is likely a mistake.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression(makeFillCallNode('arr', 'arr'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression(makeFillCallNode('arr', 'arr'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      const node = makeFillCallNode('arr', 'arr')
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression(makeFillCallNode('arr', 'arr', [], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression(makeFillCallNode('arr', 'arr'))
      visitor.CallExpression(makeFillCallNode('data', 'data'))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression(makeFillCallNode('arr', 'arr'))
      visitor.CallExpression(makeFillCallNode('data', 'data'))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for result.fill(result)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression(makeFillCallNode('result', 'result'))
      expect(reports.length).toBe(1)
    })

    test('reports for buffer.fill(buffer)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression(makeFillCallNode('buffer', 'buffer'))
      expect(reports.length).toBe(1)
    })

    test('reports for myArray.fill(myArray)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression(makeFillCallNode('myArray', 'myArray'))
      expect(reports.length).toBe(1)
    })

    test('reports for a.fill(a, 0, length) with identifier extra args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression(makeFillCallNode('a', 'a', [{ type: 'Literal', value: 0 }, { type: 'Identifier', name: 'length' }]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression(makeFillCallNode('arr', 'arr'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for single-letter variable a.fill(a)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression(makeFillCallNode('a', 'a'))
      expect(reports.length).toBe(1)
    })

    test('reports for underscore variable _.fill(_)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression(makeFillCallNode('_', '_'))
      expect(reports.length).toBe(1)
    })

    test('reports for long variable name thisIsALongArray.fill(thisIsALongArray)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression(makeFillCallNode('thisIsALongArray', 'thisIsALongArray'))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.fill(arr) with computed: false on callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'fill' },
          computed: false,
        },
        arguments: [{ type: 'Identifier', name: 'arr' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(1)
    })

    test('reports when computed is undefined (falsy)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression(makeFillCallNode('arr', 'arr'))
      expect(reports.length).toBe(1)
    })

    test('report message contains "fills the array with itself"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression(makeFillCallNode('arr', 'arr'))
      expect(reports[0].message).toContain('fills the array with itself')
    })

    test('report message contains "likely a mistake"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression(makeFillCallNode('arr', 'arr'))
      expect(reports[0].message).toContain('likely a mistake')
    })

    test('reports for nums.fill(nums)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression(makeFillCallNode('nums', 'nums'))
      expect(reports.length).toBe(1)
    })

    test('reports for output.fill(output)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression(makeFillCallNode('output', 'output'))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.fill(arr, 2) with only start offset', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression(makeFillCallNode('arr', 'arr', [{ type: 'Literal', value: 2 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for matrix.fill(matrix, 0, 3)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression(makeFillCallNode('matrix', 'matrix', [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 3 }]))
      expect(reports.length).toBe(1)
    })
  })

  describe('negative cases — does NOT report', () => {
    test('does not report for arr.fill(0) with Literal arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'fill', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for x.fill(y) — different names', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression(makeFillCallNode('x', 'y'))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.fill("hello") with string Literal arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'fill', [{ type: 'Literal', value: 'hello' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.fill(null) with null Literal arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'fill', [{ type: 'Literal', value: null }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.fill(undefined) with undefined Identifier arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression(makeFillCallNode('arr', 'undefined'))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.fill() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'fill', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.push(arr) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'push', [{ type: 'Identifier', name: 'arr' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.map(arr) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [{ type: 'Identifier', name: 'arr' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.filter(arr) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [{ type: 'Identifier', name: 'arr' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [{ type: 'Identifier', name: 'arr' }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [{ type: 'Identifier', name: 'arr' }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [{ type: 'Identifier', name: 'arr' }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'fill' },
        },
        arguments: [{ type: 'Identifier', name: 'arr' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is not an Identifier (MemberExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'arr' } }, 'fill', [{ type: 'Identifier', name: 'arr' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is not an Identifier (CallExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getArr' }, arguments: [] }, 'fill', [{ type: 'Identifier', name: 'arr' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is not an Identifier (ArrayExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: [] }, 'fill', [{ type: 'Identifier', name: 'arr' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'fill' },
        },
        arguments: [{ type: 'Identifier', name: 'arr' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'fill' },
        },
        arguments: [{ type: 'Identifier', name: 'arr' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Fill" (capitalized)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'Fill', [{ type: 'Identifier', name: 'arr' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "filled" (different method)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filled', [{ type: 'Identifier', name: 'arr' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is computed with string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'fill' },
          computed: true,
        },
        arguments: [{ type: 'Identifier', name: 'arr' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
        },
        arguments: [{ type: 'Identifier', name: 'arr' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: null,
        },
        arguments: [{ type: 'Identifier', name: 'arr' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arg[0] is missing (undefined)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'fill' },
        },
        arguments: [undefined],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arg[0] is ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'fill', [{ type: 'ObjectExpression', properties: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arg[0] is ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'fill', [{ type: 'ArrayExpression', elements: [] }]))
      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryArrayFillSameRule.create(ctx1)
      const visitor2 = noUnnecessaryArrayFillSameRule.create(ctx2)
      visitor1.CallExpression(makeFillCallNode('arr', 'arr'))
      visitor2.CallExpression(makeFillCallNode('x', 'y'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression(makeFillCallNode('arr', 'arr'))
      visitor.CallExpression(makeFillCallNode('x', 'y'))
      visitor.CallExpression(makeFillCallNode('data', 'data'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'fill' },
        },
        arguments: [{ type: 'Identifier', name: 'arr' }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'fill' },
        },
        arguments: [{ type: 'Identifier', name: 'arr' }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression(makeFillCallNode('arr', 'arr'))
      visitor.CallExpression(makeFillCallNode('x', 'y'))
      visitor.CallExpression(makeFillCallNode('data', 'data'))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'z' }, 'fill', [{ type: 'Literal', value: 0 }]))
      visitor.CallExpression(makeFillCallNode('list', 'list'))
      expect(reports.length).toBe(3)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryArrayFillSameRule.create(context)
      const visitor2 = noUnnecessaryArrayFillSameRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryArrayFillSameRule.meta
      const meta2 = noUnnecessaryArrayFillSameRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'fill' },
        },
        arguments: [{ type: 'Identifier', name: 'arr' }],
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
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'fill' },
        },
        arguments: [{ type: 'Identifier', name: 'arr' }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'fill' },
        },
        arguments: [{ type: 'Identifier', name: 'arr' }],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      const node = makeFillCallNode('arr', 'arr')
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryArrayFillSameRule).toBeDefined()
      expect(typeof noUnnecessaryArrayFillSameRule.create).toBe('function')
      expect(typeof noUnnecessaryArrayFillSameRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'fill' },
        },
        arguments: [{ type: 'Identifier', name: 'arr' }],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression(makeFillCallNode('arr', 'arr', [], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression(makeFillCallNode('arr', 'arr'))
      visitor.CallExpression(makeFillCallNode('data', 'data'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('does not report when arg[0] is FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'fill', [{ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arg[0] is ArrowFunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillSameRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'fill', [{ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }]))
      expect(reports.length).toBe(0)
    })
  })
})
