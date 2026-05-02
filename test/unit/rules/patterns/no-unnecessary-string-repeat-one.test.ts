import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringRepeatOneRule } from '../../../../src/rules/patterns/no-unnecessary-string-repeat-one.js'
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

// ===== META TESTS (8) =====

describe('no-unnecessary-string-repeat-one rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringRepeatOneRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringRepeatOneRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringRepeatOneRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringRepeatOneRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringRepeatOneRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning repeat', () => {
      const desc = noUnnecessaryStringRepeatOneRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/repeat/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringRepeatOneRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-repeat-one.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringRepeatOneRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringRepeatOneRule).toBeDefined()
      expect(noUnnecessaryStringRepeatOneRule.meta).toBeDefined()
      expect(noUnnecessaryStringRepeatOneRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports unnecessary repeat(1)', () => {
    test('reports for str.repeat(1) — identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'repeat', [{ type: 'NumericLiteral', value: 1 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for string literal "hello".repeat(1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'StringLiteral', value: 'hello' }, 'repeat', [{ type: 'NumericLiteral', value: 1 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for template literal `.repeat(1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'TemplateLiteral', quasis: [], expressions: [] }, 'repeat', [{ type: 'NumericLiteral', value: 1 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for member expression obj.prop.repeat(1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }, 'repeat', [{ type: 'NumericLiteral', value: 1 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for call expression result getStr().repeat(1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getStr' }, arguments: [] }, 'repeat', [{ type: 'NumericLiteral', value: 1 }]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions repeat(1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'repeat', [{ type: 'NumericLiteral', value: 1 }]))
      expect(reports[0].message).toMatch(/repeat/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'repeat', [{ type: 'NumericLiteral', value: 1 }]))
      expect(reports[0].message).toBe(
        'str.repeat(1) returns the same string. This call is unnecessary.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'repeat', [{ type: 'NumericLiteral', value: 1 }]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'repeat', [{ type: 'NumericLiteral', value: 1 }]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'repeat', [{ type: 'NumericLiteral', value: 1 }])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'repeat', [{ type: 'NumericLiteral', value: 1 }], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'repeat', [{ type: 'NumericLiteral', value: 1 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'repeat', [{ type: 'NumericLiteral', value: 1 }]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'repeat', [{ type: 'NumericLiteral', value: 1 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'repeat', [{ type: 'NumericLiteral', value: 1 }]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'repeat', [{ type: 'NumericLiteral', value: 1 }]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for concatenated string result (a + b).repeat(1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } }, 'repeat', [{ type: 'NumericLiteral', value: 1 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for empty string literal "".repeat(1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'StringLiteral', value: '' }, 'repeat', [{ type: 'NumericLiteral', value: 1 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for long string literal.repeat(1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'StringLiteral', value: 'a very long string with many characters' }, 'repeat', [{ type: 'NumericLiteral', value: 1 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for chained call str.trim().repeat(1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'str' }, property: { type: 'Identifier', name: 'trim' } }, arguments: [] }, 'repeat', [{ type: 'NumericLiteral', value: 1 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for parenthesized expression.repeat(1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'result' }, 'repeat', [{ type: 'NumericLiteral', value: 1 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for computed property access result obj[key].repeat(1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'key' }, computed: true }, 'repeat', [{ type: 'NumericLiteral', value: 1 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for conditional expression (x ? a : b).repeat(1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Identifier', name: 'a' }, alternate: { type: 'Identifier', name: 'b' } }, 'repeat', [{ type: 'NumericLiteral', value: 1 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for array access arr[0].repeat(1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'arr' }, property: { type: 'NumericLiteral', value: 0 }, computed: true }, 'repeat', [{ type: 'NumericLiteral', value: 1 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for tagged template literal result.repeat(1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'TaggedTemplateExpression', tag: { type: 'Identifier', name: 'tag' }, quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] } }, 'repeat', [{ type: 'NumericLiteral', value: 1 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof expression result.repeat(1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'UnaryExpression', operator: 'typeof', prefix: true, argument: { type: 'Identifier', name: 'x' } }, 'repeat', [{ type: 'NumericLiteral', value: 1 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for this.repeat(1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ThisExpression' }, 'repeat', [{ type: 'NumericLiteral', value: 1 }]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for str.repeat(0) — zero arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'repeat', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.repeat(2) — value 2', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'repeat', [{ type: 'NumericLiteral', value: 2 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.repeat(3) — value 3', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'repeat', [{ type: 'NumericLiteral', value: 3 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.repeat(n) — variable arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'repeat', [{ type: 'Identifier', name: 'n' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.repeat() — no args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'repeat'))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.repeat(1, 2) — two args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'repeat', [{ type: 'NumericLiteral', value: 1 }, { type: 'NumericLiteral', value: 2 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.padStart(1) — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart', [{ type: 'NumericLiteral', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.padEnd(1) — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padEnd', [{ type: 'NumericLiteral', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.trim() — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'trim'))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.slice(1) — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [{ type: 'NumericLiteral', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.substring(1) — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'substring', [{ type: 'NumericLiteral', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.charAt(1) — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [{ type: 'NumericLiteral', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.repeat(-1) — negative value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'repeat', [{ type: 'NumericLiteral', value: -1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.repeat(0.5) — float value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'repeat', [{ type: 'NumericLiteral', value: 0.5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.repeat(100) — large value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'repeat', [{ type: 'NumericLiteral', value: 100 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arg is StringLiteral "1"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'repeat', [{ type: 'StringLiteral', value: '1' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arg is Literal (not NumericLiteral)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'repeat', [{ type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [{ type: 'NumericLiteral', value: 1 }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [{ type: 'NumericLiteral', value: 1 }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'repeat' }, arguments: [{ type: 'NumericLiteral', value: 1 }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'repeat' },
        },
        arguments: [{ type: 'NumericLiteral', value: 1 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
        },
        arguments: [{ type: 'NumericLiteral', value: 1 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: null,
        },
        arguments: [{ type: 'NumericLiteral', value: 1 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Repeat" (capitalized)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'Repeat', [{ type: 'NumericLiteral', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "repeat" with computed true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'repeat' },
          computed: true,
        },
        arguments: [{ type: 'NumericLiteral', value: 1 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.repeat with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'repeat', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.repeat with three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'repeat', [{ type: 'NumericLiteral', value: 1 }, { type: 'NumericLiteral', value: 2 }, { type: 'NumericLiteral', value: 3 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arg is a BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'repeat', [{ type: 'BinaryExpression', operator: '+', left: { type: 'NumericLiteral', value: 0 }, right: { type: 'NumericLiteral', value: 1 } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'repeat' },
        },
        arguments: null,
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'repeat' },
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringRepeatOneRule.create(ctx1)
      const visitor2 = noUnnecessaryStringRepeatOneRule.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'repeat', [{ type: 'NumericLiteral', value: 1 }]))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'repeat', [{ type: 'NumericLiteral', value: 2 }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'repeat', [{ type: 'NumericLiteral', value: 1 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'repeat', [{ type: 'NumericLiteral', value: 2 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'repeat', [{ type: 'NumericLiteral', value: 1 }]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'repeat' },
          computed: false,
        },
        arguments: [{ type: 'NumericLiteral', value: 1 }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'repeat' },
          computed: false,
        },
        arguments: [{ type: 'NumericLiteral', value: 1 }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'repeat', [{ type: 'NumericLiteral', value: 1 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'repeat', [{ type: 'NumericLiteral', value: 2 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart', [{ type: 'NumericLiteral', value: 1 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'repeat', [{ type: 'NumericLiteral', value: 1 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'repeat', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringRepeatOneRule.create(context)
      const visitor2 = noUnnecessaryStringRepeatOneRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringRepeatOneRule.meta
      const meta2 = noUnnecessaryStringRepeatOneRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'repeat' },
          computed: false,
        },
        arguments: [{ type: 'NumericLiteral', value: 1 }],
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
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'repeat' },
          computed: false,
        },
        arguments: [{ type: 'NumericLiteral', value: 1 }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'repeat' },
          computed: false,
        },
        arguments: [{ type: 'NumericLiteral', value: 1 }],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'repeat', [{ type: 'NumericLiteral', value: 1 }])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringRepeatOneRule).toBeDefined()
      expect(typeof noUnnecessaryStringRepeatOneRule.create).toBe('function')
      expect(typeof noUnnecessaryStringRepeatOneRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'repeat' },
          computed: false,
        },
        arguments: [{ type: 'NumericLiteral', value: 1 }],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'repeat', [{ type: 'NumericLiteral', value: 1 }], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles computed member expression property (computed: false)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'repeat' },
          computed: false,
        },
        arguments: [{ type: 'NumericLiteral', value: 1 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'repeat' },
          computed: true,
        },
        arguments: [{ type: 'NumericLiteral', value: 1 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'repeat', [{ type: 'NumericLiteral', value: 1 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'repeat', [{ type: 'NumericLiteral', value: 1 }]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('does not report for str.repeat(Infinity)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'repeat', [{ type: 'Identifier', name: 'Infinity' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arg is a call expression getValue()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'repeat', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'getValue' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arg is a member expression obj.count', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'repeat', [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'count' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arg is UnaryExpression +1', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatOneRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'repeat', [{ type: 'UnaryExpression', operator: '+', prefix: true, argument: { type: 'NumericLiteral', value: 1 } }]))
      expect(reports.length).toBe(0)
    })
  })
})
