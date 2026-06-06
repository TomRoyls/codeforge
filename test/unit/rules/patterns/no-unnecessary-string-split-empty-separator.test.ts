import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringSplitEmptySeparatorRule } from '../../../../src/rules/patterns/no-unnecessary-string-split-empty-separator.js'
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
  return { type: 'Literal', value: '' }
}

function strArg(value: string): unknown {
  return { type: 'Literal', value }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-string-split-empty-separator rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringSplitEmptySeparatorRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringSplitEmptySeparatorRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringSplitEmptySeparatorRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringSplitEmptySeparatorRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringSplitEmptySeparatorRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning split', () => {
      const desc = noUnnecessaryStringSplitEmptySeparatorRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/split/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringSplitEmptySeparatorRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-string-split-empty-separator.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringSplitEmptySeparatorRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringSplitEmptySeparatorRule).toBeDefined()
      expect(noUnnecessaryStringSplitEmptySeparatorRule.meta).toBeDefined()
      expect(noUnnecessaryStringSplitEmptySeparatorRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (35) =====

  describe('positive cases — reports unnecessary .split("")', () => {
    test('reports for str.split("") with Identifier receiver', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'split', [emptyStrArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for "hello".split("") with StringLiteral receiver', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'split', [emptyStrArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for "".split("") with empty string literal receiver', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: '' }, 'split', [emptyStrArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for [].split("") with ArrayExpression receiver', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: [] }, 'split', [emptyStrArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.prop.split("") with MemberExpression receiver', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }, 'split', [emptyStrArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for fn().split("") with CallExpression receiver', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }, 'split', [emptyStrArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for str.split("", 2) with numeric limit', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'split', [emptyStrArg(), { type: 'Literal', value: 2 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for str.split("", 0) with zero limit', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'split', [emptyStrArg(), { type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for str.split("", n) with Identifier limit', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'split', [emptyStrArg(), { type: 'Identifier', name: 'n' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for str.split("", obj.lim) with MemberExpression limit', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'split', [emptyStrArg(), { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'lim' } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for str.split("", 2, "extra") with three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'split', [emptyStrArg(), { type: 'Literal', value: 2 }, strArg('extra')]))
      expect(reports.length).toBe(1)
    })

    test('reports for (a + b).split("") with BinaryExpression receiver', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } }, 'split', [emptyStrArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for (a || b).split("") with LogicalExpression receiver', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'LogicalExpression', operator: '||', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } }, 'split', [emptyStrArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for (cond ? a : b).split("") with ConditionalExpression receiver', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'cond' }, consequent: { type: 'Identifier', name: 'a' }, alternate: { type: 'Identifier', name: 'b' } }, 'split', [emptyStrArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.map(fn).split("") with chained CallExpression receiver', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'arr' }, property: { type: 'Identifier', name: 'map' } }, arguments: [{ type: 'Identifier', name: 'fn' }] }, 'split', [emptyStrArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for new Fn().split("") with NewExpression receiver', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Fn' }, arguments: [] }, 'split', [emptyStrArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.a.b.split("") with nested MemberExpression receiver', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'a' } }, property: { type: 'Identifier', name: 'b' } }, 'split', [emptyStrArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for (await x).split("") with AwaitExpression receiver', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'AwaitExpression', argument: { type: 'Identifier', name: 'x' } }, 'split', [emptyStrArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for {}.split("") with ObjectExpression receiver', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ObjectExpression', properties: [] }, 'split', [emptyStrArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for (function(){}).split("") with FunctionExpression receiver', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }, 'split', [emptyStrArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for (x => x).split("") with ArrowFunctionExpression receiver', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrowFunctionExpression', params: [{ type: 'Identifier', name: 'x' }], body: { type: 'Identifier', name: 'x' } }, 'split', [emptyStrArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for str.split("", undefined) with undefined second arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'split', [emptyStrArg(), { type: 'Identifier', name: 'undefined' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for str.split("", null) with null second arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'split', [emptyStrArg(), { type: 'NullLiteral' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr[index].split("") with computed member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'arr' }, property: { type: 'Identifier', name: 'index' }, computed: true }, 'split', [emptyStrArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for `template`.split("") with TemplateLiteral receiver', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'TemplateLiteral', quasis: [{ type: 'TemplateElement', value: { raw: 'hello', cooked: 'hello' } }], expressions: [] }, 'split', [emptyStrArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for (void x).split("") with UnaryExpression receiver', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'UnaryExpression', operator: 'void', prefix: true, argument: { type: 'Identifier', name: 'x' } }, 'split', [emptyStrArg()]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions split', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'split', [emptyStrArg()]))
      expect(reports[0].message).toMatch(/split/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'split', [emptyStrArg()]))
      expect(reports[0].message).toBe(
        'Unnecessary .split("") to split by character. This is valid but consider if [...str] is more readable.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'split', [emptyStrArg()]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'split', [emptyStrArg()]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'split', [emptyStrArg()])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'split', [emptyStrArg()], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'split', [emptyStrArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'split', [emptyStrArg()]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'split', [emptyStrArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'split', [emptyStrArg()]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'split', [emptyStrArg()]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (35) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for str.split(",") — non-empty separator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'split', [strArg(',')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.split(" ") — space separator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'split', [strArg(' ')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.split("a") — single char separator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'split', [strArg('a')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.split() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'split'))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.includes("") — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [emptyStrArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.slice("") — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [emptyStrArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.join("") — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'join', [emptyStrArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.replace("", x) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replace', [emptyStrArg(), { type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.match("") — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'match', [emptyStrArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.search("") — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'search', [emptyStrArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.indexOf("") — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'indexOf', [emptyStrArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [emptyStrArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [emptyStrArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [emptyStrArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'split' },
        },
        arguments: [emptyStrArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Split" (uppercase S)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'Split', [emptyStrArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "SPLIT" (all caps)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'SPLIT', [emptyStrArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is empty array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'split' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg is an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'split', [{ type: 'Identifier', name: 'sep' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg is a number Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'split', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg is a RegExp Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'split', [{ type: 'RegExpLiteral', value: /\\s*/, regex: { pattern: '\\s*', flags: '' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
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

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
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
  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringSplitEmptySeparatorRule.create(ctx1)
      const visitor2 = noUnnecessaryStringSplitEmptySeparatorRule.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'split', [emptyStrArg()]))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'split', [strArg(',')]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'split', [emptyStrArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'split', [strArg(',')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'split', [emptyStrArg()]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'split' },
        },
        arguments: [emptyStrArg()],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'split' },
        },
        arguments: [emptyStrArg()],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'split', [strArg(',')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'split', [emptyStrArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [emptyStrArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'split', [emptyStrArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'split', [strArg(' ')]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      const visitor2 = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringSplitEmptySeparatorRule.meta
      const meta2 = noUnnecessaryStringSplitEmptySeparatorRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'split' },
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
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'split' },
        },
        arguments: [emptyStrArg()],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'split' },
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
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'split', [emptyStrArg()])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringSplitEmptySeparatorRule).toBeDefined()
      expect(typeof noUnnecessaryStringSplitEmptySeparatorRule.create).toBe('function')
      expect(typeof noUnnecessaryStringSplitEmptySeparatorRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'split' },
        },
        arguments: [emptyStrArg()],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'split', [emptyStrArg()], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitEmptySeparatorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'split', [emptyStrArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'split', [emptyStrArg()]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})
