import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringMatchEmptyRule } from '../../../../src/rules/patterns/no-unnecessary-string-match-empty.js'
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

function makeEmptyStringArg(): unknown {
  return { type: 'Literal', value: '' }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-string-match-empty rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringMatchEmptyRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringMatchEmptyRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringMatchEmptyRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringMatchEmptyRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringMatchEmptyRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning match', () => {
      const desc = noUnnecessaryStringMatchEmptyRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/match/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringMatchEmptyRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-match-empty.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringMatchEmptyRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringMatchEmptyRule).toBeDefined()
      expect(noUnnecessaryStringMatchEmptyRule.meta).toBeDefined()
      expect(noUnnecessaryStringMatchEmptyRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (27) =====

  describe('positive cases — reports str.match(\'\')', () => {
    test('reports for str.match(\'\') with Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'match', [makeEmptyStringArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for foo.match(\'\') with different identifier name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'foo' }, 'match', [makeEmptyStringArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.prop.match(\'\') with MemberExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }, 'match', [makeEmptyStringArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for getStr().match(\'\') with CallExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getStr' }, arguments: [] }, 'match', [makeEmptyStringArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr[0].match(\'\') with computed MemberExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'arr' }, property: { type: 'Literal', value: 0 }, computed: true }, 'match', [makeEmptyStringArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for literal.match(\'\') with StringLiteral object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'match', [makeEmptyStringArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for template.match(\'\') with TemplateLiteral object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'TemplateLiteral', quasis: [], expressions: [] }, 'match', [makeEmptyStringArg()]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions str.match(\'\')', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'match', [makeEmptyStringArg()]))
      expect(reports[0].message).toMatch(/match/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'match', [makeEmptyStringArg()]))
      expect(reports[0].message).toBe(
        `str.match('') matches empty string at every position. This is likely unintended.`,
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'match', [makeEmptyStringArg()]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'match', [makeEmptyStringArg()]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'match', [makeEmptyStringArg()])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'match', [makeEmptyStringArg()], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'match', [makeEmptyStringArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'match', [makeEmptyStringArg()]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'match', [makeEmptyStringArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'match', [makeEmptyStringArg()]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'match', [makeEmptyStringArg()]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for obj.nested.deep.match(\'\') with deeply nested MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      const inner = { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'nested' } }
      const outer = { type: 'MemberExpression', object: inner, property: { type: 'Identifier', name: 'deep' } }
      visitor.CallExpression(makeCallNode(outer, 'match', [makeEmptyStringArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for this.value.match(\'\')', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ThisExpression' }, 'match', [makeEmptyStringArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for (a + b).match(\'\') with BinaryExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } }, 'match', [makeEmptyStringArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for window.match(\'\')', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'window' }, 'match', [makeEmptyStringArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for input.match(\'\')', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'input' }, 'match', [makeEmptyStringArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for path.match(\'\')', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'path' }, 'match', [makeEmptyStringArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for text.match(\'\')', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'text' }, 'match', [makeEmptyStringArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for value.match(\'\')', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'value' }, 'match', [makeEmptyStringArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for str.match("") with double-quoted empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'match', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for chained call result.match(\'\')', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      const chainObj = { type: 'CallExpression', callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'x' }, property: { type: 'Identifier', name: 'trim' } }, arguments: [] }
      visitor.CallExpression(makeCallNode(chainObj, 'match', [makeEmptyStringArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for conditional result.match(\'\')', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 'a' }, alternate: { type: 'Literal', value: 'b' } }, 'match', [makeEmptyStringArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for tag`template`.match(\'\')', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'TaggedTemplateExpression', tag: { type: 'Identifier', name: 'tag' }, quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] } }, 'match', [makeEmptyStringArg()]))
      expect(reports.length).toBe(1)
    })


  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for str.match(\'hello\') — non-empty pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'match', [{ type: 'Literal', value: 'hello' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.match(/regex/) — regex pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'match', [{ type: 'RegExpLiteral', value: /regex/ }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.match(/regex/gi) — regex with flags', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'match', [{ type: 'Literal', value: /regex/gi }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.match(variable) — Identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'match', [{ type: 'Identifier', name: 'pattern' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.match() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'match', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.match(\'\', \'flags\') — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'match', [makeEmptyStringArg(), { type: 'Literal', value: 'g' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.search(\'\') — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'search', [makeEmptyStringArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.replace(\'\', \'x\') — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replace', [makeEmptyStringArg(), { type: 'Literal', value: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.includes(\'\') — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [makeEmptyStringArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.indexOf(\'\') — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'indexOf', [makeEmptyStringArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.startsWith(\'\') — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'startsWith', [makeEmptyStringArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.endsWith(\'\') — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'endsWith', [makeEmptyStringArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.split(\'\') — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'split', [makeEmptyStringArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.trim(\'\') — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'trim', [makeEmptyStringArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.test(\'\') — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'test', [makeEmptyStringArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeEmptyStringArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeEmptyStringArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [makeEmptyStringArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'match' },
          computed: true,
        },
        arguments: [makeEmptyStringArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Match" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'Match', [makeEmptyStringArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "matchAll"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'matchAll', [makeEmptyStringArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
        },
        arguments: [makeEmptyStringArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: null,
        },
        arguments: [makeEmptyStringArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is Literal instead of StringLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'match', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a single space string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'match', [{ type: 'Literal', value: ' ' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument value is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'match', [{ type: 'Literal', value: null }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is missing type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'match', [{ value: '' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is computed member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'match' },
          computed: true,
        },
        arguments: [makeEmptyStringArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (17) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringMatchEmptyRule.create(ctx1)
      const visitor2 = noUnnecessaryStringMatchEmptyRule.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'match', [makeEmptyStringArg()]))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'match', [{ type: 'Literal', value: 'hello' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly with mixed calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'match', [makeEmptyStringArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'match', [{ type: 'Literal', value: 'hello' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'match', [makeEmptyStringArg()]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [makeEmptyStringArg()],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [makeEmptyStringArg()],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'match', [{ type: 'Literal', value: 'abc' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'match', [makeEmptyStringArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'search', [makeEmptyStringArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'match', [makeEmptyStringArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'match', [{ type: 'Literal', value: /regex/ }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringMatchEmptyRule.create(context)
      const visitor2 = noUnnecessaryStringMatchEmptyRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringMatchEmptyRule.meta
      const meta2 = noUnnecessaryStringMatchEmptyRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [makeEmptyStringArg()],
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
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [makeEmptyStringArg()],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [makeEmptyStringArg()],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'match', [makeEmptyStringArg()])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringMatchEmptyRule).toBeDefined()
      expect(typeof noUnnecessaryStringMatchEmptyRule.create).toBe('function')
      expect(typeof noUnnecessaryStringMatchEmptyRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [makeEmptyStringArg()],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'match', [makeEmptyStringArg()], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles computed member expression property false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [makeEmptyStringArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'match' },
          computed: true,
        },
        arguments: [makeEmptyStringArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'match', [makeEmptyStringArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'match', [makeEmptyStringArg()]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})
