import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringCharAtEmptyRule } from '../../../../src/rules/patterns/no-unnecessary-string-char-at-empty.js'
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

function emptyStrArg(): unknown {
  return { type: 'StringLiteral', value: '' }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-string-char-at-empty rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringCharAtEmptyRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringCharAtEmptyRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringCharAtEmptyRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringCharAtEmptyRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringCharAtEmptyRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning charAt', () => {
      const desc = noUnnecessaryStringCharAtEmptyRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/charat/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringCharAtEmptyRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-char-at-empty.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringCharAtEmptyRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringCharAtEmptyRule).toBeDefined()
      expect(noUnnecessaryStringCharAtEmptyRule.meta).toBeDefined()
      expect(noUnnecessaryStringCharAtEmptyRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports str.charAt("")', () => {
    test('reports for str.charAt("") with Identifier receiver', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [emptyStrArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for "hello".charAt("") with StringLiteral receiver', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'StringLiteral', value: 'hello' }, 'charAt', [emptyStrArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.prop.charAt("") with MemberExpression receiver', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } },
        'charAt', [emptyStrArg()],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for fn().charAt("") with CallExpression receiver', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
        'charAt', [emptyStrArg()],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for this.charAt("") with ThisExpression receiver', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ThisExpression' }, 'charAt', [emptyStrArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for (a + b).charAt("") with BinaryExpression receiver', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } },
        'charAt', [emptyStrArg()],
      ))
      expect(reports.length).toBe(1)
    })

    test('report message mentions charAt', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [emptyStrArg()]))
      expect(reports[0].message).toMatch(/charAt/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [emptyStrArg()]))
      expect(reports[0].message).toBe(
        "str.charAt('') with an empty string is unusual. charAt() expects a numeric index.",
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [emptyStrArg()]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [emptyStrArg()]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [emptyStrArg()])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [emptyStrArg()], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'charAt', [emptyStrArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'charAt', [emptyStrArg()]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'charAt', [emptyStrArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'charAt', [emptyStrArg()]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [emptyStrArg()]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for nested member expression obj.a.b.charAt("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      const nested = { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'a' } }
      visitor.CallExpression(makeCallNode(
        { type: 'MemberExpression', object: nested, property: { type: 'Identifier', name: 'b' } },
        'charAt', [emptyStrArg()],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for chained calls arr.map().charAt("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      const mapResult = { type: 'CallExpression', callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'arr' }, property: { type: 'Identifier', name: 'map' } }, arguments: [] }
      visitor.CallExpression(makeCallNode(mapResult, 'charAt', [emptyStrArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for NewExpression receiver new Foo().charAt("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'NewExpression', callee: { type: 'Identifier', name: 'Foo' }, arguments: [] },
        'charAt', [emptyStrArg()],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for ArrayExpression receiver ["a","b"].charAt("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'ArrayExpression', elements: [{ type: 'StringLiteral', value: 'a' }, { type: 'StringLiteral', value: 'b' }] },
        'charAt', [emptyStrArg()],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for TemplateLiteral receiver `hello`.charAt("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'TemplateLiteral', quasis: [{ type: 'TemplateElement', value: { raw: 'hello', cooked: 'hello' } }], expressions: [] },
        'charAt', [emptyStrArg()],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for ParenthesizedExpression receiver', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'ParenthesizedExpression', expression: { type: 'Identifier', name: 's' } },
        'charAt', [emptyStrArg()],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for ConditionalExpression receiver', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Identifier', name: 'a' }, alternate: { type: 'Identifier', name: 'b' } },
        'charAt', [emptyStrArg()],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for NumericLiteral receiver (unusual but passes)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'NumericLiteral', value: 42 },
        'charAt', [emptyStrArg()],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for UnaryExpression receiver', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'UnaryExpression', operator: '!', argument: { type: 'Identifier', name: 'x' } },
        'charAt', [emptyStrArg()],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for ObjectExpression receiver', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'ObjectExpression', properties: [] },
        'charAt', [emptyStrArg()],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for FunctionExpression receiver', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } },
        'charAt', [emptyStrArg()],
      ))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for str.charAt(0) — numeric index', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.charAt(1) — numeric index', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [{ type: 'NumericLiteral', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.charAt() — no args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt'))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.charAt("a") — non-empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [{ type: 'StringLiteral', value: 'a' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.charAt("abc") — longer non-empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [{ type: 'StringLiteral', value: 'abc' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.charAt(" ") — whitespace string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [{ type: 'StringLiteral', value: ' ' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.charCodeAt("") — wrong method charCodeAt', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [emptyStrArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.codePointAt("") — wrong method codePointAt', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [emptyStrArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.at("") — wrong method at', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'at', [emptyStrArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.indexOf("") — wrong method indexOf', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'indexOf', [emptyStrArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report with computed property access str["charAt"]("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'charAt' },
          computed: true,
        },
        arguments: [emptyStrArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report with case sensitivity "CHARAT"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'CHARAT', [emptyStrArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report with case sensitivity "CharAt"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'CharAt', [emptyStrArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report with case sensitivity "charat" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charat', [emptyStrArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [emptyStrArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [emptyStrArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [emptyStrArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'charAt' },
        },
        arguments: [emptyStrArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for two args charAt("", 0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [emptyStrArg(), { type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [{ type: 'Identifier', name: 'idx' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
        },
        arguments: [emptyStrArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: null,
        },
        arguments: [emptyStrArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal arg with empty string (wrong type)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arg is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [null]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array is empty (0 args)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for BooleanLiteral arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [{ type: 'BooleanLiteral', value: false }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
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

    test('does not report for ObjectExpression arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [{ type: 'ObjectExpression', properties: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'idx' } }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringCharAtEmptyRule.create(ctx1)
      const visitor2 = noUnnecessaryStringCharAtEmptyRule.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'charAt', [emptyStrArg()]))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'charAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'charAt', [emptyStrArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'charAt', [{ type: 'NumericLiteral', value: 0 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'charAt', [emptyStrArg()]))
      expect(reports.length).toBe(2)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'charAt' },
        },
        arguments: [emptyStrArg()],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'charAt' },
        },
        arguments: [emptyStrArg()],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'charAt' },
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

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'charAt' },
        },
        arguments: [emptyStrArg()],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'charAt', [{ type: 'NumericLiteral', value: 0 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'charAt', [emptyStrArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'indexOf', [emptyStrArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'charAt', [emptyStrArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'charAt', []))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringCharAtEmptyRule.create(context)
      const visitor2 = noUnnecessaryStringCharAtEmptyRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringCharAtEmptyRule.meta
      const meta2 = noUnnecessaryStringCharAtEmptyRule.meta
      expect(meta1).toBe(meta2)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringCharAtEmptyRule).toBeDefined()
      expect(typeof noUnnecessaryStringCharAtEmptyRule.create).toBe('function')
      expect(typeof noUnnecessaryStringCharAtEmptyRule.meta).toBe('object')
    })

    test('handles computed=false explicitly (should report)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'charAt' },
          computed: false,
        },
        arguments: [emptyStrArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('handles computed=true (should NOT report)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'charAt' },
          computed: true,
        },
        arguments: [emptyStrArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'charAt', [emptyStrArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'charAt', [emptyStrArg()]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [emptyStrArg()], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles node with range property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'charAt' },
        },
        arguments: [emptyStrArg()],
        loc: makeLoc(1, 0, 1, 15),
        range: [0, 15],
      })
      expect(reports.length).toBe(1)
    })

    test('handles null first argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [null]))
      expect(reports.length).toBe(0)
    })

    test('handles arguments as undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'charAt' },
        },
        arguments: undefined,
        loc: makeLoc(1, 0, 1, 10),
      } as unknown)
      expect(reports.length).toBe(0)
    })

    test('handles missing arguments property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
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

    test('handles StringLiteral with whitespace value (not empty)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [{ type: 'StringLiteral', value: '  ' }]))
      expect(reports.length).toBe(0)
    })

    test('multiple same violations report separately (duplicate)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtEmptyRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [emptyStrArg()])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })
  })
})
