import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringCharCodeAtSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-string-char-code-at-spread.js'
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

function makeSpreadArg(argument: unknown = { type: 'Identifier', name: 'items' }): unknown {
  return { type: 'SpreadElement', argument }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-string-char-code-at-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringCharCodeAtSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringCharCodeAtSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringCharCodeAtSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringCharCodeAtSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringCharCodeAtSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning charCodeAt', () => {
      const desc = noUnnecessaryStringCharCodeAtSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/charcodeat/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringCharCodeAtSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-char-code-at-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringCharCodeAtSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringCharCodeAtSpreadRule).toBeDefined()
      expect(noUnnecessaryStringCharCodeAtSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryStringCharCodeAtSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports unnecessary charCodeAt with spread', () => {
    test('reports for str.charCodeAt(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for string literal "hello".charCodeAt(...arr)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'charCodeAt', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for member expression obj.str.charCodeAt(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'str' } }, 'charCodeAt', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for call expression result fn().charCodeAt(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }, 'charCodeAt', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions charCodeAt', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [makeSpreadArg()]))
      expect(reports[0].message).toMatch(/charCodeAt/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [makeSpreadArg()]))
      expect(reports[0].message).toBe(
        'str.charCodeAt(...items) with spread is unusual. charCodeAt() expects an index number.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [makeSpreadArg()]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [makeSpreadArg()]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [makeSpreadArg()])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [makeSpreadArg()], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [makeSpreadArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'x' }, 'charCodeAt', [makeSpreadArg()]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [makeSpreadArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'x' }, 'charCodeAt', [makeSpreadArg()]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [makeSpreadArg()]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for spread with array argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'charCodeAt', [makeSpreadArg({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'charCodeAt', [makeSpreadArg({ type: 'Identifier', name: 'indices' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with call expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'charCodeAt', [makeSpreadArg({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getIndices' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with member expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'charCodeAt', [makeSpreadArg({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'arr' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for computed-member call obj["str"].charCodeAt(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'charCodeAt' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports when spread argument is a conditional expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'charCodeAt', [makeSpreadArg({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 2 } })]))
      expect(reports.length).toBe(1)
    })

    test('reports when spread argument is a binary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'charCodeAt', [makeSpreadArg({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports when callee object is a template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'TemplateLiteral', quasis: [], expressions: [] }, 'charCodeAt', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports when spread argument is a logical expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'charCodeAt', [makeSpreadArg({ type: 'LogicalExpression', operator: '||', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for chained call a.b.charCodeAt(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'a' }, property: { type: 'Identifier', name: 'b' } }, 'charCodeAt', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports when spread argument is a spread of null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'charCodeAt', [makeSpreadArg({ type: 'Literal', value: null })]))
      expect(reports.length).toBe(1)
    })

    test('reports when callee object is a this expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ThisExpression' }, 'charCodeAt', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (44) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for str.charCodeAt(0) — no spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.charCodeAt(i) — identifier arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [{ type: 'Identifier', name: 'i' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.charCodeAt() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.charCodeAt(...items, 1) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [makeSpreadArg(), { type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.charAt(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.codePointAt(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.slice(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.indexOf(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'indexOf', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.includes(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for charCodeAt(...items) — direct function call, no member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'charCodeAt' },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for computed member str["charCodeAt"](...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'charCodeAt' },
          computed: true,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeSpreadArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeSpreadArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'charCodeAt' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: null,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "CharCodeAt" (uppercase C)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'CharCodeAt', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "charcodeat" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charcodeat', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'charCodeAt' },
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is empty array (zero args)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', []))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is not a SpreadElement (Literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [{ type: 'Literal', value: 5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is not a SpreadElement (Identifier)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [{ type: 'Identifier', name: 'idx' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is not a SpreadElement (MemberExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'idx' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is not a SpreadElement (CallExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is not a SpreadElement (BinaryExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [{ type: 'BinaryExpression', operator: '+', left: { type: 'Literal', value: 1 }, right: { type: 'Literal', value: 2 } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when three arguments with spread as first', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [makeSpreadArg(), { type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.toUpperCase() — completely different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toUpperCase', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.trim(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'trim', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.substring(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'substring', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [{ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is an arrow function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [{ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is an object expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [{ type: 'ObjectExpression', properties: [] }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (16) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringCharCodeAtSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryStringCharCodeAtSpreadRule.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [makeSpreadArg()]))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [{ type: 'Literal', value: 0 }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [makeSpreadArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [{ type: 'Literal', value: 0 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'charCodeAt', [makeSpreadArg()]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'charCodeAt' },
        },
        arguments: [makeSpreadArg()],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'charCodeAt' },
        },
        arguments: [makeSpreadArg()],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [makeSpreadArg()])) // report
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [{ type: 'Literal', value: 0 }])) // no report
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [makeSpreadArg()])) // no report
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'charCodeAt', [makeSpreadArg()])) // report
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [])) // no report
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      const visitor2 = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringCharCodeAtSpreadRule.meta
      const meta2 = noUnnecessaryStringCharCodeAtSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'charCodeAt' },
        },
        arguments: [makeSpreadArg()],
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
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'charCodeAt' },
        },
        arguments: [makeSpreadArg()],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'charCodeAt' },
        },
        arguments: [makeSpreadArg()],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [makeSpreadArg()])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringCharCodeAtSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryStringCharCodeAtSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryStringCharCodeAtSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'charCodeAt' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [makeSpreadArg()], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('does not report when callee is computed member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'charCodeAt' },
          computed: true,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [makeSpreadArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'charCodeAt', [makeSpreadArg()]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})
