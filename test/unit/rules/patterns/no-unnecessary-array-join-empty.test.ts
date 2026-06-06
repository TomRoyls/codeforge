import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryArrayJoinEmpty } from '../../../../src/rules/patterns/no-unnecessary-array-join-empty.js'
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

function makeArrayExpr(elements: unknown[]): unknown {
  return { type: 'ArrayExpression', elements }
}

function emptyStrArg(): unknown {
  return { type: 'Literal', value: '' }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-array-join-empty rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryArrayJoinEmpty.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryArrayJoinEmpty.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryArrayJoinEmpty.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryArrayJoinEmpty.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryArrayJoinEmpty.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning join', () => {
      const desc = noUnnecessaryArrayJoinEmpty.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/join/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryArrayJoinEmpty.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-array-join-empty.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryArrayJoinEmpty.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryArrayJoinEmpty).toBeDefined()
      expect(noUnnecessaryArrayJoinEmpty.meta).toBeDefined()
      expect(noUnnecessaryArrayJoinEmpty.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (28) =====

  describe('positive cases — reports unnecessary join with empty string', () => {
    test('reports for arr.join("") with Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'join', [emptyStrArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for [].join("") with ArrayExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'join', [emptyStrArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for [1,2,3].join("") with multi-element array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression(
        makeCallNode(
          makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }]),
          'join',
          [emptyStrArg()],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for obj.arr.join("") with MemberExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression(
        makeCallNode(
          { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'arr' } },
          'join',
          [emptyStrArg()],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for getArr().join("") with CallExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression(
        makeCallNode(
          { type: 'CallExpression', callee: { type: 'Identifier', name: 'getArr' }, arguments: [] },
          'join',
          [emptyStrArg()],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('report message mentions join', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'join', [emptyStrArg()]))
      expect(reports[0].message).toMatch(/join/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'join', [emptyStrArg()]))
      expect(reports[0].message).toBe(
        `Array.prototype.join('') is the same as join() with no arguments. Use join() for clarity.`,
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'join', [emptyStrArg()]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'join', [emptyStrArg()]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'join', [emptyStrArg()])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'join', [emptyStrArg()], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'join', [emptyStrArg()]))
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'join', [emptyStrArg()]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'join', [emptyStrArg()]))
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'join', [emptyStrArg()]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for array with null element .join("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([null]), 'join', [emptyStrArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for array with SpreadElement .join("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression(
        makeCallNode(
          makeArrayExpr([{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }]),
          'join',
          [emptyStrArg()],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for array with ArrowFunctionExpression .join("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression(
        makeCallNode(
          makeArrayExpr([{ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }]),
          'join',
          [emptyStrArg()],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for array with ObjectExpression .join("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression(
        makeCallNode(makeArrayExpr([{ type: 'ObjectExpression', properties: [] }]), 'join', [emptyStrArg()]),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for array with ConditionalExpression .join("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression(
        makeCallNode(
          makeArrayExpr([
            {
              type: 'ConditionalExpression',
              test: { type: 'Identifier', name: 'x' },
              consequent: { type: 'Literal', value: 1 },
              alternate: { type: 'Literal', value: 2 },
            },
          ]),
          'join',
          [emptyStrArg()],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for array with TemplateLiteral .join("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression(
        makeCallNode(
          makeArrayExpr([{ type: 'TemplateLiteral', quasis: [], expressions: [] }]),
          'join',
          [emptyStrArg()],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for array with CallExpression element .join("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression(
        makeCallNode(
          makeArrayExpr([{ type: 'CallExpression', callee: { type: 'Identifier', name: 'getValue' }, arguments: [] }]),
          'join',
          [emptyStrArg()],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports with specific location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'join', [emptyStrArg()], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('reports for array with boolean element .join("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'BooleanLiteral', value: true }]), 'join', [emptyStrArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for array with regex element .join("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression(
        makeCallNode(makeArrayExpr([{ type: 'RegExpLiteral', value: /test/ }]), 'join', [emptyStrArg()]),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for array with nested array element .join("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression(
        makeCallNode(
          makeArrayExpr([makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }])]),
          'join',
          [emptyStrArg()],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'join', [emptyStrArg()]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for array with MemberExpression element .join("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression(
        makeCallNode(
          makeArrayExpr([{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'key' } }]),
          'join',
          [emptyStrArg()],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for {}.join("") with ObjectExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ObjectExpression', properties: [] }, 'join', [emptyStrArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for StringLiteral object .join("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'join', [emptyStrArg()]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for arr.join() — no args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'join', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.join(", ") — non-empty string separator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'join', [{ type: 'Literal', value: ', ' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.join("-") — non-empty string separator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'join', [{ type: 'Literal', value: '-' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.join(sep) — variable arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'join', [{ type: 'Identifier', name: 'sep' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.join("", extra) — too many args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'join', [emptyStrArg(), { type: 'Identifier', name: 'extra' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.split("") — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'split', [emptyStrArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.join(0) — number arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'join', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.concat("") — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'concat', [emptyStrArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [emptyStrArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [emptyStrArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [emptyStrArg()],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'join' },
        },
        arguments: [emptyStrArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "map" — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [emptyStrArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Join" — case sensitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'Join', [emptyStrArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee computed is true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'join' },
          computed: true,
        },
        arguments: [emptyStrArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
        },
        arguments: [emptyStrArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: null,
        },
        arguments: [emptyStrArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arg is Identifier type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'join', [{ type: 'Identifier', name: 'sep' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arg value is "hello" (non-empty string)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'join', [{ type: 'Literal', value: 'hello' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arg is NumericLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'join', [{ type: 'Literal', value: 42 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arg is BooleanLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'join', [{ type: 'BooleanLiteral', value: true }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arg is TemplateLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'arr' }, 'join', [{ type: 'TemplateLiteral', quasis: [], expressions: [] }]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.map("") — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [emptyStrArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.flat("") — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [emptyStrArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is empty array (no args)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'join'))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments has 3 elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'arr' }, 'join', [emptyStrArg(), { type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when arg value is whitespace string " "', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'join', [{ type: 'Literal', value: ' ' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.push("") — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'push', [emptyStrArg()]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (17) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryArrayJoinEmpty.create(ctx1)
      const visitor2 = noUnnecessaryArrayJoinEmpty.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'join', [emptyStrArg()]))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'join', [{ type: 'Literal', value: ', ' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'join', [emptyStrArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'join', [{ type: 'Literal', value: ', ' }]))
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'join', [emptyStrArg()]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'join' },
        },
        arguments: [emptyStrArg()],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'join' },
        },
        arguments: [emptyStrArg()],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'join', [{ type: 'Literal', value: ', ' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'join', [emptyStrArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'split', [emptyStrArg()]))
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'join', [emptyStrArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'join', [{ type: 'Identifier', name: 'sep' }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryArrayJoinEmpty.create(context)
      const visitor2 = noUnnecessaryArrayJoinEmpty.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryArrayJoinEmpty.meta
      const meta2 = noUnnecessaryArrayJoinEmpty.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'join' },
        },
        arguments: [emptyStrArg()],
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
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'join' },
        },
        arguments: [emptyStrArg()],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'join' },
        },
        arguments: [emptyStrArg()],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'join', [emptyStrArg()])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryArrayJoinEmpty).toBeDefined()
      expect(typeof noUnnecessaryArrayJoinEmpty.create).toBe('function')
      expect(typeof noUnnecessaryArrayJoinEmpty.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'join' },
        },
        arguments: [emptyStrArg()],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'join', [emptyStrArg()], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('does not report for computed member expression with string literal property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'join' },
          computed: true,
        },
        arguments: [emptyStrArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'join', [emptyStrArg()]))
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'join', [emptyStrArg()]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('handles computed: false explicitly set — should report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayJoinEmpty.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'join' },
          computed: false,
        },
        arguments: [emptyStrArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })
  })
})
