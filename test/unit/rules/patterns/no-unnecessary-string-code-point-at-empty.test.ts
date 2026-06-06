import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringCodePointAtEmptyRule } from '../../../../src/rules/patterns/index.js'
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

describe('no-unnecessary-string-code-point-at-empty rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringCodePointAtEmptyRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringCodePointAtEmptyRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringCodePointAtEmptyRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringCodePointAtEmptyRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringCodePointAtEmptyRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning codePointAt', () => {
      const desc = noUnnecessaryStringCodePointAtEmptyRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/codepointat/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringCodePointAtEmptyRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-code-point-at-empty.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringCodePointAtEmptyRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringCodePointAtEmptyRule).toBeDefined()
      expect(noUnnecessaryStringCodePointAtEmptyRule.meta).toBeDefined()
      expect(noUnnecessaryStringCodePointAtEmptyRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS =====

  describe('positive cases — reports codePointAt with empty string', () => {
    test('reports for str.codePointAt("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for "hello".codePointAt("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'codePointAt', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for variable.codePointAt("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'variable' }, 'codePointAt', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.prop.codePointAt("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } },
        'codePointAt',
        [{ type: 'Literal', value: '' }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for getStr().codePointAt("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'CallExpression', callee: { type: 'Identifier', name: 'getStr' }, arguments: [] },
        'codePointAt',
        [{ type: 'Literal', value: '' }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for template literal receiver.codePointAt("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'TemplateLiteral', quasis: [{ type: 'TemplateElement', value: { cooked: 'test', raw: 'test' } }], expressions: [] },
        'codePointAt',
        [{ type: 'Literal', value: '' }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for empty string literal receiver.codePointAt("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: '' }, 'codePointAt', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr[0].codePointAt("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'MemberExpression', object: { type: 'Identifier', name: 'arr' }, property: { type: 'Literal', value: 0 }, computed: true },
        'codePointAt',
        [{ type: 'Literal', value: '' }],
      ))
      expect(reports.length).toBe(1)
    })

    test('report message mentions codePointAt', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'Literal', value: '' }]))
      expect(reports[0].message).toMatch(/codePointAt/)
    })

    test('report message mentions empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'Literal', value: '' }]))
      expect(reports[0].message).toMatch(/empty string/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'Literal', value: '' }]))
      expect(reports[0].message).toBe(
        "str.codePointAt('') with an empty string is unusual. codePointAt() expects a numeric index.",
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'Literal', value: '' }]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'Literal', value: '' }]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'Literal', value: '' }])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'Literal', value: '' }], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'codePointAt', [{ type: 'Literal', value: '' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'codePointAt', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'codePointAt', [{ type: 'Literal', value: '' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'codePointAt', [{ type: 'Literal', value: '' }]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'Literal', value: '' }]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for binary expression receiver.codePointAt("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } },
        'codePointAt',
        [{ type: 'Literal', value: '' }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for new String().codePointAt("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'NewExpression', callee: { type: 'Identifier', name: 'String' }, arguments: [] },
        'codePointAt',
        [{ type: 'Literal', value: '' }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for conditional expression receiver.codePointAt("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 'a' }, alternate: { type: 'Literal', value: 'b' } },
        'codePointAt',
        [{ type: 'Literal', value: '' }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for chained codePointAt.codePointAt("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'CallExpression', callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'str' }, property: { type: 'Identifier', name: 'codePointAt' }, computed: false }, arguments: [{ type: 'Literal', value: 0 }] },
        'codePointAt',
        [{ type: 'Literal', value: '' }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for parenthesized expression receiver.codePointAt("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 's' },
        'codePointAt',
        [{ type: 'Literal', value: '' }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for this.codePointAt("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'ThisExpression' },
        'codePointAt',
        [{ type: 'Literal', value: '' }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for tagged template receiver.codePointAt("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'TaggedTemplateExpression', tag: { type: 'Identifier', name: 'tag' }, quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] } },
        'codePointAt',
        [{ type: 'Literal', value: '' }],
      ))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for str.codePointAt(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.codePointAt(1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.codePointAt() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt'))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.codePointAt("a") — non-empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'Literal', value: 'a' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.codePointAt("hello") — non-empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'Literal', value: 'hello' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.codePointAt(index) — Identifier arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'Identifier', name: 'index' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.codePointAt("", 0) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'Literal', value: '' }, { type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.codePointAt("", extra) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'Literal', value: '' }, { type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.charAt(0) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.charCodeAt(0) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.indexOf("") — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'indexOf', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.includes("") — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.at("") — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'at', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.slice(0) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for computed property str["codePointAt"]("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'codePointAt' },
          computed: true,
        },
        arguments: [{ type: 'Literal', value: '' }],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [{ type: 'Literal', value: '' }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [{ type: 'Literal', value: '' }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'codePointAt' }, arguments: [{ type: 'Literal', value: '' }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'codePointAt' },
        },
        arguments: [{ type: 'Literal', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "CodePointAt" (different case)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'CodePointAt', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "codepointat" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codepointat', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
        },
        arguments: [{ type: 'Literal', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: null,
        },
        arguments: [{ type: 'Literal', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when arg type is Literal instead of StringLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arg value is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'Literal', value: null }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arg is missing (undefined in array)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [undefined]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array is empty', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt'))
      expect(reports.length).toBe(0)
    })

    test('does not report when arg is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [null]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringCodePointAtEmptyRule.create(ctx1)
      const visitor2 = noUnnecessaryStringCodePointAtEmptyRule.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'Literal', value: '' }]))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'Literal', value: 0 }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'Literal', value: '' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'Literal', value: 0 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'codePointAt' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: '' }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'codePointAt' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: '' }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'Literal', value: 0 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'Literal', value: '' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [{ type: 'Literal', value: 0 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'Literal', value: '' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'Literal', value: 'a' }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      const visitor2 = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringCodePointAtEmptyRule.meta
      const meta2 = noUnnecessaryStringCodePointAtEmptyRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'codePointAt' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: '' }],
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
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'codePointAt' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: '' }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'codePointAt' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: '' }],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'Literal', value: '' }])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringCodePointAtEmptyRule).toBeDefined()
      expect(typeof noUnnecessaryStringCodePointAtEmptyRule.create).toBe('function')
      expect(typeof noUnnecessaryStringCodePointAtEmptyRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'codePointAt' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'Literal', value: '' }], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'codePointAt', [{ type: 'Literal', value: '' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'codePointAt', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('does not report when callee computed is true with Identifier property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'codePointAt' },
          computed: true,
        },
        arguments: [{ type: 'Literal', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when three arguments provided', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'Literal', value: '' }, { type: 'Literal', value: 0 }, { type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'codePointAt' },
          computed: false,
        },
        arguments: null,
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arg has numeric Literal type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('handles arguments with empty array and non-matching arg type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodePointAtEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'ObjectExpression', properties: [] }]))
      expect(reports.length).toBe(0)
    })
  })
})
