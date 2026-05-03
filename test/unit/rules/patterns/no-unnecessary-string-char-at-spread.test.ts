import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringCharAtSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-string-char-at-spread.js'
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

// ===== META TESTS (8) =====

describe('no-unnecessary-string-char-at-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringCharAtSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringCharAtSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringCharAtSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringCharAtSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringCharAtSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning charAt', () => {
      const desc = noUnnecessaryStringCharAtSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/charat/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringCharAtSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-char-at-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringCharAtSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringCharAtSpreadRule).toBeDefined()
      expect(noUnnecessaryStringCharAtSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryStringCharAtSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports charAt with spread', () => {
    test('reports for str.charAt(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for "hello".charAt(...args)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'charAt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for foo.bar.charAt(...indices)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'foo' }, property: { type: 'Identifier', name: 'bar' } }, 'charAt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'indices' } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for getStr().charAt(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getStr' }, arguments: [] }, 'charAt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr[0].charAt(...pos)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'arr' }, property: { type: 'Literal', value: 0 }, computed: true }, 'charAt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'pos' } }]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions charAt and spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports[0].message).toMatch(/charAt/)
    })

    test('report message mentions spread is unusual', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports[0].message).toMatch(/spread is unusual/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports[0].message).toBe(
        'str.charAt(...items) with spread is unusual. charAt() expects an index number.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'charAt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'x' } }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'charAt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'y' } }]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'charAt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'x' } }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'charAt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'y' } }]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for str.charAt(...[0])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [{ type: 'SpreadElement', argument: { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 0 }] } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for str.charAt(...arr)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for template literal object calling charAt with spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'TemplateLiteral', quasis: [], expressions: [] }, 'charAt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for conditional expression object calling charAt with spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 'a' }, alternate: { type: 'Literal', value: 'b' } }, 'charAt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for binary expression object calling charAt with spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'BinaryExpression', operator: '+', left: { type: 'Literal', value: 'a' }, right: { type: 'Literal', value: 'b' } }, 'charAt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(1)
    })

    test('reports when spread argument is a call expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [{ type: 'SpreadElement', argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getIndices' }, arguments: [] } }]))
      expect(reports.length).toBe(1)
    })

    test('reports when spread argument is a member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [{ type: 'SpreadElement', argument: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'indices' } } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for chained call str.toUpperCase().charAt(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'str' }, property: { type: 'Identifier', name: 'toUpperCase' } }, arguments: [] }, 'charAt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(1)
    })

    test('reports when callee object is a NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'NewExpression', callee: { type: 'Identifier', name: 'String' }, arguments: [] }, 'charAt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(1)
    })

    test('reports when callee object is a TaggedTemplateExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'TaggedTemplateExpression', tag: { type: 'Identifier', name: 'tag' }, quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] } }, 'charAt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(1)
    })

    test('reports when spread argument is an ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'charAt', [{ type: 'SpreadElement', argument: { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }] } }]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (44) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for str.charAt(0) — no spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.charAt() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt'))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.charAt(index) — identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [{ type: 'Identifier', name: 'index' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.charCodeAt(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.indexOf(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'indexOf', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.includes(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.slice(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.map(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'map', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str["charAt"](...items) — computed member', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'charAt' },
          computed: true,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.charAt(...items, extra) — more than one argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }, { type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.charAt(0, 1) — two non-spread arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for charAt(...items) — callee not MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'charAt' },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'charAt' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "chartAt" — typo', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'chartAt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "charat" — lowercase', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charat', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "CHARAT" — uppercase', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'CHARAT', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'charAt' },
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is empty array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', []))
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: null,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('reports when callee object is missing — rule does not check object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'charAt' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })



    test('does not report when argument is not a SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [{ type: 'Identifier', name: 'index' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'getIndex' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'idx' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [{ type: 'BinaryExpression', operator: '+', left: { type: 'Literal', value: 1 }, right: { type: 'Literal', value: 2 } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when first argument is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [null]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.codePointAt(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.at(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'at', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (16) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringCharAtSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryStringCharAtSpreadRule.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [{ type: 'Literal', value: 0 }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [{ type: 'Literal', value: 0 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'more' } }]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'charAt' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'charAt' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [{ type: 'Literal', value: 0 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'more' } }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [{ type: 'Identifier', name: 'i' }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringCharAtSpreadRule.create(context)
      const visitor2 = noUnnecessaryStringCharAtSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringCharAtSpreadRule.meta
      const meta2 = noUnnecessaryStringCharAtSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'charAt' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
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
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'charAt' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'charAt' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringCharAtSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryStringCharAtSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryStringCharAtSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'charAt' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles computed member expression property explicitly set to false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'charAt' },
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'charAt' },
          computed: true,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })
})
