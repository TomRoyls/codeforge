import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringLastIndexOfZeroRule } from '../../../../src/rules/patterns/no-unnecessary-string-last-index-of-zero.js'
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

describe('no-unnecessary-string-last-index-of-zero rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringLastIndexOfZeroRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringLastIndexOfZeroRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringLastIndexOfZeroRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringLastIndexOfZeroRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringLastIndexOfZeroRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning lastIndexOf', () => {
      const desc = noUnnecessaryStringLastIndexOfZeroRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/lastindexof/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringLastIndexOfZeroRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-last-index-of-zero.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringLastIndexOfZeroRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringLastIndexOfZeroRule).toBeDefined()
      expect(noUnnecessaryStringLastIndexOfZeroRule.meta).toBeDefined()
      expect(noUnnecessaryStringLastIndexOfZeroRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (28) =====

  describe('positive cases — reports unnecessary lastIndexOf("")', () => {
    test('reports for str.lastIndexOf("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for anotherVar.lastIndexOf("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'anotherVar' }, 'lastIndexOf', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for member expression obj.prop.lastIndexOf("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }, 'lastIndexOf', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for call result getStr().lastIndexOf("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getStr' }, arguments: [] }, 'lastIndexOf', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for array element access arr[0].lastIndexOf("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'arr' }, property: { type: 'Literal', value: 0 }, computed: true }, 'lastIndexOf', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions lastIndexOf', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [{ type: 'StringLiteral', value: '' }]))
      expect(reports[0].message).toMatch(/lastIndexOf/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [{ type: 'StringLiteral', value: '' }]))
      expect(reports[0].message).toBe(
        `str.lastIndexOf('') always returns str.length. This is likely not the intended behavior.`,
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [{ type: 'StringLiteral', value: '' }]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [{ type: 'StringLiteral', value: '' }]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [{ type: 'StringLiteral', value: '' }])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [{ type: 'StringLiteral', value: '' }], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [{ type: 'StringLiteral', value: '' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str2' }, 'lastIndexOf', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [{ type: 'StringLiteral', value: '' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str2' }, 'lastIndexOf', [{ type: 'StringLiteral', value: '' }]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for this.lastIndexOf("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ThisExpression' }, 'lastIndexOf', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for template literal result tag`str`.lastIndexOf("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'TaggedTemplateExpression', tag: { type: 'Identifier', name: 'tag' }, quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] } }, 'lastIndexOf', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for parenthesized expression (str).lastIndexOf("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for conditional result (cond ? a : b).lastIndexOf("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'cond' }, consequent: { type: 'Identifier', name: 'a' }, alternate: { type: 'Identifier', name: 'b' } }, 'lastIndexOf', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for binary result (a + b).lastIndexOf("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } }, 'lastIndexOf', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for logical result (a || b).lastIndexOf("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'LogicalExpression', operator: '||', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } }, 'lastIndexOf', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [{ type: 'StringLiteral', value: '' }]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for chained call arr.join().lastIndexOf("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'CallExpression', callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'arr' }, property: { type: 'Identifier', name: 'join' } }, arguments: [] },
        'lastIndexOf',
        [{ type: 'StringLiteral', value: '' }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for string literal object "hello".lastIndexOf("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'StringLiteral', value: 'hello' }, 'lastIndexOf', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new expression result new Str().lastIndexOf("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Str' }, arguments: [] }, 'lastIndexOf', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for assignment result x = str.lastIndexOf("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'lastIndexOf', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof result typeof x lastIndexOf("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'UnaryExpression', operator: 'typeof', prefix: true, argument: { type: 'Identifier', name: 'x' } }, 'lastIndexOf', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for seq expression (a, b).lastIndexOf("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'SequenceExpression', expressions: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }] }, 'lastIndexOf', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for await result (await str).lastIndexOf("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'AwaitExpression', argument: { type: 'Identifier', name: 'str' } }, 'lastIndexOf', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for yield result (yield str).lastIndexOf("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'YieldExpression', argument: { type: 'Identifier', name: 'str' } }, 'lastIndexOf', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for str.lastIndexOf("a") — non-empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [{ type: 'StringLiteral', value: 'a' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.lastIndexOf("hello") — non-empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [{ type: 'StringLiteral', value: 'hello' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.lastIndexOf(x) — variable argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.lastIndexOf() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf'))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.lastIndexOf("", 5) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [{ type: 'StringLiteral', value: '' }, { type: 'Literal', value: 5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.lastIndexOf("", pos) — two arguments with variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [{ type: 'StringLiteral', value: '' }, { type: 'Identifier', name: 'pos' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.indexOf("") — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'indexOf', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.includes("") — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.search("") — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'search', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.startsWith("") — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'startsWith', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.endsWith("") — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'endsWith', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.match("") — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'match', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.replace("", "x") — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replace', [{ type: 'StringLiteral', value: '' }, { type: 'StringLiteral', value: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.lastIndexOf("x", "y", "z") — three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [{ type: 'StringLiteral', value: '' }, { type: 'Literal', value: 0 }, { type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal instead of StringLiteral as argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [{ type: 'StringLiteral', value: '' }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [{ type: 'StringLiteral', value: '' }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [{ type: 'StringLiteral', value: '' }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'lastIndexOf' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "lastindexof" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastindexof', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: null,
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'lastIndexOf' },
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is empty array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'lastIndexOf' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg is NumericLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.lastIndexOf(" ") — space string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [{ type: 'StringLiteral', value: ' ' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.lastIndexOf("\\n") — newline string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [{ type: 'StringLiteral', value: '\n' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.lastIndexOf("\\t") — tab string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [{ type: 'StringLiteral', value: '\t' }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (17) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringLastIndexOfZeroRule.create(ctx1)
      const visitor2 = noUnnecessaryStringLastIndexOfZeroRule.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [{ type: 'StringLiteral', value: '' }]))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [{ type: 'StringLiteral', value: 'a' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [{ type: 'StringLiteral', value: '' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [{ type: 'StringLiteral', value: 'a' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'lastIndexOf' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'lastIndexOf' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [{ type: 'StringLiteral', value: 'a' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [{ type: 'StringLiteral', value: '' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'indexOf', [{ type: 'StringLiteral', value: '' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [{ type: 'StringLiteral', value: '' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [{ type: 'StringLiteral', value: '' }, { type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      const visitor2 = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringLastIndexOfZeroRule.meta
      const meta2 = noUnnecessaryStringLastIndexOfZeroRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'lastIndexOf' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
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
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'lastIndexOf' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'lastIndexOf' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [{ type: 'StringLiteral', value: '' }])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringLastIndexOfZeroRule).toBeDefined()
      expect(typeof noUnnecessaryStringLastIndexOfZeroRule.create).toBe('function')
      expect(typeof noUnnecessaryStringLastIndexOfZeroRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'lastIndexOf' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [{ type: 'StringLiteral', value: '' }], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles non-computed member expression property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'lastIndexOf' },
          computed: false,
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'lastIndexOf' },
          computed: true,
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [{ type: 'StringLiteral', value: '' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str2' }, 'lastIndexOf', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})
