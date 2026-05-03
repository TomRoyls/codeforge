import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringFontcolorSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-string-fontcolor-spread.js'
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
      computed: false,
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeSpreadElement(argument: unknown): unknown {
  return { type: 'SpreadElement', argument }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-string-fontcolor-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringFontcolorSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringFontcolorSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringFontcolorSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringFontcolorSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringFontcolorSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning fontcolor', () => {
      const desc = noUnnecessaryStringFontcolorSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/fontcolor/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringFontcolorSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-fontcolor-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringFontcolorSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringFontcolorSpreadRule).toBeDefined()
      expect(noUnnecessaryStringFontcolorSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryStringFontcolorSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports unnecessary fontcolor spread', () => {
    test('reports for str.fontcolor(...items) with SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'str' }, 'fontcolor', [makeSpreadElement({ type: 'Identifier', name: 'items' })]),
      )
      expect(reports.length).toBe(1)
    })

    test('reports with string Literal object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Literal', value: 'hello' }, 'fontcolor', [makeSpreadElement({ type: 'Identifier', name: 'items' })]),
      )
      expect(reports.length).toBe(1)
    })

    test('reports with MemberExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode(
          { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'str' } },
          'fontcolor',
          [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports with CallExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode(
          { type: 'CallExpression', callee: { type: 'Identifier', name: 'getStr' }, arguments: [] },
          'fontcolor',
          [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('report message mentions fontcolor', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'str' }, 'fontcolor', [makeSpreadElement({ type: 'Identifier', name: 'items' })]),
      )
      expect(reports[0].message).toMatch(/fontcolor/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'str' }, 'fontcolor', [makeSpreadElement({ type: 'Identifier', name: 'items' })]),
      )
      expect(reports[0].message).toBe(
        'str.fontcolor(...items) with spread is unusual. fontcolor() expects a color string.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'str' }, 'fontcolor', [makeSpreadElement({ type: 'Identifier', name: 'items' })]),
      )
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'str' }, 'fontcolor', [makeSpreadElement({ type: 'Identifier', name: 'items' })]),
      )
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      const node = makeCallNode(
        { type: 'Identifier', name: 'str' },
        'fontcolor',
        [makeSpreadElement({ type: 'Identifier', name: 'items' })],
      )
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'str' }, 'fontcolor', [makeSpreadElement({ type: 'Identifier', name: 'items' })], 5, 10, 5, 30),
      )
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'str' }, 'fontcolor', [makeSpreadElement({ type: 'Identifier', name: 'items' })]),
      )
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 's' }, 'fontcolor', [makeSpreadElement({ type: 'Identifier', name: 'arr' })]),
      )
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'str' }, 'fontcolor', [makeSpreadElement({ type: 'Identifier', name: 'items' })]),
      )
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 's' }, 'fontcolor', [makeSpreadElement({ type: 'Identifier', name: 'arr' })]),
      )
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports with SpreadElement containing ArrayExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode(
          { type: 'Identifier', name: 'str' },
          'fontcolor',
          [makeSpreadElement({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 'red' }] })],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement containing CallExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode(
          { type: 'Identifier', name: 'str' },
          'fontcolor',
          [makeSpreadElement({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getColors' }, arguments: [] })],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement containing MemberExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode(
          { type: 'Identifier', name: 'str' },
          'fontcolor',
          [makeSpreadElement({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'colors' } })],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement containing ConditionalExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode(
          { type: 'Identifier', name: 'str' },
          'fontcolor',
          [makeSpreadElement({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 'red' }, alternate: { type: 'Literal', value: 'blue' } })],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'str' }, 'fontcolor', [makeSpreadElement({ type: 'Identifier', name: 'items' })]),
      )
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports with TemplateLiteral object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode(
          { type: 'TemplateLiteral', quasis: [], expressions: [] },
          'fontcolor',
          [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports with TaggedTemplateExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode(
          { type: 'TaggedTemplateExpression', tag: { type: 'Identifier', name: 'tag' }, quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] } },
          'fontcolor',
          [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement containing ObjectExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode(
          { type: 'Identifier', name: 'str' },
          'fontcolor',
          [makeSpreadElement({ type: 'ObjectExpression', properties: [] })],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement containing BinaryExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode(
          { type: 'Identifier', name: 'str' },
          'fontcolor',
          [makeSpreadElement({ type: 'BinaryExpression', operator: '+', left: { type: 'Literal', value: 'red' }, right: { type: 'Literal', value: 'blue' } })],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement containing ArrowFunctionExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode(
          { type: 'Identifier', name: 'str' },
          'fontcolor',
          [makeSpreadElement({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } })],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement containing Literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode(
          { type: 'Identifier', name: 'str' },
          'fontcolor',
          [makeSpreadElement({ type: 'Literal', value: 'red' })],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for chained fontcolor call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      const innerCall = makeCallNode({ type: 'Identifier', name: 'str' }, 'bold', [])
      visitor.CallExpression(
        makeCallNode(innerCall, 'fontcolor', [makeSpreadElement({ type: 'Identifier', name: 'items' })]),
      )
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (42) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for fontcolor with regular string argument (no spread)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'str' }, 'fontcolor', [{ type: 'Literal', value: 'red' }]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for fontcolor with Identifier argument (no spread)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'str' }, 'fontcolor', [{ type: 'Identifier', name: 'color' }]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for fontcolor with 0 arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'str' }, 'fontcolor', []),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for fontcolor with 2 arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'str' }, 'fontcolor', [
          makeSpreadElement({ type: 'Identifier', name: 'items' }),
          { type: 'Literal', value: 'extra' },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for fontcolor with 3 arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'str' }, 'fontcolor', [
          { type: 'Literal', value: 'a' },
          { type: 'Literal', value: 'b' },
          { type: 'Literal', value: 'c' },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for fontsize (wrong method)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'str' }, 'fontsize', [makeSpreadElement({ type: 'Identifier', name: 'items' })]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for bold (wrong method)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'str' }, 'bold', [makeSpreadElement({ type: 'Identifier', name: 'items' })]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for italics (wrong method)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'str' }, 'italics', [makeSpreadElement({ type: 'Identifier', name: 'items' })]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for fixed (wrong method)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'str' }, 'fixed', [makeSpreadElement({ type: 'Identifier', name: 'items' })]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for strike (wrong method)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'str' }, 'strike', [makeSpreadElement({ type: 'Identifier', name: 'items' })]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for link (wrong method)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'str' }, 'link', [makeSpreadElement({ type: 'Identifier', name: 'items' })]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for computed member expression obj.fontcolor', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'fontcolor' },
          computed: true,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeSpreadElement({ type: 'Identifier', name: 'x' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeSpreadElement({ type: 'Identifier', name: 'x' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [makeSpreadElement({ type: 'Identifier', name: 'x' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'fontcolor' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: null,
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Fontcolor" (uppercase F)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'str' }, 'Fontcolor', [makeSpreadElement({ type: 'Identifier', name: 'items' })]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "fontColor" (camelCase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'str' }, 'fontColor', [makeSpreadElement({ type: 'Identifier', name: 'items' })]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "FONTCOLOR" (all caps)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'str' }, 'FONTCOLOR', [makeSpreadElement({ type: 'Identifier', name: 'items' })]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument type is Literal (not SpreadElement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'str' }, 'fontcolor', [{ type: 'Literal', value: 'red' }]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when argument type is CallExpression (not SpreadElement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode(
          { type: 'Identifier', name: 'str' },
          'fontcolor',
          [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'getColor' }, arguments: [] }],
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when argument type is ArrayExpression (not SpreadElement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode(
          { type: 'Identifier', name: 'str' },
          'fontcolor',
          [{ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 'red' }] }],
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when argument type is ObjectExpression (not SpreadElement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode(
          { type: 'Identifier', name: 'str' },
          'fontcolor',
          [{ type: 'ObjectExpression', properties: [] }],
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'str' }, 'fontcolor', [null]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'fontcolor' },
          computed: false,
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array is empty', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'str' }, 'fontcolor', []),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for fontcolor with TemplateLiteral argument (no spread)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode(
          { type: 'Identifier', name: 'str' },
          'fontcolor',
          [{ type: 'TemplateLiteral', quasis: [], expressions: [] }],
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'fontcolor' },
          computed: false,
        },
        arguments: 'not-array',
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (18) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringFontcolorSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryStringFontcolorSpreadRule.create(ctx2)
      visitor1.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'str' }, 'fontcolor', [makeSpreadElement({ type: 'Identifier', name: 'items' })]),
      )
      visitor2.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'str' }, 'fontcolor', [{ type: 'Literal', value: 'red' }]),
      )
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'str' }, 'fontcolor', [makeSpreadElement({ type: 'Identifier', name: 'items' })]),
      )
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'str' }, 'fontcolor', [{ type: 'Literal', value: 'red' }]),
      )
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 's' }, 'fontcolor', [makeSpreadElement({ type: 'Identifier', name: 'arr' })]),
      )
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'fontcolor' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'fontcolor' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'str' }, 'fontcolor', [{ type: 'Literal', value: 'red' }]),
      )
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'str' }, 'fontcolor', [makeSpreadElement({ type: 'Identifier', name: 'items' })]),
      )
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'arr' }, 'fontsize', [makeSpreadElement({ type: 'Identifier', name: 'items' })]),
      )
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 's' }, 'fontcolor', [makeSpreadElement({ type: 'Identifier', name: 'colors' })]),
      )
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'str' }, 'fontcolor', []),
      )
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringFontcolorSpreadRule.create(context)
      const visitor2 = noUnnecessaryStringFontcolorSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringFontcolorSpreadRule.meta
      const meta2 = noUnnecessaryStringFontcolorSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'fontcolor' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
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
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'fontcolor' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'fontcolor' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      const node = makeCallNode(
        { type: 'Identifier', name: 'str' },
        'fontcolor',
        [makeSpreadElement({ type: 'Identifier', name: 'items' })],
      )
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringFontcolorSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryStringFontcolorSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryStringFontcolorSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'fontcolor' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'str' }, 'fontcolor', [makeSpreadElement({ type: 'Identifier', name: 'items' })], 10, 4, 10, 25),
      )
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles non-computed member expression property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'fontcolor' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'fontcolor' },
          computed: true,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'str' }, 'fontcolor', [makeSpreadElement({ type: 'Identifier', name: 'items' })]),
      )
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 's' }, 'fontcolor', [makeSpreadElement({ type: 'Identifier', name: 'arr' })]),
      )
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('handles arguments array with null element as single arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringFontcolorSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'str' }, 'fontcolor', [null]),
      )
      expect(reports.length).toBe(0)
    })
  })
})
