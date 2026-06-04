import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringMatchAllEmptyRule } from '../../../../src/rules/patterns/no-unnecessary-string-match-all-empty.js'
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

function makeStringLiteral(value: string): unknown {
  return { type: 'StringLiteral', value }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-string-match-all-empty rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringMatchAllEmptyRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringMatchAllEmptyRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringMatchAllEmptyRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringMatchAllEmptyRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringMatchAllEmptyRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning matchAll', () => {
      const desc = noUnnecessaryStringMatchAllEmptyRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/matchall/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringMatchAllEmptyRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-match-all-empty.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringMatchAllEmptyRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringMatchAllEmptyRule).toBeDefined()
      expect(noUnnecessaryStringMatchAllEmptyRule.meta).toBeDefined()
      expect(noUnnecessaryStringMatchAllEmptyRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (31) =====

  describe('positive cases — reports matchAll with empty string', () => {
    test('reports for str.matchAll(\'\') with Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'matchAll', [makeStringLiteral('')]))
      expect(reports.length).toBe(1)
    })

    test('reports for literal string \'hello\'.matchAll(\'\')', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'StringLiteral', value: 'hello' }, 'matchAll', [makeStringLiteral('')]))
      expect(reports.length).toBe(1)
    })

    test('reports for member expression obj.prop.matchAll(\'\')', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }, 'matchAll', [makeStringLiteral('')]))
      expect(reports.length).toBe(1)
    })

    test('reports for call expression result getStr().matchAll(\'\')', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getStr' }, arguments: [] }, 'matchAll', [makeStringLiteral('')]))
      expect(reports.length).toBe(1)
    })

    test('reports for template literal `test`.matchAll(\'\')', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'TemplateLiteral', quasis: [], expressions: [] }, 'matchAll', [makeStringLiteral('')]))
      expect(reports.length).toBe(1)
    })

    test('reports for binary expression str1 + str2 result .matchAll(\'\')', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } }, 'matchAll', [makeStringLiteral('')]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions matchAll', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'matchAll', [makeStringLiteral('')]))
      expect(reports[0].message).toMatch(/matchAll/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'matchAll', [makeStringLiteral('')]))
      expect(reports[0].message).toBe(
        `str.matchAll('') matches every position. This is likely not the intended behavior.`,
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'matchAll', [makeStringLiteral('')]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'matchAll', [makeStringLiteral('')]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'matchAll', [makeStringLiteral('')])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'matchAll', [makeStringLiteral('')], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'matchAll', [makeStringLiteral('')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'matchAll', [makeStringLiteral('')]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'matchAll', [makeStringLiteral('')]))
      visitor.CallExpression(makeCallNode({ type: 'StringLiteral', value: 'hello' }, 'matchAll', [makeStringLiteral('')]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'matchAll', [makeStringLiteral('')]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for nested member expression a.b.c.matchAll(\'\')', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      const nestedMember = {
        type: 'MemberExpression',
        object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'a' }, property: { type: 'Identifier', name: 'b' } },
        property: { type: 'Identifier', name: 'c' },
      }
      visitor.CallExpression(makeCallNode(nestedMember, 'matchAll', [makeStringLiteral('')]))
      expect(reports.length).toBe(1)
    })

    test('reports for chained call getStr().trim().matchAll(\'\')', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      const chainedCall = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getStr' }, arguments: [] },
          property: { type: 'Identifier', name: 'trim' },
        },
        arguments: [],
      }
      visitor.CallExpression(makeCallNode(chainedCall, 'matchAll', [makeStringLiteral('')]))
      expect(reports.length).toBe(1)
    })

    test('reports when object is an ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: [] }, 'matchAll', [makeStringLiteral('')]))
      expect(reports.length).toBe(1)
    })

    test('reports when object is an ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ObjectExpression', properties: [] }, 'matchAll', [makeStringLiteral('')]))
      expect(reports.length).toBe(1)
    })

    test('reports for conditional expression result .matchAll(\'\')', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'StringLiteral', value: 'a' }, alternate: { type: 'StringLiteral', value: 'b' } }, 'matchAll', [makeStringLiteral('')]))
      expect(reports.length).toBe(1)
    })

    test('reports for assignment expression result .matchAll(\'\')', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'AssignmentExpression', operator: '=', left: { type: 'Identifier', name: 'x' }, right: { type: 'StringLiteral', value: 'test' } }, 'matchAll', [makeStringLiteral('')]))
      expect(reports.length).toBe(1)
    })

    test('reports for logical expression result .matchAll(\'\')', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'LogicalExpression', operator: '||', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } }, 'matchAll', [makeStringLiteral('')]))
      expect(reports.length).toBe(1)
    })

    test('reports for parenthesized expression (.matchAll(\'\'))', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ParenthesizedExpression', expression: { type: 'Identifier', name: 'str' } }, 'matchAll', [makeStringLiteral('')]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions every position', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'matchAll', [makeStringLiteral('')]))
      expect(reports[0].message).toMatch(/every position/)
    })

    test('report message mentions likely not intended', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'matchAll', [makeStringLiteral('')]))
      expect(reports[0].message).toMatch(/likely not the intended/)
    })

    test('reports for FunctionExpression object .matchAll(\'\')', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }, 'matchAll', [makeStringLiteral('')]))
      expect(reports.length).toBe(1)
    })

    test('reports for ArrowFunctionExpression object .matchAll(\'\')', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }, 'matchAll', [makeStringLiteral('')]))
      expect(reports.length).toBe(1)
    })

    test('reports for NewExpression object .matchAll(\'\')', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'NewExpression', callee: { type: 'Identifier', name: 'String' }, arguments: [] }, 'matchAll', [makeStringLiteral('')]))
      expect(reports.length).toBe(1)
    })

    test('reports for UpdateExpression object .matchAll(\'\')', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'UpdateExpression', operator: '++', prefix: false, argument: { type: 'Identifier', name: 'i' } }, 'matchAll', [makeStringLiteral('')]))
      expect(reports.length).toBe(1)
    })

    test('reports for UnaryExpression object .matchAll(\'\')', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } }, 'matchAll', [makeStringLiteral('')]))
      expect(reports.length).toBe(1)
    })

    test('reports for Ternary result obj.matchAll(\'\')', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      const ternaryObj = {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'flag' },
        consequent: { type: 'Identifier', name: 'a' },
        alternate: { type: 'Identifier', name: 'b' },
      }
      visitor.CallExpression(makeCallNode(ternaryObj, 'matchAll', [makeStringLiteral('')]))
      expect(reports.length).toBe(1)
    })

    test('reports for ThisExpression object .matchAll(\'\')', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ThisExpression' }, 'matchAll', [makeStringLiteral('')]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (42) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for str.matchAll(\'he\') — non-empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'matchAll', [makeStringLiteral('he')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.matchAll(/regex/g) — RegExp literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'matchAll', [{ type: 'RegExpLiteral', value: /test/g }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.matchAll(x) — variable argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'matchAll', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.matchAll() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'matchAll', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.match(\'\') — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'match', [makeStringLiteral('')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.includes(\'\') — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [makeStringLiteral('')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.indexOf(\'\') — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'indexOf', [makeStringLiteral('')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.search(\'\') — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'search', [makeStringLiteral('')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.replace(\'\', \'x\') — different method and two args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replace', [makeStringLiteral(''), makeStringLiteral('x')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.matchAll(\'\', \'flags\') — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'matchAll', [makeStringLiteral(''), makeStringLiteral('g')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.matchAll(templateLiteral)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'matchAll', [{ type: 'TemplateLiteral', quasis: [], expressions: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.matchAll(callExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'matchAll', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'getPattern' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.matchAll(memberExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'matchAll', [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'pattern' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.matchAll(numericLiteral)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'matchAll', [{ type: 'NumericLiteral', value: 42 }]))
      expect(reports.length).toBe(0)
    })

    test('reports for str.matchAll(Literal with empty string value)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'matchAll', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeStringLiteral('')], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeStringLiteral('')], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [makeStringLiteral('')], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'matchAll' },
        },
        arguments: [makeStringLiteral('')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
        },
        arguments: [makeStringLiteral('')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: null,
        },
        arguments: [makeStringLiteral('')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "matchall" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'matchall', [makeStringLiteral('')]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "MATCHALL" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'MATCHALL', [makeStringLiteral('')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression({ type: 'ExpressionStatement', expression: {} })
      expect(reports.length).toBe(0)
    })

    test('does not report when computed property is true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'matchAll' },
          computed: true,
        },
        arguments: [makeStringLiteral('')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.split(\'\') — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'split', [makeStringLiteral('')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.matchAll(42) — non-string argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'matchAll', [{ type: 'NumericLiteral', value: 42 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.matchAll(true) — boolean argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'matchAll', [{ type: 'BooleanLiteral', value: true }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.matchAll(null) — null argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'matchAll', [null]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.matchAll(\'a\') — single char non-empty', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'matchAll', [makeStringLiteral('a')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.matchAll(\' \') — space is not empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'matchAll', [makeStringLiteral(' ')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for three arguments to matchAll', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'matchAll', [makeStringLiteral(''), makeStringLiteral('g'), makeStringLiteral('i')]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'matchAll' },
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (8) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringMatchAllEmptyRule.create(ctx1)
      const visitor2 = noUnnecessaryStringMatchAllEmptyRule.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'matchAll', [makeStringLiteral('')]))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'matchAll', [makeStringLiteral('abc')]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'matchAll' },
        },
        arguments: [makeStringLiteral('')],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'matchAll' },
        },
        arguments: [makeStringLiteral('')],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringMatchAllEmptyRule.create(context)
      const visitor2 = noUnnecessaryStringMatchAllEmptyRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringMatchAllEmptyRule.meta
      const meta2 = noUnnecessaryStringMatchAllEmptyRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'matchAll' },
        },
        arguments: [makeStringLiteral('')],
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'matchAll', [makeStringLiteral('')], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllEmptyRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'matchAll', [makeStringLiteral('')])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })
  })
})
