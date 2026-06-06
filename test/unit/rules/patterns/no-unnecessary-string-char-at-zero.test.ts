import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringCharAtZeroRule } from '../../../../src/rules/patterns/no-unnecessary-string-char-at-zero.js'
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

function makeNumericLiteral(value: number): unknown {
  return { type: 'Literal', value }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-string-char-at-zero rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringCharAtZeroRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringCharAtZeroRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringCharAtZeroRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringCharAtZeroRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringCharAtZeroRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning charAt', () => {
      const desc = noUnnecessaryStringCharAtZeroRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/charat/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringCharAtZeroRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-string-char-at-zero.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringCharAtZeroRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringCharAtZeroRule).toBeDefined()
      expect(noUnnecessaryStringCharAtZeroRule.meta).toBeDefined()
      expect(noUnnecessaryStringCharAtZeroRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (32) =====

  describe('positive cases — reports unnecessary charAt(0)', () => {
    test('reports for "hello".charAt(0) — string literal object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'charAt', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for str.charAt(0) — identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr[0].charAt(0) — MemberExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'MemberExpression', object: { type: 'Identifier', name: 'arr' }, property: { type: 'Literal', value: 0 } },
        'charAt', [makeNumericLiteral(0)],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for getStr().charAt(0) — CallExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'CallExpression', callee: { type: 'Identifier', name: 'getStr' }, arguments: [] },
        'charAt', [makeNumericLiteral(0)],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.prop.charAt(0) — nested MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } },
        'charAt', [makeNumericLiteral(0)],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for template literal charAt(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'TemplateLiteral', quasis: [], expressions: [] },
        'charAt', [makeNumericLiteral(0)],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for empty string "".charAt(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: '' }, 'charAt', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-char string "a".charAt(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'a' }, 'charAt', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for this.charAt(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ThisExpression' }, 'charAt', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions charAt(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'charAt', [makeNumericLiteral(0)]))
      expect(reports[0].message).toMatch(/charAt/)
    })

    test('report message mentions bracket notation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'charAt', [makeNumericLiteral(0)]))
      expect(reports[0].message).toMatch(/\[0\]/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'charAt', [makeNumericLiteral(0)]))
      expect(reports[0].message).toBe(
        'Unnecessary .charAt(0). Use bracket notation [0] instead for consistency and brevity.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'charAt', [makeNumericLiteral(0)]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'charAt', [makeNumericLiteral(0)]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      const node = makeCallNode({ type: 'Literal', value: 'hello' }, 'charAt', [makeNumericLiteral(0)])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'charAt', [makeNumericLiteral(0)], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'charAt', [makeNumericLiteral(0)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'charAt', [makeNumericLiteral(0)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [makeNumericLiteral(0)]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'charAt', [makeNumericLiteral(0)]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for ArrayExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: [] }, 'charAt', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for ObjectExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ObjectExpression', properties: [] }, 'charAt', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for conditional expression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 'a' }, alternate: { type: 'Literal', value: 'b' } },
        'charAt', [makeNumericLiteral(0)],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for tagged template expression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'TaggedTemplateExpression', tag: { type: 'Identifier', name: 'tag' }, quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] } },
        'charAt', [makeNumericLiteral(0)],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for binary expression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'BinaryExpression', operator: '+', left: { type: 'Literal', value: 'a' }, right: { type: 'Literal', value: 'b' } },
        'charAt', [makeNumericLiteral(0)],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for parenthesized expression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'ParenthesizedExpression', expression: { type: 'Literal', value: 'hello' } },
        'charAt', [makeNumericLiteral(0)],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for type cast expression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'TypeCastExpression', expression: { type: 'Literal', value: 'hello' }, typeAnnotation: {} },
        'charAt', [makeNumericLiteral(0)],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for new expression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'NewExpression', callee: { type: 'Identifier', name: 'String' }, arguments: [] },
        'charAt', [makeNumericLiteral(0)],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for sequence expression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'SequenceExpression', expressions: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 'hello' }] },
        'charAt', [makeNumericLiteral(0)],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for await expression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'AwaitExpression', argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fetchStr' }, arguments: [] } },
        'charAt', [makeNumericLiteral(0)],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for chained calls str.trim().charAt(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      const trimResult = { type: 'CallExpression', callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'str' }, property: { type: 'Identifier', name: 'trim' } }, arguments: [] }
      visitor.CallExpression(makeCallNode(trimResult, 'charAt', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (38) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for "hello".charAt(1) — non-zero index', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'charAt', [makeNumericLiteral(1)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for "hello".charAt(2) — non-zero index', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'charAt', [makeNumericLiteral(2)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for "hello".charAt() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'charAt', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for "hello".charAt(0, 1) — too many arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'charAt', [makeNumericLiteral(0), makeNumericLiteral(1)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for "hello".charCodeAt(0) — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'charCodeAt', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for "hello".at(0) — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'at', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for "hello"[0] — bracket notation (not a call)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression({
        type: 'MemberExpression',
        object: { type: 'Literal', value: 'hello' },
        property: { type: 'Literal', value: 0 },
        computed: true,
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for "hello".slice(0) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'slice', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for "hello".indexOf(0) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'indexOf', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for "hello".substring(0) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'substring', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for "hello".startsWith(0) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'startsWith', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for "hello".codePointAt(0) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'codePointAt', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is string literal instead of numeric', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'charAt', [{ type: 'Literal', value: '0' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is identifier instead of numeric literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'charAt', [{ type: 'Identifier', name: 'zero' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is negative number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'charAt', [makeNumericLiteral(-1)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeNumericLiteral(0)], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeNumericLiteral(0)], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [makeNumericLiteral(0)], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'hello' },
          property: { type: 'Literal', value: 'charAt' },
        },
        arguments: [makeNumericLiteral(0)],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "chartAt" (typo)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'chartAt', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "CHARAT" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'CHARAT', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "charat" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'charat', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'hello' },
        },
        arguments: [makeNumericLiteral(0)],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'hello' },
          property: null,
        },
        arguments: [makeNumericLiteral(0)],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'charAt' },
        },
        arguments: [makeNumericLiteral(0)],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('reports when object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'charAt' },
        },
        arguments: [makeNumericLiteral(0)],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'hello' },
          property: { type: 'Identifier', name: 'charAt' },
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a float 0.5 instead of 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'charAt', [makeNumericLiteral(0.5)]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument type is Literal instead of NumericLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'charAt', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for "hello".charAt(100) — large index', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'charAt', [makeNumericLiteral(100)]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringCharAtZeroRule.create(ctx1)
      const visitor2 = noUnnecessaryStringCharAtZeroRule.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'charAt', [makeNumericLiteral(0)]))
      visitor2.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'charAt', [makeNumericLiteral(1)]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'charAt', [makeNumericLiteral(0)]))
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'charAt', [makeNumericLiteral(1)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'hello' },
          property: { type: 'Identifier', name: 'charAt' },
        },
        arguments: [makeNumericLiteral(0)],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'hello' },
          property: { type: 'Identifier', name: 'charAt' },
        },
        arguments: [makeNumericLiteral(0)],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'charAt', [makeNumericLiteral(0)])) // report
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'charAt', [makeNumericLiteral(1)])) // no report
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'charCodeAt', [makeNumericLiteral(0)])) // no report
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [makeNumericLiteral(0)])) // report
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'charAt', [])) // no report
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'charAt', [makeNumericLiteral(0)])) // report
      expect(reports.length).toBe(3)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringCharAtZeroRule.create(context)
      const visitor2 = noUnnecessaryStringCharAtZeroRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringCharAtZeroRule.meta
      const meta2 = noUnnecessaryStringCharAtZeroRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'hello' },
          property: { type: 'Identifier', name: 'charAt' },
        },
        arguments: [makeNumericLiteral(0)],
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
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'hello' },
          property: { type: 'Identifier', name: 'charAt' },
        },
        arguments: [makeNumericLiteral(0)],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'hello' },
          property: { type: 'Identifier', name: 'charAt' },
        },
        arguments: [makeNumericLiteral(0)],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      const node = makeCallNode({ type: 'Literal', value: 'hello' }, 'charAt', [makeNumericLiteral(0)])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringCharAtZeroRule).toBeDefined()
      expect(typeof noUnnecessaryStringCharAtZeroRule.create).toBe('function')
      expect(typeof noUnnecessaryStringCharAtZeroRule.meta).toBe('object')
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'charAt', [makeNumericLiteral(0)], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'charAt', [makeNumericLiteral(0)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharAtZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'hello' },
          property: { type: 'Identifier', name: 'charAt' },
        },
        arguments: [makeNumericLiteral(0)],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })
  })
})
