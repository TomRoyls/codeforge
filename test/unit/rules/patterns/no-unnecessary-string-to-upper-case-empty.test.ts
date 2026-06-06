import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringToUpperCaseEmptyRule } from '../../../../src/rules/patterns/index.js'
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
    getSource: () => '',
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
      computed: false,
      object,
      property: { type: 'Identifier', name: methodName },
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-string-to-upper-case-empty rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringToUpperCaseEmptyRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringToUpperCaseEmptyRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringToUpperCaseEmptyRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringToUpperCaseEmptyRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringToUpperCaseEmptyRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning toUpperCase', () => {
      const desc = noUnnecessaryStringToUpperCaseEmptyRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/touppercase/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringToUpperCaseEmptyRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-to-upper-case-empty.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringToUpperCaseEmptyRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringToUpperCaseEmptyRule).toBeDefined()
      expect(noUnnecessaryStringToUpperCaseEmptyRule.meta).toBeDefined()
      expect(noUnnecessaryStringToUpperCaseEmptyRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (28) =====

  describe('positive cases — reports str.toUpperCase(\'\')', () => {
    test('reports for str.toUpperCase(\'\') with Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toUpperCase', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for foo.toUpperCase(\'\') with different Identifier name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'foo' }, 'toUpperCase', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for this.toUpperCase(\'\') with ThisExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ThisExpression' }, 'toUpperCase', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.prop.toUpperCase(\'\') with MemberExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } },
        'toUpperCase',
        [{ type: 'Literal', value: '' }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for getStr().toUpperCase(\'\') with CallExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'CallExpression', callee: { type: 'Identifier', name: 'getStr' }, arguments: [] },
        'toUpperCase',
        [{ type: 'Literal', value: '' }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for arr[0].toUpperCase(\'\') with computed MemberExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'MemberExpression', computed: true, object: { type: 'Identifier', name: 'arr' }, property: { type: 'Literal', value: 0 } },
        'toUpperCase',
        [{ type: 'Literal', value: '' }],
      ))
      expect(reports.length).toBe(1)
    })

    test('report message mentions toUpperCase', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toUpperCase', [{ type: 'Literal', value: '' }]))
      expect(reports[0].message).toMatch(/toUpperCase/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toUpperCase', [{ type: 'Literal', value: '' }]))
      expect(reports[0].message).toBe(
        `str.toUpperCase('') passes an unnecessary empty string. toUpperCase() takes no arguments.`,
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toUpperCase', [{ type: 'Literal', value: '' }]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toUpperCase', [{ type: 'Literal', value: '' }]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'toUpperCase', [{ type: 'Literal', value: '' }])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toUpperCase', [{ type: 'Literal', value: '' }], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toUpperCase', [{ type: 'Literal', value: '' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'foo' }, 'toUpperCase', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toUpperCase', [{ type: 'Literal', value: '' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'foo' }, 'toUpperCase', [{ type: 'Literal', value: '' }]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toUpperCase', [{ type: 'Literal', value: '' }]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for template literal result.toUpperCase(\'\')', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'TemplateLiteral', quasis: [], expressions: [] },
        'toUpperCase',
        [{ type: 'Literal', value: '' }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for binary expression result.toUpperCase(\'\')', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } },
        'toUpperCase',
        [{ type: 'Literal', value: '' }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for string literal.toUpperCase(\'\') with Literal object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Literal', value: 'hello' },
        'toUpperCase',
        [{ type: 'Literal', value: '' }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for conditional expression result.toUpperCase(\'\')', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 'a' }, alternate: { type: 'Literal', value: 'b' } },
        'toUpperCase',
        [{ type: 'Literal', value: '' }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports with exact location when node has specific loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toUpperCase', [{ type: 'Literal', value: '' }], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports for chained call result.toUpperCase(\'\')', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'CallExpression', callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'str' }, property: { type: 'Identifier', name: 'trim' } }, arguments: [] },
        'toUpperCase',
        [{ type: 'Literal', value: '' }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for nested member access a.b.c.toUpperCase(\'\')', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'MemberExpression', object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'a' }, property: { type: 'Identifier', name: 'b' } }, property: { type: 'Identifier', name: 'c' } },
        'toUpperCase',
        [{ type: 'Literal', value: '' }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for function call result.toUpperCase(\'\')', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'CallExpression', callee: { type: 'Identifier', name: 'getName' }, arguments: [] },
        'toUpperCase',
        [{ type: 'Literal', value: '' }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for assignment expression result.toUpperCase(\'\')', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'AssignmentExpression', operator: '=', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: 'test' } },
        'toUpperCase',
        [{ type: 'Literal', value: '' }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for array access result.toUpperCase(\'\')', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'MemberExpression', computed: true, object: { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 'hello' }] }, property: { type: 'Literal', value: 0 } },
        'toUpperCase',
        [{ type: 'Literal', value: '' }],
      ))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for str.toUpperCase() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toUpperCase'))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.toLowerCase(\'\') — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toLowerCase', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.trim(\'\') — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'trim', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.charAt(\'\') — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.toString(\'\') — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toString', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.toUpperCase(\'hello\') — non-empty string argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toUpperCase', [{ type: 'Literal', value: 'hello' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.toUpperCase(\'a\') — single char non-empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toUpperCase', [{ type: 'Literal', value: 'a' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.toUpperCase(\' \') — whitespace string argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toUpperCase', [{ type: 'Literal', value: ' ' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.toUpperCase(0) — number argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toUpperCase', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.toUpperCase(x) — Identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toUpperCase', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.toUpperCase(null) — null argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toUpperCase', [{ type: 'Literal', value: null }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.toUpperCase(\'\', \'extra\') — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toUpperCase', [{ type: 'Literal', value: '' }, { type: 'Literal', value: 'extra' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.toUpperCase(\'\', \'extra\', \'more\') — three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toUpperCase', [{ type: 'Literal', value: '' }, { type: 'Literal', value: 'extra' }, { type: 'Literal', value: 'more' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for computed property str[\'toUpperCase\'](\'\')', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'toUpperCase' },
        },
        arguments: [{ type: 'Literal', value: '' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [{ type: 'Literal', value: '' }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [{ type: 'Literal', value: '' }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [{ type: 'Literal', value: '' }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'toUpperCase' },
        },
        arguments: [{ type: 'Literal', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
        },
        arguments: [{ type: 'Literal', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: null,
        },
        arguments: [{ type: 'Literal', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'toUpperCase' },
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for property name "touppercase" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'touppercase', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for property name "TOUPPERCASE" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'TOUPPERCASE', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(0)
    })

    test('reports when argument is a Literal empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toUpperCase', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('does not report when first argument is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toUpperCase', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'getStr' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when first argument is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toUpperCase', [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'key' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when first argument is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'toUpperCase' },
        },
        arguments: [undefined],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array is empty', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toUpperCase', []))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument has null value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toUpperCase', [{ type: 'Literal', value: null }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is a FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } },
        arguments: [{ type: 'Literal', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument has undefined value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toUpperCase', [{ type: 'Literal', value: undefined }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (17) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringToUpperCaseEmptyRule.create(ctx1)
      const visitor2 = noUnnecessaryStringToUpperCaseEmptyRule.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toUpperCase', [{ type: 'Literal', value: '' }]))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toUpperCase'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly with mixed calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toUpperCase', [{ type: 'Literal', value: '' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toUpperCase'))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toLowerCase', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'toUpperCase' },
        },
        arguments: [{ type: 'Literal', value: '' }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'toUpperCase' },
        },
        arguments: [{ type: 'Literal', value: '' }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toUpperCase', [{ type: 'Literal', value: '' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toUpperCase'))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toLowerCase', [{ type: 'Literal', value: '' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'foo' }, 'toUpperCase', [{ type: 'Literal', value: '' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toUpperCase', [{ type: 'Literal', value: 'hello' }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      const visitor2 = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringToUpperCaseEmptyRule.meta
      const meta2 = noUnnecessaryStringToUpperCaseEmptyRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'toUpperCase' },
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
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'toUpperCase' },
        },
        arguments: [{ type: 'Literal', value: '' }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'toUpperCase' },
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
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'toUpperCase', [{ type: 'Literal', value: '' }])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringToUpperCaseEmptyRule).toBeDefined()
      expect(typeof noUnnecessaryStringToUpperCaseEmptyRule.create).toBe('function')
      expect(typeof noUnnecessaryStringToUpperCaseEmptyRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'toUpperCase' },
        },
        arguments: [{ type: 'Literal', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toUpperCase', [{ type: 'Literal', value: '' }], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles computed member expression property when computed is false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'toUpperCase' },
        },
        arguments: [{ type: 'Literal', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee computed is true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'toUpperCase' },
        },
        arguments: [{ type: 'Literal', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toUpperCase', [{ type: 'Literal', value: '' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'foo' }, 'toUpperCase', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})
