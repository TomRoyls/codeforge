import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringReplaceAllEmptyRule } from '../../../../src/rules/patterns/index.js'
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
  computed = false,
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
      computed,
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function strLit(value: string): { type: string; value: string } {
  return { type: 'Literal', value }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-string-replace-all-empty rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringReplaceAllEmptyRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringReplaceAllEmptyRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringReplaceAllEmptyRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringReplaceAllEmptyRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringReplaceAllEmptyRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning replaceAll and empty string', () => {
      const desc = noUnnecessaryStringReplaceAllEmptyRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/replaceall/)
      expect(desc).toMatch(/empty/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringReplaceAllEmptyRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-replace-all-empty.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringReplaceAllEmptyRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringReplaceAllEmptyRule).toBeDefined()
      expect(noUnnecessaryStringReplaceAllEmptyRule.meta).toBeDefined()
      expect(noUnnecessaryStringReplaceAllEmptyRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (24) =====

  describe('positive cases — reports replaceAll with empty string', () => {
    test('reports for str.replaceAll("", "x")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [strLit(''), strLit('x')]))
      expect(reports.length).toBe(1)
    })

    test('reports for "hello".replaceAll("", "a")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(strLit('hello'), 'replaceAll', [strLit(''), strLit('a')]))
      expect(reports.length).toBe(1)
    })

    test('reports for variable.replaceAll("", replacement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'text' }, 'replaceAll', [strLit(''), { type: 'Identifier', name: 'replacement' }]))
      expect(reports.length).toBe(1)
    })

    test('reports when second argument is numeric literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'replaceAll', [strLit(''), { type: 'Literal', value: 42 }]))
      expect(reports.length).toBe(1)
    })

    test('reports when second argument is a call expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'replaceAll', [strLit(''), { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports when second argument is a member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'replaceAll', [strLit(''), { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'val' } }]))
      expect(reports.length).toBe(1)
    })

    test('reports when second argument is an empty string too', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'replaceAll', [strLit(''), strLit('')]))
      expect(reports.length).toBe(1)
    })

    test('reports when object is a member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'str' } }, 'replaceAll', [strLit(''), strLit('x')]))
      expect(reports.length).toBe(1)
    })

    test('reports when object is a call expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getString' }, arguments: [] }, 'replaceAll', [strLit(''), strLit('x')]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions replaceAll and empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [strLit(''), strLit('x')]))
      expect(reports[0].message).toMatch(/replaceAll/)
      expect(reports[0].message).toMatch(/empty string/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [strLit(''), strLit('x')]))
      expect(reports[0].message).toBe(
        `str.replaceAll('', ...) with empty string search pattern is unusual and may not do what you expect.`,
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [strLit(''), strLit('x')]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [strLit(''), strLit('x')]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [strLit(''), strLit('x')])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [strLit(''), strLit('x')], false, 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'replaceAll', [strLit(''), strLit('x')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'replaceAll', [strLit(''), strLit('y')]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'replaceAll', [strLit(''), strLit('x')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'replaceAll', [strLit(''), strLit('y')]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [strLit(''), strLit('x')]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports when second argument is a template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'replaceAll', [strLit(''), { type: 'TemplateLiteral', quasis: [], expressions: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports when second argument is a conditional expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'replaceAll', [strLit(''), { type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: strLit('a'), alternate: strLit('b') }]))
      expect(reports.length).toBe(1)
    })

    test('reports when second argument is an arrow function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'replaceAll', [strLit(''), { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }]))
      expect(reports.length).toBe(1)
    })

    test('reports when second argument is null literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'replaceAll', [strLit(''), { type: 'NullLiteral' }]))
      expect(reports.length).toBe(1)
    })

    test('reports when second argument is a binary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'replaceAll', [strLit(''), { type: 'BinaryExpression', operator: '+', left: strLit('a'), right: strLit('b') }]))
      expect(reports.length).toBe(1)
    })

    test('reports when second argument is a spread element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'replaceAll', [strLit(''), { type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }]))
      expect(reports.length).toBe(1)
    })

    test('reports with correct end location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [strLit(''), strLit('x')], false, 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (45) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for replaceAll with non-empty string first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [strLit('a'), strLit('b')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for replaceAll with single space first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [strLit(' '), strLit('x')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for replaceAll with only one argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [strLit('')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for replaceAll with zero arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll'))
      expect(reports.length).toBe(0)
    })

    test('does not report for replaceAll with three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [strLit(''), strLit('x'), strLit('extra')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for replace method instead of replaceAll', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replace', [strLit(''), strLit('x')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for indexOf method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'indexOf', [strLit(''), strLit('x')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for match method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'match', [strLit(''), strLit('x')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for search method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'search', [strLit(''), strLit('x')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for split method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'split', [strLit(''), strLit('x')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for trim method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'trim', [strLit(''), strLit('x')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for concat method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'concat', [strLit(''), strLit('x')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for "replaceall" lowercase method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceall', [strLit(''), strLit('x')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for "REPLACEALL" uppercase method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'REPLACEALL', [strLit(''), strLit('x')]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is computed property access', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [strLit(''), strLit('x')], true))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee computed with string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'replaceAll' },
          computed: true,
        },
        arguments: [strLit(''), strLit('x')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg is NumericLiteral instead of StringLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [{ type: 'Literal', value: 0 }, strLit('x')]))
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg is Identifier instead of StringLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [{ type: 'Identifier', name: 'empty' }, strLit('x')]))
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg is a Literal with empty string value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [{ type: 'Literal', value: '' }, strLit('x')]))
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg is a RegExp literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [{ type: 'RegExpLiteral', pattern: '', flags: '' }, strLit('x')]))
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [null, strLit('x')]))
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [undefined, strLit('x')]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'replaceAll' },
          computed: false,
        },
        arguments: [strLit(''), strLit('x')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [strLit(''), strLit('x')], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [strLit(''), strLit('x')], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [strLit(''), strLit('x')], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
        },
        arguments: [strLit(''), strLit('x')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: null,
        },
        arguments: [strLit(''), strLit('x')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'replaceAll' },
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'replaceAll' },
        },
        arguments: null,
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for StringLiteral with non-empty value "abc"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [strLit('abc'), strLit('x')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for StringLiteral with newline value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [strLit('\n'), strLit('x')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for StringLiteral with tab value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [strLit('\t'), strLit('x')]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringReplaceAllEmptyRule.create(ctx1)
      const visitor2 = noUnnecessaryStringReplaceAllEmptyRule.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'replaceAll', [strLit(''), strLit('x')]))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'replace', [strLit(''), strLit('x')]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'replaceAll', [strLit(''), strLit('x')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'replace', [strLit(''), strLit('x')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'replaceAll', [strLit('a'), strLit('b')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'replaceAll', [strLit(''), strLit('y')]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'replaceAll' },
        },
        arguments: [strLit(''), strLit('x')],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'replaceAll' },
        },
        arguments: [strLit(''), strLit('x')],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'replaceAll', [strLit('a'), strLit('b')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'replaceAll', [strLit(''), strLit('x')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'replace', [strLit(''), strLit('x')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'replaceAll', [strLit(''), strLit('y')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'replaceAll', [strLit('abc'), strLit('d')]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      const visitor2 = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringReplaceAllEmptyRule.meta
      const meta2 = noUnnecessaryStringReplaceAllEmptyRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'replaceAll' },
        },
        arguments: [strLit(''), strLit('x')],
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
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'replaceAll' },
        },
        arguments: [strLit(''), strLit('x')],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'replaceAll' },
        },
        arguments: [strLit(''), strLit('x')],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [strLit(''), strLit('x')])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringReplaceAllEmptyRule).toBeDefined()
      expect(typeof noUnnecessaryStringReplaceAllEmptyRule.create).toBe('function')
      expect(typeof noUnnecessaryStringReplaceAllEmptyRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'replaceAll' },
        },
        arguments: [strLit(''), strLit('x')],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles member expression with computed: false explicitly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'replaceAll' },
          computed: false,
        },
        arguments: [strLit(''), strLit('x')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'replaceAll', [strLit(''), strLit('x')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'replaceAll', [strLit(''), strLit('y')]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})
